/**
 * GPS Simulator
 * Generates realistic GPS coordinates for testing endurance sessions
 * Useful for desktop development without actual movement
 */

import logger from '../utils/logger';
import type { GPSCoordinate } from '../../system/services/gpsTrackingService';

export interface SimulationRoute {
  name: string;
  startLat: number;
  startLng: number;
  distance: number; // meters
  duration: number; // seconds
  elevationGain?: number; // meters
  pattern: 'linear' | 'circular' | 'loop';
}

const PREDEFINED_ROUTES: Record<string, SimulationRoute> = {
  park5k: {
    name: 'Parcours Parc 5km',
    startLat: 48.8566,
    startLng: 2.3522,
    distance: 5000,
    duration: 1800,
    elevationGain: 50,
    pattern: 'loop'
  },
  interval800m: {
    name: 'Intervalles 800m',
    startLat: 48.8566,
    startLng: 2.3522,
    distance: 800,
    duration: 240,
    elevationGain: 0,
    pattern: 'linear'
  },
  tempo10k: {
    name: 'Tempo 10km',
    startLat: 48.8566,
    startLng: 2.3522,
    distance: 10000,
    duration: 3000,
    elevationGain: 100,
    pattern: 'loop'
  },
  short1k: {
    name: 'Test 1km',
    startLat: 48.8566,
    startLng: 2.3522,
    distance: 1000,
    duration: 300,
    elevationGain: 10,
    pattern: 'circular'
  }
};

class GPSSimulator {
  private intervalId: number | null = null;
  private coordinates: GPSCoordinate[] = [];
  private currentIndex: number = 0;
  private isSimulating: boolean = false;
  private simulationRoute: SimulationRoute | null = null;
  private startTime: number = 0;

  /**
   * Start GPS simulation with a predefined route
   */
  startSimulation(routeKey: keyof typeof PREDEFINED_ROUTES = 'short1k'): void {
    if (this.isSimulating) {
      logger.warn('GPS_SIMULATOR', 'Simulation already running');
      return;
    }

    this.simulationRoute = PREDEFINED_ROUTES[routeKey];
    if (!this.simulationRoute) {
      logger.error('GPS_SIMULATOR', 'Invalid route key', { routeKey });
      return;
    }

    this.coordinates = this.generateRouteCoordinates(this.simulationRoute);
    this.currentIndex = 0;
    this.isSimulating = true;
    this.startTime = Date.now();

    logger.info('GPS_SIMULATOR', 'Simulation started', {
      route: this.simulationRoute.name,
      totalPoints: this.coordinates.length,
      distance: this.simulationRoute.distance,
      duration: this.simulationRoute.duration
    });

    // Simulate position updates every 3 seconds
    this.intervalId = window.setInterval(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.coordinates.length) {
        this.stopSimulation();
      }
    }, 3000);
  }

  /**
   * Stop GPS simulation
   */
  stopSimulation(): GPSCoordinate[] {
    if (!this.isSimulating) {
      logger.warn('GPS_SIMULATOR', 'No simulation running');
      return [];
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isSimulating = false;

    logger.info('GPS_SIMULATOR', 'Simulation stopped', {
      pointsGenerated: this.currentIndex,
      totalPoints: this.coordinates.length,
      duration: (Date.now() - this.startTime) / 1000
    });

    return this.getCurrentCoordinates();
  }

  /**
   * Get current coordinates up to current index
   */
  getCurrentCoordinates(): GPSCoordinate[] {
    return this.coordinates.slice(0, this.currentIndex + 1);
  }

  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this.isSimulating;
  }

  /**
   * Get simulation status
   */
  getStatus(): {
    isRunning: boolean;
    currentIndex: number;
    totalPoints: number;
    routeName: string | null;
    progress: number;
  } {
    return {
      isRunning: this.isSimulating,
      currentIndex: this.currentIndex,
      totalPoints: this.coordinates.length,
      routeName: this.simulationRoute?.name || null,
      progress: this.coordinates.length > 0 ? (this.currentIndex / this.coordinates.length) * 100 : 0
    };
  }

  /**
   * Generate coordinates for a route
   */
  private generateRouteCoordinates(route: SimulationRoute): GPSCoordinate[] {
    const coords: GPSCoordinate[] = [];
    const pointsCount = Math.floor(route.duration / 3); // One point every 3 seconds
    const startTime = Date.now();

    logger.info('GPS_SIMULATOR', 'Generating route', {
      route: route.name,
      pointsCount,
      pattern: route.pattern
    });

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      const timestamp = startTime + (i * 3000);

      let lat: number;
      let lng: number;

      if (route.pattern === 'linear') {
        // Linear route: straight line
        const metersPerPoint = route.distance / pointsCount;
        const latOffset = (metersPerPoint * i) / 111320; // 1 degree lat = ~111320 meters
        lat = route.startLat + latOffset;
        lng = route.startLng;
      } else if (route.pattern === 'circular') {
        // Circular route: circle around start point
        const radius = route.distance / (2 * Math.PI);
        const radiusInDegrees = radius / 111320;
        const angle = (progress * 2 * Math.PI);
        lat = route.startLat + (radiusInDegrees * Math.cos(angle));
        lng = route.startLng + (radiusInDegrees * Math.sin(angle) / Math.cos(route.startLat * Math.PI / 180));
      } else {
        // Loop route: figure-8 pattern
        const radius = route.distance / (4 * Math.PI);
        const radiusInDegrees = radius / 111320;
        const angle = (progress * 4 * Math.PI);
        lat = route.startLat + (radiusInDegrees * Math.sin(angle));
        lng = route.startLng + (radiusInDegrees * Math.sin(2 * angle) / Math.cos(route.startLat * Math.PI / 180));
      }

      // Calculate speed in m/s
      const speed = route.distance / route.duration;

      // Calculate altitude with gentle variation
      let altitude = 100;
      if (route.elevationGain && route.elevationGain > 0) {
        altitude = 100 + (route.elevationGain * Math.sin(progress * Math.PI));
      }

      // Realistic accuracy variation (5-30 meters)
      const accuracy = 5 + Math.random() * 25;

      coords.push({
        lat,
        lng,
        timestamp,
        altitude,
        speed,
        accuracy
      });
    }

    return coords;
  }

  /**
   * Get list of available routes
   */
  getAvailableRoutes(): Array<{ key: string; name: string; distance: number; duration: number }> {
    return Object.entries(PREDEFINED_ROUTES).map(([key, route]) => ({
      key,
      name: route.name,
      distance: route.distance,
      duration: route.duration
    }));
  }

  /**
   * Reset simulator
   */
  reset(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.coordinates = [];
    this.currentIndex = 0;
    this.isSimulating = false;
    this.simulationRoute = null;
    logger.info('GPS_SIMULATOR', 'Simulator reset');
  }
}

export const gpsSimulator = new GPSSimulator();
