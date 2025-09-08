// types/place.ts
export interface Place {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  x: string;
  y: string;
  distance: string;
  category_group_code: string;
  category_group_name: string;
}

export interface MenuItem {
  id: string;
  place_id: string;
  name: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PlaceDetail extends Place {
  rating: number;
  total_reviews: number;
  operating_hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    holidays: string;
  };
  images: string[];
  menu_items: MenuItem[];
  recommendations: Place[];
}
