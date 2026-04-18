MITRE_MAP = {
    "BRUTE_FORCE": {
        "technique": "T1110",
        "tactic": "Credential Access",
        "technique_name": "Brute Force",
        "url": "https://attack.mitre.org/techniques/T1110/"
    },
    "C2_BEACONING": {
        "technique": "T1071",
        "tactic": "Command and Control",
        "technique_name": "Application Layer Protocol",
        "url": "https://attack.mitre.org/techniques/T1071/"
    },
    "DATA_EXFILTRATION": {
        "technique": "T1041",
        "tactic": "Exfiltration",
        "technique_name": "Exfiltration Over C2 Channel",
        "url": "https://attack.mitre.org/techniques/T1041/"
    },
    "LATERAL_MOVEMENT": {
        "technique": "T1021",
        "tactic": "Lateral Movement",
        "technique_name": "Remote Services",
        "url": "https://attack.mitre.org/techniques/T1021/"
    },
    "UNKNOWN": {
        "technique": "T0000",
        "tactic": "Unknown",
        "technique_name": "Unknown",
        "url": ""
    }
}

def infer_attack_type_from_event(event: dict):
    process_name = str(event.get("process", "")).lower()
    bytes_sent = event.get("bytes", 0) or 0
    port = event.get("port", 0) or 0
    failed_logins = event.get("failed_logins", 0) or 0
    event_type = str(event.get("event_type", "")).lower()
    layer = str(event.get("layer", "")).lower()

    if failed_logins >= 10 or "failed_auth" in event_type or "login_fail" in event_type:
        return "BRUTE_FORCE"

    if "powershell" in process_name or "cmd" in process_name or "psexec" in process_name:
        return "LATERAL_MOVEMENT"

    if bytes_sent > 500_000_000:
        return "DATA_EXFILTRATION"

    if port in [80, 443, 8080] and layer == "network":
        return "C2_BEACONING"

    return "UNKNOWN"

def get_mitre(rule: str, event: dict = None):
    rule = (rule or "UNKNOWN").upper()

    if rule in MITRE_MAP and rule != "ML_ANOMALY":
        return MITRE_MAP[rule]

    if rule == "ML_ANOMALY" and event is not None:
        inferred = infer_attack_type_from_event(event)
        return MITRE_MAP.get(inferred, MITRE_MAP["UNKNOWN"])

    return MITRE_MAP["UNKNOWN"]