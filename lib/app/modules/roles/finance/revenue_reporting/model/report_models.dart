import 'package:flutter/material.dart';

enum ReportFormat { xlsx, pdf, csv }

extension ReportFormatX on ReportFormat {
  String get label {
    switch (this) {
      case ReportFormat.xlsx:
        return 'XLS';
      case ReportFormat.pdf:
        return 'PDF';
      case ReportFormat.csv:
        return 'CSV';
    }
  }

  String get fullLabel {
    switch (this) {
      case ReportFormat.xlsx:
        return 'Excel (XLSX)';
      case ReportFormat.pdf:
        return 'PDF';
      case ReportFormat.csv:
        return 'CSV Spreadsheet';
    }
  }

  Color get color {
    switch (this) {
      case ReportFormat.xlsx:
        return const Color(0xFF2ECC71);
      case ReportFormat.pdf:
        return const Color(0xFFFF4D4D);
      case ReportFormat.csv:
        return const Color(0xFF3B82F6);
    }
  }

  IconData get icon {
    switch (this) {
      case ReportFormat.xlsx:
        return Icons.grid_on_outlined;
      case ReportFormat.pdf:
        return Icons.picture_as_pdf_outlined;
      case ReportFormat.csv:
        return Icons.table_chart_outlined;
    }
  }
}

/// Report type definition matching Admin Panel 1:1
class ReportTypeOption {
  final String id;
  final String labelKey;
  final String label;
  final String desc;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final String badge;

  const ReportTypeOption({
    required this.id,
    required this.labelKey,
    required this.label,
    required this.desc,
    required this.icon,
    required this.color,
    required this.bgColor,
    this.badge = '',
  });
}

/// Live Period Invoice Model matching Admin Panel reportSummary.invoices
class LiveInvoiceItem {
  final String id;
  final String code;
  final String customerName;
  final String payerType; // tenant, advertiser, government
  final String type; // saas_subscription, ad_spend, psa_spend
  final double subtotal;
  final double cgstAmount;
  final double sgstAmount;
  final double igstAmount;
  final double taxAmount;
  final double total;
  final String status; // paid, issued, overdue, draft
  final String issuedAt;
  final String dueAt;
  final List<Map<String, dynamic>> items;

  LiveInvoiceItem({
    required this.id,
    required this.code,
    required this.customerName,
    required this.payerType,
    required this.type,
    required this.subtotal,
    required this.cgstAmount,
    required this.sgstAmount,
    required this.igstAmount,
    required this.taxAmount,
    required this.total,
    required this.status,
    required this.issuedAt,
    required this.dueAt,
    this.items = const [],
  });

