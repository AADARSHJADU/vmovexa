import 'package:flutter/material.dart';

/// Payment status for payment details
enum PaymentStatus { paid, pending, overdue }

extension PaymentStatusX on PaymentStatus {
  String get label {
    switch (this) {
      case PaymentStatus.paid:
        return 'Paid';
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.overdue:
        return 'Overdue';
    }
  }

  Color get color {
    switch (this) {
      case PaymentStatus.paid:
        return const Color(0xFF10B981); // green
      case PaymentStatus.pending:
        return const Color(0xFFF59E0B); // amber
      case PaymentStatus.overdue:
        return const Color(0xFFEF4444); // red
    }
  }

  IconData get icon {
    switch (this) {
      case PaymentStatus.paid:
        return Icons.check_circle;
      case PaymentStatus.pending:
        return Icons.access_time_rounded;
      case PaymentStatus.overdue:
        return Icons.error;
    }
  }

  String get headerTitle {
    switch (this) {
      case PaymentStatus.paid:
        return 'Payment Details';
      case PaymentStatus.pending:
        return 'Payment Details';
      case PaymentStatus.overdue:
        return 'Invoice Details';
    }
  }

  String get headerSubtitle {
    switch (this) {
      case PaymentStatus.paid:
        return 'View payment information';
      case PaymentStatus.pending:
        return 'View payment information';
      case PaymentStatus.overdue:
        return 'View invoice information';
    }
  }

  IconData get amountIcon {
    switch (this) {
      case PaymentStatus.paid:
        return Icons.receipt_long;
      case PaymentStatus.pending:
        return Icons.receipt_long;
      case PaymentStatus.overdue:
        return Icons.description;
    }
  }

  String get amountLabel {
    switch (this) {
      case PaymentStatus.paid:
        return 'Amount';
      case PaymentStatus.pending:
        return 'Pending Payment';
      case PaymentStatus.overdue:
        return 'Amount Due';
    }
  }
}

/// Timeline event model
class TimelineEvent {
  final String title;
  final String date;
  final bool isCompleted;

  const TimelineEvent({
    required this.title,
    required this.date,
    required this.isCompleted,
  });
}

/// Payment detail model
class PaymentDetailModel {
  // Basic Info
  final String invoiceId;
  final DateTime dueDate;
  final double amount;
  final PaymentStatus status;

  // Customer Details
  final String customerName;
  final String customerEmail;
  final String customerPhone;

  // Payment Information
  final double invoiceAmount;
  final double paidAmount;
  final double balanceAmount;
  final DateTime? paymentDate;
  final String? paymentMethod;
  final String? transactionId;
  final String? notes;
  final int? daysOverdue;

  // Timeline Events
  final List<TimelineEvent> timeline;

  const PaymentDetailModel({
    required this.invoiceId,
    required this.dueDate,
    required this.amount,
    required this.status,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    required this.invoiceAmount,
    required this.paidAmount,
    required this.balanceAmount,
    this.paymentDate,
    this.paymentMethod,
    this.transactionId,
    this.notes,
    this.daysOverdue,
    required this.timeline,
  });

  factory PaymentDetailModel.fromJson(Map<String, dynamic> json) {
    return PaymentDetailModel(
      invoiceId: json['invoiceId'] as String,
      dueDate: DateTime.parse(json['dueDate'] as String),
      amount: (json['amount'] as num).toDouble(),
      status: PaymentStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => PaymentStatus.pending,
      ),
      customerName: json['customerName'] as String,
      customerEmail: json['customerEmail'] as String,
      customerPhone: json['customerPhone'] as String,
      invoiceAmount: (json['invoiceAmount'] as num).toDouble(),
      paidAmount: (json['paidAmount'] as num).toDouble(),
      balanceAmount: (json['balanceAmount'] as num).toDouble(),
      paymentDate: json['paymentDate'] != null
          ? DateTime.parse(json['paymentDate'] as String)
          : null,
      paymentMethod: json['paymentMethod'] as String?,
      transactionId: json['transactionId'] as String?,
      notes: json['notes'] as String?,
      daysOverdue: json['daysOverdue'] as int?,
      timeline: (json['timeline'] as List?)
              ?.map((e) => TimelineEvent(
                    title: e['title'] as String,
                    date: e['date'] as String,
                    isCompleted: e['isCompleted'] as bool,
                  ))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'invoiceId': invoiceId,
        'dueDate': dueDate.toIso8601String(),
        'amount': amount,
        'status': status.name,
        'customerName': customerName,
        'customerEmail': customerEmail,
        'customerPhone': customerPhone,
        'invoiceAmount': invoiceAmount,
        'paidAmount': paidAmount,
        'balanceAmount': balanceAmount,
        'paymentDate': paymentDate?.toIso8601String(),
        'paymentMethod': paymentMethod,
        'transactionId': transactionId,
        'notes': notes,
        'daysOverdue': daysOverdue,
        'timeline': timeline
            .map((e) => {
                  'title': e.title,
                  'date': e.date,
                  'isCompleted': e.isCompleted,
                })
            .toList(),
      };
}
