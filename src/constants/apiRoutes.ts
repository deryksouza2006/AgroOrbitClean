export const apiRoutes = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  farms: {
    list: '/farms',
    detail: (id: number) => `/farms/${id}`,
    cropAreas: (farmId: number) => `/farms/${farmId}/crop-areas`,
  },
  cropAreas: {
    list: '/crop-areas',
    detail: (id: number) => `/crop-areas/${id}`,
    sensors: (id: number) => `/crop-areas/${id}/sensors`,
    readings: (id: number) => `/crop-areas/${id}/readings`,
    satelliteData: (id: number) => `/crop-areas/${id}/satellite-data`,
    alerts: (id: number) => `/crop-areas/${id}/alerts`,
    recommendations: (id: number) => `/crop-areas/${id}/recommendations`,
  },
  sensors: {
    list: '/sensors',
    detail: (id: number) => `/sensors/${id}`,
    readings: (id: number) => `/sensors/${id}/readings`,
  },
  sensorReadings: {
    list: '/sensor-readings',
    detail: (id: number) => `/sensor-readings/${id}`,
    byCropArea: (cropAreaId: number) => `/sensor-readings/crop-area/${cropAreaId}`,
    bySensor: (sensorId: number) => `/sensor-readings/sensor/${sensorId}`,
  },
  satelliteData: {
    list: '/satellite-data',
    detail: (id: number) => `/satellite-data/${id}`,
  },
  alerts: {
    list: '/climate-alerts',
    open: '/climate-alerts/open',
    critical: '/climate-alerts/critical',
    resolve: (id: number) => `/climate-alerts/${id}/resolve`,
  },
  recommendations: {
    list: '/recommendations',
    detail: (id: number) => `/recommendations/${id}`,
  },
  dashboard: {
    summary: '/dashboard',
  },
  riskAnalysis: {
    analyze: (cropAreaId: number) => `/risk-analysis/${cropAreaId}`,
  },
};
