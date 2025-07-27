/**
 * 앱에서 사용되는 정적 데이터 상수들
 */

// 전라도 지역 목록
export const JEONLA_DESTINATIONS = [
    "전주", "군산", "익산", "정읍", "남원", "김제", "완주", "진안",
    "무주", "장수", "임실", "순창", "고창", "부안", "목포", "여수",
    "순천", "나주", "광양", "담양", "곡성", "구례",
] as const;

// 음식 카테고리 목록
export const FOOD_CATEGORIES = [
    "한식", "중식", "일식", "양식", "카페", "디저트", "베이커리",
    "해산물", "고기", "면류", "분식", "치킨", "피자", "햄버거",
] as const;

// 모달 단계별 제목
export const MODAL_STEP_TITLES = {
    1: "언제 가세요?",
    2: "어디로 가세요?",
    3: "선호하는 음식을 알려주세요",
} as const;

// 애니메이션 상수
export const ANIMATION_CONFIG = {
    DURATION: 300,
    SLIDE_DISTANCE: 400,
} as const;

// 샘플 데이터
export const SAMPLE_COURSES = [
    {
        id: "1",
        subtitle: "뜨거운 여름 햇살",
        title: "전주 2박 3일",
        hasImages: true,
    },
    {
        id: "2",
        subtitle: "쌩쌩 겨울 바다",
        title: "부산 3박 4일",
        hasImages: false,
    },
] as const; 