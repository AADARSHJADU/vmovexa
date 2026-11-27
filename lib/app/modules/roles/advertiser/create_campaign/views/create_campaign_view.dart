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

              // Saved Draft Notice Banner (matching Admin Panel)
              _buildSavedDraftBanner(),

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
      child:
      Row(
        children: [
          // Back Button
          IconButton(
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(
              minWidth: 36,
              minHeight: 40,
            ),
            icon: const Icon(
              Icons.arrow_back_ios_new_rounded,
              color: Colors.white,
              size: 20,
            ),
            onPressed: controller.previousStep,
          ),

          const SizedBox(width: 4),

          // Center Title and Step
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Obx(
                      () => Text(
                    controller.isEditMode.value
                        ? 'edit_campaign_title'.tr
                        : 'create_campaign'.tr,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Obx(() {
                  final current = controller.currentStep.value;
                  final label = controller.stepLabels[current - 1];

                  return Text(
                    '${'step_x_of_y'.tr} $current / ${controller.totalSteps}: $label',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10.5,
                    ),
                  );
                }),
              ],
            ),
          ),

          const SizedBox(width: 4),

          // Draft Actions
          Obx(() {
            final hasDraft = controller.hasSavedDraft.value &&
                !controller.isEditMode.value;
            final isSaved = controller.draftSavedAt.value.isNotEmpty;

            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (hasDraft)
                  InkWell(
                    onTap: controller.restoreDraft,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3B82F6)
                            .withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: const Color(0xFF3B82F6)
                              .withValues(alpha: 0.4),
                        ),
                      ),
                      child: const Icon(
                        Icons.refresh_rounded,
                        color: Color(0xFF60A5FA),
                        size: 16,
                      ),
                    ),
                  ),

                if (hasDraft) const SizedBox(width: 5),

                InkWell(
                  onTap: controller.saveDraft,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: isSaved
                          ? const Color(0xFF10B981)
                          .withValues(alpha: 0.15)
                          : const Color(0xFF8B5CF6)
                          .withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSaved
                            ? const Color(0xFF10B981)
                            .withValues(alpha: 0.6)
                            : const Color(0xFF8B5CF6)
                            .withValues(alpha: 0.4),
                      ),
                    ),
                    child: Icon(
                      isSaved
                          ? Icons.check_circle_rounded
                          : Icons.save_as_outlined,
                      color: isSaved
                          ? const Color(0xFF10B981)
                          : const Color(0xFF8B5CF6),
                      size: 16,
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
      /*Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
            onPressed: controller.previousStep,
          ),
          Expanded(
            child: Column(
              children: [
                Obx(() => Text(
                  controller.isEditMode.value ? 'edit_campaign_title'.tr : 'create_campaign'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                )),
                Obx(() {
                  final current = controller.currentStep.value;
                  final label = controller.stepLabels[current - 1];
                  return Text(
                    '${'step_x_of_y'.tr} $current / ${controller.totalSteps}: $label',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                    overflow: TextOverflow.ellipsis,
                  );
                }),
              ],
            ),
          ),
          Obx(() {
            final hasDraft = controller.hasSavedDraft.value && !controller.isEditMode.value;
            final isSaved = controller.draftSavedAt.value.isNotEmpty;

            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (hasDraft) ...[
                  InkWell(
                    onTap: controller.restoreDraft,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.refresh_rounded, color: Color(0xFF60A5FA), size: 13),
                          const SizedBox(width: 3),
                          Text(
                            'restore_draft_btn'.tr,
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                ],
                InkWell(
                  onTap: controller.saveDraft,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: isSaved
                          ? const Color(0xFF10B981).withValues(alpha: 0.15)
                          : const Color(0xFF8B5CF6).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSaved
                            ? const Color(0xFF10B981).withValues(alpha: 0.6)
                            : const Color(0xFF8B5CF6).withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isSaved ? Icons.check_circle_rounded : Icons.save_as_outlined,
                          color: isSaved ? const Color(0xFF10B981) : const Color(0xFF8B5CF6),
                          size: 13,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          isSaved
                              ? '${'saved_badge'.tr} (${controller.draftSavedAt.value})'
                              : 'save_draft_btn'.tr,
                          style: TextStyle(
                            color: isSaved ? const Color(0xFF10B981) : const Color(0xFF8B5CF6),
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),*/
    );
  }

  // ==========================================================
  // SAVED DRAFT BANNER (Persistent Banner matching Admin Panel)
  // ==========================================================
  Widget _buildSavedDraftBanner() {
    return Obx(() {
      if (!controller.hasSavedDraft.value || controller.isEditMode.value || controller.draftInfo.value == null) {
        return const SizedBox.shrink();
      }
      final info = controller.draftInfo.value!;
      final campaignName = info['name']?.toString() ?? 'step_campaign_info'.tr;
      final savedTime = info['savedTime']?.toString() ?? '';
      final step = info['step'] ?? 1;

      return Container(
        margin: const EdgeInsets.only(left: 16, right: 16, bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B).withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.35)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.bookmark_added_rounded, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        text: TextSpan(
                          text: '${'saved_draft_avail'.tr}: ',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                          children: [
                            TextSpan(
                              text: campaignName,
                              style: const TextStyle(
                                color: Color(0xFF60A5FA),
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${'last_saved_at'.tr} $savedTime · ${'ready_resume_step'.tr} $step',
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
           /* Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // Discard Button
                OutlinedButton.icon(
                  onPressed: controller.discardDraft,
                  icon: const Icon(Icons.delete_outline_rounded, size: 13, color: AppColors.textMuted),
                  label: Text(
                    'discard_btn'.tr,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(width: 8),
                // Restore Button with primaryGradient
                Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: controller.restoreDraft,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.refresh_rounded, size: 14, color: Colors.white),
                            const SizedBox(width: 4),
                            Text(
                              'restore_draft_btn'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),*/
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // Discard Button
                Flexible(
                  child: OutlinedButton.icon(
                    onPressed: controller.discardDraft,
                    icon: const Icon(
                      Icons.delete_outline_rounded,
                      size: 13,
                      color: AppColors.textMuted,
                    ),
                    label: Text(
                      'discard_btn'.tr,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                        color: Colors.white.withValues(alpha: 0.15),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 6,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      visualDensity: VisualDensity.compact,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),

                const SizedBox(width: 6),

                // Restore Button with primaryGradient
                Flexible(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6366F1)
                              .withValues(alpha: 0.3),
                          blurRadius: 4,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(10),
                        onTap: controller.restoreDraft,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 6,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.refresh_rounded,
                                size: 14,
                                color: Colors.white,
                              ),
                              const SizedBox(width: 4),
                              Flexible(
                                child: Text(
                                  'restore_draft_btn'.tr,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
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
          'campaign_info_title'.tr,
          'campaign_info_sub'.tr,
        ),
        const SizedBox(height: 14),

        // Campaign Name
        _buildInputField(
          label: 'campaign_name_label'.tr,
          controller: controller.nameController,
          hint: 'campaign_name_hint'.tr,
        ),
        const SizedBox(height: 12),

        // Brand Name
        _buildInputField(
          label: 'brand_name_label'.tr,
          controller: controller.brandNameController,
          hint: 'brand_name_hint'.tr,
        ),
        const SizedBox(height: 14),

        // Campaign Type Tiles
        Text(
          'campaign_type_label'.tr,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
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
                    controller.getCampaignTypeLabel(type),
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
          label: 'campaign_desc_label'.tr,
          controller: controller.descriptionController,
          hint: 'campaign_desc_hint'.tr,
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
                  Text('objective_label'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
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
                        items: controller.objectives.map((o) => DropdownMenuItem(value: o, child: Text(controller.getObjectiveLabel(o), maxLines: 1, overflow: TextOverflow.ellipsis))).toList(),
                        onChanged: (v) => controller.selectedObjective.value = v ?? controller.objectives.first,
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
                  Text('campaign_category_label'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
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
                        items: controller.categories.map((c) => DropdownMenuItem(value: c, child: Text(controller.getCategoryLabel(c), maxLines: 1, overflow: TextOverflow.ellipsis))).toList(),
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
                      children: [
                        Text(
                          'customer_client_details_title'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'customer_client_details_sub'.tr,
                          style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              _buildInputField(
                label: 'customer_contact_name_label'.tr,
                controller: controller.clientNameController,
                hint: 'customer_contact_name_hint'.tr,
              ),
              const SizedBox(height: 10),

              _buildInputField(
                label: 'customer_company_label'.tr,
                controller: controller.clientCompanyController,
                hint: 'customer_company_hint'.tr,
              ),
              const SizedBox(height: 10),

              _buildInputField(
                label: 'customer_mobile_label'.tr,
                controller: controller.clientPhoneController,
                hint: 'customer_mobile_hint'.tr,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 10),

              _buildInputField(
                label: 'customer_email_label'.tr,
                controller: controller.clientEmailController,
                hint: 'customer_email_hint'.tr,
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
          'creative_assets_title'.tr,
          'creative_assets_sub'.tr,
        ),
        const SizedBox(height: 14),

        // Creative Type Selector Pills
        Obx(() {
          final types = [
            {'type': 'All', 'label': 'all_creatives_tab'.tr, 'icon': Icons.folder_open_rounded},
            {'type': 'Image', 'label': 'image_tab'.tr, 'icon': Icons.image_rounded},
            {'type': 'Video', 'label': 'video_tab'.tr, 'icon': Icons.videocam_rounded},
            {'type': 'URL', 'label': 'url_youtube_tab'.tr, 'icon': Icons.link_rounded},
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
                      Text('youtube_video_url_title'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      const Spacer(),
                      if (controller.detectedYtId.value.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                          child: Text('${'detected_label'.tr} (${controller.detectedYtId.value})', style: const TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
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
                    text: 'add_to_creatives_btn'.tr,
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
                Text(
                  'browse_creative_from_device'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  'media_supported_specs'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                ),
                const SizedBox(height: 16),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => controller.pickMedia('Video'),
                      icon: const Icon(
                        Icons.videocam_rounded,
                        size: 16,
                      ),
                      label: Text(
                        'pick_video_btn'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),

                    OutlinedButton.icon(
                      onPressed: () => controller.pickMedia('Image'),
                      icon: const Icon(
                        Icons.image_rounded,
                        size: 16,
                      ),
                      label: Text(
                        'pick_image_btn'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(
                          color: AppColors.cardBorder,
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
                // Row(
                //   mainAxisAlignment: MainAxisAlignment.center,
                //   children: [
                //     ElevatedButton.icon(
                //       onPressed: () => controller.pickMedia('Video'),
                //       icon: const Icon(Icons.videocam_rounded, size: 16),
                //       label: Text('pick_video_btn'.tr, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                //       style: ElevatedButton.styleFrom(
                //         backgroundColor: const Color(0xFF8B5CF6),
                //         foregroundColor: Colors.white,
                //         padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                //         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                //       ),
                //     ),
                //     const SizedBox(width: 10),
                //     OutlinedButton.icon(
                //       onPressed: () => controller.pickMedia('Image'),
                //       icon: const Icon(Icons.image_rounded, size: 16),
                //       label: Text('pick_image_btn'.tr, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                //       style: OutlinedButton.styleFrom(
                //         foregroundColor: Colors.white,
                //         side: const BorderSide(color: AppColors.cardBorder),
                //         padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                //         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                //       ),
                //     ),
                //   ],
                // ),
              ],
            ),
          );
        }),
        const SizedBox(height: 20),

        // Attached Creatives List
        Text(
          'attached_creatives_title'.tr,
          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
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
              child: Text('no_creatives_attached_msg'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11), textAlign: TextAlign.center),
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
                          Text('${item.type} • ${item.size} • ${item.durationSec}${'seconds_suffix_s'.tr}', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
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
          'select_routes_screens_title'.tr,
          'select_routes_screens_sub'.tr,
        ),
        const SizedBox(height: 12),

        // Live Selected Metrics Banner with AppTheme.primaryGradient
        Obx(() {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child:
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${controller.selectedTargets.length} ${'routes_selected_badge'.tr}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  '${controller.totalSelectedVehicles} ${'buses_label'.tr} • '
                      '${controller.totalSelectedScreens} ${'screens_label'.tr}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),

            /*Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${controller.selectedTargets.length} ${'routes_selected_badge'.tr}',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                Text(
                  '${controller.totalSelectedVehicles} ${'buses_label'.tr} • ${controller.totalSelectedScreens} ${'screens_label'.tr}',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),*/
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
                  hintText: 'search_route_bus_operator_hint'.tr,
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
              child: Text('select_all_btn'.tr, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 8),
            TextButton(
              onPressed: controller.clearAllRoutes,
              child: Text('clear_all_btn'.tr, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
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
              child: Text('no_transit_routes_found'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
            );
          }

          return Column(
            children: controller.filteredTransitRoutes.map((route) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Obx(() {
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
                          onTap: () => controller.toggleRoute(route),
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
                                    '${target?.vehicleCount ?? route.vehicleCount} ${'buses_label'.tr}',
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    '${target?.totalScreens ?? route.totalScreens} ${'screens_label'.tr}',
                                    style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              IconButton(
                                icon: Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.textMuted, size: 20),
                                onPressed: () => controller.toggleRouteExpanded(route.id),
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
                              child: Text('no_active_buses_assigned'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
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
                                        onTap: () => controller.toggleBus(route, vehicle),
                                        leading: Checkbox(
                                          value: isBusSel,
                                          activeColor: const Color(0xFF8B5CF6),
                                          onChanged: (_) => controller.toggleBus(route, vehicle),
                                        ),
                                        title: Text(vehicle.busNumber, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                        trailing: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text('${vehicle.screens.isNotEmpty ? vehicle.screens.length : vehicle.displaysCount} ${'screens_label'.tr}', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10)),
                                            if (vehicle.screens.isNotEmpty)
                                              IconButton(
                                                icon: Icon(isBusExp ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.textMuted, size: 16),
                                                onPressed: () => controller.toggleBusExpanded(busKey),
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
                }),
              );
            }).toList(),
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
          'campaign_schedule_title'.tr,
          'campaign_schedule_sub'.tr,
        ),
        const SizedBox(height: 14),

        // Quick Duration Presets (7, 14, 30, 60, 90)
        Row(
          children: [
            Expanded(
              child: Text(
                'quick_duration_presets_title'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                'click_to_set_flight'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.end,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
        /*Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('quick_duration_presets_title'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
            Text('click_to_set_flight'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
          ],
        ),*/
        const SizedBox(height: 8),
        Obx(() {
          final presets = [
            {'days': 7, 'label': '7 ${'days_suffix'.tr}'},
            {'days': 14, 'label': '14 ${'days_suffix'.tr}'},
            {'days': 30, 'label': '30 ${'days_suffix'.tr}'},
            {'days': 60, 'label': '60 ${'days_suffix'.tr}'},
            {'days': 90, 'label': '90 ${'days_suffix'.tr}'},
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

        // Start Date & Time + End Date & Time Row (Matching Admin Panel)
        Row(
          children: [
            Expanded(
              child: _buildDateTimeCard(
                title: 'start_date_label'.tr,
                badge: 'launch_date_badge'.tr,
                badgeColor: const Color(0xFF3B82F6),
                headerIcon: Icons.rocket_launch_rounded,
                date: controller.startDate,
                time: controller.startTime,
                onDateTap: () async {
                  final picked = await showDatePicker(
                    context: Get.context!,
                    initialDate: controller.startDate.value,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) controller.setStartDate(picked);
                },
                onTimeTap: () => controller.selectStartTime(Get.context!),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildDateTimeCard(
                title: 'end_date_label'.tr,
                badge: 'expiry_date_badge'.tr,
                badgeColor: const Color(0xFF6366F1),
                headerIcon: Icons.flag_rounded,
                date: controller.endDate,
                time: controller.endTime,
                onDateTap: () async {
                  final picked = await showDatePicker(
                    context: Get.context!,
                    initialDate: controller.endDate.value,
                    firstDate: controller.startDate.value,
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) controller.setEndDate(picked);
                },
                onTimeTap: () => controller.selectEndTime(Get.context!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Repeat Frequency (Daily, Weekdays, Weekends, Custom)
        Text('repeat_freq_title'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
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
                      controller.getSchedulePresetLabel(opt),
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
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('active_broadcast_days_title'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
            Obx(() => Text('${controller.activeBroadcastDaysCount} ${'active_days_of_7_count'.tr}', style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 10.5, fontWeight: FontWeight.bold))),
          ],
        ),
        const SizedBox(height: 8),
        Obx(() {
          final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

          return Row(
            children: days.map((day) {
              final isDayActive = controller.selectedDays.contains(day);

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: GestureDetector(
                    onTap: () => controller.toggleDay(day),
                    child: Container(
                      height: 38,
                      decoration: BoxDecoration(
                        gradient: isDayActive
                            ? AppTheme.primaryGradient
                            : null,
                        color: isDayActive
                            ? null
                            : const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDayActive
                              ? Colors.transparent
                              : AppColors.cardBorder,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        controller.getDayLabel(day),
                        style: TextStyle(
                          color: isDayActive
                              ? Colors.white
                              : AppColors.textMuted,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }),
       /* Obx(() {
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
                    controller.getDayLabel(day),
                    style: TextStyle(color: isDayActive ? Colors.white : AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              );
            }).toList(),
          );
        }),*/
        const SizedBox(height: 16),

        // Daily Operating Hours Presets (Matching Admin Panel)

        Row(
          children: [
            Expanded(
              child: Row(
                children: [
                  const Icon(
                    Icons.access_time_filled_rounded,
                    color: Color(0xFF3B82F6),
                    size: 15,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'daily_operating_hours_title'.tr,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Flexible(
              child: Obx(() => Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 3,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.schedule_rounded,
                      color: Color(0xFF38BDF8),
                      size: 12,
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        '${controller.formattedDailyOperatingHours} Hours / Day Active',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
            ),
          ],
        ),
        /*Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.access_time_filled_rounded, color: Color(0xFF3B82F6), size: 15),
                const SizedBox(width: 6),
                Text('daily_operating_hours_title'.tr, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
              ],
            ),
            Obx(() => Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.schedule_rounded, color: Color(0xFF38BDF8), size: 12),
                  const SizedBox(width: 4),
                  Text(
                    '${controller.formattedDailyOperatingHours} Hours / Day Active',
                    style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )),
          ],
        ),*/
        const SizedBox(height: 4),
        Text('daily_broadcast_window_desc'.tr,
          style: TextStyle(color: AppColors.textMuted, fontSize: 10),
        ),
        const SizedBox(height: 10),

        // 4 Presets Matching Admin Panel
        Obx(() {
          final selectedPreset = controller.selectedTimeSlotPreset.value;

          final presets = [
            {
              'title': 'Prime Transit',
              'time': '08:00 – 22:00',
              'sub': '08:00 – 22:00 (14h)',
              'presetKey': 'Prime Transit (08:00 - 22:00)',
              'isRec': true,
            },
            {
              'title': 'Full Day',
              'time': '06:00 – 23:00',
              'sub': '06:00 – 23:00 (17h)',
              'presetKey': 'Full Day (06:00 - 23:00)',
              'isRec': false,
            },
            {
              'title': 'Morning Rush',
              'time': '07:00 – 12:00',
              'sub': '07:00 – 12:00 (5h)',
              'presetKey': 'Morning Rush (07:00 - 12:00)',
              'isRec': false,
            },
            {
              'title': 'Evening Rush',
              'time': '16:00 – 22:00',
              'sub': '16:00 – 22:00 (6h)',
              'presetKey': 'Evening Rush (16:00 - 22:00)',
              'isRec': false,
            },
          ];

          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: presets.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 2.3,
            ),
            itemBuilder: (context, index) {
              final p = presets[index];
              final presetKey = p['presetKey'] as String;
              final isSel = selectedPreset.startsWith(p['title'] as String);
              final isRec = p['isRec'] as bool;

              return GestureDetector(
                onTap: () => controller.setTimeSlotPreset(presetKey),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: isSel ? AppTheme.primaryGradient : null,
                    color: isSel ? null : AppColors.cardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSel ? Colors.transparent : AppColors.cardBorder,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              controller.getTimeSlotPresetTitle(p['title'] as String),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isRec) ...[
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 5,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'best_badge'.tr,
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                ),
                                maxLines: 1,
                                softWrap: false,
                              ),
                            ),
                          ],
                        ],
                      ),
                      /*Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            controller.getTimeSlotPresetTitle(p['title'] as String),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (isRec)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 5,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text('best_badge'.tr,
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                        ],
                      ),*/
                      const SizedBox(height: 2),
                      Text(
                        p['sub'] as String,
                        style: TextStyle(
                          color: isSel ? Colors.white70 : AppColors.textMuted,
                          fontSize: 9.5,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        }),
       /* Obx(() {
          final presets = [
            {
              'title': 'Prime Transit',
              'time': '08:00 – 22:00',
              'sub': '08:00 – 22:00 (14h)',
              'presetKey': 'Prime Transit (08:00 - 22:00)',
              'isRec': true,
            },
            {
              'title': 'Full Day',
              'time': '06:00 – 23:00',
              'sub': '06:00 – 23:00 (17h)',
              'presetKey': 'Full Day (06:00 - 23:00)',
              'isRec': false,
            },
            {
              'title': 'Morning Rush',
              'time': '07:00 – 12:00',
              'sub': '07:00 – 12:00 (5h)',
              'presetKey': 'Morning Rush (07:00 - 12:00)',
              'isRec': false,
            },
            {
              'title': 'Evening Rush',
              'time': '16:00 – 22:00',
              'sub': '16:00 – 22:00 (6h)',
              'presetKey': 'Evening Rush (16:00 - 22:00)',
              'isRec': false,
            },
          ];

          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: presets.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 2.3,
            ),
            itemBuilder: (context, index) {
              final p = presets[index];
              final presetKey = p['presetKey'] as String;
              final isSel = controller.selectedTimeSlotPreset.value.startsWith(p['title'] as String);
              final isRec = p['isRec'] as bool;

              return GestureDetector(
                onTap: () => controller.setTimeSlotPreset(presetKey),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: isSel ? AppTheme.primaryGradient : null,
                    color: isSel ? null : AppColors.cardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isSel ? Colors.transparent : AppColors.cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            controller.getTimeSlotPresetTitle(p['title'] as String),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (isRec)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text('best_badge'.tr, style: const TextStyle(color: Colors.black, fontSize: 8.5, fontWeight: FontWeight.w900)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        p['sub'] as String,
                        style: TextStyle(
                          color: isSel ? Colors.white70 : AppColors.textMuted,
                          fontSize: 9.5,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        }),*/
        const SizedBox(height: 12),

        // Custom Time Slot Inputs (Airtime Start Time & Airtime End Time)
        Row(
          children: [
            // Custom Airtime Start Time
            Expanded(
              child: GestureDetector(
                onTap: () => controller.selectStartTime(Get.context!),
                child: Obx(() {
                  final isCustom = controller.selectedTimeSlotPreset.value == 'Custom Time';
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isCustom ? const Color(0xFF8B5CF6) : AppColors.cardBorder,
                        width: isCustom ? 1.5 : 1.0,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.wb_sunny_rounded, color: Color(0xFFF59E0B), size: 14),
                                const SizedBox(width: 4),
                                Text('start_time_label'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const Icon(Icons.edit_rounded, color: Color(0xFF8B5CF6), size: 12),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.cardBorder),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  controller.dailySlotStart.value,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(Icons.access_time_rounded, color: Color(0xFFF59E0B), size: 14),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text('auto_synced_start'.tr,
                          style: TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(width: 10),
            // Custom Airtime End Time
            Expanded(
              child: GestureDetector(
                onTap: () => controller.selectEndTime(Get.context!),
                child: Obx(() {
                  final isCustom = controller.selectedTimeSlotPreset.value == 'Custom Time';
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isCustom ? const Color(0xFF8B5CF6) : AppColors.cardBorder,
                        width: isCustom ? 1.5 : 1.0,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                       /* Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.nightlight_round, color: Color(0xFF6366F1), size: 14),
                                const SizedBox(width: 4),
                                Text('end_time_label'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const Icon(Icons.edit_rounded, color: Color(0xFF8B5CF6), size: 12),
                          ],
                        ),*/

                        Row(
                          children: [
                            const Icon(
                              Icons.nightlight_round,
                              color: Color(0xFF6366F1),
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                'end_time_label'.tr,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.edit_rounded,
                              color: Color(0xFF8B5CF6),
                              size: 12,
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.cardBorder),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                controller.dailySlotEnd.value,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                              const Icon(Icons.access_time_rounded, color: Color(0xFF6366F1), size: 14),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text('auto_synced_end'.tr,
                          style: TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        /*// Visual 24-Hour Airtime Bar
        Obx(() {
          final sParts = controller.dailySlotStart.value.split(':').map((e) => int.tryParse(e) ?? 0).toList();
          final startFraction = ((sParts[0] + (sParts.length > 1 ? sParts[1] / 60.0 : 0.0)) / 24.0).clamp(0.0, 1.0);
          final hours = controller.dailyOperatingHours;
          final widthFraction = (hours / 24.0).clamp(0.0, (1.0 - startFraction).clamp(0.0, 1.0));

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
                    Text('time_night_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                    Text(
                      'Active Airtime: ${controller.dailySlotStart.value} – ${controller.dailySlotEnd.value} (${controller.formattedDailyOperatingHours}h)',
                      style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    Text('time_midnight_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  height: 10,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: LayoutBuilder(
                    builder: (ctx, constraints) {
                      final totalW = constraints.maxWidth;
                      return Stack(
                        children: [
                          Positioned(
                            left: totalW * startFraction,
                            width: (totalW * widthFraction).clamp(0.0, totalW),
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
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 16),*/

        // Slot Availability Check Banner
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('slot_availability_title'.tr, style: const TextStyle(color: Color(0xFF10B981), fontSize: 11.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text('slot_available_success'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                  ],
                ),
              ),
              Obx(() => TextButton(
                onPressed: controller.isCheckingSlot.value ? null : controller.checkSlotAvailability,
                child: controller.isCheckingSlot.value
                    ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF8B5CF6)))
                    : Text('recheck_slot_btn'.tr, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
              )),
            ],
          ),
        ),
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
          'budget_payment_breakdown_title'.tr,
          'budget_payment_breakdown_sub'.tr,
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
              Text('base_airtime_fee_label'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
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
              const SizedBox(height: 10),
              // Quick Tax Calculation Buttons
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: controller.applyAutoCgst,
                    icon: const Icon(Icons.percent_rounded, size: 14, color: Color(0xFF8B5CF6)),
                    label: Text('auto_cgst_9_btn'.tr, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF8B5CF6)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: controller.applyAutoIgst,
                    icon: const Icon(Icons.percent_rounded, size: 14, color: Color(0xFF38BDF8)),
                    label: Text('auto_igst_18_btn'.tr, style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF38BDF8)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Dynamic Line Item Builder

        Row(
          children: [
            Expanded(
              child: Text(
                'itemized_line_items_title'.tr,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 6),
            TextButton.icon(
              onPressed: controller.addBreakdownItem,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              icon: const Icon(
                Icons.add_rounded,
                size: 16,
                color: Color(0xFF8B5CF6),
              ),
              label: Text(
                'add_line_item_btn'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF8B5CF6),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        /*Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('itemized_line_items_title'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            TextButton.icon(
              onPressed: controller.addBreakdownItem,
              icon: const Icon(Icons.add_rounded, size: 16, color: Color(0xFF8B5CF6)),
              label: Text('add_line_item_btn'.tr, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ],
        ),*/
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
              child: Text('no_line_items_msg'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5), textAlign: TextAlign.center),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.breakdownItems.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final item = controller.breakdownItems[index];
              final isTax = item.type == 'tax' || item.key.startsWith('GST_');

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
                    // Top Tier: Item (Dropdown with grouped options) + Type (Dropdown with Charge/Discount/Tax) + Delete
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        // Item Selection Dropdown
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'item_label'.tr,
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.cardBorder),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: item.key,
                                    isExpanded: true,
                                    dropdownColor: const Color(0xFF1E293B),
                                    style: const TextStyle(color: Colors.white, fontSize: 11),
                                    items: [
                                      DropdownMenuItem(value: 'GST_CGST', child: Text('cgst_rate'.tr)),
                                      DropdownMenuItem(value: 'GST_SGST', child: Text('sgst_rate'.tr)),
                                      DropdownMenuItem(value: 'GST_IGST', child: Text('igst_rate'.tr)),
                                      DropdownMenuItem(value: 'GST_CESS', child: Text('gst_cess_rate'.tr)),
                                      DropdownMenuItem(value: 'FEE_AIRTIME_BROADCAST', child: Text('fee_airtime_playback'.tr)),
                                      DropdownMenuItem(value: 'FEE_HARDWARE_RENTAL', child: Text('fee_hardware_rental'.tr)),
                                      DropdownMenuItem(value: 'FEE_CREATIVE_DESIGN', child: Text('fee_creative_review'.tr)),
                                      DropdownMenuItem(value: 'FEE_ONBOARDING_SETUP', child: Text('fee_setup_deployment'.tr)),
                                      DropdownMenuItem(value: 'DISCOUNT_VOLUME', child: Text('discount_volume_fleet'.tr)),
                                      DropdownMenuItem(value: 'DISCOUNT_PROMO', child: Text('discount_promotional'.tr)),
                                      DropdownMenuItem(value: 'CUSTOM', child: Text('fee_custom_line_item'.tr)),
                                    ],
                                    onChanged: (v) {
                                      if (v != null) controller.selectBreakdownPreset(item.id, v);
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Type Selection Dropdown (Charge (+), Discount (-), Tax (+))
                        Expanded(
                          flex: 2,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'type_label'.tr,
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.cardBorder),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: item.type,
                                    isExpanded: true,
                                    dropdownColor: const Color(0xFF1E293B),
                                    style: TextStyle(
                                      color: item.type == 'discount'
                                          ? const Color(0xFF34D399)
                                          : (item.type == 'tax' ? const Color(0xFFFBBF24) : const Color(0xFF60A5FA)),
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    items: [
                                      DropdownMenuItem(value: 'charge', child: Text('charge_type_opt'.tr)),
                                      DropdownMenuItem(value: 'discount', child: Text('discount_type_opt'.tr)),
                                      DropdownMenuItem(value: 'tax', child: Text('tax_type_opt'.tr)),
                                    ],
                                    onChanged: (v) {
                                      if (v != null) controller.updateBreakdownItemType(item.id, v);
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),

                        // Delete Action Button
                        IconButton(
                          icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                          onPressed: () => controller.removeBreakdownItem(item.id),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 36),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Bottom Tier: Description Input + Amount Input & Inline Tax Rate Shortcuts (9%, 18%)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        // Description Input
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('description'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                              const SizedBox(height: 4),
                              TextField(
                                controller: TextEditingController(text: item.label),
                                onChanged: (v) => controller.updateBreakdownItemLabel(item.id, v),
                                style: const TextStyle(color: Colors.white, fontSize: 11),
                                decoration: InputDecoration(
                                  hintText: 'description'.tr,
                                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                                  filled: true,
                                  fillColor: const Color(0xFF0F172A),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Amount (₹) Input with inline 9% and 18% tax shortcut buttons
                        Expanded(
                          flex: 2,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('amount_inr'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                                  if (isTax)
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        GestureDetector(
                                          onTap: () => controller.applyTaxPercentToItem(item.id, 9),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                                              borderRadius: BorderRadius.circular(4),
                                              border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4)),
                                            ),
                                            child: const Text('9%', style: TextStyle(color: Color(0xFFC084FC), fontSize: 9, fontWeight: FontWeight.bold)),
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        GestureDetector(
                                          onTap: () => controller.applyTaxPercentToItem(item.id, 18),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                                              borderRadius: BorderRadius.circular(4),
                                              border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4)),
                                            ),
                                            child: const Text('18%', style: TextStyle(color: Color(0xFFC084FC), fontSize: 9, fontWeight: FontWeight.bold)),
                                          ),
                                        ),
                                      ],
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              TextField(
                                controller: controller.getAmountController(item),
                                keyboardType: const TextInputType.numberWithOptions(
                                  decimal: true,
                                ),
                                onChanged: (v) {
                                  final val = double.tryParse(v) ?? 0.0;
                                  controller.updateBreakdownItemAmount(item.id, val);
                                },
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                                decoration: InputDecoration(
                                  prefixText: '₹ ',
                                  prefixStyle: const TextStyle(
                                    color: Color(0xFF8B5CF6),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  hintText: '0',
                                  filled: true,
                                  fillColor: const Color(0xFF0F172A),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 10,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: const BorderSide(color: AppColors.cardBorder),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: const BorderSide(color: AppColors.cardBorder),
                                  ),
                                ),
                              ),
                            ],
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
        const SizedBox(height: 16),

        // ==========================================================
        // FINAL INVOICE SUMMARY CARD (Matching Admin Panel)
        // ==========================================================
        Obx(() {
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with Live Calculation Badge
                /*Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'final_invoice_summary_title'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold, letterSpacing: 0.3),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.fiber_manual_record, color: Color(0xFF10B981), size: 8),
                          const SizedBox(width: 4),
                          Text(
                            'live_calculation_badge'.tr,
                            style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),*/
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'final_invoice_summary_title'.tr,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: const Color(0xFF10B981).withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.fiber_manual_record,
                            color: Color(0xFF10B981),
                            size: 8,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'live_calculation_badge'.tr,
                            style: const TextStyle(
                              color: Color(0xFF34D399),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Base Airtime Broadcast Fee Line
                _buildSummaryLine(
                  'base_airtime_fee_label'.tr.replaceAll('*', '').trim(),
                  '₹ ${NumberFormat('#,##,###').format(controller.baseAmountNum)}',
                ),

                // Dynamic Line Items Listing (Each individual item from breakdownItems)
                ...controller.breakdownItems.map((item) {
                  final isDiscount = item.type == 'discount';
                  final isTax = item.type == 'tax';
                  final color = isDiscount
                      ? const Color(0xFF34D399)
                      : (isTax ? const Color(0xFFFBBF24) : const Color(0xFF60A5FA));
                  final prefix = isDiscount ? '- ' : '+ ';

                  return _buildSummaryLine(
                    item.label.isNotEmpty ? item.label : 'line_item_label'.tr,
                    '$prefix₹ ${NumberFormat('#,##,###').format(item.amount)}',
                    color: color,
                  );
                }),

                const Divider(color: Color(0xFF334155), height: 16),

                // Subtotal Net
                _buildSummaryLine(
                  'subtotal_net_label'.tr,
                  '₹ ${NumberFormat('#,##,###').format(controller.subtotalNet)}',
                  color: Colors.white,
                ),

                const Divider(color: Color(0xFF475569), height: 18, thickness: 1.5),

                // Highlighted Final Total Amount
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'total_payable_amount_label'.tr,
                          style: const TextStyle(color: Color(0xFF10B981), fontSize: 12.5, fontWeight: FontWeight.bold, letterSpacing: 0.4),
                        ),
                        const SizedBox(height: 2),
                        // Text(
                        //   'total_payable_amount_desc'.tr,
                        //   style: const TextStyle(
                        //       color: AppColors.textMuted, fontSize: 9.5),
                        // ),
                      ],
                    ),
                    Text(
                      '₹ ${NumberFormat('#,##,###').format(controller.finalTotalAmount)}',
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Notice Box
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.bolt_rounded, color: Color(0xFFF59E0B), size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '${'invoice_notice_text'.tr} (₹ ${NumberFormat('#,##,###').format(controller.finalTotalAmount)})',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, height: 1.3),
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

        // ==========================================================
        // DYNAMIC QR CODE IDENTITY SECTION (Matching Admin Panel)
        // ==========================================================
        _buildSectionHeader(
          'dynamic_qr_identity_title'.tr,
          'qr_auto_generated_desc'.tr,
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
              // QR Code ID Row + Active Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.fiber_manual_record, color: Color(0xFF10B981), size: 10),
                        const SizedBox(width: 4),
                        Text('active_dynamic_qr_badge'.tr, style: const TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  Obx(() => Text(controller.qrCodeId.value, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'))),
                ],
              ),
              const SizedBox(height: 14),

              // QR Code Visual Box
              Center(
                child: Container(
                  width: 140,
                  height: 160,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.qr_code_2_rounded, size: 88, color: Color(0xFF0F172A)),
                      const SizedBox(height: 4),
                      Text(
                        'scan_camera_track_lead'.tr,
                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 8, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Tracking Gateway Box (Showing live link matching Admin Panel)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'tracking_gateway_url_label'.tr,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy_rounded, color: Color(0xFF8B5CF6), size: 15),
                          onPressed: controller.copyTrackingGatewayUrl,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
                          tooltip: 'copy_link_tooltip'.tr,
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Obx(() => Text(
                      controller.trackingGatewayUrl,
                      style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    )),
                    ValueListenableBuilder<TextEditingValue>(
                      valueListenable: controller.qrRedirectUrlController,
                      builder: (context, value, child) {
                        final landing = value.text.trim();

                        if (landing.isNotEmpty) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Divider(
                                  color: Color(0xFF1E293B),
                                  height: 10,
                                ),
                                Text(
                                  'landing_target_preview_label'.tr,
                                  style: const TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 1),
                                Text(
                                  landing,
                                  style: const TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          );
                        }

                        return const SizedBox.shrink();
                      },
                    ),
                  /*  Obx(() {
                      final landing = controller.qrRedirectUrlController.text.trim();
                      if (landing.isNotEmpty) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Divider(color: Color(0xFF1E293B), height: 10),
                              Text(
                                'landing_target_preview_label'.tr,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 1),
                              Text(
                                landing,
                                style: const TextStyle(color: Color(0xFF34D399), fontSize: 10.5, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        );
                      }
                      return const SizedBox.shrink();
                    }),*/
                  ],
                ),
              ),
              // const SizedBox(height: 12),

              // // Destination Landing Target URL Input
              // _buildInputField(
              //   label: 'landing_target_url_label'.tr,
              //   controller: controller.qrRedirectUrlController,
              //   hint: 'landing_target_hint'.tr,
              //   keyboardType: TextInputType.url,
              // ),
              const SizedBox(height: 14),

              // QR Action Buttons (Share & Download)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: controller.shareQrCode,
                      icon: const Icon(Icons.share_rounded, size: 14, color: Colors.white),
                      label: Text('share_qr_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.cardBorder),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: controller.downloadQrCode,
                      icon: const Icon(Icons.file_download_outlined, size: 14, color: Color(0xFF8B5CF6)),
                      label: Text('download_qr_btn'.tr, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF8B5CF6)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
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
          'review_submit_title'.tr,
          'review_submit_sub'.tr,
        ),
        const SizedBox(height: 14),

        // Section 1: Campaign Metadata
        _buildReviewSection(
          stepIndex: 1,
          title: 'campaign_overview_section'.tr,
          items: [
            {'label': 'campaign_name_label'.tr, 'value': controller.nameController.text},
            {'label': 'brand_name_label'.tr, 'value': controller.brandNameController.text},
            {'label': 'campaign_type_label'.tr, 'value': controller.selectedCampaignType.value},
            {'label': 'objective_label'.tr, 'value': controller.selectedObjective.value},
            {'label': 'campaign_category_label'.tr, 'value': controller.selectedCategory.value},
          ],
        ),
        const SizedBox(height: 10),

        // Section 2: Customer / Client Details
        _buildReviewSection(
          stepIndex: 1,
          title: 'customer_billing_section'.tr,
          items: [
            {'label': 'customer_contact_name_label'.tr, 'value': controller.clientNameController.text},
            {'label': 'customer_company_label'.tr, 'value': controller.clientCompanyController.text},
            {'label': 'customer_mobile_label'.tr, 'value': controller.clientPhoneController.text},
            {'label': 'customer_email_label'.tr, 'value': controller.clientEmailController.text},
            {'label': 'Location / City', 'value': '${controller.clientCityController.text}, ${controller.clientStateController.text}'},
          ],
        ),
        const SizedBox(height: 10),

        // Section 3: Creative Assets Summary
        _buildReviewSection(
          stepIndex: 2,
          title: 'creative_assets_section'.tr,
          items: [
            {'label': 'Total Assets Attached', 'value': '${controller.creativeItems.length} file(s)'},
            {'label': 'Asset Types', 'value': controller.creativeItems.map((c) => c.type).toSet().join(', ')},
          ],
        ),
        const SizedBox(height: 10),

        // Section 4: Targeted Transit Inventory
        _buildReviewSection(
          stepIndex: 3,
          title: 'targeted_inventory_section'.tr,
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
          title: 'flight_calendar_section'.tr,
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
          title: 'financial_ledger_section'.tr,
          items: [
            {'label': 'base_airtime_fee_label'.tr, 'value': '₹ ${NumberFormat('#,##,###').format(controller.baseAmountNum)}'},
            {'label': 'Total Line Items', 'value': '${controller.breakdownItems.length} items'},
            {'label': 'total_payable_amount_label'.tr, 'value': '₹ ${NumberFormat('#,##,###').format(controller.finalTotalAmount)}'},
          ],
        ),
        const SizedBox(height: 10),

        // Section 7: QR Identity Setup
        _buildReviewSection(
          stepIndex: 5,
          title: 'qr_identity_section'.tr,
          items: [
            {'label': 'QR Code ID', 'value': controller.qrCodeId.value},
            {'label': 'tracking_gateway_url_label'.tr, 'value': controller.trackingGatewayUrl},
            if (controller.qrRedirectUrlController.text.trim().isNotEmpty)
              {'label': 'landing_target_preview_label'.tr, 'value': controller.qrRedirectUrlController.text.trim()},
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
                  child: Text('back_step_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
            if (current > 1) const SizedBox(width: 10),
            Expanded(
              flex: 2,
              child: CustomButton(
                text: isLast ? (controller.isEditMode.value ? 'update_campaign_btn'.tr : 'publish_campaign_btn'.tr) : 'continue_step_btn'.tr,
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
              Text(
                'campaign_submitted_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                'campaign_submitted_desc'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
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
                    _buildSummaryLine('campaign_name_label'.tr, controller.nameController.text),
                    _buildSummaryLine('customer_contact_name_label'.tr, controller.clientNameController.text),
                    _buildSummaryLine('total_payable_amount_label'.tr, '₹ ${NumberFormat('#,##,###').format(controller.finalTotalAmount)}'),
                    _buildSummaryLine('Duration', '${controller.durationDaysNumber} Days'),
                    _buildSummaryLine('screens_label'.tr, '${controller.totalSelectedScreens} Screens'),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              CustomButton(
                text: 'view_in_campaigns_hub_btn'.tr,
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
                child: Text('create_another_campaign_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
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

  Widget _buildDateTimeCard({
    required String title,
    required String badge,
    required Color badgeColor,
    required IconData headerIcon,
    required Rx<DateTime> date,
    required Rx<TimeOfDay> time,
    required VoidCallback onDateTap,
    required VoidCallback onTimeTap,
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
            children: [
              Expanded(
                child: Row(
                  children: [
                    Icon(headerIcon, color: badgeColor, size: 14),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  badge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    color: badgeColor,
                    fontSize: 8,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          /*Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(headerIcon, color: badgeColor, size: 14),
                  const SizedBox(width: 5),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Text(
                badge,
                style: TextStyle(
                  color: badgeColor,
                  fontSize: 8,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),*/
          const SizedBox(height: 10),
          GestureDetector(
            onTap: onDateTap,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_rounded, color: Color(0xFF8B5CF6), size: 13),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Obx(() => Text(
                      DateFormat('dd MMM yyyy').format(date.value),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                      overflow: TextOverflow.ellipsis,
                    )),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 6),
          // Custom Time Box
          GestureDetector(
            onTap: onTimeTap,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.access_time_rounded, color: Color(0xFF38BDF8), size: 13),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Obx(() {
                      final h = time.value.hour.toString().padLeft(2, '0');
                      final m = time.value.minute.toString().padLeft(2, '0');
                      return Text(
                        '$h:$m',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      );
                    }),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 6),
          Obx(() {
            final h = time.value.hour.toString().padLeft(2, '0');
            final m = time.value.minute.toString().padLeft(2, '0');
            return Text(
              '${DateFormat('dd MMM yyyy').format(date.value)} · $h:$m',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
            );
          }),
        ],
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
            children: [
              Expanded(
                child: Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => controller.goToStep(stepIndex),
                child: Text(
                  'edit'.tr,
                  maxLines: 1,
                  style: const TextStyle(
                    color: Color(0xFF8B5CF6),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          /*Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              GestureDetector(
                onTap: () => controller.goToStep(stepIndex),
                child: Text('edit'.tr, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),*/
          const Divider(color: Color(0xFF334155), height: 14),
          Column(
            children: items.map((it) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2.5),
                child:
                Row(
                  children: [
                    Flexible(
                      flex: 2,
                      child: Text(
                        it['label'] ?? '',
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 10.5,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      flex: 3,
                      child: Text(
                        it['value']?.isNotEmpty == true
                            ? it['value']!
                            : '–',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.right,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                /*Row(
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
                ),*/
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
