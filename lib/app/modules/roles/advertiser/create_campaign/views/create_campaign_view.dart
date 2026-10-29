import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../../../../../widgets/custom_button.dart';
import '../controllers/create_campaign_controller.dart';
import '../widgets/client_address_map_picker.dart';

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
              _buildTopBar(),

              // Stepper Progress Bar (6 Steps)
              _buildStepperProgress(),
              const SizedBox(height: 8),

              // Step Content Area
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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

              // Bottom Navigation & Submit Actions Bar
              _buildBottomActionBar(),
            ],
          ),
        ),
      );
    });
  }

  // ==========================================================
  // TOP APP BAR
  // ==========================================================
  Widget _buildTopBar() {
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
              Obx(() => Text(
                controller.isEditMode.value ? 'Edit Campaign' : 'Create Campaign',
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              )),
              Obx(() => Text(
                    'Step ${controller.currentStep.value} of ${controller.totalSteps}: ${controller.stepLabels[controller.currentStep.value - 1]}',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                  )),
            ],
          ),
          TextButton(
            onPressed: controller.saveDraft,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.save_as_outlined, color: Color(0xFF8B5CF6), size: 16),
                SizedBox(width: 4),
                Text('Draft', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // STEPPER PROGRESS (6 Steps matching Admin Panel)
  // ==========================================================
  Widget _buildStepperProgress() {
    return Obx(() {
      final current = controller.currentStep.value;
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          children: [
            Row(
              children: List.generate(controller.totalSteps, (index) {
                final stepNum = index + 1;
                final isCompleted = stepNum < current;
                final isCurrent = stepNum == current;

                return Expanded(
                  child: Row(
                    children: [
                      // Step Circle
                      GestureDetector(
                        onTap: () => controller.goToStep(stepNum),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: (isCompleted || isCurrent) ? AppTheme.primaryGradient : null,
                            color: (isCompleted || isCurrent) ? null : const Color(0xFF1E293B),
                            border: Border.all(
                              color: isCurrent ? Colors.white : (isCompleted ? Colors.transparent : AppColors.cardBorder),
                              width: 1.5,
                            ),
                          ),
                          child: Center(
                            child: isCompleted
                                ? const Icon(Icons.check, color: Colors.white, size: 13)
                                : Text(
                                    '$stepNum',
                                    style: TextStyle(
                                      color: isCurrent ? Colors.white : AppColors.textMuted,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                      // Connecting Line (except after last step)
                      if (index < controller.totalSteps - 1)
                        Expanded(
                          child: Container(
                            height: 2.5,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            decoration: BoxDecoration(
                              gradient: isCompleted ? AppTheme.primaryGradient : null,
                              color: isCompleted ? null : const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              }),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${((current - 1) / (controller.totalSteps - 1) * 100).round()}% Completed',
                  style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
                Text(
                  controller.stepLabels[current - 1],
                  style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  // ==========================================================
  // CURRENT STEP BODY SELECTOR
  // ==========================================================
  Widget _buildCurrentStepBody() {
    switch (controller.currentStep.value) {
      case 1:
        return _buildStep1Info();
      case 2:
        return _buildStep2Creative();
      case 3:
        return _buildStep3RoutesAndScreens();
      case 4:
        return _buildStep4Schedule();
      case 5:
        return _buildStep5BudgetAndQr();
      case 6:
        return _buildStep6ReviewSubmit();
      default:
        return _buildStep1Info();
    }
  }

  // ==========================================================
  // STEP 1: CAMPAIGN INFO & CUSTOMER DETAILS
  // ==========================================================
  Widget _buildStep1Info() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          'Campaign Information',
          'Provide essential metadata and classification for your transit ad campaign.',
        ),
        const SizedBox(height: 14),

        // Campaign Name
        _buildInputField(
          label: 'Campaign Name *',
          controller: controller.nameController,
          hint: 'e.g. Summer Special Promotion 2026',
        ),
        const SizedBox(height: 12),

        // Brand Name
        _buildInputField(
          label: 'Brand / Company Name *',
          controller: controller.brandNameController,
          hint: 'e.g. Acme Corp / Your Brand Name',
        ),
        const SizedBox(height: 14),

        // Campaign Type Tiles
        const Text(
          'Campaign Type',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Obx(() {
          return GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 2.8,
            children: controller.campaignTypes.map((type) {
              final isSelected = controller.selectedCampaignType.value == type;
              return GestureDetector(
                onTap: () => controller.selectedCampaignType.value = type,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : AppColors.cardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : AppColors.cardBorder,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    type,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 14),

        // Description
        _buildInputField(
          label: 'Campaign Description',
          controller: controller.descriptionController,
          hint: 'Describe your target commuters, key messaging, and campaign objectives...',
          maxLines: 3,
        ),
        const SizedBox(height: 12),

        // Objective & Category Row
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Objective *', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Obx(() => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: controller.selectedObjective.value,
                            isExpanded: true,
                            dropdownColor: const Color(0xFF1E293B),
                            style: const TextStyle(color: Colors.white, fontSize: 11),
                            items: controller.objectives.map((o) => DropdownMenuItem(value: o, child: Text(o, maxLines: 1, overflow: TextOverflow.ellipsis))).toList(),
                            onChanged: (v) => controller.selectedObjective.value = v ?? 'Increase Brand Awareness',
                          ),
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Category *', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Obx(() => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: controller.selectedCategory.value,
                            isExpanded: true,
                            dropdownColor: const Color(0xFF1E293B),
                            style: const TextStyle(color: Colors.white, fontSize: 11),
                            items: controller.categories.map((c) => DropdownMenuItem(value: c, child: Text(c, maxLines: 1, overflow: TextOverflow.ellipsis))).toList(),
                            onChanged: (v) => controller.selectedCategory.value = v ?? 'Retail',
                          ),
                        ),
                      )),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // ==========================================================
        // CUSTOMER / CLIENT DETAILS SECTION
        // ==========================================================
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF2563EB).withValues(alpha: 0.4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.person_rounded, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Customer / Client Details',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'SMS & Email link and official invoice recipient',
                          style: TextStyle(color: Color(0xFF93C5FD), fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              _buildInputField(
                label: 'Customer Contact Name *',
                controller: controller.clientNameController,
                hint: 'e.g. Rajesh Sharma / Business Owner',
              ),
              const SizedBox(height: 10),

              _buildInputField(
                label: 'Customer Company / Brand Name',
                controller: controller.clientCompanyController,
                hint: 'e.g. Sharma Traders Pvt Ltd',
              ),
              const SizedBox(height: 10),

              _buildInputField(
                label: 'Customer Mobile Number * (SMS Payment Link)',
                controller: controller.clientPhoneController,
                hint: 'e.g. +91 98765 43210',
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 10),

              _buildInputField(
                label: 'Customer Email Address * (GST Invoice Link)',
                controller: controller.clientEmailController,
                hint: 'e.g. rajesh@sharmatraders.in',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 14),

              // Interactive Google Maps Geocoding & Address Picker
              ClientAddressMapPicker(
                searchController: controller.clientSearchController,
                addressController: controller.clientAddressController,
                cityController: controller.clientCityController,
                stateController: controller.clientStateController,
                pincodeController: controller.clientPincodeController,
                initialLat: controller.clientLatitude.value,
                initialLng: controller.clientLongitude.value,
                onLocationChanged: (lat, lng, address, city, state, pincode) {
                  controller.updateClientLocation(lat, lng, address, city, state, pincode);
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // STEP 2: CREATIVE ASSETS & VIDEO URL
  // ==========================================================
  Widget _buildStep2Creative() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          'Upload Creative Assets or Video URL',
          'Attach images, videos, or provide online streaming YouTube links.',
        ),
        const SizedBox(height: 14),

        // Creative Type Selector Pills
        Obx(() {
          final types = [
            {'type': 'All', 'label': 'All Creatives', 'icon': Icons.folder_open_rounded},
            {'type': 'Image', 'label': 'Image', 'icon': Icons.image_rounded},
            {'type': 'Video', 'label': 'Video', 'icon': Icons.videocam_rounded},
            {'type': 'URL', 'label': 'YouTube / URL', 'icon': Icons.link_rounded},
          ];

          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: types.map((item) {
                final type = item['type'] as String;
                final label = item['label'] as String;
                final icon = item['icon'] as IconData;
                final isSelected = controller.selectedCreativeType.value == type;

                return GestureDetector(
                  onTap: () => controller.selectedCreativeType.value = type,
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: isSelected ? AppTheme.primaryGradient : null,
                      color: isSelected ? null : AppColors.cardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isSelected ? Colors.transparent : AppColors.cardBorder),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(icon, color: isSelected ? Colors.white : AppColors.textMuted, size: 14),
                        const SizedBox(width: 6),
                        Text(label, style: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          );
        }),
        const SizedBox(height: 16),

        // Video URL Input (If URL is selected or available)
        Obx(() {
          if (controller.selectedCreativeType.value == 'URL') {
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(color: const Color(0xFFDC2626), borderRadius: BorderRadius.circular(8)),
                        child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 16),
                      ),
                      const SizedBox(width: 8),
                      const Text('YouTube / Web Video URL', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      const Spacer(),
                      if (controller.detectedYtId.value.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                          child: Text('Detected (${controller.detectedYtId.value})', style: const TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: controller.videoUrlController,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'https://www.youtube.com/watch?v=... or https://youtu.be/...',
                      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF8B5CF6))),
                    ),
                  ),
                  if (controller.ytThumbnailUrl.value.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        controller.ytThumbnailUrl.value,
                        height: 120,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  CustomButton(
                    text: '+ Add to Creatives List',
                    height: 42,
                    isGradient: true,
                    onTap: controller.addVideoUrlToCreatives,
                  ),
                ],
              ),
            );
          }

          // File Upload Box for Image or Video
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, style: BorderStyle.solid),
            ),
            child: Column(
              children: [
                const Icon(Icons.cloud_upload_outlined, color: Color(0xFF8B5CF6), size: 40),
                const SizedBox(height: 10),
                const Text(
                  'Browse Creative Media from Device',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Supports MP4, MOV, JPG, PNG (Max 100MB)',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => controller.pickMedia('Video'),
                      icon: const Icon(Icons.videocam_rounded, size: 16),
                      label: const Text('Pick Video', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton.icon(
                      onPressed: () => controller.pickMedia('Image'),
                      icon: const Icon(Icons.image_rounded, size: 16),
                      label: const Text('Pick Image', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: AppColors.cardBorder),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 20),

        // Attached Creatives List
        const Text(
          'Attached Creative Assets',
          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Obx(() {
          if (controller.creativeItems.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              alignment: Alignment.center,
              child: const Text('No creatives attached yet. Please upload media or add a video URL.',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11), textAlign: TextAlign.center),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.creativeItems.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final item = controller.creativeItems[index];
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        item.type == 'Video' ? Icons.videocam_rounded : (item.type == 'URL' ? Icons.play_circle_outline_rounded : Icons.image_rounded),
                        color: const Color(0xFF8B5CF6),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 2),
                          Text('${item.type} • ${item.size} • ${item.durationSec}s', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                      onPressed: () => controller.removeCreativeItem(item.id),
                    ),
                  ],
                ),
              );
            },
          );
        }),
      ],
    );
  }

  // ==========================================================
  // STEP 3: ROUTES & SCREENS INVENTORY SELECTOR
  // ==========================================================
  Widget _buildStep3RoutesAndScreens() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          'Select Transit Routes & Screens',
          'Search a route, view assigned buses and onboard digital screens.',
        ),
        const SizedBox(height: 12),

        // Live Selected Metrics Banner
        Obx(() {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${controller.selectedTargets.length} Routes Selected',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                Text(
                  '${controller.totalSelectedVehicles} Buses • ${controller.totalSelectedScreens} Screens',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 12),

        // Search & City Filter Bar
        Row(
          children: [
            Expanded(
              flex: 2,
              child: TextField(
                onChanged: (v) => controller.routeSearchQuery.value = v,
                style: const TextStyle(color: Colors.white, fontSize: 11),
                decoration: InputDecoration(
                  hintText: 'Search route, corridor, city...',
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 16),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Obx(() {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: controller.selectedCityFilter.value,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white, fontSize: 11),
                    items: controller.availableCities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (v) => controller.selectedCityFilter.value = v ?? 'All',
                  ),
                ),
              );
            }),
          ],
        ),
        const SizedBox(height: 10),

        // Quick Bulk Actions
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            TextButton(
              onPressed: controller.selectAllRoutes,
              child: const Text('Select All', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 8),
            TextButton(
              onPressed: controller.clearAllRoutes,
              child: const Text('Clear All', style: TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const SizedBox(height: 6),

        // Routes List
        Obx(() {
          if (controller.isLoadingFleets.value) {
            return const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator(color: Color(0xFF8B5CF6))));
          }
          if (controller.filteredTransitRoutes.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(30),
              alignment: Alignment.center,
              child: const Text('No transit routes found matching your search.', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.filteredTransitRoutes.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final route = controller.filteredTransitRoutes[index];
              final isRouteSel = controller.isRouteSelected(route.id);
              final target = controller.getTargetForRoute(route.id);
              final isExpanded = controller.expandedRoutes[route.id] ?? false;

              return Container(
                decoration: BoxDecoration(
                  color: isRouteSel ? const Color(0xFF1E293B) : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: isRouteSel ? const Color(0xFF8B5CF6) : AppColors.cardBorder),
                ),
                child: Column(
                  children: [
                    // Route Header Row
                    ListTile(
                      dense: true,
                      leading: Checkbox(
                        value: isRouteSel,
                        activeColor: const Color(0xFF8B5CF6),
                        onChanged: (_) => controller.toggleRoute(route),
                      ),
                      title: Row(
                        children: [
                          Expanded(
                            child: Text(route.name, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(4)),
                            child: Text(route.code, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5, fontFamily: 'monospace')),
                          ),
                        ],
                      ),
                      subtitle: Text('${route.fleetName} • ${route.city}', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${target?.vehicleCount ?? route.vehicleCount} buses',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                '${target?.totalScreens ?? route.totalScreens} screens',
                                style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.textMuted, size: 20),
                            onPressed: () => controller.expandedRoutes[route.id] = !isExpanded,
                          ),
                        ],
                      ),
                    ),

                    // Expanded Buses & Screens
                    if (isExpanded)
                      Container(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        child: route.vehicles.isEmpty
                            ? Container(
                                padding: const EdgeInsets.all(10),
                                alignment: Alignment.centerLeft,
                                child: const Text('No individual buses registered on this route; targets complete route.', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                              )
                            : Column(
                                children: route.vehicles.map((vehicle) {
                                  final isBusSel = target?.vehicleIds.contains(vehicle.id) ?? false;
                                  final busKey = '${route.id}-${vehicle.id}';
                                  final isBusExp = controller.expandedBuses[busKey] ?? false;

                                  return Container(
                                    margin: const EdgeInsets.only(top: 6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.cardBorder),
                                    ),
                                    child: Column(
                                      children: [
                                        ListTile(
                                          dense: true,
                                          visualDensity: VisualDensity.compact,
                                          leading: Checkbox(
                                            value: isBusSel,
                                            activeColor: const Color(0xFF8B5CF6),
                                            onChanged: (_) => controller.toggleBus(route, vehicle),
                                          ),
                                          title: Text(vehicle.busNumber, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                          trailing: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text('${vehicle.screens.isNotEmpty ? vehicle.screens.length : vehicle.displaysCount} screens', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10)),
                                              if (vehicle.screens.isNotEmpty)
                                                IconButton(
                                                  icon: Icon(isBusExp ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.textMuted, size: 16),
                                                  onPressed: () => controller.expandedBuses[busKey] = !isBusExp,
                                                ),
                                            ],
                                          ),
                                        ),
                                        if (isBusExp && vehicle.screens.isNotEmpty)
                                          Padding(
                                            padding: const EdgeInsets.fromLTRB(20, 0, 10, 8),
                                            child: Wrap(
                                              spacing: 6,
                                              runSpacing: 6,
                                              children: vehicle.screens.map((screen) {
                                                final isScrSel = target?.screenIds.contains(screen.id) ?? false;
                                                return FilterChip(
                                                  label: Text(screen.code, style: TextStyle(color: isScrSel ? Colors.white : AppColors.textSecondary, fontSize: 9.5)),
                                                  selected: isScrSel,
                                                  selectedColor: const Color(0xFF8B5CF6),
                                                  backgroundColor: const Color(0xFF1E293B),
                                                  onSelected: (_) => controller.toggleScreen(route, vehicle, screen),
                                                );
                                              }).toList(),
                                            ),
                                          ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ),
                      ),
                  ],
                ),
              );
            },
          );
        }),
      ],
    );
  }

  // ==========================================================
  // STEP 4: SCHEDULE & BROADCAST AIRTIME
  // ==========================================================
  Widget _buildStep4Schedule() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          'Campaign Schedule & Broadcast Airtime',
          'Configure campaign flight calendar dates, repeat frequency, and active hours.',
        ),
        const SizedBox(height: 14),

        // Quick Duration Presets (7, 14, 30, 60, 90)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text('Quick Duration Presets', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
            Text('Click to set flight window', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
          ],
        ),
        const SizedBox(height: 8),
        Obx(() {
          final presets = [
            {'days': 7, 'label': '7 Days', 'sub': '1 Week'},
            {'days': 14, 'label': '14 Days', 'sub': '2 Weeks'},
            {'days': 30, 'label': '30 Days', 'sub': '1 Month'},
            {'days': 60, 'label': '60 Days', 'sub': '2 Months'},
            {'days': 90, 'label': '90 Days', 'sub': 'Quarterly'},
          ];

          return Row(
            children: presets.map((p) {
              final days = p['days'] as int;
              final label = p['label'] as String;
              final isSelected = controller.selectedDurationPreset.value == days;

              return Expanded(
                child: GestureDetector(
                  onTap: () => controller.setDurationPreset(days),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      gradient: isSelected ? AppTheme.primaryGradient : null,
                      color: isSelected ? null : AppColors.cardBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isSelected ? Colors.transparent : AppColors.cardBorder),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      label,
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 14),

        // Start Date & End Date Row
        Row(
          children: [
            Expanded(
              child: _buildDateCard(
                title: 'Start Date',
                date: controller.startDate,
                onTap: () async {
                  final picked = await showDatePicker(
                    context: Get.context!,
                    initialDate: controller.startDate.value,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) controller.setStartDate(picked);
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildDateCard(
                title: 'End Date',
                date: controller.endDate,
                onTap: () async {
                  final picked = await showDatePicker(
                    context: Get.context!,
                    initialDate: controller.endDate.value,
                    firstDate: controller.startDate.value,
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) controller.setEndDate(picked);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Repeat Frequency (Daily, Weekdays, Weekends, Custom)
        const Text('Repeat Frequency', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final options = ['Daily', 'Weekdays', 'Weekends', 'Custom'];
          return Row(
            children: options.map((opt) {
              final isSel = controller.repeatFrequency.value == opt;
              return Expanded(
                child: GestureDetector(
                  onTap: () => controller.setRepeatPreset(opt),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      gradient: isSel ? AppTheme.primaryGradient : null,
                      color: isSel ? null : AppColors.cardBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isSel ? Colors.transparent : AppColors.cardBorder),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      opt,
                      style: TextStyle(color: isSel ? Colors.white : AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 14),

        // Day of Week Selector Chips
        const Text('Active Broadcast Days', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: days.map((day) {
              final isDayActive = controller.selectedDays.contains(day);
              return GestureDetector(
                onTap: () => controller.toggleDay(day),
                child: Container(
                  width: 42,
                  height: 38,
                  decoration: BoxDecoration(
                    gradient: isDayActive ? AppTheme.primaryGradient : null,
                    color: isDayActive ? null : const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: isDayActive ? Colors.transparent : AppColors.cardBorder),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    day,
                    style: TextStyle(color: isDayActive ? Colors.white : AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 14),

        // Daily Operating Hours Presets
        const Text('Daily Operating Hours', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          final slots = [
            {'label': 'Full Day (06:00 - 23:00)', 'preset': 'Full Day'},
            {'label': 'Morning Rush (07:00 - 12:00)', 'preset': 'Morning Rush'},
            {'label': 'Evening Prime (17:00 - 22:00)', 'preset': 'Evening Prime'},
          ];

          return Column(
            children: slots.map((s) {
              final isSel = controller.selectedTimeSlotPreset.value == s['preset'];
              return GestureDetector(
                onTap: () => controller.setTimeSlotPreset(s['preset']!),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSel ? const Color(0xFF1E293B) : AppColors.cardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isSel ? const Color(0xFF8B5CF6) : AppColors.cardBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(s['label']!, style: TextStyle(color: isSel ? Colors.white : AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                      if (isSel) const Icon(Icons.check_circle_rounded, color: Color(0xFF8B5CF6), size: 16),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        }),
      ],
    );
  }

  // ==========================================================
  // STEP 5: BUDGET & DYNAMIC PAYMENT BREAKDOWN + QR
  // ==========================================================
  Widget _buildStep5BudgetAndQr() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          'Budget & Dynamic Payment Breakdown',
          'Configure base airtime fee, taxes, custom line items, and QR attribution.',
        ),
        const SizedBox(height: 14),

        // Base Airtime Fee Input
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Base Airtime Broadcast Fee (₹) *', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                controller: controller.baseAmountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  prefixText: '₹ ',
                  prefixStyle: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 18, fontWeight: FontWeight.bold),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                ),
                onChanged: (_) => controller.breakdownItems.refresh(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Dynamic Line Item Builder
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Itemized Line Items (Taxes / Fees)', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            TextButton.icon(
              onPressed: controller.addBreakdownItem,
              icon: const Icon(Icons.add_rounded, size: 16, color: Color(0xFF8B5CF6)),
              label: const Text('Add Line Item', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const SizedBox(height: 6),

        Obx(() {
          if (controller.breakdownItems.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              alignment: Alignment.center,
              child: const Text('No custom line items added yet. Click "+ Add Line Item" above to add taxes (GST), fees, or discounts.',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10.5), textAlign: TextAlign.center),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.breakdownItems.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final item = controller.breakdownItems[index];

              return Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        // Preset selector
                        Expanded(
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: item.key,
                              dropdownColor: const Color(0xFF1E293B),
                              style: const TextStyle(color: Colors.white, fontSize: 11),
                              items: const [
                                DropdownMenuItem(value: 'GST_CGST', child: Text('CGST (9%)')),
                                DropdownMenuItem(value: 'GST_SGST', child: Text('SGST (9%)')),
                                DropdownMenuItem(value: 'GST_IGST', child: Text('IGST (18%)')),
                                DropdownMenuItem(value: 'FEE_AIRTIME_BROADCAST', child: Text('Airtime Fee (10%)')),
                                DropdownMenuItem(value: 'FEE_HARDWARE_RENTAL', child: Text('Hardware Rental')),
                                DropdownMenuItem(value: 'FEE_CREATIVE_DESIGN', child: Text('Creative Review')),
                                DropdownMenuItem(value: 'DISCOUNT_VOLUME', child: Text('Volume Discount (5%)')),
                                DropdownMenuItem(value: 'DISCOUNT_PROMO', child: Text('Promo Discount')),
                                DropdownMenuItem(value: 'CUSTOM', child: Text('Custom Item')),
                              ],
                              onChanged: (v) {
                                if (v != null) controller.selectBreakdownPreset(item.id, v);
                              },
                            ),
                          ),
                        ),
                        // Type pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: item.type == 'discount' ? const Color(0xFFEF4444).withValues(alpha: 0.15) : const Color(0xFF10B981).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            item.type.toUpperCase(),
                            style: TextStyle(
                              color: item.type == 'discount' ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 16),
                          onPressed: () => controller.removeBreakdownItem(item.id),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: TextField(
                            controller: TextEditingController(text: item.label),
                            onChanged: (v) => item.label = v,
                            style: const TextStyle(color: Colors.white, fontSize: 11),
                            decoration: InputDecoration(
                              hintText: 'Description',
                              hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                              filled: true,
                              fillColor: const Color(0xFF0F172A),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: AppColors.cardBorder)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 1,
                          child: TextField(
                            controller: TextEditingController(text: item.amount > 0 ? item.amount.toStringAsFixed(0) : ''),
                            keyboardType: TextInputType.number,
                            onChanged: (v) {
                              item.amount = double.tryParse(v) ?? 0.0;
                              controller.breakdownItems.refresh();
                            },
                            style: const TextStyle(color: Colors.white, fontSize: 11),
                            decoration: InputDecoration(
                              prefixText: '₹ ',
                              hintText: '0',
                              filled: true,
                              fillColor: const Color(0xFF0F172A),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: AppColors.cardBorder)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        }),
        const SizedBox(height: 14),

        // Live Breakdown Summary Card
        Obx(() {
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4)),
            ),
            child: Column(
              children: [
                _buildSummaryLine('Base Airtime Fee', '₹ ${NumberFormat('#,##,###').format(controller.baseAmountNum)}'),
                if (controller.totalCharges > 0)
                  _buildSummaryLine('Charges & Surcharges', '+ ₹ ${NumberFormat('#,##,###').format(controller.totalCharges)}', color: const Color(0xFF38BDF8)),
                if (controller.totalTaxes > 0)
                  _buildSummaryLine('Taxes (GST)', '+ ₹ ${NumberFormat('#,##,###').format(controller.totalTaxes)}', color: const Color(0xFFF59E0B)),
                if (controller.totalDiscounts > 0)
                  _buildSummaryLine('Discounts Applied', '- ₹ ${NumberFormat('#,##,###').format(controller.totalDiscounts)}', color: const Color(0xFF10B981)),
                const Divider(color: Color(0xFF334155), height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Campaign Investment', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    Text(
                      '₹ ${NumberFormat('#,##,###').format(controller.finalTotalAmount)}',
                      style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 20),

        // ==========================================================
        // QR IDENTITY & LEAD GENERATION SECTION
        // ==========================================================
        _buildSectionHeader(
          'QR Code Lead Attribution',
          'Track direct customer scan conversions and landing page visits.',
        ),
        const SizedBox(height: 10),

        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // QR Code ID Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Unique QR Code ID', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                  Obx(() => Text(controller.qrCodeId.value, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'))),
                ],
              ),
              const SizedBox(height: 10),

              // QR Redirect URL
              _buildInputField(
                label: 'QR Scan Redirect URL',
                controller: controller.qrRedirectUrlController,
                hint: 'https://yourbrand.com/special-offer',
                keyboardType: TextInputType.url,
              ),
              const SizedBox(height: 10),

              // Screen Placement
              const Text('Screen Placement', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Obx(() {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.selectedQrPlacement.value,
                      isExpanded: true,
                      dropdownColor: const Color(0xFF1E293B),
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      items: controller.qrPlacements.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                      onChanged: (v) => controller.selectedQrPlacement.value = v ?? 'Rear Screen',
                    ),
                  ),
                );
              }),
              const SizedBox(height: 10),

              // Promo Code Row
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: controller.promoCodeController,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      decoration: InputDecoration(
                        hintText: 'Enter Promo Code (e.g. VMX50)',
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: controller.applyPromoCode,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B5CF6),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    child: const Text('Apply', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // STEP 6: REVIEW & FINAL SUBMISSION
  // ==========================================================
  Widget _buildStep6ReviewSubmit() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          'Review & Submit Campaign',
          'Review all parameters before final submission for SuperAdmin verification.',
        ),
        const SizedBox(height: 14),

        // Section 1: Campaign Metadata
        _buildReviewSection(
          stepIndex: 1,
          title: 'Campaign Overview & Metadata',
          items: [
            {'label': 'Campaign Name', 'value': controller.nameController.text},
            {'label': 'Brand Name', 'value': controller.brandNameController.text},
            {'label': 'Type', 'value': controller.selectedCampaignType.value},
            {'label': 'Objective', 'value': controller.selectedObjective.value},
            {'label': 'Category', 'value': controller.selectedCategory.value},
          ],
        ),
        const SizedBox(height: 10),

        // Section 2: Customer / Client Details
        _buildReviewSection(
          stepIndex: 1,
          title: 'Customer / Client Information',
          items: [
            {'label': 'Contact Person', 'value': controller.clientNameController.text},
            {'label': 'Company', 'value': controller.clientCompanyController.text},
            {'label': 'Mobile Number', 'value': controller.clientPhoneController.text},
            {'label': 'Email Address', 'value': controller.clientEmailController.text},
            {'label': 'Location / City', 'value': '${controller.clientCityController.text}, ${controller.clientStateController.text}'},
          ],
        ),
        const SizedBox(height: 10),

        // Section 3: Creative Assets Summary
        _buildReviewSection(
          stepIndex: 2,
          title: 'Creative Assets',
          items: [
            {'label': 'Total Assets Attached', 'value': '${controller.creativeItems.length} file(s)'},
            {'label': 'Asset Types', 'value': controller.creativeItems.map((c) => c.type).toSet().join(', ')},
          ],
        ),
        const SizedBox(height: 10),

        // Section 4: Targeted Transit Inventory
        _buildReviewSection(
          stepIndex: 3,
          title: 'Transit Routes & Screens',
          items: [
            {'label': 'Routes Targeted', 'value': '${controller.selectedTargets.length} corridors'},
            {'label': 'Buses Targeted', 'value': '${controller.totalSelectedVehicles} buses'},
            {'label': 'Screens Targeted', 'value': '${controller.totalSelectedScreens} screens'},
          ],
        ),
        const SizedBox(height: 10),

        // Section 5: Schedule
        _buildReviewSection(
          stepIndex: 4,
          title: 'Schedule & Airtime',
          items: [
            {'label': 'Flight Dates', 'value': '${DateFormat('dd MMM yyyy').format(controller.startDate.value)} – ${DateFormat('dd MMM yyyy').format(controller.endDate.value)}'},
            {'label': 'Duration', 'value': '${controller.durationDaysNumber} days flight'},
            {'label': 'Active Days', 'value': controller.selectedDays.join(', ')},
            {'label': 'Operating Hours', 'value': '${controller.dailySlotStart.value} – ${controller.dailySlotEnd.value}'},
          ],
        ),
        const SizedBox(height: 10),

        // Section 6: Budget & Payment Breakdown
        _buildReviewSection(
          stepIndex: 5,
          title: 'Budget & Payment Breakdown',
          items: [
            {'label': 'Base Airtime Fee', 'value': '₹ ${NumberFormat('#,##,###').format(controller.baseAmountNum)}'},
            {'label': 'Total Line Items', 'value': '${controller.breakdownItems.length} items'},
            {'label': 'Final Investment', 'value': '₹ ${NumberFormat('#,##,###').format(controller.finalTotalAmount)}'},
          ],
        ),
        const SizedBox(height: 10),

        // Section 7: QR Identity Setup
        _buildReviewSection(
          stepIndex: 5,
          title: 'QR Code Attribution',
          items: [
            {'label': 'QR Code ID', 'value': controller.qrCodeId.value},
            {'label': 'Redirect URL', 'value': controller.qrRedirectUrlController.text.isNotEmpty ? controller.qrRedirectUrlController.text : 'Not configured'},
            {'label': 'Screen Placement', 'value': controller.selectedQrPlacement.value},
          ],
        ),
      ],
    );
  }

  // ==========================================================
  // BOTTOM NAVIGATION & SUBMIT BAR
  // ==========================================================
  Widget _buildBottomActionBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Obx(() {
        final current = controller.currentStep.value;
        final isLast = current == controller.totalSteps;
        final isSubmitting = controller.isSubmitting.value;

        return Row(
          children: [
            if (current > 1)
              Expanded(
                flex: 1,
                child: OutlinedButton(
                  onPressed: isSubmitting ? null : controller.previousStep,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.cardBorder),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('← Back', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
            if (current > 1) const SizedBox(width: 10),
            Expanded(
              flex: 2,
              child: CustomButton(
                text: isLast ? (controller.isEditMode.value ? 'Update Campaign' : 'Publish Campaign') : 'Continue ›',
                isGradient: true,
                isLoading: isSubmitting,
                onTap: controller.nextStep,
              ),
            ),
          ],
        );
      }),
    );
  }

  // ==========================================================
  // SUCCESS SCREEN (Matching CampaignSuccessPage)
  // ==========================================================
  Widget _buildSuccessScreen() {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded, color: Colors.white, size: 44),
              ),
              const SizedBox(height: 20),
              const Text(
                'Campaign Created Successfully!',
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              const Text(
                'Your transit broadcast campaign has been submitted for SuperAdmin verification and scheduled.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Summary Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  children: [
                    _buildSummaryLine('Campaign Name', controller.nameController.text),
                    _buildSummaryLine('Client Name', controller.clientNameController.text),
                    _buildSummaryLine('Total Budget', '₹ ${NumberFormat('#,##,###').format(controller.finalTotalAmount)}'),
                    _buildSummaryLine('Duration', '${controller.durationDaysNumber} Days'),
                    _buildSummaryLine('Total Screens', '${controller.totalSelectedScreens} Screens'),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              CustomButton(
                text: 'View in Campaigns Hub',
                isGradient: true,
                onTap: () {
                  Get.back();
                },
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: controller.resetForm,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Create Another Campaign', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==========================================================
  // HELPER REUSABLE WIDGETS
  // ==========================================================
  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
      ],
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: const TextStyle(color: Colors.white, fontSize: 12),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            filled: true,
            fillColor: const Color(0xFF0F172A),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF8B5CF6))),
          ),
        ),
      ],
    );
  }

  Widget _buildDateCard({
    required String title,
    required Rx<DateTime> date,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.calendar_today_rounded, color: Color(0xFF8B5CF6), size: 14),
                const SizedBox(width: 6),
                Obx(() => Text(
                      DateFormat('dd MMM yyyy').format(date.value),
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    )),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewSection({
    required int stepIndex,
    required String title,
    required List<Map<String, String>> items,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              GestureDetector(
                onTap: () => controller.goToStep(stepIndex),
                child: const Text('Edit', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const Divider(color: Color(0xFF334155), height: 14),
          Column(
            children: items.map((it) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2.5),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(it['label'] ?? '', style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5)),
                    Flexible(
                      child: Text(
                        it['value']?.isNotEmpty == true ? it['value']! : '–',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
                        textAlign: TextAlign.right,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryLine(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
          Text(value, style: TextStyle(color: color ?? Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
