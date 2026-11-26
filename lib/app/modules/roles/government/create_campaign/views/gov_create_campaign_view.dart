import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/modules/roles/advertiser/create_campaign/widgets/client_address_map_picker.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/gov_create_campaign_controller.dart';

class GovCreateCampaignView extends GetView<GovCreateCampaignController> {
  const GovCreateCampaignView({super.key});

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
      child: Row(
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
                  controller.isEditMode.value
                      ? 'edit_campaign_title'.tr
                      : 'create_public_welfare_broadcast'.tr,
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
      ),
    );
  }

  // ==========================================================
  // SAVED DRAFT BANNER
  // ==========================================================
  Widget _buildSavedDraftBanner() {
    return Obx(() {
      if (!controller.hasSavedDraft.value || controller.isEditMode.value || controller.draftInfo.value == null) {
        return const SizedBox.shrink();
      }
      final info = controller.draftInfo.value!;
      final campaignName = info['name']?.toString() ?? 'public_welfare_broadcast_preview'.tr;
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
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
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
            ),
          ],
        ),
      );
    });
  }

  // ==========================================================
  // STEPPER PROGRESS (6 Steps)
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
  // CURRENT STEP BODY
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
  // STEP 1: INFORMATION & NODAL OFFICER DETAILS
  // ==========================================================
  Widget _buildStep1Info() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          title: 'step_campaign_info'.tr,
          subtitle: 'create_gov_campaign_sub'.tr,
        ),
        const SizedBox(height: 16),

        _buildCard(
          children: [
            _buildFieldLabel('campaign_name_label'.tr, isRequired: true),
            _buildTextField(
              controller: controller.nameController,
              hint: 'gov_campaign_name_hint'.tr,
              icon: Icons.campaign_rounded,
            ),
            const SizedBox(height: 14),

            _buildFieldLabel('gov_dept_sponsoring_authority'.tr, isRequired: true),
            _buildTextField(
              controller: controller.brandNameController,
              hint: 'gov_dept_sponsoring_ph'.tr,
              icon: Icons.account_balance_rounded,
            ),
            const SizedBox(height: 14),

            // Campaign Type 4-box selectable grid matching Admin Panel
            _buildFieldLabel('campaign_type_label'.tr, isRequired: true),
            const SizedBox(height: 6),
            Obx(() {
              final current = controller.selectedCampaignType.value;
              final types = [
                {'key': 'Brand Awareness', 'label': 'type_brand_awareness'.tr, 'icon': Icons.campaign_rounded},
                {'key': 'Product Promotion', 'label': 'type_product_promotion'.tr, 'icon': Icons.inventory_2_rounded},
                {'key': 'Event', 'label': 'type_event'.tr, 'icon': Icons.calendar_today_rounded},
                {'key': 'Offer / Promotion', 'label': 'type_offer_promotion'.tr, 'icon': Icons.local_offer_rounded},
              ];
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 2.2,
                ),
                itemCount: types.length,
                itemBuilder: (context, index) {
                  final item = types[index];
                  final isSelected = current == item['key'];
                  return InkWell(
                    onTap: () => controller.selectedCampaignType.value = item['key'] as String,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: isSelected ? AppTheme.primaryGradient : null,
                        color: isSelected ? null : AppColors.cardBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? Colors.transparent : AppColors.cardBorder,
                          width: 1.2,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: const Color(0xFF6366F1).withValues(alpha: 0.35),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      child: Row(
                        children: [
                          Icon(
                            item['icon'] as IconData,
                            size: 22,
                            color: isSelected ? Colors.white : AppColors.textMuted,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              item['label'] as String,
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.white70,
                                fontSize: 11.5,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            }),
            const SizedBox(height: 14),

            _buildFieldLabel('description_label'.tr),
            _buildTextField(
              controller: controller.descriptionController,
              hint: 'campaign_desc_hint'.tr,
              maxLines: 3,
            ),
            const SizedBox(height: 14),

            // Objective and Category Dropdowns side-by-side
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFieldLabel('objective_label'.tr, isRequired: true),
                      Obx(() => _buildDropdown(
                        value: controller.selectedObjective.value,
                        items: controller.objectives,
                        onChanged: (v) {
                          if (v != null) controller.selectedObjective.value = v;
                        },
                      )),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFieldLabel('category_label'.tr, isRequired: true),
                      Obx(() => _buildDropdown(
                        value: controller.selectedCategory.value,
                        items: controller.categories,
                        onChanged: (v) {
                          if (v != null) controller.selectedCategory.value = v;
                        },
                      )),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Sponsoring Authority & Nodal Officer Details
        _buildSectionHeader(
          title: 'gov_authority_contact_details'.tr,
          subtitle: 'gov_step1_subtitle'.tr,
        ),
        const SizedBox(height: 14),

        _buildCard(
          children: [
            // Authority Recipient Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.person_rounded, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'gov_authority_contact_details'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            // const SizedBox(width: 6),
                            // Container(
                            //   padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            //   decoration: BoxDecoration(
                            //     color: const Color(0xFF3B82F6).withValues(alpha: 0.2),
                            //     borderRadius: BorderRadius.circular(6),
                            //   ),
                            //   child: Text(
                            //     'gov_official_recipient_badge'.tr,
                            //     style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9, fontWeight: FontWeight.bold),
                            //   ),
                            // ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Official contact point for municipal transit clearance orders',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            _buildFieldLabel('gov_nodal_officer_name'.tr, isRequired: true),
            _buildTextField(
              controller: controller.clientNameController,
              hint: 'gov_nodal_officer_ph'.tr,
              icon: Icons.person_pin_rounded,
            ),
            const SizedBox(height: 14),

            _buildFieldLabel('gov_agency_dept_name'.tr),
            _buildTextField(
              controller: controller.clientCompanyController,
              hint: 'gov_agency_dept_ph'.tr,
              icon: Icons.domain_rounded,
            ),
            const SizedBox(height: 14),

            // Phone with Broadcast Alerts badge and hint
            Row(
              children: [
                Expanded(child: _buildFieldLabel('gov_official_contact_phone'.tr, isRequired: true)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.phone_in_talk_rounded, size: 10, color: Color(0xFF60A5FA)),
                      const SizedBox(width: 4),
                      Text(
                        'broadcast_alerts_badge'.tr,
                        style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            _buildTextField(
              controller: controller.clientPhoneController,
              hint: '+91 98765 43210',
              icon: Icons.phone_rounded,
              keyboardType: TextInputType.phone,
            ),
            Padding(
              padding: const EdgeInsets.only(top: 4, bottom: 12),
              child: Text(
                'broadcast_alerts_hint'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
              ),
            ),

            // Email with Official Notification badge and hint
            Row(
              children: [
                Expanded(child: _buildFieldLabel('gov_official_department_email'.tr, isRequired: true)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.mail_outline_rounded, size: 10, color: Color(0xFF34D399)),
                      const SizedBox(width: 4),
                      Text(
                        'official_notification_badge'.tr,
                        style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            _buildTextField(
              controller: controller.clientEmailController,
              hint: 'transport.director@gov.in',
              icon: Icons.mail_rounded,
              keyboardType: TextInputType.emailAddress,
            ),
            Padding(
              padding: const EdgeInsets.only(top: 4, bottom: 14),
              child: Text(
                'official_notification_hint'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
              ),
            ),

            // Department Office / Headquarters Location section
            const Divider(color: AppColors.cardBorder, height: 24),
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.location_on_rounded, color: Color(0xFF3B82F6), size: 16),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'dept_office_hq_location'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'dept_office_hq_sub'.tr,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                      ),
                    ],
                  ),
                ),
                controller.clientCityController.text.isNotEmpty
                    ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    controller.clientCityController.text,
                    style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9.5, fontWeight: FontWeight.bold),
                  ),
                )
                    : const SizedBox.shrink()
              ],
            ),
            const SizedBox(height: 10),

            ClientAddressMapPicker(
              searchController: controller.clientSearchController,
              addressController: controller.clientAddressController,
              cityController: controller.clientCityController,
              stateController: controller.clientStateController,
              pincodeController: controller.clientPincodeController,
              initialLat: controller.clientLatitude.value,
              initialLng: controller.clientLongitude.value,
              title: 'dept_office_hq_location'.tr,
              subtitle: 'dept_office_hq_sub'.tr,
              searchHint: 'search_dept_ph'.tr,
              onLocationChanged: controller.updateClientLocation,
            ),
          ],
        ),
      ],
    );
  }

  // ==========================================================
  // STEP 2: CREATIVE ASSETS & STREAMING
  // ==========================================================
  Widget _buildStep2Creative() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          title: 'step_creative_assets'.tr,
          subtitle: 'gov_step2_subtitle'.tr,
        ),
        const SizedBox(height: 16),

        // 5 Tabs: All, Image, Video, PDF Document, URL (YouTube / Web)
        Obx(() {
          final tabs = [
            {'type': 'All', 'label': 'all_creatives_tab'.tr, 'icon': Icons.folder_open_rounded},
            {'type': 'Image', 'label': 'image_tab'.tr, 'icon': Icons.image_rounded},
            {'type': 'Video', 'label': 'video_tab'.tr, 'icon': Icons.videocam_rounded},
            {'type': 'PDF', 'label': 'pdf_document_tab'.tr, 'icon': Icons.picture_as_pdf_rounded},
            {'type': 'URL', 'label': 'url_youtube_tab'.tr, 'icon': Icons.link_rounded},
          ];
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: tabs.map((tab) {
                final isSelected = controller.selectedCreativeType.value == tab['type'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => controller.selectedCreativeType.value = tab['type'] as String,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: isSelected ? AppTheme.primaryGradient : null,
                        color: isSelected ? null : const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? Colors.transparent : AppColors.cardBorder,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            tab['icon'] as IconData,
                            size: 16,
                            color: isSelected ? Colors.white : AppColors.textMuted,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            tab['label'] as String,
                            style: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textMuted,
                              fontSize: 11.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          );
        }),
        const SizedBox(height: 16),

        // Upload Area or URL Input based on selectedCreativeType
        Obx(() {
          if (controller.selectedCreativeType.value == 'URL') {
            return _buildCard(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.smart_display_rounded, color: Colors.red, size: 20),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'youtube_video_url_title'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            // const Text(
                            //   'Provide a YouTube video or online media stream to broadcast across transit screens',
                            //   style: TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                            // ),
                          ],
                        ),
                      ],
                    ),
                    if (controller.detectedYtId.value.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          'YouTube (${controller.detectedYtId.value})',
                          style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: _buildTextField(
                        controller: controller.videoUrlController,
                        hint: 'https://www.youtube.com/watch?v=... or youtu.be/...',
                        icon: Icons.link_rounded,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        onPressed: controller.addVideoUrlToCreatives,
                        icon: const Icon(Icons.add_rounded, color: Colors.white),
                        tooltip: 'add_to_creatives_btn'.tr,
                      ),
                    ),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.only(top: 6),
                  child: Text(
                    'Supports YouTube, Shorts, youtu.be, or direct online streaming MP4 links.',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                  ),
                ),
              ],
            );
          }

          // Upload Card for Images, Videos, PDFs
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, style: BorderStyle.solid),
            ),
            child: Column(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.cloud_upload_rounded, color: Color(0xFF818CF8), size: 28),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Upload Creative Assets',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Attach images, videos, or PDF documents to broadcast on screens',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
                const SizedBox(height: 14),

                // Action buttons based on active tab
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (controller.selectedCreativeType.value == 'All' || controller.selectedCreativeType.value == 'Image')
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: _buildSmallGradientBtn(
                          icon: Icons.image_rounded,
                          label: 'image_tab'.tr,
                          onTap: () => controller.pickMedia('Image'),
                        ),
                      ),
                    if (controller.selectedCreativeType.value == 'All' || controller.selectedCreativeType.value == 'Video')
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: _buildSmallGradientBtn(
                          icon: Icons.videocam_rounded,
                          label: 'video_tab'.tr,
                          onTap: () => controller.pickMedia('Video'),
                        ),
                      ),
                    if (controller.selectedCreativeType.value == 'All' || controller.selectedCreativeType.value == 'PDF')
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: _buildSmallGradientBtn(
                          icon: Icons.picture_as_pdf_rounded,
                          label: 'pdf'.tr,
                          onTap: () => controller.pickMedia('PDF'),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                const Text(
                  'Supported Formats: JPG, PNG, WEBP, MP4, MOV, PDF · Up to 50 MB each',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 16),

        // Creative Specifications Table
        Obx(() {
          final active = controller.creativeItems.isNotEmpty && controller.selectedPreviewIndex.value < controller.creativeItems.length
              ? controller.creativeItems[controller.selectedPreviewIndex.value]
              : (controller.creativeItems.isNotEmpty ? controller.creativeItems.first : null);

          final resolution = active?.resolution ?? '1920x1080';
          final duration = active != null ? '${active.durationSec}s' : '15s';
          final format = active != null
              ? (active.type == 'Video'
                  ? 'MP4 / Video'
                  : active.type == 'PDF'
                      ? 'pdf_document_tab'.tr
                      : active.type == 'URL'
                          ? 'Online Stream'
                          : 'PNG / JPG Image')
              : 'PNG / JPG Image';

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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'creative_specifications'.tr + (active != null ? ' (${active.name})' : ''),
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (active != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          'selected_for_preview'.tr,
                          style: const TextStyle(color: Color(0xFF818CF8),
                              fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _buildSpecTile('Resolution', resolution),
                    const SizedBox(width: 8),
                    _buildSpecTile('Aspect Ratio', '16:9'),
                    const SizedBox(width: 8),
                    _buildSpecTile('Duration', duration),
                    const SizedBox(width: 8),
                    _buildSpecTile('Format', format),
                  ],
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 16),

        // Display Mockup Preview (16:9 Transit Screen)
        _buildDisplayMockupPreview(),
        const SizedBox(height: 16),

        // Uploaded Creatives List with Duration picker & Delete
        _buildCreativeAssetsGallery(),
      ],
    );
  }

  Widget _buildDisplayMockupPreview() {
    return Obx(() {
      final active = controller.creativeItems.isNotEmpty && controller.selectedPreviewIndex.value < controller.creativeItems.length
          ? controller.creativeItems[controller.selectedPreviewIndex.value]
          : (controller.creativeItems.isNotEmpty ? controller.creativeItems.first : null);

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'display_mockup_preview'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              // if (active != null)
              //   Container(
              //     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              //     decoration: BoxDecoration(
              //       color: const Color(0xFF10B981).withValues(alpha: 0.15),
              //       borderRadius: BorderRadius.circular(6),
              //       border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
              //     ),
              //     child: Text(
              //       '● Previewing ${active.name} (${active.type})',
              //       style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
              //     ),
              //   )
               if (controller.selectedCreativeType.value == 'URL' && controller.detectedYtId.value.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                  ),
                  child: const Text(
                    '● Live YouTube Stream Player',
                    style: TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Standby Mockup',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),

          // 16:9 Black Screen Frame
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF030712),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1F2937), width: 3),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.5),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(13),
                child: Stack(
                  children: [
                    // Mockup Content
                    Positioned.fill(
                      child: _buildMockupInnerContent(active),
                    ),

                    // Top Bezel Header Badge
                    Positioned(
                      top: 8,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black87,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              'vmovexa_screen_preview'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildMockupInnerContent(CreativeItemModel? active) {
    if (active != null) {
      if (active.type == 'Video') {
        return Container(
          color: const Color(0xFF0B0F19),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.4),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 36),
              ),
              const SizedBox(height: 10),
              Text(
                active.name,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 3),
              Text(
                '${active.durationSec}s Video Playback · ${active.size}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
              ),
            ],
          ),
        );
      }

      if (active.type == 'PDF') {
        return Container(
          color: const Color(0xFF0F172A),
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.4)),
                ),
                child: const Icon(Icons.picture_as_pdf_rounded, color: Colors.redAccent, size: 28),
              ),
              const SizedBox(height: 8),
              Text(
                active.name,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 3),
              Text(
                '${'vector_pdf_creative'.tr} · ${active.size}',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
              ),
              const SizedBox(height: 6),
              Text(
                'pdf_broadcast_screen_hint'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      }

      if (active.type == 'URL') {
        return Container(
          color: const Color(0xFF0F172A),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.25),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.play_circle_fill_rounded, color: Colors.red, size: 38),
              ),
              const SizedBox(height: 8),
              Text(
                active.name,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 3),
              Text(
                active.videoUrl ?? 'online_video_stream'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      }

      // Default: Image
      if (active.localPath != null && active.localPath!.isNotEmpty) {
        final f = File(active.localPath!);
        if (f.existsSync()) {
          return Image.file(
            f,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => _buildPlaceholderGraphic(active.name),
          );
        }
      }
      if (active.previewUrl != null && active.previewUrl!.isNotEmpty) {
        return Image.network(
          active.previewUrl!,
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) => _buildPlaceholderGraphic(active.name),
        );
      }
      return _buildPlaceholderGraphic(active.name);
    }

    // Standby State
    return Container(
      color: const Color(0xFF0B0F19),
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.tv_rounded, color: AppColors.textMuted, size: 26),
          ),
          const SizedBox(height: 8),
          Text(
            'screen_standby_title'.tr,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 3),
          Text(
            'screen_standby_sub'.tr,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderGraphic(String title) {
    return Container(
      color: const Color(0xFF1E293B),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.image_rounded, color: AppColors.textMuted, size: 36),
            const SizedBox(height: 6),
            Text(title, style: const TextStyle(color: Colors.white70, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecTile(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B).withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallGradientBtn({required IconData icon, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
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
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: Colors.white),
            const SizedBox(width: 5),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCreativeAssetsGallery() {
    return Obx(() {
      if (controller.creativeItems.isEmpty) {
        return const SizedBox.shrink();
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Added Creatives (${controller.creativeItems.length})',
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          ...controller.creativeItems.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            final isSelectedForPreview = controller.selectedPreviewIndex.value == index;

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelectedForPreview ? const Color(0xFF6366F1) : AppColors.cardBorder,
                  width: isSelectedForPreview ? 1.5 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  // Radio/Selector for preview
                  InkWell(
                    onTap: () => controller.selectPreviewItem(index),
                    child: Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isSelectedForPreview ? const Color(0xFF6366F1) : Colors.transparent,
                        border: Border.all(
                          color: isSelectedForPreview ? const Color(0xFF6366F1) : AppColors.textMuted,
                          width: 1.5,
                        ),
                      ),
                      child: isSelectedForPreview
                          ? const Icon(Icons.check, size: 14, color: Colors.white)
                          : null,
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Media Icon
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      item.type == 'Video'
                          ? Icons.videocam_rounded
                          : item.type == 'PDF'
                              ? Icons.picture_as_pdf_rounded
                              : item.type == 'URL'
                                  ? Icons.smart_display_rounded
                                  : Icons.image_rounded,
                      color: item.type == 'Video'
                          ? const Color(0xFF60A5FA)
                          : item.type == 'PDF'
                              ? Colors.redAccent
                              : item.type == 'URL'
                                  ? Colors.red
                                  : const Color(0xFF34D399),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.name,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            // Container(
                            //   padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            //   decoration: BoxDecoration(
                            //     color: Colors.white.withValues(alpha: 0.08),
                            //     borderRadius: BorderRadius.circular(4),
                            //   ),
                            //   child: Text(
                            //     item.type,
                            //     style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9, fontWeight: FontWeight.bold),
                            //   ),
                            // ),
                            // const SizedBox(width: 6),
                            Text(
                              '${item.size} · ${item.resolution}',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Duration selector chips
                  PopupMenuButton<int>(
                    initialValue: item.durationSec,
                    onSelected: (d) => controller.updateCreativeDuration(item.id, d),
                    color: const Color(0xFF1E293B),
                    itemBuilder: (context) => [10, 15, 30, 60].map((d) {
                      return PopupMenuItem<int>(
                        value: d,
                        child: Text('${d}s ${'common_duration'.tr}', style: const TextStyle(color: Colors.white, fontSize: 11)),
                      );
                    }).toList(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          Text('${item.durationSec}s', style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.bold)),
                          const Icon(Icons.arrow_drop_down, color: AppColors.textMuted, size: 16),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Delete button
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                    onPressed: () => controller.removeCreativeItem(item.id),
                  ),
                ],
              ),
            );
          }),
        ],
      );
    });
  }

  // ==========================================================
  // STEP 3: TRANSIT INVENTORY (ROUTES, BUSES & SCREENS)
  // ==========================================================
  Widget _buildStep3RoutesAndScreens() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title & Subtitle matching Admin Panel
        _buildSectionHeader(
          title: 'step_transit_routes'.tr,
          subtitle: 'gov_step3_subtitle'.tr,
        ),
        const SizedBox(height: 12),

        // Live Selected Counter Badge matching Admin Panel
        Obx(() {
          final routesCount = controller.selectedTargets.length;
          final buses = controller.totalSelectedVehicles;
          final screens = controller.totalSelectedScreens;
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.25),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              '$routesCount routes · $buses buses · $screens screens',
              style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          );
        }),
        const SizedBox(height: 12),

        // Search Bar + City Dropdown Row (matching Admin Panel sm:grid-cols-[1fr_220px])
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: TextEditingController(text: controller.routeSearchQuery.value),
                hint: 'search_route_bus_hint'.tr,
                icon: Icons.search_rounded,
                onChanged: (v) => controller.routeSearchQuery.value = v,
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              width: 120,
              child: Obx(() => _buildDropdown(
                value: controller.selectedCityFilter.value,
                items: controller.availableCities,
                onChanged: (v) {
                  if (v != null) controller.selectedCityFilter.value = v;
                },
              )),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Routes Tree
        Obx(() {
          if (controller.isLoadingFleets.value) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(color: Color(0xFF6366F1)),
              ),
            );
          }

          if (controller.filteredTransitRoutes.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.center,
              child: Text('routes_not_found_msg'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
            );
          }

          return Column(
            children: controller.filteredTransitRoutes.map((route) {
              return _buildRouteTreeItem(route);
            }).toList(),
          );
        }),
      ],
    );
  }

  Widget _buildRouteTreeItem(TransitRouteModel route) {
    return Obx(() {
      final isSelected = controller.isRouteSelected(route.id);
      final isExpanded = controller.expandedRoutes[route.id] ?? false;
      final target = controller.getTargetForRoute(route.id);

      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB).withValues(alpha: 0.1) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Checkbox(
                    value: isSelected,
                    activeColor: const Color(0xFF6366F1),
                    onChanged: (_) => controller.toggleRoute(route),
                  ),
                  Expanded(
                    child: InkWell(
                      onTap: () => controller.toggleRouteExpanded(route.id),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                route.name,
                                style: const TextStyle(color: Colors.white,
                                    fontSize: 12.5, fontWeight: FontWeight.bold),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  route.code,
                                  style: const TextStyle(color: Colors.white70, fontSize: 9.5, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${route.fleetName} · ${route.city.isNotEmpty ? route.city : 'Transit Network'}',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${isSelected ? (target?.vehicleIds.length ?? target?.vehicleCount ?? 0) : route.vehicleCount} buses',
                        style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${isSelected ? (target?.totalScreens ?? 0) : route.totalScreens} screens',
                        style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: () => controller.toggleRouteExpanded(route.id),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: Size.zero,
                    ),
                    child: Text(
                      isExpanded ? 'hide_btn'.tr : 'details_btn'.tr,
                      style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

            if (isExpanded && route.vehicles.isNotEmpty) ...[
              const Divider(color: AppColors.cardBorder, height: 1),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Column(
                  children: route.vehicles.map((vehicle) {
                    final vKey = '${route.id}_${vehicle.id}';
                    final isBusExpanded = controller.expandedBuses[vKey] ?? false;
                    final isBusSelected = target?.vehicleIds.contains(vehicle.id) ?? false;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B).withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Checkbox(
                                value: isBusSelected,
                                activeColor: const Color(0xFF6366F1),
                                onChanged: (_) => controller.toggleBus(route, vehicle),
                              ),
                              Expanded(
                                child: Text(
                                  vehicle.busNumber,
                                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                                ),
                              ),
                              Text(
                                '${vehicle.displaysCount} screens',
                                style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10.5, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 8),
                              TextButton(
                                onPressed: () => controller.toggleBusExpanded(vKey),
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  minimumSize: Size.zero,
                                ),
                                child: Text(
                                  isBusExpanded ? 'hide_screens'.tr : 'view_screens'.tr,
                                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          if (isBusExpanded && vehicle.screens.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: vehicle.screens.map((screen) {
                                final isScreenSelected = target?.screenIds.contains(screen.id) ?? false;
                                return InkWell(
                                  onTap: () => controller.toggleScreen(route, vehicle, screen),
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    width: 140,
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: isScreenSelected ? const Color(0xFF2563EB).withValues(alpha: 0.2) : const Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: isScreenSelected ? const Color(0xFF3B82F6) : Colors.white12,
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Checkbox(
                                          value: isScreenSelected,
                                          activeColor: const Color(0xFF6366F1),
                                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                          visualDensity: VisualDensity.compact,
                                          onChanged: (_) => controller.toggleScreen(route, vehicle, screen),
                                        ),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                screen.code,
                                                style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              Text(
                                                '${screen.type} · ${screen.resolution}',
                                                style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                        Container(
                                          width: 6,
                                          height: 6,
                                          decoration: BoxDecoration(
                                            color: screen.status == 'active' ? const Color(0xFF10B981) : Colors.grey,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ],
        ),
      );
    });
  }

  // ==========================================================
  // STEP 4: SCHEDULE & OPERATING WINDOW
  // ==========================================================
  Widget _buildStep4Schedule() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header matching Admin Panel
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded, size: 20, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'step_broadcast_schedule'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Configure campaign flight calendar dates, repeat frequency, active weekly days, and daily bus screen operating hours.',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
            Obx(() => Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.access_time_rounded, size: 12, color: Color(0xFF60A5FA)),
                  const SizedBox(width: 4),
                  Text(
                    '${controller.durationDaysNumber} ${'days_flight_label'.tr} (${controller.activeBroadcastDaysCount} ${'active_days_label'.tr})',
                    style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )),
          ],
        ),
        const SizedBox(height: 16),

        // Quick Duration Presets
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.bolt_rounded, size: 16, color: Color(0xFFF59E0B)),
                    const SizedBox(width: 6),
                    const Text(
                      'Quick Duration Presets',
                      style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const Text(
                  'Click to set flight window instantly',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Obx(() {
              final activeDays = controller.durationDaysNumber;
              final presets = [
                {'days': 7, 'label': 'preset_7_days'.tr, 'sub': 'preset_1_week_flight'.tr},
                {'days': 14, 'label': 'preset_14_days'.tr, 'sub': 'preset_2_weeks_std'.tr},
                {'days': 30, 'label': 'preset_30_days'.tr, 'sub': 'preset_1_month_full'.tr},
                {'days': 60, 'label': 'preset_60_days'.tr, 'sub': 'preset_2_months_ext'.tr},
                {'days': 90, 'label': 'preset_90_days'.tr, 'sub': 'preset_quarterly_campaign'.tr},
              ];

              return LayoutBuilder(
                builder: (context, constraints) {
                  return Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: presets.map((p) {
                      final days = p['days'] as int;
                      final isSelected = activeDays == days;
                      final itemWidth = (constraints.maxWidth - (presets.length > 2 ? 16 : 8)) / 2;

                      return SizedBox(
                        width: constraints.maxWidth > 500 ? (constraints.maxWidth - 32) / 5 : itemWidth,
                        child: InkWell(
                          onTap: () => controller.setDurationPreset(days),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: isSelected ? AppTheme.primaryGradient : null,
                              color: isSelected ? null : AppColors.cardBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? Colors.transparent : AppColors.cardBorder,
                                width: isSelected ? 1.5 : 1.0,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      )
                                    ]
                                  : null,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      p['label'] as String,
                                      style: TextStyle(
                                        color: isSelected ? Colors.white : Colors.white70,
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (isSelected)
                                      const Icon(Icons.check_circle_rounded, size: 13, color: Colors.white),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  p['sub'] as String,
                                  style: TextStyle(
                                    color: isSelected ? Colors.white.withValues(alpha: 0.85) : AppColors.textMuted,
                                    fontSize: 9.5,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  );
                },
              );
            }),
          ],
        ),
        const SizedBox(height: 16),

        // Start Date & End Date Grid
        LayoutBuilder(builder: (context, constraints) {
          final isNarrow = constraints.maxWidth < 600;
          return isNarrow
              ? Column(
                  children: [
                    _buildStartDateCard(),
                    const SizedBox(height: 12),
                    _buildEndDateCard(),
                  ],
                )
              : Row(
                  children: [
                    Expanded(child: _buildStartDateCard()),
                    const SizedBox(width: 12),
                    Expanded(child: _buildEndDateCard()),
                  ],
                );
        }),
        const SizedBox(height: 16),

        // Repeat Frequency
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.refresh_rounded, size: 16, color: Color(0xFF3B82F6)),
                SizedBox(width: 6),
                Text(
                  'Repeat Frequency',
                  style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Obx(() {
              final freq = controller.repeatFrequency.value;
              final items = [
                {
                  'key': 'Daily',
                  'title': 'repeat_daily_everyday'.tr,
                  'sub': 'Mon–Sun (All 7 Days)',
                  'icon': Icons.sync_rounded,
                },
                {
                  'key': 'Weekdays',
                  'title': 'repeat_weekdays_only'.tr,
                  'sub': 'Mon–Fri (Work Rush)',
                  'icon': Icons.work_outline_rounded,
                },
                {
                  'key': 'Weekends',
                  'title': 'repeat_weekends_only'.tr,
                  'sub': 'Sat–Sun (Leisure)',
                  'icon': Icons.weekend_outlined,
                },
                {
                  'key': 'Custom',
                  'title': 'repeat_custom_days'.tr,
                  'sub': 'Handpick Days',
                  'icon': Icons.calendar_month_rounded,
                },
              ];

              return LayoutBuilder(builder: (context, c) {
                final w = (c.maxWidth - 24) / 4;
                final isSmall = c.maxWidth < 550;
                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: items.map((it) {
                    final key = it['key'] as String;
                    final isSel = freq == key;
                    final itemWidth = isSmall ? (c.maxWidth - 8) / 2 : w;

                    return SizedBox(
                      width: itemWidth,
                      child: InkWell(
                        onTap: () => controller.setRepeatPreset(key),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            gradient: isSel ? AppTheme.primaryGradient : null,
                            color: isSel ? null : AppColors.cardBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSel ? Colors.transparent : AppColors.cardBorder,
                              width: isSel ? 1.5 : 1.0,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    it['icon'] as IconData,
                                    size: 14,
                                    color: isSel ? Colors.white : const Color(0xFF60A5FA),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      it['title'] as String,
                                      style: TextStyle(
                                        color: isSel ? Colors.white : Colors.white70,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                it['sub'] as String,
                                style: TextStyle(
                                  color: isSel ? Colors.white.withValues(alpha: 0.8) : AppColors.textMuted,
                                  fontSize: 9.5,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                );
              });
            }),
          ],
        ),
        const SizedBox(height: 16),

        // Active Broadcast Days Selector (7 of 7)
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Obx(() => Row(
                    children: [
                      const Icon(Icons.date_range_rounded, size: 16, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 6),
                      Text(
                        '${'active_broadcast_days_title'.tr} (${controller.selectedDays.length} ${'active_days_of_7_count'.tr})',
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  )),
                  // Row(
                  //   children: [
                  //     InkWell(
                  //       onTap: () => controller.setRepeatPreset('Daily'),
                  //       child: const Text('All 7 Days', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.bold)),
                  //     ),
                  //     const Text(' · ', style: TextStyle(color: AppColors.textMuted, fontSize: 10.5)),
                  //     InkWell(
                  //       onTap: () => controller.setRepeatPreset('Weekdays'),
                  //       child: const Text('Mon–Fri', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.bold)),
                  //     ),
                  //     const Text(' · ', style: TextStyle(color: AppColors.textMuted, fontSize: 10.5)),
                  //     InkWell(
                  //       onTap: () => controller.setRepeatPreset('Weekends'),
                  //       child: const Text('Sat–Sun', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.bold)),
                  //     ),
                  //   ],
                  // ),
                ],
              ),
              const SizedBox(height: 12),
              Obx(() {
                final daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return Row(
                  children: daysList.map((day) {
                    final isSel = controller.selectedDays.contains(day);
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2.5),
                        child: InkWell(
                          onTap: () => controller.toggleDay(day),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              gradient: isSel ? AppTheme.primaryGradient : null,
                              color: isSel ? null : const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isSel ? Colors.transparent : AppColors.cardBorder,
                              ),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  day.toUpperCase(),
                                  style: TextStyle(
                                    color: isSel ? Colors.white : AppColors.textMuted,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  isSel ? 'broadcast_on'.tr : 'broadcast_off'.tr,
                                  style: TextStyle(
                                    color: isSel ? Colors.white.withValues(alpha: 0.9) : AppColors.textMuted,
                                    fontSize: 8.5,
                                    fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
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
              }),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Daily Display Airtime Window
        Container(
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.schedule_rounded, size: 16, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 6),
                      Text(
                        'daily_display_airtime_window'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  // Obx(() => Container(
                  //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  //   decoration: BoxDecoration(
                  //     color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  //     borderRadius: BorderRadius.circular(12),
                  //     border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                  //   ),
                  //   child: Text(
                  //     '${controller.dailyOperatingHours} Hours / Day Active',
                  //     style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9.5, fontWeight: FontWeight.bold),
                  //   ),
                  // )),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'daily_transit_window_desc'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
              ),
              const SizedBox(height: 12),

              // 4 Time Slot Presets
              Obx(() {
                final curStart = controller.dailySlotStart.value;
                final curEnd = controller.dailySlotEnd.value;
                final slots = [
                  {'start': '08:00', 'end': '22:00', 'label': 'slot_prime_transit'.tr, 'sub': '08:00 – 22:00 (14h)', 'best': true},
                  {'start': '06:00', 'end': '23:00', 'label': 'slot_full_day'.tr, 'sub': '06:00 – 23:00 (17h)', 'best': false},
                  {'start': '07:00', 'end': '12:00', 'label': 'slot_morning_rush'.tr, 'sub': '07:00 – 12:00 (5h)', 'best': false},
                  {'start': '16:00', 'end': '22:00', 'label': 'slot_evening_rush'.tr, 'sub': '16:00 – 22:00 (6h)', 'best': false},
                ];

                return LayoutBuilder(builder: (context, c) {
                  final isSmall = c.maxWidth < 550;
                  final w = isSmall ? (c.maxWidth - 8) / 2 : (c.maxWidth - 24) / 4;
                  return Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: slots.map((s) {
                      final isSel = curStart == s['start'] && curEnd == s['end'];
                      return SizedBox(
                        width: w,
                        child: InkWell(
                          onTap: () => controller.handleTimeSlotPreset(s['start'] as String, s['end'] as String),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.all(9),
                            decoration: BoxDecoration(
                              gradient: isSel ? AppTheme.primaryGradient : null,
                              color: isSel ? null : const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSel ? Colors.transparent : AppColors.cardBorder,
                                width: isSel ? 1.5 : 1.0,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        s['label'] as String,
                                        style: TextStyle(
                                          color: isSel ? Colors.white : Colors.white70,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (s['best'] == true)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF59E0B),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text('badge_best'.tr, style: const TextStyle(color: Colors.black, fontSize: 8.5, fontWeight: FontWeight.bold)),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  s['sub'] as String,
                                  style: TextStyle(
                                    color: isSel ? Colors.white.withValues(alpha: 0.8) : AppColors.textMuted,
                                    fontSize: 9.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  );
                });
              }),
              const SizedBox(height: 14),

              // Auto-synced Airtime Inputs
              Row(
                children: [
                  Expanded(
                    child: Obx(() => Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.wb_sunny_rounded, size: 12, color: Color(0xFFF59E0B)),
                              const SizedBox(width: 4),
                              Text('airtime_start_time'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(controller.dailySlotStart.value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                          Text('auto_synced_broadcast_start'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        ],
                      ),
                    )),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Obx(() => Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.nightlight_round, size: 12, color: Color(0xFF818CF8)),
                              const SizedBox(width: 4),
                              Text('airtime_end_time'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(controller.dailySlotEnd.value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                          Text('auto_synced_broadcast_end'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        ],
                      ),
                    )),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Route Slot Availability Banner
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
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
                    const Expanded(
                      child: Text(
                        'Slot available for the selected routes, buses, screens, days, and time window.',
                        style: TextStyle(color: Color(0xFF34D399), fontSize: 10.5, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // 24h Visual Airtime Progress Bar
              Obx(() {
                final startParts = controller.dailySlotStart.value.split(':');
                final endParts = controller.dailySlotEnd.value.split(':');
                final startHour = int.tryParse(startParts[0]) ?? 8;
                final startMin = int.tryParse(startParts.length > 1 ? startParts[1] : '0') ?? 0;
                final endHour = int.tryParse(endParts[0]) ?? 22;
                final endMin = int.tryParse(endParts.length > 1 ? endParts[1] : '0') ?? 0;

                final startFraction = (startHour + startMin / 60.0) / 24.0;
                final endFraction = (endHour + endMin / 60.0) / 24.0;
                final widthFraction = (endFraction - startFraction).clamp(0.0, 1.0);

                return Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('time_00_night'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                        Text(
                          '${'active_airtime_label'.tr}: ${controller.dailySlotStart.value} - ${controller.dailySlotEnd.value} (${controller.dailyOperatingHours} ${'hours_unit'.tr})',
                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                        // const Text('24:00 (Midnight)', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Container(
                      height: 10,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: LayoutBuilder(
                        builder: (context, box) {
                          return Stack(
                            children: [
                              Positioned(
                                left: box.maxWidth * startFraction,
                                width: box.maxWidth * widthFraction,
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
                );
              }),
              const SizedBox(height: 12),

              // Timezone Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.public_rounded, size: 16, color: Color(0xFF3B82F6)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('IST (UTC+05:30)', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          Text('edge_iot_sync_note'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle_rounded, size: 10, color: Color(0xFF34D399)),
                          const SizedBox(width: 4),
                          Text('gps_transit_synced'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Live Broadcast Intelligence Card
        Obx(() => Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF020617)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'live_broadcast_intelligence'.tr,
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '${controller.durationDaysNumber} Days Flight · ${controller.repeatFrequency.value} Broadcast Schedule',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                '${DateFormat('dd MMM yyyy').format(controller.startDate.value)} → ${DateFormat('dd MMM yyyy').format(controller.endDate.value)} (${controller.activeBroadcastDaysCount} Active Broadcast Days)',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
              ),
              const SizedBox(height: 14),

              // 4 Stat Tiles
              Row(
                children: [
                  Expanded(
                    child: _buildIntelTile(
                      label: 'active_days_per_week'.tr,
                      value: '${controller.selectedDays.length} Days',
                      sub: controller.repeatFrequency.value,
                      valColor: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildIntelTile(
                      label: 'daily_airtime_label'.tr,
                      value: '${controller.dailyOperatingHours}h',
                      sub: '${controller.dailySlotStart.value}–${controller.dailySlotEnd.value}',
                      valColor: const Color(0xFF60A5FA),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildIntelTile(
                      label: 'total_airtime_label'.tr,
                      value: '~${controller.totalAirtimeHours}h',
                      sub: '${controller.activeBroadcastDaysCount} days / scr',
                      valColor: const Color(0xFFC084FC),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildIntelTile(
                      label: 'estimated_loop_cycles'.tr,
                      value: '~${controller.estimatedLoopsPerDay}',
                      sub: '30 plays/hr',
                      valColor: const Color(0xFF34D399),
                    ),
                  ),
                ],
              ),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildStartDateCard() {
    return Container(
      padding: const EdgeInsets.all(12),
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
              Row(
                children: [
                  const Icon(Icons.rocket_launch_rounded, size: 14, color: Color(0xFF3B82F6)),
                  const SizedBox(width: 6),
                  Text(
                    'broadcast_start_datetime'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('launch_date_badge'.tr, style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Obx(() => _buildDateSelector(
                  date: controller.startDate.value,
                  onTap: () => controller.selectStartDatePicker(Get.context!),
                )),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Obx(() => _buildTimeSelector(
                  label: 'start_time_label'.tr,
                  timeStr: controller.dailySlotStart.value,
                  onTap: () => controller.selectStartTime(Get.context!),
                )),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() => Text(
            '${DateFormat('dd MMM yyyy').format(controller.startDate.value)} · ${controller.dailySlotStart.value}',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
          )),
        ],
      ),
    );
  }

  Widget _buildEndDateCard() {
    return Container(
      padding: const EdgeInsets.all(12),
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
              Row(
                children: [
                  const Icon(Icons.flag_rounded, size: 14, color: Color(0xFF818CF8)),
                  const SizedBox(width: 6),
                  Text(
                    'broadcast_end_datetime'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF818CF8).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('expiry_date_badge'.tr, style: const TextStyle(color: Color(0xFFA5B4FC), fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Obx(() => _buildDateSelector(
                  date: controller.endDate.value,
                  onTap: () => controller.selectEndDatePicker(Get.context!),
                )),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Obx(() => _buildTimeSelector(
                  label: 'end_time_label'.tr,
                  timeStr: controller.dailySlotEnd.value,
                  onTap: () => controller.selectEndTime(Get.context!),
                )),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() => Text(
            '${DateFormat('dd MMM yyyy').format(controller.endDate.value)} · ${controller.dailySlotEnd.value}',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
          )),
        ],
      ),
    );
  }

  Widget _buildIntelTile({required String label, required String value, required String sub, required Color valColor}) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 8.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: valColor, fontSize: 12, fontWeight: FontWeight.w900)),
          const SizedBox(height: 1),
          Text(sub, style: const TextStyle(color: Color(0xFF64748B), fontSize: 8), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  // ==========================================================
  // STEP 5: BUDGET BREAKDOWN & CITIZEN QR IDENTITY
  // ==========================================================
  Widget _buildStep5BudgetAndQr() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          title: 'step_budget_breakdown'.tr,
          subtitle: 'gov_pricing_step_subtitle'.tr,
        ),
        const SizedBox(height: 16),

        // Base Airtime Broadcast Fee (₹)
        _buildCard(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildFieldLabel('base_airtime_broadcast_fee'.tr, isRequired: true),
                // Container(
                //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                //   decoration: BoxDecoration(
                //     color: const Color(0xFF1E293B),
                //     borderRadius: BorderRadius.circular(6),
                //     border: Border.all(color: AppColors.cardBorder),
                //   ),
                //   child: Text('base_flight_investment'.tr,
                //       style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                // ),
              ],
            ),
            const SizedBox(height: 6),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: TextField(
                controller: controller.baseAmountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                onChanged: (_) => controller.breakdownItems.refresh(),
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.currency_rupee_rounded, color: Colors.white70, size: 20),
                  hintText: '25000',
                  hintStyle: TextStyle(color: AppColors.textMuted),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Enter standard base broadcast rate before custom surcharges and taxes.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 10),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Itemized Payment Breakdown Builder
        _buildCard(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Itemized Payment Breakdown',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Add dynamic custom charges, discounts, and taxes.',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                    ),
                  ],
                ),

              ],
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: controller.addBreakdownItem,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
                child: Text(
                  'add_line_item_btn'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Dynamic Breakdown Items
            Obx(() {
              if (controller.breakdownItems.isEmpty) {
                return Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B).withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder, style: BorderStyle.solid),
                  ),
                  child: Column(
                    children: [
                      Text('no_custom_line_items'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('click_add_line_item_hint'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10), textAlign: TextAlign.center),
                    ],
                  ),
                );
              }

              return Column(
                children: controller.breakdownItems.map((item) {
                  final isTax = item.type == 'tax' || item.key.contains('GST');

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Column(
                      children: [
                        // Row 1: Item Preset Dropdown + Type + Delete
                        Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('item_col_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.cardBorder),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<String>(
                                        value: [
                                          'GST_CGST', 'GST_SGST', 'GST_IGST', 'GST_CESS',
                                          'FEE_AIRTIME_BROADCAST', 'FEE_HARDWARE_RENTAL', 'FEE_CREATIVE_DESIGN', 'FEE_ONBOARDING_SETUP',
                                          'DISCOUNT_VOLUME', 'DISCOUNT_PROMO', 'CUSTOM',
                                        ].contains(item.key) ? item.key : 'CUSTOM',
                                        dropdownColor: const Color(0xFF1E293B),
                                        isExpanded: true,
                                        icon: const Icon(Icons.arrow_drop_down, color: Colors.white70, size: 18),
                                        style: const TextStyle(color: Colors.white, fontSize: 11),
                                        items: [
                                          DropdownMenuItem<String>(enabled: false, value: 'HEADER_TAX', child: Text('statutory_taxes_group'.tr, style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 9.5, fontWeight: FontWeight.bold))),
                                          DropdownMenuItem<String>(value: 'GST_CGST', child: Text('item_cgst_9'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(value: 'GST_SGST', child: Text('item_sgst_9'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(value: 'GST_IGST', child: Text('item_igst_18'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(value: 'GST_CESS', child: Text('item_gst_cess'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(enabled: false, value: 'HEADER_COMM', child: Text('commercial_charges_group'.tr, style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9.5, fontWeight: FontWeight.bold))),
                                          DropdownMenuItem<String>(value: 'FEE_AIRTIME_BROADCAST', child: Text('item_airtime_fee'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(value: 'FEE_HARDWARE_RENTAL', child: Text('item_hardware_rental'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(value: 'FEE_CREATIVE_DESIGN', child: Text('item_creative_design'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(value: 'FEE_ONBOARDING_SETUP', child: Text('item_onboarding_setup'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(enabled: false, value: 'HEADER_DISC', child: Text('discounts_group'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold))),
                                          DropdownMenuItem<String>(value: 'DISCOUNT_VOLUME', child: Text('item_discount_volume'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(value: 'DISCOUNT_PROMO', child: Text('item_discount_promo'.tr, style: const TextStyle(fontSize: 11))),
                                          DropdownMenuItem<String>(enabled: false, value: 'HEADER_CUST', child: Text('custom_item_group'.tr, style: const TextStyle(color: Colors.white70, fontSize: 9.5, fontWeight: FontWeight.bold))),
                                          DropdownMenuItem<String>(value: 'CUSTOM', child: Text('item_custom_fee'.tr, style: const TextStyle(fontSize: 11))),
                                        ],
                                        onChanged: (val) {
                                          if (val != null && !val.startsWith('HEADER_')) {
                                            controller.selectBreakdownPreset(item.id, val);
                                          }
                                        },
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('type_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.cardBorder),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<String>(
                                        value: item.type,
                                        dropdownColor: const Color(0xFF1E293B),
                                        isExpanded: true,
                                        icon: const Icon(Icons.arrow_drop_down, color: Colors.white70, size: 18),
                                        style: const TextStyle(color: Colors.white, fontSize: 11),
                                        items: [
                                          DropdownMenuItem<String>(value: 'charge', child: Text('charge_plus'.tr, style: const TextStyle(fontSize: 11, color: Color(0xFF60A5FA)))),
                                          DropdownMenuItem<String>(value: 'discount', child: Text('discount_minus'.tr, style: const TextStyle(fontSize: 11, color: Color(0xFF34D399)))),
                                          DropdownMenuItem<String>(value: 'tax', child: Text('tax_plus'.tr, style: const TextStyle(fontSize: 11, color: Color(0xFFF59E0B)))),
                                        ],
                                        onChanged: (val) {
                                          if (val != null) controller.updateBreakdownItemType(item.id, val);
                                        },
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 6),
                            IconButton(
                              icon: const Icon(Icons.close_rounded, color: Color(0xFFEF4444), size: 18),
                              onPressed: () => controller.removeBreakdownItem(item.id),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Row 2: Description + Amount with shortcuts
                        Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('description_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.cardBorder),
                                    ),
                                    child: TextField(
                                      controller: TextEditingController(text: item.label)..selection = TextSelection.collapsed(offset: item.label.length),
                                      style: const TextStyle(color: Colors.white, fontSize: 11),
                                      decoration: InputDecoration(
                                        hintText: 'item_description_hint'.tr,
                                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                                        border: InputBorder.none,
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                      ),
                                      onChanged: (val) => controller.updateBreakdownItemLabel(item.id, val),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('amount_inr'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                                      if (isTax)
                                        Row(
                                          children: [
                                            InkWell(
                                              onTap: () {
                                                final taxVal = (controller.baseAmountNum * 0.09).roundToDouble();
                                                controller.updateBreakdownItemAmount(item.id, taxVal);
                                              },
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFF818CF8).withValues(alpha: 0.2),
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: const Text('9%', style: TextStyle(color: Color(0xFFA5B4FC), fontSize: 8.5, fontWeight: FontWeight.bold)),
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            InkWell(
                                              onTap: () {
                                                final taxVal = (controller.baseAmountNum * 0.18).roundToDouble();
                                                controller.updateBreakdownItemAmount(item.id, taxVal);
                                              },
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFF818CF8).withValues(alpha: 0.2),
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: const Text('18%', style: TextStyle(color: Color(0xFFA5B4FC), fontSize: 8.5, fontWeight: FontWeight.bold)),
                                              ),
                                            ),
                                          ],
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.cardBorder),
                                    ),
                                    child: TextField(
                                      controller: controller.getAmountController(item),
                                      keyboardType: TextInputType.number,
                                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                      decoration: const InputDecoration(
                                        prefixText: '₹ ',
                                        prefixStyle: TextStyle(color: AppColors.textMuted, fontSize: 11),
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                      ),
                                      onChanged: (val) {
                                        final numVal = double.tryParse(val) ?? 0.0;
                                        controller.updateBreakdownItemAmount(item.id, numVal);
                                      },
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
                }).toList(),
              );
            }),
          ],
        ),
        const SizedBox(height: 16),

        // Payment Invoice Summary (Live Calculation)
        Obx(() => Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('payment_invoice_summary_title'.tr, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                    ),
                    child: Text('live_calculation'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const Divider(color: Color(0xFF1E293B), height: 20),

              // Base Airtime Fee
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('base_airtime_playback_fee'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  Text('₹${controller.baseAmountNum.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 6),

              // Items
              ...controller.breakdownItems.map((it) {
                final isDiscount = it.type == 'discount';
                final isTax = it.type == 'tax';
                final sign = isDiscount ? '- ' : '+ ';
                final color = isDiscount ? const Color(0xFF34D399) : (isTax ? const Color(0xFFF59E0B) : const Color(0xFF60A5FA));

                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          it.label,
                          style: TextStyle(color: color, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '$sign₹${it.amount.toStringAsFixed(0)}',
                        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                );
              }),

              const Divider(color: Color(0xFF1E293B), height: 16),

              // Subtotal Net
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('subtotal_net'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  Text('₹${controller.subtotalNet.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              const Divider(color: Color(0xFF334155), height: 20),

              // Total Payable Amount
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('total_payable_amount'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 11.5, fontWeight: FontWeight.bold)),
                      Text('official_billing_estimate'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    ],
                  ),
                  Text(
                    '₹${controller.finalTotalAmount.toStringAsFixed(0)}',
                    style: const TextStyle(color: Color(0xFF34D399), fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.bolt_rounded, size: 14, color: Color(0xFFF59E0B)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'exact_calc_saved_note'.tr,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        )),
        const SizedBox(height: 20),

        // Dynamic QR Code Identity Card
        _buildCard(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text('active_dynamic_qr'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
                Obx(() => Text(
                  controller.qrCodeId.value,
                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                )),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'dynamic_qr_identity_title'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 2),
            Text(
              'qr_commuters_scanning_desc'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5, height: 1.4),
            ),
            const SizedBox(height: 14),

            // Rendered QR Code Box
            Center(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Obx(() => CustomPaint(
                        size: const Size(130, 130),
                        painter: DummyQrCodePainter(qrData: controller.qrCodeId.value),
                      )),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'scan_camera_track_lead'.tr.toUpperCase(),
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Tracking Gateway URL Box
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  Text('${'tracking_gateway_label'.tr} ', style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5, fontWeight: FontWeight.w600)),
                  Expanded(
                    child: Obx(() => Text(
                      controller.trackingGatewayUrl,
                      style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    )),
                  ),
                  InkWell(
                    onTap: controller.copyTrackingGatewayUrl,
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4),
                      child: Icon(Icons.copy_rounded, size: 14, color: Color(0xFF60A5FA)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Citizen Portal URL Input
            _buildFieldLabel('citizen_portal_destination_url'.tr),
            _buildTextField(
              controller: controller.qrRedirectUrlController,
              hint: 'https://citizen.mp.gov.in/portal/advisory',
              icon: Icons.link_rounded,
            ),
            const SizedBox(height: 14),

            // Action Buttons: Share QR & Download QR
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: controller.shareQrCode,
                    icon: const Icon(Icons.share_rounded, size: 14, color: Colors.white),
                    label: Text('share_qr_action'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: InkWell(
                    onTap: controller.downloadQrCode,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      height: 40,
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
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.download_rounded, size: 14, color: Colors.white),
                          const SizedBox(width: 6),
                          Text('download_save_qr_action'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  // ==========================================================
  // STEP 6: REVIEW & CLEARANCE SUBMIT
  // ==========================================================
  Widget _buildStep6ReviewSubmit() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.description_rounded, size: 20, color: Color(0xFF3B82F6)),
                    const SizedBox(width: 8),
                    Row(
                      children: [
                        Text(
                          'step_review_publish'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF34D399)),
                              const SizedBox(width: 4),
                              Text('ready_final_submission'.tr,

                                  style: const TextStyle(
                                      color: Color(0xFF34D399), fontSize: 9.5,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'review_clearance_desc'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),

          ],
        ),
        const SizedBox(height: 16),

        // Section 1: Campaign Overview & Metadata
        _buildReviewSectionCard(
          stepNumber: 1,
          title: 'review_campaign_overview'.tr,
          onEdit: () => controller.goToStep(1),
          children: [
            _buildReviewGrid([
              {'label': 'campaign_name_text'.tr, 'value': controller.nameController.text.trim().isNotEmpty ? controller.nameController.text.trim() : '–'},
              {'label': 'brand_product'.tr, 'value': controller.brandNameController.text.trim().isNotEmpty ? controller.brandNameController.text.trim() : '–'},
              {'label': 'campaign_type_label'.tr, 'value': controller.selectedCampaignType.value},
              {'label': 'objective_text'.tr, 'value': controller.selectedObjective.value},
              {'label': 'category'.tr, 'value': controller.selectedCategory.value},
            ]),
            if (controller.descriptionController.text.trim().isNotEmpty) ...[
              const SizedBox(height: 10),
              Text('review_campaign_brief'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  controller.descriptionController.text.trim(),
                  style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.3),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 14),

        // Section 2: Department / Agency Details & Location
        _buildReviewSectionCard(
          stepNumber: 1,
          title: 'review_department_details'.tr,
          onEdit: () => controller.goToStep(1),
          children: [
            _buildReviewGrid([
              {'label': 'gov_nodal_officer_name'.tr, 'value': controller.clientNameController.text.trim().isNotEmpty ? controller.clientNameController.text.trim() : '–'},
              {'label': 'department'.tr, 'value': controller.clientCompanyController.text.trim().isNotEmpty ? controller.clientCompanyController.text.trim() : 'department'.tr},
              {'label': 'contact_phone'.tr, 'value': controller.clientPhoneController.text.trim().isNotEmpty ? controller.clientPhoneController.text.trim() : '–'},
              {'label': 'official_email_label'.tr, 'value': controller.clientEmailController.text.trim().isNotEmpty ? controller.clientEmailController.text.trim() : '–'},
              {'label': 'city_region'.tr, 'value': [controller.clientCityController.text.trim(), controller.clientStateController.text.trim()].where((s) => s.isNotEmpty).join(', ')},
              {'label': 'department_address'.tr, 'value': controller.clientAddressController.text.trim().isNotEmpty ? controller.clientAddressController.text.trim() : '–'},
            ]),
            if (controller.clientLatitude.value != null && controller.clientLongitude.value != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF60A5FA)),
                  const SizedBox(width: 4),
                  Text(
                    '${'gps_coordinates_label'.tr}: ${controller.clientLatitude.value!.toStringAsFixed(5)}, ${controller.clientLongitude.value!.toStringAsFixed(5)}',
                    style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontFamily: 'monospace'),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text('verified_gps'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 8.5, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ],
        ),
        const SizedBox(height: 14),

        // Section 3: Advertisement Creative Assets
        _buildReviewSectionCard(
          stepNumber: 2,
          title: 'review_creative_assets'.tr,
          onEdit: () => controller.goToStep(2),
          badge: '${controller.creativeItems.length} ${'attached_badge'.tr}',
          children: [
            if (controller.creativeItems.isEmpty)
              Text('no_creative_attached_yet'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontStyle: FontStyle.italic))
            else
              Column(
                children: controller.creativeItems.map((c) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            c.type == 'Video' ? Icons.videocam_rounded : (c.type == 'PDF' ? Icons.picture_as_pdf_rounded : (c.type == 'URL' ? Icons.link_rounded : Icons.image_rounded)),
                            size: 18,
                            color: const Color(0xFF60A5FA),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(c.name, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                              Text('${c.type} · ${c.size} · ${c.resolution} · ${c.durationSec}s', style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
        const SizedBox(height: 14),

        // Section 4: Transit Routes & Screen Inventory
        _buildReviewSectionCard(
          stepNumber: 3,
          title: 'review_transit_routes'.tr,
          onEdit: () => controller.goToStep(3),
          badge: '${controller.totalSelectedVehicles} ${'buses_unit'.tr} · ${controller.totalSelectedScreens} ${'screens_unit'.tr}',
          children: [
            Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    label: 'selected_routes_metric'.tr,
                    value: '${controller.selectedTargets.length} ${'corridors_unit'.tr}',
                    icon: Icons.alt_route_rounded,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMetricTile(
                    label: 'transit_buses'.tr,
                    value: '${controller.totalSelectedVehicles} ${'buses_unit'.tr}',
                    icon: Icons.directions_bus_rounded,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMetricTile(
                    label: 'total_screens_metric'.tr,
                    value: '${controller.totalSelectedScreens} ${'displays_unit'.tr}',
                    icon: Icons.tv_rounded,
                  ),
                ),
              ],
            ),
            if (controller.selectedTargets.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('booked_transit_corridors'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              ...controller.selectedTargets.map((t) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(t.routeCode, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(t.routeName, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                            Text('${t.city} · ${t.fleetName}', style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('${t.vehicleCount} ${'buses_unit'.tr}', style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.bold)),
                          Text('${t.totalScreens} ${'screens_unit'.tr}', style: const TextStyle(color: Color(0xFFC084FC), fontSize: 9.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
        const SizedBox(height: 14),

        // Section 5: Broadcast Schedule & Operating Airtime
        _buildReviewSectionCard(
          stepNumber: 4,
          title: 'review_broadcast_schedule'.tr,
          onEdit: () => controller.goToStep(4),
          badge: '${controller.durationDaysNumber} Days (${controller.dailyOperatingHours}h / day)',
          children: [
            _buildReviewGrid([
              {'label': 'broadcast_start'.tr, 'value': '${DateFormat('dd MMM yyyy').format(controller.startDate.value)}\n${controller.dailySlotStart.value} ${'launch_label'.tr}'},
              {'label': 'broadcast_end'.tr, 'value': '${DateFormat('dd MMM yyyy').format(controller.endDate.value)}\n${controller.dailySlotEnd.value} ${'expiry_label'.tr}'},
              {'label': 'repeat_active_days'.tr, 'value': '${controller.repeatFrequency.value} (${controller.selectedDays.length} ${'days_wk_label'.tr})'},
              {'label': 'daily_operating_window'.tr, 'value': '${controller.dailySlotStart.value} – ${controller.dailySlotEnd.value} (${controller.dailyOperatingHours}h)'},
              {'label': 'timezone_label'.tr, 'value': controller.timezone.value},
              {'label': 'priority_dispatch'.tr, 'value': controller.selectedPriority.value},
            ]),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('total_airtime_approx'.trParams({'h': '${controller.totalAirtimeHours}'}), style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.bold)),
                  Text('est_loops_per_day'.trParams({'loops': '${controller.estimatedLoopsPerDay}'}),
                      style: const TextStyle(color: Color(0xFF34D399), fontSize: 10.5, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Section 6: Financial Investment & Budget Breakdown + Itemized Billing Ledger Table
        _buildReviewSectionCard(
          stepNumber: 5,
          title: 'review_budget_breakdown'.tr,
          onEdit: () => controller.goToStep(5),
          badge: '${'total_payable_badge'.tr}: ₹${controller.finalTotalAmount.toStringAsFixed(0)}',
          children: [
            // Summary row tiles
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('campaign_base_fee'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                        const SizedBox(height: 2),
                        Text('₹${controller.baseAmountNum.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('total_allocation'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text('₹${controller.finalTotalAmount.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFF34D399), fontSize: 14, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Itemized Billing Ledger Table
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('itemized_billing_ledger'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('base_airtime_broadcast_fee'.tr, style: const TextStyle(color: Colors.white70, fontSize: 10.5)),
                      Text('₹${controller.baseAmountNum.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  ...controller.breakdownItems.map((it) {
                    final isDisc = it.type == 'discount';
                    final sign = isDisc ? '- ' : '+ ';
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: Text(it.label, style: TextStyle(color: isDisc ? const Color(0xFF34D399) : Colors.white70, fontSize: 10.5), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          Text('$sign₹${it.amount.toStringAsFixed(0)}', style: TextStyle(color: isDisc ? const Color(0xFF34D399) : Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    );
                  }),
                  const Divider(color: Color(0xFF334155), height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('total_budget_allocation_inr'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      Text('₹${controller.finalTotalAmount.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFF34D399), fontSize: 13, fontWeight: FontWeight.w900)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Section 7: Dynamic QR Code Identity & Attribution
        _buildReviewSectionCard(
          stepNumber: 5,
          title: 'review_dynamic_qr'.tr,
          onEdit: () => controller.goToStep(5),
          badge: '● ${'active_qr_engine'.tr}',
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: CustomPaint(
                    size: const Size(60, 60),
                    painter: DummyQrCodePainter(qrData: controller.qrCodeId.value),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(controller.qrCodeId.value, style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text('gps_transit_synced'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 8.5, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'qr_commuters_scanning_desc'.tr,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Gateway: ${controller.trackingGatewayUrl}',
                        style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9.5, fontFamily: 'monospace'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Government PSA Broadcast Clearance Notice Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.verified_user_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'gov_psa_broadcast_clearance_title'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'gov_psa_broadcast_clearance_desc'.tr,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5, height: 1.4),
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

  Widget _buildReviewSectionCard({
    required int stepNumber,
    required String title,
    required VoidCallback onEdit,
    String? badge,
    required List<Widget> children,
  }) {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text('$stepNumber', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                ],
              ),
              Row(
                children: [
                 /* if (badge != null) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(badge, style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                  ],*/
                  InkWell(
                    onTap: onEdit,
                    child: Text(
                      'edit_step_btn'.tr,
                      style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const Divider(color: Color(0xFF1E293B), height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildReviewGrid(List<Map<String, String>> items) {
    return LayoutBuilder(builder: (context, c) {
      final isSmall = c.maxWidth < 550;
      final w = isSmall ? (c.maxWidth - 8) / 2 : (c.maxWidth - 16) / 3;

      return Wrap(
        spacing: 8,
        runSpacing: 8,
        children: items.map((it) {
          return SizedBox(
            width: w,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(it['label'] ?? '', style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 3),
                  Text(
                    it['value'] ?? '–',
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      );
    });
  }

  Widget _buildMetricTile({required String label, required String value, required IconData icon}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: const Color(0xFF60A5FA)),
              const SizedBox(width: 4),
              Expanded(
                child: Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5), maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }


  // ==========================================================
  // BOTTOM ACTION BAR
  // ==========================================================
  Widget _buildBottomActionBar() {
    return Obx(() {
      final current = controller.currentStep.value;
      final isLastStep = current == controller.totalSteps;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          border: const Border(top: BorderSide(color: AppColors.cardBorder)),
        ),
        child: Row(
          children: [
            if (current > 1) ...[
              OutlinedButton.icon(
                onPressed: controller.previousStep,
                icon: const Icon(Icons.chevron_left_rounded, color: Colors.white, size: 18),
                label: Text('back'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(width: 12),
            ],

            Expanded(
              child: Container(
                height: 46,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.35),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: controller.isSubmitting.value ? null : controller.nextStep,
                    child: Center(
                      child: controller.isSubmitting.value
                          ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                          : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            isLastStep ? 'submit_for_clearance'.tr : 'next'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 6),
                          Icon(
                            isLastStep ? Icons.check_circle_outline_rounded : Icons.chevron_right_rounded,
                            color: Colors.white,
                            size: 18,
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
      );
    });
  }

  // ==========================================================
  // SUCCESS SCREEN
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
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.4),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(Icons.check_rounded, color: Colors.white, size: 44),
              ),
              const SizedBox(height: 24),
              Text(
                'broadcast_submitted_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              Text(
                'broadcast_submitted_sub'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 12, height: 1.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Container(
                width: double.infinity,
                height: 46,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.35),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => Get.offAllNamed(Routes.GOVERNMENT_DASHBOARD),
                    child: Center(
                      child: Text(
                        'return_to_gov_dashboard'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==========================================================
  // SHARED UI HELPERS
  // ==========================================================
  Widget _buildSectionHeader({required String title, required String subtitle}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
        ),
      ],
    );
  }

  Widget _buildCard({required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget _buildFieldLabel(String label, {bool isRequired = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600),
          ),
          if (isRequired)
            const Text(
              ' *',
              style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
            ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    IconData? icon,
    int maxLines = 1,
    TextInputType? keyboardType,
    Function(String)? onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        onChanged: onChanged,
        style: const TextStyle(color: Colors.white, fontSize: 12),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11.5),
          prefixIcon: icon != null ? Icon(icon, color: AppColors.textMuted, size: 18) : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: items.contains(value) ? value : items.first,
          dropdownColor: const Color(0xFF1E293B),
          isExpanded: true,
          icon: const Icon(Icons.arrow_drop_down_rounded, color: Colors.white),
          style: const TextStyle(color: Colors.white, fontSize: 12),
          items: items.map((item) {
            return DropdownMenuItem<String>(
              value: item,
              child: Text(controller.getDropdownItemLabel(item), maxLines: 1, overflow: TextOverflow.ellipsis),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildDateSelector({required DateTime date, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_rounded, size: 16, color: Color(0xFF60A5FA)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                DateFormat('dd MMM yyyy').format(date),
                style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeSelector({required String label, required String timeStr, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            const Icon(Icons.schedule_rounded, size: 16, color: Color(0xFFF59E0B)),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  Text(timeStr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

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
              Rect.fromLTWH(
                (startCol + c) * cellSize,
                (startRow + r) * cellSize,
                cellSize,
                cellSize,
              ),
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
            canvas.drawRect(
              Rect.fromLTWH(c * cellSize, r * cellSize, cellSize, cellSize),
              blackPaint,
            );
          }
        } else {
          if (rng.nextBool()) {
            canvas.drawRect(
              Rect.fromLTWH(c * cellSize, r * cellSize, cellSize, cellSize),
              blackPaint,
            );
          }
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant DummyQrCodePainter oldDelegate) => oldDelegate.qrData != qrData;
}
