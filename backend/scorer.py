def compute_final_confidence(
    rule_confidence: float,
    ml_score: float = 0.5,
    confidence_boost: float = 0.0
) -> float:
    # Weighted blend of rule-based and ML confidence
    blended = (rule_confidence * 0.7) + (ml_score * 0.3)
    final = min(blended + confidence_boost, 0.99)
    return round(final, 2)


def compute_severity(
    confidence: float,
    correlated: bool = False,
    multi_threat: bool = False
) -> str:
    score = confidence * 100

    if correlated:
        score *= 1.2
    if multi_threat:
        score *= 1.15

    if score >= 85:
        return 'CRITICAL'
    elif score >= 65:
        return 'HIGH'
    elif score >= 40:
        return 'MEDIUM'
    else:
        return 'LOW'


def score_incident(incident: dict) -> dict:
    conf = incident.get('confidence', 0.5)
    correlated = incident.get('correlated', False)
    multi_threat = len(incident.get('correlated_rules', [])) >= 2

    severity = compute_severity(conf, correlated, multi_threat)

    score = conf * 100
    if correlated:
        score *= 1.2
    if multi_threat:
        score *= 1.15
    risk_score = round(min(score, 100), 1)

    if risk_score >= 85:
        priority = 'P1'
    elif risk_score >= 65:
        priority = 'P2'
    elif risk_score >= 40:
        priority = 'P3'
    else:
        priority = 'P4'

    incident['severity'] = severity
    incident['risk_score'] = risk_score
    incident['priority'] = priority
    return incident