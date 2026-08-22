import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/campaign_details_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

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
                    icon: const Icon(Icons.more_horiz_rounded, color: Colors.white, size: 20),
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                physics: const BouncingScrollPhysics(),
                child: Obx(() {
                  final c = controller.campaign.value;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Under Review yellow alert
                      _buildUnderReviewAlert(c),
                      const SizedBox(height: 16),

                      // Campaign Information
                      _buildCampaignInformationCard(c),
                      const SizedBox(height: 18),

                      // Creative Preview with Play button overlay
                      _buildCreativePreviewCard(c),
                      const SizedBox(height: 18),

                      // Fleet & Screens Grid
                      _buildFleetScreensCard(c),
                      const SizedBox(height: 18),

                      // Schedule Details
                      _buildScheduleDetailsCard(c),
                      const SizedBox(height: 18),

                      // Budget & Payment Side-by-side
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(child: _buildBudgetSummaryCard(c)),
                          const SizedBox(width: 12),
                          Expanded(child: _buildPaymentStatusCard(c)),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // QR Tracking Card
                      _buildQrTrackingCard(),
                      const SizedBox(height: 18),

                      // Timeline
                      _buildCampaignTimelineCard(c),
                      const SizedBox(height: 28),

                      // Bottom actions row
                      _buildBottomActionsRow(),
                      const SizedBox(height: 16),
                    ],

                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUnderReviewAlert(dynamic c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF59E0B).withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.2), width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.access_time_rounded, color: Color(0xFFF59E0B), size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Under Review',
                      style: TextStyle(color: Color(0xFFF59E0B), fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Your campaign is under review. We will notify you once it\'s approved.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 10, height: 1.4),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Campaign ID', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(c.id, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(width: 4),
                      GestureDetector(
                        onTap: () {
                          Get.snackbar('Copied', 'Campaign ID copied to clipboard');
                        },
                        child: const Icon(Icons.copy_rounded, color: Color(0xFF8B5CF6), size: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: _buildAlertSubCell(
                    'Submitted On',
                    '07 Aug 2026, 09:41 AM',
                    Icons.access_time_rounded,
                  ),
                ),

                const VerticalDivider(
                  color: Color(0xFF3A3A3A),
                  thickness: 1,
                  width: 16,
                ),

                Expanded(
                  child: _buildAlertSubCell(
                    'Expected Approval',
                    'Within 24 Hours',
                    Icons.shield_outlined,
                  ),
                ),

                const VerticalDivider(
                  color: Color(0xFF3A3A3A),
                  thickness: 1,
                  width: 16,
                ),

                Expanded(
                  child: _buildAlertSubCell(
                    'Submitted By',
                    'John Doe\njohn@citymart.com',
                    Icons.person_outline_rounded,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertSubCell(
      String label,
      String value,
      IconData icon,
      ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          color: const Color(0xFF8B5CF6),
          size: 14,
        ),
        const SizedBox(width: 6),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 8,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }


  Widget _buildCampaignInformationCard(dynamic c) {
    return Container(
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
            children: const [
              Text('Campaign Information', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
              Text('Edit (Disabled)', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildDetailRow('Campaign Name', c.title),
          _buildDetailRow('Brand Name', c.client),
          _buildDetailRow('Campaign Type', 'Offer / Promotion'),
          _buildDetailRow('Objective', 'Increase Brand Awareness'),
          _buildDetailRow('Category', 'Retail'),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildCreativePreviewCard(dynamic c) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.photo_library_outlined, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Creative Preview', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              // Simulated Playable video preview thumbnail
              Container(
                width: 140,
                height: 80,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFEC4899), Color(0xFF8B5CF6)]),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(color: Colors.black38, shape: BoxShape.circle),
                    child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 24),
                  ),
                ),
              ),
              const SizedBox(width: 16),

              // Specifications
              Expanded(
                child: Column(
                  children: [
                    _buildSpecRow('Format', 'MP4'),
                    _buildSpecRow('Resolution', '1920 × 1080'),
                    _buildSpecRow('Duration', '20 sec'),
                    _buildSpecRow('Size', '42 MB'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildFleetScreensCard(dynamic c) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.directions_bus_rounded, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Fleet & Screens', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _buildFleetStatItem('3', 'Fleet Operators', Icons.bus_alert_rounded)),
              Expanded(child: _buildFleetStatItem('1,250', 'Screens', Icons.monitor_rounded)),
              Expanded(child: _buildFleetStatItem('20', 'Cities', Icons.location_city_rounded)),
              Expanded(child: _buildFleetStatItem('2.5M', 'Estimated Reach', Icons.people_outline_rounded)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFleetStatItem(String val, String label, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFF8B5CF6), size: 16),
        const SizedBox(height: 6),
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildScheduleDetailsCard(dynamic c) {
    return Container(
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
            children: const [
              Icon(Icons.calendar_month_outlined, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Schedule', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Start Date & Time', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                    SizedBox(height: 4),
                    Text('20 May 2026, 10:00 AM', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('End Date & Time', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                    SizedBox(height: 4),
                    Text('10 Jun 2026, 10:00 PM', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildDetailRow('Repeat', 'Weekly on Mon, Tue, Wed, Thu, Fri'),
          _buildDetailRow('Daily Time Slot', '08:00 AM - 10:00 PM'),
        ],
      ),
    );
  }

  Widget _buildBudgetSummaryCard(dynamic c) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.currency_rupee_rounded, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Budget Summary', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildBudgetMiniRow('Total Budget', '₹2,50,000'),
          _buildBudgetMiniRow('GST (18%)', '₹45,000'),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Total Paid', style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
              Text('₹2,95,000', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentStatusCard(dynamic c) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.credit_card_outlined, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Payment Status', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Status', style: TextStyle(color: AppColors.textSecondary, fontSize: 9)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Paid', style: TextStyle(color: Color(0xFF10B981), fontSize: 8.5, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          _buildBudgetMiniRow('Paid On', '07 Aug 2026'),
          _buildBudgetMiniRow('Method', 'Credit Card'),
        ],
      ),
    );
  }

  Widget _buildBudgetMiniRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
          Text(value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildCampaignTimelineCard(dynamic c) {
    return Container(
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
            children: const [
              Icon(Icons.timeline_rounded, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Campaign Timeline', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              _buildTimelineStep('Submitted', '07 Aug 2026\n09:41 AM', isChecked: true, icon: Icons.check_rounded),
              _buildTimelineDivider(true),
              _buildTimelineStep('Under Review', 'In Progress', isActiveAlert: true, icon: Icons.access_time_filled_rounded),
              _buildTimelineDivider(false),
              _buildTimelineStep('Approved', 'Pending', isPending: true, icon: Icons.hourglass_empty_rounded),
              _buildTimelineDivider(false),
              _buildTimelineStep('Live', 'Pending', isPending: true, icon: Icons.play_arrow_rounded),
              _buildTimelineDivider(false),
              _buildTimelineStep('Completed', 'Pending', isPending: true, icon: Icons.check_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(String title, String sub, {bool isChecked = false, bool isActiveAlert = false, bool isPending = false, required IconData icon}) {
    Color ringColor = Colors.grey;
    Widget centerNode = Container();

    if (isChecked) {
      ringColor = const Color(0xFF10B981);
      centerNode = Icon(icon, color: const Color(0xFF10B981), size: 10);
    } else if (isActiveAlert) {
      ringColor = const Color(0xFFF59E0B);
      centerNode = Icon(icon, color: const Color(0xFFF59E0B), size: 10);
    } else if (isPending) {
      ringColor = AppColors.cardBorder;
      centerNode = Icon(icon, color: AppColors.textMuted, size: 10);
    }

    return Expanded(
      child: Column(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isChecked
                  ? const Color(0xFF10B981).withOpacity(0.12)
                  : (isActiveAlert ? const Color(0xFFF59E0B).withOpacity(0.12) : Colors.transparent),
              border: Border.all(color: ringColor, width: 1.5),
            ),
            child: Center(child: centerNode),
          ),
          const SizedBox(height: 6),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
          const SizedBox(height: 2),
          Text(sub, style: TextStyle(color: isActiveAlert ? const Color(0xFFF59E0B) : AppColors.textMuted, fontSize: 7), textAlign: TextAlign.center),
        ],
      ),
    );
  }


  Widget _buildTimelineDivider(bool isCompleted) {
    return Container(
      width: 14,
      height: 1.5,
      margin: const EdgeInsets.only(bottom: 24),
      color: isCompleted ? const Color(0xFF10B981) : AppColors.cardBorder,
    );
  }

  Widget _buildBottomActionsRow() {
    final isUnderReview = controller.campaign.value.status == 'PENDING';

    if (isUnderReview) {
      return Row(
        children: [
          // Download Invoice
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () {
                Get.snackbar(
                  'Downloading Invoice',
                  'Your invoice PDF download has started.',
                  snackPosition: SnackPosition.BOTTOM,
                  backgroundColor: const Color(0xFF8B5CF6),
                  colorText: Colors.white,
                );
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF8B5CF6), width: 1.2),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 14),
              label: const Text('Download Invoice', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 14),
          // Back to Campaigns
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => Get.back(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF8B5CF6), width: 1.2),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 14),
              label: const Text('Back to Campaigns', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      );
    }

    return Row(
      children: [
        // Duplicate Campaign
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: ElevatedButton.icon(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.copy_rounded, color: Colors.white, size: 14),
              label: const Text('Duplicate Campaign', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
            ),
          ),
        ),
        const SizedBox(width: 10),

        // Download Invoice
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.cardBorder),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 14),
            label: const Text('Download Invoice', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(width: 10),

        // Back to Campaigns
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => Get.back(),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.cardBorder),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 14),
            label: const Text('Back to Campaigns', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildQrTrackingCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.qr_code_scanner_rounded, color: Color(0xFF10B981), size: 14),
                  SizedBox(width: 8),
                  Text('QR Tracking', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  Text('Enabled', style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
                ],
              ),
              GestureDetector(
                onTap: () {
                  Get.snackbar('QR Details', 'Opening QR placement configuration details');
                },
                child: Row(
                  children: const [
                    Text('View Details', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 9.5, fontWeight: FontWeight.bold)),
                    SizedBox(width: 2),
                    Icon(Icons.chevron_right_rounded, color: Color(0xFF8B5CF6), size: 12),
                  ],
                ),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left: QR Code Preview
              Container(
                width: 90,
                height: 90,
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: CustomPaint(
                        painter: DummyQrCodePainter(color: Colors.black),
                      ),
                    ),
                    Center(
                      child: Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: const Center(
                          child: Text(
                            'V',
                            style: TextStyle(
                              color: Color(0xFF8B5CF6),
                              fontWeight: FontWeight.bold,
                              fontSize: 9,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              // Middle: QR details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('QR ID', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Text('VMX-QR-8F29A7', style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () => Get.snackbar('Copied', 'QR ID copied to clipboard'),
                          child: const Icon(Icons.copy_rounded, color: Color(0xFF8B5CF6), size: 10),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text('Destination URL', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'https://www.citymart.com/summer-sale',
                            style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 8.5, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () => Get.snackbar('Copied', 'Destination URL copied to clipboard'),
                          child: const Icon(Icons.copy_rounded, color: Color(0xFF8B5CF6), size: 10),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              // Right: scan details
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Placement', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                  const SizedBox(height: 2),
                  const Text('Rear Screen', style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  const Text('QR Scans', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                  const SizedBox(height: 2),
                  Obx(() => Text('${controller.qrScans.value}', style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold))),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DummyQrCodePainter extends CustomPainter {
  final Color color;
  DummyQrCodePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    double borderSize = size.width / 4;

    void drawFinderPattern(double dx, double dy) {
      canvas.drawRect(Rect.fromLTWH(dx, dy, borderSize, borderSize), paint);
      canvas.drawRect(Rect.fromLTWH(dx + 2, dy + 2, borderSize - 4, borderSize - 4), Paint()..color = Colors.white);
      canvas.drawRect(Rect.fromLTWH(dx + 4, dy + 4, borderSize - 8, borderSize - 8), paint);
    }

    drawFinderPattern(0, 0);
    drawFinderPattern(size.width - borderSize, 0);
    drawFinderPattern(0, size.height - borderSize);

    final randomPixels = [
      Offset(size.width * 0.5, size.height * 0.1),
      Offset(size.width * 0.6, size.height * 0.2),
      Offset(size.width * 0.5, size.height * 0.4),
      Offset(size.width * 0.4, size.height * 0.5),
      Offset(size.width * 0.7, size.height * 0.6),
      Offset(size.width * 0.8, size.height * 0.5),
      Offset(size.width * 0.5, size.height * 0.8),
      Offset(size.width * 0.6, size.height * 0.8),
      Offset(size.width * 0.8, size.height * 0.8),
    ];

    for (var pos in randomPixels) {
      canvas.drawRect(Rect.fromCenter(center: pos, width: 4, height: 4), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

