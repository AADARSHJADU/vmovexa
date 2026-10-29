// lib/app/data/models/government_models.dart
import 'package:flutter/material.dart';
import '../constants/api_constants.dart';

/// Represents a Public / Government Campaign
class GovCampaignModel {
  final String? id;
  final String? code;
  final String? title;
  final String? name;
  final String? description;
  final String? ownerType;
  final String? status; // 'live', 'active', 'pending_approval', 'scheduled', 'completed', 'rejected', 'paused'
  final String? priority; // 'low', 'normal', 'high', 'emergency'
  final List<String>? activeDays;
  final String? broadcastStartTime;
  final String? broadcastEndTime;
  final String? mediaUrl;
  final String? contentType; // 'image', 'video', 'pdf', 'youtube'
  final int? impressions;
  final int? reach;
  final int? clicks;
  final int? qrScansCount;
  final int? qrUniqueScanners;
  final String? qrScanRate;
  final String? qrCodeId;
  final String? qrRedirectUrl;
  final DateTime? startDate;
  final DateTime? endDate;
  final DateTime? createdAt;
  final List<Map<String, dynamic>>? targets;
  final String? category;
  final String? targetArea;

  GovCampaignModel({
    this.id,
    this.code,
    this.title,
    this.name,
    this.description,
    this.ownerType,
    this.status,
    this.priority,
    this.activeDays,
    this.broadcastStartTime,
    this.broadcastEndTime,
    this.mediaUrl,
    this.contentType,
    this.impressions,
    this.reach,
    this.clicks,
    this.qrScansCount,
    this.qrUniqueScanners,
    this.qrScanRate,
    this.qrCodeId,
    this.qrRedirectUrl,
    this.startDate,
    this.endDate,
    this.createdAt,
    this.targets,
    this.category,
    this.targetArea,
  });

  factory GovCampaignModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return GovCampaignModel();

    List<String>? days;
    if (json['active_days'] is List) {
      days = (json['active_days'] as List).map((e) => e.toString()).toList();
    } else if (json['activeDays'] is List) {
      days = (json['activeDays'] as List).map((e) => e.toString()).toList();
    }

    List<Map<String, dynamic>>? targetsList;
    if (json['targets'] is List) {
      targetsList = (json['targets'] as List)
          .whereType<Map>()
          .map((m) => Map<String, dynamic>.from(m))
          .toList();
    }

    DateTime? parseDate(dynamic d) {
      if (d == null) return null;
      try {
        return DateTime.parse(d.toString());
      } catch (_) {
        return null;
      }
    }

    // Try media url from creative/media array or direct field
    String? media = json['media_url']?.toString() ??
        json['mediaUrl']?.toString() ??
        json['creative_url']?.toString() ??
        json['video_url']?.toString() ??
        json['videoUrl']?.toString();

    if ((media == null || media.isEmpty) && json['media'] is List && (json['media'] as List).isNotEmpty) {
      final firstMedia = (json['media'] as List).first;
      if (firstMedia is Map) {
        media = firstMedia['file_url']?.toString() ?? firstMedia['url']?.toString();
      }
    }

