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
  final String? clientCompany;
  final String? brandName;
  final String? agencyName;
  final double? budget;
  final String? clientName;
  final String? clientPhone;
  final String? clientEmail;
  final String? paymentStatus;
  final String? paymentMode;
  final String? scheduleStatus;
  final String? qrCode;
  final dynamic paymentBreakdown;
  final Map<String, dynamic>? rawJson;

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
    this.clientCompany,
    this.brandName,
    this.agencyName,
    this.budget,
    this.clientName,
    this.clientPhone,
    this.clientEmail,
    this.paymentStatus,
    this.paymentMode,
    this.scheduleStatus,
    this.qrCode,
    this.paymentBreakdown,
    this.rawJson,
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

    // Parse budget from payment_breakdown or budget field
    double? parsedBudget = double.tryParse(json['budget']?.toString() ?? '');
    final pb = json['payment_breakdown'];
    if (pb != null) {
      if (pb is Map && pb['totalAmount'] != null) {
        parsedBudget = double.tryParse(pb['totalAmount'].toString()) ?? parsedBudget;
      }
    }

    // Payment status mapping
    String? payStatus;
    if (json['payment'] is Map) {
      final p = json['payment'] as Map;
      if (p['payment_mode'] == 'offline') {
        payStatus = 'Treasury Paid';
      } else if (p['payment_mode'] == 'online') {
        payStatus = 'Online Paid';
      }
    }
    if (payStatus == null) {
      final ps = json['payment_status']?.toString().toLowerCase();
      if (ps == 'paid') {
        payStatus = 'Gov Cleared';
      } else {
        payStatus = 'Pending Sanction';
      }
    }

    // QR Code
    String? qrStr;
    if (json['qrCodes'] is List && (json['qrCodes'] as List).isNotEmpty) {
      final first = (json['qrCodes'] as List).first;
      if (first is Map) qrStr = first['code']?.toString();
    } else if (json['qr_code'] != null) {
      qrStr = json['qr_code']?.toString();
    }

    return GovCampaignModel(
      id: json['id']?.toString(),
      code: json['code']?.toString() ??
          json['campaign_code']?.toString() ??
          json['campaignCode']?.toString() ??
          json['po_reference']?.toString() ??
          json['id']?.toString(),
      title: json['title']?.toString() ?? json['name']?.toString(),
      name: json['name']?.toString() ?? json['title']?.toString(),
      description: json['description']?.toString(),
      ownerType: json['owner_type']?.toString() ?? json['ownerType']?.toString() ?? 'government',
      status: json['status']?.toString().toLowerCase(),
      priority: json['priority']?.toString(),
      activeDays: days,
      broadcastStartTime: json['broadcast_start_time']?.toString() ?? json['broadcastStartTime']?.toString(),
      broadcastEndTime: json['broadcast_end_time']?.toString() ?? json['broadcastEndTime']?.toString(),
      mediaUrl: media,
      contentType: json['content_type']?.toString() ?? json['contentType']?.toString() ?? json['media_type']?.toString(),
      impressions: int.tryParse(json['impressions_delivered']?.toString() ?? json['impressions']?.toString() ?? '0'),
      reach: int.tryParse(json['reach']?.toString() ?? '0'),
      clicks: int.tryParse(json['clicks']?.toString() ?? '0'),
      qrScansCount: int.tryParse(json['qr_scans_count']?.toString() ??
          json['qr_scans']?.toString() ??
          json['qrScans']?.toString() ??
          (json['qrCodes'] is List && (json['qrCodes'] as List).isNotEmpty
              ? json['qrCodes'][0]['scan_count']?.toString()
              : null) ??
          '0'),
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
      clientCompany: json['client_company']?.toString() ?? json['clientCompany']?.toString(),
      brandName: json['brand_name']?.toString() ?? json['brandName']?.toString(),
      agencyName: json['agency'] is Map ? json['agency']['name']?.toString() : json['agency_name']?.toString(),
      budget: parsedBudget,
      clientName: json['client_name']?.toString() ?? (json['agency'] is Map ? json['agency']['contact_name']?.toString() : null),
      clientPhone: json['client_phone']?.toString(),
      clientEmail: json['client_email']?.toString(),
      paymentStatus: payStatus,
      paymentMode: json['payment'] is Map ? json['payment']['payment_mode']?.toString() : null,
      scheduleStatus: json['schedule_status']?.toString(),
      qrCode: qrStr,
      paymentBreakdown: pb,
      rawJson: json,
    );
  }

  String get displayCode => (code != null && code!.isNotEmpty) ? code! : (id != null && id!.isNotEmpty ? 'CMP-$id' : 'CMP');

  bool get isPaid {
    final ps = (paymentStatus ?? '').toLowerCase().trim();
    final rawPs = (rawJson?['payment_status'] ?? '').toString().toLowerCase().trim();
    return ps == 'paid' ||
        ps.contains('paid') ||
        ps.contains('cleared') ||
        rawPs == 'paid' ||
        rawPs.contains('paid') ||
        rawPs.contains('cleared');
  }

  String get departmentOrClient {
    if (clientCompany != null && clientCompany!.isNotEmpty) return clientCompany!;
    if (brandName != null && brandName!.isNotEmpty) return brandName!;
    if (agencyName != null && agencyName!.isNotEmpty) return agencyName!;
    if (category != null && category!.isNotEmpty) return category!;
    return 'Department of Public Safety';
  }

  String get displayCategory => (category != null && category!.isNotEmpty) ? category! : 'PSA';

  int get totalScreens {
    if (targets != null && targets!.isNotEmpty) {
      int total = 0;
      for (final t in targets!) {
        total += int.tryParse(t['screens_count']?.toString() ?? t['screensCount']?.toString() ?? '0') ?? 0;
      }
      if (total > 0) return total;
    }
    return reach != null && reach! > 0 ? reach! : 1;
  }

  int get totalBuses {
    if (targets != null && targets!.isNotEmpty) {
      int total = 0;
      for (final t in targets!) {
        int count = int.tryParse(t['vehicles_count']?.toString() ?? t['vehiclesCount']?.toString() ?? '0') ?? 0;
        if (count == 0 && t['vehicle_ids'] is List) {
          count = (t['vehicle_ids'] as List).length;
        }
        total += (count > 0 ? count : 1);
      }
      if (total > 0) return total;
    }
    return 1;
  }

  String? get timeDisplay {
    if (broadcastStartTime != null && broadcastEndTime != null && broadcastStartTime!.isNotEmpty && broadcastEndTime!.isNotEmpty) {
      final start = broadcastStartTime!.length >= 5 ? broadcastStartTime!.substring(0, 5) : broadcastStartTime!;
      final end = broadcastEndTime!.length >= 5 ? broadcastEndTime!.substring(0, 5) : broadcastEndTime!;
      return '$start – $end IST';
    }
    return null;
  }

  String? get youtubeThumbnail {
    final url = mediaUrl ?? '';
    if (url.contains('youtube.com') || url.contains('youtu.be')) {
      final regExp = RegExp(r'(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})');
      final match = regExp.firstMatch(url);
      if (match != null && match.groupCount >= 1) {
        final ytId = match.group(1);
        return 'https://img.youtube.com/vi/$ytId/hqdefault.jpg';
      }
    }
    return null;
  }

  String get thumbnailOrMedia {
    final yt = youtubeThumbnail;
    if (yt != null) return yt;
    if (resolvedMediaUrl.isNotEmpty) return resolvedMediaUrl;
    return '';
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

  String get mappedStatus {
    final s = (status ?? '').toLowerCase();
    if (s == 'live' || s == 'running') return 'Running';
    if (s == 'paused') return 'Paused';
    if (s == 'pending_approval' || s == 'under review') return 'Under Review';
    if (s == 'approved') {
      return (scheduleStatus == 'outside_window') ? 'Scheduled' : 'Approved';
    }
    if (s == 'scheduled') return 'Scheduled';
    if (s == 'rejected') return 'Rejected';
    if (s == 'completed') return 'Completed';
    return 'Draft';
  }

  double get totalAmount => budget ?? 0.0;

  int get citiesCount {
    if (targets != null && targets!.isNotEmpty) {
      final cities = targets!
          .map((t) => t['city_name']?.toString() ?? t['city']?.toString())
          .where((e) => e != null && e.isNotEmpty)
          .toSet();
      return cities.isNotEmpty ? cities.length : 1;
    }
    return 1;
  }

  String get fleetOperatorName {
    if (targets != null && targets!.isNotEmpty) {
      for (final t in targets!) {
        final f = t['fleet_name']?.toString() ?? t['operator_name']?.toString() ?? t['agency_name']?.toString();
        if (f != null && f.isNotEmpty) return f;
      }
    }
    return 'Transit Fleet';
  }

  String get primaryMediaType {
    final c = (contentType ?? '').toLowerCase();
    if (c.contains('video') || (mediaUrl != null && (mediaUrl!.endsWith('.mp4') || mediaUrl!.contains('youtube')))) return 'video';
    if (c.contains('pdf') || (mediaUrl != null && mediaUrl!.endsWith('.pdf'))) return 'pdf';
    if (c.contains('url') || c.contains('link') || c.contains('youtube')) return 'url';
    return 'image';
  }

  // --- Admin Panel Detailed Fields & Getters ---
  String get campaignCode => (code != null && code!.isNotEmpty) ? code! : (id != null && id!.isNotEmpty ? 'CMP-$id' : 'CMP');

  String get campaignType => (rawJson?['campaign_type']?.toString() ?? rawJson?['type']?.toString() ?? 'Commercial DOOH');

  String get strategicObjective => (rawJson?['objective']?.toString() ?? rawJson?['strategic_objective']?.toString() ?? 'Brand Awareness & High Reach');

  String get submittedOnDisplay {
    if (createdAt != null) {
      return '${createdAt!.day} ${_monthName(createdAt!.month)} ${createdAt!.year}, ${createdAt!.hour.toString().padLeft(2, '0')}:${createdAt!.minute.toString().padLeft(2, '0')}';
    }
    final c = rawJson?['created_at'] ?? rawJson?['createdAt'];
    if (c != null) return c.toString();
    return '–';
  }

  String? get verifiedOnDisplay {
    final v = rawJson?['verified_at'] ?? rawJson?['verifiedAt'];
    if (v == null) return null;
    try {
      final dt = DateTime.parse(v.toString());
      return '${dt.day} ${_monthName(dt.month)} ${dt.year}, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return v.toString();
    }
  }

  String? get approvedOnDisplay {
    final a = rawJson?['approved_at'] ?? rawJson?['approvedAt'];
    if (a == null) return null;
    try {
      final dt = DateTime.parse(a.toString());
      return '${dt.day} ${_monthName(dt.month)} ${dt.year}, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return a.toString();
    }
  }

  String get submittedByUser {
    if (rawJson != null) {
      final cr = rawJson!['creator'];
      if (cr is Map && cr['name'] != null) return cr['name'].toString();
      if (cr is Map && cr['email'] != null) return cr['email'].toString();
      final adv = rawJson!['advertiser'];
      if (adv is Map && adv['user'] is Map) {
        final u = adv['user'] as Map;
        if (u['name'] != null) return u['name'].toString();
        if (u['email'] != null) return u['email'].toString();
      }
      final cbu = rawJson!['created_by_user'];
      if (cbu is Map && cbu['email'] != null) return cbu['email'].toString();
    }
    return 'Operations Staff';
  }

  String get clientCity => rawJson?['client_city']?.toString() ?? '';
  String get clientState => rawJson?['client_state']?.toString() ?? '';
  String get clientPincode => rawJson?['client_pincode']?.toString() ?? '';
  String get clientAddress => rawJson?['client_address']?.toString() ?? '';
  double? get clientLatitude => double.tryParse(rawJson?['client_latitude']?.toString() ?? '');
  double? get clientLongitude => double.tryParse(rawJson?['client_longitude']?.toString() ?? '');

  List<Map<String, dynamic>> get mediaList {
    final list = <Map<String, dynamic>>[];
    dynamic raw = rawJson?['media'] ?? rawJson?['media_assets'];
    if (raw is List && raw.isNotEmpty) {
      for (int i = 0; i < raw.length; i++) {
        final m = raw[i];
        if (m is Map) {
          final url = (m['file_url'] ?? m['fileUrl'] ?? m['url'] ?? '').toString();
          final rawType = (m['media_type'] ?? m['mediaType'] ?? 'image').toString().toLowerCase();
          final isVideo = rawType == 'video' || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm');
          final isPdf = rawType == 'pdf' || url.endsWith('.pdf');
          final isUrl = rawType == 'url' || url.contains('youtube.com') || url.contains('youtu.be');
          final type = isVideo ? 'Video' : (isPdf ? 'PDF' : (isUrl ? 'URL' : 'Image'));

          String? ytId;
          if (isUrl) {
            final regExp = RegExp(r'(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})');
            final match = regExp.firstMatch(url);
            if (match != null && match.groupCount >= 1) ytId = match.group(1);
          }

          final sizeBytes = int.tryParse(m['file_size']?.toString() ?? '');
          final sizeStr = sizeBytes != null ? '${(sizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB' : (m['fileSize']?.toString() ?? 'Standard');

          list.add({
            'id': m['id'] ?? i,
            'type': type,
            'url': ApiConstants.resolveFileUrl(url),
            'rawUrl': url,
            'name': url.split('/').isNotEmpty ? url.split('/').last : 'Asset #${i + 1}',
            'size': sizeStr,
            'resolution': m['resolution']?.toString() ?? '1920 × 1080',
            'duration': isVideo ? '${m['duration_sec'] ?? 15} sec' : (isPdf ? 'Static PDF' : 'Static Image'),
            'durationSec': int.tryParse(m['duration_sec']?.toString() ?? '') ?? 15,
            'ytId': ytId,
            'thumb': ytId != null ? 'https://img.youtube.com/vi/$ytId/hqdefault.jpg' : (type == 'Image' ? ApiConstants.resolveFileUrl(url) : ''),
          });
        }
      }
    }

    if (list.isEmpty && (mediaUrl != null && mediaUrl!.isNotEmpty)) {
      final url = mediaUrl!;
      final rawType = (contentType ?? 'image').toLowerCase();
      final isVideo = rawType == 'video' || url.endsWith('.mp4') || url.endsWith('.mov');
      final isPdf = rawType == 'pdf' || url.endsWith('.pdf');
      final isUrl = rawType == 'url' || url.contains('youtube.com') || url.contains('youtu.be');
      final type = isVideo ? 'Video' : (isPdf ? 'PDF' : (isUrl ? 'URL' : 'Image'));

      String? ytId;
      if (isUrl) {
        final regExp = RegExp(r'(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})');
        final match = regExp.firstMatch(url);
        if (match != null && match.groupCount >= 1) ytId = match.group(1);
      }

      list.add({
        'id': 0,
        'type': type,
        'url': ApiConstants.resolveFileUrl(url),
        'rawUrl': url,
        'name': url.split('/').isNotEmpty ? url.split('/').last : 'Asset #1',
        'size': 'Standard',
        'resolution': '1920 × 1080',
        'duration': isVideo ? '15 sec' : (isPdf ? 'Static PDF' : 'Static Image'),
        'durationSec': 15,
        'ytId': ytId,
        'thumb': ytId != null ? 'https://img.youtube.com/vi/$ytId/hqdefault.jpg' : (type == 'Image' ? ApiConstants.resolveFileUrl(url) : ''),
      });
    }

    return list;
  }

  int get durationDays {
    final d = int.tryParse(rawJson?['duration_days']?.toString() ?? '');
    if (d != null && d > 0) return d;
    if (startDate != null && endDate != null) {
      final diff = endDate!.difference(startDate!).inDays + 1;
      if (diff > 0) return diff;
    }
    return 14;
  }

  String get slotStartTime {
    if (broadcastStartTime != null && broadcastStartTime!.isNotEmpty) {
      return broadcastStartTime!.length >= 5 ? broadcastStartTime!.substring(0, 5) : broadcastStartTime!;
    }
    return '08:00';
  }

  String get slotEndTime {
    if (broadcastEndTime != null && broadcastEndTime!.isNotEmpty) {
      return broadcastEndTime!.length >= 5 ? broadcastEndTime!.substring(0, 5) : broadcastEndTime!;
    }
    return '22:00';
  }

  int get startMinutes {
    final parts = slotStartTime.split(':');
    final h = int.tryParse(parts.isNotEmpty ? parts[0] : '8') ?? 8;
    final m = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
    return h * 60 + m;
  }

  int get endMinutes {
    final parts = slotEndTime.split(':');
    final h = int.tryParse(parts.isNotEmpty ? parts[0] : '22') ?? 22;
    final m = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
    return h * 60 + m;
  }

  int get diffMinutes {
    final diff = endMinutes - startMinutes;
    return diff > 0 ? diff : 60;
  }

  double get dailyOperatingHoursNum => double.parse((diffMinutes / 60.0).toStringAsFixed(2));

  String get dailyOperatingHoursDisplay {
    if (diffMinutes < 60) {
      return '${(diffMinutes / 60.0).toStringAsFixed(1)} Hours / Day ($diffMinutes Mins)';
    } else if (diffMinutes % 60 == 0) {
      return '${diffMinutes ~/ 60} Hours / Day';
    } else {
      return '${(diffMinutes / 60.0).toStringAsFixed(1)} Hours / Day (${diffMinutes ~/ 60}h ${diffMinutes % 60}m)';
    }
  }

  List<String> get selectedDaysList {
    if (activeDays != null && activeDays!.isNotEmpty) return activeDays!;
    return const ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }

  int get activeBroadcastDaysCount {
    if (startDate != null && endDate != null) {
      const dayMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      int count = 0;
      DateTime cur = startDate!;
      while (!cur.isAfter(endDate!)) {
        final dayStr = dayMap[cur.weekday - 1];
        if (selectedDaysList.contains(dayStr)) count++;
        cur = cur.add(const Duration(days: 1));
      }
      if (count > 0) return count;
    }
    return durationDays;
  }

  double get totalAirtimeHours => double.parse((activeBroadcastDaysCount * dailyOperatingHoursNum).toStringAsFixed(1));

  String get repeatFrequency {
    final f = rawJson?['frequency']?.toString();
    if (f != null && f.isNotEmpty) return f;
    if (selectedDaysList.length == 7) return 'Daily';
    if (selectedDaysList.length == 2 && selectedDaysList.contains('Sat') && selectedDaysList.contains('Sun')) return 'Weekends';
    return 'Custom';
  }

  String get timezoneDisplay => rawJson?['timezone']?.toString() ?? 'GMT +05:30 India Standard Time';

  Map<String, dynamic>? get _pbMap {
    if (paymentBreakdown is Map) return Map<String, dynamic>.from(paymentBreakdown as Map);
    if (rawJson?['payment_breakdown'] is Map) return Map<String, dynamic>.from(rawJson!['payment_breakdown'] as Map);
    return null;
  }

  double get baseBudget {
    final pb = _pbMap;
    if (pb != null && pb['baseAmount'] != null) {
      return double.tryParse(pb['baseAmount'].toString()) ?? (budget ?? 0.0);
    }
    return budget ?? 0.0;
  }

  double get subtotalAmount {
    final pb = _pbMap;
    if (pb != null && pb['subtotal'] != null) {
      return double.tryParse(pb['subtotal'].toString()) ?? baseBudget;
    }
    return baseBudget;
  }

  double get gstAmount {
    final pb = _pbMap;
    if (pb != null && pb['gstAmount'] != null) {
      return double.tryParse(pb['gstAmount'].toString()) ?? 0.0;
    }
    return 0.0;
  }

  List<Map<String, dynamic>> get breakdownItems {
    final pb = _pbMap;
    if (pb != null && pb['items'] is List && (pb['items'] as List).isNotEmpty) {
      return (pb['items'] as List).whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList();
    }
    return [
      {
        'key': 'base_amount',
        'label': 'Base Airtime Broadcast Fee',
        'amount': baseBudget,
        'type': 'base',
      }
    ];
  }

  int get estimatedCommuters => totalScreens * 1200;

  Map<String, dynamic>? get paymentMap {
    if (rawJson?['payment'] is Map) return Map<String, dynamic>.from(rawJson!['payment'] as Map);
    return null;
  }

  String get offlineMethod => paymentMap?['offline_method']?.toString() ?? 'Manual Instrument';
  String get paymentReference => paymentMap?['reference_number']?.toString() ?? paymentMap?['cheque_number']?.toString() ?? paymentMap?['utr_number']?.toString() ?? 'N/A';
  String? get paymentBankName => paymentMap?['bank_name']?.toString();
  String? get paymentChequeDateDisplay {
    final cd = paymentMap?['cheque_date'];
    if (cd == null) return null;
    try {
      final dt = DateTime.parse(cd.toString());
      return '${dt.day} ${_monthName(dt.month)} ${dt.year}';
    } catch (_) {
      return cd.toString();
    }
  }

  String? get paymentSettledOnDisplay {
    final p = paymentMap?['paid_at'] ?? paymentMap?['collected_at'];
    if (p == null) return null;
    try {
      final dt = DateTime.parse(p.toString());
      return '${dt.day} ${_monthName(dt.month)} ${dt.year}, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return p.toString();
    }
  }

  String? get paymentCollectorName {
    final col = paymentMap?['collector'];
    if (col is Map && col['name'] != null) return col['name'].toString();
    return null;
  }

  double? get paymentRecordedAmount {
    if (paymentMap?['amount'] != null) return double.tryParse(paymentMap!['amount'].toString());
    return null;
  }

  String? get paymentTransactionId => paymentMap?['transaction_id']?.toString();
  String? get paymentVerifiedByName => paymentMap?['verified_by_name']?.toString();
  String? get paymentRemarks => paymentMap?['remarks']?.toString();
  String? get paymentProofUrl {
    final p = paymentMap?['proof_url']?.toString();
    if (p != null && p.isNotEmpty) return ApiConstants.resolveFileUrl(p);
    return null;
  }

  bool get isPaymentSettled => (rawJson?['payment_status']?.toString().toLowerCase() == 'paid' || paymentStatus == 'Paid' || paymentStatus == 'Gov Cleared' || paymentStatus == 'Treasury Paid');
  bool get isLiveBroadcast => (status?.toLowerCase() == 'live' || status?.toLowerCase() == 'running');
  bool get isPausedBroadcast => (status?.toLowerCase() == 'paused');
  bool get isApprovedStatus => (status?.toLowerCase() == 'approved' || isLiveBroadcast || isPausedBroadcast || isPaymentSettled);
  bool get isPaymentPending => (status?.toLowerCase() == 'approved') && !isPaymentSettled;

  String get publicCheckoutUrl {
    final cid = id ?? code ?? '';
    final token = rawJson?['payment_token']?.toString() ?? cid;
    return 'https://vmovexa.com/campaigns/$cid/pay?token=$token';
  }

  String get trackingGatewayUrl {
    final q = qrCodeId ?? qrCode ?? 'VMX-QR-$displayCode';
    return 'https://vmovexa.com/track/qr/$q';
  }
}

