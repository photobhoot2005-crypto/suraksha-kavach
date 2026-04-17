from collections import defaultdict
import time

_host_alerts = defaultdict(list)
CORR_WINDOW = 120

def correlate(incident: dict, all_incidents: list = None) -> dict:
    if all_incidents is None:
        all_incidents = []

    host = incident.get('src_ip') or incident.get('host', '')
    rule = incident.get('rule', '')
    layer = incident.get('layer', '')
    now = time.time()

    _host_alerts[host] = [
        a for a in _host_alerts[host]
        if now - a['ts'] < CORR_WINDOW
    ]
    _host_alerts[host].append({
        'ts': now,
        'rule': rule,
        'layer': layer,
    })

    host_events = _host_alerts[host]
    unique_rules = list(set(e['rule'] for e in host_events))
    unique_layers = list(set(e['layer'] for e in host_events))

    is_correlated = len(unique_layers) >= 2
    multi_threat = len(unique_rules) >= 2

    if is_correlated and multi_threat:
        confidence_boost = round(min(0.15 + len(unique_rules) * 0.05, 0.25), 2)
    elif is_correlated:
        confidence_boost = 0.10
    else:
        confidence_boost = 0.0

    return {
        'correlated': is_correlated,
        'multi_threat': multi_threat,
        'confidence_boost': confidence_boost,
        'layers_involved': unique_layers,
        'correlated_rules': unique_rules,
    }

def reset_correlator():
    _host_alerts.clear()