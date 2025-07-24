import json
import os

def load_mock_routes():
    # EatGo 루트 기준으로 mock-data 경로 설정
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    routes_path = os.path.join(base_dir, "mock-data", "routes.json")
    with open(routes_path, encoding="utf-8") as f:
        return json.load(f) 