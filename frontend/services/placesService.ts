import { Places, type PlaceRecommend } from '@/src/client';
import type { Coordinates } from './geolocationService';

export interface PlaceRecommendParams {
  lat: number;
  lng: number;
  maxDistanceKm?: number;
  limit?: number;
  categoryFilter?: string[];
}

export type Place = PlaceRecommend;

export const placesService = {
  async getRecommendedPlaces(coordinates: Coordinates, params?: {
    maxDistanceKm?: number;
    limit?: number;
    categoryFilter?: string[];
  }): Promise<Place[]> {
    try {
      const response = await Places.placesRecommendList({
        query: {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          max_distance_km: params?.maxDistanceKm || 1.0,
          limit: params?.limit || 10,
          category_filter: params?.categoryFilter || ['음식점'],
        },
      });

      return response.data?.places || [];
    } catch (error) {
      console.error('Failed to get recommended places:', error);
      throw error;
    }
  },
};
