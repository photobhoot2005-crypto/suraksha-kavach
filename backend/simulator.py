import random
import time
from datetime import datetime

INTERNAL_IPS = [f"10.0.0.{i}" for i in range(1, 20)]
EXTERNAL_IPS = [f"185.220.{random.randint(1,255)}.{random.randint(1,255)}" for _ in range(10)]
PROCESSES = ["svchost.exe", "chrome.exe", "python.exe", "cmd.exe", "powershell.exe", "explorer.exe"]
MALICIOUS_PROCESSES = ["mimikatz.exe", "nc.exe", "revshell.exe", "payload.exe"]
USERS = ["alice", "bob", "charlie", "admin", "svc_backup"]
PORTS = [22, 80, 443, 3389, 445, 8080, 53, 21]

def base_event(layer):
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event_id": f"EVT-{random.randint(100000,999999)}",
        "layer": layer,
        "src_ip": random.choice(INTERNAL_IPS),
        "dst_ip": random.choice(INTERNAL_IPS),
        "port": random.choice(PORTS),
        "protocol": random.choice(["TCP", "UDP"]),
        "bytes": random.randint(100, 5000),
        "duration": round(random.uniform(0.1, 2.0), 2),
        "flags": random.choice(["SYN", "ACK", "FIN", "RST"]),
        "user": random.choice(USERS),
        "process": random.choice(PROCESSES),
        "parent_pid": random.randint(100, 9999),
        "status": "success",
        "attack_type": None,
        "is_malicious": False
    }

def benign_event():
    e = base_event(random.choice(["network", "endpoint"]))
    return e

def brute_force_events(count=15):
    events = []
    src = random.choice(EXTERNAL_IPS)
    target = random.choice(INTERNAL_IPS)
    for _ in range(count):
        e = base_event("network")
        e.update({
            "src_ip": src,
            "dst_ip": target,
            "port": 22,
            "protocol": "TCP",
            "bytes": random.randint(40, 120),
            "flags": "SYN",
            "status": "failed",
            "attack_type": "brute_force",
            "is_malicious": True
        })
        events.append(e)
    return events

def c2_beacon_events(count=10):
    events = []
    src = random.choice(INTERNAL_IPS)
    dst = random.choice(EXTERNAL_IPS)
    for i in range(count):
        net_event = base_event("network")
        net_event.update({
            "src_ip": src,
            "dst_ip": dst,
            "port": 443,
            "bytes": random.randint(64, 256),
            "duration": round(60 + random.uniform(-5, 5), 2),
            "attack_type": "c2_beacon",
            "is_malicious": True
        })
        events.append(net_event)
        ep_event = base_event("endpoint")
        ep_event.update({
            "src_ip": src,
            "dst_ip": dst,
            "process": random.choice(MALICIOUS_PROCESSES),
            "user": "SYSTEM",
            "attack_type": "c2_beacon",
            "is_malicious": True
        })
        events.append(ep_event)
    return events

def lateral_movement_events(count=8):
    events = []
    src = random.choice(INTERNAL_IPS)
    for _ in range(count):
        e = base_event("network")
        e.update({
            "src_ip": src,
            "dst_ip": random.choice(INTERNAL_IPS),
            "port": random.choice([445, 3389, 22, 135]),
            "protocol": "TCP",
            "bytes": random.randint(200, 800),
            "attack_type": "lateral_movement",
            "is_malicious": True
        })
        events.append(e)
        ep = base_event("endpoint")
        ep.update({
            "src_ip": src,
            "process": "cmd.exe",
            "user": "admin",
            "attack_type": "lateral_movement",
            "is_malicious": True
        })
        events.append(ep)
    return events

def data_exfil_events(count=5):
    events = []
    src = random.choice(INTERNAL_IPS)
    dst = random.choice(EXTERNAL_IPS)
    for _ in range(count):
        e = base_event("network")
        e.update({
            "src_ip": src,
            "dst_ip": dst,
            "port": 443,
            "bytes": random.randint(50_000_000, 200_000_000),
            "protocol": "TCP",
            "attack_type": "data_exfiltration",
            "is_malicious": True
        })
        events.append(e)
    return events

def false_positive_events(count=3):
    events = []
    for _ in range(count):
        e = base_event("network")
        e.update({
            "src_ip": "10.0.0.5",
            "dst_ip": "10.0.0.100",
            "bytes": random.randint(40_000_000, 90_000_000),
            "user": "svc_backup",
            "process": "robocopy.exe",
            "port": 445,
            "attack_type": "false_positive",
            "is_malicious": False
        })
        events.append(e)
    return events

def generate_scenario(scenario: str):
    events = []
    if scenario == "brute_force":
        events += brute_force_events(15) + [benign_event() for _ in range(10)]
    elif scenario == "c2":
        events += c2_beacon_events(10) + [benign_event() for _ in range(10)]
    elif scenario == "lateral":
        events += lateral_movement_events(8) + [benign_event() for _ in range(10)]
    elif scenario == "exfil":
        events += data_exfil_events(5) + [benign_event() for _ in range(10)]
    elif scenario == "false_positive":
        events += false_positive_events(3) + [benign_event() for _ in range(10)]
    elif scenario == "full_attack":
        events += brute_force_events(15)
        events += c2_beacon_events(10)
        events += lateral_movement_events(8)
        events += data_exfil_events(5)
        events += false_positive_events(3)
        events += [benign_event() for _ in range(20)]
    else:
        events = [benign_event() for _ in range(20)]
    random.shuffle(events)
    return events
