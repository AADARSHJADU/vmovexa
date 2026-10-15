/**
 * Decodes a Google Maps encoded polyline string into an array of [latitude, longitude] pairs for Leaflet.
 * Compatible with Google Routes API & Directions API polyline format.
 *
 * @param {string} encoded - Google encoded polyline string
 * @returns {Array<[number, number]>} Array of [lat, lng]
 */
export function decodePolyline(encoded) {
  if (!encoded || typeof encoded !== 'string') return [];
  
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  try {
    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push([lat / 1e5, lng / 1e5]);
    }
  } catch (err) {
    console.warn('Failed to decode polyline:', err);
    return [];
  }

  return poly;
}
