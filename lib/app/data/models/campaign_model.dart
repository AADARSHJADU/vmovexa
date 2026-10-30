import 'dart:convert';
import 'package:flutter/material.dart';

List<String> _parseStringList(dynamic raw) {
  if (raw == null) return const [];
  if (raw is List) return raw.map((e) => e.toString()).toList();
  if (raw is String && raw.trim().isNotEmpty) {
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) return decoded.map((e) => e.toString()).toList();
    } catch (_) {
      return raw.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }
  }
  return const [];
}

List<int> _parseIntList(dynamic raw) {
  if (raw == null) return const [];
  if (raw is List) {
    return raw.map((e) => int.tryParse(e.toString()) ?? 0).where((e) => e > 0).toList();
  }
  if (raw is String && raw.trim().isNotEmpty) {
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded.map((e) => int.tryParse(e.toString()) ?? 0).where((e) => e > 0).toList();
      }
    } catch (_) {
      return raw.split(',').map((e) => int.tryParse(e.trim()) ?? 0).where((e) => e > 0).toList();
    }
  }
  return const [];
}

/// Represents a media asset inside a campaign payload
class CampaignMediaAsset {
  final String? fileUrl;
  final String? mediaType;
  final String? resolution;
  final int? durationSec;
  final String? fileSize;
  final String? checksum;
  final int? sequenceOrder;
  final int? displayDurationSec;
  final bool isEnabled;

  CampaignMediaAsset({
    this.fileUrl,
    this.mediaType,
    this.resolution,
    this.durationSec,
    this.fileSize,
    this.checksum,
    this.sequenceOrder,
    this.displayDurationSec,
    this.isEnabled = true,
  });

  factory CampaignMediaAsset.fromJson(Map<String, dynamic> json) {
    final en = json['isEnabled'] ?? json['is_enabled'];
    final bool parsedEnabled = en == true || en == 1 || en == '1' || en == 'true' || en == null;

    return CampaignMediaAsset(
      fileUrl: json['fileUrl']?.toString() ?? json['file_url']?.toString() ?? json['url']?.toString(),
      mediaType: json['mediaType']?.toString() ?? json['media_type']?.toString(),
      resolution: json['resolution']?.toString(),
      durationSec: int.tryParse(json['durationSec']?.toString() ?? json['duration_sec']?.toString() ?? ''),
      fileSize: json['fileSize']?.toString() ?? json['file_size']?.toString(),
      checksum: json['checksum']?.toString(),
      sequenceOrder: int.tryParse(json['sequenceOrder']?.toString() ?? json['sequence_order']?.toString() ?? ''),
      displayDurationSec: int.tryParse(json['displayDurationSec']?.toString() ?? json['display_duration_sec']?.toString() ?? ''),
      isEnabled: parsedEnabled,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (fileUrl != null) 'fileUrl': fileUrl,
      if (mediaType != null) 'mediaType': mediaType,
      if (resolution != null) 'resolution': resolution,
      if (durationSec != null) 'durationSec': durationSec,
      if (fileSize != null) 'fileSize': fileSize,
      if (checksum != null) 'checksum': checksum,
      if (sequenceOrder != null) 'sequenceOrder': sequenceOrder,
      if (displayDurationSec != null) 'displayDurationSec': displayDurationSec,
      'isEnabled': isEnabled,
    };
  }
}

/// Represents a slot scheduling specification for a campaign
class CampaignSlotConfig {
  final int? routeId;
  final int? vehicleId;
  final int? screenId;
  final String? startDate;
  final String? endDate;
  final String? startTime;
  final String? endTime;
  final List<String> activeDays;

  CampaignSlotConfig({
    this.routeId,
    this.vehicleId,
    this.screenId,
    this.startDate,
    this.endDate,
    this.startTime,
    this.endTime,
    this.activeDays = const [],
  });

  factory CampaignSlotConfig.fromJson(Map<String, dynamic> json) {
    return CampaignSlotConfig(
      routeId: int.tryParse(json['routeId']?.toString() ?? json['route_id']?.toString() ?? ''),
      vehicleId: int.tryParse(json['vehicleId']?.toString() ?? json['vehicle_id']?.toString() ?? ''),
      screenId: int.tryParse(json['screenId']?.toString() ?? json['screen_id']?.toString() ?? ''),
      startDate: json['startDate']?.toString() ?? json['start_date']?.toString(),
      endDate: json['endDate']?.toString() ?? json['end_date']?.toString(),
      startTime: json['startTime']?.toString() ?? json['start_time']?.toString(),
      endTime: json['endTime']?.toString() ?? json['end_time']?.toString(),
      activeDays: _parseStringList(json['activeDays'] ?? json['active_days']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (routeId != null) 'routeId': routeId,
      if (vehicleId != null) 'vehicleId': vehicleId,
      if (screenId != null) 'screenId': screenId,
      if (startDate != null) 'startDate': startDate,
      if (endDate != null) 'endDate': endDate,
      if (startTime != null) 'startTime': startTime,
      if (endTime != null) 'endTime': endTime,
      if (activeDays.isNotEmpty) 'activeDays': activeDays,
    };
  }
}

/// Represents target fleet/screens for a campaign
class CampaignTarget {
  final int? organizationId;
  final String? fleetName;
  final int? fleetId;
  final String? city;
  final String? displayType;
  final int screensCount;
  final int vehiclesCount;
  final int? routeId;
  final List<int> vehicleIds;
  final List<int> screenIds;

