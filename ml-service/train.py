import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')


def generate_parking_data(n=2000):
    np.random.seed(42)
    hours = np.random.randint(0, 24, n)
    days = np.random.randint(0, 7, n)
    lats = 43.63 + np.random.rand(n) * 0.06
    lngs = -79.42 + np.random.rand(n) * 0.08

    availability = np.zeros(n)
    for i in range(n):
        prob = 0.5
        if hours[i] < 7 or hours[i] > 21:
            prob += 0.3
        if 9 <= hours[i] <= 17:
            prob -= 0.25
        if days[i] >= 5:
            prob += 0.15
        if lats[i] > 43.655:
            prob -= 0.1
        availability[i] = 1 if np.random.rand() < prob else 0

    return pd.DataFrame({
        'hour': hours,
        'day_of_week': days,
        'lat': lats,
        'lng': lngs,
        'available': availability,
    })


def generate_gas_price_data(n=365):
    np.random.seed(42)
    days = np.arange(1, n + 1)
    fuel_types = np.random.randint(0, 3, n)
    base = np.array([1.55, 1.85, 1.70])

    prices = []
    for i in range(n):
        b = base[fuel_types[i]]
        seasonal = 0.08 * np.sin(2 * np.pi * days[i] / 365)
        noise = np.random.normal(0, 0.03)
        prices.append(b + seasonal + noise)

    return pd.DataFrame({
        'day_of_year': days,
        'fuel_type': fuel_types,
        'price': prices,
    })


def train_parking_model():
    df = generate_parking_data()
    X = df[['hour', 'day_of_week', 'lat', 'lng']]
    y = df['available']

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    path = os.path.join(MODEL_DIR, 'parking_model.pkl')
    joblib.dump(model, path)
    print(f"Parking model saved to {path}")
    return model


def train_gas_model():
    df = generate_gas_price_data()
    X = df[['day_of_year', 'fuel_type']]
    y = df['price']

    model = LinearRegression()
    model.fit(X, y)

    path = os.path.join(MODEL_DIR, 'gas_model.pkl')
    joblib.dump(model, path)
    print(f"Gas price model saved to {path}")
    return model


def train_all_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    train_parking_model()
    train_gas_model()
    print("All models trained successfully!")


if __name__ == '__main__':
    train_all_models()
