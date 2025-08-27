// Kakao Marker 아이콘 경로 매핑
// on → 북마크된 상태 / off → 기본 마커 (null 처리해서 Kakao 기본 아이콘 쓰게 함)

export const mapIcons: Record<string, { on: string; off: string | null }> = {
    korean: {
        on: "./assets/map-icons/korean.png", // ✅ Kakao WebView에서 접근 가능
        off: null, 
    },
    alcohol: {
        on: "./assets/map-icons/alcohol.png",
        off: null,
    },
    seafood: {
        on: "./assets/map-icons/seafood.png",
        off: null,
    },
    bread: {
        on: "./assets/map-icons/bread.png",
        off: null,
    },
    american: {
        on: "./assets/map-icons/american.png",
        off: null,
    },
    chinese: {
        on: "./assets/map-icons/chinese.png",
        off: null,
    },
    sushi: {
        on: "./assets/map-icons/sushi.png",
        off: null,
    },
    hamburger: {
        on: "./assets/map-icons/hamburger.png",
        off: null,
    },
    pizza: {
        on: "./assets/map-icons/pizza.png",
        off: null,
    },
    meat: {
        on: "./assets/map-icons/meat.png",
        off: null,
    },
    schoolfood: {
        on: "./assets/map-icons/schoolfood.png",
        off: null,
    },

};