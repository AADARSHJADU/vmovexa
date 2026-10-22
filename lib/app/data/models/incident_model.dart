import 'package:flutter/material.dart';

class IncidentItemModel {
  final String id;
  final dynamic organizationId;
  final dynamic vehicleId;
  final dynamic driverId;
  final String incidentType;
  final String severity;
  final String status;
  final String description;
  final String? location;
  final String? landmark;
  final double? latitude;
  final double? longitude;
  final String? weatherConditions;
  final String? roadType;
  final int deadCasualty;
  final int injuredCount;
  final String? hospitalName;
  final bool ambulanceAssigned;
  final String? ambulanceTiming;
  final bool policeNotified;
  final String? policeStationName;
  final bool towingRequested;
  final String? trafficDisruptionLevel;
  final String? immediateAction;
  final List<String> photos;
  final List<String> videos;
  final bool contactedDriver;
  final String? contactNotes;
  final bool recovered;
  final String? recoveredAt;
  final String? resolutionNotes;
  final String? resolvedAt;
  final String? createdAt;
  final String? updatedAt;
  final Map<String, dynamic>? driver;
  final Map<String, dynamic>? vehicle;

  IncidentItemModel({
    required this.id,
    this.organizationId,
    this.vehicleId,
    this.driverId,
    required this.incidentType,
    this.severity = 'low',
    this.status = 'reported',
    required this.description,
    this.location,
    this.landmark,
    this.latitude,
    this.longitude,
    this.weatherConditions,
    this.roadType,
    this.deadCasualty = 0,
    this.injuredCount = 0,
    this.hospitalName,
    this.ambulanceAssigned = false,
    this.ambulanceTiming,
    this.policeNotified = false,
    this.policeStationName,
    this.towingRequested = false,
    this.trafficDisruptionLevel,
    this.immediateAction,
    this.photos = const [],
    this.videos = const [],
    this.contactedDriver = false,
    this.contactNotes,
    this.recovered = false,
    this.recoveredAt,
    this.resolutionNotes,
    this.resolvedAt,
    this.createdAt,
    this.updatedAt,
    this.driver,
    this.vehicle,
  });

  factory IncidentItemModel.fromJson(Map<String, dynamic> json) {
    // Parse photos list
    List<String> photoList = [];
    if (json['photos'] is List) {
      photoList = (json['photos'] as List).map((p) => p.toString()).toList();
    } else if (json['media_urls'] is List) {
      photoList = (json['media_urls'] as List).map((p) => p.toString()).toList();
    } else if (json['photos'] is String && json['photos'].toString().trim().isNotEmpty) {
      photoList = json['photos'].toString().split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
    }

    // Parse videos list
    List<String> videoList = [];
    if (json['videos'] is List) {
      videoList = (json['videos'] as List).map((v) => v.toString()).toList();
    }

    // Parse lat / long
    double? lat;
    if (json['latitude'] != null) {
      lat = double.tryParse(json['latitude'].toString());
    } else if (json['lat'] != null) {
      lat = double.tryParse(json['lat'].toString());
    }

    double? lng;
    if (json['longitude'] != null) {
      lng = double.tryParse(json['longitude'].toString());
    } else if (json['lng'] != null) {
      lng = double.tryParse(json['lng'].toString());
    }

    return IncidentItemModel(
      id: json['id']?.toString() ?? '',
      organizationId: json['organization_id'] ?? json['organizationId'],
      vehicleId: json['vehicle_id'] ?? json['vehicleId'] ?? json['vehicle']?['id'],
      driverId: json['driver_id'] ?? json['driverId'] ?? json['driver']?['id'],
      incidentType: json['incident_type']?.toString() ??
          json['incidentType']?.toString() ??
          json['type']?.toString() ??
          'Accident',
      severity: json['severity']?.toString().toLowerCase() ?? 'low',
      status: json['status']?.toString().toLowerCase() ?? 'reported',
      description: json['description']?.toString() ?? '',
      location: json['location']?.toString() ?? json['address']?.toString(),
      landmark: json['landmark']?.toString(),
      latitude: lat,
      longitude: lng,
      weatherConditions: json['weather_conditions']?.toString() ?? json['weatherConditions']?.toString(),
      roadType: json['road_type']?.toString() ?? json['roadType']?.toString(),
      deadCasualty: _toInt(json['dead_casualty'] ?? json['deadCasualty']),
      injuredCount: _toInt(json['injured_count'] ?? json['injuredCount']),
      hospitalName: json['hospital_name']?.toString() ?? json['hospitalName']?.toString(),
      ambulanceAssigned: _toBool(json['ambulance_assigned'] ?? json['ambulanceAssigned']),
      ambulanceTiming: json['ambulance_timing']?.toString() ?? json['ambulanceTiming']?.toString(),
      policeNotified: _toBool(json['police_notified'] ?? json['policeNotified']),
      policeStationName: json['police_station_name']?.toString() ?? json['policeStationName']?.toString(),
      towingRequested: _toBool(json['towing_requested'] ?? json['towingRequested']),
      trafficDisruptionLevel: json['traffic_disruption_level']?.toString() ?? json['trafficDisruptionLevel']?.toString(),
      immediateAction: json['immediate_action']?.toString() ?? json['immediateAction']?.toString(),
      photos: photoList,
      videos: videoList,
      contactedDriver: _toBool(json['contacted_driver'] ?? json['contactedDriver']),
      contactNotes: json['contact_notes']?.toString() ?? json['contactNotes']?.toString(),
      recovered: _toBool(json['recovered'] ?? (json['recovered_at'] != null)),
      recoveredAt: json['recovered_at']?.toString() ?? json['recoveredAt']?.toString(),
      resolutionNotes: json['resolution_notes']?.toString() ?? json['resolutionNotes']?.toString(),
      resolvedAt: json['resolved_at']?.toString() ?? json['resolvedAt']?.toString(),
      createdAt: json['created_at']?.toString() ?? json['createdAt']?.toString(),
      updatedAt: json['updated_at']?.toString() ?? json['updatedAt']?.toString(),
      driver: json['driver'] is Map ? Map<String, dynamic>.from(json['driver'] as Map) : null,
      vehicle: json['vehicle'] is Map ? Map<String, dynamic>.from(json['vehicle'] as Map) : null,
    );
  }

