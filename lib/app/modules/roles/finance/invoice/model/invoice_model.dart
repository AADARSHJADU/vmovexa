import 'package:flutter/material.dart';
import 'package:get/get.dart';

/// Status of an invoice, drives badge color + summary counts.
enum InvoiceStatus { paid, pending, overdue }

extension InvoiceStatusX on InvoiceStatus {
  String get label {
    switch (this) {
      case InvoiceStatus.paid:
        return 'paid'.tr;
      case InvoiceStatus.pending:
        return 'unpaid'.tr;
      case InvoiceStatus.overdue:
        return 'overdue'.tr;
    }
  }

  Color get color {
    switch (this) {
      case InvoiceStatus.paid:
        return const Color(0xFF10B981); // green
      case InvoiceStatus.pending:
        return const Color(0xFFF59E0B); // amber
      case InvoiceStatus.overdue:
        return const Color(0xFFEF4444); // red
    }
  }

  Color get bgColor {
    switch (this) {
      case InvoiceStatus.paid:
        return const Color(0x1F10B981);
      case InvoiceStatus.pending:
        return const Color(0x1FF59E0B);
      case InvoiceStatus.overdue:
        return const Color(0x1FEF4444);
    }
  }

  Color get borderColor {
    switch (this) {
      case InvoiceStatus.paid:
        return const Color(0x4D10B981);
      case InvoiceStatus.pending:
        return const Color(0x4DF59E0B);
      case InvoiceStatus.overdue:
        return const Color(0x4DEF4444);
    }
  }

  IconData get icon {
    switch (this) {
      case InvoiceStatus.paid:
        return Icons.check_circle;
      case InvoiceStatus.pending:
        return Icons.access_time_rounded;
      case InvoiceStatus.overdue:
        return Icons.cancel;
    }
  }
}

class InvoiceLineItem {
  final String description;
  final String hsn;
  final int qty;
  final double rate;
  final double amount;

  const InvoiceLineItem({
    required this.description,
    required this.hsn,
    required this.qty,
    required this.rate,
    required this.amount,
  });