    return GovCampaignModel(
      id: json['id']?.toString(),
      code: json['code']?.toString() ?? json['id']?.toString(),
      title: json['title']?.toString() ?? json['name']?.toString(),
      name: json['name']?.toString() ?? json['title']?.toString(),
      description: json['description']?.toString(),
      ownerType: json['owner_type']?.toString() ?? json['ownerType']?.toString() ?? 'government',
      status: json['status']?.toString()?.toLowerCase(),
      priority: json['priority']?.toString(),
      activeDays: days,
      broadcastStartTime: json['broadcast_start_time']?.toString() ?? json['broadcastStartTime']?.toString(),
      broadcastEndTime: json['broadcast_end_time']?.toString() ?? json['broadcastEndTime']?.toString(),
      mediaUrl: media,
      contentType: json['content_type']?.toString() ?? json['contentType']?.toString() ?? json['media_type']?.toString(),
      impressions: int.tryParse(json['impressions_delivered']?.toString() ?? json['impressions']?.toString() ?? '0'),
      reach: int.tryParse(json['reach']?.toString() ?? '0'),
      clicks: int.tryParse(json['clicks']?.toString() ?? '0'),
      qrScansCount: int.tryParse(json['qr_scans_count']?.toString() ?? json['qr_scans']?.toString() ?? '0'),
      qrUniqueScanners: int.tryParse(json['qr_unique_scanners']?.toString() ?? '0'),
      qrScanRate: json['qr_scan_rate']?.toString(),
      qrCodeId: json['qr_code_id']?.toString() ?? json['qr_code']?.toString(),
      qrRedirectUrl: json['qr_redirect_url']?.toString() ?? json['landing_page_url']?.toString(),
      startDate: parseDate(json['start_date'] ?? json['startDate']),
      endDate: parseDate(json['end_date'] ?? json['endDate']),
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      targets: targetsList,
      category: json['category']?.toString() ?? 'Public Awareness',
      targetArea: json['target_area']?.toString() ?? json['targetArea']?.toString(),
    );
  }

  String get displayName => (title != null && title!.isNotEmpty)
      ? title!
      : (name != null && name!.isNotEmpty)
          ? name!
          : 'Public Campaign ${code ?? id ?? ""}';

  String get displayDates {
    if (startDate != null && endDate != null) {
      final s = '${startDate!.day} ${_monthName(startDate!.month)} ${startDate!.year}';
      final e = '${endDate!.day} ${_monthName(endDate!.month)} ${endDate!.year}';
      return '$s – $e';
    }
    return 'Active Corridors';
  }

  static String _monthName(int month) {
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month >= 1 && month <= 12) return m[month - 1];
    return '';
  }

  String get displayLocations {
    if (targetArea != null && targetArea!.isNotEmpty) return targetArea!;
    if (targets != null && targets!.isNotEmpty) {
      final cities = targets!
          .map((t) => t['city_name']?.toString() ?? t['city']?.toString() ?? t['fleet_name']?.toString())
          .where((e) => e != null && e.isNotEmpty)
          .toSet()
          .join(', ');
      if (cities.isNotEmpty) return cities;
    }
    return 'All Transit Corridors';
  }

  int get displayCoverage {
    if (impressions != null && impressions! > 0) {
      return (impressions! % 40) + 60; // 60% - 99% range
    }
    return 75;
  }

  Color get themeColor {
    final s = (status ?? '').toLowerCase();
    if (s == 'live' || s == 'active') return const Color(0xFF10B981);
    if (s == 'pending_approval' || s == 'scheduled') return const Color(0xFF8B5CF6);
    if (s == 'emergency' || (priority ?? '').toLowerCase() == 'emergency') return const Color(0xFFEF4444);
    if (s == 'completed') return const Color(0xFF64748B);
    return const Color(0xFF3B82F6);
  }

  Color get statusColor => themeColor;

  String get resolvedMediaUrl => ApiConstants.resolveFileUrl(mediaUrl);

  // Compatibility getters for view widgets
  String get type => (priority == 'emergency' || status == 'emergency') ? 'Emergency' : 'Public Information';
  String get dates => displayDates;
  String get locations => displayLocations;
  int get coverage => displayCoverage;
  String get imagePath => resolvedMediaUrl.isNotEmpty
      ? resolvedMediaUrl
      : 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200';
}

/// Represents an Emergency Broadcast
class EmergencyBroadcastModel {
  final String? id;
  final String? title;
  final String? headline;
  final String? message;
  final String? bodyText;
  final String? authority;
  final String? severity; // 'critical', 'high', 'medium', 'low'
  final String? targetScope; // 'all', 'partial'
  final String? targetArea;
  final bool sirenSound;
  final bool audioChime;
  final bool pushNotification;
  final int? autoExpireMinutes;
  final String? mediaUrl;
  final String? mediaType;
  final String? status; // 'pending_approval', 'approved', 'rejected', 'revoked'
  final bool active;
  final DateTime? createdAt;
  final List<Map<String, dynamic>>? targets;

  EmergencyBroadcastModel({
    this.id,
    this.title,
    this.headline,
    this.message,
    this.bodyText,
    this.authority,
    this.severity,
    this.targetScope,
    this.targetArea,
    this.sirenSound = true,
    this.audioChime = true,
    this.pushNotification = true,
    this.autoExpireMinutes,
    this.mediaUrl,
    this.mediaType,
    this.status,
    this.active = true,
    this.createdAt,
    this.targets,
  });

  factory EmergencyBroadcastModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return EmergencyBroadcastModel();

    DateTime? parseDate(dynamic d) {
      if (d == null) return null;
      try {
        return DateTime.parse(d.toString());
      } catch (_) {
        return null;
      }
    }

    List<Map<String, dynamic>>? targetsList;
    if (json['targets'] is List) {
      targetsList = (json['targets'] as List)
          .whereType<Map>()
          .map((m) => Map<String, dynamic>.from(m))
          .toList();
    }