  CampaignTarget({
    this.organizationId,
    this.fleetName,
    this.fleetId,
    this.city,
    this.displayType,
    this.screensCount = 0,
    this.vehiclesCount = 0,
    this.routeId,
    this.vehicleIds = const [],
    this.screenIds = const [],
  });

  factory CampaignTarget.fromJson(Map<String, dynamic> json) {
    return CampaignTarget(
      organizationId: int.tryParse(json['organizationId']?.toString() ?? json['organization_id']?.toString() ?? ''),
      fleetName: json['fleetName']?.toString() ?? json['fleet_name']?.toString(),
      fleetId: int.tryParse(json['fleetId']?.toString() ?? json['fleet_id']?.toString() ?? ''),
      city: json['city']?.toString(),
      displayType: json['displayType']?.toString() ?? json['display_type']?.toString(),
      screensCount: int.tryParse(json['screensCount']?.toString() ?? json['screens_count']?.toString() ?? '0') ?? 0,
      vehiclesCount: int.tryParse(json['vehiclesCount']?.toString() ?? json['vehicles_count']?.toString() ?? '0') ?? 0,
      routeId: int.tryParse(json['routeId']?.toString() ?? json['route_id']?.toString() ?? ''),
      vehicleIds: _parseIntList(json['vehicleIds'] ?? json['vehicle_ids']),
      screenIds: _parseIntList(json['screenIds'] ?? json['screen_ids']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (organizationId != null) 'organizationId': organizationId,
      if (fleetName != null) 'fleetName': fleetName,
      if (fleetId != null) 'fleetId': fleetId,
      if (city != null) 'city': city,
      if (displayType != null) 'displayType': displayType,
      'screensCount': screensCount,
      'vehiclesCount': vehiclesCount,
      if (routeId != null) 'routeId': routeId,
      if (vehicleIds.isNotEmpty) 'vehicleIds': vehicleIds,
      if (screenIds.isNotEmpty) 'screenIds': screenIds,
    };
  }
}

/// Telemetry and engagement performance metrics
class CampaignStats {
  final int impressions;
  final int playbacks;
  final int qrScans;
  final int conversions;
  final int leads;
  final double conversionRate;
  final double spend;
  final double cpm;
  final double ctr;

  CampaignStats({
    this.impressions = 0,
    this.playbacks = 0,
    this.qrScans = 0,
    this.conversions = 0,
    this.leads = 0,
    this.conversionRate = 0.0,
    this.spend = 0.0,
    this.cpm = 0.0,
    this.ctr = 0.0,
  });

  factory CampaignStats.fromJson(Map<String, dynamic> json) {
    return CampaignStats(
      impressions: int.tryParse((json['impressions'] ?? json['impressions_delivered'])?.toString() ?? '0') ?? 0,
      playbacks: int.tryParse((json['playbacks'] ?? json['plays'] ?? json['screens_played'])?.toString() ?? '0') ?? 0,
      qrScans: int.tryParse((json['qrScans'] ?? json['qr_scans'] ?? json['scans'])?.toString() ?? '0') ?? 0,
      conversions: int.tryParse(json['conversions']?.toString() ?? '0') ?? 0,
      leads: int.tryParse(json['leads']?.toString() ?? '0') ?? 0,
      conversionRate: double.tryParse(json['conversionRate']?.toString() ?? json['conversion_rate']?.toString() ?? '0') ?? 0.0,
      spend: double.tryParse(json['spend']?.toString() ?? json['spent']?.toString() ?? '0') ?? 0.0,
      cpm: double.tryParse(json['cpm']?.toString() ?? '0') ?? 0.0,
      ctr: double.tryParse(json['ctr']?.toString() ?? '0') ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'impressions': impressions,
      'playbacks': playbacks,
      'qrScans': qrScans,
      'conversions': conversions,
      'leads': leads,
      'conversionRate': conversionRate,
      'spend': spend,
      'cpm': cpm,
      'ctr': ctr,
    };
  }
}

/// Production Campaign Model strictly aligned with application_api_doc schemas
class CampaignModel {
  final String id;
  final String? code;
  final String? title;
  final String? name;
  final String? brandName;
  final String? clientName;
  final String? clientCompany;
  final String? clientEmail;
  final String? clientPhone;
  final String? clientCity;
  final String? clientState;
  final String? clientPincode;
  final String? clientAddress;
  final double? clientLatitude;
  final double? clientLongitude;
  final String? description;
  final String? targetAudience;
  final String ownerType;
  final int? advertiserId;
  final String? category;
  final String? type;
  final String? slotType;
  final int? durationPerPlaySec;
  final int? durationDays;
  final double? rawBudget;
  final double? dailyBudget;
  final int? totalPlaysRequested;
  final String? startDate;
  final String? endDate;
  final String? priority;
  final String status;
  final bool isDraft;
  final String? mediaUrl;
  final String? videoUrl;
  final String? mediaType;
  final String? contentType;
  final List<CampaignMediaAsset> media;
  final CampaignSlotConfig? slot;
  final List<CampaignTarget> targets;
  final String? qrRedirectUrl;
  final String? promoCode;
  final String? budgetType;
  final String paymentStatus;
  final bool manualPause;
  final Map<String, dynamic>? paymentBreakdown;
  final CampaignStats? stats;
  final String? createdAt;
  final String? updatedAt;

