// 기본 데이터 타입
export interface PlaceItem {
  id: string;
  category: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  hasImages: boolean;
}

export interface DayPlan {
  id: string;
  day: number;
  title: string;
  places: PlaceItem[];
}

export interface RecommendationItem {
  id: string;
  title: string;
  places: PlaceItem[];
}

// 모달 및 폼 관련 타입
export interface CreateCourseData {
  startDate: string;
  endDate: string;
  selectedDestinations: string[];
  selectedFoods: string[];
}

// 이벤트 핸들러 타입
export type DateChangeHandler = (startDate: string, endDate: string) => void;
export type DestinationChangeHandler = (destinations: string[]) => void;
export type FoodChangeHandler = (foods: string[]) => void;
export type PlacePressHandler = (placeId: string) => void;
export type CardPressHandler = () => void;
export type SaveHandler = () => void;
