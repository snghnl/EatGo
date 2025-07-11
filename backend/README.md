# EatGo Backend

EatGo 프로젝트의 Django REST API 백엔드 서버입니다.

## 기술 스택

-   **Python**: 3.11+
-   **Django**: 5.2.4+
-   **Django REST Framework**: 3.16.0+
-   **SQLite**: 개발용 데이터베이스 (기본)
-   **uv**: Python 패키지 관리자

## 기본 셋팅

### 1. Python 설치

Python 3.11 이상이 필요합니다.

```bash
# Python 버전 확인
python --version

# 또는
python3 --version
```

### 2. uv 설치

uv는 빠른 Python 패키지 관리자입니다.

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# 또는 pip를 통해 설치
pip install uv
```

### 3. 가상환경 생성 및 의존성 설치

```bash
cd backend

# 가상환경 생성 및 의존성 설치
uv sync
```

### 4. 데이터베이스 마이그레이션

```bash
# 마이그레이션 파일 생성
uv run python manage.py makemigrations

# 마이그레이션 적용
uv run python manage.py migrate
```

### 5. 개발 서버 실행

```bash
# 개발 서버 시작
uv run python manage.py runserver

# 특정 포트에서 실행 (기본: 8000)
uv run python manage.py runserver 8000
```

## 개발 환경 설정

### 필수 도구

1. **Python 개발 환경**

    - Python 3.11+
    - uv 패키지 관리자

2. **데이터베이스**

    - SQLite (기본, 개발용)
    - PostgreSQL (프로덕션 권장)

3. **API 테스트**
    - Postman 또는 Insomnia
    - curl 명령어

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```bash
# .env 파일 예시
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

## 프로젝트 구조

```
backend/
├── core/                   # 메인 Django 앱
│   ├── models.py          # 데이터 모델
│   ├── views.py           # 뷰 로직
│   ├── serializers.py     # DRF 시리얼라이저
│   ├── urls.py            # URL 라우팅
│   └── tests.py           # 테스트 코드
├── eatgo/                  # Django 프로젝트 설정
│   ├── settings.py        # Django 설정
│   ├── urls.py            # 메인 URL 설정
│   └── wsgi.py            # WSGI 설정
├── manage.py              # Django 관리 명령어
├── pyproject.toml         # 프로젝트 의존성
└── uv.lock               # 의존성 잠금 파일
```

## 스크립트 명령어

```bash
# 개발 서버 실행
uv run python manage.py runserver

# 마이그레이션
uv run python manage.py makemigrations
uv run python manage.py migrate

# 관리자 계정 생성
uv run python manage.py createsuperuser

# 테스트 실행
uv run python manage.py test

# 셸 실행
uv run python manage.py shell

# 정적 파일 수집
uv run python manage.py collectstatic
```

## 개발 가이드라인

### 코드 스타일

-   PEP 8 Python 스타일 가이드 준수
-   Django 코딩 스타일 가이드 준수
-   Type hints 사용 권장
-   Docstring 작성

### 파일 명명 규칙

-   모델: snake_case (예: `user_profile.py`)
-   뷰: snake_case (예: `user_views.py`)
-   URL: snake_case (예: `user_urls.py`)
-   상수: UPPER_SNAKE_CASE (예: `MAX_FILE_SIZE`)

### API 설계 원칙

-   RESTful API 설계
-   HTTP 상태 코드 적절히 사용
-   일관된 응답 형식
-   적절한 에러 처리

## 데이터베이스 관리

### 마이그레이션

```bash
# 마이그레이션 파일 생성
uv run python manage.py makemigrations core

# 마이그레이션 적용
uv run python manage.py migrate

# 마이그레이션 상태 확인
uv run python manage.py showmigrations
```

### 데이터베이스 초기화

```bash
# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
rm db.sqlite3
uv run python manage.py migrate
```

## API 문서화

### Django REST Framework 자동 문서

```bash
# API 루트 URL 접속
http://localhost:8000/api/
```

### Swagger/OpenAPI 문서 (선택사항)

```bash
# drf-spectacular 설치
uv add drf-spectacular

# 설정에 추가 후
uv run python manage.py spectacular --file schema.yml
```

## 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
uv run python manage.py test

# 특정 앱 테스트
uv run python manage.py test core

# 특정 테스트 파일 실행
uv run python manage.py test core.tests.test_models
```

### 테스트 커버리지

```bash
# pytest-cov 설치
uv add pytest-cov

# 커버리지 테스트 실행
uv run pytest --cov=core
```

## 배포

### 프로덕션 설정

1. **환경 변수 설정**

    ```bash
    DEBUG=False
    SECRET_KEY=your-production-secret-key
    ALLOWED_HOSTS=your-domain.com
    ```

2. **정적 파일 수집**

    ```bash
    uv run python manage.py collectstatic
    ```

3. **데이터베이스 설정**
    - PostgreSQL 권장
    - 환경 변수로 DATABASE_URL 설정

### Docker 배포 (선택사항)

```dockerfile
# Dockerfile 예시
FROM python:3.11-slim

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync

COPY . .
RUN uv run python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## 문제 해결

### 일반적인 문제들

1. **마이그레이션 충돌**

    ```bash
    uv run python manage.py migrate --fake-initial
    ```

2. **정적 파일 문제**

    ```bash
    uv run python manage.py collectstatic --clear
    ```

3. **의존성 문제**
    ```bash
    uv sync --reinstall
    ```

## 추가 리소스

-   [Django 문서](https://docs.djangoproject.com/)
-   [Django REST Framework 문서](https://www.django-rest-framework.org/)
-   [uv 문서](https://docs.astral.sh/uv/)
