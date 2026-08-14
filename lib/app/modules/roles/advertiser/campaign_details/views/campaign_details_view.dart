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
                  Text(c.id, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildAlertSubCell('Submitted On', '07 Aug 2026, 09:41 AM'),
              _buildAlertSubCell('Expected Approval', 'Within 24 Hours'),
              _buildAlertSubCell('Submitted By', 'John Doe\njohn@citymart.com'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAlertSubCell(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
          maxLines: 2,
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
              _buildTimelineStep('Submitted', '07 Aug 2026', isChecked: true),
              _buildTimelineDivider(true),
              _buildTimelineStep('Under Review', 'In Progress', isActiveAlert: true),
              _buildTimelineDivider(false),
              _buildTimelineStep('Approved', 'Pending', isPending: true),
              _buildTimelineDivider(false),
              _buildTimelineStep('Live', 'Pending', isPending: true),
              _buildTimelineDivider(false),
              _buildTimelineStep('Completed', 'Pending', isPending: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(String title, String sub, {bool isChecked = false, bool isActiveAlert = false, bool isPending = false}) {
    Color ringColor = Colors.grey;
    Widget centerNode = Container();

    if (isChecked) {
      ringColor = const Color(0xFF10B981);
      centerNode = const Icon(Icons.check, color: Color(0xFF10B981), size: 8);
    } else if (isActiveAlert) {
      ringColor = const Color(0xFFF59E0B);
      centerNode = const Icon(Icons.access_time_filled_rounded, color: Color(0xFFF59E0B), size: 8);
    } else if (isPending) {
      ringColor = AppColors.cardBorder;
      centerNode = Container();
    }

    return Expanded(
      child: Column(
        children: [
          Container(
            width: 18,
            height: 18,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: ringColor, width: 1.5),
            ),
            child: Center(child: centerNode),
          ),
          const SizedBox(height: 6),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
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
}
