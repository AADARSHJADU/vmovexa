import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../fleet_operator/assign_gps/views/assign_gps_view.dart';
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
                    Obx(() {
                      final step = controller.currentStep.value;
                      if (step == 7) {
                        return InkWell(
                          onTap: () {
                            Get.snackbar(
                              'Draft Saved',
                              'Your campaign draft has been saved successfully.',
                              snackPosition: SnackPosition.BOTTOM,
                              backgroundColor: const Color(0xFF8B5CF6),
                              colorText: Colors.white,
                            );
                          },
                          child: Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Icon(Icons.save_as_outlined, color: Color(0xFF8B5CF6), size: 18),
                                SizedBox(height: 2),
                                Text('Save Draft', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 8)),
                              ],
                            ),
                          ),
                        );
                      }
                      return IconButton(
                        icon: const Icon(Icons.close, color: Colors.white, size: 22),
                        onPressed: controller.closeWizard,
                      );
                    }),
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
    bool isReview = active == 7;

    final List<String> labels = isReview
        ? [
            'Campaign Details',
            'Ad Details',
            'Schedule',
            'Placement',
            'Budget',
            'QR Destination',
            'Review & Submit'
          ]
        : [
            'Goal',
            'Campaign Details',
            'Ad Details',
            'Audience',
            'Schedule',
            'QR Identity'
          ];

    int totalSteps = labels.length;
    int segments = (totalSteps * 2) - 1;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          Row(
            children: List.generate(segments, (index) {
              if (index % 2 == 1) {
                int stepNum = (index ~/ 2) + 1;
                bool isCompleted = stepNum < active;
                return Expanded(
                  child: Container(
                    height: 2,
                    color: isCompleted ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
                  ),
                );
              } else {
                int stepNum = (index ~/ 2) + 1;
                bool isActive = stepNum == active;
                bool isCompleted = stepNum < active;

                return Container(
                  width: 24,
                  height: 24,
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
                        ? const Icon(Icons.check, color: Colors.white, size: 10)
                        : Text(
                            '$stepNum',
                            style: TextStyle(
                              color: isActive || isCompleted ? Colors.white : AppColors.textMuted,
                              fontSize: 9,
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
            children: List.generate(totalSteps, (index) {
              bool isCurrent = index + 1 == active;
              return Text(
                labels[index],
                style: TextStyle(
                  color: isCurrent ? const Color(0xFF8B5CF6) : AppColors.textMuted,
                  fontSize: isReview ? 7.0 : 8.0,
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
    switch (controller.currentStep.value) {
      case 2:
        return _buildStep2UploadCreative();
      case 3:
        return _buildStep4ScheduleCampaign();
      case 4:
        return _buildStep3SelectFleet();
      case 5:
        return _buildStep5BudgetSummary();
      case 6:
        return _buildStep6QrIdentity();
      case 7:
        return _buildStep7ReviewSubmit();
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
        CustomTextField(
          prefixSvg: 'assets/icons/advertiser_ic/write_note.svg',
            hintText: 'Enter campaign name',
            controller: controller.campaignNameController
        ),
        const SizedBox(height: 16),

        _buildLabel('Brand Name'),
        CustomTextField(
            prefixSvg: 'assets/icons/advertiser_ic/tag.svg',
            hintText: 'Enter brand name (optional)',
            controller: controller.brandNameController,
        ),
        const SizedBox(height: 16),

        _buildLabel('Campaign Type *'),
        _buildCampaignTypeSelector(),
        const SizedBox(height: 16),

        _buildLabel('Campaign Description *'),
        CustomTextField(
          prefixSvg: 'assets/icons/advertiser_ic/note.svg',
          hintText: 'Write a brief description about your campaign',
          controller: controller.campaignDescriptionController,
          maxLines: 3,
        ),
        const SizedBox(height: 16),

        _buildLabel('Objective *'),
        CustomTextField(
          prefixSvg: 'assets/icons/advertiser_ic/target.svg',
          hintText: 'Select objective',
          isDropdown: true,
          dropdownValue: controller.selectedObjective.value,
          dropdownItems: controller.objectives,
          onDropdownChanged: (val) => controller.selectedObjective.value = val!,
        ),
        const SizedBox(height: 16),

        _buildLabel('Category *'),
        CustomTextField(
          prefixSvg: 'assets/icons/advertiser_ic/layers.svg',
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
      {
        'title': 'Brand Awareness',
        'icon': 'assets/icons/advertiser_ic/speaker.svg',
      },
      {
        'title': 'Product Promotion',
        'icon': 'assets/icons/advertiser_ic/box.svg',
      },
      {
        'title': 'Event',
        'icon': 'assets/icons/advertiser_ic/calender1.svg',
      },
      {
        'title': 'Offer',
        'icon': 'assets/icons/advertiser_ic/tag.svg',
      },
    ];

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: options.map((opt) {
          final bool isSelected =
              controller.selectedCampaignType.value == opt['title'];
          final bool isLast = opt == options.last;

          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: isLast ? 0 : 10),
              child: GestureDetector(
                onTap: () => controller.selectCampaignType(opt['title']),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 14,
                    horizontal: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF22D3EE)
                          : AppColors.cardBorder,
                      width: 1.4,
                    ),
                  ),
                  child: Stack(
                    clipBehavior: Clip.none,
                    alignment: Alignment.center,
                    children: [
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SvgPicture.asset(
                            opt['icon'],
                            width: 24,
                            height: 24,
                          ),

                          const SizedBox(height: 10),

                          Text(
                            opt['title'],
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              height: 1.2,
                            ),
                          ),
                        ],
                      ),

                      if (isSelected)
                        Positioned(
                          top: -14,
                          right: -4,
                          child: Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              color: const Color(0xFF22C55E),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.cardBg,
                                width: 1.5,
                              ),
                            ),
                            child: const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 10,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ==========================================
  // STEP 2: UPLOAD CREATIVE
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

        // Dashed-border upload box with gradient icon + gradient title
        GestureDetector(
          onTap: controller.simulateUpload,
          child: CustomPaint(
            painter: DashedBorderPainter(
              color: const Color(0xFF8B5CF6).withOpacity(0.45),
              borderRadius: 16,
            ),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  ShaderMask(
                    blendMode: BlendMode.srcIn,
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ).createShader(bounds),
                    child: SvgPicture.asset('assets/icons/advertiser_ic/cloud.svg'),
                  ),
                  const SizedBox(height: 5),
                  ShaderMask(
                    blendMode: BlendMode.srcIn,
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [Color(0xFFA855F7), Color(0xFF6366F1)],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ).createShader(bounds),
                    child: const Text(
                      'Upload Creative',
                      style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ),
                  //const SizedBox(height: 6),
                  const Text('Drag & drop your file here', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  const SizedBox(height: 2),
                  const Text('or', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF8B5CF6), width: 1.4),
                    ),
                    child: const Text(
                      'Tap to Upload',
                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Supported Formats: JPG, PNG, MP4, HTML5\nMaximum File Size: 50 MB',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 9),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),

        if (controller.hasUploadedFile.value) ...[
          const Text('Uploaded File', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(
                        child: Icon(Icons.movie_filter_outlined, color: Color(0xFF8B5CF6), size: 22),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            controller.uploadedFileName.value,
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            controller.uploadedFileSize.value,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: const [
                              Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 11),
                              SizedBox(width: 4),
                              Text('Uploaded Successfully', style: TextStyle(color: Color(0xFF10B981), fontSize: 10)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      icon: const Icon(Icons.more_vert_rounded, color: AppColors.textMuted, size: 18),
                      onPressed: () {},
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
                          side: const BorderSide(color: Color(0xFF6366F1)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                        icon: const Icon(Icons.play_arrow_rounded, color: Color(0xFF8B5CF6), size: 16),
                        label: const Text('Preview', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: controller.removeUploaded,
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.redAccent),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                        icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 16),
                        label: const Text('Remove', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        _buildLabel('Upload Type'),
        _buildCreativeTypeGrid(),
        const SizedBox(height: 20),

        _buildQrIdentityOptionCard(),
        const SizedBox(height: 20),

        _buildAdPreviewSection(),
      ],
    );
  }

// Upload Type grid - Image / Video / HTML5 / PDF, 4-in-a-row,
// equal width & height (fixes the old GridView.count overflow issue too).
  Widget _buildCreativeTypeGrid() {
    final List<Map<String, dynamic>> types = [
      {
        'title': 'Image',
        'subtitle': 'JPG, PNG',
        'icon': 'assets/icons/advertiser_ic/gallary.svg',
      },
      {
        'title': 'Video',
        'subtitle': 'MP4',
        'icon': 'assets/icons/advertiser_ic/vedio.svg',
      },
    ];

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: types.map((type) {
          final bool isSelected =
              controller.selectedCreativeType.value == type['title'];
          final bool isLast = type == types.last;

          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: isLast ? 0 : 10),
              child: GestureDetector(
                onTap: () => controller.selectCreativeType(type['title']),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 14,
                    horizontal: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF8B5CF6)
                          : AppColors.cardBorder,
                      width: 1.4,
                    ),
                  ),
                  child: Stack(
                    clipBehavior: Clip.none,
                    alignment: Alignment.center,
                    children: [
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SvgPicture.asset(
                            type['icon'],
                            width: 24,
                            height: 24,
                          ),

                          const SizedBox(height: 10),

                          Text(
                            type['title'],
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),

                          const SizedBox(height: 2),

                          Text(
                            type['subtitle'],
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 9,
                            ),
                          ),
                        ],
                      ),

                      if (isSelected)
                        Positioned(
                          top: -14,
                          right: -4,
                          child: Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5CF6),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.cardBg,
                                width: 1.5,
                              ),
                            ),
                            child: const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 10,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
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
                children: [
                  //Icon(Icons.qr_code_scanner_rounded, color: Color(0xFF8B5CF6), size: 18),
                  SvgPicture.asset('assets/icons/fleet_operator_icons/qr-code-scan.svg'),
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
  // =====================================================================
// REPLACE these methods in your existing create_campaign_view.dart:
//   _buildStep3SelectFleet()
//   _buildFleetCheckboxRow()
//   _buildScreenOptionsGrid()
//
// This uses your EXISTING controller fields:
//   selectCityRide, selectMetroConnect, selectUrbanLink, selectExpressMove
//   (all RxBool), selectScreenType, selectScreenOption()
//
// It adds per-operator badge text (screens/cities) as hardcoded data
// in the map below - wire these to real controller data if you have it.
// =====================================================================

  Widget _buildStep3SelectFleet() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 4 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Select Fleet & Screens', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Choose the fleet operators and screens where your ad will be displayed.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        // Search bar + Filter button
        Row(
          children: [
            Expanded(
              child: Container(
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
                    prefixIconConstraints: BoxConstraints(minWidth: 40, minHeight: 18),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Container(
              height: 46,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF8B5CF6), width: 1.2),
              ),
              child: const Row(
                children: [
                  Icon(Icons.tune_rounded, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 6),
                  Text('Filter', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 22),

        // Section header with live selected count
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Select Fleet Operators', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            Obx(() {
              final count = [
                controller.selectCityRide,
                controller.selectMetroConnect,
                controller.selectUrbanLink,
                controller.selectExpressMove,
              ].where((e) => e.value).length;
              return Row(
                children: [
                  Text('$count Selected', style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 4),
                  const Icon(Icons.keyboard_arrow_up_rounded, color: Color(0xFF8B5CF6), size: 16),
                ],
              );
            }),
          ],
        ),
        const SizedBox(height: 12),

        _buildFleetOperatorCard(
          'City Ride',
          'City Transportation Services',
          '1,250 Screens',
          '1200+ Screens',
          'Active in 12 Cities',
          Icons.directions_bus_filled_rounded,
          controller.selectCityRide,
        ),
        _buildFleetOperatorCard(
          'Metro Connect',
          'Metro & Shuttle Services',
          '980 Screens',
          '980+ Screens',
          'Active in 8 Cities',
          Icons.tram_rounded,
          controller.selectMetroConnect,
        ),
        _buildFleetOperatorCard(
          'Urban Link',
          'Urban Mobility Solutions',
          '860 Screens',
          '860+ Screens',
          'Active in 10 Cities',
          Icons.directions_transit_filled_rounded,
          controller.selectUrbanLink,
        ),
        _buildFleetOperatorCard(
          'Express Move',
          'Intercity Bus Services',
          '650 Screens',
          '650+ Screens',
          'Active in 6 Cities',
          Icons.airport_shuttle_rounded,
          controller.selectExpressMove,
        ),

        const SizedBox(height: 6),
        GestureDetector(
          onTap: () {},
          child: const Row(
            children: [
              Icon(Icons.add_circle_outline_rounded, color: Color(0xFF8B5CF6), size: 16),
              SizedBox(width: 6),
              Text('Add More Fleet Operators', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        const SizedBox(height: 24),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Select Screens', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            Row(
              children: const [
                Text('Selected 1250 Screens', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
                SizedBox(width: 4),
                Icon(Icons.keyboard_arrow_up_rounded, color: Color(0xFF8B5CF6), size: 16),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        _buildScreenOptionsGrid(),
        const SizedBox(height: 22),

        const Text('Selection Summary', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        _buildSelectionSummaryCard(),
        const SizedBox(height: 20),
      ],
    );
  }

// A single fleet operator row: custom checkbox, logo tile, name +
// subtitle + two info badges, and screens count with a chevron.
  Widget _buildFleetOperatorCard(
      String label,
      String subtitle,
      String screensCount,
      String screensBadge,
      String citiesBadge,
      IconData logoIcon,
      RxBool rxBool,
      ) {
    return Obx(() {
      final bool isSelected = rxBool.value;

      return GestureDetector(
        onTap: () => rxBool.value = !rxBool.value,
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
              width: 1.4,
            ),
            boxShadow: isSelected
                ? [
              BoxShadow(
                color: const Color(0xFF6366F1).withOpacity(0.15),
                blurRadius: 10,
              ),
            ]
                : null,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Custom checkbox
              Container(
                width: 20,
                height: 20,
                margin: const EdgeInsets.only(top: 2),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF8B5CF6) : Colors.transparent,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF8B5CF6) : AppColors.cardBorder,
                    width: 1.4,
                  ),
                ),
                child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 13) : null,
              ),
              const SizedBox(width: 10),

              // Logo tile
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(logoIcon, color: const Color(0xFF6366F1), size: 20),
              ),
              const SizedBox(width: 12),

              // Name, subtitle, badges
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 3),
                    Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _buildInfoBadge(screensBadge, const Color(0xFF8B5CF6), filled: true),
                        _buildInfoBadge(citiesBadge, const Color(0xFF3B82F6), filled: false),
                      ],
                    ),
                  ],
                ),
              ),

              // Screens count + chevron
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(screensCount, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted, size: 16),
                ],
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildInfoBadge(String text, Color color, {required bool filled}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: filled ? color.withOpacity(0.15) : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
        border: filled ? null : Border.all(color: color.withOpacity(0.5), width: 1),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontSize: 8, fontWeight: FontWeight.bold),
      ),
    );
  }

// Screen type selector - 4 equal vertical cards (icon, title, subtitle),
// selected card gets a purple border + check badge on the top-right
// corner, same pattern used for Campaign Type / Creative Type.
  Widget _buildScreenOptionsGrid() {
    final List<Map<String, dynamic>> options = [
      {
        'title': 'All Screens',
        'subtitle': 'All available screens',
        'icon': 'assets/icons/bus.svg',
      },
      {
        'title': 'By Location',
        'subtitle': 'Choose by city / area',
        'icon': 'assets/icons/live_map.svg',
      },
      {
        'title': 'By Route',
        'subtitle': 'Choose by bus routes',
        'icon': 'assets/icons/advertiser_ic/route.svg',
      },
      {
        'title': 'By Screen ID',
        'subtitle': 'Select specific screens',
        'icon': 'assets/icons/advertiser_ic/tv.svg',
      },
    ];

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: options.map((opt) {
          final bool isSelected =
              controller.selectScreenType.value == (opt['title'] as String);
          final bool isLast = opt == options.last;

          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: isLast ? 0 : 8),
              child: GestureDetector(
                onTap: () => controller.selectScreenOption(
                  opt['title'] as String,
                ),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 14,
                    horizontal: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF6366F1)
                          : AppColors.cardBorder,
                      width: 1.4,
                    ),
                  ),
                  child: Stack(
                    clipBehavior: Clip.none,
                    alignment: Alignment.center,
                    children: [
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SvgPicture.asset(
                            opt['icon'] as String,
                            width: 22,
                            height: 22,
                          ),

                          const SizedBox(height: 8),

                          Text(
                            opt['title'] as String,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),

                          const SizedBox(height: 3),

                          Text(
                            opt['subtitle'] as String,
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 7.5,
                            ),
                          ),
                        ],
                      ),

                      if (isSelected)
                        Positioned(
                          top: -14,
                          right: -4,
                          child: Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366F1),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.cardBg,
                                width: 1.5,
                              ),
                            ),
                            child: const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 10,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

