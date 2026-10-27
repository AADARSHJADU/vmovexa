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
  final String label;
  final String desc;
  final IconData icon;
  final Color color;
  final Color bgColor;

  const ReportTypeOption({
    required this.id,
    required this.label,
    required this.desc,
    required this.icon,
    required this.color,
    required this.bgColor,
  });
}

/// Recent / Archived report item model
class RecentReport {
  final String id;
  final String title;
  final String period;
  final String dateText;
  final ReportFormat format;
  final String fileSizeText;
  final String? content;
  final double totalRevenue;
  final double subRevenue;
  final double campaignRevenue;
  final double taxTotal;
  final int activeSubs;
  final int activeCampaigns;

  RecentReport({
    required this.id,
    required this.title,
    required this.period,
    required this.dateText,
    required this.format,
    required this.fileSizeText,
    this.content,
    this.totalRevenue = 0.0,
    this.subRevenue = 0.0,
    this.campaignRevenue = 0.0,
    this.taxTotal = 0.0,
    this.activeSubs = 0,
    this.activeCampaigns = 0,
  });

  factory RecentReport.fromJson(Map<String, dynamic> json) {
    final id = (json['id'] ?? json['_id'] ?? 'REP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}').toString();
    final title = (json['title'] ?? json['name'] ?? 'Financial Statement').toString();
    final period = (json['period'] ?? '—').toString();
    final dateText = json['created_at'] != null
        ? json['created_at'].toString().split('T').first
        : (json['generatedOn'] ?? json['dateText'] ?? '—').toString();
    final fileSizeText = (json['file_size'] ?? json['fileSize'] ?? json['fileSizeText'] ?? '24.8 KB').toString();
    final content = json['content']?.toString();

    // Summary sub-object or top level
    final summaryMap = json['summary'] is Map ? Map<String, dynamic>.from(json['summary']) : json;
    final totalRevenue = double.tryParse((summaryMap['totalRevenue'] ?? summaryMap['total_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final subRevenue = double.tryParse((summaryMap['subRevenue'] ?? summaryMap['sub_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final campaignRevenue = double.tryParse((summaryMap['campaignRevenue'] ?? summaryMap['campaign_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final taxTotal = double.tryParse((summaryMap['taxTotal'] ?? summaryMap['tax_total'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final activeSubs = int.tryParse((summaryMap['activeSubs'] ?? summaryMap['active_subscriptions'] ?? 0).toString()) ?? 0;
    final activeCampaigns = int.tryParse((summaryMap['activeCampaigns'] ?? summaryMap['active_campaigns'] ?? 0).toString()) ?? 0;

    return RecentReport(
      id: id,
      title: title,
      period: period,
      dateText: dateText,
      format: ReportFormat.csv,
      fileSizeText: fileSizeText,
      content: content,
      totalRevenue: totalRevenue,
      subRevenue: subRevenue,
      campaignRevenue: campaignRevenue,
      taxTotal: taxTotal,
      activeSubs: activeSubs,
      activeCampaigns: activeCampaigns,
    );
  }
}
