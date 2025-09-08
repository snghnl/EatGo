// frontend/src/api/dayPlans.ts
export interface PlaceItem {
  id: string;
  category: string;
  name: string;
}

export interface DayPlanItem {
  id: string;
  day: number;
  title: string;
  places: PlaceItem[];
}

// 백엔드 베이스 URL
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:8000"; // SOURCE: ???

// 실제 엔드포인트(아래 경로는 백엔드에 맞게 바꾸세요)
const ENDPOINT_DAY_PLANS = `${API_BASE}/api/travel-courses/:courseId/day-plans/`; // SOURCE: ???

export async function fetchDayPlans(courseId: string): Promise<DayPlanItem[]> {
  const url = ENDPOINT_DAY_PLANS.replace(":courseId", courseId);
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to fetch day plans: ${res.status}`);
  }
  const data = await res.json();
  return data as DayPlanItem[];
}