// Summary card - two columns: chosen fleet operators, and screens/cities.
  Widget _buildSelectionSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                //Icon(Icons.directions_bus_filled_rounded, color: Color(0xFF8B5CF6), size: 22),
                SvgPicture.asset('assets/icons/bus.svg'),
                const SizedBox(width: 10),
                Expanded(
                  child: Obx(() {
                    final selectedNames = <String>[
                      if (controller.selectCityRide.value) 'City Ride',
                      if (controller.selectMetroConnect.value) 'Metro Connect',
                      if (controller.selectUrbanLink.value) 'Urban Link',
                      if (controller.selectExpressMove.value) 'Express Move',
                    ];
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${selectedNames.length} Fleet Operators', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 3),
                        Text(
                          selectedNames.join(', '),
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                        ),
                      ],
                    );
                  }),
                ),
              ],
            ),
          ),
          Container(width: 1, height: 40, color: AppColors.cardBorder, margin: const EdgeInsets.symmetric(horizontal: 12)),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                //Icon(Icons.monitor_rounded, color: Color(0xFF8B5CF6), size: 22),
                SvgPicture.asset(
                  'assets/icons/advertiser_ic/tv.svg',
                  height: 20,
                ),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('1250 Screens', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      SizedBox(height: 3),
                      Text('Across 20 Cities', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 4: SCHEDULE CAMPAIGN
  // ==========================================
  // =====================================================================
// REPLACE these methods in your existing create_campaign_view.dart:
//   _buildStep4ScheduleCampaign()
//   _buildDateTimeSelectionCard()
//   _buildRepeatOptionsRow()
//   _buildDaysSelectorStrip()
//
// Your _buildCalendarGridCard(), _buildCalendarDayCell(),
// _buildLegendBullet() already match the screenshot closely - no
// changes needed there.
// =====================================================================

  Widget _buildStep4ScheduleCampaign() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 3 of 6', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Schedule Campaign', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Set the start date, end date and time for your campaign.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        const Text('Campaign Duration', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildDateTimeSelectionCard(
                'Start Date & Time',
                '20 May 2026',
                '10:00 AM',
                'assets/icons/calendar.svg',
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: _buildDateTimeSelectionCard(
                'End Date & Time',
                '10 Jun 2026',
                '10:00 PM',
                'assets/icons/calendar.svg',
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Start Time', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  const SizedBox(height: 6),
                  CustomTextField(
                    hintText: '08:00 AM',
                    controller: controller.startTimeController,
                    //prefixIcon: Icons.access_time_rounded,
                    prefixSvg: 'assets/icons/clock.svg',
                    suffixIcon: Icons.keyboard_arrow_down_rounded,
                    onSuffixTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('End Time', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  const SizedBox(height: 6),
                  CustomTextField(
                    hintText: '10:00 PM',
                    controller: controller.endTimeController,
                    prefixSvg: 'assets/icons/clock.svg',
                    suffixIcon: Icons.keyboard_arrow_down_rounded,
                    onSuffixTap: () {},
                  ),
                ],
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

// Date/time card - icon now sits inside a small gradient rounded box,
// matching the screenshot instead of a plain flat icon.
  Widget _buildDateTimeSelectionCard(
      String label,
      String date,
      String time,
      String iconPath,
      ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.cardBorder,
          width: 1.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 9,
            ),
          ),

          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    padding: const EdgeInsets.all(7),
                    child: SvgPicture.asset(
                      iconPath,
                      fit: BoxFit.contain,
                    ),
                  ),

                  const SizedBox(width: 2),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        date,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 2),

                      Text(
                        time,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 9,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.textMuted,
                size: 16,
              ),
            ],
          ),
        ],
      ),
    );
  }

