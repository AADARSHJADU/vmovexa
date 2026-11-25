import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/payment_detail_controller.dart';
import '../model/payment_detail_model.dart';

class PaymentDetailView extends GetView<PaymentDetailController> {
  const PaymentDetailView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF13131F);
  static const Color kCardInnerBg = Color(0xFF1B1B2A);
  static const Color kBorderColor = Color(0xFF222235);
  static const Color kBlue = Color(0xFF3B82F6);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kAmber = Color(0xFFF59E0B);
  static const Color kRed = Color(0xFFEF4444);
  static const Color kPurple = Color(0xFF8B5CF6);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.paymentDetail.value == null) {
            return const Center(
              child: CircularProgressIndicator(color: kPurple),
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
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: () => controller.loadPayment(controller.paymentId),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Section 1: Total Settlement Amount (Hero Banner)
                        _buildHeroSettlementBanner(pay),
                        const SizedBox(height: 16),

                        // Section 2: Transaction & Banking Audit
                        _buildTransactionAuditSection(pay),
                        const SizedBox(height: 16),

                        // Section 3: Tax & Commercial Breakdown
                        _buildTaxBreakdownSection(pay),
                        const SizedBox(height: 16),

                        // Section 4: Offline Settlement Details (Conditional)
                        if (pay.hasOfflineDetails) ...[
                          _buildOfflineSettlementSection(pay),
                          const SizedBox(height: 16),
                        ],

                        // Section 5: Payer & Entity Profile (Conditional)
                        if (pay.hasPayerInfo) ...[
                          _buildPayerProfileSection(pay),
                          const SizedBox(height: 16),
                        ],

                        // Section 6: Linked Subscription / Associated Campaign (Conditional)
                        if (pay.hasCampaignOrSubscription) ...[
                          _buildLinkedEntitySection(pay),
                          const SizedBox(height: 16),
                        ],

                        // Section 7: Recorded Timestamps (Persisted DB Dates Only)
                        if (pay.realTimestamps.isNotEmpty) ...[
                          _buildRecordedTimestampsSection(pay),
                          const SizedBox(height: 16),
                        ],
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
        color: kCardBg,
        border: Border(bottom: BorderSide(color: kBorderColor, width: 1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Back Button
              IconButton(
                onPressed: () => Get.back(),
                icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1C1C2D),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  minimumSize: const Size(36, 36),
                ),
              ),
              const SizedBox(width: 10),

              // Title & Badges
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            pay.code,
                            style: GoogleFonts.firaCode(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Status Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: pay.statusKind.bgColor,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: pay.statusKind.borderColor),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 5,
                                height: 5,
                                decoration: BoxDecoration(
                                  color: pay.statusKind.color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _getStatusText(pay.statusKind, pay.rawStatus),
                                style: TextStyle(
                                  color: pay.statusKind.color,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Mode Badge
                        if (pay.paymentMode.isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                            decoration: BoxDecoration(
                              color: pay.isOffline ? kAmber.withValues(alpha: 0.15) : kBlue.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: pay.isOffline ? kAmber.withValues(alpha: 0.35) : kBlue.withValues(alpha: 0.35),
                              ),
                            ),
                            child: Text(
                              pay.paymentMode.toUpperCase(),
                              style: TextStyle(
                                color: pay.isOffline ? kAmber : const Color(0xFF93C5FD),
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (pay.clientName != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        '${'audit_record_for'.tr} ${pay.clientName}',
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 11,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),

              // Tax Invoice Shortcut
              if (pay.invoiceId != null && pay.invoiceId!.isNotEmpty) ...[
                IconButton(
                  onPressed: () => controller.openLinkedInvoice(pay.invoiceId),
                  icon: const Icon(Icons.receipt_long_rounded, color: Color(0xFF60A5FA), size: 18),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    minimumSize: const Size(36, 36),
                  ),
                  tooltip: 'tax_invoice'.tr,
                ),
                const SizedBox(width: 6),
              ],

              // Refresh Button
              IconButton(
                onPressed: () => controller.loadPayment(controller.paymentId),
                icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1C1C2D),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  minimumSize: const Size(36, 36),
                ),
                tooltip: 'refresh_settlements'.tr,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // SECTION 1: TOTAL SETTLEMENT AMOUNT (HERO BANNER)
  // ==========================================
  Widget _buildHeroSettlementBanner(PaymentDetailModel pay) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );

    final settledDate = pay.paidAt != null
        ? DateFormat('dd MMM yyyy, hh:mm a').format(pay.paidAt!)
        : '—';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF2A2A40)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF151528),
            Color(0xFF13131F),
            Color(0xFF1A1A30),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'total_settlement_amount_caps'.tr,
                style: const TextStyle(
                  color: Colors.white54,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  pay.currency,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Big Amount
          Text(
            currencyFormatter.format(pay.amount),
            style: GoogleFonts.firaCode(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),

          // Payment Purpose
          if (pay.readablePurpose.isNotEmpty && pay.readablePurpose != '—') ...[
            const SizedBox(height: 4),
            Row(
              children: [
                Text(
                  '${'payment_purpose'.tr}: ',
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                ),
                Text(
                  pay.readablePurpose,
                  style: const TextStyle(
                    color: Color(0xFF93C5FD),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 16),

          // 3-Column Meta Box
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F1B).withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF26263B)),
            ),
            child: Row(
              children: [
                // Payment Mode & Method
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'payment_mode_caps'.tr,
                        style: const TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        pay.readableMethod,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                Container(width: 1, height: 28, color: const Color(0xFF26263B)),
                const SizedBox(width: 10),

                // Settled On
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'settled_on_caps'.tr,
                        style: const TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        settledDate,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Bank / Gateway
                if (pay.bankName != null || pay.gatewayName != null) ...[
                  Container(width: 1, height: 28, color: const Color(0xFF26263B)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pay.isOffline ? 'bank_caps'.tr : 'gateway_caps'.tr,
                          style: const TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          pay.bankName ?? pay.gatewayName ?? '—',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
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
  // SECTION 2: TRANSACTION & BANKING AUDIT
  // ==========================================
  Widget _buildTransactionAuditSection(PaymentDetailModel pay) {
    return _buildSectionCard(
      title: 'txn_banking_audit'.tr,
      icon: Icons.credit_card_rounded,
      iconColor: const Color(0xFF60A5FA),
      trailing: pay.paymentMode.isNotEmpty
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF1F1F32),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                pay.paymentMode.toUpperCase(),
                style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
              ),
            )
          : null,
      children: [
        // Bank UTR / Reference
        if (pay.paymentRef.isNotEmpty && pay.paymentRef != '—')
          _buildCopyableRow(
            label: 'bank_utr_reference'.tr,
            value: pay.paymentRef,
            keyName: 'utr',
          ),

        const SizedBox(height: 10),

        // Grid of Transaction Audit Details
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            if (pay.code.isNotEmpty)
              _buildAuditGridItem(
                label: 'platform_payment_code'.tr,
                value: pay.code,
                keyName: 'code',
                isMono: true,
              ),
            if (pay.orderRef != null && pay.orderRef!.isNotEmpty)
              _buildAuditGridItem(
                label: 'order_reference'.tr,
                value: pay.orderRef!,
                isMono: true,
              ),
            if (pay.readablePayerType.isNotEmpty && pay.readablePayerType != '—')
              _buildAuditGridItem(
                label: 'payer_type_label'.tr,
                value: pay.readablePayerType,
              ),
            if (pay.readableClientType.isNotEmpty && pay.readableClientType != '—')
              _buildAuditGridItem(
                label: 'payment_channel'.tr,
                value: pay.readableClientType,
              ),
            if (pay.gatewayName != null && pay.gatewayName!.isNotEmpty)
              _buildAuditGridItem(
                label: 'payment_gateway'.tr,
                value: pay.gatewayName!,
              ),
            if (pay.createdAt != null)
              _buildAuditGridItem(
                label: 'created_at'.tr,
                value: DateFormat('dd MMM yyyy, hh:mm a').format(pay.createdAt!),
              ),
          ],
        ),
      ],
    );
  }

  // ==========================================
  // SECTION 3: TAX & COMMERCIAL BREAKDOWN
  // ==========================================
  Widget _buildTaxBreakdownSection(PaymentDetailModel pay) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );

    return _buildSectionCard(
      title: 'tax_commercial_breakdown'.tr,
      icon: Icons.receipt_long_rounded,
      iconColor: const Color(0xFF818CF8),
      trailing: pay.invoiceCode != null
          ? GestureDetector(
              onTap: () => controller.openLinkedInvoice(pay.invoiceId),
              child: Row(
                children: [
                  Text(
                    pay.invoiceCode!,
                    style: GoogleFonts.firaCode(
                      color: const Color(0xFF60A5FA),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 3),
                  const Icon(Icons.arrow_forward_rounded, size: 12, color: Color(0xFF60A5FA)),
                ],
              ),
            )
          : null,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: kCardInnerBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF262638)),
          ),
          child: Column(
            children: [
              // Base Subtotal
              if (pay.subtotal != null) ...[
                _buildTaxRow('base_subtotal'.tr, currencyFormatter.format(pay.subtotal)),
                const SizedBox(height: 8),
              ],

              // CGST
              if (pay.cgstAmount > 0) ...[
                _buildTaxRow('cgst'.tr, '+ ${currencyFormatter.format(pay.cgstAmount)}', isMuted: true),
                const SizedBox(height: 8),
              ],

              // SGST
              if (pay.sgstAmount > 0) ...[
                _buildTaxRow('sgst'.tr, '+ ${currencyFormatter.format(pay.sgstAmount)}', isMuted: true),
                const SizedBox(height: 8),
              ],

              // IGST
              if (pay.igstAmount > 0) ...[
                _buildTaxRow('igst'.tr, '+ ${currencyFormatter.format(pay.igstAmount)}', isMuted: true),
                const SizedBox(height: 8),
              ],

              // Tax Amount (fallback if cgst/sgst/igst are 0)
              if (pay.taxAmount > 0 && pay.cgstAmount == 0 && pay.sgstAmount == 0 && pay.igstAmount == 0) ...[
                _buildTaxRow('tax_amount'.tr, '+ ${currencyFormatter.format(pay.taxAmount)}', isMuted: true),
                const SizedBox(height: 8),
              ],

              const Divider(height: 16, color: Color(0xFF2C2C40)),

              // Net Total
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'net_total'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    currencyFormatter.format(pay.totalAmount),
                    style: GoogleFonts.firaCode(
                      color: kGreen,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Open Tax Invoice Link Action
        if (pay.invoiceId != null) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${'invoice_status'.tr}: ${pay.invoiceStatus?.toUpperCase() ?? 'ISSUED'}',
                style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              GestureDetector(
                onTap: () => controller.openLinkedInvoice(pay.invoiceId),
                child: Text(
                  'open_tax_invoice'.tr,
                  style: const TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  // ==========================================
  // SECTION 4: OFFLINE SETTLEMENT DETAILS (CONDITIONAL)
  // ==========================================
  Widget _buildOfflineSettlementSection(PaymentDetailModel pay) {
    return _buildSectionCard(
      title: 'offline_settlement_details'.tr,
      icon: Icons.account_balance_rounded,
      iconColor: kAmber,
      trailing: pay.rawMethod != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: kAmber.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                pay.readableMethod.toUpperCase(),
                style: const TextStyle(color: kAmber, fontSize: 9, fontWeight: FontWeight.bold),
              ),
            )
          : null,
      children: [
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            if (pay.bankName != null)
              _buildAuditGridItem(label: 'bank_name'.tr, value: pay.bankName!),
            if (pay.branchName != null)
              _buildAuditGridItem(label: 'branch_name'.tr, value: pay.branchName!),
            if (pay.accountHolder != null)
              _buildAuditGridItem(label: 'account_holder'.tr, value: pay.accountHolder!),
            if (pay.utrNumber != null)
              _buildAuditGridItem(label: 'utr_number'.tr, value: pay.utrNumber!, isMono: true, keyName: 'offline_utr'),
            if (pay.referenceNumber != null)
              _buildAuditGridItem(label: 'reference_number'.tr, value: pay.referenceNumber!, isMono: true, keyName: 'offline_ref'),
            if (pay.chequeNumber != null)
              _buildAuditGridItem(label: 'cheque_number'.tr, value: pay.chequeNumber!, isMono: true),
            if (pay.chequeDate != null)
              _buildAuditGridItem(label: 'cheque_date'.tr, value: DateFormat('dd MMM yyyy').format(pay.chequeDate!)),
            if (pay.collectorName != null)
              _buildAuditGridItem(label: 'collected_by'.tr, value: pay.collectorName!),
            if (pay.remarks != null)
              _buildAuditGridItem(label: 'remarks_notes'.tr, value: pay.remarks!, isFullWidth: true),
          ],
        ),

        // Proof Link if Present
        if (pay.proofUrl != null && pay.proofUrl!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kCardInnerBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF262638)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'payment_proof_doc'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'view_uploaded_proof'.tr,
                      style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () async {
                    try {
                      final uri = Uri.parse(pay.proofUrl!);
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                      }
                    } catch (_) {}
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    minimumSize: Size.zero,
                  ),
                  icon: const Icon(Icons.open_in_new_rounded, size: 13, color: Colors.white),
                  label: Text('open_doc'.tr, style: const TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // ==========================================
  // SECTION 5: PAYER & ENTITY PROFILE
  // ==========================================
  Widget _buildPayerProfileSection(PaymentDetailModel pay) {
    return _buildSectionCard(
      title: 'payer_entity_profile'.tr,
      icon: Icons.business_rounded,
      iconColor: const Color(0xFFA78BFA),
      trailing: pay.readablePayerType.isNotEmpty && pay.readablePayerType != '—'
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF1F1F32),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                pay.readablePayerType,
                style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
              ),
            )
          : null,
      children: [
        // Client Person & Organization
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: kCardInnerBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF262638)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'client_person_label'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                pay.clientName ?? '—',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              if (pay.clientCompany != null && pay.clientCompany != pay.clientName) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.apartment_rounded, color: Colors.white38, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      '${'organization_label'.tr}: ',
                      style: const TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                    Flexible(
                      child: Text(
                        pay.clientCompany!,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
              if (pay.clientGstin != null) ...[
                const SizedBox(height: 4),
                Text(
                  'GSTIN: ${pay.clientGstin}',
                  style: GoogleFonts.firaCode(color: const Color(0xFF93C5FD), fontSize: 11),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 10),

        // Phone & Email
        if (pay.clientPhone != null || pay.clientEmail != null) ...[
          Row(
            children: [
              if (pay.clientPhone != null)
                Expanded(
                  child: _buildContactBox(
                    label: 'contact_phone'.tr,
                    value: pay.clientPhone!,
                    icon: Icons.phone_rounded,
                    onTap: () {
                      controller.copyToClipboard(pay.clientPhone!, 'phone', 'Phone');
                    },
                  ),
                ),
              if (pay.clientPhone != null && pay.clientEmail != null) const SizedBox(width: 10),
              if (pay.clientEmail != null)
                Expanded(
                  child: _buildContactBox(
                    label: 'email_address'.tr,
                    value: pay.clientEmail!,
                    icon: Icons.mail_rounded,
                    onTap: () {
                      controller.copyToClipboard(pay.clientEmail!, 'email', 'Email');
                    },
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
        ],

        // Full Address
        if (pay.fullAddress != null || pay.locationLine != null) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kCardInnerBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF262638)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'billing_address_label'.tr,
                  style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on_rounded, color: Color(0xFFF43F5E), size: 14),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (pay.fullAddress != null)
                            Text(
                              pay.fullAddress!,
                              style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.3),
                            ),
                          if (pay.locationLine != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              pay.locationLine!,
                              style: const TextStyle(color: Colors.white54, fontSize: 11),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // ==========================================
  // SECTION 6: LINKED SUBSCRIPTION / CAMPAIGN
  // ==========================================
  Widget _buildLinkedEntitySection(PaymentDetailModel pay) {
    final isCampaign = pay.campaignId != null || pay.campaignTitle != null;
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹');

    return _buildSectionCard(
      title: isCampaign ? 'associated_campaign'.tr : 'linked_subscription'.tr,
      icon: isCampaign ? Icons.campaign_rounded : Icons.card_membership_rounded,
      iconColor: const Color(0xFF14B8A6),
      trailing: (isCampaign ? pay.campaignCode : pay.subscriptionPlanCode) != null
          ? Text(
              (isCampaign ? pay.campaignCode : pay.subscriptionPlanCode)!,
              style: GoogleFonts.firaCode(
                color: const Color(0xFF60A5FA),
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            )
          : null,
      children: [
        if (isCampaign) ...[
          // Campaign Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kCardInnerBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF262638)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'campaign_brand_caps'.tr,
                            style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            pay.campaignTitle ?? 'Campaign',
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          if (pay.campaignBrand != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              '${'brand_label'.tr}: ${pay.campaignBrand}',
                              style: const TextStyle(color: Colors.white54, fontSize: 11),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (pay.campaignStatus != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1F1F32),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF2D2D45)),
                        ),
                        child: Text(
                          pay.campaignStatus!.toUpperCase(),
                          style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Campaign Details Grid
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              if (pay.campaignPlacement != null)
                _buildAuditGridItem(label: 'placement_screens'.tr, value: pay.campaignPlacement!),
              if (pay.campaignDurationSec != null)
                _buildAuditGridItem(
                  label: 'slot_duration'.tr,
                  value: '${pay.campaignDurationSec}s per slot (${pay.campaignSlotType ?? 'standard'})',
                ),
              if (pay.campaignCategory != null)
                _buildAuditGridItem(label: 'cat_objective'.tr, value: pay.campaignCategory!),
              if (pay.campaignBudget != null)
                _buildAuditGridItem(
                  label: 'campaign_budget'.tr,
                  value: currencyFormatter.format(pay.campaignBudget),
                  isMono: true,
                ),
            ],
          ),
        ] else if (pay.subscriptionPlanName != null) ...[
          // Subscription Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kCardInnerBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF262638)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'subscription_plan_caps'.tr,
                  style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  pay.subscriptionPlanName!,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                if (pay.subscriptionPlanCode != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    'Code: ${pay.subscriptionPlanCode}',
                    style: GoogleFonts.firaCode(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),

          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              if (pay.subscriptionStatus != null)
                _buildAuditGridItem(label: 'common_status'.tr, value: pay.subscriptionStatus!.toUpperCase()),
              if (pay.subscriptionPeriodStart != null || pay.subscriptionPeriodEnd != null)
                _buildAuditGridItem(
                  label: 'billing_period'.tr,
                  value: '${pay.subscriptionPeriodStart != null ? DateFormat('dd MMM yyyy').format(pay.subscriptionPeriodStart!) : ''} - ${pay.subscriptionPeriodEnd != null ? DateFormat('dd MMM yyyy').format(pay.subscriptionPeriodEnd!) : ''}',
                ),
            ],
          ),
        ],
      ],
    );
  }

  // ==========================================
  // SECTION 7: RECORDED TIMESTAMPS
  // ==========================================
  Widget _buildRecordedTimestampsSection(PaymentDetailModel pay) {
    return _buildSectionCard(
      title: 'recorded_timestamps'.tr,
      icon: Icons.access_time_rounded,
      iconColor: const Color(0xFF94A3B8),
      children: [
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: pay.realTimestamps.map((entry) {
            return _buildAuditGridItem(
              label: entry.label,
              value: entry.value,
              isMono: true,
            );
          }).toList(),
        ),
      ],
    );
  }

  // ==========================================
  // BOTTOM ACTION BAR
  // ==========================================
  Widget _buildBottomActionBar(PaymentDetailModel pay) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(top: BorderSide(color: kBorderColor, width: 1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Get.back(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF28283E)),
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'back_to_payments'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          if (pay.statusKind != PaymentStatusKind.paid) ...[
            const SizedBox(width: 10),
            Expanded(
              flex: 2,
              child: SizedBox(
                height: 44,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ElevatedButton(
                    onPressed: controller.isSendingReminder.value
                        ? null
                        : () => controller.sendPaymentReminder(
                              isUrgent: pay.statusKind == PaymentStatusKind.failed,
                            ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Obx(
                      () => Text(
                        controller.isSendingReminder.value
                            ? 'dispatching_label'.tr
                            : (pay.statusKind == PaymentStatusKind.failed
                                ? 'send_overdue_notice'.tr
                                : 'send_payment_reminder'.tr),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
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
            const Icon(Icons.receipt_long_outlined, size: 56, color: Colors.white24),
            const SizedBox(height: 16),
            Text(
              'payment_record_not_found'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'payment_record_not_found_desc'.tr,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white54, fontSize: 13),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 42,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: ElevatedButton(
                  onPressed: () => Get.back(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                  ),
                  child: Text(
                    'return_to_payments_list'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // HELPER WIDGETS
  // ==========================================
  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required List<Widget> children,
    Widget? trailing,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: iconColor, size: 16),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      ?trailing,
                    ],
                  ),
                ],
              ),

            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }

  Widget _buildCopyableRow({
    required String label,
    required String value,
    required String keyName,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardInnerBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF262638)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: GoogleFonts.firaCode(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Obx(() {
            final isCopied = controller.copiedKey.value == keyName;
            return TextButton.icon(
              onPressed: () => controller.copyToClipboard(value, keyName, label),
              icon: Icon(
                isCopied ? Icons.check_rounded : Icons.copy_rounded,
                size: 13,
                color: isCopied ? kGreen : const Color(0xFF93C5FD),
              ),
              label: Text(
                isCopied ? 'copied_label'.tr : 'copy_label'.tr,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isCopied ? kGreen : const Color(0xFF93C5FD),
                ),
              ),
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFF26263B),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildAuditGridItem({
    required String label,
    required String value,
    bool isMono = false,
    bool isFullWidth = false,
    String? keyName,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = isFullWidth
            ? constraints.maxWidth
            : (constraints.maxWidth > 400 ? (constraints.maxWidth - 10) / 2 : constraints.maxWidth);

        return Container(
          width: width,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: kCardInnerBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF262638)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    label.toUpperCase(),
                    style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                  if (keyName != null)
                    GestureDetector(
                      onTap: () => controller.copyToClipboard(value, keyName, label),
                      child: Text(
                        'copy_label'.tr,
                        style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                value,
                style: isMono
                    ? GoogleFonts.firaCode(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)
                    : const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                overflow: TextOverflow.ellipsis,
                maxLines: isFullWidth ? 4 : 2,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTaxRow(String label, String value, {bool isMuted = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: isMuted ? Colors.white54 : Colors.white70,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.firaCode(
            color: isMuted ? Colors.white60 : Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildContactBox({
    required String label,
    required String value,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kCardInnerBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF262638)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 3),
            Row(
              children: [
                Icon(icon, color: Colors.white54, size: 12),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    value,
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getStatusText(PaymentStatusKind kind, String raw) {
    switch (kind) {
      case PaymentStatusKind.paid:
        return 'common_paid'.tr;
      case PaymentStatusKind.pending:
        return 'common_pending'.tr;
      case PaymentStatusKind.failed:
        return 'common_failed'.tr;
      case PaymentStatusKind.refunded:
        return 'common_refunded'.tr;
      case PaymentStatusKind.other:
        return raw.toUpperCase();
    }
  }
}