  CampaignModel({
    required this.id,
    this.code,
    this.title,
    this.name,
    this.brandName,
    this.clientName,
    this.clientCompany,
    this.clientEmail,
    this.clientPhone,
    this.clientCity,
    this.clientState,
    this.clientPincode,
    this.clientAddress,
    this.clientLatitude,
    this.clientLongitude,
    this.description,
    this.targetAudience,
    this.ownerType = 'advertiser',
    this.advertiserId,
    this.category,
    this.type,
    this.slotType,
    this.durationPerPlaySec,
    this.durationDays,
    double? budget,
    double? rawBudget,
    this.dailyBudget,
    this.totalPlaysRequested,
    this.startDate,
    this.endDate,
    this.priority,
    this.status = 'draft',
    this.isDraft = false,
    this.mediaUrl,
    this.videoUrl,
    this.mediaType,
    this.contentType,
    this.media = const [],
    this.slot,
    this.targets = const [],
    this.qrRedirectUrl,
    this.promoCode,
    this.budgetType,
    this.paymentStatus = 'unpaid',
    this.manualPause = false,
    this.paymentBreakdown,
    this.stats,
    this.createdAt,
    this.updatedAt,
  }) : rawBudget = rawBudget ?? budget;

  factory CampaignModel.fromJson(Map<String, dynamic> json) {
    List<CampaignMediaAsset> mediaAssets = [];
    final rawMedia = json['media'] ?? json['media_assets'];
    if (rawMedia is List) {
      for (final m in rawMedia) {
        if (m is Map) {
          mediaAssets.add(CampaignMediaAsset.fromJson(Map<String, dynamic>.from(m)));
        }
      }
    }

    CampaignSlotConfig? slotConfig;
    final rawSlot = json['slot'];
    if (rawSlot is Map) {
      slotConfig = CampaignSlotConfig.fromJson(Map<String, dynamic>.from(rawSlot));
    }

    List<CampaignTarget> targetList = [];
    final rawTargets = json['targets'];
    if (rawTargets is List) {
      for (final t in rawTargets) {
        if (t is Map) {
          targetList.add(CampaignTarget.fromJson(Map<String, dynamic>.from(t)));
        }
      }
    }

    CampaignStats? campaignStats;
    final rawStats = json['analytics'] ?? json['stats'];
    if (rawStats is Map) {
      campaignStats = CampaignStats.fromJson(Map<String, dynamic>.from(rawStats));
    } else if (json['impressions'] != null || json['playbacks'] != null || json['impressions_delivered'] != null) {
      campaignStats = CampaignStats.fromJson(json);
    }

    Map<String, dynamic>? paymentBreakdown;
    final rawPb = json['paymentBreakdown'] ?? json['payment_breakdown'];
    if (rawPb is Map) {
      paymentBreakdown = Map<String, dynamic>.from(rawPb);
    } else if (rawPb is String && rawPb.trim().isNotEmpty) {
      try {
        final decoded = jsonDecode(rawPb);
        if (decoded is Map) {
          paymentBreakdown = Map<String, dynamic>.from(decoded);
        }
      } catch (_) {}
    }

    final draftVal = json['isDraft'] ?? json['is_draft'];
    final bool parsedDraft = draftVal == true || draftVal == 1 || draftVal == '1' || draftVal == 'true' || json['status'] == 'draft';

    final payStatusVal = json['payment_status'] ?? json['paymentStatus'];
    final manualPauseVal = json['manual_pause'] ?? json['manualPause'];
    final bool parsedManualPause = manualPauseVal == true || manualPauseVal == 1 || manualPauseVal == '1' || manualPauseVal == 'true';

    return CampaignModel(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString(),
      title: json['title']?.toString(),
      name: json['name']?.toString(),
      brandName: json['brandName']?.toString() ?? json['brand_name']?.toString(),
      clientName: json['clientName']?.toString() ?? json['client_name']?.toString(),
      clientCompany: json['clientCompany']?.toString() ?? json['client_company']?.toString(),
      clientEmail: json['clientEmail']?.toString() ?? json['client_email']?.toString(),
      clientPhone: json['clientPhone']?.toString() ?? json['client_phone']?.toString(),
      clientCity: json['clientCity']?.toString() ?? json['client_city']?.toString(),
      clientState: json['clientState']?.toString() ?? json['client_state']?.toString(),
      clientPincode: json['clientPincode']?.toString() ?? json['client_pincode']?.toString(),
      clientAddress: json['clientAddress']?.toString() ?? json['client_address']?.toString(),
      clientLatitude: double.tryParse(json['clientLatitude']?.toString() ?? json['client_latitude']?.toString() ?? ''),
      clientLongitude: double.tryParse(json['clientLongitude']?.toString() ?? json['client_longitude']?.toString() ?? ''),
      description: json['description']?.toString(),
      targetAudience: json['targetAudience']?.toString() ?? json['target_audience']?.toString(),
      ownerType: json['ownerType']?.toString() ?? json['owner_type']?.toString() ?? 'advertiser',
      advertiserId: int.tryParse(json['advertiserId']?.toString() ?? json['advertiser_id']?.toString() ?? ''),
      category: json['category']?.toString(),
      type: json['type']?.toString(),
      slotType: json['slotType']?.toString() ?? json['slot_type']?.toString(),
      durationPerPlaySec: int.tryParse(json['durationPerPlaySec']?.toString() ?? json['duration_per_play_sec']?.toString() ?? ''),
      durationDays: int.tryParse(json['durationDays']?.toString() ?? json['duration_days']?.toString() ?? ''),
      rawBudget: double.tryParse(json['budget']?.toString() ?? ''),
      dailyBudget: double.tryParse(json['dailyBudget']?.toString() ?? json['daily_budget']?.toString() ?? ''),
      totalPlaysRequested: int.tryParse(json['totalPlaysRequested']?.toString() ?? json['total_plays_requested']?.toString() ?? ''),
      startDate: json['startDate']?.toString() ?? json['start_date']?.toString(),
      endDate: json['endDate']?.toString() ?? json['end_date']?.toString(),
      priority: json['priority']?.toString(),
      status: json['status']?.toString() ?? 'draft',
      isDraft: parsedDraft,
      mediaUrl: json['mediaUrl']?.toString() ?? json['media_url']?.toString(),
      videoUrl: json['videoUrl']?.toString() ?? json['video_url']?.toString(),
      mediaType: json['mediaType']?.toString() ?? json['media_type']?.toString(),
      contentType: json['contentType']?.toString() ?? json['content_type']?.toString(),
      media: mediaAssets,
      slot: slotConfig,
      targets: targetList,
      qrRedirectUrl: json['qrRedirectUrl']?.toString() ?? json['qr_redirect_url']?.toString(),
      promoCode: json['promoCode']?.toString() ?? json['promo_code']?.toString(),
      budgetType: json['budgetType']?.toString() ?? json['budget_type']?.toString(),
      paymentStatus: payStatusVal?.toString().toLowerCase() ?? 'unpaid',
      manualPause: parsedManualPause,
      paymentBreakdown: paymentBreakdown,
      stats: campaignStats,
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString(),
      updatedAt: json['updatedAt']?.toString() ?? json['updated_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (code != null) 'code': code,
      if (title != null) 'title': title,
      if (name != null) 'name': name,
      if (brandName != null) 'brandName': brandName,
      if (clientName != null) 'clientName': clientName,
      if (clientCompany != null) 'clientCompany': clientCompany,
      if (clientEmail != null) 'clientEmail': clientEmail,
      if (clientPhone != null) 'clientPhone': clientPhone,
      if (clientCity != null) 'clientCity': clientCity,
      if (clientState != null) 'clientState': clientState,
      if (clientPincode != null) 'clientPincode': clientPincode,
      if (clientAddress != null) 'clientAddress': clientAddress,
      if (clientLatitude != null) 'client_latitude': clientLatitude,
      if (clientLongitude != null) 'client_longitude': clientLongitude,
      if (description != null) 'description': description,
      if (targetAudience != null) 'targetAudience': targetAudience,
      'ownerType': ownerType,
      if (advertiserId != null) 'advertiserId': advertiserId,
      if (category != null) 'category': category,
      if (type != null) 'type': type,
      if (slotType != null) 'slotType': slotType,
      if (durationPerPlaySec != null) 'durationPerPlaySec': durationPerPlaySec,
      if (durationDays != null) 'durationDays': durationDays,
      if (rawBudget != null) 'budget': rawBudget,
      if (dailyBudget != null) 'dailyBudget': dailyBudget,
      if (totalPlaysRequested != null) 'totalPlaysRequested': totalPlaysRequested,
      if (startDate != null) 'startDate': startDate,
      if (endDate != null) 'endDate': endDate,
      if (priority != null) 'priority': priority,
      'status': status,
      'isDraft': isDraft,
      if (mediaUrl != null) 'mediaUrl': mediaUrl,
      if (videoUrl != null) 'videoUrl': videoUrl,
      if (mediaType != null) 'mediaType': mediaType,
      if (contentType != null) 'contentType': contentType,
      if (media.isNotEmpty) 'media': media.map((m) => m.toJson()).toList(),
      if (slot != null) 'slot': slot!.toJson(),
      if (targets.isNotEmpty) 'targets': targets.map((t) => t.toJson()).toList(),
      if (qrRedirectUrl != null) 'qrRedirectUrl': qrRedirectUrl,
      if (promoCode != null) 'promoCode': promoCode,
      if (budgetType != null) 'budgetType': budgetType,
      if (paymentBreakdown != null) 'paymentBreakdown': paymentBreakdown,
      if (stats != null) 'analytics': stats!.toJson(),
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  // ==========================================================
  // Display & UI Getters (fully backwards-compatible)
  // ==========================================================

  String get displayTitle {
    if (title != null && title!.trim().isNotEmpty) return title!.trim();
    if (name != null && name!.trim().isNotEmpty) return name!.trim();
    return 'Campaign #$id';
  }

  String get displayCode {
    if (code != null && code!.isNotEmpty) return code!;
    if (id.isNotEmpty) return id.startsWith('CMP-') ? id : '#$id';
    return '#CMP';
  }

  String get displayClient {
    if (brandName != null && brandName!.trim().isNotEmpty) return brandName!.trim();
    if (clientCompany != null && clientCompany!.trim().isNotEmpty) return clientCompany!.trim();
    if (clientName != null && clientName!.trim().isNotEmpty) return clientName!.trim();
    return 'Commercial Advertiser';
  }

  String get dateRangeText {
    if (startDate == null && endDate == null) return 'Flexible Schedule';
    final s = startDate?.split('T').first ?? '';
    final e = endDate?.split('T').first ?? '';
    if (s.isNotEmpty && e.isNotEmpty) return '$s - $e';
    return s.isNotEmpty ? 'From $s' : 'Until $e';
  }

  String get formattedBudget {
    if (rawBudget == null || rawBudget == 0) return '₹0';
    if (rawBudget! >= 10000000) return '₹ ${(rawBudget! / 10000000).toStringAsFixed(2)}Cr';
    if (rawBudget! >= 100000) return '₹ ${(rawBudget! / 100000).toStringAsFixed(2)}L';
    if (rawBudget! >= 1000) return '₹ ${(rawBudget! / 1000).toStringAsFixed(1)}K';
    return '₹ ${rawBudget!.toStringAsFixed(0)}';
  }

  // Compatibility aliases
  String get client => displayClient;
  String get dates => dateRangeText;
  String get budget => formattedBudget;
  double? get numericBudget => rawBudget;
  int get screens => screensCount;
  String get impressions => impressionsCount;
  String get imagePath => thumbnailUrl;
  Color get themeColor => statusColor;

  int get screensCount {
    if (targets.isNotEmpty) {
      int count = 0;
      for (final t in targets) {
        count += t.screensCount;
      }
      if (count > 0) return count;
    }
    return 12; // Standard fallback
  }

  String get impressionsCount {
    final imp = stats?.impressions ?? 0;
    if (imp >= 1000000) return '${(imp / 1000000).toStringAsFixed(1)}M';
    if (imp >= 1000) return '${(imp / 1000).toStringAsFixed(1)}K';
    return imp.toString();
  }

  Color get statusColor {
    final s = status.toLowerCase();
    switch (s) {
      case 'live':
      case 'running':
      case 'active':
        return const Color(0xFF10B981); // Emerald Green
      case 'pending':
      case 'pending_approval':
        return const Color(0xFFF59E0B); // Amber
      case 'approved':
      case 'scheduled':
        return const Color(0xFF6366F1); // Indigo / Purple
      case 'paused':
        return const Color(0xFFF97316); // Orange
      case 'completed':
        return const Color(0xFF3B82F6); // Blue
      case 'rejected':
      case 'suspended':
        return const Color(0xFFEF4444); // Red
      case 'draft':
      default:
        return const Color(0xFF94A3B8); // Slate Grey
    }
  }

  String get statusLabel {
    final s = status.toLowerCase();
    switch (s) {
      case 'live':
      case 'running':
        return 'RUNNING';
      case 'pending':
      case 'pending_approval':
        return 'PENDING';
      case 'approved':
      case 'scheduled':
        return 'SCHEDULED';
      case 'paused':
        return 'PAUSED';
      case 'completed':
        return 'COMPLETED';
      case 'rejected':
        return 'REJECTED';
      case 'draft':
      default:
        return 'DRAFT';
    }
  }

  bool get isLive => status.toLowerCase() == 'live' || status.toUpperCase() == 'RUNNING';
  bool get isPaused => status.toLowerCase() == 'paused' || status.toUpperCase() == 'PAUSED';
  bool get isPending => status.toLowerCase() == 'pending_approval' || status.toLowerCase() == 'pending';
  bool get isApproved => status.toLowerCase() == 'approved';
  bool get isCompleted => status.toLowerCase() == 'completed';
  bool get isDraftStatus => status.toLowerCase() == 'draft' || isDraft;
  bool get isPaid => paymentStatus.toLowerCase() == 'paid';

  /// Returns stage bucket according to Lifecycle Engine
  String get stageOf {
    final s = status.toLowerCase();
    if (s == 'approved' && isPaid) return 'paid';
    return s;
  }

  bool get canStart => isPaused || (isApproved && isPaid);
  bool get canPause => isLive;
  bool get canEnd => isLive || isPaused;
  bool get canSubmit => isDraftStatus;
  bool get canSharePaymentLink => isApproved && !isPaid;

  String get thumbnailUrl {
    if (mediaUrl != null && mediaUrl!.isNotEmpty) return mediaUrl!;
    if (media.isNotEmpty && media.first.fileUrl != null) return media.first.fileUrl!;
    return '';
  }
}

/// Backward compatibility typedef
typedef AdvertiserCampaign = CampaignModel;

/// Available Fleet Option Model for step 3 in campaign creator
class FleetOptionModel {
  final int id;
  final String name;
  final String? city;
  final int? organizationId;
  final int busCount;
  final int screensCount;
  final int routesCount;
  final List<TransitRouteModel> routes;

  FleetOptionModel({
    required this.id,
    required this.name,
    this.city,
    this.organizationId,
    this.busCount = 0,
    this.screensCount = 0,
    this.routesCount = 0,
    this.routes = const [],
  });

  factory FleetOptionModel.fromJson(Map<String, dynamic> json) {
    List<TransitRouteModel> routesList = [];
    if (json['routes'] is List) {
      routesList = (json['routes'] as List)
          .whereType<Map>()
          .map((r) => TransitRouteModel.fromJson(
                Map<String, dynamic>.from(r),
                fleetId: json['id'] is int ? json['id'] : (int.tryParse(json['id']?.toString() ?? '0') ?? 0),
                fleetName: json['name']?.toString() ?? 'Fleet',
                organizationId: json['organization_id'] ?? json['organizationId'],
              ))
          .toList();
    }

    return FleetOptionModel(
      id: json['id'] is int ? json['id'] : (int.tryParse(json['id']?.toString() ?? '0') ?? 0),
      name: json['name'] ?? json['fleet_name'] ?? 'Fleet #${json['id']}',
      city: json['city'] ?? json['cities'] ?? json['location'],
      organizationId: json['organization_id'] ?? json['organizationId'],
      busCount: json['busCount'] ?? json['bus_count'] ?? json['vehiclesCount'] ?? json['vehicles_count'] ?? 0,
      screensCount: json['screensCount'] ?? json['screens_count'] ?? 0,
      routesCount: json['routesCount'] ?? json['routes_count'] ?? routesList.length,
      routes: routesList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (city != null) 'city': city,
      if (organizationId != null) 'organization_id': organizationId,
      'busCount': busCount,
      'screensCount': screensCount,
      'routesCount': routesCount,
      'routes': routes.map((r) => r.toJson()).toList(),
    };
  }
}

/// Transit Route Model
class TransitRouteModel {
  final int id;
  final String code;
  final String name;
  final String startPoint;
  final String endPoint;
  final String city;
  final int fleetId;
  final String fleetName;
  final int? organizationId;
  final int vehicleCount;
  final int totalScreens;
  final int screensPerVehicle;
  final List<TransitVehicleModel> vehicles;

  TransitRouteModel({
    required this.id,
    required this.code,
    required this.name,
    this.startPoint = '',
    this.endPoint = '',
    this.city = 'Transit Network',
    this.fleetId = 0,
    this.fleetName = '',
    this.organizationId,
    this.vehicleCount = 0,
    this.totalScreens = 0,
    this.screensPerVehicle = 1,
    this.vehicles = const [],
  });

  factory TransitRouteModel.fromJson(Map<String, dynamic> json, {int fleetId = 0, String fleetName = '', int? organizationId}) {
    List<TransitVehicleModel> vList = [];
    if (json['vehicles'] is List) {
      vList = (json['vehicles'] as List)
          .whereType<Map>()
          .map((v) => TransitVehicleModel.fromJson(Map<String, dynamic>.from(v)))
          .toList();
    }

    final int rId = json['id'] is int ? json['id'] : (int.tryParse(json['id']?.toString() ?? '0') ?? 0);
    final int bCount = vList.isNotEmpty ? vList.length : (json['vehicleCount'] ?? json['vehicle_count'] ?? 0);
    final int sCount = vList.isNotEmpty
        ? vList.fold(0, (sum, v) => sum + (v.screens.isNotEmpty ? v.screens.length : v.displaysCount))
        : (json['totalScreens'] ?? json['total_screens'] ?? (bCount * (json['screensPerVehicle'] ?? 1)));

    return TransitRouteModel(
      id: rId,
      code: json['code']?.toString() ?? 'RTE-$rId',
      name: json['name']?.toString() ?? 'Route $rId',
      startPoint: json['startPoint'] ?? json['start_point'] ?? '',
      endPoint: json['endPoint'] ?? json['end_point'] ?? '',
      city: json['city'] ?? json['start_city'] ?? 'Transit Network',
      fleetId: fleetId != 0 ? fleetId : (json['fleetId'] ?? json['fleet_id'] ?? 0),
      fleetName: fleetName.isNotEmpty ? fleetName : (json['fleetName'] ?? json['fleet_name'] ?? 'Transit'),
      organizationId: organizationId ?? json['organizationId'] ?? json['organization_id'],
      vehicleCount: bCount,
      totalScreens: sCount,
      screensPerVehicle: bCount > 0 ? (sCount / bCount).round() : (json['screensPerVehicle'] ?? 1),
      vehicles: vList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'start_point': startPoint,
      'end_point': endPoint,
      'city': city,
      'fleet_id': fleetId,
      'fleet_name': fleetName,
      if (organizationId != null) 'organization_id': organizationId,
      'vehicle_count': vehicleCount,
      'total_screens': totalScreens,
      'screens_per_vehicle': screensPerVehicle,
      'vehicles': vehicles.map((v) => v.toJson()).toList(),
    };
  }
}

/// Transit Vehicle Model
class TransitVehicleModel {
  final int id;
  final String busNumber;
  final int displaysCount;
  final List<TransitScreenModel> screens;

  TransitVehicleModel({
    required this.id,
    required this.busNumber,
    this.displaysCount = 1,
    this.screens = const [],
  });

  factory TransitVehicleModel.fromJson(Map<String, dynamic> json) {
    List<TransitScreenModel> sList = [];
    if (json['screens'] is List) {
      sList = (json['screens'] as List)
          .whereType<Map>()
          .map((s) => TransitScreenModel.fromJson(Map<String, dynamic>.from(s)))
          .toList();
    }
    return TransitVehicleModel(
      id: json['id'] is int ? json['id'] : (int.tryParse(json['id']?.toString() ?? '0') ?? 0),
      busNumber: json['busNumber'] ?? json['bus_number'] ?? json['registration_number'] ?? 'Bus #${json['id']}',
      displaysCount: json['displaysCount'] ?? json['displays_count'] ?? sList.length,
      screens: sList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bus_number': busNumber,
      'displays_count': displaysCount,
      'screens': screens.map((s) => s.toJson()).toList(),
    };
  }
}

/// Transit Screen Model
class TransitScreenModel {
  final int id;
  final String code;
  final String type;
  final String resolution;
  final String status;

  TransitScreenModel({
    required this.id,
    required this.code,
    this.type = 'Passenger Display',
    this.resolution = '1920x1080',
    this.status = 'active',
  });

  factory TransitScreenModel.fromJson(Map<String, dynamic> json) {
    return TransitScreenModel(
      id: json['id'] is int ? json['id'] : (int.tryParse(json['id']?.toString() ?? '0') ?? 0),
      code: json['code']?.toString() ?? 'SCR-${json['id']}',
      type: json['type'] ?? json['display_type'] ?? 'Passenger Display',
      resolution: json['resolution'] ?? '1920x1080',
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'type': type,
      'resolution': resolution,
      'status': status,
    };
  }
}

/// Selected Transit Target for Campaign Creator (Route + Vehicle + Screen Level)
class SelectedTargetModel {
  final int fleetId;
  final String fleetName;
  final int? organizationId;
  final int routeId;
  final String routeName;
  final String routeCode;
  final String city;
  final List<int> vehicleIds;
  final List<int> screenIds;
  final int vehicleCount;
  final int totalScreens;
  final int screensPerVehicle;

  SelectedTargetModel({
    required this.fleetId,
    required this.fleetName,
    this.organizationId,
    required this.routeId,
    required this.routeName,
    required this.routeCode,
    this.city = 'Transit Network',
    this.vehicleIds = const [],
    this.screenIds = const [],
    this.vehicleCount = 0,
    this.totalScreens = 0,
    this.screensPerVehicle = 1,
  });

  SelectedTargetModel copyWith({
    List<int>? vehicleIds,
    List<int>? screenIds,
    int? vehicleCount,
    int? totalScreens,
  }) {
    return SelectedTargetModel(
      fleetId: fleetId,
      fleetName: fleetName,
      organizationId: organizationId,
      routeId: routeId,
      routeName: routeName,
      routeCode: routeCode,
      city: city,
      vehicleIds: vehicleIds ?? this.vehicleIds,
      screenIds: screenIds ?? this.screenIds,
      vehicleCount: vehicleCount ?? this.vehicleCount,
      totalScreens: totalScreens ?? this.totalScreens,
      screensPerVehicle: screensPerVehicle,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (organizationId != null) 'organizationId': organizationId,
      'fleet_name': fleetName,
      'fleet_id': fleetId,
      'route_id': routeId,
      'vehicle_ids': vehicleIds,
      'screen_ids': screenIds,
      'screens_per_vehicle': screensPerVehicle,
      'screens_count': totalScreens,
      'vehicles_count': vehicleCount,
      'city': city,
    };
  }
}

/// Dynamic Payment Breakdown Line Item Model
class BreakdownItemModel {
  final String id;
  String key; // e.g. 'GST_CGST', 'FEE_AIRTIME_BROADCAST', 'DISCOUNT_VOLUME', 'CUSTOM'
  String label;
  String type; // 'charge', 'discount', 'tax'
  double amount;

  BreakdownItemModel({
    required this.id,
    this.key = 'CUSTOM',
    required this.label,
    this.type = 'charge',
    required this.amount,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'key': key,
      'label': label,
      'type': type,
      'amount': amount,
    };
  }
}

/// Creative Asset Model
class CreativeItemModel {
  final String id;
  final String name;
  final String type; // 'Video', 'Image', 'PDF', 'URL'
  final String size;
  final String resolution;
  final int durationSec;
  final String? localPath;
  final String? videoUrl;
  final String? previewUrl;

  CreativeItemModel({
    required this.id,
    required this.name,
    this.type = 'Video',
    this.size = '',
    this.resolution = '1920x1080',
    this.durationSec = 15,
    this.localPath,
    this.videoUrl,
    this.previewUrl,
  });

  Map<String, dynamic> toJson() {
    return {
      'file_url': videoUrl ?? previewUrl ?? localPath ?? '',
      'media_type': type == 'Video' ? 'video' : (type == 'PDF' ? 'pdf' : (type == 'URL' ? 'url' : 'image')),
      'resolution': resolution,
      'duration_sec': durationSec,
      'file_size': size,
      'display_duration_sec': durationSec,
      'is_enabled': true,
    };
  }
}

/// Slot Availability check result model
class SlotAvailabilityModel {
  final bool available;
  final int conflictCount;
  final int availableScreens;
  final int totalScreens;
  final String? message;

  SlotAvailabilityModel({
    this.available = true,
    this.conflictCount = 0,
    this.availableScreens = 0,
    this.totalScreens = 0,
    this.message,
  });

  factory SlotAvailabilityModel.fromJson(Map<String, dynamic> json) {
    return SlotAvailabilityModel(
      available: json['available'] ?? (json['conflictCount'] == 0),
      conflictCount: json['conflictCount'] ?? json['conflict_count'] ?? 0,
      availableScreens: json['availableScreens'] ?? json['available_screens'] ?? 0,
      totalScreens: json['totalScreens'] ?? json['total_screens'] ?? 0,
      message: json['message'],
    );
  }
}

/// Campaign Review Model (from QR scans / public feedback)
class CampaignReviewModel {
  final String id;
  final String? campaignId;
  final double rating;
  final String? comment;
  final String? customerName;
  final String? scannedAt;

  CampaignReviewModel({
    required this.id,
    this.campaignId,
    this.rating = 5.0,
    this.comment,
    this.customerName,
    this.scannedAt,
  });

  factory CampaignReviewModel.fromJson(Map<String, dynamic> json) {
    return CampaignReviewModel(
      id: json['id']?.toString() ?? '',
      campaignId: json['campaignId']?.toString() ?? json['campaign_id']?.toString(),
      rating: double.tryParse(json['rating']?.toString() ?? '5.0') ?? 5.0,
      comment: json['comment'] ?? json['review'],
      customerName: json['customerName'] ?? json['customer_name'] ?? json['user_name'] ?? 'Viewer',
      scannedAt: json['scannedAt'] ?? json['scanned_at'] ?? json['createdAt'],
    );
  }
}

/// Comprehensive reviews data structure matching Admin Panel
class CampaignReviewsData {
  final int count;
  final double driverAvg;
  final double busAvg;
  final double serviceAvg;
  final List<CampaignReviewItem> reviews;

  CampaignReviewsData({
    this.count = 0,
    this.driverAvg = 0.0,
    this.busAvg = 0.0,
    this.serviceAvg = 0.0,
    this.reviews = const [],
  });

  factory CampaignReviewsData.fromJson(Map<String, dynamic> json) {
    final avgs = json['averages'] is Map ? Map<String, dynamic>.from(json['averages']) : <String, dynamic>{};
    final list = json['reviews'] is List
        ? (json['reviews'] as List)
            .whereType<Map>()
            .map((r) => CampaignReviewItem.fromJson(Map<String, dynamic>.from(r)))
            .toList()
        : <CampaignReviewItem>[];

    return CampaignReviewsData(
      count: int.tryParse(json['count']?.toString() ?? '0') ?? list.length,
      driverAvg: double.tryParse(avgs['driver']?.toString() ?? '0') ?? 0.0,
      busAvg: double.tryParse(avgs['bus']?.toString() ?? '0') ?? 0.0,
      serviceAvg: double.tryParse(avgs['service']?.toString() ?? '0') ?? 0.0,
      reviews: list,
    );
  }
}

class CampaignReviewItem {
  final String id;
  final double driverRating;
  final double busRating;
  final double serviceRating;
  final String? comment;
  final String? createdAt;

  CampaignReviewItem({
    required this.id,
    this.driverRating = 5.0,
    this.busRating = 5.0,
    this.serviceRating = 5.0,
    this.comment,
    this.createdAt,
  });

  factory CampaignReviewItem.fromJson(Map<String, dynamic> json) {
    return CampaignReviewItem(
      id: json['id']?.toString() ?? '',
      driverRating: double.tryParse(json['driverRating']?.toString() ?? json['driver_rating']?.toString() ?? '5.0') ?? 5.0,
      busRating: double.tryParse(json['busRating']?.toString() ?? json['bus_rating']?.toString() ?? '5.0') ?? 5.0,
      serviceRating: double.tryParse(json['serviceRating']?.toString() ?? json['service_rating']?.toString() ?? '5.0') ?? 5.0,
      comment: json['comment']?.toString(),
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString(),
    );
  }
}