// Repeat option buttons - selected state now shows a check badge
// overlapping the top-right corner of the border, like the screenshot,
// instead of sitting inside the box.
  Widget _buildRepeatOptionsRow() {
    final modes = ['One Time', 'Daily', 'Weekly', 'Custom'];
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: modes.map((mode) {
          final bool isSelected = controller.repeatType.value == mode;
          final bool isLast = mode == modes.last;

          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: isLast ? 0 : 8),
              child: GestureDetector(
                onTap: () => controller.setRepeatType(mode),
                child: Container(
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
                    clipBehavior: Clip.none,
                    alignment: Alignment.center,
                    children: [
                      Column(
                        mainAxisSize: MainAxisSize.min,
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
                      if (isSelected)
                        Positioned(
                          top: -12,
                          right: -6,
                          child: Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366F1),
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.cardBg, width: 1.5),
                            ),
                            child: const Icon(Icons.check, color: Colors.white, size: 10),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

// Select Days strip - pill style. Selected days get a solid purple
// fill + a small white check badge overlapping the top-right corner,
// matching the screenshot. Unselected days stay outlined/muted.
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
      children: days.map((d) {
        final RxBool rx = d['state'] as RxBool;
        final bool isSelected = rx.value;

        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 3),
            child: GestureDetector(
              onTap: () => rx.value = !rx.value,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: isSelected
                      ? const LinearGradient(
                    colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                      : null,
                  color: isSelected ? null : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? Colors.transparent : AppColors.cardBorder,
                    width: 1.2,
                  ),
                ),
                child: Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.center,
                  children: [
                    Text(
                      d['label'] as String,
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 10,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    if (isSelected)
                      Positioned(
                        top: -10,
                        right: -6,
                        child: Container(
                          width: 13,
                          height: 13,
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.cardBg, width: 1.2),
                          ),
                          child: const Icon(Icons.check, color: Colors.white, size: 8),
                        ),
                      ),
                  ],
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

        // Budget section card
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
              const Text('Budget', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              
              // Total Budget label and input
              const Text('Total Budget', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
              const SizedBox(height: 6),
              CustomTextField(
                hintText: 'Enter budget',
                controller: controller.budgetController,
                prefixIcon: Icons.currency_rupee_rounded,
                height: 44, // Shorter height as requested
              ),
              const SizedBox(height: 6),
              const Text(
                'Minimum Budget: ₹10,000  •  Maximum: ₹50,00,000',
                style: TextStyle(color: AppColors.textMuted, fontSize: 8),
              ),
              
              const SizedBox(height: 16),
              
              // Budget Type label and segmented buttons stacked underneath
              const Text('Budget Type', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: Row(
                  children: [
                    // Total Budget button
                    Expanded(
                      child: GestureDetector(
                        onTap: () => controller.setBudgetType('Total Budget'),
                        child: Obx(() {
                          final isSelected = controller.budgetType.value == 'Total Budget';
                          return Container(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF6366F1).withOpacity(0.12) : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: isSelected ? const Color(0xFF6366F1) : Colors.transparent),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Total Budget',
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : AppColors.textSecondary,
                                    fontSize: 9.0,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                                if (isSelected) ...[
                                  const SizedBox(width: 4),
                                  const Icon(Icons.check_circle_rounded, color: Color(0xFF6366F1), size: 11),
                                ],
                              ],
                            ),
                          );
                        }),
                      ),
                    ),
                    const SizedBox(width: 6),
                    // Daily Budget button
                    Expanded(
                      child: GestureDetector(
                        onTap: () => controller.setBudgetType('Daily Budget'),
                        child: Obx(() {
                          final isSelected = controller.budgetType.value == 'Daily Budget';
                          return Container(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF6366F1).withOpacity(0.12) : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: isSelected ? const Color(0xFF6366F1) : Colors.transparent),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Daily Budget',
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : AppColors.textSecondary,
                                    fontSize: 9.0,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                                if (isSelected) ...[
                                  const SizedBox(width: 4),
                                  const Icon(Icons.check_circle_rounded, color: Color(0xFF6366F1), size: 11),
                                ],
                              ],
                            ),
                          );
                        }),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),


        const Text('Campaign Duration', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: Row(
                  children: [
                    //const Icon(Icons.calendar_month_outlined, color: Color(0xFF8B5CF6), size: 20),
                    SvgPicture.asset('assets/icons/calendar.svg'),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Start Date & Time', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                          SizedBox(height: 2),
                          Text('20 May 2026', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                          SizedBox(height: 1),
                          Text('10:00 AM', style: TextStyle(color: AppColors.textSecondary, fontSize: 8.5)),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary, size: 14),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: Row(
                  children: [
                    SvgPicture.asset('assets/icons/calendar.svg'),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('End Date & Time', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                          SizedBox(height: 2),
                          Text('10 Jun 2026', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                          SizedBox(height: 1),
                          Text('10:00 PM', style: TextStyle(color: AppColors.textSecondary, fontSize: 8.5)),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary, size: 14),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        const Text('Cost Summary', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
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
                  Text('Estimated Total Cost', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text('₹2,50,000', style: TextStyle(color: Color(0xFFEC4899), fontSize: 13, fontWeight: FontWeight.bold)), // Glowing pink
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

        const Text('Payment Method', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
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
              //const Icon(Icons.payment_rounded, color: Color(0xFF8B5CF6), size: 18),
              SvgPicture.asset('assets/icons/advertiser_ic/wallate.svg'),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Obx(() => Text(controller.paymentMethod.value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold))),
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
                      _buildQrMetadataRow(
                        'Campaign',
                        controller.campaignNameController.text,
                        'assets/icons/advertiser_ic/speaker.svg',
                      ),

                      const Divider(
                        color: AppColors.cardBorder,
                        height: 18,
                      ),

                      _buildQrMetadataRow(
                        'Ad',
                        controller.uploadedFileName.value,
                        'assets/icons/sim.svg',
                      ),

                      const Divider(
                        color: AppColors.cardBorder,
                        height: 18,
                      ),

                      _buildQrMetadataRow(
                        'Screen / Placement',
                        'Rear Screen',
                        'assets/icons/advertiser_ic/tv.svg',
                      ),

                      const Divider(
                        color: AppColors.cardBorder,
                        height: 18,
                      ),

                      _buildQrMetadataRow(
                        'Vehicle / Asset',
                        controller.qrAssetCode.value,
                        'assets/icons/bus.svg',
                      ),

                      const Divider(
                        color: AppColors.cardBorder,
                        height: 18,
                      ),

                      _buildQrMetadataRow(
                        'Route',
                        controller.qrRoute.value,
                        'assets/icons/live_location.svg',
                      ),
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
                children: [
                  //Icon(Icons.calendar_month_outlined, color: Color(0xFF8B5CF6), size: 16),
                  SvgPicture.asset('assets/icons/calendar.svg'),
                  const SizedBox(width: 10),
                  const Text('Playback Schedule', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
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

  Widget _buildQrMetadataRow(
      String label,
      String value,
      String iconPath,
      ) {
    return Row(
      children: [
        SvgPicture.asset(
          iconPath,
          width: 14,
          height: 14,
        ),

        const SizedBox(width: 10),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 8.5,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
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
  Widget _buildStep7ReviewSubmit() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Step 7 of 7', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Review & Submit', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Please review all campaign details before submitting for approval.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Campaign Summary', 1),
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

        _buildReviewSectionHeader('Advertisement Preview', 2),
        _buildReviewCreativeCard(),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Placement Summary', 4),
        _buildReviewPlacementCard(),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('Schedule Summary', 3),
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

        _buildReviewSectionHeader('Budget Summary', 5),
        _buildReviewBudgetCard(),
        const SizedBox(height: 20),

        _buildReviewSectionHeader('QR Tracking Summary', 6),
        _buildReviewQrTrackingCard(),
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
                  'Please review all details carefully. Once submitted, your campaign will be pending admin approval.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5, height: 1.4),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReviewSectionHeader(String title, int targetStep) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
          GestureDetector(
            onTap: () => controller.currentStep.value = targetStep,
            child: const Text('Edit', style: TextStyle(color: Color(0xFF6366F1), fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCreativeCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 100,
            height: 60,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              image: const DecorationImage(
                image: NetworkImage('https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=200'),
                fit: BoxFit.cover,
              ),
            ),
            child: Center(
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: Colors.black54,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 16),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.uploadedFileName.value,
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                _buildCreativeDetailRow('Format', 'MP4'),
                const SizedBox(height: 2),
                _buildCreativeDetailRow('Resolution', '1920 x 1080'),
                const SizedBox(height: 2),
                _buildCreativeDetailRow('Duration', '20 sec'),
                const SizedBox(height: 2),
                _buildCreativeDetailRow('Size', '42 MB'),
                const SizedBox(height: 6),
                Row(
                  children: const [
                    Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 11),
                    SizedBox(width: 6),
                    Text('Uploaded Successfully', style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreativeDetailRow(String label, String value) {
    return Row(
      children: [
        Text('$label : ', style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
        Text(value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildReviewPlacementCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 3.5,
        children: [
          _buildPlacementCell('assets/icons/bus.svg', '3 Vehicles'),
          _buildPlacementCell('assets/icons/advertiser_ic/tv.svg', '1,250 Screens'),
          _buildPlacementCell('assets/icons/advertiser_ic/layers.svg', 'Rear Screen Placement'),
          _buildPlacementCell('assets/icons/location.svg', '20 Cities'),
        ],
      ),
    );
  }

  Widget _buildPlacementCell(
      String iconPath,
      String text,
      ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: const Color(0xFF8B5CF6).withOpacity(0.08),
            borderRadius: BorderRadius.circular(6),
          ),
          child: SvgPicture.asset(
            iconPath,
            width: 14,
            height: 14,
          ),
        ),

        const SizedBox(width: 8),

        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildReviewBudgetCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildReviewRow('Total Budget', '₹2,50,000'),
          const Divider(color: AppColors.cardBorder, height: 18),
          _buildReviewRow('GST (18%)', '₹45,000'),
          const Divider(color: AppColors.cardBorder, height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Total Amount', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              Text('₹2,95,000', style: TextStyle(color: Color(0xFFEC4899), fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 18),
          _buildReviewRow('Payment Method', controller.paymentMethod.value),
        ],
      ),
    );
  }

  Widget _buildReviewQrTrackingCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2), width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 100,
            height: 100,
            padding: const EdgeInsets.all(8),
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
                    width: 20,
                    height: 20,
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
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Status', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 6),
                        const Text('Enabled', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
                const Divider(color: AppColors.cardBorder, height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('QR Identities', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Text('1', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(color: AppColors.cardBorder, height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('Placement', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Text('Rear Screen', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(color: AppColors.cardBorder, height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('QR ID', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Text(controller.qrCodeId.value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(color: AppColors.cardBorder, height: 12),
                const Text('Redirects To', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                const SizedBox(height: 2),
                Row(
                  children: const [
                    Expanded(
                      child: Text(
                        'https://www.citymart.com/summer-sale',
                        style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 9, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.copy_rounded, color: AppColors.textSecondary, size: 10),
                  ],
                ),
              ],
            ),
          ),
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
            // Top bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 48), // Balance close button
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

            // Completed 6-step progress bar as shown in Image 3
            _buildSuccessStepper(),
            const SizedBox(height: 10),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 12),
                    // Confetti and Checkmark Container
                    Center(
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Dotted green circular border representing progress complete
                          Container(
                            width: 110,
                            height: 110,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF10B981).withOpacity(0.3),
                                width: 2,
                                style: BorderStyle.solid,
                              ),
                            ),
                          ),
                          // Glowing checkmark badge
                          Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: const Color(0xFF10B981).withOpacity(0.12),
                              border: Border.all(color: const Color(0xFF10B981), width: 2),
                            ),
                            child: const Center(
                              child: Icon(Icons.check_rounded, color: Color(0xFF10B981), size: 42),
                            ),
                          ),
                          // Scattered confetti shapes around
                          Positioned(
                            top: 10,
                            left: 10,
                            child: _buildConfettiShape(Colors.purpleAccent, 4),
                          ),
                          Positioned(
                            top: 20,
                            right: 15,
                            child: _buildConfettiShape(Colors.orangeAccent, 6),
                          ),
                          Positioned(
                            bottom: 15,
                            left: 20,
                            child: _buildConfettiShape(Colors.blueAccent, 5),
                          ),
                          Positioned(
                            bottom: 25,
                            right: 10,
                            child: _buildConfettiShape(Colors.pinkAccent, 4),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

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
                    const SizedBox(height: 28),

                    _buildSubmissionDetailsCard(),
                    const SizedBox(height: 20),

                    _buildNotifyBox(),
                    const SizedBox(height: 36),

                    // Action buttons matching Image 3 style
                    Container(
                      height: 54,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFF3B82F6),
                            Color(0xFF8B5CF6),
                            Color(0xFFEC4899),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withOpacity(0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: controller.onViewCampaigns,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text('View Campaigns', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 14),
                          ],
                        ),
                      ),

                    ),
                    const SizedBox(height: 16),

                    TextButton(
                      onPressed: controller.createAnother,
                      child: const Text(
                        'Create Another Campaign',
                        style: TextStyle(
                          color: Color(0xFF8B5CF6),
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                      ),
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

  Widget _buildConfettiShape(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildSuccessStepper() {
    final List<String> labels = [
      'Information',
      'Creative',
      'Fleet & Screens',
      'Schedule',
      'Budget',
      'Review & Submit'
    ];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          Row(
            children: List.generate(11, (index) {
              if (index % 2 == 1) {
                return Expanded(
                  child: Container(
                    height: 2,
                    color: const Color(0xFF6366F1),
                  ),
                );
              } else {
                return Container(
                  width: 20,
                  height: 20,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFF6366F1),
                  ),
                  child: const Center(
                    child: Icon(Icons.check, color: Colors.white, size: 9),
                  ),
                );
              }
            }),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (index) {
              return Text(
                labels[index],
                style: const TextStyle(
                  color: Color(0xFF8B5CF6),
                  fontSize: 7.0,
                  fontWeight: FontWeight.bold,
                ),
              );
            }),
          ),
        ],
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
      child: Obx(() {
        final step = controller.currentStep.value;
        return Row(
          children: [
            Expanded(
              child: Container(
                height: 54,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.4), width: 1.2),
                ),
                child: TextButton(
                  onPressed: controller.previousStep,
                  style: TextButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.arrow_back_rounded, color: Colors.white, size: 16),
                      SizedBox(width: 8),
                      Text('Back', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Container(
                height: 54,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF3B82F6),
                      Color(0xFF8B5CF6),
                      Color(0xFFEC4899),
                    ],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF8B5CF6).withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: controller.nextStep,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        step == 7
                            ? 'Submit'
                            : (step == 6 ? 'Continue' : 'Next'),
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      if (step == 7) ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.send_rounded, color: Colors.white, size: 14),
                      ] else ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 14),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      }),
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
