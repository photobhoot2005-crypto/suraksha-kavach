from dotenv import load_dotenv
load_dotenv()

import asyncio
import json
import uuid
from datetime import datetime
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from simulator import generate_scenario
from normalizer import normalize_batch
from rule_engine import run_rules, reset_trackers
from ml_scorer import score_event, train_model
from correlator import correlate
from scorer import compute_severity, compute_final_confidence
from mitre import get_mitre
from explainer import explain
from playbook import generate_playbook

app = FastAPI(title="Threat Detection Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory store ────────────────────────────────────────────────────────
incidents = []
connected_clients: List[WebSocket] = []

# ── Active simulation tasks (scenario_id -> asyncio.Task) ─────────────────
active_simulations: dict = {}

# ── Train ML model at startup ──────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    train_model()
    print("✅ Isolation Forest model trained and ready")

# ── WebSocket ──────────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        for inc in incidents[-50:]:
            await websocket.send_text(json.dumps(inc))
        while True:
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)

async def broadcast(incident: dict):
    dead = []
    for client in connected_clients:
        try:
            await client.send_text(json.dumps(incident))
        except Exception:
            dead.append(client)

    for d in dead:
        if d in connected_clients:
            connected_clients.remove(d)

# ── Core processing pipeline ───────────────────────────────────────────────
async def process_single_event(event: dict):
    """Process one event and broadcast if it's an incident."""
    ml_score = score_event(event)
    rule_results = run_rules(event)

    if not rule_results and ml_score < 0.6:
        return None

    new_incidents = []

    detected_rules = rule_results if rule_results else [
        {"rule": "ML_ANOMALY", "confidence": ml_score}
    ]

    for rule_result in detected_rules:
        alert = {**event, **rule_result}
        correlation = correlate(alert)

        final_conf = compute_final_confidence(
            rule_result.get("confidence", ml_score),
            ml_score,
            correlation["confidence_boost"]
        )

        severity = compute_severity(
            final_conf,
            correlation["correlated"],
            correlation["multi_threat"]
        )

        mitre_info = get_mitre(rule_result.get("rule", "UNKNOWN"), event)
        explanation = explain({
            **alert,
            "confidence": final_conf,
            "correlated": correlation["correlated"],
            "is_false_positive": rule_result.get("is_false_positive", False)
        })

        incident = {
            "id": str(uuid.uuid4()),
            "timestamp": event.get("timestamp"),
            "rule": rule_result.get("rule", "ML_ANOMALY"),
            "severity": severity,
            "confidence": final_conf,
            "src_ip": event.get("src_ip"),
            "dst_ip": event.get("dst_ip"),
            "port": event.get("port"),
            "layer": event.get("layer"),
            "user": event.get("user"),
            "process": event.get("process"),
            "bytes": event.get("bytes"),
            "correlated": correlation.get("correlated", False),
            "layers_involved": correlation.get("layers_involved", []),
            "mitre_id": mitre_info.get("technique"),
            "mitre_technique": mitre_info.get("technique"),
            "mitre_tactic": mitre_info.get("tactic"),
            "mitre_name": mitre_info.get("technique_name"),
            "mitre_url": mitre_info.get("url"),
            "explanation": explanation,
            "is_false_positive": rule_result.get("is_false_positive", False),
            "playbook": []
        }

        incidents.append(incident)
        new_incidents.append(incident)
        await broadcast(incident)

    return new_incidents

async def run_simulation_stream(scenario_id: str, events: list):
    """Stream events one by one with delay — can be cancelled."""
    try:
        reset_trackers()
        normalized_events = normalize_batch(events)

        for event in normalized_events:
            if asyncio.current_task().cancelled():
                break
            await process_single_event(event)
            await asyncio.sleep(0.4)

    except asyncio.CancelledError:
        print(f"⛔ Simulation '{scenario_id}' was stopped by user")

    finally:
        active_simulations.pop(scenario_id, None)
        await broadcast({
            "type": "simulation_stopped",
            "scenario": scenario_id,
            "timestamp": datetime.utcnow().isoformat()
        })

# ── REST Endpoints ─────────────────────────────────────────────────────────
class SimulateRequest(BaseModel):
    scenario: str = "full_attack"

@app.post("/simulate")
async def simulate(req: SimulateRequest):
    scenario_id = req.scenario

    if scenario_id in active_simulations:
        return {
            "message": "Simulation already running",
            "scenario": scenario_id,
            "running": True
        }

    events = generate_scenario(scenario_id)

    task = asyncio.create_task(run_simulation_stream(scenario_id, events))
    active_simulations[scenario_id] = task

    return {
        "message": f"Started streaming {len(events)} events",
        "incidents_detected": 0,
        "scenario": scenario_id,
        "running": True
    }

@app.post("/simulate/stop")
async def stop_simulation(req: SimulateRequest):
    scenario_id = req.scenario

    if scenario_id not in active_simulations:
        return {
            "message": "No active simulation found",
            "scenario": scenario_id,
            "stopped": False
        }

    task = active_simulations[scenario_id]
    task.cancel()

    return {
        "message": f"Simulation '{scenario_id}' stopped. All detected incidents remain in SOC dashboard.",
        "scenario": scenario_id,
        "stopped": True
    }

@app.get("/simulate/status")
async def simulation_status():
    return {
        "active": list(active_simulations.keys())
    }

@app.get("/incidents")
async def get_incidents():
    return {"incidents": incidents[-100:], "total": len(incidents)}

@app.get("/incidents/{incident_id}/playbook")
async def get_playbook(incident_id: str):
    incident = next((i for i in incidents if i["id"] == incident_id), None)
    if not incident:
        return {"error": "Incident not found"}

    if incident.get("playbook"):
        return {"playbook": incident["playbook"]}

    steps = await generate_playbook(incident)
    incident["playbook"] = steps
    await broadcast({
        "type": "playbook_update",
        "id": incident_id,
        "playbook": steps
    })
    return {"playbook": steps}

@app.get("/stats")
async def get_stats():
    total = len(incidents)
    by_severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    by_rule = {}
    fp_count = 0
    correlated_count = 0

    for inc in incidents:
        sev = inc.get("severity", "LOW")
        if sev in by_severity:
            by_severity[sev] += 1

        rule = inc.get("rule", "UNKNOWN")
        by_rule[rule] = by_rule.get(rule, 0) + 1

        if inc.get("is_false_positive"):
            fp_count += 1

        if inc.get("correlated"):
            correlated_count += 1

    return {
        "total_incidents": total,
        "by_severity": by_severity,
        "by_rule": by_rule,
        "false_positives": fp_count,
        "correlated_incidents": correlated_count
    }

@app.delete("/incidents/clear")
async def clear_incidents():
    incidents.clear()
    reset_trackers()
    return {"message": "All incidents cleared"}

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}