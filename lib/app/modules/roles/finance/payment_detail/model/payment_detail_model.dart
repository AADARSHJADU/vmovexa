import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

/// Payment status kind for UI themes
enum PaymentStatusKind { paid, pending, failed, refunded, other }

extension PaymentStatusKindX on PaymentStatusKind {
  Color get color {
    switch (this) {
      case PaymentStatusKind.paid:
        return const Color(0xFF10B981); // Emerald
      case PaymentStatusKind.pending:
        return const Color(0xFFF59E0B); // Amber
      case PaymentStatusKind.failed:
        return const Color(0xFFEF4444); // Red
      case PaymentStatusKind.refunded:
        return const Color(0xFF8B5CF6); // Violet
      case PaymentStatusKind.other:
        return const Color(0xFF64748B); // Slate
    }
  }

  Color get bgColor {
    return color.withValues(alpha: 0.12);
  }

  Color get borderColor {
    return color.withValues(alpha: 0.35);
  }
}

/// A real timestamp entry for Section 7: Recorded Timestamps
class PersistedTimestampEntry {
  final String label;
  final String value;

  const PersistedTimestampEntry({
    required this.label,
    required this.value,
  });
}

/// Comprehensive Payment Detail Model with ZERO dummy/mock fields
/// Matches Admin Panel `PaymentDetailsPage.jsx` exactly.
class PaymentDetailModel {
  final String id;
  final String code;
  final double amount;
  final String currency;
  final String rawStatus;
  final PaymentStatusKind statusKind;
  final String purpose;
  final String readablePurpose;
  final String paymentMode; // 'online' | 'offline'
  final bool isOffline;
  final String? rawMethod;
  final String readableMethod;
  final String? gatewayName;
  final String paymentRef;
  final String? orderRef;
  final String payerType;
  final String readablePayerType;
  final String clientType;
  final String readableClientType;

  // Real Dates
  final DateTime? createdAt;
  final DateTime? paidAt;
  final DateTime? collectedAt;
  final DateTime? chequeDate;

  // Section 3: Itemized Tax Breakdown
  final double? subtotal;
  final double cgstAmount;
  final double sgstAmount;
  final double igstAmount;
  final double taxAmount;
  final double totalAmount;

  // Section 3: Linked Invoice Details
  final String? invoiceId;
  final String? invoiceCode;
  final String? invoiceStatus;
  final DateTime? invoiceIssuedAt;
  final DateTime? invoicePaidAt;

  // Section 4: Offline Settlement Details
  final String? bankName;
  final String? branchName;
  final String? accountHolder;
  final String? utrNumber;
  final String? referenceNumber;
  final String? chequeNumber;
  final String? collectorName;
  final String? remarks;
  final String? proofUrl;

  // Section 5: Payer & Entity Profile (Real DB Fields)
  final String? clientName;
  final String? clientCompany;
  final String? clientPhone;
  final String? clientEmail;
  final String? clientGstin;
  final String? fullAddress;
  final String? clientCity;
  final String? clientState;
  final String? clientPincode;
  final String? locationLine;

  // Section 6: Associated Campaign (If Linked)
  final String? campaignId;
  final String? campaignCode;
  final String? campaignTitle;
  final String? campaignBrand;
  final String? campaignStatus;
  final String? campaignPlacement;
  final String? campaignTargetingMode;
  final int? campaignDurationSec;
  final String? campaignSlotType;
  final String? campaignCategory;
  final String? campaignObjective;
  final double? campaignBudget;

  // Section 6: Linked Subscription (If Linked)
  final String? subscriptionPlanName;
  final String? subscriptionPlanCode;
  final String? subscriptionStatus;
  final DateTime? subscriptionPeriodStart;
  final DateTime? subscriptionPeriodEnd;

  // Section 7: Recorded Timestamps
  final List<PersistedTimestampEntry> realTimestamps;

