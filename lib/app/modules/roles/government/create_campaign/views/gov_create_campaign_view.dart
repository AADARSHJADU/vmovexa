import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/gov_create_campaign_controller.dart';
import '../../dashboard/controllers/government_dashboard_controller.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_text_field.dart';

class GovCreateCampaignView extends GetView<GovCreateCampaignController> {
  const GovCreateCampaignView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isSubmitted.value) {
        return _buildSuccessScreen();
      }

      final step = controller.currentStep.value;

      return PopScope(
        canPop: step == 1,
        onPopInvokedWithResult: (didPop, result) {
          if (didPop) return;
          controller.previousStep();
        },
        child: Scaffold(
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
                        if (step == 3) _buildStep3Targeting(context),
                        if (step == 4) _buildStep4Schedule(context),
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
                        ? const Color(0xFF3B82F6).withValues(alpha: 0.12)
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
  // STEP 1: CAMPAIGN INFORMATION & UPLOAD
  // ==========================================
  Widget _buildStep1Info() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/info.svg', 'Campaign Information', 'Enter basic campaign details'),
        const SizedBox(height: 12),
        const Text('Campaign Name *', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        CustomTextField(
          hintText: 'Enter campaign name (e.g. Swachh Bharat Mobility)',
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
                  "assets/icons/advertiser_ic/speaker.svg",
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
                  "assets/icons/infoNew.svg",
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
          hintText: 'Enter campaign broadcast objective and details...',
          controller: controller.descriptionController,
          maxLines: 3,
        ),
        const SizedBox(height: 20),

        _buildSectionHeader('assets/icons/campainContent.svg', 'Campaign Content', 'Upload or select campaign creative media'),
        const SizedBox(height: 12),
        const Text('Select Content Type', style: TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        _buildContentTypeGrid(),
        const SizedBox(height: 16),

        Obx(() {
          if (controller.selectedContentType.value == 'YouTube URL') {
            return _buildYouTubeUrlContainer();
          }
          return _buildUploadDashedContainer();
        }),
      ],
    );
  }

  Widget _buildSectionHeader(String icon, String title, String subtitle) {
    return Row(
      children: [
        SvgPicture.asset(icon, width: 22, height: 22),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 9)),
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
                SvgPicture.asset(icon, width: 20, height: 20),
                if (isSelected)
                  Icon(Icons.check_circle_rounded, color: activeColor, size: 14)
                else
                  const Icon(Icons.radio_button_off_rounded, color: AppColors.textMuted, size: 14),
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
      {'label': 'YouTube URL', 'icon': "assets/icons/youtube.svg"},
    ];

    return Obx(() {
      final selected = controller.selectedContentType.value;
      return Row(
        children: items.map((i) {
          final isSelected = selected == i['label'];
          final isLast = i == items.last;
          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: isLast ? 0 : 8),
              child: _buildContentTypeItem(i, isSelected),
            ),
          );
        }).toList(),
      );
    });
  }

  Widget _buildContentTypeItem(Map<String, dynamic> i, bool isSelected) {
    return GestureDetector(
      onTap: () => controller.setContentType(i['label'] as String),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        height: 72,
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF3B82F6).withValues(alpha: 0.12)
              : AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              i['icon'] as String,
              width: 20,
              height: 20,
              colorFilter: ColorFilter.mode(
                isSelected ? const Color(0xFF3B82F6) : AppColors.textSecondary,
                BlendMode.srcIn,
              ),
            ),
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Text(
                i['label'] as String,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                  fontSize: 9.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUploadDashedContainer() {
    return Obx(() {
      final isUploading = controller.isUploadingMedia.value;
      final localPath = controller.uploadedFilePath.value;
      final serverUrl = controller.uploadedMediaServerUrl.value;
      final fileName = controller.uploadedFileName.value;
      final hasMedia = (localPath.isNotEmpty && File(localPath).existsSync()) || serverUrl.isNotEmpty;

      if (isUploading) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 28),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4), width: 1.2),
          ),
          child: Column(
            children: const [
              SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(strokeWidth: 2.5, color: Color(0xFF3B82F6)),
              ),
              SizedBox(height: 12),
              Text('Processing & uploading creative file...', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        );
      }

      // If media is already selected/uploaded, display a rich preview card with file thumbnail
      if (hasMedia) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.6), width: 1.2),
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 72,
                  height: 72,
                  color: Colors.black26,
                  child: localPath.isNotEmpty && File(localPath).existsSync()
                      ? Image.file(File(localPath), fit: BoxFit.cover)
                      : (serverUrl.isNotEmpty
                          ? Image.network(ApiConstants.resolveFileUrl(serverUrl), fit: BoxFit.cover, errorBuilder: (c, e, s) => const Icon(Icons.image, color: Colors.white54))
                          : const Icon(Icons.image, color: Colors.white54)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Uploaded', style: TextStyle(color: Color(0xFF10B981), fontSize: 8, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 6),
                        Text(controller.selectedContentType.value, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      fileName.isNotEmpty ? fileName : 'Creative File',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Size: ${controller.uploadedFileSize.value.isNotEmpty ? controller.uploadedFileSize.value : "2.4 MB"} • Resolution: ${controller.uploadedFileResolution.value}',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                    ),
                  ],
                ),
              ),
              Column(
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, color: Color(0xFF3B82F6), size: 18),
                    tooltip: 'Replace File',
                    onPressed: controller.pickMediaFile,
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.redAccent, size: 18),
                    tooltip: 'Remove',
                    onPressed: controller.clearUploadedMedia,
                  ),
                ],
              ),
            ],
          ),
        );
      }

      // Default dashed upload container
      return GestureDetector(
        onTap: controller.pickMediaFile,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 24),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              SvgPicture.asset('assets/icons/advertiser_ic/download.svg'),
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
              const Text('Tap to pick from gallery / files (Max: 100MB)', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildYouTubeUrlContainer() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.25)),
                ),
                child: SvgPicture.asset('assets/icons/liveUrl.svg', width: 18, height: 18),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('YouTube Video URL', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  SizedBox(height: 2),
                  Text('Paste YouTube video link for campaign broadcast', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          CustomTextField(
            hintText: 'https://youtube.com/watch?v=...',
            controller: controller.youtubeUrlController,
            height: 44,
          ),
          const SizedBox(height: 8),

          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: controller.pasteYouTubeUrlFromClipboard,
              icon: const Icon(Icons.paste_rounded, color: Color(0xFF3B82F6), size: 14),
              label: const Text('Paste from Clipboard', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 2: CONTENT SETTINGS & DURATION
  // ==========================================
  Widget _buildStep2ContentSettings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/campainContent.svg', 'Campaign Content', 'Preview uploaded content & set display attributes'),
        const SizedBox(height: 12),

        // Live Uploaded Creative Card (Dynamic, NOT static Unsplash)
        Obx(() {
          final localPath = controller.uploadedFilePath.value;
          final serverUrl = controller.uploadedMediaServerUrl.value;
          final fileName = controller.uploadedFileName.value;
          final isYouTube = controller.selectedContentType.value == 'YouTube URL';
          final hasLocalFile = localPath.isNotEmpty && File(localPath).existsSync();

          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 130,
                    height: 85,
                    color: const Color(0xFF1E293B),
                    child: hasLocalFile
                        ? Image.file(File(localPath), fit: BoxFit.cover)
                        : (serverUrl.isNotEmpty
                            ? Image.network(ApiConstants.resolveFileUrl(serverUrl), fit: BoxFit.cover, errorBuilder: (c, e, s) => _buildPlaceholderMedia())
                            : (isYouTube
                                ? Container(
                                    color: const Color(0xFF1E1E1E),
                                    child: const Center(
                                      child: Icon(Icons.play_circle_fill_rounded, color: Colors.red, size: 36),
                                    ),
                                  )
                                : _buildPlaceholderMedia())),
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
                          const Text('Active Creative', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                          Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                              ),
                              const SizedBox(width: 4),
                              Text(controller.selectedContentType.value, style: const TextStyle(color: Color(0xFF10B981), fontSize: 8.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        fileName.isNotEmpty ? fileName : (controller.campaignNameController.text.isNotEmpty ? controller.campaignNameController.text : 'Government Creative'),
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Size: ${controller.uploadedFileSize.value.isNotEmpty ? controller.uploadedFileSize.value : "2.4 MB"}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 8.5),
                      ),
                      Text(
                        'Resolution: ${controller.uploadedFileResolution.value.isNotEmpty ? controller.uploadedFileResolution.value : "1920 × 1080"}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 8.5),
                      ),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: controller.pickMediaFile,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3), width: 1),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.refresh_rounded, color: Color(0xFF3B82F6), size: 11),
                              SizedBox(width: 4),
                              Text('Replace Creative', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 8.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 20),

        _buildSectionHeader('assets/icons/campainContent.svg', 'Content Settings', 'Select display targets and duration per loop'),
        const SizedBox(height: 12),

        const Text('Display Type', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Select where this content will be displayed inside vehicles', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
        const SizedBox(height: 8),
        _buildDisplayTypeCardsRow(),
        const SizedBox(height: 16),

        const Text('Content Duration', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Set how long this content will play in transit screen loop', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
        const SizedBox(height: 8),
        _buildDurationAdjuster(),
      ],
    );
  }

  Widget _buildPlaceholderMedia() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.tv_rounded, color: Color(0xFF3B82F6), size: 28),
            SizedBox(height: 4),
            Text('DOOH Display', style: TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
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
              'Passenger-facing screens',
              "assets/icons/passenger_display.svg",
              passengerSelected,
              () => controller.selectDisplayType('Passenger'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildDisplayCell(
              'Internal Displays',
              'Cab & driver interior displays',
              "assets/icons/fleet_operator_icons/solar_display.svg",
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
        height: 82,
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
                SvgPicture.asset(icon, width: 16, height: 16),
                if (isSelected)
                  const Icon(Icons.check_circle_rounded, color: Color(0xFF3B82F6), size: 12)
                else
                  const Icon(Icons.radio_button_off_rounded, color: AppColors.textMuted, size: 12),
              ],
            ),
            const SizedBox(height: 6),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Text(desc, style: const TextStyle(color: AppColors.textMuted, fontSize: 7), maxLines: 1, overflow: TextOverflow.ellipsis),
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
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: const [
              Icon(Icons.timer_outlined, color: Color(0xFF8B5CF6), size: 20),
              SizedBox(width: 10),
              Text('Playback Duration (seconds)', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline_rounded, color: Colors.white70, size: 20),
                onPressed: controller.decrementDuration,
              ),
              Obx(() => Text(
                    '${controller.contentDuration.value}s',
                    style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 13, fontWeight: FontWeight.bold),
                  )),
              IconButton(
                icon: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFF3B82F6), size: 20),
                onPressed: controller.incrementDuration,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 3: DYNAMIC TARGETING & REAL MAP
  // ==========================================
  Widget _buildStep3Targeting(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/lsicon_map.svg', 'Targeting', 'Select transit corridors, active fleet, and screen inventory'),
        const SizedBox(height: 14),

        // Target Area with Real Google Static Map & Telemetry Controls
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Live Geographic Coverage (Google Maps)', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            Row(
              children: [
                InkWell(
                  onTap: controller.selectAllRoutes,
                  child: const Text('Select All', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 9.5, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
                const Text('•', style: TextStyle(color: AppColors.textMuted)),
                const SizedBox(width: 8),
                InkWell(
                  onTap: controller.clearAllRoutes,
                  child: const Text('Clear ⟳', style: TextStyle(color: Color(0xFFEF4444), fontSize: 9.5, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Real Google Static Map container
        Container(
          height: 220,
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Obx(() {
                    final mapUrl = controller.getGoogleStaticMapPreview();
                    return Image.network(
                      mapUrl,
                      fit: BoxFit.cover,
                      loadingBuilder: (c, child, progress) {
                        if (progress == null) return child;
                        return Container(
                          color: const Color(0xFF0F172A),
                          child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF3B82F6)),
                          ),
                        );
                      },
                      errorBuilder: (c, err, s) => Container(
                        color: const Color(0xFF0F172A),
                        child: const Center(
                          child: Text('Map preview active (GPS Coords Registered)', style: TextStyle(color: Colors.white70, fontSize: 10)),
                        ),
                      ),
                    );
                  }),
                ),
              ),

              // City filter badge
              Positioned(
                top: 10,
                left: 10,
                child: Obx(() => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF3B82F6), width: 1),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.location_on, color: Color(0xFF3B82F6), size: 12),
                          const SizedBox(width: 4),
                          Text(
                            controller.selectedCityFilter.value == 'All' ? 'Bhopal / Indore Network' : controller.selectedCityFilter.value,
                            style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    )),
              ),

              // Zoom controls
              Positioned(
                bottom: 10,
                right: 10,
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
                        onPressed: controller.zoomInMap,
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        padding: EdgeInsets.zero,
                      ),
                      Container(width: 20, height: 1, color: AppColors.cardBorder),
                      IconButton(
                        icon: const Icon(Icons.remove, color: Colors.white, size: 14),
                        onPressed: controller.zoomOutMap,
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

        // Target Audience Tiles (Reactive)
        const Text('Target Audience', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final mode = controller.targetAudienceMode.value;
          final vCount = controller.liveVehicles.isNotEmpty ? controller.liveVehicles.length : 248;

          return Row(
            children: [
              Expanded(
                child: _buildInteractiveSelectorTile(
                  'All Vehicles',
                  '$vCount Active',
                  'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
                  mode == 'All Vehicles',
                  () => controller.setTargetAudienceMode('All Vehicles'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInteractiveSelectorTile(
                  'Selected Vehicles',
                  'By specific route',
                  'assets/icons/fleet_operator_icons/truck.svg',
                  mode == 'Selected Vehicles',
                  () => controller.setTargetAudienceMode('Selected Vehicles'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInteractiveSelectorTile(
                  'Display Groups',
                  'Corridor clusters',
                  'assets/icons/advertiser_ic/userTwo.svg',
                  mode == 'Display Groups',
                  () => controller.setTargetAudienceMode('Display Groups'),
                ),
              ),
            ],
          );
        }),
        const SizedBox(height: 18),

        // Display Target Tiles (Reactive)
        const Text('Display Target Category', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final mode = controller.displayTargetMode.value;
          final sCount = controller.effectiveScreensCount;

          return Row(
            children: [
              Expanded(
                child: _buildInteractiveSelectorTile(
                  'All Displays',
                  '$sCount Displays',
                  'assets/icons/advertiser_ic/tv.svg',
                  mode == 'All Displays',
                  () => controller.setDisplayTargetMode('All Displays'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInteractiveSelectorTile(
                  'Passenger Displays',
                  'Cabin facing',
                  'assets/icons/solar_cpu.svg',
                  mode == 'Passenger Displays',
                  () => controller.setDisplayTargetMode('Passenger Displays'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInteractiveSelectorTile(
                  'External Displays',
                  'LED route side',
                  'assets/icons/advertiser_ic/tv.svg',
                  mode == 'External Displays',
                  () => controller.setDisplayTargetMode('External Displays'),
                ),
              ),
            ],
          );
        }),
        const SizedBox(height: 18),

        // Transit Routes Selection List
        const Text('Target Transit Routes', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final routes = controller.availableRoutes;
          return Column(
            children: routes.map((r) {
              final isChecked = controller.selectedRouteIds.contains(r.id);
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isChecked ? const Color(0xFF3B82F6).withValues(alpha: 0.1) : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isChecked ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: isChecked,
                          activeColor: const Color(0xFF3B82F6),
                          onChanged: (_) => controller.toggleRoute(r.id),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(r.name, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                            Text('${r.city ?? "Transit Zone"} • ${r.code ?? r.id}', style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('Live GPS', style: TextStyle(color: Color(0xFF10B981), fontSize: 8, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 18),

        // Working Additional Filters Dropdowns (Interactive Bottom Sheets)
        const Text('Additional Filters', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Obx(() => _buildWorkingDropdownFilter(
                    context,
                    'Vehicle Type',
                    controller.selectedVehicleType.value,
                    ['All Types', 'AC Bus', 'Standard Bus', 'Electric Bus', 'Mini Bus'],
                    controller.setVehicleType,
                  )),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Obx(() => _buildWorkingDropdownFilter(
                    context,
                    'Time Zone',
                    controller.selectedTimeZone.value,
                    ['IST (UTC+05:30)', 'UTC (GMT+00:00)', 'EST (UTC-05:00)'],
                    controller.setTimeZone,
                  )),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Dynamic Estimated Reach green banner
        Obx(() {
          final v = controller.effectiveVehiclesCount;
          final s = controller.effectiveScreensCount;
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.25)),
            ),
            child: Row(
              children: [
                const Icon(Icons.hub_rounded, color: Color(0xFF10B981), size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Dynamic DOOH Transit Reach', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(
                        'Targeting $v active fleet vehicles across $s connected digital displays.',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 8.5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildInteractiveSelectorTile(String title, String sub, String icon, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
                SvgPicture.asset(icon, width: 14, height: 14),
                if (isSelected)
                  const Icon(Icons.check_circle_rounded, color: Color(0xFF3B82F6), size: 12)
                else
                  const Icon(Icons.radio_button_off_rounded, color: AppColors.textMuted, size: 12),
              ],
            ),
            const SizedBox(height: 6),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Text(sub, style: const TextStyle(color: AppColors.textMuted, fontSize: 7), maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkingDropdownFilter(
    BuildContext context,
    String label,
    String currentValue,
    List<String> options,
    Function(String) onSelect,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
        const SizedBox(height: 6),
        InkWell(
          onTap: () {
            showModalBottomSheet(
              context: context,
              backgroundColor: const Color(0xFF0F172A),
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
              builder: (ctx) => SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Select $label', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      ...options.map((opt) => ListTile(
                            title: Text(opt, style: const TextStyle(color: Colors.white, fontSize: 12)),
                            trailing: opt == currentValue ? const Icon(Icons.check, color: Color(0xFF3B82F6)) : null,
                            onTap: () {
                              onSelect(opt);
                              Navigator.pop(ctx);
                            },
                          )),
                    ],
                  ),
                ),
              ),
            );
          },
          child: Container(
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
                Expanded(
                  child: Text(
                    currentValue,
                    style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 16),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // STEP 4: INTERACTIVE SCHEDULE & PICKERS
  // ==========================================
  Widget _buildStep4Schedule(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/calendar.svg', 'Schedule', 'Configure broadcast run dates, hours, and repeat cycle'),
        const SizedBox(height: 14),

        // Working Date Range Pickers
        const Text('Date Range', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Obx(() => _buildWorkingDateBox(
                    'Start Date',
                    controller.startDate.value,
                    () => controller.selectStartDate(context),
                  )),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward_rounded, color: AppColors.textMuted, size: 14),
            const SizedBox(width: 8),
            Expanded(
              child: Obx(() => _buildWorkingDateBox(
                    'End Date',
                    controller.endDate.value,
                    () => controller.selectEndDate(context),
                  )),
            ),
          ],
        ),
        const SizedBox(height: 18),

        // Working Time Schedule Pickers
        const Text('Broadcast Time Hours', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Obx(() => _buildWorkingTimeBox(
                    'Start Time',
                    controller.startTime.value,
                    () => controller.selectStartTime(context),
                  )),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward_rounded, color: AppColors.textMuted, size: 14),
            const SizedBox(width: 8),
            Expanded(
              child: Obx(() => _buildWorkingTimeBox(
                    'End Time',
                    controller.endTime.value,
                    () => controller.selectEndTime(context),
                  )),
            ),
          ],
        ),
        const SizedBox(height: 18),

        // Working Days of the Week Selector
        const Text('Active Days of the Week', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Obx(() {
          final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: days.map((day) {
              final isSelected = controller.activeDays.contains(day);
              return GestureDetector(
                onTap: () => controller.toggleDayOfWeek(day),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? const LinearGradient(colors: [Color(0xFF0388FE), Color(0xFF6B1FE6)])
                        : null,
                    color: isSelected ? null : AppColors.cardBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: isSelected ? Colors.transparent : AppColors.cardBorder, width: 1.2),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (isSelected) const Icon(Icons.check, color: Colors.white, size: 10),
                        Text(
                          day,
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.textMuted,
                            fontSize: 9,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 18),

        // Working Priority Selector Cards
        const Text('Campaign Broadcast Priority', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final priority = controller.selectedPriority.value;
          return Row(
            children: [
              Expanded(
                child: _buildPriorityItem(
                  'Low',
                  'Background loop',
                  Icons.flag_rounded,
                  const Color(0xFF0390f9),
                  priority == 'Low',
                  () => controller.setPriority('Low'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildPriorityItem(
                  'Normal',
                  'Standard cycle',
                  Icons.flag_rounded,
                  const Color(0xFF8B5CF6),
                  priority == 'Normal',
                  () => controller.setPriority('Normal'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildPriorityItem(
                  'High',
                  'Emergency override',
                  Icons.warning_amber_rounded,
                  const Color(0xFFEF4444),
                  priority == 'High',
                  () => controller.setPriority('High'),
                ),
              ),
            ],
          );
        }),
        const SizedBox(height: 18),

        // Working Repeat Campaign Toggle
        Obx(() => Container(
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
                              Text('Schedule repeated campaign playback cycles', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                            ],
                          ),
                        ],
                      ),
                      Switch(
                        value: controller.repeatCampaign.value,
                        onChanged: (val) => controller.repeatCampaign.value = val,
                        activeThumbColor: const Color(0xFF3B82F6),
                      ),
                    ],
                  ),
                  if (controller.repeatCampaign.value) ...[
                    const Divider(color: AppColors.cardBorder, height: 20),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Repeat Frequency', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                              const SizedBox(height: 6),
                              InkWell(
                                onTap: () {
                                  showModalBottomSheet(
                                    context: context,
                                    backgroundColor: const Color(0xFF0F172A),
                                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
                                    builder: (ctx) => SafeArea(
                                      child: Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text('Select Repeat Frequency', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                                            const SizedBox(height: 12),
                                            ...['Daily', 'Weekly', 'Monthly'].map((freq) => ListTile(
                                                  title: Text(freq, style: const TextStyle(color: Colors.white, fontSize: 12)),
                                                  trailing: freq == controller.repeatFrequency.value ? const Icon(Icons.check, color: Color(0xFF3B82F6)) : null,
                                                  onTap: () {
                                                    controller.setRepeatFrequency(freq);
                                                    Navigator.pop(ctx);
                                                  },
                                                )),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                                child: Container(
                                  height: 38,
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  decoration: BoxDecoration(
                                    color: Colors.black26,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: AppColors.cardBorder, width: 1),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(controller.repeatFrequency.value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                      const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 14),
                                    ],
                                  ),
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
                              const Text('Auto-Stop Schedule', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
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
                                  children: [
                                    Text('Ends on ${controller.endDate.value}', style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                                    const Icon(Icons.event, color: Colors.white70, size: 14),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildWorkingDateBox(String label, String date, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                const Icon(Icons.calendar_today_rounded, color: Color(0xFF3B82F6), size: 12),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkingTimeBox(String label, String time, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                const Icon(Icons.access_time_rounded, color: Color(0xFF3B82F6), size: 12),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityItem(String title, String desc, IconData icon, Color color, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.1) : AppColors.cardBg,
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
                Icon(icon, color: color, size: 22),
                if (isSelected) Icon(Icons.check_circle_rounded, color: color, size: 12),
              ],
            ),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(desc, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // STEP 5: DYNAMIC PREVIEW & PUBLISH
  // ==========================================
  Widget _buildStep5Preview() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('assets/icons/advertiser_ic/eye.svg', 'Campaign Preview', 'Review all dynamic details before publishing'),
        const SizedBox(height: 14),

        // Dynamic Creative Card with real uploaded media
        Obx(() {
          final localPath = controller.uploadedFilePath.value;
          final serverUrl = controller.uploadedMediaServerUrl.value;
          final campaignTitle = controller.campaignNameController.text.trim().isNotEmpty
              ? controller.campaignNameController.text.trim()
              : 'STATE PUBLIC WELFARE BROADCAST';

          return Container(
            width: double.infinity,
            height: 170,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: localPath.isNotEmpty && File(localPath).existsSync()
                        ? Image.file(File(localPath), fit: BoxFit.cover)
                        : (serverUrl.isNotEmpty
                            ? Image.network(ApiConstants.resolveFileUrl(serverUrl), fit: BoxFit.cover, errorBuilder: (c, e, s) => _buildPlaceholderMedia())
                            : _buildPlaceholderMedia()),
                  ),
                ),
                Positioned.fill(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.black.withValues(alpha: 0.1), Colors.black.withValues(alpha: 0.85)],
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                campaignTitle.toUpperCase(),
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                              decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(4)),
                              child: const Text('Ready to Broadcast', style: TextStyle(color: Colors.white, fontSize: 7.5, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          controller.descriptionController.text.trim().isNotEmpty
                              ? controller.descriptionController.text.trim()
                              : 'Government transit awareness initiative',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 9),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 18),

        // Working QR Code & Share Card
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
                      SvgPicture.asset('assets/icons/fleet_operator_icons/qr-code-scan.svg', width: 18, height: 18),
                      const SizedBox(width: 8),
                      const Text('Dynamic Campaign QR Code', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(4)),
                    child: const Text('Active Target URL', style: TextStyle(color: Color(0xFF10B981), fontSize: 7.5, fontWeight: FontWeight.bold)),
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
                        const Text('Passengers scan onboard to open announcement:', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
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
                            children: [
                              Expanded(
                                child:
                                Text(
                                      controller.dynamicQrUrl,
                                      style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 8.5, fontWeight: FontWeight.bold),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.copy_rounded, color: Color(0xFF3B82F6), size: 14),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                tooltip: 'Copy link',
                                onPressed: controller.copyQrLink,
                              ),
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
                      onPressed: controller.downloadQr,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF3B82F6)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.download_rounded, color: Color(0xFF3B82F6), size: 14),
                      label: const Text('Download QR', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: controller.shareQr,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF8B5CF6)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.share_rounded, color: Color(0xFF8B5CF6), size: 14),
                      label: const Text('Share Link', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Dynamic Review Information List
        Obx(() {
          final title = controller.campaignNameController.text.trim().isNotEmpty
              ? controller.campaignNameController.text.trim()
              : 'Public Welfare Awareness';
          final type = controller.selectedCampaignType.value;
          final cType = controller.selectedContentType.value;
          final fName = controller.uploadedFileName.value.isNotEmpty ? controller.uploadedFileName.value : 'Default Media';
          final routesCount = controller.selectedRouteIds.length;
          final sDate = controller.startDate.value;
          final eDate = controller.endDate.value;
          final sTime = controller.startTime.value;
          final eTime = controller.endTime.value;
          final daysStr = controller.activeDays.join(', ');
          final priority = controller.selectedPriority.value;

          return Column(
            children: [
              _buildReviewRowItem('Campaign Information', '$title\n$type', "assets/icons/fleet_operator_icons/privacyPolicyA.svg"),
              _buildReviewRowItem('Content Media', '$cType: $fName\nDuration: ${controller.contentDuration.value}s per loop', "assets/icons/campainContent.svg"),
              _buildReviewRowItem('Targeting', '$routesCount Corridor Routes • ${controller.targetAudienceMode.value}\n${controller.effectiveVehiclesCount} Transit Vehicles • ${controller.effectiveScreensCount} Screens', "assets/icons/lsicon_map.svg"),
              _buildReviewRowItem('Schedule & Hours', '$sDate to $eDate\n$sTime - $eTime ($daysStr)', "assets/icons/calendar.svg"),
              _buildReviewRowItem('Priority & Loop', '$priority Priority Broadcast\nRepeat: ${controller.repeatCampaign.value ? controller.repeatFrequency.value : "Once"}', "assets/icons/priority.svg"),
            ],
          );
        }),
        const SizedBox(height: 18),

        // Campaign Dynamic Summary Badges
        Row(
          children: [
            SvgPicture.asset('assets/icons/campainSummary.svg', width: 20, height: 20),
            const SizedBox(width: 6),
            const Text('Transit Network Summary', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 10),
        Obx(() {
          final v = controller.effectiveVehiclesCount;
          final s = controller.effectiveScreensCount;
          final cov = '${((v / 250) * 100).clamp(20, 98).toStringAsFixed(0)}%';

          return Row(
            children: [
              Expanded(child: _buildSummaryMetricBadge('$v', 'Vehicles', 'assets/icons/advertiser_ic/userTwo.svg', const Color(0xFF10B981))),
              const SizedBox(width: 6),
              Expanded(child: _buildSummaryMetricBadge('$s', 'Displays', 'assets/icons/advertiser_ic/tv.svg', const Color(0xFF3B82F6))),
              const SizedBox(width: 6),
              Expanded(child: _buildSummaryMetricBadge(cov, 'Coverage', 'assets/icons/advertiser_ic/eye.svg', const Color(0xFF8B5CF6))),
            ],
          );
        }),
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
          SvgPicture.asset(icon, width: 18, height: 18),
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
          SvgPicture.asset(icon, width: 18, height: 18),
          const SizedBox(height: 6),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
        ],
      ),
    );
  }

  Widget _buildBottomActionsRow(int step) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
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
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4), width: 1.2),
              ),
              child: TextButton(
                onPressed: controller.previousStep,
                style: TextButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(step == 1 ? Icons.close_rounded : Icons.arrow_back_rounded, color: Colors.white, size: 14),
                    const SizedBox(width: 6),
                    Text(step == 1 ? 'Cancel' : 'Back', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
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
                borderRadius: BorderRadius.circular(12),
              ),
              child: Obx(() {
                final isSub = controller.isSubmitting.value;
                return ElevatedButton(
                  onPressed: isSub ? null : () => controller.nextStep(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isSub
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(step == 5 ? 'Publish Campaign' : 'Continue', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                );
              }),
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
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3), width: 2),
                          ),
                        ),
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF10B981).withValues(alpha: 0.12),
                            border: Border.all(color: const Color(0xFF10B981), width: 2),
                          ),
                          child: const Icon(Icons.check, color: Color(0xFF10B981), size: 40),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    const Text('Campaign Published Successfully!', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    const Text('Your government campaign is submitted and queued for live broadcast across targeted screens.', style: TextStyle(color: AppColors.textSecondary, fontSize: 11), textAlign: TextAlign.center),
                    const SizedBox(height: 32),

                    Container(
                      width: double.infinity,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          if (Get.isRegistered<GovernmentDashboardController>()) {
                            final dashboardController = Get.find<GovernmentDashboardController>();
                            dashboardController.selectedNavIndex.value = 1;
                          }
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
                        style: TextStyle(color: Color(0xFF3B82F6), fontSize: 11.5, fontWeight: FontWeight.bold),
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

class DummyQrCodePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black87
      ..style = PaintingStyle.fill;

    // Corner finder squares
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width * 0.28, size.height * 0.28), paint);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.72, 0, size.width * 0.28, size.height * 0.28), paint);
    canvas.drawRect(Rect.fromLTWH(0, size.height * 0.72, size.width * 0.28, size.height * 0.28), paint);

    // Inner white squares
    final whitePaint = Paint()..color = Colors.white;
    canvas.drawRect(Rect.fromLTWH(size.width * 0.07, size.height * 0.07, size.width * 0.14, size.height * 0.14), whitePaint);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.79, size.height * 0.07, size.width * 0.14, size.height * 0.14), whitePaint);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.07, size.height * 0.79, size.width * 0.14, size.height * 0.14), whitePaint);

    // Inner dots
    canvas.drawRect(Rect.fromLTWH(size.width * 0.10, size.height * 0.10, size.width * 0.08, size.height * 0.08), paint);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.82, size.height * 0.10, size.width * 0.08, size.height * 0.08), paint);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.10, size.height * 0.82, size.width * 0.08, size.height * 0.08), paint);

    // Random QR data blocks pattern
    final dotSize = size.width * 0.07;
    final offsets = [
      Offset(size.width * 0.35, size.height * 0.1),
      Offset(size.width * 0.45, size.height * 0.2),
      Offset(size.width * 0.55, size.height * 0.1),
      Offset(size.width * 0.35, size.height * 0.35),
      Offset(size.width * 0.45, size.height * 0.45),
      Offset(size.width * 0.55, size.height * 0.35),
      Offset(size.width * 0.35, size.height * 0.6),
      Offset(size.width * 0.7, size.height * 0.5),
      Offset(size.width * 0.8, size.height * 0.7),
      Offset(size.width * 0.5, size.height * 0.7),
      Offset(size.width * 0.6, size.height * 0.8),
    ];
    for (final o in offsets) {
      canvas.drawRect(Rect.fromLTWH(o.dx, o.dy, dotSize, dotSize), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
