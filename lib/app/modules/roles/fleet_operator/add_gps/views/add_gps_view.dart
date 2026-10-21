import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/constants/api_constants.dart';
import '../controllers/add_gps_controller.dart';

class AddGpsView extends GetView<AddGpsController> {
  const AddGpsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
          }

          final isEdit = controller.isEditMode.value;

          return Column(
            children: [
              // Top Bar
              _buildTopBar(isEdit),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Form(
                    key: controller.formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Image Picker Card
                        _buildPhotoPickerCard(),
                        const SizedBox(height: 16),

                        // Section 1: Device Identity
                        _buildSectionHeader('1. Device Hardware Identity', Icons.memory_rounded, Colors.amberAccent),
                        const SizedBox(height: 12),
                        _buildIdentityFields(),
                        const SizedBox(height: 20),

                        // Section 2: SIM & Network Connectivity
                        _buildSectionHeader('2. SIM & Network Connectivity', Icons.sim_card_outlined, const Color(0xFFA855F7)),
                        const SizedBox(height: 12),
                        _buildConnectivityFields(),
                        const SizedBox(height: 20),

                        // Section 3: Vehicle & Mounting
                        _buildSectionHeader('3. Vehicle Assignment & Mounting', Icons.directions_bus_rounded, const Color(0xFF3B82F6)),
                        const SizedBox(height: 12),
                        _buildMountingFields(context),
                        const SizedBox(height: 20),

                        // Section 4: Diagnostics & Notes
                        _buildSectionHeader('4. Diagnostics & Installation Notes', Icons.notes_rounded, const Color(0xFF10B981)),
                        const SizedBox(height: 12),
                        _buildNotesFields(),
                        const SizedBox(height: 24),

                        // Submit Button
                        _buildSubmitButton(isEdit),
                        const SizedBox(height: 30),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // --- Top Bar ---
  Widget _buildTopBar(bool isEdit) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          const CustomBackButton(),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isEdit ? 'Edit GPS Device Config' : 'Register New GPS Device',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Obx(() {
            return ElevatedButton(
              onPressed: controller.isSubmitting.value ? null : controller.submitForm,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: controller.isSubmitting.value
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(isEdit ? 'Update' : 'Save', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, Color iconColor) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 18),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  // --- Photo Picker Card ---
  Widget _buildPhotoPickerCard() {
    return Obx(() {
      final file = controller.selectedImageFile.value;
      final url = controller.imageUrl.value;
      final fullUrl = ApiConstants.resolveFileUrl(url);

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            if (file != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(file, height: 140, width: double.infinity, fit: BoxFit.cover),
              )
            else if (fullUrl.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  fullUrl,
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _buildUploadPlaceholder(),
                ),
              )
            else
              _buildUploadPlaceholder(),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton.icon(
                  onPressed: () => controller.pickImage(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_rounded, size: 14, color: Color(0xFF818CF8)),
                  label: const Text('Camera', style: TextStyle(color: Color(0xFF818CF8), fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF4F46E5)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: () => controller.pickImage(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_rounded, size: 14, color: Colors.white70),
                  label: const Text('Gallery', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.cardBorder),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildUploadPlaceholder() {
    return Container(
      height: 110,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B), strokeAlign: BorderSide.strokeAlignInside),
      ),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add_a_photo_outlined, color: AppColors.textMuted, size: 30),
          SizedBox(height: 6),
          Text(
            'Upload GPS Hardware Unit Photo',
            style: TextStyle(color: AppColors.textMuted, fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  // --- Section 1: Device Identity Fields ---
  Widget _buildIdentityFields() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildTextField(
            label: 'Hardware Code / Unit ID *',
            controller: controller.codeController,
            hint: 'e.g. GPS-TRK-10492',
          ),
          const SizedBox(height: 12),

          // IMEI with Scan button
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '15-Digit IMEI *',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppColors.inputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.inputBorder, width: 1.2),
                      ),
                      child: TextField(
                        controller: controller.imeiController,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: 'e.g. 865432049182341',
                          hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: controller.scanImeiCode,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF6366F1)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.qr_code_scanner_rounded, color: Color(0xFF818CF8), size: 18),
                          SizedBox(width: 4),
                          Text(
                            'Scan',
                            style: TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Vendor & Model Dropdowns
          Row(
            children: [
              Expanded(
                child: Obx(() {
                  return _buildDropdown(
                    label: 'Vendor',
                    value: controller.selectedVendor.value,
                    items: controller.vendors,
                    onChanged: (val) {
                      if (val != null) controller.selectedVendor.value = val;
                    },
                  );
                }),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Obx(() {
                  return _buildDropdown(
                    label: 'Model',
                    value: controller.selectedModel.value,
                    items: controller.models,
                    onChanged: (val) {
                      if (val != null) controller.selectedModel.value = val;
                    },
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 12),

          _buildTextField(
            label: 'Hardware Serial Number (S/N)',
            controller: controller.serialNoController,
            hint: 'e.g. SN-8829104',
          ),
          const SizedBox(height: 12),

          _buildTextField(
            label: 'Alias / Friendly Unit Label',
            controller: controller.aliasController,
            hint: 'e.g. Express Route Bus 104 Tracker',
          ),
        ],
      ),
    );
  }

  // --- Section 2: SIM & Network Fields ---
  Widget _buildConnectivityFields() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildTextField(
            label: 'SIM Card Phone / MSISDN',
            controller: controller.simNoController,
            hint: 'e.g. +91 98765 43210',
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: Obx(() {
                  return _buildDropdown(
                    label: 'SIM Provider',
                    value: controller.selectedProvider.value,
                    items: controller.providers,
                    onChanged: (val) {
                      if (val != null) controller.selectedProvider.value = val;
                    },
                  );
                }),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Obx(() {
                  return _buildDropdown(
                    label: 'Network Type',
                    value: controller.selectedNetworkType.value,
                    items: controller.networkTypes,
                    onChanged: (val) {
                      if (val != null) controller.selectedNetworkType.value = val;
                    },
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  label: 'Battery Capacity',
                  controller: controller.batteryController,
                  hint: '1200 mAh',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildTextField(
                  label: 'Firmware Version',
                  controller: controller.firmwareController,
                  hint: 'v3.2.14-PROD',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- Section 3: Vehicle Assignment & Mounting ---
  Widget _buildMountingFields(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          // Vehicle Dropdown
          Obx(() {
            final vehicles = controller.vehiclesList;
            final selected = controller.selectedVehicleId.value;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Assign to Fleet Vehicle',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.inputBorder, width: 1.2),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String?>(
                      value: selected,
                      isExpanded: true,
                      dropdownColor: const Color(0xFF1E293B),
                      icon: const Icon(Icons.arrow_drop_down_rounded, color: Colors.white70),
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      hint: const Text(
                        'Unassigned (Keep in Stock Inventory)',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Unassigned (In Stock Inventory)', style: TextStyle(color: AppColors.textMuted)),
                        ),
                        ...vehicles.map((v) {
                          return DropdownMenuItem<String?>(
                            value: v.id.toString(),
                            child: Text(
                              '${v.busNumber} • ${v.model}',
                              style: const TextStyle(color: Colors.white),
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }),
                      ],
                      onChanged: (val) {
                        controller.selectedVehicleId.value = val;
                      },
                    ),
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 12),

          // Mounting Position Dropdown
          Obx(() {
            return _buildDropdown(
              label: 'Mounting Position',
              value: controller.selectedMountingPosition.value,
              items: controller.mountingPositions,
              onChanged: (val) {
                if (val != null) controller.selectedMountingPosition.value = val;
              },
            );
          }),
          const SizedBox(height: 12),

          // Power Wire Dropdown
          Obx(() {
            return _buildDropdown(
              label: 'Power Wiring Source',
              value: controller.selectedPowerWire.value,
              items: controller.powerWires,
              onChanged: (val) {
                if (val != null) controller.selectedPowerWire.value = val;
              },
            );
          }),
          const SizedBox(height: 12),

          // Installation Date with DatePicker
          InkWell(
            onTap: () => controller.selectDate(context),
            child: AbsorbPointer(
              child: _buildTextField(
                label: 'Installation Date',
                controller: controller.dateController,
                hint: 'YYYY-MM-DD',
                suffixIcon: Icons.calendar_today_rounded,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Section 4: Diagnostics & Notes ---
  Widget _buildNotesFields() {
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
          const Text(
            'Installation / Technician Notes',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.inputBorder, width: 1.2),
            ),
            child: TextField(
              controller: controller.notesController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                hintText: 'Enter wiring remarks, technician notes, or vehicle mounting details...',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                border: InputBorder.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Submit Button ---
  Widget _buildSubmitButton(bool isEdit) {
    return Obx(() {
      final isSubmitting = controller.isSubmitting.value;

      return Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF9333EA).withValues(alpha: 0.3),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: isSubmitting ? null : controller.submitForm,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          child: isSubmitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(isEdit ? Icons.check_circle_rounded : Icons.add_circle_outline_rounded, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      isEdit ? 'Update GPS Unit Configuration' : 'Register & Save GPS Unit',
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
        ),
      );
    });
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    IconData? suffixIcon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.inputBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.inputBorder, width: 1.2),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  keyboardType: keyboardType,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              if (suffixIcon != null) Icon(suffixIcon, color: AppColors.textMuted, size: 18),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.inputBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.inputBorder, width: 1.2),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: items.contains(value) ? value : items.first,
              isExpanded: true,
              dropdownColor: const Color(0xFF1E293B),
              icon: const Icon(Icons.arrow_drop_down_rounded, color: Colors.white70),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              items: items.map((item) {
                return DropdownMenuItem<String>(
                  value: item,
                  child: Text(item, overflow: TextOverflow.ellipsis),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}
