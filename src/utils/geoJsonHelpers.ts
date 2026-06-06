import { PolygonPoint } from '../types/CropArea';

/**
 * Builds a GeoJSON Polygon geometry from an array of PolygonPoint.
 * Coordinates follow GeoJSON convention: [longitude, latitude].
 * The first point is repeated at the end to close the ring.
 */
export function buildGeoJsonPolygon(
  points: PolygonPoint[],
): { type: 'Polygon'; coordinates: number[][][] } | null {
  if (points.length < 3) return null;

  const coords = points.map((p) => [p.longitude, p.latitude]);
  // Close the ring by repeating the first coordinate
  coords.push([points[0].longitude, points[0].latitude]);

  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

/**
 * Calculates the centroid (geometric center) of a set of polygon points.
 */
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
 * Serializes a GeoJSON Polygon to a formatted JSON string.
 */
export function geoJsonToString(
  geoJson: { type: 'Polygon'; coordinates: number[][][] } | null,
): string {
  if (!geoJson) return '';
  return JSON.stringify(geoJson, null, 2);
}
