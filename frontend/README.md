# EatGo Frontend

EatGo 프로젝트의 React Native/Expo 프론트엔드 애플리케이션입니다.

## 기술 스택

-   **React Native**: 0.79.5
-   **Expo**: ~53.0.17
-   **TypeScript**: ~5.8.3
-   **React Navigation**: ^7.1.6
-   **Expo Router**: ~5.1.3

## 기본 셋팅

### 1. Node.js 설치

Node.js 18.0.0 이상이 필요합니다.

```bash
# Node.js 버전 확인
node --version

# npm 버전 확인
npm --version
```

### 2. Expo CLI 설치

```bash
npm install -g @expo/cli
```

### 3. 프로젝트 의존성 설치

```bash
cd frontend
npm install
```

### 4. 개발 서버 실행

```bash
# 개발 서버 시작
npm start

# 또는
npx expo start
```

### 5. 앱 실행 옵션

개발 서버가 시작되면 다음 옵션들을 사용할 수 있습니다:

-   **iOS 시뮬레이터**: `i` 키를 누르거나 `npm run ios`
-   **Android 에뮬레이터**: `a` 키를 누르거나 `npm run android`
-   **웹 브라우저**: `w` 키를 누르거나 `npm run web`
-   **Expo Go 앱**: QR 코드를 스캔하여 실제 기기에서 실행

## 개발 환경 설정

### 필수 도구

1. **iOS 개발** (macOS 필요)

    - Xcode 설치
    - iOS 시뮬레이터 설정

2. **Android 개발**

    - Android Studio 설치
    - Android SDK 설정
    - Android 에뮬레이터 설정

3. **웹 개발**
    - Chrome 또는 다른 웹 브라우저

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```bash
# .env 파일 예시
API_BASE_URL=http://localhost:8000/api
```

## 프로젝트 구조

```
frontend/
├── app/                    # Expo Router 기반 페이지
├── components/             # 재사용 가능한 컴포넌트
├── constants/              # 상수 정의
├── hooks/                  # 커스텀 React Hooks
├── src/                    # 소스 코드
│   ├── api/               # API 관련 코드
│   ├── components/        # 컴포넌트
│   ├── navigation/        # 네비게이션 설정
│   └── screens/          # 화면 컴포넌트
└── assets/               # 이미지, 폰트 등 정적 파일
```

## 스크립트 명령어

```bash
npm start          # 개발 서버 시작
npm run android    # Android 에뮬레이터에서 실행
npm run ios        # iOS 시뮬레이터에서 실행
npm run web        # 웹 브라우저에서 실행
npm run lint       # ESLint로 코드 검사
npm run reset-project  # 프로젝트 초기화
```

## 개발 가이드라인

### 코드 스타일

-   TypeScript 사용
-   ESLint 규칙 준수
-   함수형 컴포넌트 사용
-   Hooks 기반 상태 관리

### 파일 명명 규칙

-   컴포넌트: PascalCase (예: `UserProfile.tsx`)
-   파일: camelCase (예: `userService.ts`)
-   상수: UPPER_SNAKE_CASE (예: `API_BASE_URL`)

## 문제 해결

### 일반적인 문제들

1. **Metro 번들러 캐시 문제**

    ```bash
    npx expo start --clear
    ```

2. **iOS 빌드 문제**

    ```bash
    cd ios && pod install
    ```

3. **Android 빌드 문제**
    ```bash
    npx expo run:android --clear
    ```

## 배포

### Expo EAS Build

```bash
# EAS CLI 설치
npm install -g @expo/eas-cli

# 로그인
eas login

# 빌드 설정
eas build:configure

# 빌드 실행
eas build --platform ios
eas build --platform android
```

## 추가 리소스

-   [Expo 문서](https://docs.expo.dev/)
-   [React Native 문서](https://reactnative.dev/)
-   [Expo Router 문서](https://docs.expo.dev/router/introduction/)
