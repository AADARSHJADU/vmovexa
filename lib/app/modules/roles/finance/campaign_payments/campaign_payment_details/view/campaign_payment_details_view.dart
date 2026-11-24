import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../../model/campaign_payment_model.dart';
import '../controller/campaign_payment_details_controller.dart';

class CampaignPaymentDetailsView extends GetView<CampaignPaymentDetailsController> {
  const CampaignPaymentDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildAppBar(context),

            // Content
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryButtonBlue),
                  );
                }

                final camp = controller.campaign.value;
                if (camp == null) {
                  return _buildNotFoundState();
                }

                return RefreshIndicator(
                  color: AppColors.primaryButtonBlue,
                  backgroundColor: const Color(0xFF1E293B),
                  onRefresh: controller.refreshDetails,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    children: [
                      // Header Card with Title, Statuses & Actions
                      _buildHeaderCard(camp),
                      const SizedBox(height: 16),

                      // 4 Top Key Metrics
                      _buildKeyMetrics(camp),
                      const SizedBox(height: 16),

                      // Section 1: Customer & Client Profile
                      _buildCustomerProfileSection(camp),
                      const SizedBox(height: 16),

                      // Section 2: Billing & Settlement Breakdown
                      _buildBillingSettlementSection(camp),
                      const SizedBox(height: 16),

                      // Section 3: Broadcast Flight Window
                      _buildFlightWindowSection(camp),
                      const SizedBox(height: 16),

                      // Section 4: Creative Media Assets
                      _buildMediaAssetsSection(context, camp),
                      const SizedBox(height: 28),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF1E293B),
        border: Border(bottom: BorderSide(color: Color(0xFF334155), width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Get.back(),
            icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
            splashRadius: 22,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Obx(() {
              final c = controller.campaign.value;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    c != null ? c.code : 'campaign_payment_details'.tr,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    c != null ? c.title : 'campaign_payment_details'.tr,
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              );
            }),
          ),
          IconButton(
            onPressed: controller.refreshDetails,
            icon: const Icon(Icons.refresh, color: Colors.white, size: 20),
            splashRadius: 22,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            tooltip: 'refresh'.tr,
          ),
        ],
      ),
    );
  }

  Widget _buildNotFoundState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Color(0xFF94A3B8)),
            const SizedBox(height: 16),
            Text(
              'campaign_not_found'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => Get.back(),
              icon: const Icon(Icons.arrow_back, size: 16),
              label: Text('back_to_campaign_payments'.tr),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F46E5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderCard(CampaignPaymentModel camp) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title & Statuses
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                camp.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              _buildStatusBadge(camp.status),
              _buildPaymentPill(camp.isPaid),
            ],
          ),
          const SizedBox(height: 6),

          // Code & Brand Name
          Text(
            camp.code,
            style: const TextStyle(
              fontFamily: 'monospace',
              color: Color(0xFFCBD5E1),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (camp.brandName.isNotEmpty) ...[
            Text(
              camp.brandName,
              style: const TextStyle(
                color: Color(0xFF818CF8),
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
          if (!camp.isPaid) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: controller.openShareModal,
                    icon: const Icon(Icons.share_outlined, size: 14, color: Colors.white),
                    label: Text(
                      'share_payment_link'.tr,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: controller.openRecordPaymentModal,
                    icon: const Icon(Icons.check_circle_outline, size: 14, color: Colors.white),
                    label: Text(
                      'record_payment'.tr,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
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

  Widget _buildKeyMetrics(CampaignPaymentModel camp) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildMetricTile(
                title: 'campaign_status'.tr,
                value: camp.status.toUpperCase(),
                subtitle: camp.scheduleStatus != null
                    ? '${'schedule'.tr}: ${camp.scheduleStatus}'
                    : null,
                icon: Icons.info_outline,
                color: camp.isLive ? const Color(0xFF10B981) : const Color(0xFF60A5FA),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricTile(
                title: 'total_payable'.tr,
                value: '₹${camp.totalPayable.toStringAsFixed(0)}',
                subtitle: camp.paymentStatus.capitalizeFirst,
                icon: Icons.payments_outlined,
                color: const Color(0xFF10B981),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildMetricTile(
                title: 'flight_duration'.tr,
                value: '${camp.durationDays} ${'days'.tr}',
                subtitle: camp.startDate != null
                    ? DateFormat('d MMM yyyy').format(camp.startDate!)
                    : null,
                icon: Icons.flight_takeoff_outlined,
                color: const Color(0xFFF59E0B),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricTile(
                title: 'slot_playtime'.tr,
                value: '${camp.durationPerPlaySec}s ${'per_play'.tr}',
                subtitle: camp.slotType.capitalizeFirst,
                icon: Icons.play_circle_outline,
                color: const Color(0xFFA855F7),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    String? subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              Icon(icon, size: 14, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  // ----------------- Section 1: Customer & Client Profile -----------------
  Widget _buildCustomerProfileSection(CampaignPaymentModel camp) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF4F46E5).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.business_outlined, size: 16, color: Color(0xFF818CF8)),
              ),
              const SizedBox(width: 8),
              Text(
                'customer_client_profile'.tr.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Client & Company Grid
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildDetailBox(
                  label: 'client_company'.tr,
                  value: camp.clientName.isNotEmpty ? camp.clientName : '—',
                  subValue: camp.clientCompany.isNotEmpty ? camp.clientCompany : null,
                  subColor: const Color(0xFF818CF8),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildDetailBox(
                  label: 'contact_details'.tr,
                  value: camp.clientPhone.isNotEmpty ? camp.clientPhone : '—',
                  icon: camp.clientPhone.isNotEmpty ? Icons.phone : null,
                  subValue: camp.clientEmail.isNotEmpty ? camp.clientEmail : null,
                  subIcon: camp.clientEmail.isNotEmpty ? Icons.email_outlined : null,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildDetailBox(
                  label: 'location'.tr,
                  value: [camp.clientCity, camp.clientState].where((s) => s.isNotEmpty).join(', ').isNotEmpty
                      ? [camp.clientCity, camp.clientState].where((s) => s.isNotEmpty).join(', ')
                      : '—',
                  subValue: camp.clientAddress.isNotEmpty ? camp.clientAddress : null,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildDetailBox(
                  label: 'registered_agency'.tr,
                  value: camp.advertiserCompanyName.isNotEmpty ? camp.advertiserCompanyName : '—',
                  subValue: camp.advertiserEmail.isNotEmpty ? camp.advertiserEmail : null,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ----------------- Section 2: Billing & Settlement Breakdown -----------------
  Widget _buildBillingSettlementSection(CampaignPaymentModel camp) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.receipt_long_outlined, size: 16, color: Color(0xFF10B981)),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'billing_settlement_breakdown'.tr.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 5),
                      _buildSettlementStatusPill(camp.isPaid),
                    ],
                  ),
                ],
              ),

            ],
          ),

          const SizedBox(height: 14),

          // 4 Financial Breakdown Boxes
          Row(
            children: [
              Expanded(
                child: _buildDetailBox(
                  label: 'total_payable'.tr,
                  value: '₹${camp.totalPayable.toStringAsFixed(2)}',
                  subValue: 'gross_billing'.tr,
                  isBoldLarge: true,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildDetailBox(
                  label: 'base_taxable'.tr,
                  value: '₹${camp.budget.toStringAsFixed(2)}',
                  subValue: 'before_gst'.tr,
                  isBoldLarge: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(
                child: _buildDetailBox(
                  label: 'gst_amount'.tr,
                  value: '₹${camp.taxAmount.toStringAsFixed(2)}',
                  subValue: 'tax_component_18'.tr,
                  isBoldLarge: true,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildDetailBox(
                  label: 'payment_method'.tr,
                  value: camp.paymentMethod?.capitalizeFirst ?? (camp.isPaid ? 'Settled' : 'Unpaid'),
                  subValue: camp.paidAt != null
                      ? '${'paid'.tr}: ${DateFormat('d MMM yyyy, h:mm a').format(camp.paidAt!)}'
                      : null,
                ),
              ),
            ],
          ),

          // Reference Fields
          if (camp.paymentCode.isNotEmpty || camp.gatewayRef.isNotEmpty || camp.collectorName.isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  if (camp.paymentCode.isNotEmpty)
                    _buildReferenceRow('payment_ledger_code'.tr, camp.paymentCode),
                  if (camp.gatewayRef.isNotEmpty) ...[
                    if (camp.paymentCode.isNotEmpty) const SizedBox(height: 8),
                    _buildReferenceRow('utr_transaction_ref'.tr, camp.gatewayRef),
                  ],
                  if (camp.collectorName.isNotEmpty) ...[
                    if (camp.gatewayRef.isNotEmpty || camp.paymentCode.isNotEmpty)
                      const SizedBox(height: 8),
                    _buildReferenceRow('recorded_by'.tr, camp.collectorName, isMono: false),
                  ],
                ],
              ),
            ),
          ],

          // Checkout Link Box (if unpaid)
          if (!camp.isPaid && controller.checkoutUrl.isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'direct_checkout_link'.tr,
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF334155)),
                          ),
                          child: Text(
                            controller.checkoutUrl,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              color: Color(0xFFCBD5E1),
                              fontSize: 11,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: controller.copyCheckoutUrl,
                        icon: const Icon(Icons.copy, size: 12),
                        label: Text('copy'.tr, style: const TextStyle(fontSize: 11)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4F46E5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ----------------- Section 3: Broadcast Flight Window -----------------
  Widget _buildFlightWindowSection(CampaignPaymentModel camp) {
    final startStr = camp.startDate != null ? DateFormat('d MMM yyyy').format(camp.startDate!) : '—';
    final endStr = camp.endDate != null ? DateFormat('d MMM yyyy').format(camp.endDate!) : '—';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF0284C7).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.access_time_outlined, size: 16, color: Color(0xFF38BDF8)),
              ),
              const SizedBox(width: 8),
              Text(
                'broadcast_flight_window'.tr.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: _buildDetailBox(
                  label: 'flight_dates'.tr,
                  value: '$startStr ${'to'.tr} $endStr',
                  subValue: '${'total'.tr}: ${camp.durationDays} ${'days'.tr}',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildDetailBox(
                  label: 'daily_window'.tr,
                  value: '${camp.broadcastStartTime} – ${camp.broadcastEndTime}',
                  subValue: '${'loop'.tr}: ${camp.frequency}',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          _buildDetailBox(
            label: 'active_days'.tr,
            value: camp.activeDaysFormatted,
            subValue: '${'slot_type'.tr}: ${camp.slotType.capitalizeFirst} • ${camp.durationPerPlaySec}s ${'duration'.tr}',
          ),
        ],
      ),
    );
  }

  // ----------------- Section 4: Creative Media Assets -----------------
  Widget _buildMediaAssetsSection(BuildContext context, CampaignPaymentModel camp) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFA855F7).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.perm_media_outlined, size: 16, color: Color(0xFFC084FC)),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'creative_media_assets'.tr.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFA855F7).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFA855F7).withValues(alpha: 0.3)),
                ),
                child: Text(
                  '${camp.media.length} ${'assets'.tr}',
                  style: const TextStyle(
                    color: Color(0xFFC084FC),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (camp.media.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Text(
                'no_media_creatives_attached'.tr,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
            )
          else
            ...camp.media.asMap().entries.map((entry) {
              final idx = entry.key + 1;
              final asset = entry.value;
              final isVideo = controller.isVideoAsset(asset);
              final resolvedUrl = controller.resolveMediaUrl(asset.fileUrl);

              return Container(
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top header in asset card
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: isVideo
                                      ? const Color(0xFF0284C7).withValues(alpha: 0.2)
                                      : const Color(0xFF10B981).withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: isVideo ? const Color(0xFF0284C7) : const Color(0xFF10B981),
                                  ),
                                ),
                                child: Text(
                                  isVideo ? 'VIDEO' : 'IMAGE',
                                  style: TextStyle(
                                    color: isVideo ? const Color(0xFF38BDF8) : const Color(0xFF34D399),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${'creative_asset'.tr} #$idx',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(Icons.timer_outlined, size: 12, color: Color(0xFF94A3B8)),
                              const SizedBox(width: 4),
                              Text(
                                '${asset.durationSec}s',
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  asset.resolution,
                                  style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Media Visual Box (16:9 Aspect Ratio)
                    GestureDetector(
                      onTap: () {
                        if (isVideo) {
                          controller.openVideo(asset.fileUrl);
                        } else if (resolvedUrl.isNotEmpty) {
                          _showImagePreviewDialog(
                            context,
                            resolvedUrl,
                            '${'creative_asset'.tr} #$idx',
                          );
                        }
                      },
                      child: Container(
                        width: double.infinity,
                        height: 180,
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            if (isVideo) ...[
                              // Video Banner Backdrop
                              Container(
                                width: double.infinity,
                                height: double.infinity,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(
                                        gradient: AppTheme.primaryGradient,
                                        shape: BoxShape.circle,
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppTheme.gradientBlue.withValues(alpha: 0.45),
                                            blurRadius: 16,
                                            spreadRadius: 2,
                                          ),
                                        ],
                                      ),
                                      child: const Icon(
                                        Icons.play_arrow_rounded,
                                        color: Colors.white,
                                        size: 36,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      'video_player_hint'.tr,
                                      style: const TextStyle(
                                        color: Color(0xFF94A3B8),
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ] else if (resolvedUrl.isNotEmpty) ...[
                              // Real Image Network Rendering
                              Image.network(
                                resolvedUrl,
                                width: double.infinity,
                                height: double.infinity,
                                fit: BoxFit.contain,
                                loadingBuilder: (context, child, progress) {
                                  if (progress == null) return child;
                                  return const Center(
                                    child: CircularProgressIndicator(
                                      color: AppColors.primaryButtonBlue,
                                      strokeWidth: 2,
                                    ),
                                  );
                                },
                                errorBuilder: (context, error, stackTrace) {
                                  return Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.broken_image_outlined,
                                            size: 32, color: Color(0xFF64748B)),
                                        const SizedBox(height: 6),
                                        Text(
                                          'image_preview_failed'.tr,
                                          style: const TextStyle(
                                              color: Color(0xFF64748B), fontSize: 11),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                              // Zoom hint badge in corner
                              Positioned(
                                right: 8,
                                bottom: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.zoom_in, color: Colors.white, size: 13),
                                      const SizedBox(width: 4),
                                      Text(
                                        'view_image'.tr,
                                        style: const TextStyle(color: Colors.white, fontSize: 10),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ] else ...[
                              const Center(
                                child: Icon(Icons.perm_media_outlined,
                                    size: 36, color: Color(0xFF64748B)),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),

                    // URL and Action Buttons
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (asset.fileUrl.isNotEmpty) ...[
                            Text(
                              asset.fileUrl,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                color: Color(0xFF94A3B8),
                                fontSize: 10,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 10),
                          ],
                          Row(
                            children: [
                              // Primary Action: Play Video or View Image
                              Expanded(
                                flex: 3,
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: AppTheme.primaryGradient,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      borderRadius: BorderRadius.circular(8),
                                      onTap: () {
                                        if (isVideo) {
                                          controller.openVideo(asset.fileUrl);
                                        } else if (resolvedUrl.isNotEmpty) {
                                          _showImagePreviewDialog(
                                            context,
                                            resolvedUrl,
                                            '${'creative_asset'.tr} #$idx',
                                          );
                                        }
                                      },
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                              isVideo
                                                  ? Icons.play_arrow_rounded
                                                  : Icons.visibility_outlined,
                                              size: 16,
                                              color: Colors.white,
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              isVideo ? 'play_video'.tr : 'view_image'.tr,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // External Browser/App Button
                              Expanded(
                                flex: 2,
                                child: OutlinedButton.icon(
                                  onPressed: () =>
                                      controller.openMediaInBrowser(asset.fileUrl),
                                  icon: const Icon(Icons.open_in_new, size: 13, color: Color(0xFF818CF8)),
                                  label: Text(
                                    'open_in_browser'.tr,
                                    style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Color(0xFF4F46E5)),
                                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Copy URL Button
                              IconButton(
                                onPressed: () => controller.copyCode(asset.fileUrl, 'Media URL'),
                                icon: const Icon(Icons.copy, size: 16, color: Color(0xFF94A3B8)),
                                tooltip: 'copy'.tr,
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  void _showImagePreviewDialog(BuildContext context, String imageUrl, String title) {
    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(12),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 600, maxHeight: 720),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF334155)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Dialog Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFF1E293B),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                  border: Border(bottom: BorderSide(color: Color(0xFF334155))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Get.back(),
                      icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),

              // Interactive Image Body with Pinch-To-Zoom & Pan
              Flexible(
                child: Container(
                  color: Colors.black,
                  width: double.infinity,
                  padding: const EdgeInsets.all(8),
                  child: InteractiveViewer(
                    minScale: 0.5,
                    maxScale: 4.0,
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.contain,
                      loadingBuilder: (context, child, progress) {
                        if (progress == null) return child;
                        return const Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primaryButtonBlue,
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.broken_image, size: 48, color: Color(0xFFEF4444)),
                              const SizedBox(height: 8),
                              Text(
                                'image_preview_failed'.tr,
                                style: const TextStyle(color: Color(0xFF94A3B8)),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),

              // Dialog Footer with Controls
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFF1E293B),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                  border: Border(top: BorderSide(color: Color(0xFF334155))),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.pinch_outlined, size: 14, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 6),
                        Text(
                          'pinch_to_zoom'.tr,
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => controller.openMediaInBrowser(imageUrl),
                            icon: const Icon(Icons.open_in_new, size: 14, color: Color(0xFF818CF8)),
                            label: Text(
                              'open_in_browser'.tr,
                              style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF4F46E5)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => controller.copyCode(imageUrl, 'Image URL'),
                            icon: const Icon(Icons.copy, size: 14, color: Color(0xFF10B981)),
                            label: Text(
                              'copy'.tr,
                              style: const TextStyle(color: Color(0xFF10B981), fontSize: 11),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF10B981)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ----------------- Helpers -----------------
  Widget _buildDetailBox({
    required String label,
    required String value,
    String? subValue,
    Color? subColor,
    IconData? icon,
    IconData? subIcon,
    bool isBoldLarge = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155).withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 3),
          Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 12, color: const Color(0xFF94A3B8)),
                const SizedBox(width: 4),
              ],
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: isBoldLarge ? 14 : 12,
                    fontWeight: isBoldLarge ? FontWeight.w800 : FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          if (subValue != null) ...[
            const SizedBox(height: 2),
            Row(
              children: [
                if (subIcon != null) ...[
                  Icon(subIcon, size: 11, color: const Color(0xFF64748B)),
                  const SizedBox(width: 4),
                ],
                Expanded(
                  child: Text(
                    subValue,
                    style: TextStyle(
                      color: subColor ?? const Color(0xFF64748B),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildReferenceRow(String label, String value, {bool isMono = true}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
        ),
        SizedBox(width: 10,),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontFamily: isMono ? 'monospace' : null,
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color border;
    Color text;

    switch (status.toLowerCase()) {
      case 'live':
        bg = const Color(0xFF064E3B).withValues(alpha: 0.6);
        border = const Color(0xFF059669);
        text = const Color(0xFF34D399);
        break;
      case 'approved':
        bg = const Color(0xFF1E3A8A).withValues(alpha: 0.6);
        border = const Color(0xFF2563EB);
        text = const Color(0xFF60A5FA);
        break;
      case 'completed':
        bg = const Color(0xFF334155).withValues(alpha: 0.6);
        border = const Color(0xFF475569);
        text = const Color(0xFFCBD5E1);
        break;
      case 'paused':
        bg = const Color(0xFF78350F).withValues(alpha: 0.6);
        border = const Color(0xFFD97706);
        text = const Color(0xFFFBBF24);
        break;
      case 'rejected':
        bg = const Color(0xFF7F1D1D).withValues(alpha: 0.6);
        border = const Color(0xFFDC2626);
        text = const Color(0xFFF87171);
        break;
      default:
        bg = const Color(0xFF1E293B);
        border = const Color(0xFF475569);
        text = const Color(0xFF94A3B8);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: text,
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildPaymentPill(bool isPaid) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isPaid
            ? const Color(0xFF064E3B).withValues(alpha: 0.45)
            : const Color(0xFF78350F).withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isPaid ? const Color(0xFF059669) : const Color(0xFFD97706),
        ),
      ),
      child: Text(
        (isPaid ? 'paid'.tr : 'pending_payment'.tr).toUpperCase(),
        style: TextStyle(
          color: isPaid ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _buildSettlementStatusPill(bool isPaid) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isPaid
            ? const Color(0xFF064E3B).withValues(alpha: 0.35)
            : const Color(0xFF78350F).withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isPaid ? const Color(0xFF059669) : const Color(0xFFD97706),
        ),
      ),
      child: Text(
        isPaid ? 'settled'.tr : 'pending'.tr,
        style: TextStyle(
          color: isPaid ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
