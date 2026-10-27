import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Payment status for payment details
enum PaymentStatus { paid, pending, overdue }

extension PaymentStatusX on PaymentStatus {
  String get label {
    switch (this) {
      case PaymentStatus.paid:
        return 'Payment Successful';
      case PaymentStatus.pending:
        return 'Awaiting Settlement';
      case PaymentStatus.overdue:
        return 'Transaction Failed';
    }
  }

  Color get color {
    switch (this) {
      case PaymentStatus.paid:
        return const Color(0xFF10B981); // emerald green
      case PaymentStatus.pending:
        return const Color(0xFFF59E0B); // amber
      case PaymentStatus.overdue:
        return const Color(0xFFEF4444); // red
    }
  }

  Color get bgColor {
    switch (this) {
      case PaymentStatus.paid:
        return const Color(0xFF064E3B).withOpacity(0.35);
      case PaymentStatus.pending:
        return const Color(0xFF78350F).withOpacity(0.35);
      case PaymentStatus.overdue:
        return const Color(0xFF7F1D1D).withOpacity(0.35);
    }
  }

  Color get borderColor {
    switch (this) {
      case PaymentStatus.paid:
        return const Color(0xFF059669).withOpacity(0.4);
      case PaymentStatus.pending:
        return const Color(0xFFD97706).withOpacity(0.4);
      case PaymentStatus.overdue:
        return const Color(0xFFDC2626).withOpacity(0.4);
    }
  }

  IconData get icon {
    switch (this) {
      case PaymentStatus.paid:
        return Icons.check_circle_rounded;
      case PaymentStatus.pending:
        return Icons.hourglass_top_rounded;
      case PaymentStatus.overdue:
        return Icons.error_outline_rounded;
    }
  }
}

/// Timeline event model
class TimelineEvent {
  final String title;
  final String desc;
  final String date;
  final bool isCompleted;

  const TimelineEvent({
    required this.title,
    required this.desc,
    required this.date,
    required this.isCompleted,
  });
}

/// Comprehensive Payment Detail Model matching Admin Panel 1:1
class PaymentDetailModel {
  final String id;
  final String code;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final String statusRaw;
  final String purpose;
  final String paymentMethod;
  final String gatewayName;
  final String paymentRef;
  final String orderRef;
  final String payerType;
  final String clientType;
  final DateTime? paidAt;
  final DateTime? createdAt;
  final DateTime? dueDate;

  // Itemized Tax Breakdown
  final double subtotal;
  final double cgstAmount;
  final double sgstAmount;
  final double taxAmount;
  final double totalAmount;

  // Invoice Details
  final String? invoiceId;
  final String? invoiceCode;
  final String? invoiceStatus;

  // Payer / Client Profile
  final String clientName;
  final String clientCompany;
  final String clientPhone;
  final String clientEmail;
  final String fullAddress;
  final String clientCity;
  final String clientState;
  final String clientPincode;

  // Associated Campaign Details
  final String? campaignId;
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

  // Associated Subscription Details
  final String? subscriptionPlanName;
  final String? subscriptionCode;
  final String? subscriptionStatus;

  // Audit Timeline
  final List<TimelineEvent> timeline;

  const PaymentDetailModel({
    required this.id,
    required this.code,
    required this.amount,
    required this.currency,
    required this.status,
    required this.statusRaw,
    required this.purpose,
    required this.paymentMethod,
    required this.gatewayName,
    required this.paymentRef,
    required this.orderRef,
    required this.payerType,
    required this.clientType,
    this.paidAt,
    this.createdAt,
    this.dueDate,
    required this.subtotal,
    required this.cgstAmount,
    required this.sgstAmount,
    required this.taxAmount,
    required this.totalAmount,
    this.invoiceId,
    this.invoiceCode,
    this.invoiceStatus,
    required this.clientName,
    required this.clientCompany,
    required this.clientPhone,
    required this.clientEmail,
    required this.fullAddress,
    required this.clientCity,
    required this.clientState,
    required this.clientPincode,
    this.campaignId,
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
    this.subscriptionCode,
    this.subscriptionStatus,
    required this.timeline,
  });

