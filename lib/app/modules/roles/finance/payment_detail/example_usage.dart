/// Example Usage: How to navigate to Payment Detail Screen
/// 
/// This file shows different ways to navigate to the payment detail screen
/// 
/// IMPORTANT: This file is for reference only. Do not import this in your app.

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'model/payment_detail_model.dart';

class PaymentDetailExample {
  
  /// Example 1: Navigate without arguments (uses dummy data from controller)
  static void navigateBasic() {
    Get.toNamed(Routes.PAYMENT_DETAIL);
  }

  /// Example 2: Navigate with pending payment data
  static void navigatePendingPayment() {
    final paymentDetail = PaymentDetailModel(
      invoiceId: 'INV-2026-000154',
      dueDate: DateTime(2026, 8, 21),
      amount: 50000,
      status: PaymentStatus.pending,
      customerName: 'Urban Adz Media',
      customerEmail: 'urbanadz@example.com',
      customerPhone: '+91 98765 43210',
      invoiceAmount: 50000,
      paidAmount: 0,
      balanceAmount: 50000,
      timeline: const [
        TimelineEvent(
          title: 'Invoice Generated',
          date: '06 Aug 2026',
          isCompleted: true,
        ),
        TimelineEvent(
          title: 'Payment Due',
          date: '21 Aug 2026',
          isCompleted: false,
        ),
        TimelineEvent(
          title: 'Payment Received',
          date: '-',
          isCompleted: false,
        ),
      ],
    );

    Get.toNamed(Routes.PAYMENT_DETAIL, arguments: paymentDetail);
  }

  /// Example 3: Navigate with paid payment data
  static void navigatePaidPayment() {
    final paymentDetail = PaymentDetailModel(
      invoiceId: 'INV-2026-000154',
      dueDate: DateTime(2026, 8, 21),
      amount: 50000,
      status: PaymentStatus.paid,
      customerName: 'Urban Adz Media',
      customerEmail: 'urbanadz@example.com',
      customerPhone: '+91 98765 43210',
      invoiceAmount: 50000,
      paidAmount: 50000,
      balanceAmount: 0,
      paymentDate: DateTime(2026, 8, 21, 16, 35),
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN6589745128',
      notes: 'Payment received successfully',
      timeline: const [
        TimelineEvent(
          title: 'Invoice Generated',
          date: '06 Aug 2026, 10:30 AM',
          isCompleted: true,
        ),
        TimelineEvent(
          title: 'Payment Due',
          date: '21 Aug 2026',
          isCompleted: true,
        ),
        TimelineEvent(
          title: 'Payment Received',
          date: '21 Aug 2026, 04:35 PM',
          isCompleted: true,
        ),
      ],
    );

    Get.toNamed(Routes.PAYMENT_DETAIL, arguments: paymentDetail);
  }

  /// Example 4: Navigate with overdue payment data
  static void navigateOverduePayment() {
    final paymentDetail = PaymentDetailModel(
      invoiceId: 'INV-2026-000153',
      dueDate: DateTime(2026, 8, 5),
      amount: 120000,
      status: PaymentStatus.overdue,
      customerName: 'Gofrugal Publicity',
      customerEmail: 'gofrugal@example.com',
      customerPhone: '+91 98765 43210',
      invoiceAmount: 120000,
      paidAmount: 0,
      balanceAmount: 120000,
      daysOverdue: 3,
      timeline: const [
        TimelineEvent(
          title: 'Invoice Generated',
          date: '01 Aug 2026, 10:30 AM',
          isCompleted: true,
        ),
        TimelineEvent(
          title: 'Payment Due',
          date: '05 Aug 2026',
          isCompleted: true,
        ),
        TimelineEvent(
          title: 'Overdue',
          date: '3 days',
          isCompleted: true,
        ),
      ],
    );

    Get.toNamed(Routes.PAYMENT_DETAIL, arguments: paymentDetail);
  }

  /// Example 5: Create a button widget to navigate
  static Widget buildNavigationButton(BuildContext context) {
    return ElevatedButton(
      onPressed: navigateBasic,
      child: const Text('View Payment Details'),
    );
  }

  /// Example 6: Navigate from a list item tap
  static void onInvoiceListItemTap(String invoiceId) {
    // In real scenario, you would fetch the payment detail from API
    // For now, we'll use dummy data
    navigatePendingPayment();
  }

  /// Example 7: Show in a card widget
  static Widget buildPaymentCard({
    required String invoiceId,
    required double amount,
    required PaymentStatus status,
  }) {
    return GestureDetector(
      onTap: navigateBasic,
      child: Card(
        child: ListTile(
          title: Text(invoiceId),
          subtitle: Text('₹${amount.toStringAsFixed(2)}'),
          trailing: Chip(
            label: Text(status.label),
            backgroundColor: status.color.withOpacity(0.2),
          ),
        ),
      ),
    );
  }
}

/// Example usage in your invoice list or dashboard:
/// 
/// ```dart
/// // In your invoice list item
/// GestureDetector(
///   onTap: () {
///     final paymentDetail = PaymentDetailModel(...);
///     Get.toNamed(Routes.PAYMENT_DETAIL, arguments: paymentDetail);
///   },
///   child: InvoiceCard(...),
/// )
/// 
/// // Or simply
/// ElevatedButton(
///   onPressed: () => Get.toNamed(Routes.PAYMENT_DETAIL),
///   child: Text('View Details'),
/// )
/// ```
