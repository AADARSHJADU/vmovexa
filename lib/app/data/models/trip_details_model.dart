import 'package:flutter/material.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/government_models.dart';

class TripWaypoint {
  final String time;
  final String title;
  final String subtitle;
  final bool isCompleted;
  final bool isActive;
  final bool isLast;

  TripWaypoint({
    required this.time,
    required this.title,
    required this.subtitle,
    this.isCompleted = false,
    this.isActive = false,
    this.isLast = false,
  });
}

class TripDetailsModel {
  final String id;
  final String code;
  final String status; // 'in_progress', 'completed', 'scheduled', 'cancelled'
  final String origin;
  final String destination;
  final double totalDistance;
  final double coveredDistance;
  final int progressPercent;
  final String eta;
  final double currentSpeed;
  final double avgSpeed;
  final double maxSpeed;
  final String punctuality;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final String vehicleName;
  final String vehicleModel;
  final String vehiclePlate;
  final String fuelType;
  final String gpsStatus;
  final double? lat;
  final double? lng;
  final String driverName;
  final String driverPhone;
  final String driverLicense;
  final String driverRating;
  final int driverTripsCount;
  final List<TripWaypoint> waypoints;

  TripDetailsModel({
    required this.id,
    required this.code,
    this.status = 'in_progress',
    this.origin = 'Central Transit Depot',
    this.destination = 'Metro Junction Terminal',
    this.totalDistance = 18.6,
    this.coveredDistance = 8.4,
    this.progressPercent = 45,
    this.eta = '18 mins',
    this.currentSpeed = 38.0,
    this.avgSpeed = 32.0,
    this.maxSpeed = 55.0,
    this.punctuality = 'On Schedule',
    this.startedAt,
    this.completedAt,
    this.vehicleName = 'Transit Bus',
    this.vehicleModel = 'Volvo 8400 Electric',
    this.vehiclePlate = 'MP-04-TR-4912',
    this.fuelType = 'Electric (EV)',
    this.gpsStatus = 'ONLINE',
    this.lat,
    this.lng,
    this.driverName = 'Transit Operator',
    this.driverPhone = '+91 98765 43210',
    this.driverLicense = 'DL-MP04-2022-004921',
    this.driverRating = '4.9',
    this.driverTripsCount = 1420,
    this.waypoints = const [],
  });

  double get remainingDistance => (totalDistance - coveredDistance).clamp(0.0, totalDistance);