  String get readableMethod {
    final raw = paymentMethod.toLowerCase();
    if (raw.contains('card')) return 'Credit / Debit Card';
    if (raw == 'upi') return 'UPI / QR Transfer';
    if (raw == 'netbanking') return 'Internet Banking';
    if (raw == 'bank_transfer' || raw == 'neft' || raw == 'rtgs') return 'Bank Transfer (NEFT / RTGS)';
    if (raw == 'cheque') return 'Cheque Clearance';
    if (paymentMethod.isNotEmpty && paymentMethod != '—') {
      return paymentMethod.replaceAll('_', ' ').split(' ').map((w) => w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1)}' : '').join(' ');
    }
    return 'Bank Transfer';
  }

  String get readablePurpose {
    switch (purpose.toLowerCase()) {
      case 'ad_spend':
        return 'Transit DOOH Advertising Campaign';
      case 'saas_subscription':
        return 'Fleet Management SaaS Subscription';
      case 'psa_spend':
        return 'Public Service Announcement (PSA)';
      case 'payout':
        return 'Fleet Operator Revenue Share Payout';
      default:
        if (purpose.isNotEmpty && purpose != '—') {
          return purpose.replaceAll('_', ' ').split(' ').map((w) => w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1)}' : '').join(' ');
        }
        return 'Commercial Settlement';
    }
  }

  String get readablePayerType {
    switch (payerType.toLowerCase()) {
      case 'advertiser':
        return 'Advertiser (Brand Client)';
      case 'tenant':
        return 'Fleet Operator (Tenant)';
      case 'government':
        return 'Government Agency';
      default:
        return 'Corporate Enterprise';
    }
  }

  String get settlementDateFormatted {
    final dt = paidAt ?? createdAt;
    if (dt == null) return 'Pending';
    return DateFormat('dd MMM yyyy, hh:mm a').format(dt);
  }

  factory PaymentDetailModel.fromJson(Map<String, dynamic> json) {
    final id = (json['id'] ?? json['payment_id'] ?? json['transaction_id'] ?? '').toString();
    final code = (json['code'] ?? (id.isNotEmpty ? 'PAY-$id' : 'PAY-0001')).toString();

    // Amount parsing
    final totalAmount = double.tryParse((json['amount'] ?? json['total'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;

    // Status parsing
    final rawStatus = (json['status'] ?? 'pending').toString().toLowerCase();
    PaymentStatus status = PaymentStatus.pending;
    if (rawStatus == 'paid' || rawStatus == 'success' || rawStatus == 'completed') {
      status = PaymentStatus.paid;
    } else if (rawStatus == 'failed' || rawStatus == 'overdue') {
      status = PaymentStatus.overdue;
    }

    final currency = (json['currency'] ?? 'INR').toString().toUpperCase();
    final purpose = (json['purpose'] ?? 'ad_spend').toString();
    final paymentMethod = (json['method'] ?? json['payment_method'] ?? json['gateway'] ?? 'Bank Transfer').toString();

    // Gateway
    String gatewayName = 'Razorpay Gateway';
    if (json['gateway'] is Map) {
      gatewayName = (json['gateway']['name'] ?? 'Razorpay Gateway').toString();
    } else if (json['gateway'] != null && json['gateway'].toString().isNotEmpty) {
      gatewayName = json['gateway'].toString();
    }

    final paymentRef = (json['gateway_ref'] ?? json['txn_ref'] ?? json['transaction_id'] ?? json['gateway_payment_id'] ?? json['reference_number'] ?? '—').toString();
    final orderRef = (json['gateway_order_id'] ?? json['order_id'] ?? '—').toString();
    final payerType = (json['payer_type'] ?? 'advertiser').toString();
    final clientType = (json['client_type'] ?? 'app').toString();

    // Dates
    DateTime? paidAt;
    if (json['paid_at'] != null) paidAt = DateTime.tryParse(json['paid_at'].toString());
    DateTime? createdAt;
    if (json['created_at'] != null) createdAt = DateTime.tryParse(json['created_at'].toString());
    DateTime? dueDate;
    if (json['due_date'] != null) dueDate = DateTime.tryParse(json['due_date'].toString());

    // Invoice sub-object
    final invoiceMap = json['invoice'] is Map ? Map<String, dynamic>.from(json['invoice']) : null;
    final String? invoiceId = invoiceMap != null ? (invoiceMap['id'] ?? invoiceMap['_id'])?.toString() : (json['invoice_id']?.toString());
    final String? invoiceCode = invoiceMap != null ? (invoiceMap['code'] ?? invoiceMap['invoice_number'])?.toString() : (json['invoice_code']?.toString());
    final String? invoiceStatus = invoiceMap != null ? (invoiceMap['status'])?.toString() : null;

    // Financial itemized GST breakdown calculation matching PaymentDetailsPage.jsx
    double subtotal = 0.0;
    if (invoiceMap != null && invoiceMap['subtotal'] != null) {
      subtotal = double.tryParse(invoiceMap['subtotal'].toString().replaceAll(',', '')) ?? 0.0;
    } else if (totalAmount > 0) {
      subtotal = double.parse((totalAmount / 1.18).toStringAsFixed(2));
    }

    double cgst = 0.0;
    if (invoiceMap != null && invoiceMap['cgst_amount'] != null) {
      cgst = double.tryParse(invoiceMap['cgst_amount'].toString().replaceAll(',', '')) ?? 0.0;
    } else if (totalAmount > 0) {
      cgst = double.parse(((totalAmount - subtotal) / 2).toStringAsFixed(2));
    }

    double sgst = 0.0;
    if (invoiceMap != null && invoiceMap['sgst_amount'] != null) {
      sgst = double.tryParse(invoiceMap['sgst_amount'].toString().replaceAll(',', '')) ?? 0.0;
    } else if (totalAmount > 0) {
      sgst = double.parse(((totalAmount - subtotal) / 2).toStringAsFixed(2));
    }

    double taxTotal = 0.0;
    if (invoiceMap != null && invoiceMap['tax_amount'] != null) {
      taxTotal = double.tryParse(invoiceMap['tax_amount'].toString().replaceAll(',', '')) ?? 0.0;
    } else {
      taxTotal = double.parse((cgst + sgst).toStringAsFixed(2));
    }

    // Campaign sub-object
    final campaignMap = json['campaign'] is Map ? Map<String, dynamic>.from(json['campaign']) : null;
    final advertiserMap = json['advertiser'] is Map ? Map<String, dynamic>.from(json['advertiser']) : null;
    final organizationMap = json['organization'] is Map ? Map<String, dynamic>.from(json['organization']) : null;

    // Payer details
    final clientName = (campaignMap?['client_name'] ??
            invoiceMap?['customer_name'] ??
            json['customer_name'] ??
            advertiserMap?['name'] ??
            'Client / Brand Partner')
        .toString();

    final clientCompany = (campaignMap?['client_company'] ??
            invoiceMap?['organization']?['name'] ??
            organizationMap?['name'] ??
            advertiserMap?['company_name'] ??
            '—')
        .toString();

    final clientPhone = (campaignMap?['client_phone'] ??
            invoiceMap?['phone'] ??
            json['customer_phone'] ??
            '—')
        .toString();

    final clientEmail = (campaignMap?['client_email'] ??
            invoiceMap?['email'] ??
            json['customer_email'] ??
            '—')
        .toString();

    final clientCity = (campaignMap?['client_city'] ?? json['city'] ?? '—').toString();
    final clientState = (campaignMap?['client_state'] ?? json['state'] ?? '').toString();
    final clientPincode = (campaignMap?['client_pincode'] ?? json['pincode'] ?? '').toString();
    final fullAddress = (invoiceMap?['billing_address'] ??
            campaignMap?['client_address'] ??
            json['address'] ??
            '—')
        .toString();

    // Campaign specs
    String? campaignId;
    String? campaignTitle;
    String? campaignBrand;
    String? campaignStatus;
    String? campaignPlacement;
    String? campaignTargetingMode;
    int? campaignDurationSec;
    String? campaignSlotType;
    String? campaignCategory;
    String? campaignObjective;
    double? campaignBudget;

    if (campaignMap != null) {
      campaignId = (campaignMap['id'] ?? campaignMap['_id'])?.toString();
      campaignTitle = campaignMap['title']?.toString();
      campaignBrand = campaignMap['brand_name']?.toString();
      campaignStatus = campaignMap['status']?.toString();
      campaignPlacement = campaignMap['placement']?.toString();
      campaignTargetingMode = campaignMap['targeting_mode']?.toString();
      campaignDurationSec = int.tryParse((campaignMap['duration_per_play_sec'] ?? 15).toString());
      campaignSlotType = campaignMap['slot_type']?.toString();
      campaignCategory = campaignMap['category']?.toString();
      campaignObjective = campaignMap['objective']?.toString();
      campaignBudget = double.tryParse((campaignMap['budget'] ?? totalAmount).toString().replaceAll(',', ''));
    }

    // Subscription specs
    final subMap = json['subscription'] is Map ? Map<String, dynamic>.from(json['subscription']) : null;
    String? subscriptionPlanName;
    String? subscriptionCode;
    String? subscriptionStatus;
    if (subMap != null) {
      subscriptionPlanName = subMap['plan_name']?.toString();
      subscriptionCode = (subMap['code'] ?? 'SUB-${subMap['id']}').toString();
      subscriptionStatus = subMap['status']?.toString();
    }

    // 4-step Timeline Reconciliation
    final createdDateStr = createdAt != null ? DateFormat('dd MMM yyyy, hh:mm a').format(createdAt) : '—';
    final paidDateStr = paidAt != null ? DateFormat('dd MMM yyyy, hh:mm a').format(paidAt) : (status == PaymentStatus.paid ? 'Settled' : 'Pending');

    final timeline = <TimelineEvent>[
      TimelineEvent(
        title: 'Payment Created',
        desc: 'Invoice & checkout session initiated',
        date: createdDateStr,
        isCompleted: true,
      ),
      TimelineEvent(
        title: 'Gateway Authorized',
        desc: '$gatewayName authenticated transaction',
        date: paidAt != null ? paidDateStr : (status == PaymentStatus.paid ? 'Authorized' : 'Pending'),
        isCompleted: paidAt != null || status == PaymentStatus.paid,
      ),
      TimelineEvent(
        title: 'Bank Nodal Settlement',
        desc: 'Funds credited to VMOVEXA nodal escrow account',
        date: status == PaymentStatus.paid ? (paidAt != null ? DateFormat('dd MMM yyyy').format(paidAt) : 'Settled') : 'Pending',
        isCompleted: status == PaymentStatus.paid,
      ),
      TimelineEvent(
        title: 'Invoice & Ledger Reconciled',
        desc: 'Tax invoice updated & audit ledger marked verified',
        date: status == PaymentStatus.paid ? 'Verified ✓' : 'Awaiting Settlement',
        isCompleted: status == PaymentStatus.paid,
      ),
    ];

    return PaymentDetailModel(
      id: id,
      code: code,
      amount: totalAmount,
      currency: currency,
      status: status,
      statusRaw: rawStatus,
      purpose: purpose,
      paymentMethod: paymentMethod,
      gatewayName: gatewayName,
      paymentRef: paymentRef,
      orderRef: orderRef,
      payerType: payerType,
      clientType: clientType,
      paidAt: paidAt,
      createdAt: createdAt,
      dueDate: dueDate,
      subtotal: subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      taxAmount: taxTotal,
      totalAmount: totalAmount,
      invoiceId: invoiceId,
      invoiceCode: invoiceCode,
      invoiceStatus: invoiceStatus,
      clientName: clientName,
      clientCompany: clientCompany,
      clientPhone: clientPhone,
      clientEmail: clientEmail,
      fullAddress: fullAddress,
      clientCity: clientCity,
      clientState: clientState,
      clientPincode: clientPincode,
      campaignId: campaignId,
      campaignTitle: campaignTitle,
      campaignBrand: campaignBrand,
      campaignStatus: campaignStatus,
      campaignPlacement: campaignPlacement,
      campaignTargetingMode: campaignTargetingMode,
      campaignDurationSec: campaignDurationSec,
      campaignSlotType: campaignSlotType,
      campaignCategory: campaignCategory,
      campaignObjective: campaignObjective,
      campaignBudget: campaignBudget,
      subscriptionPlanName: subscriptionPlanName,
      subscriptionCode: subscriptionCode,
      subscriptionStatus: subscriptionStatus,
      timeline: timeline,
    );
  }
}
