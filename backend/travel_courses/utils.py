import json
from pathlib import Path

def load_mock_routes():
    # EatGo 루트 기준으로 mock-data 경로 설정
    base_dir = Path(__file__).resolve().parent.parent.parent
    routes_path = base_dir / "mock-data" / "routes.json"
    with open(routes_path, encoding="utf-8") as f:
        return json.load(f) 