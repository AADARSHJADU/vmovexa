import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/create_campaign_controller.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class CreateCampaignView extends GetView<CreateCampaignController> {
  const CreateCampaignView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isSubmitted.value) {
        return _buildSuccessScreen();
      }

      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Column(
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
                      onPressed: controller.previousStep,
                    ),
                    const Text(
                      'Create Campaign',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white, size: 22),
                      onPressed: controller.closeWizard,
                    ),
                  ],
                ),
              ),

              // Stepper progress indicator
              _buildStepperProgress(),
              const SizedBox(height: 12),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildCurrentStepBody(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),

              // Bottom Actions
              _buildBottomActionBar(),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildStepperProgress() {
    int active = controller.currentStep.value;
    final List<String> stepLabels = [
      'Goal',
      'Campaign Details',
      'Ad Details',
      'Audience',
      'Schedule',
      controller.isOnReviewPage.value ? 'Review & Submit' : 'QR Identity'
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          Row(
            children: List.generate(11, (index) {
              if (index % 2 == 1) {
                int stepNum = (index ~/ 2) + 1;
                bool isCompleted = stepNum < active || (stepNum == 6 && controller.isOnReviewPage.value);
                return Expanded(
                  child: Container(
                    height: 2,
                    color: isCompleted ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
                  ),
                );
              } else {
                int stepNum = (index ~/ 2) + 1;
                bool isActive = stepNum == active;
                bool isCompleted = stepNum < active || (stepNum == 6 && controller.isOnReviewPage.value);

                return Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isCompleted
                        ? const Color(0xFF6366F1)
                        : (isActive ? const Color(0xFF6366F1).withOpacity(0.12) : const Color(0xFF0F172A)),
                    border: Border.all(
                      color: isCompleted || isActive ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white, size: 12)
                        : Text(
                            '$stepNum',
                            style: TextStyle(
                              color: isActive || isCompleted ? Colors.white : AppColors.textMuted,
                              fontSize: 10,
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
            children: List.generate(6, (index) {
              bool isCurrent = index + 1 == active;
              return Text(
                stepLabels[index],
                style: TextStyle(
                  color: isCurrent ? const Color(0xFF8B5CF6) : AppColors.textMuted,
                  fontSize: 7.5,
                  fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentStepBody() {
    if (controller.isOnReviewPage.value) {
      return _buildStep6ReviewSubmit();
    }

    switch (controller.currentStep.value) {
      case 2:
        return _buildStep2UploadCreative();
      case 3:
        return _buildStep3SelectFleet();
      case 4:
        return _buildStep4ScheduleCampaign();
      case 5:
        return _buildStep5BudgetSummary();
      case 6:
        return _buildStep6QrIdentity();
      default:
        return _buildStep1CampaignInfo();
    }
  }

  // ==========================================
  // STEP 1: CAMPAIGN INFO
  // ==========================================
  Widget _buildStep1CampaignInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 1 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Campaign Information', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Provide basic details about your campaign.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        _buildLabel('Campaign Name *'),
        CustomTextField(hintText: 'Enter campaign name', controller: controller.campaignNameController),
        const SizedBox(height: 16),

        _buildLabel('Brand Name'),
        CustomTextField(hintText: 'Enter brand name (optional)', controller: controller.brandNameController),
        const SizedBox(height: 16),

        _buildLabel('Campaign Type *'),
        _buildCampaignTypeSelector(),
        const SizedBox(height: 16),

        _buildLabel('Campaign Description *'),
        CustomTextField(
          hintText: 'Write a brief description about your campaign',
          controller: controller.campaignDescriptionController,
          maxLines: 3,
        ),
        const SizedBox(height: 16),

        _buildLabel('Objective *'),
        CustomTextField(
          hintText: 'Select objective',
          isDropdown: true,
          dropdownValue: controller.selectedObjective.value,
          dropdownItems: controller.objectives,
          onDropdownChanged: (val) => controller.selectedObjective.value = val!,
        ),
        const SizedBox(height: 16),

        _buildLabel('Category *'),
        CustomTextField(
          hintText: 'Select category',
          isDropdown: true,
          dropdownValue: controller.selectedCategory.value,
          dropdownItems: controller.categories,
          onDropdownChanged: (val) => controller.selectedCategory.value = val!,
        ),
      ],
    );
  }

  Widget _buildCampaignTypeSelector() {
    final List<Map<String, dynamic>> options = [
      {'title': 'Brand Awareness', 'icon': Icons.campaign_rounded},
      {'title': 'Product Promotion', 'icon': Icons.shopping_bag_outlined},
      {'title': 'Event', 'icon': Icons.event_available_outlined},
      {'title': 'Offer / Promotion', 'icon': Icons.local_offer_outlined},
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.7,
      children: options.map((opt) {
        bool isSelected = controller.selectedCampaignType.value == opt['title'];
        return GestureDetector(
          onTap: () => controller.selectCampaignType(opt['title']),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                width: 1.5,
              ),
            ),
            child: Stack(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(opt['icon'], color: const Color(0xFF8B5CF6), size: 20),
                    Text(
                      opt['title'],
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                if (isSelected)
                  const Positioned(
                    top: 0,
                    right: 0,
                    child: Icon(Icons.check_circle, color: Color(0xFF6366F1), size: 14),
                  ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ==========================================
  // STEP 2: UPLOAD CREATIVE
  // ==========================================
  Widget _buildStep2UploadCreative() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 2 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Upload Creative', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Upload the media that will be displayed in your campaign.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        GestureDetector(
          onTap: controller.simulateUpload,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 36),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: const Color(0xFF8B5CF6).withOpacity(0.4),
                width: 1.5,
              ),
            ),
            child: Column(
              children: [
                const Icon(Icons.cloud_upload_outlined, color: Color(0xFF8B5CF6), size: 36),
                const SizedBox(height: 12),
                const Text('Upload Creative', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('Drag & drop your file here or', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(color: const Color(0xFF6366F1), borderRadius: BorderRadius.circular(8)),
                  child: const Text('Tap to Upload', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 12),
                const Text('Supported Formats: JPG, PNG, MP4, HTML5\nMaximum File Size: 50 MB', style: TextStyle(color: AppColors.textMuted, fontSize: 8), textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
        const SizedBox(height: 18),

        if (controller.hasUploadedFile.value) ...[
          const Text('Uploaded File', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder, width: 1),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  color: const Color(0xFF1E293B),
                  child: const Center(child: Icon(Icons.movie_filter_outlined, color: Color(0xFF8B5CF6), size: 20)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(controller.uploadedFileName.value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(controller.uploadedFileSize.value, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                      const SizedBox(height: 4),
                      Row(
                        children: const [
                          Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 10),
                          SizedBox(width: 4),
                          Text('Uploaded Successfully', style: TextStyle(color: Color(0xFF10B981), fontSize: 9)),
                        ],
                      ),
                    ],
                  ),
                ),
                TextButton(onPressed: () {}, child: const Text('Preview', style: TextStyle(color: Color(0xFF6366F1), fontSize: 10))),
                IconButton(icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18), onPressed: controller.removeUploaded),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        _buildLabel('Creative Type'),
        _buildCreativeTypeGrid(),
        const SizedBox(height: 20),

        _buildQrIdentityOptionCard(),
        const SizedBox(height: 20),

        _buildAdPreviewSection(),
      ],
    );
  }

  Widget _buildCreativeTypeGrid() {
    final types = ['Image', 'Video', 'HTML5', 'PDF'];
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      childAspectRatio: 1.1,
      children: types.map((type) {
        bool isSelected = controller.selectedCreativeType.value == type;
        return GestureDetector(
          onTap: () => controller.selectCreativeType(type),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder, width: 1.5),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  type == 'Image'
                      ? Icons.photo_outlined
                      : (type == 'Video' ? Icons.video_file_outlined : (type == 'HTML5' ? Icons.html_outlined : Icons.picture_as_pdf_outlined)),
                  color: const Color(0xFF8B5CF6),
                  size: 18,
                ),
                const SizedBox(height: 6),
                Text(type, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQrIdentityOptionCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.qr_code_scanner_rounded, color: Color(0xFF8B5CF6), size: 18),
                  SizedBox(width: 8),
                  Text('VMOVEXA Trackable QR Overlay', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              Switch(
                value: controller.enableQrOverlay.value,
                onChanged: (val) => controller.enableQrOverlay.value = val,
                activeColor: const Color(0xFF6366F1),
                activeTrackColor: const Color(0xFF6366F1).withOpacity(0.3),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Automatically generate a unique, trackable QR identity overlay on the bottom corner of your creative, so any leads generated can be traced to VMOVEXA.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 9, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildAdPreviewSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Preview', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          height: 120,
          width: double.infinity,
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1),
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF581C87), Color(0xFF3B0764)]),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text('SUMMER SALE', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 2)),
                        SizedBox(height: 4),
                        Text('UP TO 50% OFF', style: TextStyle(color: Color(0xFFEC4899), fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ),
              if (controller.enableQrOverlay.value)
                Positioned(
                  bottom: 8,
                  right: 8,
                  child: Container(
                    width: 32,
                    height: 32,
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF8B5CF6), width: 1),
                    ),
                    child: const Center(
                      child: Icon(Icons.qr_code_rounded, color: Colors.black, size: 24),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // STEP 3: SELECT FLEET & SCREENS
  // ==========================================
  Widget _buildStep3SelectFleet() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 3 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Select Fleet & Screens', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Choose the fleet operators and screens where your ad will be displayed.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        Container(
          decoration: BoxDecoration(
            color: AppColors.inputBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: const TextField(
            style: TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search fleet or location...',
              hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
            ),
          ),
        ),
        const SizedBox(height: 20),

        const Text('Select Fleet Operators', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        _buildFleetCheckboxRow('City Ride', 'City Transportation Services', '1,250 Screens', controller.selectCityRide),
        _buildFleetCheckboxRow('Metro Connect', 'Metro & Shuttle Services', '980 Screens', controller.selectMetroConnect),
        _buildFleetCheckboxRow('Urban Link', 'Urban Mobility Solutions', '860 Screens', controller.selectUrbanLink),
        _buildFleetCheckboxRow('Express Move', 'Intercity Bus Services', '650 Screens', controller.selectExpressMove),
        const SizedBox(height: 20),

        const Text('Select Screens', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        _buildScreenOptionsGrid(),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildFleetCheckboxRow(String label, String subtitle, String screensCount, RxBool rxBool) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Obx(
            () => Checkbox(
              value: rxBool.value,
              onChanged: (val) => rxBool.value = val!,
              activeColor: const Color(0xFF6366F1),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
              ],
            ),
          ),
          Text(screensCount, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildScreenOptionsGrid() {
    final List<Map<String, dynamic>> options = [
      {'title': 'All Screens', 'icon': Icons.directions_bus_rounded},
      {'title': 'By Location', 'icon': Icons.location_on_outlined},
      {'title': 'By Route', 'icon': Icons.alt_route_rounded},
      {'title': 'By Screen ID', 'icon': Icons.monitor_rounded},
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.8,
      children: options.map((opt) {
        bool isSelected = controller.selectScreenType.value == (opt['title'] as String);
        return GestureDetector(
          onTap: () => controller.selectScreenOption(opt['title'] as String),
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder, width: 1.5),
            ),
            child: Row(
              children: [
                Icon(opt['icon'] as IconData, color: const Color(0xFF8B5CF6), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    opt['title'] as String,
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle, color: Color(0xFF6366F1), size: 12),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ==========================================
  // STEP 4: SCHEDULE CAMPAIGN
  // ==========================================
  Widget _buildStep4ScheduleCampaign() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 4 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Schedule Campaign', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Set the start date, end date and time for your campaign.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        Row(
          children: [
            Expanded(
              child: _buildDateTimeSelectionCard(
                'Start Date & Time',
                '20 May 2026',
                '10:00 AM',
                Icons.calendar_today_rounded,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: _buildDateTimeSelectionCard(
                'End Date & Time',
                '10 Jun 2026',
                '10:00 PM',
                Icons.calendar_month_rounded,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        const Text('Repeat', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        _buildRepeatOptionsRow(),
        const SizedBox(height: 20),

        if (controller.repeatType.value == 'Weekly') ...[
          const Text('Select Days', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          _buildDaysSelectorStrip(),
          const SizedBox(height: 20),
        ],

        const Text('Daily Time Slot', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: CustomTextField(
                hintText: 'Start Time',
                controller: controller.startTimeController,
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 10),
              child: Text('—', style: TextStyle(color: AppColors.textMuted)),
            ),
            Expanded(
              child: CustomTextField(
                hintText: 'End Time',
                controller: controller.endTimeController,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF3B82F6).withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.2)),
          ),
          child: Row(
            children: const [
              Icon(Icons.info_outline_rounded, color: Color(0xFF3B82F6), size: 16),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Your ad will be displayed daily between 08:00 AM and 10:00 PM',
                  style: TextStyle(color: Color(0xFF3B82F6), fontSize: 9.5),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Timezone', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.language_rounded, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 12),
                  Text('(GMT +05:30) India Standard Time', style: TextStyle(color: Colors.white, fontSize: 11)),
                ],
              ),
              const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted, size: 18),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Calendar Preview', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        _buildCalendarGridCard(),
      ],
    );
  }

  Widget _buildDateTimeSelectionCard(String label, String date, String time, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: const Color(0xFF8B5CF6), size: 16),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(date, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(time, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9)),
                    ],
                  ),
                ],
              ),
              const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted, size: 16),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRepeatOptionsRow() {
    final modes = ['One Time', 'Daily', 'Weekly', 'Custom'];
    return Row(
      children: modes.map((mode) {
        bool isSelected = controller.repeatType.value == mode;
        return Expanded(
          child: GestureDetector(
            onTap: () => controller.setRepeatType(mode),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                  width: 1.5,
                ),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      children: [
                        Icon(
                          mode == 'One Time'
                              ? Icons.looks_one_outlined
                              : (mode == 'Daily' ? Icons.loop_rounded : (mode == 'Weekly' ? Icons.calendar_today_outlined : Icons.tune_rounded)),
                          color: const Color(0xFF8B5CF6),
                          size: 16,
                        ),
                        const SizedBox(height: 6),
                        Text(mode, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  if (isSelected)
                    const Positioned(
                      top: 0,
                      right: 4,
                      child: Icon(Icons.check_circle, color: Color(0xFF6366F1), size: 10),
                    ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDaysSelectorStrip() {
    final List<Map<String, dynamic>> days = [
      {'label': 'Sun', 'state': controller.daySun},
      {'label': 'Mon', 'state': controller.dayMon},
      {'label': 'Tue', 'state': controller.dayTue},
      {'label': 'Wed', 'state': controller.dayWed},
      {'label': 'Thu', 'state': controller.dayThu},
      {'label': 'Fri', 'state': controller.dayFri},
      {'label': 'Sat', 'state': controller.daySat},
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: days.map((d) {
        RxBool rx = d['state'] as RxBool;
        bool isSelected = rx.value;
        return Expanded(
          child: GestureDetector(
            onTap: () => rx.value = !rx.value,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder, width: 1.2),
              ),
              child: Center(
                child: Text(
                  d['label'] as String,
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCalendarGridCard() {
    return Container(
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
              Text('‹  May 2026', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              Text('June 2026  ›', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('SUN', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
              Text('MON', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
              Text('TUE', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
              Text('WED', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
              Text('THU', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
              Text('FRI', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
              Text('SAT', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 16),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCalendarDayCell('17', isNormal: true),
              _buildCalendarDayCell('18', isNormal: true),
              _buildCalendarDayCell('19', isDotSelected: true),
              _buildCalendarDayCell('20', isStart: true),
              _buildCalendarDayCell('21', isDotSelected: true),
              _buildCalendarDayCell('22', isDotSelected: true),
              _buildCalendarDayCell('23', isNormal: true),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCalendarDayCell('7', isNormal: true),
              _buildCalendarDayCell('8', isNormal: true),
              _buildCalendarDayCell('9', isNormal: true),
              _buildCalendarDayCell('10', isEnd: true),
              _buildCalendarDayCell('11', isNormal: true),
              _buildCalendarDayCell('12', isNormal: true),
              _buildCalendarDayCell('13', isNormal: true),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendBullet('Selected Days', const Color(0xFF6366F1)),
              const SizedBox(width: 14),
              _buildLegendBullet('Start Date', const Color(0xFF10B981)),
              const SizedBox(width: 14),
              _buildLegendBullet('End Date', Colors.redAccent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendBullet(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
      ],
    );
  }

  Widget _buildCalendarDayCell(
    String day, {
    bool isNormal = false,
    bool isDotSelected = false,
    bool isStart = false,
    bool isEnd = false,
  }) {
    Color cellBg = Colors.transparent;
    Color borderCol = Colors.transparent;
    Color textColor = AppColors.textSecondary;
    Widget? dot;

    if (isStart) {
      cellBg = const Color(0xFF10B981).withOpacity(0.12);
      borderCol = const Color(0xFF10B981);
      textColor = const Color(0xFF10B981);
    } else if (isEnd) {
      cellBg = Colors.redAccent.withOpacity(0.12);
      borderCol = Colors.redAccent;
      textColor = Colors.redAccent;
    } else if (isDotSelected) {
      cellBg = const Color(0xFF6366F1).withOpacity(0.12);
      borderCol = const Color(0xFF6366F1);
      textColor = Colors.white;
      dot = Container(
        width: 3,
        height: 3,
        margin: const EdgeInsets.only(top: 2),
        decoration: const BoxDecoration(color: Color(0xFF6366F1), shape: BoxShape.circle),
      );
    }

    return Container(
      width: 28,
      height: 36,
      decoration: BoxDecoration(
        color: cellBg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: borderCol, width: 1.2),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(day, style: TextStyle(color: textColor, fontSize: 9.5, fontWeight: FontWeight.bold)),
          if (dot != null) dot,
        ],
      ),
    );
  }

  // ==========================================
  // STEP 5: BUDGET & SUMMARY
  // ==========================================
  Widget _buildStep5BudgetSummary() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 5 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Budget & Summary', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Set your budget and review campaign cost details.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

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
                  const Text('Budget', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  _buildBudgetSelectorRow(),
                ],
              ),
              const SizedBox(height: 12),
              _buildLabel('Total Budget'),
              CustomTextField(
                hintText: 'Enter total budget',
                controller: controller.budgetController,
                prefixIcon: Icons.currency_rupee_rounded,
              ),
              const SizedBox(height: 8),
              const Text(
                'Minimum Budget: ₹10,000  •  Maximum: ₹50,00,000',
                style: TextStyle(color: AppColors.textMuted, fontSize: 9),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Campaign Duration', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.calendar_month_outlined, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 12),
                  Text('20 May 2026, 10:00 AM  -  10 Jun 2026, 10:00 PM', style: TextStyle(color: Colors.white, fontSize: 10)),
                ],
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Cost Summary', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              _buildCostItemRow('Campaign Duration', '21 Days'),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildCostItemRow('Total Screens', '1,250'),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildCostItemRow('Cost per Screen (Estimated)', '₹200'),
              const Divider(color: AppColors.cardBorder, height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Estimated Total Cost', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  Text('₹2,50,000', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: const [
                  Icon(Icons.info_outline_rounded, color: AppColors.textMuted, size: 12),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Actual cost may vary based on availability and performance.',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Payment Method', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            children: [
              const Icon(Icons.payment_rounded, color: Color(0xFF8B5CF6), size: 18),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(controller.paymentMethod.value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text('You will be redirected to complete the payment after submission.', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Promo Code (Optional)', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: CustomTextField(
                hintText: 'Enter promo code',
                controller: controller.promoCodeController,
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: controller.applyPromo,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF8B5CF6), width: 1.2),
                ),
                child: const Text('Apply', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBudgetSelectorRow() {
    final types = ['Total Budget', 'Daily Budget'];
    return Row(
      children: types.map((t) {
        bool isSelected = controller.budgetType.value == t;
        return GestureDetector(
          onTap: () => controller.setBudgetType(t),
          child: Container(
            margin: const EdgeInsets.only(left: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF6366F1).withOpacity(0.12) : AppColors.cardBg,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder, width: 1),
            ),
            child: Row(
              children: [
                Text(t, style: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary, fontSize: 9)),
                if (isSelected) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.check_circle_rounded, color: Color(0xFF6366F1), size: 10),
                ],
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCostItemRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  // ==========================================
  // STEP 6: QR IDENTITY (NEW FROM Figma Screen)
  // ==========================================
  Widget _buildStep6QrIdentity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 6 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('QR Identity', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Generate a unique, trackable QR for every ad placement & playback context.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        // Green Success Alert
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withOpacity(0.06),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 2),
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                child: const Icon(Icons.check, color: Colors.black, size: 10),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'QR Identity Created Successfully',
                      style: TextStyle(color: Color(0xFF10B981), fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Your QR code is ready to use for this campaign. Leads generated through this QR will be attributed to VMOVEXA.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5, height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Preview panel grid
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left panel: QR preview
              Column(
                children: [
                  const Text('Scan to Preview', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  const SizedBox(height: 10),
                  // Glowing QR code with V logo
                  Container(
                    width: 130,
                    height: 130,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.5), width: 1.5),
                    ),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: CustomPaint(
                            painter: DummyQrCodePainter(color: Colors.black),
                          ),
                        ),
                        // Tiny V logo at the center
                        Center(
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFF8B5CF6), width: 1.5),
                            ),
                            child: const Center(
                              child: Text(
                                'V',
                                style: TextStyle(
                                  color: Color(0xFF8B5CF6),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(controller.qrCodeId.value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(width: 4),
                      const Icon(Icons.copy_rounded, color: AppColors.textSecondary, size: 12),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 6),
                      const Text('Ready', style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              const SizedBox(width: 16),

              // Right panel: metadata list
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 14),
                  child: Column(
                    children: [
                      _buildQrMetadataRow('Campaign', controller.campaignNameController.text, Icons.campaign_rounded),
                      const Divider(color: AppColors.cardBorder, height: 18),
                      _buildQrMetadataRow('Ad', controller.uploadedFileName.value, Icons.video_file_outlined),
                      const Divider(color: AppColors.cardBorder, height: 18),
                      _buildQrMetadataRow('Screen / Placement', 'Rear Screen', Icons.monitor_rounded),
                      const Divider(color: AppColors.cardBorder, height: 18),
                      _buildQrMetadataRow('Vehicle / Asset', controller.qrAssetCode.value, Icons.directions_bus_rounded),
                      const Divider(color: AppColors.cardBorder, height: 18),
                      _buildQrMetadataRow('Route', controller.qrRoute.value, Icons.alt_route_rounded),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Playback schedule summary
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
                children: const [
                  Icon(Icons.calendar_month_outlined, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 10),
                  Text('Playback Schedule', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildScheduleSummaryCell('Campaign Duration', '20 May 2026 –\n10 Jun 2026')),
                  Container(width: 1, height: 32, color: AppColors.cardBorder),
                  Expanded(child: _buildScheduleSummaryCell('Repeat', 'Weekly\n(Mon – Fri)')),
                  Container(width: 1, height: 32, color: AppColors.cardBorder),
                  Expanded(child: _buildScheduleSummaryCell('Daily Time', '08:00 AM –\n10:00 PM')),
                ],
              ),
              const SizedBox(height: 14),
              // Schedule warning box blue
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withOpacity(0.06),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.12)),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.info_outline_rounded, color: Color(0xFF3B82F6), size: 14),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'This QR will be active only during the scheduled playback time and on selected days.',
                        style: TextStyle(color: Color(0xFF3B82F6), fontSize: 9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Action Share / Download buttons
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cardBorder),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.share_rounded, color: Colors.white, size: 16),
                label: const Text('Share QR', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)]),
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
                  icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 16),
                  label: const Text('Download QR', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQrMetadataRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF8B5CF6), size: 14),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildScheduleSummaryCell(String label, String val) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
        const SizedBox(height: 6),
        Text(
          val,
          style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  // ==========================================
  // STEP 7: REVIEW & SUBMIT
  // ==========================================
  Widget _buildStep6ReviewSubmit() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Review & Submit', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Review & Submit', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Please review all campaign details before submitting for approval.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Campaign Information'),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              _buildReviewRow('Campaign Name', controller.campaignNameController.text),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Brand Name', controller.brandNameController.text),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Campaign Type', controller.selectedCampaignType.value),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Objective', controller.selectedObjective.value),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Category', controller.selectedCategory.value),
            ],
          ),
        ),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Creative'),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                color: const Color(0xFF1E293B),
                child: const Center(child: Icon(Icons.movie_filter_outlined, color: Color(0xFF8B5CF6), size: 24)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(controller.uploadedFileName.value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text('MP4  |  42 MB  |  1920x1080', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    const SizedBox(height: 4),
                    const Text('Duration: 20 sec', style: TextStyle(color: AppColors.textSecondary, fontSize: 9)),
                  ],
                ),
              ),
              Row(
                children: const [
                  Icon(Icons.check_circle, color: Color(0xFF10B981), size: 12),
                  SizedBox(width: 4),
                  Text('Uploaded', style: TextStyle(color: Color(0xFF10B981), fontSize: 9)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Fleet & Screens'),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.directions_bus_rounded, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 10),
                  Text('3 Fleet Operators', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              Row(
                children: const [
                  Icon(Icons.monitor_rounded, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 10),
                  Text('1,250 Screens', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Schedule'),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              _buildReviewRow('Start Date & Time', '20 May 2026, 10:00 AM'),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('End Date & Time', '10 Jun 2026, 10:00 PM'),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Repeat', 'Weekly on Mon, Tue, Wed, Thu, Fri'),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Daily Time Slot', '08:00 AM - 10:00 PM'),
            ],
          ),
        ),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Budget & Cost'),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              _buildReviewRow('Total Budget', '₹2,50,000'),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Campaign Duration', '21 Days'),
              const Divider(color: AppColors.cardBorder, height: 20),
              _buildReviewRow('Total Screens', '1,250'),
              const Divider(color: AppColors.cardBorder, height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Estimated Total Cost', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text('₹2,50,000', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF8B5CF6).withOpacity(0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.2)),
          ),
          child: Row(
            children: const [
              Icon(Icons.info_outline_rounded, color: Color(0xFF8B5CF6), size: 18),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Almost done! Click Submit to send your campaign for review. You will be notified once it\'s approved.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5, height: 1.4),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReviewSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
          const Text('Edit', style: TextStyle(color: Color(0xFF6366F1), fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================
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
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 20),
                    Center(
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF10B981), width: 3.5),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withOpacity(0.15),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(Icons.check_rounded, color: Color(0xFF10B981), size: 56),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    const Text(
                      'Campaign Submitted!',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Your campaign has been submitted successfully\nand is now under review.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    _buildSubmissionDetailsCard(),
                    const SizedBox(height: 20),

                    _buildNotifyBox(),
                    const SizedBox(height: 48),

                    CustomButton(
                      text: 'View Campaigns',
                      onTap: controller.closeWizard,
                    ),
                    const SizedBox(height: 14),

                    CustomButton(
                      text: 'Create Another Campaign',
                      isOutlined: true,
                      onTap: controller.createAnother,
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmissionDetailsCard() {
    return Container(
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
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Campaign ID', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  SizedBox(height: 4),
                  Text('CMP-2026-000124', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              OutlinedButton.icon(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cardBorder),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
                icon: const Icon(Icons.copy_rounded, color: Colors.white, size: 12),
                label: const Text('Copy ID', style: TextStyle(color: Colors.white, fontSize: 9)),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSubmissionDetailRow('Campaign Name', 'Summer Sale 2026', Icons.campaign_outlined),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildSubmissionDetailRow('Submitted On', '19 May 2026, 09:41 AM', Icons.access_time_rounded),
          const Divider(color: AppColors.cardBorder, height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.check_circle_outline_rounded, color: AppColors.textSecondary, size: 14),
                  SizedBox(width: 8),
                  Text('Status', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Under Review', style: TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSubmissionDetailRow(String label, String value, IconData icon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: AppColors.textSecondary, size: 14),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
          ],
        ),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildNotifyBox() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF3B82F6).withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.15)),
      ),
      child: Row(
        children: const [
          Icon(Icons.info_outline_rounded, color: Color(0xFF3B82F6), size: 18),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'We will notify you once your campaign is approved. You can track the status from the Campaigns section.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 10, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActionBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: CustomButton(
              text: 'Back',
              isOutlined: true,
              onTap: controller.previousStep,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Obx(
              () => CustomButton(
                text: controller.isOnReviewPage.value
                    ? 'Submit Campaign'
                    : (controller.currentStep.value == 6 ? 'Continue' : 'Next'),
                onTap: controller.nextStep,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }
}

// Custom Painter to draw a simulated QR code layout representation
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
