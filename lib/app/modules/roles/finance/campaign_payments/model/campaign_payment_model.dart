import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CampaignMediaAsset {
  final String id;
  final String fileUrl;
  final String mediaType; // 'video', 'image', 'pdf', 'url'
  final int durationSec;
  final String resolution;

  const CampaignMediaAsset({
    required this.id,
    required this.fileUrl,
    required this.mediaType,
    required this.durationSec,
    required this.resolution,
  });

  factory CampaignMediaAsset.fromJson(Map<String, dynamic> json) {
    return CampaignMediaAsset(
      id: json['id']?.toString() ?? '',
      fileUrl: json['file_url']?.toString() ?? json['fileUrl']?.toString() ?? json['url']?.toString() ?? '',
      mediaType: (json['media_type'] ?? json['mediaType'] ?? json['type'] ?? 'image').toString().toLowerCase(),
      durationSec: int.tryParse((json['display_duration_sec'] ?? json['duration_sec'] ?? json['duration'] ?? 15).toString()) ?? 15,
      resolution: json['resolution']?.toString() ?? 'Standard',
    );
  }
}

class CampaignPaymentModel {
  final String id;
  final String code;
  final String title;
  final String brandName;
  final String status; // 'live', 'approved', 'completed', 'paused', 'rejected'
  final String paymentStatus; // 'paid', 'pending'
  final double budget; // Base / Taxable
  final double taxAmount; // GST
  final double totalPayable; // Gross Incl. GST
  final String? paymentMethod;
  final String? paymentToken;
  final String? scheduleStatus;
  final String slotType;
  final int durationPerPlaySec;
  final DateTime? startDate;
  final DateTime? endDate;
  final int durationDays;
  final String broadcastStartTime;
  final String broadcastEndTime;
  final String activeDaysFormatted;
  final String frequency;

  // Customer & Client Profile
  final String clientName;
  final String clientCompany;
  final String clientPhone;
  final String clientEmail;
  final String clientCity;
  final String clientState;
  final String clientAddress;
  final String advertiserCompanyName;
  final String advertiserEmail;

  // Payment Settlement
  final DateTime? paidAt;
  final String paymentCode;
  final String gatewayRef;
  final String collectorName;

  // Media
  final List<CampaignMediaAsset> media;
  final Map<String, dynamic> rawData;

  const CampaignPaymentModel({
    required this.id,
    required this.code,
    required this.title,
    required this.brandName,
    required this.status,
    required this.paymentStatus,
    required this.budget,
    required this.taxAmount,
    required this.totalPayable,
    this.paymentMethod,
    this.paymentToken,
    this.scheduleStatus,
    required this.slotType,
    required this.durationPerPlaySec,
    this.startDate,
    this.endDate,
    required this.durationDays,
    required this.broadcastStartTime,
    required this.broadcastEndTime,
    required this.activeDaysFormatted,
    required this.frequency,
    required this.clientName,
    required this.clientCompany,
    required this.clientPhone,
    required this.clientEmail,
    required this.clientCity,
    required this.clientState,
    required this.clientAddress,
    required this.advertiserCompanyName,
    required this.advertiserEmail,
    this.paidAt,
    required this.paymentCode,
    required this.gatewayRef,
    required this.collectorName,
    required this.media,
    required this.rawData,
  });

