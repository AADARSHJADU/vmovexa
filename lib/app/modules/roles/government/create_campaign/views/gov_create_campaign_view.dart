import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/gov_create_campaign_controller.dart';
import '../../dashboard/controllers/government_dashboard_controller.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../routes/app_routes.dart';
import '../../../advertiser/create_campaign/views/create_campaign_view.dart'; // To reuse DummyQrCodePainter

class GovCreateCampaignView extends GetView<GovCreateCampaignController> {
  const GovCreateCampaignView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isSubmitted.value) {
        return _buildSuccessScreen();
      }

      final step = controller.currentStep.value;

      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Column(
            children: [
              // Top Action Header
              _buildTopHeader(step),

              // Stepper indicator
              _buildStepperProgress(step),

              // Step content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (step == 1) _buildStep1Info(),
                      if (step == 2) _buildStep2ContentSettings(),
                      if (step == 3) _buildStep3Targeting(),
                      if (step == 4) _buildStep4Schedule(),
                      if (step == 5) _buildStep5Preview(),
                    ],
                  ),
                ),
              ),

              // Navigation action bar
              _buildBottomActionsRow(step),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildTopHeader(int step) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
            onPressed: controller.previousStep,
          ),
          Column(
            children: [
              const Text(
                'Create Campaign',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                'Create a new government campaign',
                style: TextStyle(color: AppColors.textMuted, fontSize: 9),
              ),
            ],
          ),
          TextButton.icon(
            onPressed: () {
              Get.snackbar(
                'Draft Saved',
                'Your government campaign draft has been saved successfully.',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: const Color(0xFF3B82F6),
                colorText: Colors.white,
              );
            },
            icon: const Icon(Icons.save_outlined, color: Color(0xFF8B5CF6), size: 16),
            label: const Text('Save Draft', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildStepperProgress(int step) {
    final List<String> stepsText = ['Information', 'Content', 'Targeting', 'Schedule', 'Preview'];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        children: [
          Row(
            children: List.generate(9, (index) {
              if (index % 2 == 1) {
                // Divider line between circles
                final double targetStep = (index / 2) + 1.5;
                final bool isCompleted = step >= targetStep;
                return Expanded(
                  child: Container(
                    height: 2,
                    color: isCompleted ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                  ),
                );
              } else {
                // Stepper circles
                final int stepNumber = (index ~/ 2) + 1;
                final bool isSelected = step == stepNumber;
                final bool isCompleted = step > stepNumber;
                return Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelected
                        ? const Color(0xFF3B82F6).withOpacity(0.12)
                        : (isCompleted ? const Color(0xFF3B82F6) : Colors.transparent),
                    border: Border.all(
                      color: isSelected || isCompleted ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white, size: 10)
                        : Text(
                            '$stepNumber',
                            style: TextStyle(
                              color: isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                );
              }
            }),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(5, (idx) {
              final isSelected = step == (idx + 1);
              return Text(
                stepsText[idx],
                style: TextStyle(
                  color: isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted,
                  fontSize: 7.5,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 1: CAMPAIGN INFO
  // ==========================================
  Widget _buildStep1Info() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/info.svg','Campaign Information', 'Enter basic campaign details'),
        const SizedBox(height: 12),
        const Text('Campaign Name *', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        CustomTextField(
          hintText: 'Enter campaign name',
          controller: controller.campaignNameController,
          height: 44,
        ),
        const SizedBox(height: 14),

        const Text('Campaign Type *', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final isEmergency = controller.selectedCampaignType.value == 'Emergency Announcement';
          return Row(
            children: [
              Expanded(
                child: _buildTypeCard(
                  'Public\nInformation',
                  'General public information and awareness',
                "assets/icons/active-campain.svg",
                  !isEmergency,
                  const Color(0xFF3B82F6),
                  () => controller.setCampaignType('Public Information'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildTypeCard(
                  'Emergency Announcement',
                  'Urgent alerts and emergency notifications',
                  "assets/icons/active-alert.svg",
                  isEmergency,
                  const Color(0xFFEF4444),
                  () => controller.setCampaignType('Emergency Announcement'),
                ),
              ),
            ],
          );
        }),
        const SizedBox(height: 14),

        const Text('Description *', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        CustomTextField(
          hintText: 'Enter campaign description...',
          controller: controller.descriptionController,
          maxLines: 3,
        ),
        const SizedBox(height: 20),

        _buildSectionHeader('assets/icons/campainContent.svg','Campaign Content', 'Upload or select campaign content'),
        const SizedBox(height: 12),
        const Text('Select Content Type', style: TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        _buildContentTypeGrid(),
        const SizedBox(height: 16),

        _buildUploadDashedContainer(),
      ],
    );
  }

  Widget _buildSectionHeader(String icon,String title, String subtitle) {
    return Row(
      children: [
        SvgPicture.asset(icon,width: 22,height: 22,),
        // SvgPicture.asset('assets/icons/info.svg'),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(color:Colors.white, fontSize: 9)),
          ],
        ),
      ],
    );
  }

  Widget _buildTypeCard(String title, String desc, String icon, bool isSelected, Color activeColor, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? activeColor : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SvgPicture.asset(icon),
                // Icon(icon, color: isSelected ? activeColor : AppColors.textMuted, size: 20),
                if (isSelected)
                  Icon(Icons.check_circle_rounded, color: activeColor, size: 14)
                else
                  Icon(Icons.radio_button_off_rounded, color: AppColors.textMuted, size: 14),
              ],
            ),
            const SizedBox(height: 10),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(desc, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5), maxLines: 2, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildContentTypeGrid() {
    final List<Map<String, dynamic>> items = [
      {'label': 'Image', 'icon': "assets/icons/advertiser_ic/gallary.svg"},
      {'label': 'Video', 'icon': "assets/icons/video.svg"},
      {'label': 'PDF', 'icon': "assets/icons/advertiser_ic/pdf.svg"},
      {'label': 'HTML5', 'icon': "assets/icons/html.svg"},
      {'label': 'Live URL', 'icon': "assets/icons/liveUrl.svg"},
      {'label': 'RSS Feed', 'icon':"assets/icons/rssFeed.svg"},
      {'label': 'JSON', 'icon': "assets/icons/json.svg"},
      {'label': 'Interactive', 'icon': "assets/icons/interactiveHand.svg"},
    ];

    return Obx(() {
      final selected = controller.selectedContentType.value;
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.2,
        ),
        itemCount: items.length,
        itemBuilder: (context, idx) {
          final i = items[idx];
          final isSelected = selected == i['label'];
          return GestureDetector(
            onTap: () => controller.setContentType(i['label'] as String),
            child: Container(
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF3B82F6).withOpacity(0.08) : AppColors.cardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                  width: 1.2,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SvgPicture.asset(i['icon'],width: 18,height: 15,),
                  // Icon(i['icon'] as IconData, color: isSelected ? const Color(0xFF3B82F6) : Colors.white, size: 18),
                  const SizedBox(height: 4),
                  Text(i['label'] as String, style: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary, fontSize: 8, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  Widget _buildUploadDashedContainer() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2, style: BorderStyle.solid), // In true device dashed, we fallback to solid border
      ),
      child: Column(
        children: [
        SvgPicture.asset('assets/icons/advertiser_ic/download.svg',),
          const SizedBox(height: 10),
          const Text('Upload Content', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Text('Drag and drop your file here, or tap to ', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
              Text('browse', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 9, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
            ],
          ),
          const SizedBox(height: 8),
          const Text('Max file size: 100MB', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 2: CONTENT & SETTINGS
  // ==========================================
  Widget _buildStep2ContentSettings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/campainContent.svg','Campaign Content', 'Upload or select the content you want to publish'),
        const SizedBox(height: 12),

        // Thumbnail specifications card
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 140,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  image: const DecorationImage(
                    image: NetworkImage('https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Selected Content', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        Row(
                          children: [
                            Container(
                              width: 5,
                              height: 5,
                              decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 4),
                            Obx(() => Text(controller.selectedContentType.value, style: const TextStyle(color: Color(0xFF10B981), fontSize: 8, fontWeight: FontWeight.bold))),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Obx(() => Text(controller.uploadedFileName.value, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold))),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Text('File Size : ', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                        Obx(() => Text(controller.uploadedFileSize.value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 8, fontWeight: FontWeight.bold))),
                      ],
                    ),
                    Row(
                      children: [
                        const Text('Resolution : ', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                        Obx(() => Text(controller.uploadedFileResolution.value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 8, fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black38,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.cardBorder, width: 1),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.refresh, color: Color(0xFF3B82F6), size: 10),
                          SizedBox(width: 4),
                          Text('Replace Content', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 8.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Select Content Type', style: TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        _buildContentTypeGrid(),
        const SizedBox(height: 20),

        _buildSectionHeader('assets/icons/campainContent.svg','Content Settings', 'Select display targets and scheduling constraints'),
        const SizedBox(height: 12),

        const Text('Display Type', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Select where this content will be displayed', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
        const SizedBox(height: 8),
        _buildDisplayTypeCardsRow(),
        const SizedBox(height: 16),

        const Text('Content Duration', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Set how long this content will play in a loop', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
        const SizedBox(height: 8),
        _buildDurationAdjuster(),
      ],
    );
  }

  Widget _buildDisplayTypeCardsRow() {
    return Obx(() {
      final allSelected = controller.selectAllDisplays.value;
      final passengerSelected = controller.selectPassengerDisplays.value;
      final internalSelected = controller.selectInternalDisplays.value;

      return Row(
        children: [
          Expanded(
            child: _buildDisplayCell(
              'All Displays',
              'Show on all digital displays',
             "assets/icons/allDisplay.svg",
              allSelected,
              () => controller.selectDisplayType('All'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildDisplayCell(
              'Passenger Displays',
              'Show on passenger facing displays',
              "assets/icons/advertiser_ic/tv.svg",
              passengerSelected,
              () => controller.selectDisplayType('Passenger'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildDisplayCell(
              'Vehicle Internal',
              'Show on internal vehicle screens',
              "assets/icons/advertiser_ic/tv.svg",
              internalSelected,
              () => controller.selectDisplayType('Internal'),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildDisplayCell(String title, String desc, String icon, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 110,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                title=='All Displays'?
                SvgPicture.asset(icon,width: 22,height: 22,):
                SvgPicture.asset(icon,width: 18,height: 18,),
                // Icon(icon, color: isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted, size: 18),
                Icon(isSelected ? Icons.check_box : Icons.check_box_outline_blank, color: isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted, size: 14),
              ],
            ),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(desc, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5), maxLines: 2, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildDurationAdjuster() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.timer_outlined, color: Color(0xFF3B82F6), size: 16),
              const SizedBox(width: 8),
              Obx(() => Text('${controller.contentDuration.value} Seconds', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold))),
            ],
          ),
          Row(
            children: [
              IconButton(
                onPressed: controller.decrementDuration,
                icon: const Icon(Icons.remove_circle_outline, color: Colors.white, size: 18),
              ),
              IconButton(
                onPressed: controller.incrementDuration,
                icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 18),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 3: TARGETING / FLEET & SCREENS
  // ==========================================
  Widget _buildStep3Targeting() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/lsicon_map.svg','Targeting', 'Choose where and how your campaign will be displayed'),
        const SizedBox(height: 14),

        // Target Area with Custom Map Polygon selection
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text('Target Area', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            Text('Clear Selection ⟳', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 9.5, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          height: 220,
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Stack(
            children: [
              // Custom Paint Bhopal Map Polygon
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: CustomPaint(
                    painter: BhopalPolygonMapPainter(),
                  ),
                ),
              ),
              // Left map utility overlay
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Column(
                    children: [
                      _buildMapToolIcon(Icons.near_me_outlined, 'Select', true),
                      const SizedBox(height: 8),
                      _buildMapToolIcon(Icons.hexagon_outlined, 'Polygon', false),
                      const SizedBox(height: 8),
                      _buildMapToolIcon(Icons.adjust_outlined, 'Radius', false),
                      const SizedBox(height: 8),
                      _buildMapToolIcon(Icons.delete_outline_rounded, 'Clear', false),
                    ],
                  ),
                ),
              ),
              // City label
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF3B82F6), width: 1),
                  ),
                  child: const Text('Bhopal', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
              // Zoom keys
              Positioned(
                bottom: 12,
                right: 12,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Column(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.add, color: Colors.white, size: 14),
                        onPressed: () {},
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        padding: EdgeInsets.zero,
                      ),
                      Container(width: 20, height: 1, color: AppColors.cardBorder),
                      IconButton(
                        icon: const Icon(Icons.remove, color: Colors.white, size: 14),
                        onPressed: () {},
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        padding: EdgeInsets.zero,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Target Audience
        const Text('Target Audience', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _buildSelectorTile('All Vehicles', '248 Vehicles','assets/icons/fleet_operator_icons/fleetsManagedA2.svg', true)),
            const SizedBox(width: 8),
            Expanded(child: _buildSelectorTile('Selected Vehicles', 'Choose specific', 'assets/icons/fleet_operator_icons/truck.svg', false)),
            const SizedBox(width: 8),
            Expanded(child: _buildSelectorTile('Display Groups', 'Choose groups', 'assets/icons/advertiser_ic/userTwo.svg', false)),
          ],
        ),
        const SizedBox(height: 18),

        // Display Type
        const Text('Display Type', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _buildSelectorTile('All Displays', '721 Displays', 'assets/icons/advertiser_ic/tv.svg',true)),
            const SizedBox(width: 8),
            Expanded(child: _buildSelectorTile('Passenger Displays', 'Inside passenger', 'assets/icons/solar_cpu.svg', false)),
            const SizedBox(width: 8),
            Expanded(child: _buildSelectorTile('External Displays', 'External LED screens','assets/icons/advertiser_ic/tv.svg', false)),
          ],
        ),
        const SizedBox(height: 18),

        // Additional filters dropdown inputs
        const Text('Additional Filters', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildDropdownFilter('Vehicle Type', 'All Types'),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildDropdownFilter('Time Zone', 'IST (UTC+05:30)'),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Estimated Reach green banner
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withOpacity(0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2), width: 1.2),
          ),
          child: Row(
            children: [
              // Container(
              //   padding: const EdgeInsets.all(8),
              //   decoration: BoxDecoration(
              //     color: const Color(0xFF10B981).withOpacity(0.12),
              //     shape: BoxShape.circle,
              //   ),
              //   child: const Icon(Icons.track_changes_rounded, color: Color(0xFF10B981), size: 16),
              // ),
              SvgPicture.asset('assets/icons/live_map.svg',color: Color(0xff2dc861),),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Estimated Reach', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                    SizedBox(height: 2),
                    Text('248 Vehicles  •  721 Displays', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: const [
                  Text('84%', style: TextStyle(color: Color(0xFF10B981), fontSize: 16, fontWeight: FontWeight.bold)),
                  Text('Coverage', style: TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMapToolIcon(IconData icon, String text, bool isSelected) {
    final color = isSelected ? const Color(0xFF3B82F6) : Colors.white;
    return Column(
      children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(height: 2),
        Text(text, style: TextStyle(color: color, fontSize: 6.5, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      ],
    );
  }

  Widget _buildSelectorTile(String title, String sub, String icon, bool isSelected) {
    return Container(
      height: 76,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
          width: isSelected ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SvgPicture.asset(icon),
              // Icon(icon, color: isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted, size: 14),
              if (isSelected) const Icon(Icons.check_circle_rounded, color: Color(0xFF3B82F6), size: 11),
            ],
          ),
          const SizedBox(height: 6),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(color: AppColors.textMuted, fontSize: 7), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _buildDropdownFilter(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
        const SizedBox(height: 6),
        Container(
          height: 38,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.cardBorder, width: 1),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 14),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // STEP 4: SCHEDULE
  // ==========================================
  Widget _buildStep4Schedule() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/schedule-campain.svg','Schedule Campaign', 'Set the time and duration for your campaign'),
        const SizedBox(height: 16),

        // Date Range Inputs
        const Text('Date Range', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _buildDateInputBox('Start Date', '12 May 2025')),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward_rounded, color: AppColors.textMuted, size: 14),
            const SizedBox(width: 8),
            Expanded(child: _buildDateInputBox('End Date', '20 May 2025')),
          ],
        ),
        const SizedBox(height: 18),

        // Time Schedule Inputs
        const Text('Time Schedule', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _buildTimeInputBox('Start Time', '09:00 AM')),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward_rounded, color: AppColors.textMuted, size: 14),
            const SizedBox(width: 8),
            Expanded(child: _buildTimeInputBox('End Time', '06:00 PM')),
          ],
        ),
        const SizedBox(height: 18),

        // Days of the Week Gradients
        const Text('Days of the Week', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDayOfWeekItem('Mon', true),
            _buildDayOfWeekItem('Tue', true),
            _buildDayOfWeekItem('Wed', true),
            _buildDayOfWeekItem('Thu', true),
            _buildDayOfWeekItem('Fri', true),
            _buildDayOfWeekItem('Sat', false),
            _buildDayOfWeekItem('Sun', false),
          ],
        ),
        const SizedBox(height: 18),

        // Campaign Priority Cards
        const Text('Campaign Priority', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _buildPriorityItem('Low', 'Normal priority', Icons.flag_rounded, const Color(0xFF0390f9), false)),
            const SizedBox(width: 8),
            Expanded(child: _buildPriorityItem('Normal', 'Standard priority', Icons.flag_rounded, const Color(0xFF7437f8), true)),
            const SizedBox(width: 8),
            Expanded(child: _buildPriorityItem('High', 'High priority', Icons.flag_rounded, const Color(0xFFff741e), false)),
          ],
        ),
        const SizedBox(height: 18),

        // Repeat Campaign Toggle
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.repeat_rounded, color: Color(0xFF8B5CF6), size: 22),
                      SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Repeat Campaign', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          SizedBox(height: 2),
                          Text('Do you want to repeat this campaign?', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        ],
                      ),
                    ],
                  ),
                  Switch(
                    value: true,
                    onChanged: (val) {},
                    activeColor: Colors.blue,
                  ),
                ],
              ),
              const Divider(color: AppColors.cardBorder, height: 20),

              // Frequency & ends
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Repeat Every', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        const SizedBox(height: 6),
                        Container(
                          height: 38,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.black26,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.cardBorder, width: 1),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Text('Daily', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                              Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 14),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Ends', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.radio_button_checked_rounded, color: Color(0xFF8B5CF6), size: 14),
                            const SizedBox(width: 6),
                            const Text('On End Date', style: TextStyle(color: Colors.white, fontSize: 9.5)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.radio_button_off_rounded, color: AppColors.textMuted, size: 14),
                            const SizedBox(width: 6),
                            const Text('After ', style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                            Container(
                              width: 32,
                              height: 20,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: Colors.black26,
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: AppColors.cardBorder, width: 1),
                              ),
                              child: const Text('10', style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                            ),
                            const Text(' times', style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Time zone
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Row(
                      children: [
                        Icon(Icons.public_rounded, color: AppColors.primaryButtonBlue, size: 18),
                        SizedBox(width: 6),
                        Text('Time Zone', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                      ],
                    ),
                    Row(
                      children: [
                        Text('IST (UTC +05:30)', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        SizedBox(width: 4),
                        Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 12),
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

  Widget _buildDateInputBox(String label, String date) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(date, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              const Icon(Icons.calendar_month_outlined, color: Colors.white, size: 12),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeInputBox(String label, String time) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(time, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              const Icon(Icons.access_time_rounded, color: Colors.white, size: 12),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDayOfWeekItem(String day, bool isSelected) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        gradient: isSelected ?
        const LinearGradient(
            colors: [Color(0xFF0388FE), Color(0xFF6B1FE6)]) : null,
        color: isSelected ? null : AppColors.cardBg,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isSelected ? Colors.transparent : AppColors.cardBorder, width: 1.2),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isSelected) const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 9),
            if (isSelected) const SizedBox(height: 2),
            Text(
              day,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textMuted,
                fontSize: 8.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityItem(String title, String desc, IconData icon, Color color, bool isSelected) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isSelected ? color : AppColors.cardBorder,
          width: isSelected ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color:  color , size: 25),
              if (isSelected) Icon(Icons.check_circle_rounded, color: color, size: 11),
            ],
          ),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(desc, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 5: PREVIEW & PUBLISH
  // ==========================================
  Widget _buildStep5Preview() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/advertiser_ic/eye.svg','Campaign Preview', 'Review all details before publishing'),
        const SizedBox(height: 14),

        // Beautiful cityscape image creative card
        Container(
          width: double.infinity,
          height: 160,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
            image: const DecorationImage(
              image: NetworkImage('https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600'),
              fit: BoxFit.cover,
            ),
          ),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.black.withOpacity(0.1), Colors.black.withOpacity(0.8)],
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'SAFE ROADS SAVE LIVES',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(4)),
                      child: const Text('Ready to Publish', style: TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text('Follow Rules. Reach Home Safely.', style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    _buildPreviewSettingDot(Icons.airline_seat_recline_normal_rounded),
                    const SizedBox(width: 6),
                    _buildPreviewSettingDot(Icons.speed),
                    const SizedBox(width: 6),
                    _buildPreviewSettingDot(Icons.phonelink_ring_rounded),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 18),

        // QR Code overlay parameters card
        Container(
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      SvgPicture.asset('assets/icons/fleet_operator_icons/qr-code-scan.svg'),
                      SizedBox(width: 8,),
                      const Text('QR Code for this Campaign', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.08), borderRadius: BorderRadius.circular(4)),
                    child: const Text('QR Generated', style: TextStyle(color: Color(0xFF10B981), fontSize: 7, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    width: 76,
                    height: 76,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                    child: CustomPaint(painter: DummyQrCodePainter()),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Scan to view campaign', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        const SizedBox(height: 6),
                        Container(
                          height: 32,
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            color: Colors.black26,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.cardBorder, width: 1),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Expanded(
                                child: Text(
                                  'https://vmovexa.com/c/safe-roads-save-lives',
                                  style: TextStyle(color: Color(0xFF3B82F6), fontSize: 8.5, fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Icon(Icons.copy_rounded, color: Color(0xff5956ff), size: 13),
                            ],
                          ),
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
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color:Color(0xff5956ff)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.download_rounded, color: Color(0xff5956ff), size: 13),
                      label: const Text('Download QR', style: TextStyle(color:Color(0xff5956ff), fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xff7e51dd)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.share_rounded, color: Color(0xff7e51dd), size: 13),
                      label: const Text('Share QR', style: TextStyle(color: Color(0xff5956ff), fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        _buildStep5ReviewInfoList(),
        const SizedBox(height: 18),

        Row(
          children: [
            SvgPicture.asset('assets/icons/campainSummary.svg',width: 21,height: 21,),
            SizedBox(width: 5,),
            const Text('Campaign Summary', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _buildSummaryMetricBadge('248', 'Vehicles', 'assets/icons/advertiser_ic/userTwo.svg', const Color(0xFF10B981))),
            const SizedBox(width: 6),
            Expanded(child: _buildSummaryMetricBadge('721', 'Displays','assets/icons/advertiser_ic/tv.svg', const Color(0xFF3B82F6))),
            const SizedBox(width: 6),
            Expanded(child: _buildSummaryMetricBadge('84%', 'Coverage','assets/icons/advertiser_ic/eye.svg',const Color(0xFF8B5CF6))),
            const SizedBox(width: 6),
          ],
        ),
      ],
    );
  }

  Widget _buildPreviewSettingDot(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.12), shape: BoxShape.circle),
      child: Icon(icon, color: Colors.white, size: 10),
    );
  }

  Widget _buildStep5ReviewInfoList() {
    return Column(
      children: [
        _buildReviewRowItem('Campaign Information', 'Road Safety Awareness\nPublic Information',
            "assets/icons/fleet_operator_icons/privacyPolicyA.svg"),
        _buildReviewRowItem('Content', 'Image (road_safety_awareness.jpg)\n2.4 MB  •  1920 x 1080',
            "assets/icons/video.svg"),
        _buildReviewRowItem('Targeting', 'Bhopal Region, All Vehicles, '
            'All Displays\nEstimated Reach: 248 Vehicles • 721 Displays',  "assets/icons/lsicon_map.svg"),
        _buildReviewRowItem('Schedule', '12 May 2025 - 20 May 2025\n09:00 AM - 06:00 PM  •  Mon - Fri',
            "assets/icons/calendar.svg"),
        _buildReviewRowItem('Priority', 'Normal Priority',
            "assets/icons/priority.svg"),
      ],
    );
  }

  Widget _buildReviewRowItem(String label, String detail, String icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
         SvgPicture.asset(icon,width: 18,height: 18,),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                const SizedBox(height: 3),
                Text(detail, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, height: 1.3)),
              ],
            ),
          ),
          const Icon(Icons.edit_outlined, color: Color(0xFF8B5CF6), size: 12),
        ],
      ),
    );
  }

  Widget _buildSummaryMetricBadge(String val, String label, String icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        children: [
          SvgPicture.asset(icon,width: 18,height: 18,),
          const SizedBox(height: 6),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
        ],
      ),
    );
  }

  Widget _buildReviewHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildReviewRow(String label, String val) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildBottomActionsRow(int step) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 15,vertical: 15),
      // padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4), width: 1.2),
              ),
              child: TextButton(
                onPressed: controller.previousStep,
                style: TextButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.arrow_back_rounded, color: Colors.white, size: 14),
                    SizedBox(width: 6),
                    Text('Back', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                // gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)]),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ElevatedButton(
                onPressed: controller.nextStep,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(step == 5 ? 'Publish Campaign' : 'Continue', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    // const SizedBox(width: 6),
                    // Icon(step == 5 ? Icons.send_rounded : Icons.arrow_forward_rounded, color: Colors.white, size: 14),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessScreen() {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 22),
                    onPressed: controller.closeWizard,
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    // Confetti stack
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3), width: 2),
                          ),
                        ),
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF10B981).withOpacity(0.12),
                            border: Border.all(color: const Color(0xFF10B981), width: 2),
                          ),
                          child: const Icon(Icons.check, color: Color(0xFF10B981), size: 40),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    const Text('Campaign Published Successfully!', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    const Text('Your government campaign is now active across targeted screens.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11), textAlign: TextAlign.center),
                    const SizedBox(height: 24),

                    // Submission overview details
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Text('Campaign ID', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                              Text('GOV-CMP-2025-0012', style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const Divider(color: AppColors.cardBorder, height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Text('Status', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                              Text('ACTIVE', style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 36),

                    // Redirect view campaigns button
                    Container(
                      width: double.infinity,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          // Route back to dashboard and switch to Campaigns list index 1
                          final GovernmentDashboardController dashboardController = Get.find<GovernmentDashboardController>();
                          dashboardController.selectedNavIndex.value = 1;
                          Get.back();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('View Campaigns', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 16),

                    TextButton(
                      onPressed: controller.createAnother,
                      child: const Text(
                        'Create Another Campaign',
                        style: TextStyle(color: Color(0xFF3B82F6),
                            fontSize: 11.5, fontWeight: FontWeight.bold,),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BhopalPolygonMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Custom painted stylized dark grid mapping representing a targeting map
    final paint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.fill;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);

    // Map street grids lines representing street paths
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.03)
      ..strokeWidth = 1.0;

    for (double i = 0; i < size.width; i += 20) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double j = 0; j < size.height; j += 20) {
      canvas.drawLine(Offset(0, j), Offset(size.width, j), gridPaint);
    }

    // Draw active target polygon (blue area representing target region)
    final polyPaint = Paint()
      ..color = const Color(0xFF3B82F6).withOpacity(0.08)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final dotPaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.fill;

    final List<Offset> points = [
      Offset(size.width * 0.35, size.height * 0.25),
      Offset(size.width * 0.5, size.height * 0.28),
      Offset(size.width * 0.65, size.height * 0.35),
      Offset(size.width * 0.8, size.height * 0.55),
      Offset(size.width * 0.7, size.height * 0.72),
      Offset(size.width * 0.5, size.height * 0.8),
      Offset(size.width * 0.3, size.height * 0.65),
      Offset(size.width * 0.28, size.height * 0.45),
    ];

    final path = Path()..addPolygon(points, true);
    canvas.drawPath(path, polyPaint);
    canvas.drawPath(path, borderPaint);

    // Draw coordinate dots at each polygon point
    for (final p in points) {
      canvas.drawCircle(p, 4, Paint()..color = const Color(0xFF3B82F6).withOpacity(0.3));
      canvas.drawCircle(p, 2.5, dotPaint);
    }

    // Center Bhopal indicator pin
    final centerOffset = Offset(size.width * 0.52, size.height * 0.5);
    canvas.drawCircle(centerOffset, 8, Paint()..color = const Color(0xFF3B82F6).withOpacity(0.2));
    canvas.drawCircle(centerOffset, 4, Paint()..color = const Color(0xFF3B82F6));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class DummyQrCodePainter extends CustomPainter {
  final Color color;
  DummyQrCodePainter({this.color = const Color(0xFF1E293B)});

  @override
  void paint(Canvas canvas, Size size) {
    // Draw white background
    final bgPaint = Paint()..color = Colors.white;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Draw QR code finders (outer squares + inner square)
    final finderPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Top-Left Finder
    _drawFinderPattern(canvas, 2, 2, finderPaint);
    // Top-Right Finder
    _drawFinderPattern(canvas, size.width - 22, 2, finderPaint);
    // Bottom-Left Finder
    _drawFinderPattern(canvas, 2, size.height - 22, finderPaint);

    // Draw random tiny pixels to look like a real QR code
    final pixelPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    for (double i = 4; i < size.width - 4; i += 6) {
      for (double j = 4; j < size.height - 4; j += 6) {
        // Skip finder areas
        if ((i < 24 && j < 24) || (i > size.width - 24 && j < 24) || (i < 24 && j > size.height - 24)) {
          continue;
        }
        if ((i + j).toInt() % 4 == 0 || (i * j).toInt() % 5 == 2) {
          canvas.drawRect(Rect.fromLTWH(i, j, 4, 4), pixelPaint);
        }
      }
    }
  }

  void _drawFinderPattern(Canvas canvas, double x, double y, Paint paint) {
    // Outer 18x18 square
    canvas.drawRect(Rect.fromLTWH(x, y, 18, 18), paint);
    // White space inside finder
    canvas.drawRect(Rect.fromLTWH(x + 3, y + 3, 12, 12), Paint()..color = Colors.white);
    // Center solid 6x6 square
    canvas.drawRect(Rect.fromLTWH(x + 6, y + 6, 6, 6), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