  Color get statusColor {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'active':
        return const Color(0xFF10B981);
      case 'completed':
        return const Color(0xFF3B82F6);
      case 'scheduled':
        return const Color(0xFFF59E0B);
      default:
        return const Color(0xFF64748B);
    }
  }

  String get displayStatus {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'active':
        return 'Trip Active';
      case 'completed':
        return 'Trip Completed';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status.toUpperCase();
    }
  }

  String get displayStartTime {
    if (startedAt != null) {
      final hour = startedAt!.hour % 12 == 0 ? 12 : startedAt!.hour % 12;
      final minute = startedAt!.minute.toString().padLeft(2, '0');
      final period = startedAt!.hour >= 12 ? 'PM' : 'AM';
      return '$hour:$minute $period';
    }
    return '08:15 AM';
  }

  factory TripDetailsModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return TripDetailsModel(id: '', code: 'TRIP-001');

    final vehMap = json['vehicle'] is Map ? json['vehicle'] as Map : null;
    final drvMap = json['driver'] is Map ? json['driver'] as Map : null;
    final routeMap = json['route'] is Map ? json['route'] as Map : null;

    double parseD(dynamic v, double fallback) {
      if (v == null) return fallback;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? fallback;
    }

    int parseI(dynamic v, int fallback) {
      if (v == null) return fallback;
      if (v is num) return v.toInt();
      return int.tryParse(v.toString()) ?? fallback;
    }

    DateTime? parseDate(dynamic v) {
      if (v == null) return null;
      try {
        return DateTime.parse(v.toString());
      } catch (_) {
        return null;
      }
    }

    final totalD = parseD(json['distance_km'] ?? json['total_distance'] ?? routeMap?['distance_km'], 18.4);
    final covD = parseD(json['covered_km'] ?? json['distance_covered'], totalD * 0.45);
    final progress = parseI(
      json['progress_percent'] ?? json['progress'],
      totalD > 0 ? ((covD / totalD) * 100).round() : 45,
    );

    final rawPlate = vehMap?['bus_number']?.toString() ??
        vehMap?['registration_number']?.toString() ??
        json['vehicle_id']?.toString() ??
        'MP-04-TR-4912';

    final rawDriver = drvMap?['name']?.toString() ??
        json['driver_name']?.toString() ??
        'Rajesh Kumar';

    final originStation = json['origin']?.toString() ??
        routeMap?['start_point']?.toString() ??
        'Central Bus Terminal';

    final destStation = json['destination']?.toString() ??
        routeMap?['end_point']?.toString() ??
        'Metro Junction';

    final rawLat = parseD(vehMap?['lat'] ?? vehMap?['latitude'] ?? json['lat'], 23.2350);
    final rawLng = parseD(vehMap?['lng'] ?? vehMap?['longitude'] ?? json['lng'], 77.4150);

    return TripDetailsModel(
      id: json['id']?.toString() ?? '1',
      code: json['code']?.toString() ?? 'TRIP-${json["id"] ?? "0042"}',
      status: json['status']?.toString() ?? 'in_progress',
      origin: originStation,
      destination: destStation,
      totalDistance: totalD,
      coveredDistance: covD,
      progressPercent: progress,
      eta: json['eta']?.toString() ?? '18 mins',
      currentSpeed: parseD(json['current_speed'] ?? vehMap?['speed'], 38.0),
      avgSpeed: parseD(json['avg_speed'], 32.0),
      maxSpeed: parseD(json['max_speed'], 56.0),
      punctuality: json['punctuality_status']?.toString() ?? 'On Schedule',
      startedAt: parseDate(json['started_at'] ?? json['start_time']),
      completedAt: parseDate(json['completed_at'] ?? json['end_time']),
      vehicleName: rawPlate,
      vehicleModel: vehMap?['model']?.toString() ?? 'Transit Fleet EV',
      vehiclePlate: rawPlate,
      fuelType: vehMap?['fuel_type']?.toString() ?? 'Electric (EV)',
      gpsStatus: vehMap?['gps_status']?.toString() ?? 'ONLINE',
      lat: rawLat,
      lng: rawLng,
      driverName: rawDriver,
      driverPhone: drvMap?['phone']?.toString() ?? '+91 98765 43210',
      driverLicense: drvMap?['license_number']?.toString() ?? 'DL-MP04-2022-004921',
      driverRating: drvMap?['rating']?.toString() ?? '4.8',
      driverTripsCount: parseI(drvMap?['trips_completed'], 1420),
      waypoints: [
        TripWaypoint(time: '08:15 AM', title: 'Trip Departed', subtitle: originStation, isCompleted: true),
        TripWaypoint(time: '08:35 AM', title: 'Corridor Checkpoint A', subtitle: 'Transit Hub 1', isCompleted: true),
        TripWaypoint(time: '08:50 AM', title: 'Midway Station', subtitle: 'City Center Corridor', isCompleted: true),
        TripWaypoint(time: '09:05 AM', title: 'Current Position', subtitle: 'En Route to Terminal', isActive: true),
        TripWaypoint(time: '09:25 AM', title: 'Destination', subtitle: destStation, isLast: true),
      ],
    );
  }

  factory TripDetailsModel.fromVehicle(LiveTrackingVehicle v, {String? customRoute}) {
    final routeName = customRoute ?? v.displayRoute;
    final parts = routeName.split('–').map((p) => p.trim()).toList();
    final originStation = parts.isNotEmpty ? parts.first : 'Origin Depot';
    final destStation = parts.length > 1 ? parts.last : 'Terminal Station';

    return TripDetailsModel(
      id: v.id,
      code: 'TRIP-${v.busNumber.replaceAll(RegExp(r"[^A-Za-z0-9]"), "").toUpperCase()}',
      status: v.screenStatus.toLowerCase() == 'broadcasting' ? 'in_progress' : 'completed',
      origin: originStation,
      destination: destStation,
      totalDistance: 16.5,
      coveredDistance: 9.8,
      progressPercent: 59,
      eta: '14 mins',
      currentSpeed: v.speed ?? 42.0,
      avgSpeed: 34.0,
      maxSpeed: 52.0,
      punctuality: 'On Schedule',
      startedAt: DateTime.now().subtract(const Duration(minutes: 28)),
      vehicleName: v.busNumber,
      vehicleModel: 'Transit Fleet EV',
      vehiclePlate: v.busNumber,
      fuelType: 'Electric (EV)',
      gpsStatus: v.screenStatus.toUpperCase(),
      lat: v.lat ?? 23.2350,
      lng: v.lng ?? 77.4150,
      driverName: v.displayDriver,
      driverPhone: '+91 98765 43210',
      driverLicense: 'DL-MP04-2023-008219',
      driverRating: '4.9',
      driverTripsCount: 1650,
      waypoints: [
        TripWaypoint(time: '08:10 AM', title: 'Departed Depot', subtitle: originStation, isCompleted: true),
        TripWaypoint(time: '08:24 AM', title: 'Transit Stop 01', subtitle: 'Civil Lines Crossing', isCompleted: true),
        TripWaypoint(time: '08:38 AM', title: 'Transit Stop 02', subtitle: 'Metro Interchange', isCompleted: true),
        TripWaypoint(time: 'Just now', title: 'Current GPS Telemetry', subtitle: 'Live on $routeName', isActive: true),
        TripWaypoint(time: 'ETA 14m', title: 'Destination Terminal', subtitle: destStation, isLast: true),
      ],
    );
  }

  String buildGoogleStaticMapUrl({int zoom = 13, int width = 500, int height = 300}) {
    final effectiveLat = lat ?? 23.2350;
    final effectiveLng = lng ?? 77.4150;

    final markers = [
      GoogleMapMarker(lat: effectiveLat + 0.015, lng: effectiveLng - 0.012, color: 'purple', label: 'A'),
      GoogleMapMarker(lat: effectiveLat, lng: effectiveLng, color: 'blue', label: 'B'),
      GoogleMapMarker(lat: effectiveLat - 0.018, lng: effectiveLng + 0.015, color: 'red', label: 'C'),
    ];

    return ApiConstants.buildGoogleStaticMapUrl(
      centerLat: effectiveLat,
      centerLng: effectiveLng,
      zoom: zoom,
      width: width,
      height: height,
      markers: markers,
    );
  }
}
