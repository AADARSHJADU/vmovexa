import 'package:flutter/material.dart';

// ==========================================================
// 1. Executive Finance KPIs Model (Matching FinanceDashboardPage.jsx)
// ==========================================================
class FinanceKpiModel {
  final double totalRevenue;
  final double baseRevenue;
  final double taxCollected;
  final int totalInvoices;
  final int paidInvoices;
  final double totalPayments;
  final int successfulPayments;
  final double pendingAmount;
  final int pendingInvoices;
  final int overdueInvoices;

  // Breakdown by Source
  final double advertisingRevenue;
  final double governmentRevenue;
  final double subscriptionRevenue;
  final double otherRevenue;

  // Saved Tax Breakdown
  final double cgst;
  final double sgst;
  final double igst;

  const FinanceKpiModel({
    this.totalRevenue = 0.0,
    this.baseRevenue = 0.0,
    this.taxCollected = 0.0,
    this.totalInvoices = 0,
    this.paidInvoices = 0,
    this.totalPayments = 0.0,
    this.successfulPayments = 0,
    this.pendingAmount = 0.0,
    this.pendingInvoices = 0,
    this.overdueInvoices = 0,
    this.advertisingRevenue = 0.0,
    this.governmentRevenue = 0.0,
    this.subscriptionRevenue = 0.0,
    this.otherRevenue = 0.0,
    this.cgst = 0.0,
    this.sgst = 0.0,
    this.igst = 0.0,
  });

  factory FinanceKpiModel.empty() => const FinanceKpiModel();

  factory FinanceKpiModel.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString().replaceAll(',', '')) ?? 0.0;
    }

    int parseInt(dynamic val) {
      if (val == null) return 0;
      if (val is int) return val;
      if (val is num) return val.toInt();
      return int.tryParse(val.toString().replaceAll(',', '')) ?? 0;
    }

    final totalRev = parseNum(json['totalRevenue'] ?? json['total_revenue'] ?? json['total_revenue_ytd']);
    final baseRev = parseNum(json['baseRevenue'] ?? json['base_revenue']);
    final taxCol = parseNum(json['taxCollected'] ?? json['tax_collected'] ?? json['totalTax'] ?? json['tax_total']);

    return FinanceKpiModel(
      totalRevenue: totalRev,
      baseRevenue: baseRev,
      taxCollected: taxCol,
      totalInvoices: parseInt(json['totalInvoices'] ?? json['total_invoices']),
      paidInvoices: parseInt(json['paidInvoices'] ?? json['paid_invoices']),
      totalPayments: parseNum(json['totalPayments'] ?? json['total_payments']),
      successfulPayments: parseInt(json['successfulPayments'] ?? json['successful_payments'] ?? json['ledgerEntries'] ?? json['ledger_entries']),
      pendingAmount: parseNum(json['pendingAmount'] ?? json['pending_amount'] ?? json['outstandingReceivables'] ?? json['outstanding_amount']),
      pendingInvoices: parseInt(json['pendingInvoices'] ?? json['pending_invoices']),
      overdueInvoices: parseInt(json['overdueInvoices'] ?? json['overdue_invoices'] ?? json['overdue_invoices_count']),
      advertisingRevenue: parseNum(json['advertisingRevenue'] ?? json['advertising_revenue'] ?? json['campaignRevenue'] ?? json['campaign_revenue']),
      governmentRevenue: parseNum(json['governmentRevenue'] ?? json['government_revenue']),
      subscriptionRevenue: parseNum(json['subscriptionRevenue'] ?? json['subscription_revenue'] ?? json['subRevenue']),
      otherRevenue: parseNum(json['otherRevenue'] ?? json['other_revenue']),
      cgst: parseNum(json['cgst'] ?? json['cgst_amount'] ?? json['cgstTotal']),
      sgst: parseNum(json['sgst'] ?? json['sgst_amount'] ?? json['sgstTotal']),
      igst: parseNum(json['igst'] ?? json['igst_amount'] ?? json['igstTotal']),
    );
  }
}

// ==========================================================
// 2. Recent Invoice Item Model (Matching React Recent Invoices)
// ==========================================================
class FinanceDashboardInvoiceItem {
  final String id;
  final String code;
  final String customerName;
  final DateTime? issuedAt;
  final double total;
  final double subtotal;
  final double taxAmount;
  final String status;

