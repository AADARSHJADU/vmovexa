import 'package:vmovexa/app/widgets/custom_button.dart';
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
                    ? 'edit_work_order'.tr
                    : 'submit_request'.tr,
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
                    ? 'edit_tech_work_order'.tr
                    : 'submit_central_tech_req'.tr,
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
                    ? 'edit_tech_work_order_desc'.tr
                    : 'submit_central_tech_desc'.tr,
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
          Text(
            'vehicle_hardware_scope'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'vehicle_hardware_scope_desc'.tr,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5),
          ),
          const SizedBox(height: 16),

          // Field 1: Target Bus Number *
          _buildFieldLabel('target_bus_number_req'.tr),
          Obx(() => _buildBusDropdown()),
          const SizedBox(height: 14),

          // Field 2: Depot Location *
          _buildFieldLabel('depot_location_req'.tr),
          Obx(() => _buildDepotDropdown()),
          const SizedBox(height: 14),

          // Field 3: Issue Classification *
          _buildFieldLabel('issue_classification_req'.tr),
          Obx(() => _buildIssueDropdown()),
          const SizedBox(height: 14),

          // Field 4: Urgency Level *
          _buildFieldLabel('urgency_level_req'.tr),
          Obx(() => _buildUrgencyDropdown()),
          const SizedBox(height: 14),

          // Field 5: Detailed Symptoms & Depot Gate Notes *
          _buildFieldLabel('symptoms_gate_notes_req'.tr),
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
              decoration: InputDecoration(
                hintText: 'symptoms_gate_hint'.tr,
                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.all(12),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Field 6: Special Dispatch / Technician Instructions
          _buildFieldLabel('special_dispatch_instructions'.tr),
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
              decoration: InputDecoration(
                hintText: 'special_dispatch_hint'.tr,
                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.all(12),
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
                  child: Text('cancel'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 4,
                child: Obx(() => CustomButton(
                      text: controller.isSubmitting.value
                          ? 'submitting_label'.tr
                          : (controller.isEditMode.value
                              ? 'update_work_order'.tr
                              : 'submit_ticket_super_admin'.tr),
                      prefixIcon: controller.isSubmitting.value
                          ? null
                          : const Icon(Icons.send_rounded, size: 15, color: Colors.white),
                      onTap: controller.isSubmitting.value ? () {} : controller.submitRequest,
                      isLoading: controller.isSubmitting.value,
                      height: 44,
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
          hint: Text('select_a_bus'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
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
          hint: Text('select_a_depot'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
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
                _getIssueLabel(cat),
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
                _getUrgencyLabel(opt['value'] ?? ''),
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

  String _getIssueLabel(String cat) {
    switch (cat) {
      case 'Display Screen Glitch / HDMI Telemetry Sync':
        return 'issue_screen_glitch'.tr;
      case 'GPS Tracker Recalibration':
        return 'issue_gps_recalib'.tr;
      case 'RK3588 Edge Box Power Cut / No Boot':
        return 'issue_edge_power'.tr;
      case 'Multi-Display Sync Failure':
        return 'issue_multidisplay_fail'.tr;
      case 'CAN-bus Diagnostic Harness Calibration':
        return 'issue_canbus_calib'.tr;
      case 'Audio PA & Mic Amplifier Circuitry':
        return 'issue_audio_amp'.tr;
      case 'Emergency SOS Panic Trigger Fault':
        return 'issue_sos_fault'.tr;
      default:
        return cat;
    }
  }

  String _getUrgencyLabel(String value) {
    switch (value) {
      case 'critical':
        return 'urgency_critical_sla'.tr;
      case 'high':
        return 'urgency_high_sla'.tr;
      case 'normal':
        return 'urgency_normal_sla'.tr;
      case 'low':
        return 'urgency_low_sla'.tr;
      default:
        return value;
    }
  }
}
