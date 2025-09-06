// on → 북마크된 상태 / off → 기본 마커 (null 처리해서 Kakao 기본 아이콘 쓰게 함)
// ⚠️ 문자열 경로 대신 require(...) 로 바꿉니다. (RN 번들러가 파일을 인식하도록)
export const mapIcons = {
    korean: { on: require("@/assets/map-icons/korean.png"), off: null },
    alcohol: { on: require("@/assets/map-icons/alcohol.png"), off: null },
    seafood: { on: require("@/assets/map-icons/seafood.png"), off: null },
    bread: { on: require("@/assets/map-icons/bread.png"), off: null },
    american: { on: require("@/assets/map-icons/american.png"), off: null },
    chinese: { on: require("@/assets/map-icons/chinese.png"), off: null },
    sushi: { on: require("@/assets/map-icons/sushi.png"), off: null },
    hamburger: { on: require("@/assets/map-icons/hamburger.png"), off: null },
    pizza: { on: require("@/assets/map-icons/pizza.png"), off: null },
    meat: { on: require("@/assets/map-icons/meat.png"), off: null },
    schoolfood: { on: require("@/assets/map-icons/schoolfood.png"), off: null },
} as const;

// place.json의 "category_name": "음식점 > 한식 > ..." 중간 토큰 → 내부 아이콘 키
export const tokenToIconKey: Record<string, keyof typeof mapIcons> = {
    한식: "korean",
    양식: "american",
    중식: "chinese",
    일식: "sushi",
    "카페,디저트": "bread",
    디저트: "bread",
    술집: "alcohol",
    길거리음식: "schoolfood",
    "육류,고기": "meat",
    햄버거: "hamburger",
    피자: "pizza",
    해산물: "seafood",
};

//  WebView 안에서 쓸 수 있도록 RN 로컬 이미지를 URI로 변환
export function getIconUrlMap(): Record<keyof typeof mapIcons, string> {
    const { Image } = require("react-native");
    const out: any = {};
    (Object.keys(mapIcons) as Array<keyof typeof mapIcons>).forEach((k) => {
        const mod = mapIcons[k].on;
        out[k] = Image.resolveAssetSource(mod).uri; // file:///… 혹은 asset://…
    });
    return out;
}
