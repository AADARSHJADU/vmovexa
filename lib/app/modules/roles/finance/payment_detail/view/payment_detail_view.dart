import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../../../../../theme/app_colors.dart';
import '../controller/payment_detail_controller.dart';
import '../model/payment_detail_model.dart';

class PaymentDetailView extends GetView<PaymentDetailController> {
  const PaymentDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(
              color: AppColors.primaryButtonBlue,
            ),
          );
        }

        final payment = controller.paymentDetail.value;
        if (payment == null) {
          return const Center(
            child: Text('No payment details available'),
          );
        }

        return SafeArea(
          child: Column(
            children: [
              _buildAppBar(payment.status),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildAmountCard(payment),
                      const SizedBox(height: 20),
                      _buildCustomerDetails(payment),
                      const SizedBox(height: 20),
                      _buildPaymentInformation(payment),
                      const SizedBox(height: 20),
                      _buildTimeline(payment),
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
              _buildBottomButton(payment.status),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildAppBar(PaymentStatus status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.arrow_back,
                color: AppColors.textPrimary,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  status.headerTitle,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  status.headerSubtitle,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              // TODO: Implement download functionality
            },
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.download,
                color: AppColors.textPrimary,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmountCard(PaymentDetailModel payment) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  payment.status.amountIcon,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const Spacer(),
              if (payment.status == PaymentStatus.overdue && payment.daysOverdue != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFEF4444)),
                  ),
                  child: Text(
                    'This invoice is overdue by ${payment.daysOverdue} days',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            payment.status.amountLabel,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '₹${NumberFormat('#,##,###').format(payment.amount)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Invoice ID',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      payment.invoiceId,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Due Date',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat('dd MMM yyyy').format(payment.dueDate),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerDetails(PaymentDetailModel payment) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryButtonBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.person_outline,
                  color: AppColors.primaryButtonBlue,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Customer Details',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: controller.viewCustomerDetails,
                child: const Icon(
                  Icons.arrow_forward_ios,
                  color: AppColors.textSecondary,
                  size: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            payment.customerName,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            payment.customerEmail,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            payment.customerPhone,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentInformation(PaymentDetailModel payment) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryButtonBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.receipt_long_outlined,
                  color: AppColors.primaryButtonBlue,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Payment Information',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Invoice Amount', '₹${NumberFormat('#,##,###').format(payment.invoiceAmount)}'),
          const SizedBox(height: 12),
          _buildInfoRow('Paid Amount', '₹${NumberFormat('#,##,###').format(payment.paidAmount)}'),
          const SizedBox(height: 12),
          _buildInfoRow(
            'Balance Amount',
            '₹${NumberFormat('#,##,###').format(payment.balanceAmount)}',
            valueColor: payment.balanceAmount > 0 ? const Color(0xFFEF4444) : null,
          ),
          const SizedBox(height: 12),
          _buildInfoRow(
            'Payment Status',
            payment.status.label,
            valueColor: payment.status.color,
          ),
          if (payment.status == PaymentStatus.paid) ...[
            const SizedBox(height: 12),
            _buildInfoRow('Due Date', DateFormat('dd MMM yyyy').format(payment.dueDate)),
            if (payment.paymentDate != null) ...[
              const SizedBox(height: 12),
              _buildInfoRow(
                'Payment Date',
                DateFormat('dd MMM yyyy, hh:mm a').format(payment.paymentDate!),
              ),
            ],
            if (payment.paymentMethod != null) ...[
              const SizedBox(height: 12),
              _buildInfoRow('Payment Method', payment.paymentMethod!),
            ],
            if (payment.transactionId != null) ...[
              const SizedBox(height: 12),
              _buildInfoRow('Transaction ID', payment.transactionId!),
            ],
            if (payment.notes != null) ...[
              const SizedBox(height: 12),
              _buildInfoRow('Notes', payment.notes!),
            ],
          ],
          if (payment.status == PaymentStatus.overdue && payment.daysOverdue != null) ...[
            const SizedBox(height: 12),
            _buildInfoRow(
              'Days Overdue',
              '${payment.daysOverdue} days',
              valueColor: const Color(0xFFEF4444),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              color: valueColor ?? AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimeline(PaymentDetailModel payment) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryButtonBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.timeline,
                  color: AppColors.primaryButtonBlue,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                payment.status == PaymentStatus.paid ? 'Payment Timeline' : 'Invoice Timeline',
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ...payment.timeline.asMap().entries.map((entry) {
            final index = entry.key;
            final event = entry.value;
            final isLast = index == payment.timeline.length - 1;
            return _buildTimelineItem(event, isLast);
          }),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(TimelineEvent event, bool isLast) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: event.isCompleted
                    ? AppColors.primaryButtonBlue
                    : AppColors.cardBorder,
                shape: BoxShape.circle,
                border: Border.all(
                  color: event.isCompleted
                      ? AppColors.primaryButtonBlue
                      : AppColors.cardBorder,
                  width: 2,
                ),
              ),
              child: event.isCompleted
                  ? const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 14,
                    )
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: event.isCompleted
                    ? AppColors.primaryButtonBlue
                    : AppColors.cardBorder,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.title,
                  style: TextStyle(
                    color: event.isCompleted
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  event.date,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomButton(PaymentStatus status) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        border: Border(
          top: BorderSide(color: AppColors.cardBorder),
        ),
      ),
      child: SafeArea(
        top: false,
        child: _buildGradientButton(status),
      ),
    );
  }

  Widget _buildGradientButton(PaymentStatus status) {
    final String buttonText;
    final VoidCallback onPressed;

    switch (status) {
      case PaymentStatus.pending:
        buttonText = 'Remind Customer';
        onPressed = controller.remindCustomer;
        break;
      case PaymentStatus.paid:
        buttonText = 'Send Payment Receipt';
        onPressed = controller.sendPaymentReceipt;
        break;
      case PaymentStatus.overdue:
        buttonText = 'Send Reminder';
        onPressed = controller.sendReminder;
        break;
    }

    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: double.infinity,
        padding:  EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.send,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              buttonText,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