    final rawStatus = (json['status']?.toString() ?? 'approved').toLowerCase();
    final isRevoked = rawStatus == 'revoked';
    final isActive = json['active'] == true || (!isRevoked && rawStatus == 'approved');

    return EmergencyBroadcastModel(
      id: json['id']?.toString(),
      title: json['title']?.toString() ?? json['headline']?.toString() ?? 'Emergency Broadcast',
      headline: json['headline']?.toString() ?? json['title']?.toString(),
      message: json['message']?.toString() ?? json['bodyText']?.toString() ?? json['body_text']?.toString() ?? '',
      bodyText: json['bodyText']?.toString() ?? json['body_text']?.toString() ?? json['message']?.toString(),
      authority: json['authority']?.toString() ?? 'Government Authority',
      severity: json['severity']?.toString() ?? 'critical',
      targetScope: json['targetScope']?.toString() ?? json['target_scope']?.toString() ?? 'all',
      targetArea: json['targetArea']?.toString() ?? json['target_area']?.toString() ?? 'Entire Network',
      sirenSound: json['sirenSound'] == true || json['siren_sound'] == true,
      audioChime: json['audioChime'] == true || json['audio_chime'] == true || json['audio_chime_enabled'] == true,
      pushNotification: json['pushNotification'] == true || json['push_notification'] == true,
      autoExpireMinutes: int.tryParse(json['autoExpireMinutes']?.toString() ?? json['auto_expire_minutes']?.toString() ?? '360'),
      mediaUrl: json['mediaUrl']?.toString() ?? json['media_url']?.toString(),
      mediaType: json['mediaType']?.toString() ?? json['media_type']?.toString(),
      status: rawStatus,
      active: isActive,
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      targets: targetsList,
    );
  }

  Color get severityColor {
    final s = (severity ?? '').toLowerCase();
    if (s == 'critical') return const Color(0xFFEF4444);
    if (s == 'high') return const Color(0xFFF97316);
    if (s == 'medium') return const Color(0xFFF59E0B);
    return const Color(0xFF3B82F6);
  }

  String get displaySeverity => (severity ?? 'Critical').toUpperCase();

  bool get isRevocable => status != 'revoked';

  String get resolvedMediaUrl => ApiConstants.resolveFileUrl(mediaUrl);
}

/// Represents Government Agency Analytics KPI summary
class GovAnalyticsModel {
  final int totalCampaigns;
  final int activeCampaigns;
  final int pendingApprovals;
  final int completedCampaigns;
  final int emergencyBroadcasts;
  final int totalImpressions;
  final int totalScans;
  final int totalVehicles;
  final int monitoredBuses;
  final int averageReach;

  GovAnalyticsModel({
    this.totalCampaigns = 0,
    this.activeCampaigns = 0,
    this.pendingApprovals = 0,
    this.completedCampaigns = 0,
    this.emergencyBroadcasts = 0,
    this.totalImpressions = 0,
    this.totalScans = 0,
    this.totalVehicles = 0,
    this.monitoredBuses = 0,
    this.averageReach = 84,
  });

  factory GovAnalyticsModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return GovAnalyticsModel();

    final kpis = json['kpis'] is Map ? Map<String, dynamic>.from(json['kpis']) : json;

    return GovAnalyticsModel(
      totalCampaigns: int.tryParse(kpis['totalCampaigns']?.toString() ?? '0') ?? 0,
      activeCampaigns: int.tryParse(kpis['activeCampaigns']?.toString() ?? '0') ?? 0,
      pendingApprovals: int.tryParse(kpis['pendingApprovals']?.toString() ?? '0') ?? 0,
      completedCampaigns: int.tryParse(kpis['completedCampaigns']?.toString() ?? '0') ?? 0,
      emergencyBroadcasts: int.tryParse(kpis['emergencyBroadcasts']?.toString() ?? '0') ?? 0,
      totalImpressions: int.tryParse(kpis['totalImpressions']?.toString() ?? '0') ?? 0,
      totalScans: int.tryParse(kpis['totalScans']?.toString() ?? '0') ?? 0,
      totalVehicles: int.tryParse(kpis['totalVehicles']?.toString() ?? kpis['monitoredBuses']?.toString() ?? '0') ?? 0,
      monitoredBuses: int.tryParse(kpis['monitoredBuses']?.toString() ?? '0') ?? 0,
      averageReach: int.tryParse(kpis['averageReach']?.toString() ?? '84') ?? 84,
    );
  }
}

