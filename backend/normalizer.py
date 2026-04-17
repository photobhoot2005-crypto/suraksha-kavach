from datetime import datetime

def normalize(event: dict) -> dict:
    return {
        "timestamp": event.get("timestamp", datetime.utcnow().isoformat()),
        "event_id": event.get("event_id", "UNKNOWN"),
        "layer": event.get("layer", "network"),
        "src_ip": event.get("src_ip", "0.0.0.0"),
        "dst_ip": event.get("dst_ip", "0.0.0.0"),
        "port": event.get("port", 0),
        "protocol": event.get("protocol", "TCP"),
        "bytes": event.get("bytes", 0),
        "duration": event.get("duration", 0.0),
        "flags": event.get("flags", ""),
        "user": event.get("user", "unknown"),
        "process": event.get("process", "unknown"),
        "parent_pid": event.get("parent_pid", 0),
        "status": event.get("status", "success"),
        "attack_type": event.get("attack_type", None),
        "is_malicious": event.get("is_malicious", False)
    }

def normalize_batch(events: list) -> list:
    return [normalize(e) for e in events]
