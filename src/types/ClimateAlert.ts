export type AlertType = 'DROUGHT_RISK' | 'FIRE_RISK' | 'VEGETATIVE_STRESS' | 'CRITICAL_SENSOR';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'IN_ANALYSIS' | 'RESOLVED';

export interface ClimateAlert {
  id: number;
  title: string;
  description?: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  cropAreaId?: number;
  createdAt: string;
}
