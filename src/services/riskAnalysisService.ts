import api from './api';
import { apiRoutes } from '../constants/apiRoutes';

export interface RiskAnalysisResult {
  cropAreaId: number;
  cropAreaName?: string;
  status?: string;
  alertGenerated?: boolean;
  alertType?: string;
  severity?: string;
  recommendation?: string;
  message?: string;
}

export const riskAnalysisService = {
  async analyze(cropAreaId: number): Promise<RiskAnalysisResult> {
    try {
      const response = await api.post(apiRoutes.riskAnalysis.analyze(cropAreaId));
      return response.data as RiskAnalysisResult;
    } catch {
      throw new Error('Não foi possível iniciar a análise de risco.');
    }
  },
};
