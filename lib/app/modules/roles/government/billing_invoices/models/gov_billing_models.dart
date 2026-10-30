// lib/app/modules/roles/government/billing_invoices/models/gov_billing_models.dart
import 'package:flutter/material.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';

/// Represents an itemized line item inside a Government Invoice
class GovInvoiceItemModel {
  final String id;
  final String description;
  final String hsnCode;
  final int quantity;
  final double unitRate;
  final double total;
  final double taxPercent;

  GovInvoiceItemModel({
    this.id = '',
    required this.description,
    this.hsnCode = '998313',
    this.quantity = 1,
    this.unitRate = 0.0,
    this.total = 0.0,
    this.taxPercent = 18.0,
  });

  factory GovInvoiceItemModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return GovInvoiceItemModel(description: 'Service item');

    double parseD(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0.0;
    }

    int parseI(dynamic v) {
      if (v == null) return 1;
      if (v is num) return v.toInt();
      return int.tryParse(v.toString()) ?? 1;
    }

    return GovInvoiceItemModel(
      id: json['id']?.toString() ?? '',
      description: json['description']?.toString() ?? json['name']?.toString() ?? 'Service Item',
      hsnCode: json['hsn_code']?.toString() ?? json['hsnCode']?.toString() ?? '998313',
      quantity: parseI(json['quantity'] ?? json['qty']),
      unitRate: parseD(json['unit_rate'] ?? json['rate'] ?? json['price']),
      total: parseD(json['total'] ?? json['amount']),
      taxPercent: parseD(json['tax_percent'] ?? json['gst_rate'] ?? 18.0),
    );
  }
}

/// Represents an Official Government GST Invoice / Tax Receipt
class GovInvoiceModel {
  final String id;
  final String code;
  final String title;
  final String poReference;
  final DateTime? issueDate;
  final DateTime? dueDate;
  final DateTime? paidAt;
  final String status; // 'paid', 'issued', 'pending', 'exempt', 'overdue'
  final double subtotal;
  final double taxAmount;
  final double totalAmount;
  final String customerName;
  final String billingAddress;
  final String gstin;
  final String pan;
  final String paymentMethod;
  final String utr;
  final List<GovInvoiceItemModel> items;

  GovInvoiceModel({
    required this.id,
    required this.code,
    required this.title,
    this.poReference = '',
    this.issueDate,
    this.dueDate,
    this.paidAt,
    this.status = 'paid',
    this.subtotal = 0.0,
    this.taxAmount = 0.0,
    this.totalAmount = 0.0,
    this.customerName = 'State Public Transit Department',
    this.billingAddress = 'Ministry of Transport & Transit Secretariat',
    this.gstin = '07AAACG0000A1Z5',
    this.pan = 'AAACG0000A',
    this.paymentMethod = 'Direct Ministry Allocation',
    this.utr = '',
    this.items = const [],
  });

  factory GovInvoiceModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return GovInvoiceModel(id: '', code: '', title: '');

    double parseD(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0.0;
    }

    DateTime? parseDate(dynamic v) {
      if (v == null) return null;
      try {
        return DateTime.parse(v.toString());
      } catch (_) {
        return null;
      }
    }