  factory LiveInvoiceItem.fromJson(Map<String, dynamic> json) {
    final rawSubtotal = json['subtotal'] ?? json['taxableSubtotal'] ?? 0;
    final rawTotal = json['total'] ?? json['grossTotal'] ?? json['amount'] ?? 0;
    final rawTax = json['taxAmount'] ?? json['tax_amount'] ?? json['gstAmount'] ?? 0;
    final rawCgst = json['cgstAmount'] ?? json['cgst_amount'] ?? 0;
    final rawSgst = json['sgstAmount'] ?? json['sgst_amount'] ?? 0;
    final rawIgst = json['igstAmount'] ?? json['igst_amount'] ?? 0;

    List<Map<String, dynamic>> parsedItems = [];
    if (json['items'] is List) {
      parsedItems = (json['items'] as List)
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }

    return LiveInvoiceItem(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      code: (json['code'] ?? json['invoiceCode'] ?? json['invoiceNumber'] ?? '—').toString(),
      customerName: (json['customerName'] ?? json['clientName'] ?? json['customer']?['name'] ?? json['payer']?['name'] ?? '—').toString(),
      payerType: (json['payerType'] ?? json['payer_type'] ?? 'tenant').toString().toLowerCase(),
      type: (json['type'] ?? json['billingType'] ?? json['stream'] ?? 'saas_subscription').toString().toLowerCase(),
      subtotal: double.tryParse(rawSubtotal.toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      cgstAmount: double.tryParse(rawCgst.toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      sgstAmount: double.tryParse(rawSgst.toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      igstAmount: double.tryParse(rawIgst.toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      taxAmount: double.tryParse(rawTax.toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      total: double.tryParse(rawTotal.toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      status: (json['status'] ?? 'issued').toString().toLowerCase(),
      issuedAt: (json['issuedAt'] ?? json['issued_at'] ?? json['date'] ?? '').toString(),
      dueAt: (json['dueAt'] ?? json['due_at'] ?? '').toString(),
      items: parsedItems,
    );
  }

  String get formattedPayerType {
    switch (payerType.toLowerCase()) {
      case 'tenant':
        return 'Tenant Admin';
      case 'advertiser':
        return 'Advertiser';
      case 'government':
        return 'Government';
      default:
        return payerType.replaceAll('_', ' ');
    }
  }

  String get formattedBillingStream {
    switch (type.toLowerCase()) {
      case 'saas_subscription':
        return 'SaaS Subscription';
      case 'ad_spend':
        return 'Campaign Ad Spend';
      case 'psa_spend':
        return 'Government PSA';
      default:
        return type.replaceAll('_', ' ');
    }
  }

  String get formattedStatusLabel {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Paid';
      case 'issued':
        return 'Unpaid';
      case 'overdue':
        return 'Overdue';
      case 'draft':
        return 'Draft';
      default:
        return status.replaceAll('_', ' ');
    }
  }
}

/// Recent / Archived report item model matching Admin Panel 1:1
class RecentReport {
  final String id;
  final String title;
  final String period;
  final String dateText;
  final ReportFormat format;
  final String fileSizeText;
  final String? content;
  final String reportType;
  final String badge;
  final String? fileUrl;
  final double totalBilled;
  final double pendingDues;
  final double totalRevenue;
  final double subRevenue;
  final double campaignRevenue;
  final double taxTotal;
  final int activeSubs;
  final int activeCampaigns;
  final int? invoiceCount;
  final String status;
  final Map<String, dynamic> summary;

  RecentReport({
    required this.id,
    required this.title,
    required this.period,
    required this.dateText,
    required this.format,
    required this.fileSizeText,
    this.content,
    this.reportType = 'revenue_summary',
    this.badge = 'All Revenue',
    this.fileUrl,
    this.totalBilled = 0.0,
    this.pendingDues = 0.0,
    this.totalRevenue = 0.0,
    this.subRevenue = 0.0,
    this.campaignRevenue = 0.0,
    this.taxTotal = 0.0,
    this.activeSubs = 0,
    this.activeCampaigns = 0,
    this.invoiceCount,
    this.status = 'ready',
    this.summary = const {},
  });

  factory RecentReport.fromJson(Map<String, dynamic> json) {
    final id = (json['id'] ?? json['_id'] ?? 'REP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}').toString();

    // Parse params if nested
    Map<String, dynamic> params = {};
    if (json['params'] is Map) {
      params = Map<String, dynamic>.from(json['params']);
    } else if (json['params'] is String) {
      try {
        // try parse json string if needed
      } catch (_) {}
    }

    final repType = (params['reportType'] ?? json['report_type'] ?? json['reportType'] ?? 'revenue_summary').toString();
    final period = (params['period'] ?? json['period'] ?? (params['startDate'] != null && params['endDate'] != null ? '${params['startDate']} → ${params['endDate']}' : '—')).toString();
    final dateText = json['created_at'] != null
        ? json['created_at'].toString().split('T').first
        : (json['generatedOn'] ?? json['dateText'] ?? '—').toString();
    final fileSizeText = (json['file_size'] ?? json['fileSize'] ?? json['fileSizeText'] ?? '24.8 KB').toString();
    final content = json['content']?.toString();
    final fileUrl = json['file_url']?.toString();
    final status = (json['status'] ?? 'ready').toString();

    // Determine badge and title from repType matching Admin Panel
    String badge = 'All Revenue';
    String defaultTitle = 'All Revenue Ledger';
    if (repType == 'subscription_revenue') {
      badge = 'Subscription';
      defaultTitle = 'SaaS Subscription MRR Ledger';
    } else if (repType == 'campaign_revenue') {
      badge = 'Ad Spend';
      defaultTitle = 'Campaign Ad Revenue Ledger';
    } else if (repType == 'government_campaign_revenue') {
      badge = 'Government';
      defaultTitle = 'Government Campaign Revenue Ledger';
    }

    final title = (params['title'] ?? json['title'] ?? json['name'] ?? defaultTitle).toString();

    // Summary sub-object or top level
    final summaryMap = json['summary'] is Map ? Map<String, dynamic>.from(json['summary']) : json;
    final totalBilled = double.tryParse((summaryMap['totalBilled'] ?? summaryMap['total_billed'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final pendingDues = double.tryParse((summaryMap['pendingDues'] ?? summaryMap['pending_dues'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final totalRevenue = double.tryParse((summaryMap['totalRevenue'] ?? summaryMap['total_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final subRevenue = double.tryParse((summaryMap['subRevenue'] ?? summaryMap['sub_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final campaignRevenue = double.tryParse((summaryMap['campaignRevenue'] ?? summaryMap['campaign_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final taxTotal = double.tryParse((summaryMap['taxTotal'] ?? summaryMap['tax_total'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final activeSubs = int.tryParse((summaryMap['activeSubs'] ?? summaryMap['active_subscriptions'] ?? 0).toString()) ?? 0;
    final activeCampaigns = int.tryParse((summaryMap['activeCampaigns'] ?? summaryMap['active_campaigns'] ?? 0).toString()) ?? 0;

    int? invCount;
    if (summaryMap['invoiceCount'] != null) {
      invCount = int.tryParse(summaryMap['invoiceCount'].toString());
    } else if (summaryMap['invoices'] is List) {
      invCount = (summaryMap['invoices'] as List).length;
    }

    return RecentReport(
      id: id,
      title: title,
      period: period,
      dateText: dateText,
      format: ReportFormat.csv,
      fileSizeText: fileSizeText,
      content: content,
      reportType: repType,
      badge: badge,
      fileUrl: fileUrl,
      totalBilled: totalBilled > 0 ? totalBilled : totalRevenue,
      pendingDues: pendingDues,
      totalRevenue: totalRevenue,
      subRevenue: subRevenue,
      campaignRevenue: campaignRevenue,
      taxTotal: taxTotal,
      activeSubs: activeSubs,
      activeCampaigns: activeCampaigns,
      invoiceCount: invCount,
      status: status,
      summary: summaryMap,
    );
  }
}
