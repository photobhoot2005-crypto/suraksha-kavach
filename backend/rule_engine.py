import time
from collections import defaultdict

_windows = defaultdict(list)
WINDOW_SECONDS = 60

def reset_trackers():
    _windows.clear()

def _clean_window(key):
    now = time.time()
    _windows[key] = [e for e in _windows[key] if now - e['ts'] < WINDOW_SECONDS]

def analyze_event(event: dict):
    src = event.get('src_ip', '')
    dst = event.get('dst_ip', '')
    user = event.get('user', '')
    layer = event.get('layer', '')
    action = event.get('action', '')
    status = event.get('status', '')
    bytes_sent = event.get('bytes', 0)
    ts = time.time()

    # 1. BRUTE FORCE
    if status == 'FAILED' and action in ('login', 'auth', 'ssh', 'rdp'):
        key = f'bf:{src}'
        _clean_window(key)
        _windows[key].append({'ts': ts})
        count = len(_windows[key])
        if count >= 5:
            confidence = round(min(0.60 + (count - 5) * 0.04, 0.97), 2)
            return [{
                'rule': 'BRUTE_FORCE',
                'severity': 'CRITICAL' if count >= 15 else 'HIGH' if count >= 10 else 'MEDIUM',
                'confidence': confidence,
                'explanation': (
                    f"Detected {count} failed {action} attempts from {src} within 60s. "
                    f"Pattern consistent with credential stuffing or brute-force attack."
                ),
                'mitre_technique': 'T1110',
                'mitre_tactic': 'Credential Access',
                'is_false_positive': False,
            }]

    # 2. C2 BEACONING
    if action == 'connect' and layer == 'network':
        key = f'c2:{src}:{dst}'
        _clean_window(key)
        _windows[key].append({'ts': ts})
        entries = _windows[key]
        if len(entries) >= 4:
            intervals = [entries[i+1]['ts'] - entries[i]['ts'] for i in range(len(entries)-1)]
            avg_interval = sum(intervals) / len(intervals)
            variance = sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)
            regularity = max(0, 1 - (variance / (avg_interval ** 2 + 1e-6)))
            if regularity > 0.65 and bytes_sent < 2000:
                confidence = round(min(0.55 + regularity * 0.35, 0.95), 2)
                return [{
                    'rule': 'C2_BEACON',
                    'severity': 'HIGH' if confidence > 0.80 else 'MEDIUM',
                    'confidence': confidence,
                    'explanation': (
                        f"Host {src} made {len(entries)} periodic low-volume connections to {dst}. "
                        f"Regularity score {regularity:.2f} with avg interval {avg_interval:.1f}s "
                        f"suggests automated C2 beaconing behavior."
                    ),
                    'mitre_technique': 'T1071',
                    'mitre_tactic': 'Command & Control',
                    'is_false_positive': False,
                }]

    # 3. DATA EXFILTRATION
    if action in ('upload', 'transfer', 'send') and bytes_sent > 0:
        key = f'exfil:{src}'
        _clean_window(key)
        _windows[key].append({'ts': ts, 'bytes': bytes_sent})
        total = sum(e['bytes'] for e in _windows[key])
        is_internal = dst.startswith('192.168') or dst.startswith('10.')
        if total > 50_000_000 and not is_internal:
            fp_risk = user in ('backup_admin', 'svc_backup', 'admin')
            confidence = round(min(0.55 + (total / 500_000_000), 0.95), 2)
            if fp_risk:
                confidence = round(confidence * 0.65, 2)
            mb = total / 1_048_576
            return [{
                'rule': 'DATA_EXFILTRATION',
                'severity': 'CRITICAL' if (total > 200_000_000 and not fp_risk) else 'HIGH' if not fp_risk else 'MEDIUM',
                'confidence': confidence,
                'explanation': (
                    f"Host {src} transferred {mb:.1f} MB to external {dst} within 60s. "
                    f"{'Possible false positive — backup/admin user context detected. ' if fp_risk else ''}"
                    f"Exceeds normal outbound baseline."
                ),
                'mitre_technique': 'T1041',
                'mitre_tactic': 'Exfiltration',
                'is_false_positive': fp_risk,
            }]

    # 4. LATERAL MOVEMENT
    if action in ('smb_connect', 'rdp_connect', 'wmi_exec', 'psexec') and layer == 'endpoint':
        key = f'lateral:{src}'
        _clean_window(key)
        _windows[key].append({'ts': ts, 'dst': dst})
        unique_targets = len(set(e['dst'] for e in _windows[key]))
        if unique_targets >= 3:
            confidence = round(min(0.60 + unique_targets * 0.05, 0.95), 2)
            return [{
                'rule': 'LATERAL_MOVEMENT',
                'severity': 'CRITICAL' if unique_targets >= 6 else 'HIGH',
                'confidence': confidence,
                'explanation': (
                    f"Host {src} accessed {unique_targets} unique internal hosts via {action} within 60s. "
                    f"Fan-out pattern strongly indicates lateral movement post-compromise."
                ),
                'mitre_technique': 'T1021',
                'mitre_tactic': 'Lateral Movement',
                'is_false_positive': False,
            }]

    return None

def run_rules(event: dict):
    return analyze_event(event)