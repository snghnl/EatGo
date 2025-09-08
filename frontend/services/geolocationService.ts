import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  coordinates: Coordinates;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

export interface MapCenter {
  latitude: number;
  longitude: number;
}

export const geolocationService = {
  /**
   * Get the user's current position using device GPS
   * @param options - Configuration options for location request
   * @returns Promise resolving to current location or rejecting with error
   */
  async getCurrentPosition(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<LocationResult> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw {
          code: 'PERMISSION_DENIED',
          message: 'Location permission was denied by user'
        } as LocationError;
      }

      // Get current location
      const locationOptions: Location.LocationOptions = {
        accuracy: options?.enableHighAccuracy
          ? Location.Accuracy.BestForNavigation
          : Location.Accuracy.Balanced,
        timeInterval: options?.maximumAge || 10000,
      };

      const location = await Location.getCurrentPositionAsync(locationOptions);

      return {
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

    } catch (error: any) {
      // Handle different types of errors
      if (error.code) {
        throw error as LocationError;
      }

      if (error.message?.includes('permission')) {
        throw {
          code: 'PERMISSION_DENIED',
          message: 'Location access denied'
        } as LocationError;
      }

      if (error.message?.includes('timeout')) {
        throw {
          code: 'TIMEOUT',
          message: 'Location request timed out'
        } as LocationError;
      }

      throw {
        code: 'UNKNOWN',
        message: error.message || 'Failed to get current position'
      } as LocationError;
    }
  },

  /**
   * Check if location permissions have been granted
   * @returns Promise resolving to permission status
   */
  async checkPermissions(): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    status: Location.PermissionStatus;
  }> {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain,
      status: status,
    };
  },

  /**
   * Watch user's position for continuous updates
   * @param callback - Function to call when position changes
   * @param options - Configuration options for location watching
   * @returns Subscription object that can be removed
   */
  async watchPosition(
    callback: (location: LocationResult) => void,
    errorCallback?: (error: LocationError) => void,
    options?: {
      enableHighAccuracy?: boolean;
      distanceInterval?: number;
      timeInterval?: number;
    }
  ): Promise<Location.LocationSubscription | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const error: LocationError = {
          code: 'PERMISSION_DENIED',
          message: 'Location permission was denied'
        };
        errorCallback?.(error);
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: options?.enableHighAccuracy
            ? Location.Accuracy.BestForNavigation
            : Location.Accuracy.Balanced,
          timeInterval: options?.timeInterval || 5000,
          distanceInterval: options?.distanceInterval || 10,
        },
        (location) => {
          const result: LocationResult = {
            coordinates: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };
          callback(result);
        }
      );

      return subscription;

    } catch (error: any) {
      const locationError: LocationError = {
        code: 'UNKNOWN',
        message: error.message || 'Failed to watch position'
      };
      errorCallback?.(locationError);
      return null;
    }
  },

  /**
   * Convert map center coordinates from various formats
   * @param center - Map center coordinates
   * @returns Standardized MapCenter object
   */
  normalizeMapCenter(center: { lat: number; lng: number } | { latitude: number; longitude: number }): MapCenter {
    if ('lat' in center && 'lng' in center) {
      return {
        latitude: center.lat,
        longitude: center.lng
      };
    }
    return {
      latitude: center.latitude,
      longitude: center.longitude
    };
  },

  /**
   * Get current map viewing center (to be used with map components)
   * This is a utility function for map center coordinate handling
   */
  getMapCenterCoordinates(center: { lat: number; lng: number }): MapCenter {
    return this.normalizeMapCenter(center);
  }
};
