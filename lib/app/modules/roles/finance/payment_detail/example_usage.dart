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
  /// Example 1: Navigate without arguments (fetches from API in controller)
  static void navigateBasic() {
    Get.toNamed(Routes.PAYMENT_DETAIL);
  }

  /// Example 2: Navigate with pending payment data
  static void navigatePendingPayment() {
    final paymentDetail = PaymentDetailModel.fromJson({
      'id': '1042',
      'code': 'PAY-2026-1042',
      'amount': 50000,
      'status': 'pending',
      'customer_name': 'Urban Adz Media',
      'customer_email': 'urbanadz@example.com',
      'customer_phone': '+91 98765 43210',
      'method': 'UPI / QR Transfer',
    });

    Get.toNamed(Routes.PAYMENT_DETAIL, arguments: paymentDetail);
  }

  /// Example 3: Navigate with paid payment data
  static void navigatePaidPayment() {
    final paymentDetail = PaymentDetailModel.fromJson({
      'id': '1043',
      'code': 'PAY-2026-1043',
      'amount': 85000,
      'status': 'paid',
      'customer_name': 'Sharma Electronics Pvt Ltd',
      'customer_email': 'accounts@sharma.in',
      'customer_phone': '+91 98765 43210',
      'method': 'Bank Transfer (NEFT/RTGS)',
      'gateway_ref': 'UTR-ICICI-20261010-0091',
    });

    Get.toNamed(Routes.PAYMENT_DETAIL, arguments: paymentDetail);
  }

  /// Example 4: Navigate with overdue payment data
  static void navigateOverduePayment() {
    final paymentDetail = PaymentDetailModel.fromJson({
      'id': '1044',
      'code': 'PAY-2026-1044',
      'amount': 120000,
      'status': 'overdue',
      'customer_name': 'Gofrugal Publicity',
      'customer_email': 'gofrugal@example.com',
      'customer_phone': '+91 98765 43210',
      'method': 'Cheque Clearance',
    });

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
    navigatePendingPayment();
  }
}
