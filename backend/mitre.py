MITRE_MAP = {
    "BRUTE_FORCE": {
        "tactic": "Credential Access",
        "technique": "T1110",
        "technique_name": "Brute Force",
        "url": "https://attack.mitre.org/techniques/T1110/"
    },
    "C2_BEACON": {
        "tactic": "Command and Control",
        "technique": "T1071",
        "technique_name": "Application Layer Protocol",
        "url": "https://attack.mitre.org/techniques/T1071/"
    },
    "LATERAL_MOVEMENT": {
        "tactic": "Lateral Movement",
        "technique": "T1021",
        "technique_name": "Remote Services",
        "url": "https://attack.mitre.org/techniques/T1021/"
    },
    "DATA_EXFILTRATION": {
        "tactic": "Exfiltration",
        "technique": "T1041",
        "technique_name": "Exfiltration Over C2 Channel",
        "url": "https://attack.mitre.org/techniques/T1041/"
    }
}

def get_mitre(rule: str) -> dict:
    return MITRE_MAP.get(rule, {
        "tactic": "Unknown",
        "technique": "T0000",
        "technique_name": "Unknown Technique",
        "url": "https://attack.mitre.org/"
    })
