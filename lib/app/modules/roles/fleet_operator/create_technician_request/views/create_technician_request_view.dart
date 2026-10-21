import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/create_technician_request_controller.dart';

class CreateTechnicianRequestView extends GetView<CreateTechnicianRequestController> {
  const CreateTechnicianRequestView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(),

            // Form Body
            Expanded(
              child: Obx(() {
                if (controller.isLoadingData.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
                  );
                }

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card with exact Title requested by User
                      _buildHeaderCard(),
                      const SizedBox(height: 16),

                      // Form Container
                      _buildFormCard(),
                      const SizedBox(height: 30),
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

  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Obx(() => Text(
                controller.isEditMode.value
                    ? 'Edit Work Order'
                    : 'Submit Request',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              )),
          const SizedBox(width: 40),
        ],
      ),
    );
  }

  Widget _buildHeaderCard() {
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
          Obx(() => Text(
                controller.isEditMode.value
                    ? 'Edit Technician Work Order'
                    : 'Submit Central Technician Request',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.3,
                ),
              )),
          const SizedBox(height: 4),
          Obx(() => Text(
                controller.isEditMode.value
                    ? 'Update vehicle telemetry problem scope and depot gate notes.'
                    : 'Request a certified Level 1-3 engineer from VMOVEXA Central Pool for depot hardware troubleshooting.',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                  height: 1.3,
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildFormCard() {
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
          // Section Sub-header
          const Text(
            'VEHICLE & HARDWARE PROBLEM SCOPE',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'Select target vehicle, depot gate, and describe hardware/telematics symptoms.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 10.5),
          ),
          const SizedBox(height: 16),

          // Field 1: Target Bus Number *
          _buildFieldLabel('Target Bus Number *'),
          Obx(() => _buildBusDropdown()),
          const SizedBox(height: 14),

          // Field 2: Depot Location *
          _buildFieldLabel('Depot Location *'),
          Obx(() => _buildDepotDropdown()),
          const SizedBox(height: 14),

          // Field 3: Issue Classification *
          _buildFieldLabel('Issue Classification *'),
          Obx(() => _buildIssueDropdown()),
          const SizedBox(height: 14),

          // Field 4: Urgency Level *
          _buildFieldLabel('Urgency Level *'),
          Obx(() => _buildUrgencyDropdown()),
          const SizedBox(height: 14),

          // Field 5: Detailed Symptoms & Depot Gate Notes *
          _buildFieldLabel('Detailed Symptoms & Depot Gate Notes *'),
          Container(
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.inputBorder),
            ),
            child: TextField(
              controller: controller.descriptionController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: const InputDecoration(
                hintText:
                    'e.g. Display backlight flickers when bus accelerates. Depot bay 4 access available from 08:00 AM.',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 11),
                border: InputBorder.none,
                contentPadding: EdgeInsets.all(12),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Field 6: Special Dispatch / Technician Instructions
          _buildFieldLabel('Special Dispatch / Technician Instructions'),
          Container(
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.inputBorder),
            ),
            child: TextField(
              controller: controller.instructionsController,
              maxLines: 2,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: const InputDecoration(
                hintText:
                    'e.g. Carry spare HDMI splitter and 12V harness. Report to Depot Master on arrival.',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 11),
                border: InputBorder.none,
                contentPadding: EdgeInsets.all(12),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Action Buttons: Cancel & Submit
          Row(
            children: [
              Expanded(
                flex: 2,
                child: OutlinedButton(
                  onPressed: () => Get.back(),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.cardBorder),
                    backgroundColor: const Color(0xFF141824),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 4,
                child: Obx(() => ElevatedButton.icon(
                      onPressed: controller.isSubmitting.value ? null : controller.submitRequest,
                      icon: controller.isSubmitting.value
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.send_rounded, size: 15, color: Colors.white),
                      label: Text(
                        controller.isSubmitting.value
                            ? 'Submitting...'
                            : (controller.isEditMode.value
                                ? 'Update Work Order'
                                : 'Submit Ticket to Super Admin Pool'),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        disabledBackgroundColor: const Color(0xFF1D4ED8).withValues(alpha: 0.5),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    )),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildBusDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.inputBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: controller.selectedBusNumber.value.isNotEmpty
              ? controller.selectedBusNumber.value
              : null,
          isExpanded: true,
          dropdownColor: const Color(0xFF141824),
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted),
          hint: const Text('Select a bus', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
          items: controller.vehiclesList.map((v) {
            return DropdownMenuItem<String>(
              value: v.registrationNumber,
              child: Text(
                '${v.registrationNumber} (${v.model.isNotEmpty ? v.model : 'Transit Bus'})',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace'),
              ),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) controller.onBusSelected(val);
          },
        ),
      ),
    );
  }

  Widget _buildDepotDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.inputBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: controller.selectedDepotName.value.isNotEmpty
              ? controller.selectedDepotName.value
              : null,
          isExpanded: true,
          dropdownColor: const Color(0xFF141824),
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted),
          hint: const Text('Select a depot', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
          items: controller.depotsList.map((d) {
            return DropdownMenuItem<String>(
              value: d.name,
              child: Text(
                d.name,
                style: const TextStyle(color: Colors.white, fontSize: 11),
              ),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) controller.onDepotSelected(val);
          },
        ),
      ),
    );
  }

  Widget _buildIssueDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.inputBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: controller.selectedIssueCategory.value,
          isExpanded: true,
          dropdownColor: const Color(0xFF141824),
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted),
          items: controller.issueCategories.map((cat) {
            return DropdownMenuItem<String>(
              value: cat,
              child: Text(
                cat,
                style: const TextStyle(color: Colors.white, fontSize: 11),
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) controller.selectedIssueCategory.value = val;
          },
        ),
      ),
    );
  }

  Widget _buildUrgencyDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.inputBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: controller.selectedUrgency.value,
          isExpanded: true,
          dropdownColor: const Color(0xFF141824),
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted),
          items: controller.urgencyOptions.map((opt) {
            return DropdownMenuItem<String>(
              value: opt['value'],
              child: Text(
                opt['label']!,
                style: const TextStyle(color: Colors.white, fontSize: 11),
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) controller.selectedUrgency.value = val;
          },
        ),
      ),
    );
  }
}
