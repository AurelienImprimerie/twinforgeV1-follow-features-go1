/**
 * GPS Tracking Service
 * Handles geolocation tracking for endurance sessions
 * Best practices: High accuracy, battery-efficient, error handling
 */

import logger from '../../lib/utils/logger';
import { featureFlags } from '../../config/featureFlags';
import { gpsSimulator } from '../../lib/device/gpsSimulator';

export interface GPSCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
  altitude?: number;
  speed?: number; // m/s
  accuracy?: number; // meters
  heartRate?: number;
}

export interface RouteStats {
  totalDistance: number; // meters
  avgPace: number; // min/km
  avgSpeed: number; // km/h
  elevationGain: number; // meters
  elevationLoss: number; // meters
  maxSpeed: number; // km/h
  duration: number; // seconds
}

class GPSTrackingService {
  private watchId: number | null = null;
  private coordinates: GPSCoordinate[] = [];
  private isTracking: boolean = false;
  private sessionId: string | null = null;
  private startTime: number = 0;
  private lastPosition: GeolocationPosition | null = null;
  private devMode: boolean = false;
  private useSimulation: boolean = false;

  // Configuration - Best practices for fitness tracking
  private readonly HIGH_ACCURACY_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 0 // No caching
  };

  // Dev mode thresholds (more permissive for desktop development)
  private readonly DEV_ACCURACY_THRESHOLD = 200; // meters (vs 50 in prod)
  private readonly DEV_MIN_DISTANCE = 0; // meters (vs 5 in prod)
  private readonly PROD_ACCURACY_THRESHOLD = 50; // meters
  private readonly PROD_MIN_DISTANCE = 5; // meters

  /**
   * Enable development mode (relaxed filters for desktop testing)
   */
  setDevMode(enabled: boolean): void {
    this.devMode = enabled;
    logger.info('GPS_TRACKING', 'Dev mode changed', {
      devMode: this.devMode,
      accuracyThreshold: this.devMode ? this.DEV_ACCURACY_THRESHOLD : this.PROD_ACCURACY_THRESHOLD,
      minDistance: this.devMode ? this.DEV_MIN_DISTANCE : this.PROD_MIN_DISTANCE
    });
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    const supported = 'geolocation' in navigator;
    logger.info('GPS_TRACKING', 'Geolocation support check', { supported });
    return supported;
  }

  /**
   * Check if running in dev mode
   */
  isDevMode(): boolean {
    return this.devMode;
  }

  /**
   * Enable simulation mode (uses GPS simulator instead of real GPS)
   */
  setSimulationMode(enabled: boolean): void {
    this.useSimulation = enabled;
    logger.info('GPS_TRACKING', 'Simulation mode changed', {
      useSimulation: this.useSimulation
    });
  }

  /**
   * Check if using simulation
   */
  isUsingSimulation(): boolean {
    return this.useSimulation;
  }

  /**
   * Request permission and start tracking
   * Best practice: Request permission explicitly before starting
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      logger.error('GPS_TRACKING', 'Geolocation not supported');
      return false;
    }

    try {
      // Try to get position once to trigger permission request
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, this.HIGH_ACCURACY_OPTIONS);
      });

      logger.info('GPS_TRACKING', 'Permission granted', {
        accuracy: position.coords.accuracy,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });

      return true;
    } catch (error) {
      logger.error('GPS_TRACKING', 'Permission denied or error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code
      });
      return false;
    }
  }

  /**
   * Start tracking GPS coordinates
   * Best practice: Capture every 3-5 seconds or when distance > 10m
   * Can use simulation mode for desktop testing
   */
  async startTracking(sessionId: string, useSimulation?: boolean): Promise<boolean> {
    if (this.isTracking) {
      logger.warn('GPS_TRACKING', 'Already tracking');
      return true;
    }

    this.sessionId = sessionId;
    this.coordinates = [];
    this.startTime = Date.now();
    this.lastPosition = null;

    // Use simulation if explicitly requested or if in dev mode on desktop
    if (useSimulation !== undefined) {
      this.useSimulation = useSimulation;
    }

    if (this.useSimulation) {
      logger.info('GPS_TRACKING', 'Starting GPS simulation', { sessionId });
      gpsSimulator.startSimulation('short1k');
      this.isTracking = true;
      return true;
    }

    if (!this.isSupported()) {
      logger.error('GPS_TRACKING', 'Cannot start: geolocation not supported');
      return false;
    }

    return new Promise((resolve) => {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.handlePositionUpdate(position);
          if (!this.isTracking) {
            this.isTracking = true;
            logger.info('GPS_TRACKING', 'Tracking started successfully', {
              sessionId: this.sessionId,
              initialAccuracy: position.coords.accuracy
            });
            resolve(true);
          }
        },
        (error) => {
          this.handlePositionError(error);
          if (!this.isTracking) {
            resolve(false);
          }
        },
        this.HIGH_ACCURACY_OPTIONS
      );
    });
  }

  /**
   * Handle position updates
   * Best practice: Filter low accuracy points (> 50m) and duplicate points
   * Dev mode: Relaxed filters for desktop testing
   */
  private handlePositionUpdate(position: GeolocationPosition): void {
    const accuracy = position.coords.accuracy;
    const accuracyThreshold = this.devMode ? this.DEV_ACCURACY_THRESHOLD : this.PROD_ACCURACY_THRESHOLD;
    const minDistance = this.devMode ? this.DEV_MIN_DISTANCE : this.PROD_MIN_DISTANCE;

    // Filter out low accuracy readings
    if (accuracy > accuracyThreshold) {
      logger.warn('GPS_TRACKING', 'Low accuracy position discarded', {
        accuracy,
        threshold: accuracyThreshold,
        devMode: this.devMode
      });
      return;
    }

    // Check if we should add this point (distance-based filtering)
    if (this.lastPosition && minDistance > 0) {
      const distance = this.calculateDistance(
        this.lastPosition.coords.latitude,
        this.lastPosition.coords.longitude,
        position.coords.latitude,
        position.coords.longitude
      );

      // Only add point if moved at least minDistance meters
      if (distance < minDistance) {
        logger.debug('GPS_TRACKING', 'Position filtered by min distance', {
          distance: distance.toFixed(2),
          minDistance,
          devMode: this.devMode
        });
        return;
      }
    }

    const coordinate: GPSCoordinate = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
      altitude: position.coords.altitude ?? undefined,
      speed: position.coords.speed ?? undefined,
      accuracy: position.coords.accuracy
    };

    this.coordinates.push(coordinate);
    this.lastPosition = position;

    logger.info('GPS_TRACKING', 'Position recorded', {
      pointsCount: this.coordinates.length,
      accuracy: accuracy.toFixed(1),
      lat: coordinate.lat.toFixed(6),
      lng: coordinate.lng.toFixed(6),
      speed: coordinate.speed?.toFixed(2)
    });
  }

  /**
   * Handle geolocation errors
   */
  private handlePositionError(error: GeolocationPositionError): void {
    let errorMessage = 'Unknown GPS error';
    let errorType = 'UNKNOWN';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'User denied geolocation permission';
        errorType = 'PERMISSION_DENIED';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Position information unavailable';
        errorType = 'POSITION_UNAVAILABLE';
        break;
      case error.TIMEOUT:
        errorMessage = 'Geolocation request timed out';
        errorType = 'TIMEOUT';
        break;
    }

    logger.error('GPS_TRACKING', 'Geolocation error', {
      errorType,
      errorMessage,
      code: error.code,
      message: error.message
    });
  }

  /**
   * Stop tracking GPS coordinates
   */
  stopTracking(): GPSCoordinate[] {
    if (!this.isTracking) {
      logger.warn('GPS_TRACKING', 'Not currently tracking');
      return [];
    }

    if (this.useSimulation) {
      const simCoords = gpsSimulator.stopSimulation();
      this.coordinates = simCoords;
      logger.info('GPS_TRACKING', 'Simulation stopped', {
        sessionId: this.sessionId,
        pointsCaptured: this.coordinates.length
      });
    } else {
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    }

    this.isTracking = false;

    const duration = (Date.now() - this.startTime) / 1000;

    logger.info('GPS_TRACKING', 'Tracking stopped', {
      sessionId: this.sessionId,
      pointsCaptured: this.coordinates.length,
      duration: `${Math.floor(duration / 60)}:${(duration % 60).toFixed(0).padStart(2, '0')}`,
      distance: this.calculateTotalDistance().toFixed(2) + 'm',
      wasSimulation: this.useSimulation
    });

    return [...this.coordinates];
  }

  /**
   * Get current coordinates
   */
  getCoordinates(): GPSCoordinate[] {
    if (this.useSimulation && this.isTracking) {
      return gpsSimulator.getCurrentCoordinates();
    }
    return [...this.coordinates];
  }

  /**
   * Get tracking status
   */
  getStatus(): { isTracking: boolean; pointsCount: number; sessionId: string | null } {
    return {
      isTracking: this.isTracking,
      pointsCount: this.coordinates.length,
      sessionId: this.sessionId
    };
  }

  /**
   * Calculate route statistics
   * Best practice: Comprehensive metrics for endurance activities
   */
  calculateRouteStats(): RouteStats {
    if (this.coordinates.length < 2) {
      return {
        totalDistance: 0,
        avgPace: 0,
        avgSpeed: 0,
        elevationGain: 0,
        elevationLoss: 0,
        maxSpeed: 0,
        duration: 0
      };
    }

    const totalDistance = this.calculateTotalDistance();
    const duration = (Date.now() - this.startTime) / 1000; // seconds

    // Calculate elevation changes
    const { elevationGain, elevationLoss } = this.calculateElevationChanges();

    // Calculate max speed
    const maxSpeed = this.calculateMaxSpeed();

    // Calculate average speed (km/h)
    const avgSpeed = duration > 0 ? (totalDistance / 1000) / (duration / 3600) : 0;

    // Calculate average pace (min/km)
    const avgPace = avgSpeed > 0 ? 60 / avgSpeed : 0;

    return {
      totalDistance,
      avgPace,
      avgSpeed,
      elevationGain,
      elevationLoss,
      maxSpeed,
      duration
    };
  }

  /**
   * Calculate total distance using Haversine formula
   */
  private calculateTotalDistance(): number {
    let totalDistance = 0;

    for (let i = 0; i < this.coordinates.length - 1; i++) {
      const coord1 = this.coordinates[i];
      const coord2 = this.coordinates[i + 1];

      const distance = this.calculateDistance(
        coord1.lat,
        coord1.lng,
        coord2.lat,
        coord2.lng
      );

      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Haversine formula for distance between two coordinates
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate elevation gain and loss
   */
  private calculateElevationChanges(): { elevationGain: number; elevationLoss: number } {
    let elevationGain = 0;
    let elevationLoss = 0;

    for (let i = 0; i < this.coordinates.length - 1; i++) {
      const alt1 = this.coordinates[i].altitude;
      const alt2 = this.coordinates[i + 1].altitude;

      if (alt1 !== undefined && alt2 !== undefined) {
        const diff = alt2 - alt1;
        if (diff > 0) {
          elevationGain += diff;
        } else {
          elevationLoss += Math.abs(diff);
        }
      }
    }

    return { elevationGain, elevationLoss };
  }

  /**
   * Calculate maximum speed
   */
  private calculateMaxSpeed(): number {
    let maxSpeed = 0;

    for (const coord of this.coordinates) {
      if (coord.speed !== undefined) {
        // Convert m/s to km/h
        const speedKmh = coord.speed * 3.6;
        if (speedKmh > maxSpeed) {
          maxSpeed = speedKmh;
        }
      }
    }

    return maxSpeed;
  }

  /**
   * Add heart rate to current position
   * Called from wearable integration
   */
  addHeartRateToCurrentPosition(heartRate: number): void {
    if (this.coordinates.length > 0) {
      const lastCoord = this.coordinates[this.coordinates.length - 1];
      lastCoord.heartRate = heartRate;
    }
  }

  /**
   * Export route as GeoJSON (standard format)
   */
  exportAsGeoJSON(): object {
    return {
      type: 'Feature',
      properties: {
        sessionId: this.sessionId,
        startTime: this.startTime,
        stats: this.calculateRouteStats()
      },
      geometry: {
        type: 'LineString',
        coordinates: this.coordinates.map(coord => [
          coord.lng,
          coord.lat,
          coord.altitude ?? 0
        ])
      }
    };
  }

  /**
   * Clear all data (for testing or reset)
   */
  reset(): void {
    this.stopTracking();
    this.coordinates = [];
    this.sessionId = null;
    this.startTime = 0;
    this.lastPosition = null;
    logger.info('GPS_TRACKING', 'Service reset');
  }
}

export const gpsTrackingService = new GPSTrackingService();
