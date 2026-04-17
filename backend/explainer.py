def explain(alert: dict) -> str:
    rule = alert.get("rule", "UNKNOWN")
    src = alert.get("src_ip", "unknown")
    dst = alert.get("dst_ip", "unknown")
    conf = int(alert.get("confidence", 0) * 100)
    user = alert.get("user", "unknown")
    process = alert.get("process", "unknown")
    port = alert.get("port", 0)
    layer = alert.get("layer", "unknown")
    correlated = alert.get("correlated", False)
    is_fp = alert.get("is_false_positive", False)

    if is_fp:
        return (
            f"⚠️ LIKELY FALSE POSITIVE: Host {src} performed a large file transfer "
            f"({alert.get('bytes', 0) // 1_000_000} MB) to {dst} via port {port}. "
            f"User '{user}' and process '{process}' match known backup admin profile. "
            f"Confidence reduced to {conf}% — manual verification recommended."
        )

    explanations = {
        "BRUTE_FORCE": (
            f"🔴 Brute force detected from {src} targeting {dst} on port {port}. "
            f"Repeated failed authentication attempts detected. "
            f"Confidence: {conf}%. "
            + ("⚡ Correlated with endpoint activity — elevated threat." if correlated else "")
        ),
        "C2_BEACON": (
            f"🔴 C2 Beaconing detected: {src} is making periodic low-volume connections "
            f"to external IP {dst} at regular intervals via port {port}. "
            f"Process '{process}' involved. Confidence: {conf}%. "
            + ("⚡ Cross-layer evidence found — critical incident." if correlated else "")
        ),
        "LATERAL_MOVEMENT": (
            f"🟠 Lateral movement detected from {src}. "
            f"Unusual internal traffic to multiple endpoints on privileged ports (445, 3389, 22). "
            f"User: '{user}', Process: '{process}'. Confidence: {conf}%. "
            + ("⚡ Endpoint layer confirms suspicious process activity." if correlated else "")
        ),
        "DATA_EXFILTRATION": (
            f"🔴 Data exfiltration suspected: {src} transferred "
            f"{alert.get('bytes', 0) // 1_000_000} MB to external IP {dst}. "
            f"Volume is abnormally high. User: '{user}'. Confidence: {conf}%. "
            + ("⚡ Cross-layer correlation confirms high-confidence incident." if correlated else "")
        )
    }
    return explanations.get(rule, f"Anomalous activity detected from {src}. Confidence: {conf}%.")
