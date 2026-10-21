class TelemetryPositionModel {
  final double lat;
  final double lng;
  final double? speed;
  final int? heading;
  final int? satellites;
  final String? recordedAt;

  TelemetryPositionModel({
    required this.lat,
    required this.lng,
    this.speed,
    this.heading,
    this.satellites,
    this.recordedAt,
  });

  factory TelemetryPositionModel.fromJson(Map<String, dynamic> json) {
    return TelemetryPositionModel(
      lat: double.tryParse((json['lat'] ?? json['latitude'] ?? 0).toString()) ?? 0.0,
      lng: double.tryParse((json['lng'] ?? json['longitude'] ?? 0).toString()) ?? 0.0,
      speed: (json['speed'] ?? json['speed_kmh']) != null
          ? double.tryParse((json['speed'] ?? json['speed_kmh']).toString())
          : null,
      heading: (json['heading'] ?? json['bearing']) != null
          ? int.tryParse((json['heading'] ?? json['bearing']).toString())
          : null,
      satellites: (json['satellites'] ?? json['sat_count']) != null
          ? int.tryParse((json['satellites'] ?? json['sat_count']).toString())
          : null,
      recordedAt: json['recorded_at']?.toString() ?? json['recordedAt']?.toString() ?? json['at']?.toString(),
    );
  }
}

class VehicleTelemetryModel {
  final String vehicleId;
  final double? latitude;
  final double? longitude;
  final double? speedKmh;
  final String ignitionStatus;
  final int? batterySocPct;
  final double? odometerKm;
  final int? heading;
  final int? satellites;
  final List<TelemetryPositionModel> positions;
  final String? updatedAt;

  VehicleTelemetryModel({
    required this.vehicleId,
    this.latitude,
    this.longitude,
    this.speedKmh,
    this.ignitionStatus = 'ON',
    this.batterySocPct,
    this.odometerKm,
    this.heading,
    this.satellites,
    this.positions = const [],
    this.updatedAt,
  });

  factory VehicleTelemetryModel.fromJson(Map<String, dynamic> json) {
    List<TelemetryPositionModel> posList = [];
    if (json['positions'] is List) {
      posList = (json['positions'] as List)
          .whereType<Map>()
          .map((p) => TelemetryPositionModel.fromJson(Map<String, dynamic>.from(p)))
          .where((p) => p.lat != 0.0 && p.lng != 0.0)
          .toList();
    }

    final latVal = (json['latitude'] ?? json['lat']);
    final lngVal = (json['longitude'] ?? json['lng']);

    return VehicleTelemetryModel(
      vehicleId: json['vehicle_id']?.toString() ?? json['vehicleId']?.toString() ?? json['id']?.toString() ?? '',
      latitude: latVal != null ? double.tryParse(latVal.toString()) : null,
      longitude: lngVal != null ? double.tryParse(lngVal.toString()) : null,
      speedKmh: (json['speed_kmh'] ?? json['speed']) != null
          ? double.tryParse((json['speed_kmh'] ?? json['speed']).toString())
          : null,
      ignitionStatus: json['ignition_status']?.toString() ?? json['ignition']?.toString() ?? 'ON',
      batterySocPct: (json['battery_soc_pct'] ?? json['battery'] ?? json['battery_level']) != null
          ? int.tryParse((json['battery_soc_pct'] ?? json['battery'] ?? json['battery_level']).toString())
          : null,
      odometerKm: (json['odometer_km'] ?? json['odometer']) != null
          ? double.tryParse((json['odometer_km'] ?? json['odometer']).toString())
          : null,
      heading: (json['heading'] ?? json['bearing']) != null
          ? int.tryParse((json['heading'] ?? json['bearing']).toString())
          : null,
      satellites: (json['satellites'] ?? json['sat_count']) != null
          ? int.tryParse((json['satellites'] ?? json['sat_count']).toString())
          : null,
      positions: posList,
      updatedAt: json['updated_at']?.toString() ?? json['updatedAt']?.toString() ?? json['at']?.toString(),
    );
  }
}