  factory CampaignPaymentModel.fromJson(Map<String, dynamic> json) {
    final rawId = json['id']?.toString() ?? '';
    final codeStr = json['code']?.toString() ??
        json['campaign_code']?.toString() ??
        (rawId.isNotEmpty ? 'CMP-$rawId' : 'CMP-${DateTime.now().millisecondsSinceEpoch}');

    final titleStr = json['title']?.toString() ??
        json['name']?.toString() ??
        json['campaign_name']?.toString() ??
        'Commercial Campaign';

    final brandStr = json['brand_name']?.toString() ?? json['brand']?.toString() ?? '';
    final statusStr = (json['status'] ?? 'pending').toString().toLowerCase();
    final paymentStatusStr = (json['payment_status'] ?? json['paymentStatus'] ?? 'pending').toString().toLowerCase();

    // Financials
    final parsedBudget = double.tryParse((json['taxable_amount'] ?? json['budget'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final parsedTax = double.tryParse((json['tax_amount'] ?? (parsedBudget * 0.18)).toString().replaceAll(',', '')) ?? 0.0;
    final parsedTotal = double.tryParse((json['total_payable'] ?? json['total_amount'] ?? json['total'] ?? (parsedBudget + parsedTax)).toString().replaceAll(',', '')) ?? (parsedBudget + parsedTax);

    // Dates & Schedule
    DateTime? start;
    final rawStart = json['start_date'] ?? json['startDate'];
    if (rawStart != null) start = DateTime.tryParse(rawStart.toString());

    DateTime? end;
    final rawEnd = json['end_date'] ?? json['endDate'];
    if (rawEnd != null) end = DateTime.tryParse(rawEnd.toString());

    int duration = int.tryParse(json['duration_days']?.toString() ?? json['durationDays']?.toString() ?? '1') ?? 1;
    if (duration <= 1 && start != null && end != null) {
      final diff = end.difference(start).inDays + 1;
      if (diff > 0) duration = diff;
    }

    final startT = json['broadcast_start_time']?.toString() ?? '08:00:00';
    final endT = json['broadcast_end_time']?.toString() ?? '22:00:00';

    // Format active days
    String daysStr = 'every_day'.tr;
    final rawDays = json['active_days'] ?? json['activeDays'];
    if (rawDays is List && rawDays.isNotEmpty) {
      daysStr = rawDays.join(', ');
    } else if (rawDays is String && rawDays.trim().isNotEmpty) {
      daysStr = rawDays.trim();
    }

    // Client Profile
    final clientN = json['client_name']?.toString() ?? '';
    final clientC = json['client_company']?.toString() ?? '';
    final clientP = json['client_phone']?.toString() ?? '';
    final clientE = json['client_email']?.toString() ?? '';
    final clientCityStr = json['client_city']?.toString() ?? '';
    final clientStateStr = json['client_state']?.toString() ?? '';
    final clientAddr = json['client_address']?.toString() ?? '';

    // Advertiser
    final adv = json['advertiser'] is Map ? Map<String, dynamic>.from(json['advertiser'] as Map) : null;
    final advComp = adv?['company_name']?.toString() ?? adv?['name']?.toString() ?? '';
    final advEmail = adv?['user'] is Map ? adv!['user']['email']?.toString() ?? '' : adv?['email']?.toString() ?? '';

    // Payment Settlement Info
    DateTime? paidTime;
    final rawPaid = json['paid_at'] ?? json['paidAt'] ?? json['payment']?['paid_at'];
    if (rawPaid != null) paidTime = DateTime.tryParse(rawPaid.toString());

    final pmt = json['payment'] is Map ? Map<String, dynamic>.from(json['payment'] as Map) : null;
    final pmtCode = pmt?['code']?.toString() ?? '';
    final gateRef = pmt?['gateway_ref']?.toString() ?? pmt?['transaction_id']?.toString() ?? '';
    final colName = pmt?['collector'] is Map ? pmt!['collector']['name']?.toString() ?? '' : '';

    // Media
    List<CampaignMediaAsset> mediaList = [];
    final rawMedia = json['media'] ?? json['creatives'] ?? json['media_assets'];
    if (rawMedia is List && rawMedia.isNotEmpty) {
      mediaList = rawMedia
          .whereType<Map>()
          .map((m) => CampaignMediaAsset.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    }

    return CampaignPaymentModel(
      id: rawId,
      code: codeStr,
      title: titleStr,
      brandName: brandStr,
      status: statusStr,
      paymentStatus: paymentStatusStr,
      budget: parsedBudget,
      taxAmount: parsedTax,
      totalPayable: parsedTotal,
      paymentMethod: json['payment_method']?.toString() ?? pmt?['method']?.toString(),
      paymentToken: json['payment_token']?.toString() ?? json['token']?.toString(),
      scheduleStatus: json['schedule_status']?.toString(),
      slotType: json['slot_type']?.toString() ?? 'Exclusive',
      durationPerPlaySec: int.tryParse(json['duration_per_play_sec']?.toString() ?? '15') ?? 15,
      startDate: start,
      endDate: end,
      durationDays: duration,
      broadcastStartTime: startT,
      broadcastEndTime: endT,
      activeDaysFormatted: daysStr,
      frequency: json['frequency']?.toString() ?? 'Daily loop',
      clientName: clientN,
      clientCompany: clientC,
      clientPhone: clientP,
      clientEmail: clientE,
      clientCity: clientCityStr,
      clientState: clientStateStr,
      clientAddress: clientAddr,
      advertiserCompanyName: advComp,
      advertiserEmail: advEmail,
      paidAt: paidTime,
      paymentCode: pmtCode,
      gatewayRef: gateRef,
      collectorName: colName,
      media: mediaList,
      rawData: json,
    );
  }

  bool get isPaid => paymentStatus == 'paid';
  bool get isLive => status == 'live';

  String get clientDisplayName {
    if (clientName.isNotEmpty) return clientName;
    if (clientCompany.isNotEmpty) return clientCompany;
    if (brandName.isNotEmpty) return brandName;
    if (advertiserCompanyName.isNotEmpty) return advertiserCompanyName;
    return 'client_customer_fallback'.tr;
  }

  Color get statusBadgeColor {
    switch (status) {
      case 'live':
        return const Color(0xFF10B981);
      case 'completed':
        return const Color(0xFF94A3B8);
      case 'paused':
        return const Color(0xFFF59E0B);
      case 'approved':
        return const Color(0xFF3B82F6);
      case 'rejected':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF64748B);
    }
  }

  Color get paymentBadgeColor => isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B);
}