    final itemsList = <GovInvoiceItemModel>[];
    if (json['items'] is List) {
      for (final item in json['items']) {
        if (item is Map) {
          itemsList.add(GovInvoiceItemModel.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }

    return GovInvoiceModel(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? json['invoice_no']?.toString() ?? 'INV-${json['id']}',
      title: json['title']?.toString() ?? json['description']?.toString() ?? 'Transit Telematics & Display Override',
      poReference: json['po_reference']?.toString() ?? json['poReference']?.toString() ?? '',
      issueDate: parseDate(json['issue_date'] ?? json['createdAt'] ?? json['date']),
      dueDate: parseDate(json['due_date'] ?? json['dueDate']),
      paidAt: parseDate(json['paid_at'] ?? json['paidAt']),
      status: json['status']?.toString().toLowerCase() ?? 'paid',
      subtotal: parseD(json['subtotal'] ?? json['base_amount'] ?? json['amount']),
      taxAmount: parseD(json['tax_amount'] ?? json['gst_amount'] ?? json['tax']),
      totalAmount: parseD(json['total_amount'] ?? json['totalAmount'] ?? json['total']),
      customerName: json['customer_name']?.toString() ?? json['recipient_name']?.toString() ?? 'State Public Transit Department',
      billingAddress: json['billing_address']?.toString() ?? json['address']?.toString() ?? 'Ministry of Transport & Transit Secretariat',
      gstin: json['gstin']?.toString() ?? '07AAACG0000A1Z5',
      pan: json['pan']?.toString() ?? 'AAACG0000A',
      paymentMethod: json['payment_method']?.toString() ?? 'Direct Ministry Allocation',
      utr: json['utr']?.toString() ?? json['payment_reference']?.toString() ?? '',
      items: itemsList,
    );
  }

  bool get isPaid => status == 'paid';
  bool get isPending => status == 'pending' || status == 'issued';
  bool get isExempt => status == 'exempt' || totalAmount == 0.0;

  String get displayStatus {
    if (isExempt) return 'Zero-Rated Exempt';
    if (isPaid) return 'Paid & Cleared';
    if (isPending) return 'Payment Pending';
    if (status == 'overdue') return 'Overdue';
    return status.toUpperCase();
  }

  Color get statusColor {
    if (isExempt) return const Color(0xFF3B82F6);
    if (isPaid) return const Color(0xFF10B981);
    if (isPending) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }

  Color get statusBgColor {
    if (isExempt) return const Color(0xFF3B82F6).withValues(alpha: 0.12);
    if (isPaid) return const Color(0xFF10B981).withValues(alpha: 0.12);
    if (isPending) return const Color(0xFFF59E0B).withValues(alpha: 0.12);
    return const Color(0xFFEF4444).withValues(alpha: 0.12);
  }

  String get htmlDownloadUrl => ApiConstants.baseUrl + ApiConstants.billingInvoiceHtml(id);
}

/// Represents a Payment / Transaction record in the ledger
class GovTransactionModel {
  final String id;
  final String transactionId;
  final String description;
  final DateTime? createdAt;
  final double amount;
  final String currency;
  final String status; // 'success', 'cleared', 'pending', 'failed'
  final String paymentMethod;
  final String utr;

  GovTransactionModel({
    required this.id,
    required this.transactionId,
    this.description = 'Transit Safety Broadcast Settlement',
    this.createdAt,
    this.amount = 0.0,
    this.currency = 'INR',
    this.status = 'success',
    this.paymentMethod = 'Treasury Direct Allocation',
    this.utr = '',
  });

  factory GovTransactionModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return GovTransactionModel(id: '', transactionId: '');

    double parseD(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0.0;
    }

    DateTime? parseDate(dynamic v) {
      if (v == null) return null;
      try {
        return DateTime.parse(v.toString());
      } catch (_) {
        return null;
      }
    }

    return GovTransactionModel(
      id: json['id']?.toString() ?? '',
      transactionId: json['transaction_id']?.toString() ?? json['reference']?.toString() ?? 'TXN-${json['id']}',
      description: json['description']?.toString() ?? 'Government Transit Safety Allocation',
      createdAt: parseDate(json['created_at'] ?? json['createdAt'] ?? json['date']),
      amount: parseD(json['amount'] ?? json['total']),
      currency: json['currency']?.toString() ?? 'INR',
      status: json['status']?.toString().toLowerCase() ?? 'success',
      paymentMethod: json['payment_method']?.toString() ?? json['gateway']?.toString() ?? 'Treasury Direct',
      utr: json['utr']?.toString() ?? json['payment_ref']?.toString() ?? '',
    );
  }

  bool get isSuccess => status == 'success' || status == 'cleared';

  Color get statusColor => isSuccess ? const Color(0xFF10B981) : const Color(0xFFF59E0B);
}

/// Represents Government Subscription, Sovereign Tier & Operational Capacity
class GovSubscriptionModel {
  final String id;
  final String planName;
  final String planCode;
  final double monthlyPrice;
  final String status; // 'active', 'sovereign_exempt', 'grace', 'expired'
  final String billingCycle;
  final DateTime? renewalDate;
  final int busesUsed;
  final int busesLimit;
  final int depotsUsed;
  final int depotsLimit;
  final int displaysUsed;
  final int displaysLimit;
  final int operatorsUsed;
  final int operatorsLimit;
  final String organizationName;
  final String officeAddress;
  final String gstin;
  final String exemptionNotice;
  final bool isSovereignExempt;

