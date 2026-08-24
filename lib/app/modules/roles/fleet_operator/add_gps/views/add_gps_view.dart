import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../controllers/add_gps_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class AddGpsView extends GetView<AddGpsController> {
  const AddGpsView({super.key});

  @override
  Widget build(BuildContext context) {
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
                  const CustomBackButton(),
                  const Text(
                    'Add GPS Device',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.info_outline_rounded, color: Colors.white, size: 24),
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Form(
                  key: controller.formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Context Card
                      _buildHeaderContextCard(),
                      const SizedBox(height: 24),

                      // Section 1: Device Information
                      _buildSectionHeader('Device Information'),
                      const SizedBox(height: 6),
                      const Text(
                        'Enter the details of the GPS device.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 20),

                      // GPS Device ID / IMEI with Scan button
                      _buildLabel('GPS Device ID / IMEI *'),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: CustomTextField(
                              hintText: 'Enter GPS device ID or IMEI',
                              prefixAsset: 'assets/icons/fleet_operator_icons/id.png',
                              prefixWidth: 24,
                              prefixHeight: 24,
                              useGradientIcon: true,
                              controller: controller.imeiController,
                            ),
                          ),
                          const SizedBox(width: 12),
                          GestureDetector(
                            onTap: controller.scanImeiCode,
                            child: Container(
                              height: 52,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: AppColors.cardBg,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.cardBorder, width: 1.2),
                              ),
                              child: Row(
                                children: [
                                  ShaderMask(
                                    blendMode: BlendMode.srcIn,
                                    shaderCallback: (bounds) => const LinearGradient(
                                      colors: [
                                        Color(0xFF3B82F6),
                                        Color(0xFF8B5CF6),
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ).createShader(bounds),
                                    child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 20),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Scan',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Device Model Dropdown
                      _buildLabel('Device Model *'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select device model',
                          prefixIcon: Icons.settings_input_composite_outlined,
                          useGradientIcon: true,
                          isDropdown: true,
                          dropdownValue: controller.selectedModel.value,
                          dropdownItems: controller.models,
                          onDropdownChanged: (val) => controller.selectedModel.value = val!,
                        ),
                      ),
                      const SizedBox(height: 18),

                      // SIM Number
                      _buildLabel('SIM Number *'),
                      CustomTextField(
                        hintText: 'Enter SIM number',
                        prefixIcon: Icons.sim_card_outlined,
                        useGradientIcon: true,
                        keyboardType: TextInputType.phone,
                        controller: controller.simNoController,
                      ),
                      const SizedBox(height: 18),

                      // Network Provider & Network Type Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Network Provider *'),
                                Obx(
                                  () => CustomTextField(
                                    hintText: 'Select provider',
                                    prefixIcon: Icons.cell_tower_outlined,
                                    useGradientIcon: true,
                                    isDropdown: true,
                                    dropdownValue: controller.selectedProvider.value,
                                    dropdownItems: controller.providers,
                                    onDropdownChanged: (val) => controller.selectedProvider.value = val!,
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
                                _buildLabel('Network Type *'),
                                Obx(
                                  () => CustomTextField(
                                    hintText: 'Select network type',
                                    prefixIcon: Icons.signal_cellular_alt_rounded,
                                    useGradientIcon: true,
                                    isDropdown: true,
                                    dropdownValue: controller.selectedNetworkType.value,
                                    dropdownItems: controller.networkTypes,
                                    onDropdownChanged: (val) => controller.selectedNetworkType.value = val!,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Battery Capacity & Installation Date Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Battery Capacity (mAh)'),
                                CustomTextField(
                                  hintText: 'Enter battery capacity',
                                  prefixAsset: 'assets/icons/fleet_operator_icons/lightning.png',
                                  prefixWidth: 22,
                                  prefixHeight: 22,
                                  useGradientIcon: true,
                                  keyboardType: TextInputType.number,
                                  controller: controller.batteryController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Installation Date *'),
                                GestureDetector(
                                  onTap: () => controller.selectDate(context),
                                  child: AbsorbPointer(
                                    child: CustomTextField(
                                      hintText: 'Select installation date',
                                      prefixAsset: 'assets/icons/calendar.png',
                                      prefixWidth: 24,
                                      prefixHeight: 24,
                                      useGradientIcon: true,
                                      controller: controller.dateController,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Device Serial Number (Optional)
                      _buildLabel('Device Serial Number (Optional)'),
                      CustomTextField(
                        hintText: 'Enter device serial number',
                        prefixIcon: Icons.settings_input_composite_outlined,
                        useGradientIcon: true,
                        controller: controller.serialNoController,
                      ),
                      const SizedBox(height: 28),

                      // Section 2: Additional Information
                      _buildSectionHeader('Additional Information (Optional)'),
                      const SizedBox(height: 6),
                      const Text(
                        'Add more details to help manage the device.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 20),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Firmware Version'),
                                CustomTextField(
                                  hintText: 'Enter firmware version',
                                  prefixIcon: Icons.code_rounded,
                                  useGradientIcon: true,
                                  controller: controller.firmwareController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Device Name / Alias'),
                                CustomTextField(
                                  hintText: 'Enter device name or alias',
                                  prefixIcon: Icons.label_outline_rounded,
                                  useGradientIcon: true,
                                  controller: controller.aliasController,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Notes text box with char counter
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildLabel('Notes'),
                          Obx(
                            () => Text(
                              '${controller.notesCharCount.value}/200',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                      CustomTextField(
                        hintText: 'Enter any additional notes',
                        prefixSvg: 'assets/icons/note1.svg',
                        controller: controller.notesController,
                        keyboardType: TextInputType.multiline,
                      ),
                      const SizedBox(height: 28),

                      // Section 3: Status
                      _buildSectionHeader('Status'),
                      const SizedBox(height: 6),
                      const Text(
                        'Set the initial status of this GPS device.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 16),

                      // Radio status buttons
                      Obx(
                        () => Row(
                          children: [
                            Expanded(child: _buildStatusRadioCard('Active', 'Device is active and ready to use', controller.status.value == 'Active')),
                            const SizedBox(width: 14),
                            Expanded(child: _buildStatusRadioCard('Inactive', 'Device is not active', controller.status.value == 'Inactive')),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Actions: Confirm & Cancel
                      CustomButton(
                        text: 'Add GPS Device',
                        prefixIcon: SvgPicture.asset(
                          'assets/icons/hotspot.svg',
                          width: 18,
                          height: 18,
                          colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                        ),
                        onTap: controller.addGpsDevice,
                      ),
                      const SizedBox(height: 14),
                      CustomButton(
                        text: 'Cancel',
                        isOutlined: true,
                        onTap: () => Get.back(),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildHeaderContextCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Icon Left
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: Image.asset(
                'assets/icons/fleet_operator_icons/gps_device.png',
              height: 28,
              width: 28,
            ),
            /*_buildGradientIcon(
              Icons.location_on_outlined,
              svgAsset: 'assets/icons/location.svg',
              size: 24,
            ),*/
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Assigning to Vehicle',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
                const SizedBox(height: 4),
                Text(
                  controller.vehicleName,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  'Fleet: ${controller.fleetName}  •  Type: ${controller.vehicleType}\nDriver: ${controller.driverName}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11, height: 1.4),
                ),
              ],
            ),
          ),
          /*_buildGradientIcon(
            Icons.directions_bus_rounded,
            svgAsset: 'assets/icons/bus.svg',
            size: 22,
          ),*/
        ],
      ),
    );
  }

  Widget _buildGradientIcon(
    IconData icon, {
    double size = 20,
    String? svgAsset,
  }) {
    if (svgAsset != null && svgAsset.isNotEmpty) {
      return SvgPicture.asset(
        svgAsset,
        width: size,
        height: size,
      );
    }

    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (bounds) => const LinearGradient(
        colors: [
          Color(0xFF3B82F6),
          Color(0xFF8B5CF6),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(bounds),
      child: Icon(
        icon,
        size: size,
        color: Colors.white,
      ),
    );
  }

  Widget _buildStatusRadioCard(String title, String subtitle, bool isSelected) {
    return GestureDetector(
      onTap: () => controller.setStatus(title),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? const Color(0xFF10B981) : AppColors.indicatorInactive,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
