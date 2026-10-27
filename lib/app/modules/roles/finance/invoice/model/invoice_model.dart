import 'package:flutter/material.dart';

/// Status of an invoice, drives badge color + summary counts.
enum InvoiceStatus { paid, pending, overdue }

extension InvoiceStatusX on InvoiceStatus {
  String get label {
    switch (this) {
      case InvoiceStatus.paid:
        return 'Paid';
      case InvoiceStatus.pending:
        return 'Pending';
      case InvoiceStatus.overdue:
        return 'Overdue';
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

class InvoiceModel {
  final String id; // e.g. INV-2026-000156
  final String company;
  final DateTime invoiceDate;
  final double amount;
  final InvoiceStatus status;

  const InvoiceModel({
    required this.id,
    required this.company,
    required this.invoiceDate,
    required this.amount,
    required this.status,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate = DateTime.now();
    final dateRaw = json['issue_date'] ?? json['created_at'] ?? json['invoiceDate'] ?? json['due_date'];
    if (dateRaw != null) {
      parsedDate = DateTime.tryParse(dateRaw.toString()) ?? DateTime.now();
    }

    final statusStr = (json['status'] ?? 'pending').toString().toLowerCase();
    InvoiceStatus parsedStatus = InvoiceStatus.pending;
    if (statusStr == 'paid') {
      parsedStatus = InvoiceStatus.paid;
    } else if (statusStr == 'overdue') {
      parsedStatus = InvoiceStatus.overdue;
    } else {
      parsedStatus = InvoiceStatus.pending;
    }

    return InvoiceModel(
      id: json['invoice_number']?.toString() ?? json['id']?.toString() ?? 'INV-${DateTime.now().millisecondsSinceEpoch}',
      company: json['customer_name']?.toString() ?? json['billing_name']?.toString() ?? json['company']?.toString() ?? 'Customer',
      invoiceDate: parsedDate,
      amount: double.tryParse((json['total_amount'] ?? json['amount'] ?? json['subtotal'] ?? 0).toString().replaceAll(',', '')) ?? 0.0,
      status: parsedStatus,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'company': company,
        'invoiceDate': invoiceDate.toIso8601String(),
        'amount': amount,
        'status': status.name,
      };
}

/// Aggregated numbers shown in the "Invoice Summary" card.
class InvoiceSummary {
  final int totalInvoices;
  final int paidCount;
  final double paidAmount;
  final int pendingCount;
  final double pendingAmount;
  final int overdueCount;
  final double overdueAmount;

  const InvoiceSummary({
    required this.totalInvoices,
    required this.paidCount,
    required this.paidAmount,
    required this.pendingCount,
    required this.pendingAmount,
    required this.overdueCount,
    required this.overdueAmount,
  });

  factory InvoiceSummary.fromInvoices(List<InvoiceModel> invoices) {
    double paidAmt = 0, pendingAmt = 0, overdueAmt = 0;
    int paid = 0, pending = 0, overdue = 0;

    for (final inv in invoices) {
      switch (inv.status) {
        case InvoiceStatus.paid:
          paid++;
          paidAmt += inv.amount;
          break;
        case InvoiceStatus.pending:
          pending++;
          pendingAmt += inv.amount;
          break;
        case InvoiceStatus.overdue:
          overdue++;
          overdueAmt += inv.amount;
          break;
      }
    }

    return InvoiceSummary(
      totalInvoices: invoices.length,
      paidCount: paid,
      paidAmount: paidAmt,
      pendingCount: pending,
      pendingAmount: pendingAmt,
      overdueCount: overdue,
      overdueAmount: overdueAmt,
    );
  }

  factory InvoiceSummary.empty() => const InvoiceSummary(
        totalInvoices: 0,
        paidCount: 0,
        paidAmount: 0,
        pendingCount: 0,
        pendingAmount: 0,
        overdueCount: 0,
        overdueAmount: 0,
      );
}