/// Represents an Emergency Broadcast
class EmergencyBroadcastModel {
  final String? id;
  final String? code;
  final String? title;
  final String? headline;
  final String? message;
  final String? bodyText;
  final String? authority;
  final String? emergencyNumber;
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
    this.code,
    this.title,
    this.headline,
    this.message,
    this.bodyText,
    this.authority,
    this.emergencyNumber,
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
    final rawId = json['id']?.toString();

    return EmergencyBroadcastModel(
      id: rawId,
      code: json['code']?.toString() ?? (rawId != null && rawId.isNotEmpty ? (rawId.startsWith('EMG-') ? rawId : 'EMG-$rawId') : 'EMG-101'),
      title: json['title']?.toString() ?? json['headline']?.toString() ?? 'Emergency Broadcast',
      headline: json['headline']?.toString() ?? json['title']?.toString(),
      message: json['message']?.toString() ?? json['bodyText']?.toString() ?? json['body_text']?.toString() ?? '',
      bodyText: json['bodyText']?.toString() ?? json['body_text']?.toString() ?? json['message']?.toString(),
      authority: json['authority']?.toString() ?? 'Government Authority',
      emergencyNumber: json['emergencyNumber']?.toString() ?? json['emergency_number']?.toString() ?? json['helpline']?.toString(),
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

  bool get isRevocable => status != 'revoked' && status != 'expired';

  String get resolvedMediaUrl => ApiConstants.resolveFileUrl(mediaUrl);

  String get displayCode => (code != null && code!.isNotEmpty) ? code! : ((id != null && id!.isNotEmpty) ? (id!.startsWith('EMG-') ? id! : 'EMG-$id') : 'EMG-101');

  String get displayHeadline => (headline != null && headline!.trim().isNotEmpty) ? headline!.trim() : (title ?? 'Emergency Advisory');

  String get displayScope => (targetScope == 'all' || targetScope == 'all_screens') ? 'Entire Transit Network' : (targetArea != null && targetArea!.isNotEmpty ? targetArea! : 'Selected Corridors');

  String get displayDuration => autoExpireMinutes != null ? '${(autoExpireMinutes! / 60).round()} Hours' : '6 Hours';

  int get affectedBusesCount => (targets != null && targets!.isNotEmpty) ? targets!.length : ((targetScope == 'all' || targetScope == 'all_screens') ? 248 : 12);

  bool get isLiveOverride => (active == true || (status ?? '').toLowerCase() == 'active') && (status ?? '').toLowerCase() != 'revoked' && (status ?? '').toLowerCase() != 'expired';

  bool get isPendingApproval => (status ?? '').toLowerCase() == 'pending_approval' || (status ?? '').toLowerCase() == 'pending';

  bool get isApproved => (status ?? '').toLowerCase() == 'approved';

  bool get isRevoked => (status ?? '').toLowerCase() == 'revoked';

  bool get isExpired => (status ?? '').toLowerCase() == 'expired';

  bool get canDelete => !active && (status ?? '').toLowerCase() != 'approved';
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
  final int uniqueScans;
  final int totalVehicles;
  final int monitoredBuses;
  final int averageReach;
  final Map<String, dynamic> qrDeviceBreakdown;
  final List<dynamic> topCampaigns;
  final List<dynamic> daysTrend;
  final Map<String, dynamic>? rawJson;

  GovAnalyticsModel({
    this.totalCampaigns = 0,
    this.activeCampaigns = 0,
    this.pendingApprovals = 0,
    this.completedCampaigns = 0,
    this.emergencyBroadcasts = 0,
    this.totalImpressions = 0,
    this.totalScans = 0,
    this.uniqueScans = 0,
    this.totalVehicles = 0,
    this.monitoredBuses = 0,
    this.averageReach = 84,
    this.qrDeviceBreakdown = const {},
    this.topCampaigns = const [],
    this.daysTrend = const [],
    this.rawJson,
  });

  factory GovAnalyticsModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return GovAnalyticsModel();

    final kpis = json['kpis'] is Map ? Map<String, dynamic>.from(json['kpis']) : json;
    final deviceMap = json['qrDeviceBreakdown'] is Map ? Map<String, dynamic>.from(json['qrDeviceBreakdown']) : <String, dynamic>{};
    final topList = json['topCampaigns'] is List ? List<dynamic>.from(json['topCampaigns']) : <dynamic>[];
    final trendList = json['daysTrend'] is List ? List<dynamic>.from(json['daysTrend']) : <dynamic>[];

    return GovAnalyticsModel(
      totalCampaigns: int.tryParse(kpis['totalCampaigns']?.toString() ?? '0') ?? 0,
      activeCampaigns: int.tryParse(kpis['activeCampaigns']?.toString() ?? '0') ?? 0,
      pendingApprovals: int.tryParse(kpis['pendingApprovals']?.toString() ?? '0') ?? 0,
      completedCampaigns: int.tryParse(kpis['completedCampaigns']?.toString() ?? '0') ?? 0,
      emergencyBroadcasts: int.tryParse(kpis['emergencyBroadcasts']?.toString() ?? '0') ?? 0,
      totalImpressions: int.tryParse(kpis['totalImpressions']?.toString() ?? '0') ?? 0,
      totalScans: int.tryParse(kpis['totalScans']?.toString() ?? '0') ?? 0,
      uniqueScans: int.tryParse(kpis['uniqueScans']?.toString() ?? '0') ?? 0,
      totalVehicles: int.tryParse(kpis['totalVehicles']?.toString() ?? kpis['monitoredBuses']?.toString() ?? '0') ?? 0,
      monitoredBuses: int.tryParse(kpis['monitoredBuses']?.toString() ?? '0') ?? 0,
      averageReach: int.tryParse(kpis['averageReach']?.toString() ?? '84') ?? 84,
      qrDeviceBreakdown: deviceMap,
      topCampaigns: topList,
      daysTrend: trendList,
      rawJson: json,
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

/// Represents an attached media asset in Emergency Broadcast
class EmergencyMediaItem {
  final String id;
  String name;
  String type; // 'Image', 'Video', 'PDF', 'URL'
  String? localPath;
  String? url;
  String? previewUrl;
  String size;
  String resolution;
  int durationSec;
  int displayDurationSec;

  EmergencyMediaItem({
    required this.id,
    required this.name,
    required this.type,
    this.localPath,
    this.url,
    this.previewUrl,
    this.size = '1.0 MB',
    this.resolution = '1920x1080',
    this.durationSec = 15,
    this.displayDurationSec = 15,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'mediaType': type.toLowerCase(),
    'mediaUrl': url ?? previewUrl ?? '',
    'displayDurationSec': displayDurationSec,
  };
}

/// Represents a Transit Route for targeting selection
class FleetRouteOptionModel {
  final String routeKey;
  final String? fleetId;
  final String? fleetName;
  final String? organizationId;
  final String id;
  final String name;
  final String code;
  final String city;
  final List<FleetVehicleOptionModel> vehicles;
  final int vehicleCount;
  final int screensPerVehicle;
  final int totalScreens;

  FleetRouteOptionModel({
    required this.routeKey,
    this.fleetId,
    this.fleetName,
    this.organizationId,
    required this.id,
    required this.name,
    required this.code,
    required this.city,
    required this.vehicles,
    required this.vehicleCount,
    required this.screensPerVehicle,
    required this.totalScreens,
  });
}

/// Represents an individual vehicle in a fleet route
class FleetVehicleOptionModel {
  final String id;
  final String busNumber;
  final int displaysCount;

  FleetVehicleOptionModel({
    required this.id,
    required this.busNumber,
    required this.displaysCount,
  });
}

