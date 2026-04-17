from openai import AsyncOpenAI
import os

GROK_API_KEY = os.getenv("GROK_API_KEY", "")

client = AsyncOpenAI(
    api_key=GROK_API_KEY,
    base_url="https://api.x.ai/v1",
)

FALLBACK_PLAYBOOKS = {
    "BRUTE_FORCE": [
        "🔒 Immediately block source IP {src_ip} at the perimeter firewall",
        "🔍 Review all authentication logs for {dst_ip} in the last 60 minutes",
        "🔐 Force password reset for all accounts targeted from {src_ip}",
        "📋 Enable multi-factor authentication on port {port} services",
        "🚨 Escalate to Tier 2 SOC if >50 failed attempts detected"
    ],
    "C2_BEACON": [
        "🔌 Immediately isolate host {src_ip} from the network",
        "🔍 Kill process '{process}' on {src_ip} and collect memory dump",
        "🌐 Block outbound traffic to {dst_ip} at all egress points",
        "🔎 Scan all endpoints for similar process signatures",
        "📊 Review DNS logs for domain generation algorithm patterns"
    ],
    "LATERAL_MOVEMENT": [
        "🔒 Isolate source host {src_ip} immediately",
        "🔍 Audit all accounts used by '{user}' in last 2 hours",
        "🛡️ Enable enhanced logging on RDP/SMB/SSH services",
        "🔎 Check for new scheduled tasks or services on targeted hosts",
        "📋 Review Active Directory for privilege escalation indicators"
    ],
    "DATA_EXFILTRATION": [
        "🔌 Block all outbound traffic from {src_ip} immediately",
        "🔍 Identify all files accessed by '{user}' in last 4 hours",
        "📊 Calculate total data transferred to {dst_ip}",
        "🔎 Check DLP logs for policy violations",
        "🚨 Notify Data Protection Officer — potential breach notification required"
    ]
}


def generate_playbook_fallback(alert: dict) -> list:
    rule = alert.get("rule", "BRUTE_FORCE")
    steps = FALLBACK_PLAYBOOKS.get(rule, FALLBACK_PLAYBOOKS["BRUTE_FORCE"])
    filled = []
    for step in steps:
        filled.append(step.format(
            src_ip=alert.get("src_ip", "unknown"),
            dst_ip=alert.get("dst_ip", "unknown"),
            port=alert.get("port", 0),
            user=alert.get("user", "unknown"),
            process=alert.get("process", "unknown"),
            confidence=int(alert.get("confidence", 0) * 100)
        ))
    return filled


async def generate_playbook(alert: dict) -> list:
    if not GROK_API_KEY:
        return generate_playbook_fallback(alert)
    try:
        prompt = f"""You are a senior SOC analyst. Generate exactly 5 concise incident response steps for this security incident.
Each step should start with an emoji and be one clear sentence.

Incident Details:
- Threat Type: {alert.get('rule')}
- Source IP: {alert.get('src_ip')}
- Destination IP: {alert.get('dst_ip')}
- Port: {alert.get('port')}
- User: {alert.get('user')}
- Process: {alert.get('process')}
- Confidence: {int(alert.get('confidence', 0) * 100)}%
- Severity: {alert.get('severity')}
- Explanation: {alert.get('explanation', '')}

Return only 5 numbered steps, nothing else."""

        response = await client.chat.completions.create(
            model="grok-3-fast-beta",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior SOC analyst specializing in incident response. Be concise and actionable."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=400,
            temperature=0.3,
        )

        text = response.choices[0].message.content.strip()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        steps = [l for l in lines if l][:5]
        return steps if steps else generate_playbook_fallback(alert)

    except Exception as e:
        print(f"⚠️ Grok API error: {e}")
        return generate_playbook_fallback(alert)