import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../controllers/campaign_details_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';

class CampaignDetailsView extends GetView<CampaignDetailsController> {
  const CampaignDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const Expanded(
                    child: Center(
                      child: Text(
                        'Campaign Details',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                    onPressed: () => controller.refreshCampaignDetails(),
                    tooltip: 'Refresh',
                  ),
                ],
              ),
            ),

            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF8B5CF6)));
                }

                final c = controller.campaign.value;

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Meta Card
                      _buildHeaderBanner(c),
                      const SizedBox(height: 16),

                      // Quick Action Buttons
                      _buildQuickActionButtons(c),
                      const SizedBox(height: 18),

                      // 4 Section Navigation Tabs
                      _buildSectionTabs(),
                      const SizedBox(height: 16),

                      // Dynamic Tab Body
                      Obx(() {
                        switch (controller.activeSectionTab.value) {
                          case 'media_fleet':
                            return _buildMediaFleetSection(c);
                          case 'schedule_budget':
                            return _buildScheduleBudgetSection(c);
                          case 'payment_qr':
                            return _buildPaymentQrSection(c);
                          case 'overview':
                          default:
                            return _buildOverviewSection(c);
                        }
                      }),

                      const SizedBox(height: 32),
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

  // ==========================================================
  // HEADER BANNER & ACTION ROW
  // ==========================================================
  Widget _buildHeaderBanner(CampaignModel c) {
    final statusColor = c.statusColor;
    final isPaid = c.paymentBreakdown != null;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 3.5,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Text(
                        c.id.isNotEmpty ? (c.id.startsWith('CMP-') ? c.id : '#${c.id}') : '#CMP',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontFamily: 'monospace',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: statusColor.withOpacity(0.4)),
                          ),
                          child: Text(
                            c.status.toUpperCase(),
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: (isPaid ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                                color: (isPaid ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.4)),
                          ),
                          child: Text(
                            isPaid ? 'PAID' : 'UNPAID',
                            style: TextStyle(
                              color: isPaid ? const Color(0xFF34D399) : const Color(0xFFF87171),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  c.displayTitle,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      c.brandName?.isNotEmpty == true ? c.brandName! : c.displayClient,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    if (c.clientName != null && c.clientName!.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      const Text('·', style: TextStyle(color: AppColors.textMuted)),
                      const SizedBox(width: 8),
                      Text('Client: ${c.clientName}',
                          style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionButtons(CampaignModel c) {
    final isRunning = c.isLive;
    final isPaused = c.isPaused;
    final isApproved = c.status.toLowerCase() == 'approved';
    final isEditable = ['draft', 'pending_approval', 'rejected', 'pending'].contains(c.status.toLowerCase());

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        if (isApproved)
          CustomButton(
            width: 150,
            height: 38,
            text: 'Start Broadcast',
            isGradient: true,
            onTap: controller.startCampaign,
            prefixIcon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 16),
          ),
        if (isRunning)
          SizedBox(
            width: 140,
            height: 38,
            child: ElevatedButton.icon(
              onPressed: controller.pauseCampaign,
              icon: const Icon(Icons.pause_rounded, color: Colors.white, size: 16),
              label: const Text('Pause Ad', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        if (isPaused)
          SizedBox(
            width: 140,
            height: 38,
            child: ElevatedButton.icon(
              onPressed: controller.startCampaign,
              icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 16),
              label: const Text('Resume Ad', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        if (isRunning || isPaused)
          SizedBox(
            width: 140,
            height: 38,
            child: ElevatedButton.icon(
              onPressed: controller.confirmEndCampaign,
              icon: const Icon(Icons.stop_rounded, color: Colors.white, size: 16),
              label: const Text('End Broadcast', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        if (isEditable)
          SizedBox(
            width: 130,
            height: 38,
            child: OutlinedButton.icon(
              onPressed: controller.goToEdit,
              icon: const Icon(Icons.edit_outlined, color: Colors.white, size: 15),
              label: const Text('Edit', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        SizedBox(
          width: 145,
          height: 38,
          child: ElevatedButton.icon(
            onPressed: controller.goToAnalytics,
            icon: const Icon(Icons.bar_chart_rounded, color: Colors.white, size: 16),
            label: const Text('View Analytics', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ),
        if (isEditable)
          SizedBox(
            width: 110,
            height: 38,
            child: OutlinedButton.icon(
              onPressed: controller.confirmDeleteCampaign,
              icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 15),
              label: const Text('Delete', style: TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFEF4444)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
      ],
    );
  }

  // ==========================================================
  // 4 SECTION NAVIGATION TABS
  // ==========================================================
  // Widget _buildSectionTabs() {
  //   final tabs = [
  //     {'key': 'overview', 'label': 'Overview & Client'},
  //     {'key': 'media_fleet', 'label': 'Media & Fleet'},
  //     {'key': 'schedule_budget', 'label': 'Schedule & Budget'},
  //     {'key': 'payment_qr', 'label': 'Payment & QR'},
  //   ];
  //
  //   return SizedBox(
  //     height: 38,
  //     child: ListView.builder(
  //       scrollDirection: Axis.horizontal,
  //       itemCount: tabs.length,
  //       itemBuilder: (context, idx) {
  //         final t = tabs[idx];
  //         final isSelected = controller.activeSectionTab.value == t['key'];
  //         return GestureDetector(
  //           onTap: () => controller.setSectionTab(t['key']!),
  //           child: Container(
  //             margin: const EdgeInsets.only(right: 8),
  //             padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
  //             decoration: BoxDecoration(
  //               gradient: isSelected ? AppTheme.primaryGradient : null,
  //               color: isSelected ? null : AppColors.cardBg,
  //               borderRadius: BorderRadius.circular(10),
  //               border: Border.all(color: isSelected ? Colors.transparent : AppColors.cardBorder, width: 1),
  //             ),
  //             child: Center(
  //               child: Text(
  //                 t['label']!,
  //                 style: TextStyle(
  //                   color: isSelected ? Colors.white : AppColors.textSecondary,
  //                   fontSize: 11,
  //                   fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
  //                 ),
  //               ),
  //             ),
  //           ),
  //         );
  //       },
  //     ),
  //   );
  // }
  Widget _buildSectionTabs() {
    final tabs = [
      {'key': 'overview', 'label': 'Overview & Client'},
      {'key': 'media_fleet', 'label': 'Media & Fleet'},
      {'key': 'schedule_budget', 'label': 'Schedule & Budget'},
      {'key': 'payment_qr', 'label': 'Payment & QR'},
    ];

    return SizedBox(
      height: 38,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: tabs.length,
        itemBuilder: (context, idx) {
          final t = tabs[idx];

          // Obx wraps each tab so the Rx value is read inside its own builder
          return Obx(() {
            final isSelected = controller.activeSectionTab.value == t['key'];

            return GestureDetector(
              onTap: () => controller.setSectionTab(t['key']!),
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppTheme.primaryGradient : null,
                  color: isSelected ? null : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? Colors.transparent : AppColors.cardBorder,
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Text(
                    t['label']!,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          });
        },
      ),
    );
  }
  // ==========================================================
  // TAB 1: OVERVIEW & CLIENT DETAILS
  // ==========================================================
  Widget _buildOverviewSection(CampaignModel c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1A. Campaign Information
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.info_outline_rounded, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 8),
                  Text('Campaign Information',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 14),
              _buildTwoColInfo('Campaign Name', c.displayTitle, 'Brand / Company', c.brandName ?? 'Commercial'),
              const SizedBox(height: 10),
              _buildTwoColInfo('Campaign Type', c.type ?? 'Commercial DOOH', 'Category', c.category ?? 'Retail'),
              const SizedBox(height: 10),
              _buildTwoColInfo('Objective', c.targetAudience ?? 'Brand Awareness', 'Created At', c.createdAt?.split('T').first ?? '—'),
              if (c.description != null && c.description!.trim().isNotEmpty) ...[
                const SizedBox(height: 14),
                const Text('Brief / Description', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                const SizedBox(height: 4),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Text(
                    c.description!,
                    style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 1B. Customer / Client Information Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withOpacity(0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.person_outline_rounded, color: Color(0xFF60A5FA), size: 16),
                      SizedBox(width: 8),
                      Text('Customer / Client Details',
                          style: TextStyle(color: Color(0xFF93C5FD), fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  // Container(
                  //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  //   decoration: BoxDecoration(
                  //     color: const Color(0xFF3B82F6).withOpacity(0.15),
                  //     borderRadius: BorderRadius.circular(6),
                  //   ),
                  //   child: const Text('Payment Link Recipient',
                  //       style: TextStyle(color: Color(0xFF93C5FD), fontSize: 9, fontWeight: FontWeight.bold)),
                  // ),
                ],
              ),
              const SizedBox(height: 14),
              _buildTwoColInfo('Contact Person', c.clientName ?? '—', 'Company Name', c.clientCompany ?? '—'),
              const SizedBox(height: 10),
              _buildTwoColInfo(
                'Mobile Phone (SMS)',
                c.clientPhone ?? '—',
                'Email Address (Invoice)',
                c.clientEmail ?? '—',
                isPhone: c.clientPhone != null,
                isEmail: c.clientEmail != null,
              ),
              const SizedBox(height: 10),
              _buildTwoColInfo(
                'City & State',
                [c.clientCity, c.clientState].whereType<String>().where((s) => s.isNotEmpty).join(', ').isEmpty
                    ? '—'
                    : [c.clientCity, c.clientState].whereType<String>().where((s) => s.isNotEmpty).join(', '),
                'Pincode',
                c.clientPincode ?? '—',
              ),
              const SizedBox(height: 10),
              const Text('Billing Address', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
              const SizedBox(height: 3),
              Text(c.clientAddress ?? '—',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // TAB 2: MEDIA & FLEET TARGETING
  // ==========================================================
  Widget _buildMediaFleetSection(CampaignModel c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 2A. Creative Assets Gallery / Preview
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.video_collection_outlined, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 8),
                  Text('Creative Media Assets',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                height: 160,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        (c.mediaType ?? '').toLowerCase().contains('video')
                            ? Icons.play_circle_fill_rounded
                            : Icons.image_rounded,
                        color: const Color(0xFF8B5CF6),
                        size: 48,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Format: ${(c.mediaType ?? 'Video').toUpperCase()}',
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      if (c.videoUrl != null && c.videoUrl!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          child: Text(
                            c.videoUrl!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 2B. Targeted Transit Inventory
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.directions_bus_outlined, color: Color(0xFF10B981), size: 16),
                      SizedBox(width: 8),
                      Text('Targeted Fleet & Screens',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${c.screensCount} Screens Total',
                      style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              if (c.targets.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Center(
                    child: Text('All city transit routes selected across fleet network',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: c.targets.length,
                  itemBuilder: (context, idx) {
                    final target = c.targets[idx];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.route_outlined, size: 16, color: Color(0xFF8B5CF6)),
                              const SizedBox(width: 8),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    target.fleetName ?? 'City Transit Route #${idx + 1}',
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  if (target.city != null && target.city!.isNotEmpty)
                                    Text(target.city!, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                                ],
                              ),
                            ],
                          ),
                          Text('${target.screensCount} Screens',
                              style: const TextStyle(color: Color(0xFFC4B5FD), fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // TAB 3: SCHEDULE & BUDGET BREAKDOWN
  // ==========================================================
  Widget _buildScheduleBudgetSection(CampaignModel c) {
    final pb = c.paymentBreakdown;
    final baseAmount = pb != null && pb['baseAmount'] != null
        ? double.tryParse(pb['baseAmount'].toString()) ?? (c.rawBudget ?? 0.0)
        : (c.rawBudget ?? 0.0);
    final items = pb != null && pb['items'] is List ? (pb['items'] as List) : [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 3A. Broadcast Schedule
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.calendar_today_outlined, color: Color(0xFF3B82F6), size: 16),
                  SizedBox(width: 8),
                  Text('Broadcast Schedule & Airtime Window',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 14),
              _buildTwoColInfo('Flight Dates', c.dateRangeText, 'Duration', '${c.durationDays ?? 14} Days'),
              const SizedBox(height: 10),
              _buildTwoColInfo(
                'Operating Window',
                '${c.slot?.startTime ?? '08:00'} - ${c.slot?.endTime ?? '22:00'}',
                'Active Days',
                c.slot?.activeDays.isNotEmpty == true ? c.slot!.activeDays.join(', ') : 'Daily (All 7 Days)',
              ),
              const SizedBox(height: 14),

              // Visual 24-hr Airtime Window Bar
              const Text('Active Daily Airtime Visualizer (24-Hour Day)',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
              const SizedBox(height: 6),
              Container(
                height: 8,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    const Spacer(flex: 8),
                    Expanded(
                      flex: 14,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                    const Spacer(flex: 2),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('00:00 (Night)', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                  Text('08:00 - 22:00 (Active)', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 8, fontWeight: FontWeight.bold)),
                  Text('24:00 (Midnight)', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 3B. Budget & Itemized Tax Invoice Breakdown
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.receipt_long_outlined, color: Color(0xFF10B981), size: 16),
                      SizedBox(width: 8),
                      Text('Budget & Invoice Breakdown',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Pay:${c.budget}',
                      // 'Payable: ${c.budget}',
                      style: const TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Base amount row
              _buildBreakdownRow('Campaign Base Budget', '₹ ${baseAmount.toStringAsFixed(0)}', isBold: true),
              const Divider(color: AppColors.cardBorder, height: 16),

              // Itemized rows from backend
              if (items.isNotEmpty)
                ...items.map((it) {
                  if (it is! Map) return const SizedBox.shrink();
                  final label = it['label']?.toString() ?? 'Fee';
                  final amt = double.tryParse(it['amount']?.toString() ?? '0') ?? 0.0;
                  final type = it['type']?.toString() ?? 'charge';
                  final isDiscount = type == 'discount';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _buildBreakdownRow(
                      label,
                      '${isDiscount ? '- ' : '+ '}₹ ${amt.toStringAsFixed(0)}',
                      isNegative: isDiscount,
                    ),
                  );
                })
              else ...[
                _buildBreakdownRow('Central GST (CGST 9%)', '+ ₹ ${(baseAmount * 0.09).toStringAsFixed(0)}'),
                const SizedBox(height: 8),
                _buildBreakdownRow('State GST (SGST 9%)', '+ ₹ ${(baseAmount * 0.09).toStringAsFixed(0)}'),
              ],

              const Divider(color: AppColors.cardBorder, height: 20),
              _buildBreakdownRow('Total Amount Payable', c.budget, isBold: true, highlightColor: Colors.white),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // TAB 4: PAYMENT & QR ATTRIBUTION
  // ==========================================================
  Widget _buildPaymentQrSection(CampaignModel c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4A. Payment Status & Share Checkout Link
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.payment_outlined, color: Color(0xFF6366F1), size: 16),
                      SizedBox(width: 8),
                      Text('Payment Status & Checkout Token',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: (c.paymentBreakdown != null ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      c.paymentBreakdown != null ? 'PAID' : 'UNPAID',
                      style: TextStyle(
                        color: c.paymentBreakdown != null ? const Color(0xFF34D399) : const Color(0xFFF87171),
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Checkout Token: ${c.id.isNotEmpty ? c.id : 'VMX-TOKEN-AUTO'}',
                style: const TextStyle(color: Colors.white70, fontFamily: 'monospace', fontSize: 11),
              ),
              const SizedBox(height: 14),
              CustomButton(
                width: double.infinity,
                height: 42,
                text: 'Share Payment Checkout Link',
                isGradient: true,
                onTap: controller.showSharePaymentModal,
                // prefixIcon: const Icon(Icons.share_outlined, color: Colors.white, size: 16),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 4B. QR Attribution Metrics
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.qr_code_2_rounded, color: Color(0xFF10B981), size: 16),
                  SizedBox(width: 8),
                  Text('Dynamic QR Lead Attribution',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.qr_code_rounded, size: 48, color: Colors.black),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Code: ${c.promoCode?.isNotEmpty == true ? c.promoCode! : 'VMX-QR-${c.id}'}',
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Redirect: ${c.qrRedirectUrl ?? 'https://vmovexa.com/ad/${c.id}'}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(color: AppColors.cardBorder, height: 1),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMetricStat('QR Scans', '${controller.qrScans.value}'),
                  _buildMetricStat('Leads Generated', '${controller.vmovexaLeads.value}'),
                  _buildMetricStat('Conversion', '${controller.qrConversion.value}%'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 4C. Customer Reviews & Ratings
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 16),
                      SizedBox(width: 8),
                      Text('Customer Reviews & Ratings',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Text('${controller.reviews.length} Reviews',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                ],
              ),
              const SizedBox(height: 14),

              if (controller.reviews.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text('No verified customer feedback submitted yet',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: controller.reviews.length,
                  itemBuilder: (context, idx) {
                    final r = controller.reviews[idx];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(r.customerName ?? 'Verified Customer',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                              Row(
                                children: List.generate(
                                  5,
                                  (i) => Icon(
                                    i < r.rating ? Icons.star_rounded : Icons.star_border_rounded,
                                    size: 13,
                                    color: const Color(0xFFF59E0B),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (r.comment != null && r.comment!.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(r.comment!,
                                style: const TextStyle(color: Colors.white70, fontSize: 10.5, height: 1.3)),
                          ],
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // REUSABLE ROW & STAT HELPERS
  // ==========================================================
  Widget _buildTwoColInfo(
    String label1,
    String val1,
    String label2,
    String val2, {
    bool isPhone = false,
    bool isEmail = false,
  }) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label1, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
              const SizedBox(height: 2),
              isPhone
                  ? GestureDetector(
                      onTap: () => launchUrl(Uri.parse('tel:$val1')),
                      child: Text(val1,
                          style: const TextStyle(
                              color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
                    )
                  : Text(val1,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label2, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
              const SizedBox(height: 2),
              isEmail
                  ? GestureDetector(
                      onTap: () => launchUrl(Uri.parse('mailto:$val2')),
                      child: Text(val2,
                          style: const TextStyle(
                              color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
                    )
                  : Text(val2,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBreakdownRow(String label, String value,
      {bool isBold = false, bool isNegative = false, Color? highlightColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: isBold ? Colors.white : AppColors.textSecondary,
            fontSize: isBold ? 11.5 : 10.5,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: highlightColor ?? (isNegative ? const Color(0xFF34D399) : Colors.white),
            fontSize: isBold ? 13 : 11,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  Widget _buildMetricStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
      ],
    );
  }
}