  GovSubscriptionModel({
    this.id = 'SUB-GOV-01',
    this.planName = 'Sovereign Transit Authority Tier',
    this.planCode = 'PLAN-GOV-SOVEREIGN',
    this.monthlyPrice = 0.0,
    this.status = 'active',
    this.billingCycle = 'Annual Statutory Exemption',
    this.renewalDate,
    this.busesUsed = 24,
    this.busesLimit = 100,
    this.depotsUsed = 4,
    this.depotsLimit = 10,
    this.displaysUsed = 48,
    this.displaysLimit = 200,
    this.operatorsUsed = 12,
    this.operatorsLimit = 50,
    this.organizationName = 'State Public Transit Department',
    this.officeAddress = 'Ministry of Transport, Central Secretariat, New Delhi',
    this.gstin = '07AAACG0000A1Z5',
    this.exemptionNotice = 'Public Welfare and Emergency Broadcast services are zero-rated under State Public Information Act.',
    this.isSovereignExempt = true,
  });

  factory GovSubscriptionModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return GovSubscriptionModel();

    final plan = json['plan'] is Map ? Map<String, dynamic>.from(json['plan']) : {};
    final quotas = json['quotas'] is Map ? Map<String, dynamic>.from(json['quotas']) : {};
    final org = json['organization'] is Map ? Map<String, dynamic>.from(json['organization']) : {};

    int parseI(dynamic v, int fallback) {
      if (v == null) return fallback;
      if (v is num) return v.toInt();
      return int.tryParse(v.toString()) ?? fallback;
    }

    double parseD(dynamic v, double fallback) {
      if (v == null) return fallback;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? fallback;
    }

    DateTime? parseDate(dynamic v) {
      if (v == null) return null;
      try {
        return DateTime.parse(v.toString());
      } catch (_) {
        return null;
      }
    }

    return GovSubscriptionModel(
      id: json['id']?.toString() ?? 'SUB-GOV-01',
      planName: plan['name']?.toString() ?? 'Sovereign Transit Authority Tier',
      planCode: plan['code']?.toString() ?? 'PLAN-GOV-SOVEREIGN',
      monthlyPrice: parseD(plan['monthly_price'], 0.0),
      status: json['status']?.toString() ?? 'active',
      billingCycle: json['billing_cycle']?.toString() ?? 'Annual Statutory Exemption',
      renewalDate: parseDate(json['current_period_end'] ?? json['renewal_date']),
      busesUsed: parseI(quotas['busesUsed'], 24),
      busesLimit: parseI(plan['buses_limit'], 100),
      depotsUsed: parseI(quotas['depotsUsed'], 4),
      depotsLimit: parseI(plan['features']?['depots_limit'], 10),
      displaysUsed: parseI(quotas['displaysUsed'], 48),
      displaysLimit: parseI(plan['features']?['displays_limit'], 200),
      operatorsUsed: parseI(quotas['operatorsUsed'], 12),
      operatorsLimit: parseI(plan['features']?['users_limit'], 50),
      organizationName: org['name']?.toString() ?? 'State Public Transit Department',
      officeAddress: org['office_address']?.toString() ?? 'Ministry of Transport, Central Secretariat',
      gstin: org['gstin']?.toString() ?? '07AAACG0000A1Z5',
      exemptionNotice: 'Public Welfare and Emergency Broadcast services are zero-rated under State Public Information Act.',
      isSovereignExempt: true,
    );
  }

  double get busesPercent => busesLimit > 0 ? (busesUsed / busesLimit).clamp(0.0, 1.0) : 0.0;
  double get depotsPercent => depotsLimit > 0 ? (depotsUsed / depotsLimit).clamp(0.0, 1.0) : 0.0;
  double get displaysPercent => displaysLimit > 0 ? (displaysUsed / displaysLimit).clamp(0.0, 1.0) : 0.0;
  double get operatorsPercent => operatorsLimit > 0 ? (operatorsUsed / operatorsLimit).clamp(0.0, 1.0) : 0.0;
}
