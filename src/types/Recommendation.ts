export type RecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Recommendation {
  id: number;
  title: string;
  description?: string;
  priority: RecommendationPriority;
  completed: boolean;
  relatedAlertId?: number;
  cropAreaId?: number;
}
