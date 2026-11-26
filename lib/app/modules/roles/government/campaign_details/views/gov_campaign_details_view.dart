import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/gov_campaign_details_controller.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import 'package:vmovexa/app/data/models/government_models.dart';

class GovCampaignDetailsView extends GetView<GovCampaignDetailsController> {
  const GovCampaignDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primaryButtonBlue),
            );
          }

          final c = controller.campaign.value;

          return Column(
            children: [
              // Top Bar Header
              _buildTopBar(context),

              // Scrollable Detail Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Header & Meta Summary (Breadcrumbs, Title, Badges, Action Buttons)
                      _buildTopHeader(c),

                      const SizedBox(height: 14),

                      // Conditional Banners (Payment pending sanction or Live broadcast)
                      if (c.isPaymentPending) ...[
                        _buildPaymentPendingBanner(c),
                        const SizedBox(height: 14),
                      ] else if (c.isLiveBroadcast) ...[
                        _buildLiveBroadcastingBanner(c),
                        const SizedBox(height: 14),
                      ],

                      // 5-Tab Horizontal Navigation Controller
                      _buildTabsController(c),

                      const SizedBox(height: 18),

                      // Active Tab Content
                      _buildActiveTabContent(c),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ==========================================
  // TOP BAR HEADER
  // ==========================================
  Widget _buildTopBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Text(
            'gov_campaign_details.title'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.3,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
            tooltip: 'common.refresh'.tr,
            onPressed: () {
              final cid = controller.campaign.value.id;
              if (cid != null && cid.isNotEmpty) {
                controller.fetchCampaignDetails(cid);
              }
            },
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TOP HEADER & META SUMMARY
  // ==========================================
  Widget _buildTopHeader(GovCampaignModel c) {
    final statusText = c.mappedStatus.toUpperCase();
    final statusColor = _getStatusColor(c.mappedStatus);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Breadcrumb: Government > Campaigns > CMP-...
          Row(
            children: [
              const Icon(Icons.account_balance_outlined, size: 12, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(
                'gov_campaign_details.breadcrumb_gov'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              const Text('  /  ', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
              Text(
                'gov_campaign_details.breadcrumb_campaigns'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              const Text('  /  ', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
              Expanded(
                child: Text(
                  c.campaignCode,
                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Title + Badges
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  c.displayName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.14),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withOpacity(0.3), width: 1),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF334155), width: 1),
                ),
                child: Text(
                  c.campaignCode,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          // Department / Ministry Subtitle
          Text.rich(
            TextSpan(
              text: '${'gov_campaign_details.dept_ministry'.tr} ',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11.5, fontWeight: FontWeight.w500),
              children: [
                TextSpan(
                  text: c.departmentOrClient,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                if (c.clientName != null && c.clientName!.isNotEmpty) ...[
                  TextSpan(text: ' · ${'gov_campaign_details.nodal_contact'.tr}: '),
                  TextSpan(
                    text: '${c.clientName} (${c.clientCompany ?? "Dept"})',
                    style: const TextStyle(color: Color(0xFFCBD5E1), fontWeight: FontWeight.w600),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Action Buttons
          _buildActionButtons(c),
        ],
      ),
    );
  }

  // ==========================================
  // ACTION BUTTONS (Admin Panel Parity)
  // ==========================================
  Widget _buildActionButtons(GovCampaignModel c) {
    final rawStatus = (c.status ?? '').toLowerCase();
    final isDraft = rawStatus == 'draft';
    final isPending = rawStatus == 'pending_approval' || rawStatus == 'under review';
    final isLive = c.isLiveBroadcast;
    final isPaused = c.isPausedBroadcast;

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        // Approve Broadcast (Gradient button)
        if (isPending || isDraft)
          Obx(() {
            final verifying = controller.isVerifying.value;
            return InkWell(
              onTap: verifying ? null : () => controller.handleVerifyCampaign(),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2563EB).withOpacity(0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (verifying)
                      const SizedBox(
                        width: 13,
                        height: 13,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    else
                      const Icon(Icons.check_circle_outline_rounded, size: 14, color: Colors.white),
                    const SizedBox(width: 6),
                    Text(
                      'gov_campaign_details.approve_broadcast'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            );
          }),

        // Submit for Review
        if (isDraft)
          Obx(() {
            final submitting = controller.isSubmitting.value;
            return InkWell(
              onTap: submitting ? null : () => controller.handleSubmitCampaign(),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (submitting)
                      const SizedBox(
                        width: 13,
                        height: 13,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    else
                      const Icon(Icons.send_rounded, size: 14, color: Colors.white),
                    const SizedBox(width: 6),
                    Text(
                      'gov_campaign_details.submit_review'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            );
          }),

        // Pause Broadcast
        if (isLive)
          InkWell(
            onTap: () => controller.handlePauseCampaign(),
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.pause_rounded, size: 14, color: Colors.white),
                  const SizedBox(width: 6),
                  Text(
                    'gov_campaign_details.pause_broadcast'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),

        // Resume Broadcast
        if (isPaused)
          InkWell(
            onTap: () => controller.handleStartCampaign(),
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.play_arrow_rounded, size: 14, color: Colors.white),
                  const SizedBox(width: 6),
                  Text(
                    'gov_campaign_details.resume_broadcast'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),

        // End Ad
        if (isLive || isPaused)
          InkWell(
            onTap: () => controller.handleEndCampaign(),
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF334155),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.stop_rounded, size: 14, color: Colors.white70),
                  const SizedBox(width: 5),
                  Text(
                    'gov_campaign_details.end_ad'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),

        // Edit
        if (isDraft || isPending || rawStatus == 'rejected')
          InkWell(
            onTap: () => Get.toNamed('/roles/government/create-campaign', arguments: c),
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF475569)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.edit_outlined, size: 13, color: Colors.white70),
                  const SizedBox(width: 5),
                  Text(
                    'common.edit'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),

        // Delete
        if (isDraft || isPending || rawStatus == 'rejected')
          InkWell(
            onTap: () => controller.handleDeleteCampaign(),
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.4)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.delete_outline_rounded, size: 13, color: Color(0xFFEF4444)),
                  const SizedBox(width: 5),
                  Text(
                    'common.delete'.tr,
                    style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11.5, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  // ==========================================
  // STATUS BANNERS (Admin Panel Parity)
  // ==========================================
  Widget _buildPaymentPendingBanner(GovCampaignModel c) {
    final total = c.totalAmount > 0 ? c.totalAmount.round() : c.baseBudget.round();

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.35), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'gov_campaign_details.approved_compliance_banner'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${'gov_campaign_details.screen_slots_reserved_banner'.tr} ${c.totalScreens} ${'gov_campaign_details.awaiting_sanction_banner'.tr} ₹$total ${'gov_campaign_details.to_clear_broadcast'.tr}',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => controller.updateTab('payment_qr'),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.payments_outlined, size: 14, color: Colors.white),
                        const SizedBox(width: 6),
                        Text(
                          'gov_campaign_details.record_treasury_sanction'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              InkWell(
                onTap: () => controller.handleCopyCheckoutUrl(),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.share_outlined, size: 14, color: Colors.white),
                      const SizedBox(width: 6),
                      Text(
                        'gov_campaign_details.share_link'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
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

  Widget _buildLiveBroadcastingBanner(GovCampaignModel c) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF064E3B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: const BoxDecoration(
              color: Color(0xFF10B981),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'gov_campaign_details.live_broadcasting_banner'.tr,
                  style: const TextStyle(color: Color(0xFFA7F3D0), fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  '${'gov_campaign_details.operating_slot'.tr} ${c.slotStartTime} – ${c.slotEndTime} IST · ${c.totalScreens} ${'gov_campaign_details.active_screens'.tr}',
                  style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 10.5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          InkWell(
            onTap: () => controller.handlePauseCampaign(),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'gov_campaign_details.pause_ad'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 5-TAB HORIZONTAL SECTION CONTROLLER
  // ==========================================
  Widget _buildTabsController(GovCampaignModel c) {
    final total = c.totalAmount > 0 ? c.totalAmount.round() : c.baseBudget.round();
    final tabs = [
      {
        'id': 'all',
        'label': 'gov_campaign_details.all_details'.tr,
        'icon': Icons.info_outline_rounded,
        'count': null,
      },
      {
        'id': 'overview',
        'label': 'gov_campaign_details.overview_dept'.tr,
        'icon': Icons.business_outlined,
        'count': 'Dept',
      },
      {
        'id': 'media_fleet',
        'label': 'gov_campaign_details.creatives_fleet'.tr,
        'icon': Icons.video_library_outlined,
        'count': '${c.totalScreens} Disp',
      },
      {
        'id': 'schedule_budget',
        'label': 'gov_campaign_details.schedule_budget'.tr,
        'icon': Icons.calendar_today_outlined,
        'count': '₹$total',
      },
      {
        'id': 'payment_qr',
        'label': 'gov_campaign_details.clearance_qr'.tr,
        'icon': Icons.qr_code_2_rounded,
        'count': c.isPaymentSettled ? 'paid_status'.tr : 'sanction_status'.tr,
      },
    ];

    return Obx(() {
      final active = controller.selectedTab.value;

      return SizedBox(
        height: 42,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: tabs.length,
          separatorBuilder: (context, index) => const SizedBox(width: 8),
          itemBuilder: (context, i) {
            final tab = tabs[i];
            final tabId = tab['id'] as String;
            final isCurrent = active == tabId;
            final count = tab['count'] as String?;

            return InkWell(
              onTap: () => controller.updateTab(tabId),
              borderRadius: BorderRadius.circular(12),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: isCurrent ? AppTheme.primaryGradient : null,
                  color: isCurrent ? null : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isCurrent ? Colors.transparent : AppColors.cardBorder,
                    width: 1.2,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      tab['icon'] as IconData,
                      size: 14,
                      color: isCurrent ? Colors.white : AppColors.textMuted,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      tab['label'] as String,
                      style: TextStyle(
                        color: isCurrent ? Colors.white : AppColors.textSecondary,
                        fontSize: 11.5,
                        fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                    if (count != null) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: isCurrent ? Colors.white.withOpacity(0.22) : const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          count,
                          style: TextStyle(
                            color: isCurrent ? Colors.white : const Color(0xFF94A3B8),
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        ),
      );
    });
  }

  // ==========================================
  // DYNAMIC SECTION RENDERING
  // ==========================================
  Widget _buildActiveTabContent(GovCampaignModel c) {
    return Obx(() {
      final tab = controller.selectedTab.value;

      if (tab == 'all') {
        return Column(
          children: [
            _buildOverviewDeptSection(c),
            const SizedBox(height: 18),
            _buildMediaFleetSection(c),
            const SizedBox(height: 18),
            _buildScheduleBudgetSection(c),
            const SizedBox(height: 18),
            _buildClearanceQrSection(c),
          ],
        );
      } else if (tab == 'overview') {
        return Column(
          children: [
            _buildOverviewDeptSection(c),
            const SizedBox(height: 16),
            _buildFooterNav(prevTab: null, nextTab: 'media_fleet'),
          ],
        );
      } else if (tab == 'media_fleet') {
        return Column(
          children: [
            _buildMediaFleetSection(c),
            const SizedBox(height: 16),
            _buildFooterNav(prevTab: 'overview', nextTab: 'schedule_budget'),
          ],
        );
      } else if (tab == 'schedule_budget') {
        return Column(
          children: [
            _buildScheduleBudgetSection(c),
            const SizedBox(height: 16),
            _buildFooterNav(prevTab: 'media_fleet', nextTab: 'payment_qr'),
          ],
        );
      } else {
        return Column(
          children: [
            _buildClearanceQrSection(c),
            const SizedBox(height: 16),
            _buildFooterNav(prevTab: 'schedule_budget', nextTab: null),
          ],
        );
      }
    });
  }

  // ==========================================
  // SECTION 1: OVERVIEW & DEPARTMENT
  // ==========================================
  Widget _buildOverviewDeptSection(GovCampaignModel c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1A. Campaign Overview & Metadata
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.info_outline_rounded, size: 16, color: Color(0xFF6366F1)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.campaign_overview_meta'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12,
                            fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                  SizedBox(width: 5,),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric( vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Text(
                        'gov_campaign_details.step_1_info'.tr,
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
              const Divider(color: AppColors.cardBorder, height: 24),
              _buildDataRow('gov_campaign_details.campaign_name'.tr, c.displayName),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.dept_ministry'.tr, c.departmentOrClient),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.campaign_type'.tr, c.campaignType),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.strategic_objective'.tr, c.strategicObjective),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.industry_category'.tr, c.displayCategory),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.submitted_on'.tr, c.submittedOnDisplay),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.submitted_by'.tr, c.submittedByUser),
              if (c.description != null && c.description!.isNotEmpty) ...[
                const SizedBox(height: 14),
                Text(
                  '${'gov_campaign_details.brief_desc'.tr}:',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155), width: 1),
                  ),
                  child: Text(
                    c.description!,
                    style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5, height: 1.4),
                  ),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 1B. Department / Authority Details
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.35), width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.account_balance_outlined, size: 16, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.dept_authority_details'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                  // Container(
                  //   padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  //   decoration: BoxDecoration(
                  //     color: const Color(0xFF1E3A8A).withOpacity(0.4),
                  //     borderRadius: BorderRadius.circular(6),
                  //     border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4)),
                  //   ),
                  //   child: Text(
                  //     'gov_campaign_details.payment_recipient'.tr,
                  //     style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold),
                  //   ),
                  // ),
                ],
              ),
              const Divider(color: AppColors.cardBorder, height: 24),
              _buildDataRow('gov_campaign_details.contact_person'.tr, c.clientName ?? '–'),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.dept_office_name'.tr, c.clientCompany ?? '–'),
              const SizedBox(height: 10),
              // Phone with call action
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 120,
                    child: Text(
                      'gov_campaign_details.official_phone'.tr,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        if (c.clientPhone != null && c.clientPhone!.isNotEmpty) {
                          controller.handleOpenUrl('tel:${c.clientPhone}');
                        }
                      },
                      child: Row(
                        children: [
                          const Icon(Icons.phone_outlined, size: 13, color: Color(0xFF38BDF8)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              c.clientPhone ?? '–',
                              style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11.5, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // Email with mail action
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 120,
                    child: Text(
                      'gov_campaign_details.official_email'.tr,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        if (c.clientEmail != null && c.clientEmail!.isNotEmpty) {
                          controller.handleOpenUrl('mailto:${c.clientEmail}');
                        }
                      },
                      child: Row(
                        children: [
                          const Icon(Icons.mail_outline_rounded, size: 13, color: Color(0xFF38BDF8)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              c.clientEmail ?? '–',
                              style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11.5, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _buildDataRow(
                'gov_campaign_details.city_state'.tr,
                [c.clientCity, c.clientState].where((s) => s.isNotEmpty).join(', ') + (c.clientPincode.isNotEmpty ? ' (${c.clientPincode})' : ''),
              ),
              const SizedBox(height: 10),
              _buildDataRow('gov_campaign_details.office_hq_address'.tr, c.clientAddress.isNotEmpty ? c.clientAddress : '–'),
              if (c.clientLatitude != null && c.clientLongitude != null) ...[
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => controller.handleOpenUrl('https://www.google.com/maps/search/?api=1&query=${c.clientLatitude},${c.clientLongitude}'),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF38BDF8)),
                      const SizedBox(width: 4),
                      Text(
                        '${'gov_campaign_details.view_map_pin'.tr} (${c.clientLatitude!.toStringAsFixed(4)}, ${c.clientLongitude!.toStringAsFixed(4)})',
                        style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // SECTION 2: CREATIVES & FLEET
  // ==========================================
  Widget _buildMediaFleetSection(GovCampaignModel c) {
    final mediaList = c.mediaList;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 2A. Advertisement Creative Assets
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.video_library_outlined, size: 16, color: Color(0xFF6366F1)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.creative_assets'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                  // Container(
                  //   padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  //   decoration: BoxDecoration(
                  //     color: const Color(0xFF1E3A8A).withOpacity(0.4),
                  //     borderRadius: BorderRadius.circular(6),
                  //     border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4)),
                  //   ),
                  //   child: Text(
                  //     '${mediaList.length} ${'gov_campaign_details.attached_assets'.tr}',
                  //     style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold),
                  //   ),
                  // ),
                ],
              ),
              const Divider(color: AppColors.cardBorder, height: 24),

              if (mediaList.isEmpty)
                Text(
                  'gov_campaign_details.no_assets'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12, fontStyle: FontStyle.italic),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: mediaList.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 14),
                  itemBuilder: (context, idx) {
                    final item = mediaList[idx];
                    final type = (item['type'] ?? 'Image').toString();
                    final url = (item['url'] ?? '').toString();
                    final name = (item['name'] ?? 'Asset').toString();
                    final resolution = (item['resolution'] ?? '1920 × 1080').toString();
                    final duration = (item['duration'] ?? '').toString();
                    final size = (item['size'] ?? '').toString();
                    final ytId = item['ytId'] as String?;

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  name,
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF6366F1).withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.5)),
                                ),
                                child: Text(
                                  type.toUpperCase(),
                                  style: const TextStyle(color: Color(0xFFA5B4FC), fontSize: 9.5, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$resolution · $duration · $size',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                          ),
                          const SizedBox(height: 10),

                          // Previews based on type
                          if (type == 'Image' && url.isNotEmpty)
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                url,
                                width: double.infinity,
                                height: 160,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  height: 100,
                                  color: const Color(0xFF1E293B),
                                  alignment: Alignment.center,
                                  child: const Icon(Icons.image_not_supported_outlined, color: Colors.white30, size: 32),
                                ),
                              ),
                            )
                          else if (type == 'Video')
                            Container(
                              height: 140,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Colors.black,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFF334155)),
                              ),
                              alignment: Alignment.center,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.play_circle_fill_rounded, color: Color(0xFF60A5FA), size: 44),
                                    onPressed: () => controller.handleOpenUrl(url),
                                  ),
                                  Text(
                                    duration,
                                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            )
                          else if (type == 'PDF')
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              alignment: Alignment.center,
                              child: Column(
                                children: [
                                  const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFEF4444), size: 36),
                                  const SizedBox(height: 6),
                                  Text(
                                    name,
                                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '$size · ${'gov_campaign_details.vector_doc_displays'.tr}',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                                  ),
                                  const SizedBox(height: 10),
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0F172A),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    icon: const Icon(Icons.open_in_new_rounded, size: 14, color: Colors.white),
                                    label: Text(
                                      'gov_campaign_details.open_pdf'.tr,
                                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    onPressed: () => controller.handleOpenUrl(url),
                                  ),
                                ],
                              ),
                            )
                          else if (type == 'URL')
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.link_rounded, color: Color(0xFF38BDF8), size: 24),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(name, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                                        Text(url, style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontFamily: 'monospace'), overflow: TextOverflow.ellipsis),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0F172A),
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () => controller.handleOpenUrl(url),
                                    child: Text(
                                      ytId != null ? 'gov_campaign_details.watch_yt'.tr : 'gov_campaign_details.visit_link'.tr,
                                      style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 2B. Transit Corridors & Screen Inventory
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.directions_bus_outlined, size: 16, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.transit_routes'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),

                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A8A).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4)),
                ),
                child: Text(
                  '${c.totalBuses} Buses · ${c.totalScreens} Screens',
                  style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              const Divider(color: AppColors.cardBorder, height: 24),

              // 4 Metrics Grid
              Row(
                children: [
                  Expanded(child: _buildMetricTile('${c.targets?.length ?? 1} Corridors', 'gov_campaign_details.selected_routes'.tr, const Color(0xFFCBD5E1))),
                  const SizedBox(width: 8),
                  Expanded(child: _buildMetricTile('${c.totalBuses} Buses', 'gov_campaign_details.transit_fleet'.tr, const Color(0xFF60A5FA))),
                  const SizedBox(width: 8),
                  Expanded(child: _buildMetricTile('${c.totalScreens} Screens', 'gov_campaign_details.dooh_screens'.tr, const Color(0xFFA78BFA))),
                  const SizedBox(width: 8),
                  Expanded(child: _buildMetricTile('~${c.estimatedCommuters}', 'gov_campaign_details.daily_commuters'.tr, const Color(0xFF34D399))),
                ],
              ),

              const SizedBox(height: 12),

              // Live MQTT Telemetry Bar
              Obx(() {
                final mqtt = controller.mqttStatus;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${'gov_campaign_details.transit_telemetry'.tr}: ${'gov_campaign_details.active_ready'.tr} | ${'gov_campaign_details.connected_displays'.tr}: ${mqtt['onlineDevices']} / ${mqtt['totalDevices']}',
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10.5, fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                );
              }),

              const SizedBox(height: 12),

              // Assigned Corridors List
              Text(
                '${'gov_campaign_details.assigned_corridors'.tr}:',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),

              if (c.targets != null && c.targets!.isNotEmpty)
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: c.targets!.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 8),
                  itemBuilder: (context, idx) {
                    final target = c.targets![idx];
                    final routeCode = target['route'] is Map ? target['route']['code'] : (target['route_code'] ?? 'RTE-${idx + 1}');
                    final routeName = target['route'] is Map ? target['route']['name'] : (target['route_name'] ?? target['fleet_name'] ?? 'transit_route'.tr);
                    final city = target['city'] ?? (target['route'] is Map ? target['route']['start_point'] : 'City Corridor');
                    final fleetName = target['fleet_name'] ?? 'transit_operator'.tr;
                    final busesCount = target['vehicles_count'] ?? (target['vehicle_ids'] is List ? (target['vehicle_ids'] as List).length : 1);
                    final screensCount = target['screens_count'] ?? 1;

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF475569)),
                            ),
                            child: Text(
                              routeCode.toString(),
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  routeName.toString(),
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '$city · ${'gov_campaign_details.operator'.tr}: $fleetName',
                                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '$busesCount Buses',
                                style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                '$screensCount Screens',
                                style: const TextStyle(color: Color(0xFFA78BFA), fontSize: 10, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                )
              else
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('RTE-01', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'City Center Transit Corridors',
                          style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Text(
                        '${c.totalBuses} Buses · ${c.totalScreens} Screens',
                        style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // SECTION 3: SCHEDULE & BUDGET
  // ==========================================
  Widget _buildScheduleBudgetSection(GovCampaignModel c) {
    final total = c.totalAmount > 0 ? c.totalAmount.round() : c.baseBudget.round();
    final base = c.baseBudget.round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 3A. Broadcast Schedule & Airtime Operating Window
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 16, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.broadcast_schedule'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A8A).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4)),
                ),
                child: Text(
                  '${c.durationDays} Days (${c.dailyOperatingHoursDisplay})',
                  style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              const Divider(color: AppColors.cardBorder, height: 24),

              // 4 Info Cards Grid
              Row(
                children: [
                  Expanded(
                    child: _buildScheduleInfoCard(
                      'gov_campaign_details.broadcast_start'.tr,
                      c.displayDates.split('–').first.trim(),
                      c.slotStartTime,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildScheduleInfoCard(
                      'gov_campaign_details.broadcast_end'.tr,
                      c.displayDates.split('–').length > 1 ? c.displayDates.split('–')[1].trim() : '',
                      c.slotEndTime,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildScheduleInfoCard(
                      'gov_campaign_details.repeat_active_days'.tr,
                      c.repeatFrequency,
                      '${c.selectedDaysList.length} ${'gov_campaign_details.of_7_days'.tr}',
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildScheduleInfoCard(
                      'gov_campaign_details.daily_slot_hours'.tr,
                      '${c.slotStartTime} – ${c.slotEndTime}',
                      c.dailyOperatingHoursDisplay,
                      highlightSub: true,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // 24-Hour Visual Airtime Bar
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('00:00 (${'gov_campaign_details.night'.tr})', style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                        Text(
                          '${'gov_campaign_details.active_slot'.tr}: ${c.slotStartTime} - ${c.slotEndTime}',
                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                        Text('24:00 (${'gov_campaign_details.midnight'.tr})', style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Track
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final totalWidth = constraints.maxWidth;
                        final leftFraction = max(0.0, c.startMinutes / 1440.0);
                        final widthFraction = max(0.05, min(1.0, c.diffMinutes / 1440.0));
                        final leftOffset = leftFraction * totalWidth;
                        final activeWidth = widthFraction * totalWidth;

                        return Container(
                          height: 10,
                          width: totalWidth,
                          decoration: BoxDecoration(
                            color: const Color(0xFF334155),
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: Stack(
                            children: [
                              Positioned(
                                left: leftOffset,
                                width: activeWidth,
                                top: 0,
                                bottom: 0,
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: AppTheme.primaryGradient,
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 10),

              // Timezone & Total Airtime
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      '${'gov_campaign_details.timezone'.tr}: ${c.timezoneDisplay}',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    '${'gov_campaign_details.total_airtime'.tr}: ~${c.totalAirtimeHours} hrs',
                    style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10.5, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 3B. Budget & Tax Invoice Breakdown
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.currency_rupee_rounded, size: 16, color: Color(0xFF10B981)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.budget_breakdown'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),

                ],
              ),
              SizedBox(height: 5,),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B).withOpacity(0.5),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                ),
                child: Text(
                  '${'gov_campaign_details.total_payable'.tr}: ₹$total',
                  style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              const Divider(color: AppColors.cardBorder, height: 24),

              // Summary Cards Grid
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('gov_campaign_details.base_flight_invest'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('₹ $base', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (total - base != 0) ...[
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('gov_campaign_details.taxes_surcharges'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('+ ₹ ${total - base}', style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF064E3B).withOpacity(0.35),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.5), width: 1.5),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('gov_campaign_details.total_payable'.tr.toUpperCase(), style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('₹ $total', style: const TextStyle(color: Color(0xFFA7F3D0), fontSize: 15, fontWeight: FontWeight.w900, fontFamily: 'monospace')),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Itemized Billing Ledger Table
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'gov_campaign_details.itemized_billing_ledger'.tr.toUpperCase(),
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 8),
                    ...c.breakdownItems.map((item) {
                      final label = item['label'] ?? 'broadcast_fee_fallback'.tr;
                      final amount = double.tryParse(item['amount']?.toString() ?? '') ?? 0.0;
                      final type = item['type'] ?? 'base';
                      final isDiscount = type == 'discount' || amount < 0;
                      final isTax = type == 'tax';
                      final sign = isDiscount ? '- ' : (type == 'base' ? '' : '+ ');
                      final color = isDiscount ? const Color(0xFF34D399) : (isTax ? const Color(0xFFFBBF24) : Colors.white);

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 3),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(label.toString(), style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5)),
                            Text('$sign₹ ${amount.abs().round()}', style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                          ],
                        ),
                      );
                    }),
                    const Divider(color: Color(0xFF334155), height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('gov_campaign_details.grand_total_checkout'.tr, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                        Text('₹ $total', style: const TextStyle(color: Color(0xFF34D399), fontSize: 14, fontWeight: FontWeight.w900, fontFamily: 'monospace')),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // SECTION 4: CLEARANCE & QR CODE
  // ==========================================
  Widget _buildClearanceQrSection(GovCampaignModel c) {
    final isPaid = c.isPaymentSettled;
    final total = c.totalAmount > 0 ? c.totalAmount.round() : c.baseBudget.round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4A. Customer Payment Checkout & Clearance Dispatch
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.35), width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.share_outlined, size: 16, color: Color(0xFF6366F1)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.customer_payment_checkout'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                
                ],
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: isPaid ? const Color(0xFF064E3B).withOpacity(0.5) : const Color(0xFF78350F).withOpacity(0.5),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B)),
                ),
                child: Text(
                  isPaid ? '● ${'gov_campaign_details.payment_settled'.tr}' : '${'gov_campaign_details.awaiting_sanction'.tr}: ₹$total',
                  style: TextStyle(color: isPaid ? const Color(0xFF6EE7B7) : const Color(0xFFFCD34D), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'gov_campaign_details.send_direct_checkout_desc'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
              ),
              const Divider(color: AppColors.cardBorder, height: 24),

              if (isPaid) ...[
                // Payment Settled Banner
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF064E3B).withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Payment of ₹$total ${'gov_campaign_details.payment_cleared_ready'.tr}',
                          style: const TextStyle(color: Color(0xFFA7F3D0), fontSize: 11.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),

                // Offline Settlement Details Card
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${'gov_campaign_details.settled_offline_mode'.tr}: ${c.offlineMethod.toUpperCase()}',
                            style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(4)),
                            child: Text(
                              '${'gov_campaign_details.ref'.tr}: ${c.paymentReference}',
                              style: const TextStyle(color: Colors.white70, fontSize: 9.5, fontFamily: 'monospace'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (c.paymentBankName != null) _buildDataRow('gov_campaign_details.bank'.tr, c.paymentBankName!),
                      if (c.paymentChequeDateDisplay != null) _buildDataRow('gov_campaign_details.cheque_date'.tr, c.paymentChequeDateDisplay!),
                      if (c.paymentSettledOnDisplay != null) _buildDataRow('gov_campaign_details.settled_on'.tr, c.paymentSettledOnDisplay!),
                      if (c.paymentProofUrl != null) ...[
                        const SizedBox(height: 8),
                        InkWell(
                          onTap: () => controller.handleOpenUrl(c.paymentProofUrl!),
                          child: Row(
                            children: [
                              const Icon(Icons.attach_file_rounded, size: 14, color: Color(0xFF60A5FA)),
                              const SizedBox(width: 4),
                              Text(
                                '${'gov_campaign_details.payment_proof'.tr} (${'gov_campaign_details.open_proof'.tr})',
                                style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ] else ...[
                // Public Checkout URL Box
                Text(
                  '${'gov_campaign_details.public_checkout_url'.tr}:',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          c.publicCheckoutUrl,
                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontFamily: 'monospace'),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: () => controller.handleCopyCheckoutUrl(),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.copy_rounded, size: 12, color: Colors.white),
                              const SizedBox(width: 4),
                              Text('common.copy'.tr, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // SMS Dispatch Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'gov_campaign_details.send_sms_checkout'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: controller.clientPhoneController,
                              style: const TextStyle(color: Colors.white, fontSize: 12),
                              keyboardType: TextInputType.phone,
                              decoration: InputDecoration(
                                hintText: '+91 98765 43210',
                                hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
                                isDense: true,
                                filled: true,
                                fillColor: const Color(0xFF1E293B),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Obx(() {
                            final sending = controller.isSendingSms.value;
                            return ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              onPressed: sending ? null : () => controller.handleSendSms(),
                              child: sending
                                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                  : Text('send_sms_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                            );
                          }),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 10),

                // Email Dispatch Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'gov_campaign_details.send_email_invoice'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: controller.clientEmailController,
                              style: const TextStyle(color: Colors.white, fontSize: 12),
                              keyboardType: TextInputType.emailAddress,
                              decoration: InputDecoration(
                                hintText: 'nodal@dept.gov.in',
                                hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
                                isDense: true,
                                filled: true,
                                fillColor: const Color(0xFF1E293B),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Obx(() {
                            final sending = controller.isSendingEmail.value;
                            return ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2563EB),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              onPressed: sending ? null : () => controller.handleSendEmail(),
                              child: sending
                                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                  : Text('send_email_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                            );
                          }),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 10),

                // WhatsApp Direct Share Button
                InkWell(
                  onTap: () => controller.handleShareWhatsapp(),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF16A34A),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'gov_campaign_details.share_whatsapp'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Record Treasury / Sanction Callout
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF78350F).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.account_balance_wallet_outlined, color: Color(0xFFFBBF24), size: 24),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'gov_campaign_details.offline_treasury_title'.tr,
                              style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'gov_campaign_details.offline_treasury_desc'.tr,
                              style: const TextStyle(color: Color(0xFFFDE68A), fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 4B. Dynamic QR Code Identity
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.qr_code_2_rounded, size: 16, color: Color(0xFF10B981)),
                      const SizedBox(width: 8),
                      Text(
                        'gov_campaign_details.qr_identity'.tr.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                    ],
                  ),

                ],
              ),
              SizedBox(height: 5,),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                ),
                child: Text(
                  'gov_campaign_details.live_attribution'.tr,
                  style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              const Divider(color: AppColors.cardBorder, height: 24),

              // QR Code and Details Row
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Rendered QR Code
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: CustomPaint(
                            painter: DummyQrCodePainter(qrData: c.qrCodeId ?? c.qrCode ?? 'VMX-GOV'),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('gov_campaign_details.total_scans'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                              Text('${c.qrScansCount ?? 0}', style: const TextStyle(color: Color(0xFF34D399), fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('gov_campaign_details.attribution_status'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                              Text('gov_campaign_details.gps_iot_active'.tr, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'gov_campaign_details.unique_qr_id'.tr,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            c.qrCodeId ?? c.qrCode ?? 'VMX-QR-${c.campaignCode}',
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'gov_campaign_details.gateway_redirect'.tr,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            c.trackingGatewayUrl,
                            style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontFamily: 'monospace'),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),

                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Action buttons: Share QR Link & Download QR
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF475569)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      icon: const Icon(Icons.share_outlined, size: 14, color: Colors.white70),
                      label: Text(
                        'gov_campaign_details.share_qr_link'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      onPressed: () => controller.handleShareQr(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      icon: const Icon(Icons.download_rounded, size: 14, color: Colors.white),
                      label: Text(
                        'gov_campaign_details.download_qr'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      onPressed: () => controller.handleCopyQrUrl(),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 4C. Campaign Lifecycle & Verification Track
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'gov_campaign_details.lifecycle_track'.tr.toUpperCase(),
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
              const Divider(color: AppColors.cardBorder, height: 24),

              // Horizontal Stepper Track
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildLifecycleStep('gov_campaign_details.step_submitted'.tr, c.submittedOnDisplay, isDone: true, isCurrent: false),
                    _buildStepConnector(isDone: c.status != 'draft'),
                    _buildLifecycleStep(
                      'gov_campaign_details.step_under_review'.tr,
                      c.verifiedOnDisplay ?? (c.status == 'under review' ? 'status_in_progress'.tr : 'status_passed'.tr),
                      isDone: c.status != 'draft',
                      isCurrent: c.status == 'under review' || c.status == 'pending_approval',
                    ),
                    _buildStepConnector(isDone: c.isApprovedStatus),
                    _buildLifecycleStep(
                      'gov_campaign_details.step_approved'.tr,
                      c.approvedOnDisplay ?? (c.isApprovedStatus ? 'status_passed'.tr : 'pending'.tr),
                      isDone: c.isApprovedStatus,
                      isCurrent: false,
                    ),
                    _buildStepConnector(isDone: isPaid),
                    _buildLifecycleStep(
                      'gov_campaign_details.step_payment'.tr,
                      isPaid ? 'status_settled'.tr : 'pending'.tr,
                      isDone: isPaid,
                      isCurrent: c.isPaymentPending,
                    ),
                    _buildStepConnector(isDone: c.isLiveBroadcast || c.status == 'completed'),
                    _buildLifecycleStep(
                      'gov_campaign_details.step_live'.tr,
                      c.isLiveBroadcast ? 'status_active'.tr : (c.status == 'completed' ? 'status_finished'.tr : 'status_waiting_launch'.tr),
                      isDone: c.isLiveBroadcast || c.status == 'completed',
                      isCurrent: c.isLiveBroadcast,
                    ),
                    _buildStepConnector(isDone: c.status == 'completed'),
                    _buildLifecycleStep(
                      'gov_campaign_details.step_completed'.tr,
                      c.status == 'completed' ? 'status_finished'.tr : 'status_future'.tr,
                      isDone: c.status == 'completed',
                      isCurrent: false,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // FOOTER NAVIGATION (When single tab selected)
  // ==========================================
  Widget _buildFooterNav({String? prevTab, String? nextTab}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        if (prevTab != null)
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFF475569)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            icon: const Icon(Icons.arrow_back_rounded, size: 14, color: Colors.white70),
            label: Text('gov_campaign_details.prev_section'.tr, style: const TextStyle(color: Colors.white, fontSize: 11)),
            onPressed: () => controller.updateTab(prevTab),
          )
        else
          const SizedBox.shrink(),

        TextButton(
          onPressed: () => controller.updateTab('all'),
          child: Text(
            'gov_campaign_details.view_all_sections'.tr,
            style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ),

        if (nextTab != null)
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            icon: const Icon(Icons.arrow_forward_rounded, size: 14, color: Colors.white),
            label: Text('gov_campaign_details.next_section'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            onPressed: () => controller.updateTab(nextTab),
          )
        else
          const SizedBox.shrink(),
      ],
    );
  }

  // ==========================================
  // HELPER WIDGETS
  // ==========================================
  Widget _buildDataRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w500),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile(String value, String label, Color valueColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(color: valueColor, fontSize: 11.5, fontWeight: FontWeight.w900),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleInfoCard(String label, String val1, String val2, {bool highlightSub = false}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.w500)),
          const SizedBox(height: 3),
          Text(val1, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 1),
          Text(
            val2,
            style: TextStyle(
              color: highlightSub ? const Color(0xFF60A5FA) : const Color(0xFF94A3B8),
              fontSize: 10,
              fontWeight: highlightSub ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLifecycleStep(String label, String date, {required bool isDone, required bool isCurrent}) {
    return Column(
      children: [
        Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDone
                ? const Color(0xFF10B981)
                : (isCurrent ? const Color(0xFFF59E0B) : const Color(0xFF1E293B)),
            border: Border.all(
              color: isDone
                  ? const Color(0xFF10B981)
                  : (isCurrent ? const Color(0xFFFBBF24) : const Color(0xFF475569)),
              width: isCurrent ? 2 : 1,
            ),
          ),
          child: Icon(
            isDone ? Icons.check_rounded : (isCurrent ? Icons.bolt_rounded : Icons.circle),
            size: 14,
            color: isDone || isCurrent ? Colors.white : Colors.white24,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isCurrent ? const Color(0xFFFCD34D) : (isDone ? Colors.white : AppColors.textMuted),
            fontSize: 10,
            fontWeight: isDone || isCurrent ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          date,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
        ),
      ],
    );
  }

  Widget _buildStepConnector({required bool isDone}) {
    return Container(
      width: 24,
      height: 2,
      margin: const EdgeInsets.only(bottom: 24),
      color: isDone ? const Color(0xFF10B981) : const Color(0xFF334155),
    );
  }

  Color _getStatusColor(String status) {
    final s = status.toLowerCase();
    if (s.contains('running') || s.contains('live')) return const Color(0xFF10B981);
    if (s.contains('approved')) return const Color(0xFF3B82F6);
    if (s.contains('review')) return const Color(0xFFF59E0B);
    if (s.contains('pause')) return const Color(0xFFF59E0B);
    if (s.contains('reject')) return const Color(0xFFEF4444);
    if (s.contains('complete')) return const Color(0xFF64748B);
    return const Color(0xFF94A3B8);
  }
}

// Vector QR Code Painter
class DummyQrCodePainter extends CustomPainter {
  final String qrData;
  DummyQrCodePainter({this.qrData = 'VMX-GOV'});

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = Colors.white;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    final blackPaint = Paint()..color = const Color(0xFF0F172A);
    const int gridSize = 21;
    final double cellSize = size.width / gridSize;

    void drawFinderPattern(int startRow, int startCol) {
      for (int r = 0; r < 7; r++) {
        for (int c = 0; c < 7; c++) {
          final isBorder = r == 0 || r == 6 || c == 0 || c == 6;
          final isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isBorder || isCenter) {
            canvas.drawRect(
              Rect.fromLTWH((startCol + c) * cellSize, (startRow + r) * cellSize, cellSize, cellSize),
              blackPaint,
            );
          }
        }
      }
    }

    drawFinderPattern(0, 0);
    drawFinderPattern(0, gridSize - 7);
    drawFinderPattern(gridSize - 7, 0);

    final seed = qrData.hashCode;
    final rng = Random(seed);

    for (int r = 0; r < gridSize; r++) {
      for (int c = 0; c < gridSize; c++) {
        final inTL = r < 7 && c < 7;
        final inTR = r < 7 && c >= gridSize - 7;
        final inBL = r >= gridSize - 7 && c < 7;
        if (inTL || inTR || inBL) continue;

        if (r == 6 || c == 6) {
          if ((r + c) % 2 == 0) {
            canvas.drawRect(Rect.fromLTWH(c * cellSize, r * cellSize, cellSize, cellSize), blackPaint);
          }
        } else {
          if (rng.nextBool()) {
            canvas.drawRect(Rect.fromLTWH(c * cellSize, r * cellSize, cellSize, cellSize), blackPaint);
          }
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant DummyQrCodePainter oldDelegate) => oldDelegate.qrData != qrData;
}