  factory InvoiceLineItem.fromJson(Map<String, dynamic> json) {
    return InvoiceLineItem(
      description: json['description']?.toString() ?? 'Service Item',
      hsn: json['hsn']?.toString() ?? json['sac']?.toString() ?? '997331',
      qty: int.tryParse(json['qty']?.toString() ?? json['quantity']?.toString() ?? '1') ?? 1,
      rate: double.tryParse((json['rate'] ?? json['price'] ?? json['amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0,
      amount: double.tryParse((json['amount'] ?? json['total'] ?? 0).toString().replaceAll(',', '')) ?? 0.0,
    );
  }
}

class InvoiceModel {
  final String id; // DB primary identifier e.g. "1" or UUID
  final String code; // Display code e.g. "INV-2026-000156"
  final String company;
  final String type; // 'ad_spend', 'saas_subscription', 'standard'
  final DateTime invoiceDate;
  final DateTime? dueDate;
  final DateTime? paidAt;
  final double amount; // Total Amount (Inc. GST)
  final double subtotal; // Taxable Subtotal
  final double taxAmount; // Total GST
  final double cgstAmount;
  final double sgstAmount;
  final double igstAmount;
  final InvoiceStatus status;
  final String rawStatus;
  final String gstin;
  final String billingAddress;
  final String placeOfSupply;
  final String poReference;
  final List<InvoiceLineItem> items;
  final Map<String, dynamic> rawData;

  const InvoiceModel({
    required this.id,
    required this.code,
    required this.company,
    required this.type,
    required this.invoiceDate,
    this.dueDate,
    this.paidAt,
    required this.amount,
    required this.subtotal,
    required this.taxAmount,
    required this.cgstAmount,
    required this.sgstAmount,
    required this.igstAmount,
    required this.status,
    required this.rawStatus,
    required this.gstin,
    required this.billingAddress,
    required this.placeOfSupply,
    required this.poReference,
    required this.items,
    required this.rawData,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    final rawId = json['id']?.toString() ?? '';
    final codeStr = json['code']?.toString() ??
        json['invoice_number']?.toString() ??
        (rawId.isNotEmpty ? (rawId.startsWith('INV-') ? rawId : 'INV-$rawId') : 'INV-${DateTime.now().millisecondsSinceEpoch}');

    // Dates
    DateTime parsedDate = DateTime.now();
    final dateRaw = json['issued_at'] ?? json['issue_date'] ?? json['created_at'] ?? json['invoiceDate'];
    if (dateRaw != null) {
      parsedDate = DateTime.tryParse(dateRaw.toString()) ?? DateTime.now();
    }

    DateTime? parsedDue;
    final dueRaw = json['due_at'] ?? json['due_date'] ?? json['dueDate'];
    if (dueRaw != null) {
      parsedDue = DateTime.tryParse(dueRaw.toString());
    }

    DateTime? parsedPaid;
    final paidRaw = json['paid_at'] ?? json['paidAt'];
    if (paidRaw != null) {
      parsedPaid = DateTime.tryParse(paidRaw.toString());
    }

    // Status
    final statusStr = (json['status'] ?? 'pending').toString().toLowerCase();
    InvoiceStatus parsedStatus = InvoiceStatus.pending;
    if (statusStr == 'paid') {
      parsedStatus = InvoiceStatus.paid;
    } else if (statusStr == 'overdue') {
      parsedStatus = InvoiceStatus.overdue;
    } else {
      parsedStatus = InvoiceStatus.pending;
    }

    // Amounts: Prioritize `total` (Total Inc. GST) over subtotal
    final parsedTotal = double.tryParse((json['total'] ??
            json['total_amount'] ??
            json['grand_total'] ??
            json['amount'] ??
            json['subtotal'] ??
            0)
        .toString()
        .replaceAll(',', '')) ??
        0.0;

    final parsedSubtotal = double.tryParse((json['subtotal'] ??
            json['taxable_value'] ??
            json['taxable_amount'] ??
            parsedTotal)
        .toString()
        .replaceAll(',', '')) ??
        0.0;

    final parsedTax = double.tryParse((json['tax_amount'] ??
            json['tax'] ??
            json['gst_amount'] ??
            (parsedTotal > parsedSubtotal ? (parsedTotal - parsedSubtotal) : 0))
        .toString()
        .replaceAll(',', '')) ??
        0.0;

    final parsedCgst = double.tryParse((json['cgst_amount'] ?? json['cgst'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final parsedSgst = double.tryParse((json['sgst_amount'] ?? json['sgst'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final parsedIgst = double.tryParse((json['igst_amount'] ?? json['igst'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;

    // Organization / customer resolution
    final org = json['organization'] is Map ? Map<String, dynamic>.from(json['organization'] as Map) : null;
    final customerName = json['customer_name']?.toString() ??
        org?['name']?.toString() ??
        json['billing_name']?.toString() ??
        json['company']?.toString() ??
        'Client Entity';

    final gstin = json['gstin']?.toString() ?? org?['gstin']?.toString() ?? '';
    final billingAddress = json['billing_address']?.toString() ??
        org?['office_address']?.toString() ??
        org?['address']?.toString() ??
        '';

    final placeOfSupply = json['place_of_supply']?.toString() ?? org?['state']?.toString() ?? '';
    final poRef = json['po_reference']?.toString() ?? json['poReference']?.toString() ?? '';
    final typeStr = json['type']?.toString() ?? 'standard';

    // Parse items
    List<InvoiceLineItem> lineItems = [];
    final rawItems = json['items'] ?? json['InvoiceItems'];
    if (rawItems is List && rawItems.isNotEmpty) {
      lineItems = rawItems
          .whereType<Map>()
          .map((item) => InvoiceLineItem.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    if (lineItems.isEmpty) {
      lineItems.add(InvoiceLineItem(
        description: poRef.isNotEmpty ? 'VMOVEXA SaaS Subscription — $poRef' : (typeStr == 'ad_spend' ? 'Transit Digital DOOH Ad Broadcast Services' : 'VMOVEXA SaaS Subscription Plan'),
        hsn: typeStr == 'ad_spend' ? '998363' : '997331',
        qty: 1,
        rate: parsedSubtotal > 0 ? parsedSubtotal : parsedTotal,
        amount: parsedSubtotal > 0 ? parsedSubtotal : parsedTotal,
      ));
    }

    return InvoiceModel(
      id: rawId.isNotEmpty ? rawId : codeStr,
      code: codeStr,
      company: customerName,
      type: typeStr,
      invoiceDate: parsedDate,
      dueDate: parsedDue,
      paidAt: parsedPaid,
      amount: parsedTotal,
      subtotal: parsedSubtotal,
      taxAmount: parsedTax,
      cgstAmount: parsedCgst,
      sgstAmount: parsedSgst,
      igstAmount: parsedIgst,
      status: parsedStatus,
      rawStatus: statusStr,
      gstin: gstin,
      billingAddress: billingAddress,
      placeOfSupply: placeOfSupply,
      poReference: poRef,
      items: lineItems,
      rawData: json,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'code': code,
        'company': company,
        'type': type,
        'invoiceDate': invoiceDate.toIso8601String(),
        'dueDate': dueDate?.toIso8601String(),
        'paidAt': paidAt?.toIso8601String(),
        'amount': amount,
        'subtotal': subtotal,
        'taxAmount': taxAmount,
        'status': status.name,
      };

  String get typeDisplay {
    if (type == 'ad_spend') return 'type_ad_campaign'.tr;
    if (type == 'saas_subscription') return 'type_saas_subscription'.tr;
    if (type == 'psa_spend') return 'type_psa_spend'.tr;
    return type.isNotEmpty ? type.replaceAll('_', ' ').toUpperCase() : 'type_standard'.tr;
  }

  String get categoryDisplay {
    if (type == 'ad_spend') return 'cat_transit_ad'.tr;
    if (type == 'saas_subscription') return 'cat_fleet_saas'.tr;
    return 'cat_platform_billing'.tr;
  }
}

/// Helper function to convert numeric amount to Indian currency words
String amountInWords(double num) {
  final n = num.round();
  if (n <= 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  String inWords(int val) {
    if (val < 20) return a[val];
    if (val < 100) return '${b[val ~/ 10]}${val % 10 != 0 ? ' ${a[val % 10]}' : ''}';
    if (val < 1000) return '${a[val ~/ 100]} Hundred${val % 100 != 0 ? ' and ${inWords(val % 100)}' : ''}';
    if (val < 100000) return '${inWords(val ~/ 1000)} Thousand${val % 1000 != 0 ? ' ${inWords(val % 1000)}' : ''}';
    if (val < 10000000) return '${inWords(val ~/ 100000)} Lakh${val % 100000 != 0 ? ' ${inWords(val % 100000)}' : ''}';
    return '${inWords(val ~/ 10000000)} Crore${val % 10000000 != 0 ? ' ${inWords(val % 10000000)}' : ''}';
  }

  return '${inWords(n).trim()} Rupees Only';
}
