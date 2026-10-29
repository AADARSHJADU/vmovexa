import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/payment_detail_controller.dart';
import '../model/payment_detail_model.dart';

class PaymentDetailView extends GetView<PaymentDetailController> {
  const PaymentDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D15),
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value &&
              controller.paymentDetail.value == null) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
            );
          }

          final pay = controller.paymentDetail.value;
          if (pay == null) {
            return _buildNotFoundState();
          }

          return Column(
            children: [
              _buildTopHeader(pay),
              Expanded(
                child: RefreshIndicator(
                  color: const Color(0xFF3B82F6),
                  backgroundColor: const Color(0xFF1B1B28),
                  onRefresh: () => controller.loadPayment(controller.paymentId),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeroBanner(pay),
                        const SizedBox(height: 16),
                        _buildTransactionAuditCard(pay),
                        const SizedBox(height: 16),
                        _buildTaxBreakdownCard(pay),
                        const SizedBox(height: 16),
                        _buildPayerProfileCard(pay),
                        const SizedBox(height: 16),
                        _buildCampaignOrSubscriptionCard(pay),
                        const SizedBox(height: 16),
                        _buildAuditTimelineCard(pay),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
              _buildBottomActionBar(pay),
            ],
          );
        }),
      ),
    );
  }

  // ==========================================
  // TOP HEADER BAR
  // ==========================================
  Widget _buildTopHeader(PaymentDetailModel pay) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF13131F),
        border: Border(bottom: BorderSide(color: Color(0xFF1F1F30), width: 1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () => Get.back(),
                icon: const Icon(
                  Icons.arrow_back_rounded,
                  color: Colors.white,
                  size: 20,
                ),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1C1C2D),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.all(8),
                  minimumSize: const Size(36, 36),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            pay.code,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                              letterSpacing: 0.5,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: pay.status.bgColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: pay.status.borderColor),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: pay.status.color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                pay.status.label,
                                style: TextStyle(
                                  color: pay.status.color,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Ledger audit for ${pay.clientName}',
                      style: const TextStyle(
                        color: Colors.white60,
                        fontSize: 11,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => controller.loadPayment(controller.paymentId),
                icon: const Icon(
                  Icons.refresh_rounded,
                  color: Colors.white70,
                  size: 18,
                ),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1C1C2D),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  minimumSize: const Size(36, 36),
                ),
                tooltip: 'Refresh',
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // HERO SETTLEMENT BANNER
  // ==========================================
  Widget _buildHeroBanner(PaymentDetailModel pay) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF181827),
            const Color(0xFF131320),
            pay.status == PaymentStatus.paid
                ? const Color(0xFF064E3B).withOpacity(0.25)
                : const Color(0xFF3B82F6).withOpacity(0.12),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF28283E)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'TOTAL SETTLEMENT AMOUNT',
                style: TextStyle(
                  color: Colors.white38,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: pay.status == PaymentStatus.paid
                  ? const Color(0xFF064E3B).withOpacity(0.6)
                  : const Color(0xFF78350F).withOpacity(0.6),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: pay.status == PaymentStatus.paid
                    ? const Color(0xFF10B981).withOpacity(0.4)
                    : const Color(0xFFF59E0B).withOpacity(0.4),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  pay.status == PaymentStatus.paid
                      ? Icons.check_circle_rounded
                      : Icons.schedule_rounded,
                  color: pay.status == PaymentStatus.paid
                      ? const Color(0xFF10B981)
                      : const Color(0xFFF59E0B),
                  size: 11,
                ),
                const SizedBox(width: 4),
                Text(
                  pay.status == PaymentStatus.paid
                      ? 'Settled & Verified'
                      : 'Awaiting Settlement',
                  style: TextStyle(
                    color: pay.status == PaymentStatus.paid
                        ? const Color(0xFF10B981)
                        : const Color(0xFFF59E0B),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                currencyFormatter.format(pay.totalAmount),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  fontFamily: 'monospace',
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A8A).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: const Color(0xFF3B82F6).withOpacity(0.3),
                  ),
                ),
                child: Text(
                  pay.currency,
                  style: const TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Text(
                'Purpose: ',
                style: TextStyle(color: Colors.white54, fontSize: 12),
              ),
              Flexible(
                child: Text(
                  pay.readablePurpose,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: Color(0xFF28283E), height: 1),
          const SizedBox(height: 12),
          // 3 Quick Spec Chips
          Row(
            children: [
              Expanded(
                child: _buildBannerChip(
                  icon: Icons.credit_card_rounded,
                  iconColor: const Color(0xFF60A5FA),
                  label: 'Payment Mode',
                  value: pay.readableMethod,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildBannerChip(
                  icon: Icons.event_available_rounded,
                  iconColor: const Color(0xFF34D399),
                  label: 'Settled On',
                  value: pay.settlementDateFormatted,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildBannerChip(
                  icon: Icons.verified_user_rounded,
                  iconColor: const Color(0xFFA78BFA),
                  label: 'Gateway',
                  value: pay.gatewayName,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBannerChip({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B2C),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF252538)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 9,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(icon, color: iconColor, size: 12),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // CARD 1: TRANSACTION & BANKING AUDIT
  // ==========================================
  Widget _buildTransactionAuditCard(PaymentDetailModel pay) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF232336)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.account_balance_rounded,
                    color: Color(0xFF3B82F6),
                    size: 16,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Transaction & Banking Audit',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 5),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFF064E3B).withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: const Color(0xFF10B981).withOpacity(0.3),
              ),
            ),
            child: const Text(
              'Gateway Verified',
              style: TextStyle(
                color: Color(0xFF34D399),
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 14),
          // Bank UTR Reference with Copy
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1C1C2D),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF28283E)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'BANK UTR / TRANSACTION REFERENCE',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        pay.paymentRef,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (pay.paymentRef != '—')
                  Obx(() {
                    final isCopied = controller.copiedKey.value == 'utr';
                    return TextButton.icon(
                      onPressed: () => controller.copyToClipboard(
                        pay.paymentRef,
                        'utr',
                        'UTR Reference',
                      ),
                      icon: Icon(
                        isCopied ? Icons.check_rounded : Icons.copy_rounded,
                        size: 13,
                        color: isCopied
                            ? const Color(0xFF34D399)
                            : const Color(0xFF93C5FD),
                      ),
                      label: Text(
                        isCopied ? 'Copied' : 'Copy',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isCopied
                              ? const Color(0xFF34D399)
                              : const Color(0xFF93C5FD),
                        ),
                      ),
                      style: TextButton.styleFrom(
                        backgroundColor: const Color(0xFF26263B),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    );
                  }),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Row 2: Platform ID & Order Reference
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C1C2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF28283E)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'PLATFORM ID',
                            style: TextStyle(
                              color: Colors.white38,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => controller.copyToClipboard(
                              pay.code,
                              'code',
                              'Payment Code',
                            ),
                            child: const Text(
                              'Copy',
                              style: TextStyle(
                                color: Color(0xFF60A5FA),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        pay.code,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'monospace',
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C1C2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF28283E)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ORDER REFERENCE',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        pay.orderRef != '—'
                            ? pay.orderRef
                            : 'Direct Settlement',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'monospace',
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Row 3: Payer Entity Type & Payment Channel
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C1C2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF28283E)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'PAYER ENTITY TYPE',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        pay.readablePayerType,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C1C2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF28283E)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'PAYMENT CHANNEL',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        pay.clientType == 'app'
                            ? 'Mobile App'
                            : 'Web Checkout Portal',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // CARD 2: TAX & COMMERCIAL BREAKDOWN (GST)
  // ==========================================
  Widget _buildTaxBreakdownCard(PaymentDetailModel pay) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF232336)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.receipt_long_rounded,
                    color: Color(0xFF818CF8),
                    size: 16,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Tax & Commercial Breakdown',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 5),
          if (pay.invoiceCode != null)
            GestureDetector(
              onTap: () => controller.openTaxInvoice(),
              child: Text(
                '${pay.invoiceCode} →',
                style: const TextStyle(
                  color: Color(0xFF60A5FA),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'Direct Receipt',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1C1C2D),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF28283E)),
            ),
            child: Column(
              children: [
                _buildAmountRow(
                  'Base Subtotal (Campaign Value)',
                  currencyFormatter.format(pay.subtotal),
                  isBold: false,
                ),
                const SizedBox(height: 8),
                _buildAmountRow(
                  'CGST (Central Tax 9.0%)',
                  '+ ${currencyFormatter.format(pay.cgstAmount)}',
                  isMuted: true,
                ),
                const SizedBox(height: 6),
                _buildAmountRow(
                  'SGST (State Tax 9.0%)',
                  '+ ${currencyFormatter.format(pay.sgstAmount)}',
                  isMuted: true,
                ),
                const SizedBox(height: 10),
                const Divider(color: Color(0xFF28283E), height: 1),
                const SizedBox(height: 10),
                _buildAmountRow(
                  'Total Tax (18% GST)',
                  currencyFormatter.format(pay.taxAmount),
                  isBold: true,
                ),
                const SizedBox(height: 10),
                const Divider(color: Color(0xFF28283E), height: 1),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Net Total Paid',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      currencyFormatter.format(pay.totalAmount),
                      style: const TextStyle(
                        color: Color(0xFF10B981),
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (pay.invoiceId != null) ...[
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Invoice Status: ${pay.invoiceStatus ?? 'PAID'}',
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                ),
                GestureDetector(
                  onTap: () => controller.openTaxInvoice(),
                  child: const Text(
                    'Open Tax Invoice →',
                    style: TextStyle(
                      color: Color(0xFF60A5FA),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAmountRow(
    String label,
    String value, {
    bool isBold = false,
    bool isMuted = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: isMuted
                ? Colors.white38
                : (isBold ? Colors.white : Colors.white70),
            fontSize: 12,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: isMuted ? Colors.white54 : Colors.white,
            fontSize: 12,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  // ==========================================
  // CARD 3: PAYER & ENTITY PROFILE
  // ==========================================
  Widget _buildPayerProfileCard(PaymentDetailModel pay) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF232336)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.business_rounded,
                    color: Color(0xFFA855F7),
                    size: 16,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Payer & Entity Profile',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Text(
                'Verified Client',
                style: TextStyle(
                  color: Color(0xFF60A5FA),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Client & Company
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1C1C2D),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF28283E)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CLIENT / CONTACT PERSON',
                  style: TextStyle(
                    color: Colors.white38,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  pay.clientName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (pay.clientCompany != '—' &&
                    pay.clientCompany != pay.clientName) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.apartment_rounded,
                        color: Colors.white38,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Organization: ',
                        style: TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                      Flexible(
                        child: Text(
                          pay.clientCompany,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Phone & Email
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C1C2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF28283E)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CONTACT PHONE',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(
                            Icons.phone_rounded,
                            color: Colors.white54,
                            size: 12,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              pay.clientPhone,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C1C2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF28283E)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'EMAIL ADDRESS',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(
                            Icons.mail_rounded,
                            color: Colors.white54,
                            size: 12,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              pay.clientEmail,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Location & Address
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1C1C2D),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF28283E)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'BILLING LOCATION & ADDRESS',
                  style: TextStyle(
                    color: Colors.white38,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.location_on_rounded,
                      color: Color(0xFFF43F5E),
                      size: 14,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        pay.fullAddress != '—'
                            ? pay.fullAddress
                            : 'Commercial Head Office',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
                if (pay.clientCity != '—') ...[
                  const SizedBox(height: 4),
                  Padding(
                    padding: const EdgeInsets.only(left: 20),
                    child: Text(
                      '${pay.clientCity}${pay.clientState.isNotEmpty ? ', ${pay.clientState}' : ''}${pay.clientPincode.isNotEmpty ? ' - ${pay.clientPincode}' : ''}',
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // CARD 4: ASSOCIATED CAMPAIGN / SUBSCRIPTION
  // ==========================================
  Widget _buildCampaignOrSubscriptionCard(PaymentDetailModel pay) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF232336)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    pay.campaignTitle != null
                        ? Icons.campaign_rounded
                        : Icons.workspace_premium_rounded,
                    color: const Color(0xFF14B8A6),
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    pay.campaignTitle != null
                        ? 'Associated Campaign Specs'
                        : 'Platform Subscription Service',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (pay.campaignId != null)
                Text(
                  pay.campaignId!,
                  style: const TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          if (pay.campaignTitle != null) ...[
            // Title & Status
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1C1C2D),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF28283E)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'CAMPAIGN TITLE & BRAND',
                          style: TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          pay.campaignTitle!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (pay.campaignBrand != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            'Brand: ${pay.campaignBrand}',
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF064E3B).withOpacity(0.5),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: const Color(0xFF10B981).withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      pay.campaignStatus ?? 'Approved',
                      style: const TextStyle(
                        color: Color(0xFF34D399),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            // Placement & Slot Duration
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C1C2D),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'PLACEMENT & SCREENS',
                          style: TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${pay.campaignPlacement ?? 'All Screens'} (${pay.campaignTargetingMode ?? 'Transit Screens'})',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C1C2D),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'SLOT & DURATION',
                          style: TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${pay.campaignDurationSec ?? 15}s per slot (${pay.campaignSlotType ?? 'standard'})',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Category & Budget
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C1C2D),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'CATEGORY & OBJECTIVE',
                          style: TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${pay.campaignCategory ?? 'Commercial'} · ${pay.campaignObjective ?? 'Awareness'}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C1C2D),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'CAMPAIGN BUDGET',
                          style: TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          currencyFormatter.format(
                            pay.campaignBudget ?? pay.totalAmount,
                          ),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ] else if (pay.subscriptionPlanName != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1C1C2D),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF28283E)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SUBSCRIPTION PLAN',
                    style: TextStyle(
                      color: Colors.white38,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    pay.subscriptionPlanName!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Code: ${pay.subscriptionCode ?? '—'} · Status: ${pay.subscriptionStatus ?? 'Active'}',
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1C1C2D),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF28283E)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Direct Platform Billing Transaction',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Settled directly against commercial invoice reference ${pay.invoiceCode ?? pay.code}.',
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // AUDIT TIMELINE PROGRESSION
  // ==========================================
  Widget _buildAuditTimelineCard(PaymentDetailModel pay) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF232336)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'SETTLEMENT PROGRESSION & AUDIT TRAIL',
                style: TextStyle(
                  color: Colors.white38,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                Icons.check_circle_rounded,
                color: Color(0xFF10B981),
                size: 14,
              ),
              SizedBox(width: 4),
              Text(
                'Verified',
                style: TextStyle(
                  color: Color(0xFF10B981),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Clear 4-step reconciliation verification flow',
            style: TextStyle(color: Colors.white54, fontSize: 11),
          ),
          const SizedBox(height: 16),
          ...pay.timeline.asMap().entries.map((entry) {
            final idx = entry.key;
            final step = entry.value;
            final isLast = idx == pay.timeline.length - 1;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: step.isCompleted
                            ? const Color(0xFF10B981)
                            : const Color(0xFF26263B),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: step.isCompleted
                              ? const Color(0xFF34D399)
                              : const Color(0xFF3F3F56),
                        ),
                      ),
                      child: Center(
                        child: step.isCompleted
                            ? const Icon(
                                Icons.check,
                                color: Colors.white,
                                size: 13,
                              )
                            : Text(
                                '${idx + 1}',
                                style: const TextStyle(
                                  color: Colors.white54,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: 36,
                        color: step.isCompleted
                            ? const Color(0xFF10B981).withOpacity(0.5)
                            : const Color(0xFF26263B),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              step.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              step.date,
                              style: const TextStyle(
                                color: Colors.white38,
                                fontSize: 10,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          step.desc,
                          style: const TextStyle(
                            color: Colors.white54,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  // ==========================================
  // BOTTOM ACTION BAR
  // ==========================================
  Widget _buildBottomActionBar(PaymentDetailModel pay) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF13131F),
        border: Border(top: BorderSide(color: Color(0xFF1F1F30), width: 1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Get.back(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF28283E)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Back to Payments',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            flex: 2,
            child: pay.status == PaymentStatus.paid
                ? CustomButton(
                    text: 'Official Receipt',
                    onTap: () => controller.showOfficialReceipt(),
                  )
                : pay.status == PaymentStatus.pending
                ? Obx(
                    () => CustomButton(
                      text: controller.isSendingReminder.value
                          ? 'Sending...'
                          : 'Send Reminder',
                      onTap: controller.isSendingReminder.value
                          ? () {}
                          : () =>
                                controller.sendPaymentReminder(isUrgent: false),
                    ),
                  )
                : Obx(
                    () => CustomButton(
                      text: controller.isSendingReminder.value
                          ? 'Dispatching...'
                          : 'Send Overdue Notice',
                      onTap: controller.isSendingReminder.value
                          ? () {}
                          : () =>
                                controller.sendPaymentReminder(isUrgent: false),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // NOT FOUND STATE
  // ==========================================
  Widget _buildNotFoundState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.receipt_long_outlined,
              size: 56,
              color: Colors.white24,
            ),
            const SizedBox(height: 16),
            const Text(
              'Payment record not found',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'This transaction could not be located in the financial ledger.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),
            const SizedBox(height: 20),
            CustomButton(
              text: 'Back to Payments',
              onTap: () => Get.back(),
              width: 200,
              height: 44,
            ),
          ],
        ),
      ),
    );
  }
}
