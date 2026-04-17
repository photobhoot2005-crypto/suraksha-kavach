import numpy as np
from sklearn.ensemble import IsolationForest

model = None

def train_model():
    global model
    np.random.seed(42)
    normal_data = np.random.normal(loc=[1000, 1.0, 80], scale=[500, 0.5, 20], size=(500, 3))
    model = IsolationForest(contamination=0.1, random_state=42, n_estimators=100)
    model.fit(normal_data)

def score_event(event) -> float:
    global model
    if model is None:
        train_model()
    features = np.array([[
        event.get("bytes", 0),
        event.get("duration", 1.0),
        event.get("port", 80)
    ]])
    raw_score = model.decision_function(features)[0]
    normalized = 1 / (1 + np.exp(raw_score * 3))
    return round(float(normalized), 3)
