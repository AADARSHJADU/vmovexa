import 'campaign_model.dart';

/// Database Invoice entity from GET /api/v1/billing/invoices
class AdvertiserInvoiceModel {
  final int? id;
  final String? code;
  final String? customerName;
  final String? customerEmail;
  final String? payerType;
  final String? type;
  final String? status;
  final double? subtotal;
  final double? tax;
  final double? total;
  final String? issuedAt;
  final String? dueAt;
  final String? paidAt;
  final String? poReference;
  final String? fileUrl;

  AdvertiserInvoiceModel({
    this.id,
    this.code,
    this.customerName,
    this.customerEmail,
    this.payerType,
    this.type,
    this.status,
    this.subtotal,
    this.tax,
    this.total,
    this.issuedAt,
    this.dueAt,
    this.paidAt,
    this.poReference,
    this.fileUrl,
  });

  factory AdvertiserInvoiceModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    return AdvertiserInvoiceModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? ''),
      code: json['code']?.toString(),
      customerName: json['customer_name']?.toString() ?? json['customerName']?.toString(),
      customerEmail: json['customer_email']?.toString() ?? json['customerEmail']?.toString(),
      payerType: json['payer_type']?.toString() ?? json['payerType']?.toString(),
      type: json['type']?.toString(),
      status: json['status']?.toString(),
      subtotal: parseDouble(json['subtotal']),
      tax: parseDouble(json['tax']),
      total: parseDouble(json['total']),
      issuedAt: json['issued_at']?.toString() ?? json['issuedAt']?.toString() ?? json['created_at']?.toString(),
      dueAt: json['due_at']?.toString() ?? json['dueAt']?.toString(),
      paidAt: json['paid_at']?.toString() ?? json['paidAt']?.toString(),
      poReference: json['po_reference']?.toString() ?? json['poReference']?.toString(),
      fileUrl: json['file_url']?.toString() ?? json['fileUrl']?.toString(),
    );
  }

  bool get isPaid => (status ?? '').toLowerCase() == 'paid';
}

/// Database Transaction entity from GET /api/v1/billing/transactions
class AdvertiserTransactionModel {
  final int? id;
  final String? code;
  final String? type;
  final double? amount;
  final String? currency;
  final String? status;
  final String? method;
  final String? gatewayRef;
  final String? description;
  final String? payerType;
  final String? createdAt;
  final String? invoiceCode;

  AdvertiserTransactionModel({
    this.id,
    this.code,
    this.type,
    this.amount,
    this.currency,
    this.status,
    this.method,
    this.gatewayRef,
    this.description,
    this.payerType,
    this.createdAt,
    this.invoiceCode,
  });

  factory AdvertiserTransactionModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    String? invCode;
    if (json['invoice'] is Map) {
      invCode = json['invoice']['code']?.toString();
    } else if (json['invoice_code'] != null) {
      invCode = json['invoice_code']?.toString();
    }

    return AdvertiserTransactionModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? ''),
      code: json['code']?.toString() ?? (json['id'] != null ? 'TXN-${json['id']}' : null),
      type: json['type']?.toString(),
      amount: parseDouble(json['amount']),
      currency: json['currency']?.toString() ?? 'INR',
      status: json['status']?.toString(),
      method: json['method']?.toString(),
      gatewayRef: json['gateway_ref']?.toString() ?? json['gatewayRef']?.toString(),
      description: json['description']?.toString(),
      payerType: json['payer_type']?.toString() ?? json['payerType']?.toString(),
      createdAt: json['created_at']?.toString() ?? json['createdAt']?.toString(),
      invoiceCode: invCode,
    );
  }

  bool get isCredit => (amount ?? 0) >= 0;
  bool get isCompleted => (status ?? '').toLowerCase() == 'completed' || (status ?? '').toLowerCase() == 'success';
}

/// Unified Normalized Billing Invoice Item matching Admin Panel (BillingPaymentsPage.jsx)
class BillingInvoiceItem {
  final String id;
  final dynamic numericId;
  final String date;
  final String? dueDate;
  final String campaign;
  final String campaignCode;
  final String clientBrand;
  final String? poReference;
  final String? campCode;
  final double amount;
  final double baseAmount;
  final double gstAmount;
  final String status;
  final bool isPaid;
  final String? paymentToken;
  final CampaignModel? matchedCamp;

  BillingInvoiceItem({
    required this.id,
    this.numericId,
    required this.date,
    this.dueDate,
    required this.campaign,
    required this.campaignCode,
    required this.clientBrand,
    this.poReference,
    this.campCode,
    required this.amount,
    required this.baseAmount,
    required this.gstAmount,
    required this.status,
    required this.isPaid,
    this.paymentToken,
    this.matchedCamp,
  });

  String get formattedAmount => '₹${amount.toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d+?)(?=(\d\d)+(\d)(?!\d))'),
        (m) => '${m[1]},',
      )}';

  String get formattedBaseAmount => '₹${baseAmount.toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d+?)(?=(\d\d)+(\d)(?!\d))'),
        (m) => '${m[1]},',
      )}';

  String get formattedGstAmount => '₹${gstAmount.toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d+?)(?=(\d\d)+(\d)(?!\d))'),
        (m) => '${m[1]},',
      )}';
}