  PaymentDetailModel({
    required this.id,
    required this.code,
    required this.amount,
    required this.currency,
    required this.rawStatus,
    required this.statusKind,
    required this.purpose,
    required this.readablePurpose,
    required this.paymentMode,
    required this.isOffline,
    this.rawMethod,
    required this.readableMethod,
    this.gatewayName,
    required this.paymentRef,
    this.orderRef,
    required this.payerType,
    required this.readablePayerType,
    required this.clientType,
    required this.readableClientType,
    this.createdAt,
    this.paidAt,
    this.collectedAt,
    this.chequeDate,
    this.subtotal,
    required this.cgstAmount,
    required this.sgstAmount,
    required this.igstAmount,
    required this.taxAmount,
    required this.totalAmount,
    this.invoiceId,
    this.invoiceCode,
    this.invoiceStatus,
    this.invoiceIssuedAt,
    this.invoicePaidAt,
    this.bankName,
    this.branchName,
    this.accountHolder,
    this.utrNumber,
    this.referenceNumber,
    this.chequeNumber,
    this.collectorName,
    this.remarks,
    this.proofUrl,
    this.clientName,
    this.clientCompany,
    this.clientPhone,
    this.clientEmail,
    this.clientGstin,
    this.fullAddress,
    this.clientCity,
    this.clientState,
    this.clientPincode,
    this.locationLine,
    this.campaignId,
    this.campaignCode,
    this.campaignTitle,
    this.campaignBrand,
    this.campaignStatus,
    this.campaignPlacement,
    this.campaignTargetingMode,
    this.campaignDurationSec,
    this.campaignSlotType,
    this.campaignCategory,
    this.campaignObjective,
    this.campaignBudget,
    this.subscriptionPlanName,
    this.subscriptionPlanCode,
    this.subscriptionStatus,
    this.subscriptionPeriodStart,
    this.subscriptionPeriodEnd,
    required this.realTimestamps,
  });

  bool get hasPayerInfo =>
      clientName != null ||
      clientCompany != null ||
      clientPhone != null ||
      clientEmail != null ||
      clientGstin != null ||
      fullAddress != null ||
      locationLine != null;

  bool get hasCampaignOrSubscription =>
      campaignId != null || campaignTitle != null || subscriptionPlanName != null;

  bool get hasOfflineDetails =>
      isOffline &&
      (bankName != null ||
          branchName != null ||
          accountHolder != null ||
          utrNumber != null ||
          referenceNumber != null ||
          chequeNumber != null ||
          chequeDate != null ||
          collectorName != null ||
          remarks != null ||
          proofUrl != null);

