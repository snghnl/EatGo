# Mock Data for EatGo Project

이 디렉토리는 EatGo 프로젝트의 개발 및 테스트를 위한 mock data를 포함합니다.

## 파일 구조

- `places.json` - 카카오 API 응답 형식의 맛집 데이터 (12개 샘플)
- `routes.json` - 여행 경로 데이터 (6개 샘플)
- `users.json` - 사용자 데이터 (5개 샘플)
- `categories.json` - 음식 카테고리 데이터 (8개 샘플)
- `wishlists.json` - 위시리스트 데이터 (4개 샘플)
- `posts.json` - 커뮤니티 게시글 데이터 (6개 샘플)

## 데이터 구조

### Place (맛집) - 카카오 API 응답 형식

```json
{
  "address_name": "서울특별시 중구 명동10길 29",
  "category_group_code": "FD6",
  "category_group_name": "음식점",
  "category_name": "음식점 > 한식 > 만두,교자",
  "distance": "",
  "id": "7960840",
  "phone": "02-776-5348",
  "place_name": "명동교자",
  "place_url": "http://place.map.kakao.com/7960840",
  "road_address_name": "서울특별시 중구 명동10길 29",
  "x": "126.9834",
  "y": "37.5636"
}
```

### Route (경로)

```json
{
  "id": "route-001",
  "user_id": "user-001",
  "title": "경로 제목",
  "description": "경로 설명",
  "places": [
    {
      "id": "place-001",
      "order": 1,
      "estimated_time": 30,
      "transport_type": "도보"
    }
  ],
  "total_distance": 1.2,
  "total_time": 75,
  "is_public": true,
  "likes_count": 15,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### User (사용자)

```json
{
  "id": "user-001",
  "email": "user@example.com",
  "username": "username",
  "login_method": "kakao",
  "profile_image": "프로필 이미지 URL",
  "bio": "자기소개",
  "favorite_categories": ["한식", "카페"],
  "created_routes_count": 2,
  "followers_count": 45,
  "following_count": 23,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Wishlist (위시리스트)

```json
{
  "id": "wishlist-001",
  "user_id": "user-001",
  "title": "위시리스트 제목",
  "description": "위시리스트 설명",
  "is_public": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "items": [
    {
      "id": "wishlist-item-001",
      "wishlist_id": "wishlist-001",
      "place_name": "맛집명",
      "place_id": "7960840",
      "lat": 37.5636,
      "lng": 126.9834,
      "added_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Post (게시글)

```json
{
  "id": "post-001",
  "user_id": "user-001",
  "route_id": "route-001",
  "content": "게시글 내용",
  "likes_count": 15,
  "comments_count": 3,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "comments": [
    {
      "id": "comment-001",
      "post_id": "post-001",
      "user_id": "user-002",
      "content": "댓글 내용",
      "created_at": "2024-01-01T01:00:00Z"
    }
  ]
}
```

### Category (카테고리)

```json
{
  "id": "cat-001",
  "name": "한식",
  "description": "한국 전통 음식",
  "icon": "🍚",
  "color": "#FF6B6B",
  "place_count": 5,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 사용 방법

### Backend (Django)

1. `fixtures/` 디렉토리에 JSON 파일 복사
2. `python manage.py loaddata filename.json` 명령으로 DB에 로드
3. API 테스트용 데이터로 활용

### Frontend (React Native)

1. `src/mock-data/` 디렉토리에 JSON 파일 복사
2. 개발 중 API 연동 전까지 사용
3. 컴포넌트 테스트용 데이터로 활용

## 샘플 데이터 특징

- **Places**: 카카오 API 응답 형식으로 전국 주요 도시의 맛집 (서울, 부산, 제주, 대구, 광주, 인천, 대전)
- **Routes**: 다양한 테마의 여행 경로 (명동 투어, 홍대 데이트, 고급 레스토랑 등)
- **Users**: 다양한 사용자 유형 (맛집 탐험가, 여행자, 요리사, 지역 가이드, 카페러버)
- **Categories**: 한식, 양식, 중식, 일식, 카페, 디저트, 술집, 길거리음식
- **Wishlists**: 사용자별 위시리스트 (서울 맛집, 홍대 데이트, 고급 레스토랑, 지역 특산품)
- **Posts**: 커뮤니티 게시글과 댓글 (경로 공유, 맛집 후기)

## 카카오 API 연동

- `places.json`은 카카오 Local API의 장소 검색 응답 형식을 따름
- `place_id`는 카카오 API의 `id` 필드와 매핑
- 좌표는 `x`(경도), `y`(위도) 형식 사용
- 카테고리는 카카오 API의 `category_name` 필드 활용

## 참고사항

- 모든 ID는 UUID 형식으로 표준화 (카카오 API ID 제외)
- 좌표는 실제 한국 지역 좌표 사용
- 이미지 URL은 예시용 (실제 구현 시 실제 이미지로 교체 필요)
- 날짜는 ISO 8601 형식 사용
- 카카오 API 응답 형식과 SRS ERD 구조를 모두 반영
