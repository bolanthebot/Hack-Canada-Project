from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os
from train import train_all_models

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

if not os.path.exists(os.path.join(MODEL_DIR, 'parking_model.pkl')):
    print("Training models for the first time...")
    train_all_models()

parking_model = joblib.load(os.path.join(MODEL_DIR, 'parking_model.pkl'))
gas_model = joblib.load(os.path.join(MODEL_DIR, 'gas_model.pkl'))


@app.route('/ml/parking/predict', methods=['POST'])
def predict_parking():
    data = request.json
    hour = data.get('hour', 12)
    day_of_week = data.get('day_of_week', 0)
    lat = data.get('lat', 43.65)
    lng = data.get('lng', -79.38)

    features = np.array([[hour, day_of_week, lat, lng]])
    probability = float(parking_model.predict_proba(features)[0][1])

    return jsonify({
        'probability': round(probability, 3),
        'prediction': 'available' if probability > 0.5 else 'taken',
        'hour': hour,
        'day_of_week': day_of_week,
    })


@app.route('/ml/gas-price/predict', methods=['POST'])
def predict_gas_price():
    data = request.json
    fuel_type = data.get('fuel_type', 'regular')

    base_prices = {'regular': 1.55, 'premium': 1.85, 'diesel': 1.70}
    base = base_prices.get(fuel_type, 1.55)

    from datetime import datetime
    day_of_year = datetime.now().timetuple().tm_yday
    features = np.array([[day_of_year, list(base_prices.keys()).index(fuel_type)]])
    predicted = float(gas_model.predict(features)[0])

    predicted = max(base * 0.85, min(base * 1.25, predicted))

    return jsonify({
        'predicted_price': round(predicted, 2),
        'fuel_type': fuel_type,
        'confidence': 0.82,
    })


@app.route('/ml/intersection/cluster', methods=['POST'])
def cluster_intersections():
    data = request.json
    points = data.get('points', [])

    if len(points) < 3:
        return jsonify({'clusters': [], 'message': 'Need at least 3 points'})

    from sklearn.cluster import DBSCAN
    coords = np.array([[p['lat'], p['lng']] for p in points])

    db = DBSCAN(eps=0.005, min_samples=2).fit(coords)
    labels = db.labels_
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)

    clusters = []
    for i in range(n_clusters):
        mask = labels == i
        cluster_points = coords[mask]
        clusters.append({
            'id': i,
            'center': {
                'lat': float(cluster_points[:, 0].mean()),
                'lng': float(cluster_points[:, 1].mean()),
            },
            'size': int(mask.sum()),
            'risk_level': 'high' if mask.sum() >= 5 else 'medium',
        })

    return jsonify({
        'clusters': clusters,
        'total_clusters': n_clusters,
        'noise_points': int((labels == -1).sum()),
    })


@app.route('/ml/bike/score', methods=['POST'])
def score_bike_segment():
    data = request.json
    has_lane = data.get('has_lane', False)
    traffic_speed = data.get('traffic_speed', 50)
    accident_count = data.get('accident_count', 0)
    lighting = data.get('lighting', 'moderate')
    road_width = data.get('road_width', 3)

    lane_score = 100 if has_lane else 20
    speed_score = max(0, 100 - traffic_speed)
    accident_score = max(0, 100 - accident_count * 15)
    lighting_scores = {'good': 100, 'moderate': 60, 'poor': 20}
    light_score = lighting_scores.get(lighting, 60)
    width_score = min(100, road_width * 25)

    safety_score = (
        0.30 * lane_score
        + 0.30 * speed_score
        + 0.20 * accident_score
        + 0.15 * light_score
        + 0.05 * width_score
    )

    return jsonify({
        'safety_score': round(safety_score, 1),
        'breakdown': {
            'bike_lane': round(lane_score, 1),
            'traffic_speed': round(speed_score, 1),
            'accident_history': round(accident_score, 1),
            'lighting': round(light_score, 1),
            'road_width': round(width_score, 1),
        },
        'rating': 'safe' if safety_score >= 70 else 'moderate' if safety_score >= 40 else 'dangerous',
    })


@app.route('/ml/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'models_loaded': True})


if __name__ == '__main__':
    app.run(port=5001, debug=True)
