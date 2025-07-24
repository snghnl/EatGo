import json
import os
import uuid
from datetime import datetime

INPUT_PATH = os.path.join(os.path.dirname(__file__), "routes.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "routes_fixture.json")

now = datetime.now().isoformat()

with open(INPUT_PATH, encoding="utf-8") as f:
    data = json.load(f)

seen_ids = set()
fixture = []
for obj in data:
    route_id = obj.get("id")
    if route_id in seen_ids:
        continue
    seen_ids.add(route_id)
    fixture.append({
        "model": "routes.route",
        "pk": str(uuid.uuid4()),
        "fields": {
            "title": obj.get("title"),
            "description": obj.get("description"),
            "created_at": now,
            "updated_at": now,
            # 필요에 따라 user_id, places 등 추가
        }
    })

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(fixture, f, ensure_ascii=False, indent=2)

print(f"변환 완료! {OUTPUT_PATH} 파일을 loaddata로 사용하세요.") 