export type FarmStatus = 'HEALTHY' | 'ATTENTION' | 'CRITICAL';

export interface Farm {
  id: number;
  name: string;
  responsibleName: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  status: FarmStatus;
  cropAreasCount?: number;
  ownerId?: number;
  userId?: number;
}
