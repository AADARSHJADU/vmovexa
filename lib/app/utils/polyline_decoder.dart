import 'package:latlong2/latlong.dart';

/// Decodes a Google Maps encoded polyline string into an array of [LatLng] points.
/// Compatible with Google Routes API, Directions API, and backend route polyline storage.
List<LatLng> decodePolyline(String? encoded) {
  if (encoded == null || encoded.trim().isEmpty) return [];

  final List<LatLng> points = [];
  int index = 0;
  final int len = encoded.length;
  int lat = 0;
  int lng = 0;

  try {
    while (index < len) {
      int b;
      int shift = 0;
      int result = 0;
      do {
        if (index >= len) break;
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      final int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        if (index >= len) break;
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      final int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng(lat / 1e5, lng / 1e5));
    }
  } catch (_) {
    return points;
  }

  return points;
}
