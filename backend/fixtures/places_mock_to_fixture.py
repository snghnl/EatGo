import json
import os
import uuid
from datetime import datetime

# 현재 스크립트와 같은 폴더 내 파일 경로
INPUT_PATH = os.path.join(os.path.dirname(__file__), "places.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "places_fixture.json")

now = datetime.now().isoformat()

with open(INPUT_PATH, encoding="utf-8") as f:
    data = json.load(f)
    data = data["documents"]  # documents 리스트만 추출

seen_ids = set()
fixture = []
for obj in data:
    ext_id = obj.get("id")
    if ext_id in seen_ids:
        continue  # 중복된 external_id는 건너뜀
    seen_ids.add(ext_id)
    fixture.append({
        "model": "places.place",
        "pk": str(uuid.uuid4()),  # UUID를 새로 생성
        "fields": {
            "name": obj.get("place_name"),
            "lat": float(obj["y"]) if obj.get("y") else None,
            "lng": float(obj["x"]) if obj.get("x") else None,
            "address": obj.get("address_name"),
            "road_address": obj.get("road_address_name"),
            "phone_number": obj.get("phone"),
            "external_id": ext_id,
            "external_url": obj.get("place_url"),
            "created_at": now,
            "updated_at": now,
            # 필요에 따라 avg_rating, place_type 등 추가
        }
    })

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(fixture, f, ensure_ascii=False, indent=2)

print(f"변환 완료! {OUTPUT_PATH} 파일을 loaddata로 사용하세요.") 