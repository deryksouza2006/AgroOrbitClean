export type CropAreaStatus = 'HEALTHY' | 'ATTENTION' | 'DROUGHT_RISK' | 'CRITICAL';
export type AreaUnit = 'ha' | 'm2' | 'acre';

export type PolygonPoint = {
  latitude: number;
  longitude: number;
};

export interface CropArea {
  id: number;
  name: string;
  crop: string;
  areaSize: number;
  areaUnit: AreaUnit;
  latitude?: number;
  longitude?: number;
  polygonPoints?: PolygonPoint[];
  boundaryGeoJson?: string;
  description?: string;
  farmId: number;
  ndvi?: number;
  status: CropAreaStatus;
  lastReadingAt?: string;
}
