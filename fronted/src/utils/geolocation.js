import { googleApisService } from '../api/services/googleApis.service';

/**
 * Reverse geocode latitude and longitude into a structured address.
 * Primary: Google Maps Geocoding API via backend proxy
 * Fallback 1: OpenStreetMap Nominatim
 * Fallback 2: Formatted GPS coordinate string
 *
 * @param {number|string} lat
 * @param {number|string} lng
 * @returns {Promise<{
 *   address: string,
 *   location: string,
 *   city: string,
 *   state: string,
 *   pincode: string,
 *   country: string,
 *   placeId: string,
 *   latitude: number,
 *   longitude: number,
 * }>}
 */
export async function reverseGeocodeCoords(lat, lng) {
  const numLat = parseFloat(Number(lat).toFixed(7));
  const numLng = parseFloat(Number(lng).toFixed(7));

  // 1. Primary: Google Geocoding API via backend
  try {
    const res = await googleApisService.demoGeocode({ lat: numLat, lng: numLng });
    const firstMatch = res?.firstMatch || res?.results?.[0];
    if (firstMatch && firstMatch.formatted_address) {
      const comps = firstMatch.address_components || [];
      const getComp = (...types) => {
        const comp = comps.find((c) => c.types && types.some((t) => c.types.includes(t)));
        return comp?.long_name || comp?.short_name || '';
      };

      const city =
        getComp('locality', 'sublocality_level_1', 'sublocality', 'administrative_area_level_3') || '';
      const state = getComp('administrative_area_level_1') || '';
      const pincode = getComp('postal_code') || '';
      const country = getComp('country') || 'India';
      const fullAddress = firstMatch.formatted_address || '';
      const placeId = firstMatch.place_id || '';

      return {
        address: fullAddress,
        location: fullAddress,
        city,
        state,
        pincode,
        country,
        placeId,
        latitude: numLat,
        longitude: numLng,
      };
    }
  } catch (err) {
    console.warn('[ReverseGeocode] Google reverse geocode error:', err?.message || err);
  }

  // 2. Fallback 1: OpenStreetMap Nominatim reverse geocode
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${numLat}&lon=${numLng}`;
    const resp = await fetch(nomUrl, { headers: { Accept: 'application/json' } });
    if (resp.ok) {
      const nomData = await resp.json();
      if (nomData && nomData.display_name) {
        const addr = nomData.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';
        const country = addr.country || 'India';
        const fullAddress = nomData.display_name;

        return {
          address: fullAddress,
          location: fullAddress,
          city,
          state,
          pincode,
          country,
          placeId: String(nomData.place_id || ''),
          latitude: numLat,
          longitude: numLng,
        };
      }
    }
  } catch (nomErr) {
    console.warn('[ReverseGeocode] Nominatim fallback error:', nomErr?.message || nomErr);
  }

  // 3. Fallback 2: Clean coordinate string so address/location is NEVER empty
  const fallbackStr = `GPS Location (${numLat.toFixed(5)}, ${numLng.toFixed(5)})`;
  return {
    address: fallbackStr,
    location: fallbackStr,
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    placeId: '',
    latitude: numLat,
    longitude: numLng,
  };
}

/**
 * Browser geolocation Promise wrapper
 */
export function getBrowserPosition(options = { enableHighAccuracy: true, timeout: 10000 }) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}
