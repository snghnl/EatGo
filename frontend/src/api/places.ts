import placeMock from "@/mock-data/places.json";

export type PlaceDoc = {
    id: string;
    place_name: string;
    category_name: string; // 예: "음식점 > 한식 > ..."
    x: string; // lng
    y: string; // lat
    // ... 필요하면 확장
};

export async function fetchPlaceIndex(): Promise<Map<string, PlaceDoc>> {
    // TODO: 서버가 준비되면 목록 API/검색 API로 교체
    const docs = (placeMock as any)?.documents ?? [];
    const map = new Map<string, PlaceDoc>();
    docs.forEach((d: any) => map.set(String(d.id), d));
    return map;
}
