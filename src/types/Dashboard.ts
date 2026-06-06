export interface NdviPoint {
  label: string;
  value: number;
}

export interface Dashboard {
  farmsCount: number;
  cropAreasCount: number;
  activeSensors: number;
  openAlerts: number;
  avgNdvi: number;
  generalStatus: string;
  ndviHistory: NdviPoint[];
  recentAlerts: Array<{
    id: number;
    title: string;
    severity: string;
    createdAt: string;
  }>;
  criticalCropAreas: Array<{
    id: number;
    name: string;
    status: string;
    ndvi?: number;
  }>;
}