  static int _toInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    return int.tryParse(val.toString()) ?? 0;
  }

  static bool _toBool(dynamic val) {
    if (val == null) return false;
    if (val is bool) return val;
    if (val is int) return val == 1;
    final str = val.toString().toLowerCase();
    return str == 'true' || str == '1' || str == 'yes';
  }

  // --- UI Helpers ---
  String get displayVehicleNumber {
    if (vehicle != null) {
      return vehicle!['registration_number']?.toString() ??
          vehicle!['registrationNumber']?.toString() ??
          vehicle!['bus_number']?.toString() ??
          vehicle!['code']?.toString() ??
          'Vehicle #$vehicleId';
    }
    return vehicleId != null ? 'Vehicle #$vehicleId' : 'Unassigned';
  }

  String get displayDriverName {
    if (driver != null) {
      return driver!['name']?.toString() ??
          driver!['user']?['name']?.toString() ??
          'Driver #$driverId';
    }
    return driverId != null ? 'Driver #$driverId' : 'Unassigned';
  }

  String get displayDriverPhone {
    if (driver != null) {
      return driver!['phone']?.toString() ??
          driver!['user']?['phone']?.toString() ??
          '';
    }
    return '';
  }

  bool get isCritical => severity.toLowerCase() == 'critical';

  bool get isResolved =>
      status.toLowerCase() == 'resolved' || status.toLowerCase() == 'closed';

  Color get severityColor {
    switch (severity.toLowerCase()) {
      case 'critical':
        return const Color(0xFFEF4444);
      case 'high':
        return const Color(0xFFF97316);
      case 'medium':
        return const Color(0xFFF59E0B);
      case 'low':
      default:
        return const Color(0xFF10B981);
    }
  }

  Color get statusColor {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'closed':
        return const Color(0xFF10B981);
      case 'investigating':
      case 'recovering':
        return const Color(0xFFF59E0B);
      case 'contacted':
        return const Color(0xFF3B82F6);
      case 'reported':
      default:
        return const Color(0xFFEF4444);
    }
  }

  String get formattedStatus {
    switch (status.toLowerCase()) {
      case 'contacted':
        return 'Contacted';
      case 'investigating':
        return 'Investigating';
      case 'recovering':
        return 'Recovering';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      case 'reported':
      default:
        return 'Reported';
    }
  }
}
