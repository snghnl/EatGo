import { useState, useEffect, useCallback } from 'react';
import { geolocationService, type Coordinates, type LocationError, type MapCenter } from '@/services/geolocationService';
import * as Location from 'expo-location';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  distanceInterval?: number;
  timeInterval?: number;
}

interface UseGeolocationReturn {
  location: Coordinates | null;
  mapCenter: MapCenter | null;
  isLoading: boolean;
  error: LocationError | null;
  hasPermission: boolean;
  getCurrentLocation: () => Promise<void>;
  watchPosition: () => Promise<void>;
  stopWatching: () => void;
  requestPermission: () => Promise<boolean>;
  updateMapCenter: (center: { lat: number; lng: number }) => void;
  getMapCenterCoordinates: () => MapCenter | null;
}

const DEFAULT_LOCATION: Coordinates = {
  latitude: 37.566826, // Seoul City Hall
  longitude: 126.9786567,
};

export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<MapCenter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();

    // Only get initial location once, no automatic watching
    getCurrentLocation();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      const permissionStatus = await geolocationService.checkPermissions();
      setHasPermission(permissionStatus.granted);
      return permissionStatus.granted;
    } catch (err) {
      console.error('Failed to check permissions:', err);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('Failed to request permission:', err);
      setHasPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check/request permissions first
      let hasPerms = hasPermission;
      if (!hasPerms) {
        hasPerms = await requestPermission();
      }

      if (!hasPerms) {
        // Use default location if no permission
        setLocation(DEFAULT_LOCATION);
        setError({
          code: 'PERMISSION_DENIED',
          message: 'Location permission denied. Using default location.'
        });
        return;
      }

      const result = await geolocationService.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      });

      setLocation(result.coordinates);
      console.log('Location updated:', result.coordinates);
    } catch (err) {
      console.error('Failed to get current location:', err);
      const locationError = err as LocationError;
      setError(locationError);

      // Fall back to default location
      setLocation(DEFAULT_LOCATION);
    } finally {
      setIsLoading(false);
    }
  }, [options, hasPermission, requestPermission]);

  const watchPosition = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing subscription
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }

      const newSubscription = await geolocationService.watchPosition(
        (locationResult) => {
          setLocation(locationResult.coordinates);
          console.log('Location watch updated:', locationResult.coordinates);
        },
        (watchError) => {
          console.error('Location watch error:', watchError);
          setError(watchError);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          distanceInterval: options.distanceInterval,
          timeInterval: options.timeInterval,
        }
      );

      if (newSubscription) {
        setSubscription(newSubscription);
      }
    } catch (err) {
      console.error('Failed to watch position:', err);
      const locationError = err as LocationError;
      setError(locationError);
    } finally {
      setIsLoading(false);
    }
  }, [options, subscription]);

  const stopWatching = useCallback(() => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
      console.log('Stopped watching location');
    }
  }, [subscription]);

  const updateMapCenter = useCallback((center: { lat: number; lng: number }) => {
    const normalizedCenter = geolocationService.normalizeMapCenter(center);
    setMapCenter(normalizedCenter);
    console.log('Map center updated:', normalizedCenter);
  }, []);

  const getMapCenterCoordinates = useCallback((): MapCenter | null => {
    return mapCenter;
  }, [mapCenter]);

  return {
    location,
    mapCenter,
    isLoading,
    error,
    hasPermission,
    getCurrentLocation,
    watchPosition,
    stopWatching,
    requestPermission,
    updateMapCenter,
    getMapCenterCoordinates,
  };
};
