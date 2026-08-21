import 'package:get/get.dart';
import '../model/payment_detail_model.dart';

class PaymentDetailController extends GetxController {
  final Rx<PaymentDetailModel?> paymentDetail = Rx<PaymentDetailModel?>(null);
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadPaymentDetail();
  }

  /// Load payment detail from arguments or API
  void loadPaymentDetail() {
    isLoading.value = true;

    // Get payment detail from navigation arguments
    final args = Get.arguments;
    if (args != null && args is PaymentDetailModel) {
      paymentDetail.value = args;
      isLoading.value = false;
      return;
    }

    // TODO: Replace with actual API call
    // Simulate API call with dummy data
    Future.delayed(const Duration(milliseconds: 500), () {
      paymentDetail.value = _getDummyPaymentDetail();
      isLoading.value = false;
    });
  }

  /// Dummy data for testing - replace with actual API
  PaymentDetailModel _getDummyPaymentDetail() {
    // You can change status here to test different UI states
    const status = PaymentStatus.pending; // Change to paid, pending, or overdue

    switch (status) {
      case PaymentStatus.pending:
        return PaymentDetailModel(
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
          paymentDate: null,
          paymentMethod: null,
          transactionId: null,
          notes: null,
          timeline: [
            const TimelineEvent(
              title: 'Invoice Generated',
              date: '06 Aug 2026',
              isCompleted: true,
            ),
            const TimelineEvent(
              title: 'Payment Due',
              date: '21 Aug 2026',
              isCompleted: false,
            ),
            const TimelineEvent(
              title: 'Payment Received',
              date: '-',
              isCompleted: false,
            ),
          ],
        );

      case PaymentStatus.paid:
        return PaymentDetailModel(
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
          timeline: [
            const TimelineEvent(
              title: 'Invoice Generated',
              date: '06 Aug 2026, 10:30 AM',
              isCompleted: true,
            ),
            const TimelineEvent(
              title: 'Payment Due',
              date: '21 Aug 2026',
              isCompleted: true,
            ),
            const TimelineEvent(
              title: 'Payment Received',
              date: '21 Aug 2026, 04:35 PM',
              isCompleted: true,
            ),
          ],
        );

      case PaymentStatus.overdue:
        return PaymentDetailModel(
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
          paymentDate: null,
          paymentMethod: null,
          transactionId: null,
          notes: null,
          daysOverdue: 3,
          timeline: [
            const TimelineEvent(
              title: 'Invoice Generated',
              date: '01 Aug 2026, 10:30 AM',
              isCompleted: true,
            ),
            const TimelineEvent(
              title: 'Payment Due',
              date: '05 Aug 2026',
              isCompleted: true,
            ),
            const TimelineEvent(
              title: 'Overdue',
              date: '3 days',
              isCompleted: true,
            ),
          ],
        );
    }
  }

  /// Handle remind customer action
  void remindCustomer() {
    Get.snackbar(
      'Reminder Sent',
      'Payment reminder has been sent to ${paymentDetail.value?.customerName}',
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
    );
  }

  /// Handle send payment receipt action
  void sendPaymentReceipt() {
    Get.snackbar(
      'Receipt Sent',
      'Payment receipt has been sent to ${paymentDetail.value?.customerEmail}',
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
    );
  }

  /// Handle send reminder action (for overdue)
  void sendReminder() {
    Get.snackbar(
      'Reminder Sent',
      'Overdue reminder has been sent to ${paymentDetail.value?.customerName}',
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
    );
  }

  /// Navigate to customer details
  void viewCustomerDetails() {
    // TODO: Implement navigation to customer details screen
    Get.snackbar(
      'Coming Soon',
      'Customer details screen',
      snackPosition: SnackPosition.BOTTOM,
    );
  }
}