  const FinanceDashboardInvoiceItem({
    required this.id,
    required this.code,
    required this.customerName,
    this.issuedAt,
    required this.total,
    required this.subtotal,
    required this.taxAmount,
    required this.status,
  });

  factory FinanceDashboardInvoiceItem.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString().replaceAll(',', '')) ?? 0.0;
    }

    DateTime? parsedDate;
    final dateRaw = json['issued_at'] ?? json['issue_date'] ?? json['created_at'] ?? json['invoiceDate'];
    if (dateRaw != null) {
      parsedDate = DateTime.tryParse(dateRaw.toString());
    }

    String custName = '—';
    if (json['customer_name'] != null && json['customer_name'].toString().isNotEmpty) {
      custName = json['customer_name'].toString();
    } else if (json['billing_name'] != null && json['billing_name'].toString().isNotEmpty) {
      custName = json['billing_name'].toString();
    } else if (json['company'] != null && json['company'].toString().isNotEmpty) {
      custName = json['company'].toString();
    } else if (json['organization'] is Map && json['organization']['name'] != null) {
      custName = json['organization']['name'].toString();
    }

    return FinanceDashboardInvoiceItem(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? json['invoice_number']?.toString() ?? json['id']?.toString() ?? '—',
      customerName: custName,
      issuedAt: parsedDate,
      total: parseNum(json['total'] ?? json['total_amount'] ?? json['amount']),
      subtotal: parseNum(json['subtotal'] ?? json['base_amount']),
      taxAmount: parseNum(json['tax_amount'] ?? json['tax']),
      status: (json['status'] ?? 'issued').toString().toLowerCase(),
    );
  }
}

// ==========================================================
// 3. Active Subscription Item Model (Matching React Subscriptions)
// ==========================================================
class FinanceDashboardSubscriptionItem {
  final String id;
  final String organizationName;
  final String planName;
  final String billingCycle;
  final double amount;
  final String status;

  const FinanceDashboardSubscriptionItem({
    required this.id,
    required this.organizationName,
    required this.planName,
    required this.billingCycle,
    required this.amount,
    required this.status,
  });

  factory FinanceDashboardSubscriptionItem.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString().replaceAll(',', '')) ?? 0.0;
    }

    String orgName = '—';
    if (json['organization'] is Map && json['organization']['name'] != null) {
      orgName = json['organization']['name'].toString();
    } else if (json['organization_name'] != null && json['organization_name'].toString().isNotEmpty) {
      orgName = json['organization_name'].toString();
    } else if (json['company_name'] != null && json['company_name'].toString().isNotEmpty) {
      orgName = json['company_name'].toString();
    } else if (json['tenant_name'] != null && json['tenant_name'].toString().isNotEmpty) {
      orgName = json['tenant_name'].toString();
    } else if (json['name'] != null && json['name'].toString().isNotEmpty) {
      orgName = json['name'].toString();
    }

    String plan = '—';
    dynamic planPrice;
    if (json['plan'] is Map) {
      plan = (json['plan']['name'] ?? json['plan']['code'] ?? '—').toString();
      planPrice = json['plan']['price'];
    } else if (json['plan_name'] != null && json['plan_name'].toString().isNotEmpty) {
      plan = json['plan_name'].toString();
    } else if (json['plan'] != null && json['plan'].toString().isNotEmpty) {
      plan = json['plan'].toString();
    }

    return FinanceDashboardSubscriptionItem(
      id: json['id']?.toString() ?? '',
      organizationName: orgName,
      planName: plan,
      billingCycle: json['billing_cycle']?.toString() ?? 'monthly',
      amount: parseNum(json['mrr'] ?? json['amount'] ?? planPrice),
      status: (json['status'] ?? 'active').toString().toLowerCase(),
    );
  }
}

// ==========================================================
// 4. Legacy Classes for Backwards Compatibility
// ==========================================================
class FinancialStat {
  final String label;
  final String value;
  final double trendPercent;
  final bool isPositive;
  final IconData icon;
  final Color color;

  FinancialStat({
    required this.label,
    required this.value,
    required this.trendPercent,
    required this.isPositive,
    required this.icon,
    required this.color,
  });
}

class FinanceQuickAction {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String route;

  FinanceQuickAction({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.route,
  });
}

class KeyInsight {
  final String title;
  final String subtitle;
  final String value;
  final double trendPercent;
  final bool isPositive;
  final IconData icon;
  final Color color;

  KeyInsight({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.trendPercent,
    required this.isPositive,
    required this.icon,
    required this.color,
  });
}
