import { PolygonPoint } from '../types/CropArea';

/**
 * Constroi o Geojson do poligono
 */
export function buildGeoJsonPolygon(
  points: PolygonPoint[],
): { type: 'Polygon'; coordinates: number[][][] } | null {
  if (points.length < 3) return null;

  const coords = points.map((p) => [p.longitude, p.latitude]);
  coords.push([points[0].longitude, points[0].latitude]);

  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

export function calculateCentroid(
  points: PolygonPoint[],
): PolygonPoint | null {
  if (points.length === 0) return null;

  const sumLat = points.reduce((acc, p) => acc + p.latitude, 0);
  const sumLng = points.reduce((acc, p) => acc + p.longitude, 0);

  return {
    latitude: sumLat / points.length,
    longitude: sumLng / points.length,
  };
}

/**
 * converte Geojson em um Json
 */
export function geoJsonToString(
  geoJson: { type: 'Polygon'; coordinates: number[][][] } | null,
): string {
  if (!geoJson) return '';
  return JSON.stringify(geoJson, null, 2);
}
