export interface SatelliteData {
  id: number;
  cropAreaId: number;
  source?: string;
  ndviMean: number;
  ndviMin?: number;
  ndviMax?: number;
  surfaceTemperature?: number;
  cloudCoverage?: number;
  capturedAt: string;
}
