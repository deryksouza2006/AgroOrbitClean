export interface SensorReading {
  id: number;
  sensorId: number;
  temperature?: number;
  airHumidity?: number;
  soilMoisture?: number;
  manualAlert?: boolean;
  readingDate: string;
}
