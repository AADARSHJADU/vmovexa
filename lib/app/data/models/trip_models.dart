class TripVehicleInfo {
  final String id;
  final String busNumber;
  final String model;
  final String vehicleType;
  final String fuelType;
  final String gpsDeviceId;
  final String gpsStatus;

  TripVehicleInfo({
    this.id = '',
    this.busNumber = '',
    this.model = '',
    this.vehicleType = 'Transit Bus',
    this.fuelType = 'electric',
    this.gpsDeviceId = '',
    this.gpsStatus = 'connected',
  });

  factory TripVehicleInfo.fromJson(Map<String, dynamic> json) {
    return TripVehicleInfo(
      id: json['id']?.toString() ?? '',
      busNumber: json['bus_number']?.toString() ??
          json['busNumber']?.toString() ??
          json['registration_number']?.toString() ??
          '—',
      model: json['model']?.toString() ?? 'Transit Vehicle',
      vehicleType: json['vehicle_type']?.toString() ?? json['vehicleType']?.toString() ?? 'Transit Bus',
      fuelType: json['fuel_type']?.toString() ?? json['fuelType']?.toString() ?? 'electric',
      gpsDeviceId: json['gps_device_id']?.toString() ??
          json['edge_device_id']?.toString() ??
          json['gps_device']?['serial_number']?.toString() ??
          'Active Onboard',
      gpsStatus: json['gps_status']?.toString() ?? 'connected',
    );
  }
}

class TripDriverInfo {
  final String id;
  final String name;
  final String phone;
  final String badgeId;
  final String dlNumber;

  TripDriverInfo({
    this.id = '',
    this.name = '',
    this.phone = '',
    this.badgeId = '',
    this.dlNumber = '',
  });

  factory TripDriverInfo.fromJson(Map<String, dynamic> json) {
    return TripDriverInfo(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Unassigned Driver',
      phone: json['phone']?.toString() ?? '',
      badgeId: json['badge_id']?.toString() ?? json['emp_id']?.toString() ?? 'DL Validated',
      dlNumber: json['dl_number']?.toString() ?? '',
    );
  }
}

class TripRouteInfo {
  final String id;
  final String name;
  final String startPoint;
  final String endPoint;
  final double? distanceKm;
  final int? totalDurationMin;

  TripRouteInfo({
    this.id = '',
    this.name = '',
    this.startPoint = '',
    this.endPoint = '',
    this.distanceKm,
    this.totalDurationMin,
  });

  factory TripRouteInfo.fromJson(Map<String, dynamic> json) {
    return TripRouteInfo(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      startPoint: json['start_point']?.toString() ?? '',
      endPoint: json['end_point']?.toString() ?? '',
      distanceKm: (json['distance_km'] ?? json['distance']) != null
          ? double.tryParse((json['distance_km'] ?? json['distance']).toString())
          : null,
      totalDurationMin: json['total_duration_min'] != null
          ? int.tryParse(json['total_duration_min'].toString())
          : null,
    );
  }
}

class TripItemModel {
  final String id;
  final String code;
  final String status; // in_progress, completed, scheduled
  final String origin;
  final String destination;
  final double distanceKm;
  final double coveredKm;
  final int progressPercent;
  final String eta;
  final String? startedAt;
  final String? endedAt;
  final double? currentSpeed;
  final double? avgSpeed;
  final String punctualityStatus;
  final String? vehicleId;
  final String? driverId;
  final String? routeId;
  final TripVehicleInfo? vehicle;
  final TripDriverInfo? driver;
  final TripRouteInfo? route;

  TripItemModel({
    required this.id,
    required this.code,
    this.status = 'scheduled',
    this.origin = 'Origin Terminal',
    this.destination = 'Destination Terminal',
    this.distanceKm = 0.0,
    this.coveredKm = 0.0,
    this.progressPercent = 0,
    this.eta = 'On Schedule',
    this.startedAt,
    this.endedAt,
    this.currentSpeed,
    this.avgSpeed,
    this.punctualityStatus = 'On Time',
    this.vehicleId,
    this.driverId,
    this.routeId,
    this.vehicle,
    this.driver,
    this.route,
  });

  factory TripItemModel.fromJson(Map<String, dynamic> json) {
    final idStr = json['id']?.toString() ?? '';
    final codeStr = json['code']?.toString() ?? (idStr.isNotEmpty ? 'TRIP-${idStr.padLeft(4, '0')}' : 'TRIP-0001');

    final dist = double.tryParse((json['distance_km'] ?? json['distance'] ?? json['route']?['distance_km'] ?? 0).toString()) ?? 0.0;
    final cov = double.tryParse((json['covered_km'] ?? 0).toString()) ?? 0.0;
    final stat = json['status']?.toString().toLowerCase() ?? 'scheduled';

    int prog = 0;
    if (json['progress_percent'] != null) {
      prog = int.tryParse(json['progress_percent'].toString()) ?? 0;
    } else if (stat == 'completed') {
      prog = 100;
    } else if (dist > 0 && cov > 0) {
      prog = ((cov / dist) * 100).round().clamp(0, 100);
    }

    TripVehicleInfo? vInfo;
    if (json['vehicle'] is Map) {
      vInfo = TripVehicleInfo.fromJson(Map<String, dynamic>.from(json['vehicle']));
    }

    TripDriverInfo? dInfo;
    if (json['driver'] is Map) {
      dInfo = TripDriverInfo.fromJson(Map<String, dynamic>.from(json['driver']));
    }

    TripRouteInfo? rInfo;
    if (json['route'] is Map) {
      rInfo = TripRouteInfo.fromJson(Map<String, dynamic>.from(json['route']));
    }

    return TripItemModel(
      id: idStr,
      code: codeStr,
      status: stat,
      origin: json['origin']?.toString() ??
          json['source']?.toString() ??
          json['route']?['start_point']?.toString() ??
          'Origin Station',
      destination: json['destination']?.toString() ??
          json['route']?['end_point']?.toString() ??
          'Destination Station',
      distanceKm: dist,
      coveredKm: cov,
      progressPercent: prog,
      eta: json['eta']?.toString() ?? (stat == 'completed' ? 'Finished' : 'On Schedule'),
      startedAt: json['started_at']?.toString() ?? json['start_time']?.toString(),
      endedAt: json['ended_at']?.toString() ?? json['end_time']?.toString(),
      currentSpeed: (json['current_speed'] ?? json['speed'] ?? json['vehicle']?['last_speed']) != null
          ? double.tryParse((json['current_speed'] ?? json['speed'] ?? json['vehicle']?['last_speed']).toString())
          : null,
      avgSpeed: (json['avg_speed'] ?? json['average_speed']) != null
          ? double.tryParse((json['avg_speed'] ?? json['average_speed']).toString())
          : null,
      punctualityStatus: json['punctuality_status']?.toString() ?? 'On Time',
      vehicleId: json['vehicle_id']?.toString() ?? json['vehicleId']?.toString(),
      driverId: json['driver_id']?.toString() ?? json['driverId']?.toString(),
      routeId: json['route_id']?.toString() ?? json['routeId']?.toString(),
      vehicle: vInfo,
      driver: dInfo,
      route: rInfo,
    );
  }
}