/// Represents Live Transit Tracking Vehicle
class LiveTrackingVehicle {
  final String id;
  final String? registrationNumber;
  final double? lat;
  final double? lng;
  final double? speed;
  final String screenStatus; // 'Broadcasting', 'Standby', 'Offline'
  final String? routeId;
  final String? routeName;
  final String? driverName;
  final String? lastUpdated;

  LiveTrackingVehicle({
    required this.id,
    this.registrationNumber,
    this.lat,
    this.lng,
    this.speed,
    this.screenStatus = 'Broadcasting',
    this.routeId,
    this.routeName,
    this.driverName,
    this.lastUpdated,
  });

  factory LiveTrackingVehicle.fromJson(Map<String, dynamic>? json) {
    if (json == null) return LiveTrackingVehicle(id: '');

    double? parseD(dynamic v) {
      if (v == null) return null;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString());
    }

    return LiveTrackingVehicle(
      id: json['id']?.toString() ?? json['vehicle_id']?.toString() ?? 'BUS',
      registrationNumber: json['registration_number']?.toString() ?? json['registrationNumber']?.toString() ?? json['id']?.toString(),
      lat: parseD(json['lat'] ?? json['latitude']),
      lng: parseD(json['lng'] ?? json['longitude']),
      speed: parseD(json['speed']),
      screenStatus: json['screenStatus']?.toString() ?? json['screen_status']?.toString() ?? 'Broadcasting',
      routeId: json['routeId']?.toString() ?? json['route_id']?.toString(),
      routeName: json['routeName']?.toString() ?? json['route_name']?.toString() ?? 'Metro Transit Route',
      driverName: json['driverName']?.toString() ?? json['driver_name']?.toString(),
      lastUpdated: json['lastUpdated']?.toString() ?? json['updated_at']?.toString(),
    );
  }

  Color get statusColor {
    if (screenStatus == 'Broadcasting') return const Color(0xFF10B981);
    if (screenStatus == 'Standby') return const Color(0xFFF59E0B);
    return const Color(0xFF64748B);
  }

  String get busNumber => registrationNumber ?? id;
  String get status => screenStatus;
  bool get isActive => screenStatus.toLowerCase() == 'broadcasting' || screenStatus.toLowerCase() == 'active';
  String get displaySpeed => speed != null ? '${speed!.toStringAsFixed(0)} km/h' : '0 km/h';
  String get displayDriver => (driverName != null && driverName!.isNotEmpty) ? driverName! : 'Transit Operator';
  String get displayRoute => (routeName != null && routeName!.isNotEmpty) ? routeName! : 'Metro Transit Corridor';
}

/// Represents Live Tracking Aggregate Data
class LiveTrackingDataModel {
  final List<LiveTrackingVehicle> vehicles;
  final int total;
  final int broadcasting;
  final int standby;
  final int offline;
  final int withGps;

  LiveTrackingDataModel({
    this.vehicles = const [],
    this.total = 0,
    this.broadcasting = 0,
    this.standby = 0,
    this.offline = 0,
    this.withGps = 0,
  });

  factory LiveTrackingDataModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return LiveTrackingDataModel();

    final vList = <LiveTrackingVehicle>[];
    if (json['vehicles'] is List) {
      for (final item in json['vehicles']) {
        if (item is Map) {
          vList.add(LiveTrackingVehicle.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }

    final stats = json['stats'] is Map ? Map<String, dynamic>.from(json['stats']) : {};

    return LiveTrackingDataModel(
      vehicles: vList,
      total: int.tryParse(stats['total']?.toString() ?? vList.length.toString()) ?? vList.length,
      broadcasting: int.tryParse(stats['broadcasting']?.toString() ?? '0') ?? vList.where((v) => v.screenStatus == 'Broadcasting').length,
      standby: int.tryParse(stats['standby']?.toString() ?? '0') ?? vList.where((v) => v.screenStatus == 'Standby').length,
      offline: int.tryParse(stats['offline']?.toString() ?? '0') ?? vList.where((v) => v.screenStatus == 'Offline').length,
      withGps: int.tryParse(stats['withGps']?.toString() ?? stats['with_gps']?.toString() ?? '0') ?? vList.where((v) => v.lat != null && v.lng != null).length,
    );
  }
}

/// Represents a Route for Tracking filter
class TrackingRouteModel {
  final String id;
  final String name;
  final String? code;
  final String? city;

  TrackingRouteModel({
    required this.id,
    required this.name,
    this.code,
    this.city,
  });

  factory TrackingRouteModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return TrackingRouteModel(id: '', name: '');
    return TrackingRouteModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['routeName']?.toString() ?? 'Route',
      code: json['code']?.toString(),
      city: json['city']?.toString(),
    );
  }
}