  factory PaymentDetailModel.fromJson(Map<String, dynamic> json) {
    // Top-level payment fields
    final id = (json['id'] ?? '').toString();
    final code = (json['code'] ?? id).toString();

    final rawStatus = (json['status'] ?? '').toString().toLowerCase();
    PaymentStatusKind kind;
    if (rawStatus == 'success' || rawStatus == 'paid') {
      kind = PaymentStatusKind.paid;
    } else if (rawStatus == 'pending' || rawStatus == 'created') {
      kind = PaymentStatusKind.pending;
    } else if (rawStatus == 'failed' || rawStatus == 'overdue') {
      kind = PaymentStatusKind.failed;
    } else if (rawStatus == 'refunded') {
      kind = PaymentStatusKind.refunded;
    } else {
      kind = PaymentStatusKind.other;
    }

    final mode = (json['payment_mode'] ?? '').toString().toLowerCase();
    final isOff = mode == 'offline';

    final rawMethodKey = isOff
        ? (json['offline_method'] ?? json['method'])
        : (json['method'] ?? json['offline_method']);
    final rawMethodStr = rawMethodKey?.toString();

    // Map method label
    final readableMethodStr = _formatMethodLabel(rawMethodStr);

    final gateway = json['gateway'] is Map ? Map<String, dynamic>.from(json['gateway']) : null;
    final gatewayNameStr = (gateway?['name'] ?? json['gateway_name'])?.toString();

    final paymentRefStr = (json['utr_number'] ??
            json['reference_number'] ??
            json['cheque_number'] ??
            json['gateway_ref'] ??
            json['transaction_id'] ??
            code)
        .toString();

    final orderRefStr = json['gateway_order_id']?.toString();

    final rawPurpose = (json['purpose'] ?? '').toString();
    final readablePurposeStr = _formatPurposeLabel(rawPurpose);

    final rawPayerType = (json['payer_type'] ?? '').toString();
    final readablePayerTypeStr = _formatPayerTypeLabel(rawPayerType);

    final rawClientType = (json['client_type'] ?? '').toString();
    final readableClientTypeStr = rawClientType == 'app'
        ? 'Mobile App'
        : rawClientType == 'web'
            ? 'Web'
            : rawClientType.replaceAll('_', ' ');

    final currencyStr = (json['currency'] ?? 'INR').toString().toUpperCase();

    // Nested objects
    final invoice = json['invoice'] is Map ? Map<String, dynamic>.from(json['invoice']) : null;
    final org = json['organization'] is Map
        ? Map<String, dynamic>.from(json['organization'])
        : (invoice?['organization'] is Map ? Map<String, dynamic>.from(invoice!['organization']) : null);
    final adv = json['advertiser'] is Map ? Map<String, dynamic>.from(json['advertiser']) : null;
    final gov = json['government_agency'] is Map ? Map<String, dynamic>.from(json['government_agency']) : null;
    final camp = json['campaign'] is Map ? Map<String, dynamic>.from(json['campaign']) : null;
    final sub = json['subscription'] is Map ? Map<String, dynamic>.from(json['subscription']) : null;

    // Organization users
    final orgUsers = org?['users'] is List ? List<dynamic>.from(org!['users']) : [];
    Map<String, dynamic>? orgAdmin;
    for (final u in orgUsers) {
      if (u is Map) {
        final role = u['role'] is Map ? Map<String, dynamic>.from(u['role']) : null;
        if (role?['code']?.toString().toUpperCase() == 'ROLE-TENANT-ADMIN') {
          orgAdmin = Map<String, dynamic>.from(u);
          break;
        }
      }
    }
    if (orgAdmin == null && orgUsers.isNotEmpty && orgUsers.first is Map) {
      orgAdmin = Map<String, dynamic>.from(orgUsers.first);
    }

    // Amounts
    final totalAmt = double.tryParse((json['amount'] ?? invoice?['total'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final subtotalAmt = invoice?['subtotal'] != null
        ? double.tryParse(invoice!['subtotal'].toString().replaceAll(',', ''))
        : null;
    final cgstAmt = double.tryParse((invoice?['cgst_amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final sgstAmt = double.tryParse((invoice?['sgst_amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final igstAmt = double.tryParse((invoice?['igst_amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final taxAmt = double.tryParse((invoice?['tax_amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;

    // Dates
    final createdDt = _parseDateTime(json['created_at']);
    final paidDt = _parseDateTime(json['paid_at']);
    final collectedDt = _parseDateTime(json['collected_at']);
    final chequeDt = _parseDateTime(json['cheque_date']);
    final invIssuedDt = invoice != null ? _parseDateTime(invoice['issued_at']) : null;
    final invPaidDt = invoice != null ? _parseDateTime(invoice['paid_at']) : null;

    // Offline Fields
    final bankStr = (json['bank_name'] ?? '').toString().trim();
    final branchStr = (json['branch_name'] ?? '').toString().trim();
    final holderStr = (json['account_holder'] ?? '').toString().trim();
    final utrStr = (json['utr_number'] ?? '').toString().trim();
    final refStr = (json['reference_number'] ?? '').toString().trim();
    final chequeNumStr = (json['cheque_number'] ?? '').toString().trim();
    final collector = json['collector'] is Map ? Map<String, dynamic>.from(json['collector']) : null;
    final collectorNameStr = (collector?['name'] ?? json['verified_by_name'] ?? '').toString().trim();
    final remarksStr = (json['remarks'] ?? '').toString().trim();
    final proofStr = (json['proof_url'] ?? '').toString().trim();

    // Payer Profile (Strict DB Resolution)
    final clientNameResolved = (camp?['client_name'] ??
            invoice?['customer_name'] ??
            org?['name'] ??
            adv?['name'] ??
            gov?['name'] ??
            gov?['agency_name'] ??
            json['customer_name'] ??
            json['billing_name'])
        ?.toString()
        .trim();

    final clientCompanyResolved = (camp?['client_company'] ??
            org?['name'] ??
            adv?['company_name'] ??
            gov?['department'])
        ?.toString()
        .trim();

    final clientPhoneResolved = (camp?['client_phone'] ??
            orgAdmin?['phone'] ??
            adv?['phone'] ??
            gov?['phone'])
        ?.toString()
        .trim();

    final clientEmailResolved = (camp?['client_email'] ??
            orgAdmin?['email'] ??
            adv?['email'] ??
            gov?['email'])
        ?.toString()
        .trim();

    final clientGstinResolved = (invoice?['gstin'] ??
            org?['gstin'] ??
            adv?['gstin'])
        ?.toString()
        .trim();

    final fullAddressResolved = (invoice?['billing_address'] ??
            camp?['client_address'] ??
            org?['office_address'] ??
            adv?['address'] ??
            gov?['office_address'] ??
            gov?['address'])
        ?.toString()
        .trim();

    final cityResolved = (camp?['client_city'] ?? org?['city'] ?? adv?['city'] ?? gov?['city'])?.toString().trim();
    final stateResolved = (camp?['client_state'] ?? org?['state'] ?? adv?['state'] ?? gov?['state'])?.toString().trim();
    final pincodeResolved = (camp?['client_pincode'] ?? org?['pincode'] ?? adv?['pincode'] ?? gov?['pincode'])?.toString().trim();

    String? locationLineResolved;
    final cityState = [cityResolved, stateResolved].where((e) => e != null && e.isNotEmpty).join(', ');
    if (cityState.isNotEmpty && pincodeResolved != null && pincodeResolved.isNotEmpty) {
      locationLineResolved = '$cityState - $pincodeResolved';
    } else if (cityState.isNotEmpty) {
      locationLineResolved = cityState;
    } else if (pincodeResolved != null && pincodeResolved.isNotEmpty) {
      locationLineResolved = pincodeResolved;
    }

    // Campaign Details
    String? cId, cCode, cTitle, cBrand, cStatus, cPlacement, cSlotType, cCategory, cObjective;
    int? cDuration;
    double? cBudget;
    if (camp != null) {
      cId = camp['id']?.toString();
      cCode = camp['code']?.toString();
      cTitle = (camp['title'] ?? camp['name'])?.toString();
      cBrand = camp['brand_name']?.toString();
      cStatus = camp['status']?.toString();
      cPlacement = [camp['placement'], camp['targeting_mode']].where((e) => e != null && e.toString().isNotEmpty).join(' · ');
      cDuration = int.tryParse((camp['duration_per_play_sec'] ?? '').toString());
      cSlotType = camp['slot_type']?.toString();
      cCategory = [camp['category'], camp['objective']].where((e) => e != null && e.toString().isNotEmpty).join(' · ');
      cBudget = double.tryParse((camp['budget'] ?? '').toString().replaceAll(',', ''));
    }

    // Subscription Details
    String? subPlanName, subPlanCode, subStatus;
    DateTime? subPeriodStart, subPeriodEnd;
    if (sub != null) {
      final plan = sub['plan'] is Map ? Map<String, dynamic>.from(sub['plan']) : null;
      subPlanName = (plan?['name'] ?? sub['plan_type'])?.toString();
      subPlanCode = plan?['code']?.toString();
      subStatus = sub['status']?.toString();
      subPeriodStart = _parseDateTime(sub['current_period_start']);
      subPeriodEnd = _parseDateTime(sub['current_period_end']);
    }

    // Real Recorded Timestamps (Persisted DB Dates Only)
    final timestamps = <PersistedTimestampEntry>[];
    if (createdDt != null) {
      timestamps.add(PersistedTimestampEntry(
        label: 'Payment Recorded',
        value: _formatDisplayDateTime(createdDt),
      ));
    }
    if (collectedDt != null && collectedDt != paidDt) {
      timestamps.add(PersistedTimestampEntry(
        label: 'Collected At',
        value: _formatDisplayDateTime(collectedDt),
      ));
    }
    if (paidDt != null) {
      timestamps.add(PersistedTimestampEntry(
        label: 'Paid / Settled At',
        value: _formatDisplayDateTime(paidDt),
      ));
    }
    if (invIssuedDt != null) {
      timestamps.add(PersistedTimestampEntry(
        label: 'Invoice Issued At',
        value: _formatDisplayDateTime(invIssuedDt),
      ));
    }
    if (invPaidDt != null) {
      timestamps.add(PersistedTimestampEntry(
        label: 'Invoice Paid At',
        value: _formatDisplayDateTime(invPaidDt),
      ));
    }

    return PaymentDetailModel(
      id: id,
      code: code,
      amount: totalAmt,
      currency: currencyStr,
      rawStatus: rawStatus,
      statusKind: kind,
      purpose: rawPurpose,
      readablePurpose: readablePurposeStr,
      paymentMode: mode,
      isOffline: isOff,
      rawMethod: rawMethodStr,
      readableMethod: readableMethodStr,
      gatewayName: gatewayNameStr,
      paymentRef: paymentRefStr,
      orderRef: orderRefStr,
      payerType: rawPayerType,
      readablePayerType: readablePayerTypeStr,
      clientType: rawClientType,
      readableClientType: readableClientTypeStr,
      createdAt: createdDt,
      paidAt: paidDt,
      collectedAt: collectedDt,
      chequeDate: chequeDt,
      subtotal: subtotalAmt,
      cgstAmount: cgstAmt,
      sgstAmount: sgstAmt,
      igstAmount: igstAmt,
      taxAmount: taxAmt,
      totalAmount: totalAmt,
      invoiceId: invoice?['id']?.toString(),
      invoiceCode: invoice?['code']?.toString(),
      invoiceStatus: invoice?['status']?.toString(),
      invoiceIssuedAt: invIssuedDt,
      invoicePaidAt: invPaidDt,
      bankName: bankStr.isNotEmpty ? bankStr : null,
      branchName: branchStr.isNotEmpty ? branchStr : null,
      accountHolder: holderStr.isNotEmpty ? holderStr : null,
      utrNumber: utrStr.isNotEmpty ? utrStr : null,
      referenceNumber: refStr.isNotEmpty && refStr != utrStr ? refStr : null,
      chequeNumber: chequeNumStr.isNotEmpty ? chequeNumStr : null,
      collectorName: collectorNameStr.isNotEmpty ? collectorNameStr : null,
      remarks: remarksStr.isNotEmpty ? remarksStr : null,
      proofUrl: proofStr.isNotEmpty ? proofStr : null,
      clientName: clientNameResolved?.isNotEmpty == true ? clientNameResolved : null,
      clientCompany: clientCompanyResolved?.isNotEmpty == true ? clientCompanyResolved : null,
      clientPhone: clientPhoneResolved?.isNotEmpty == true ? clientPhoneResolved : null,
      clientEmail: clientEmailResolved?.isNotEmpty == true ? clientEmailResolved : null,
      clientGstin: clientGstinResolved?.isNotEmpty == true ? clientGstinResolved : null,
      fullAddress: fullAddressResolved?.isNotEmpty == true ? fullAddressResolved : null,
      clientCity: cityResolved?.isNotEmpty == true ? cityResolved : null,
      clientState: stateResolved?.isNotEmpty == true ? stateResolved : null,
      clientPincode: pincodeResolved?.isNotEmpty == true ? pincodeResolved : null,
      locationLine: locationLineResolved,
      campaignId: cId,
      campaignCode: cCode,
      campaignTitle: cTitle,
      campaignBrand: cBrand,
      campaignStatus: cStatus,
      campaignPlacement: cPlacement?.isNotEmpty == true ? cPlacement : null,
      campaignDurationSec: cDuration,
      campaignSlotType: cSlotType,
      campaignCategory: cCategory?.isNotEmpty == true ? cCategory : null,
      campaignObjective: cObjective,
      campaignBudget: cBudget,
      subscriptionPlanName: subPlanName,
      subscriptionPlanCode: subPlanCode,
      subscriptionStatus: subStatus,
      subscriptionPeriodStart: subPeriodStart,
      subscriptionPeriodEnd: subPeriodEnd,
      realTimestamps: timestamps,
    );
  }

  static DateTime? _parseDateTime(dynamic val) {
    if (val == null) return null;
    try {
      return DateTime.parse(val.toString());
    } catch (_) {
      return null;
    }
  }

  static String _formatDisplayDateTime(DateTime dt) {
    return DateFormat('dd MMM yyyy, hh:mm a').format(dt);
  }

  static String _formatMethodLabel(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    final map = {
      'upi': 'UPI',
      'upi_manual': 'UPI (Manual)',
      'netbanking': 'Net Banking',
      'bank_transfer': 'Bank Transfer',
      'bank_wire': 'Bank Wire',
      'neft': 'NEFT',
      'rtgs': 'RTGS',
      'imps': 'IMPS',
      'cheque': 'Cheque',
      'demand_draft': 'Demand Draft',
      'cash': 'Cash',
      'card': 'Card',
      'razorpay': 'Razorpay',
      'stripe': 'Stripe',
      'other': 'Other',
    };
    return map[raw.toLowerCase()] ?? raw.replaceAll('_', ' ').toUpperCase();
  }

  static String _formatPurposeLabel(String raw) {
    if (raw.isEmpty) return '—';
    final map = {
      'ad_spend': 'Advertising Campaign',
      'saas_subscription': 'SaaS Subscription',
      'psa_spend': 'Government / PSA Campaign',
      'payout': 'Payout',
      'wallet_topup': 'Wallet Top-up',
      'refund': 'Refund',
    };
    return map[raw.toLowerCase()] ?? raw.replaceAll('_', ' ').capitalizeFirst ?? raw;
  }

  static String _formatPayerTypeLabel(String raw) {
    if (raw.isEmpty) return '—';
    final map = {
      'advertiser': 'Advertiser',
      'tenant': 'Tenant Admin',
      'government': 'Government Agency',
      'platform': 'Platform',
    };
    return map[raw.toLowerCase()] ?? raw.replaceAll('_', ' ').capitalizeFirst ?? raw;
  }
}
