import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/register_device_controller.dart';
import 'register_device_view.dart' show RegisterDeviceView;

/// Step 4 (final) of the Register Device wizard — Review & Save.
/// Shares `RegisterDeviceController` with Steps 1, 2 & 3, so every value
/// shown here is read straight from what was entered earlier.
class ReviewAndSaveView extends GetView<RegisterDeviceController> {
  const ReviewAndSaveView({super.key});

  static const Color kBg = RegisterDeviceView.kBg;
  static const Color kCardBg = RegisterDeviceView.kCardBg;
  static const Color kFieldBg = RegisterDeviceView.kFieldBg;
  static const Color kPurple = RegisterDeviceView.kPurple;
  static const Color kIndigo = RegisterDeviceView.kIndigo;
  static const Color kBlue = RegisterDeviceView.kBlue;
  static const Color kBorder = RegisterDeviceView.kBorder;
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                children: [
                  _buildHeader(),
                  const SizedBox(height: 18),
                  _buildStepper(),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  _buildDeviceDetailsCard(),
                  const SizedBox(height: 14),
                  _buildVehicleAssignmentCard(),
                  const SizedBox(height: 14),
                  _buildConfigurationSummaryCard(),
                  const SizedBox(height: 14),
                  _buildNotesCard(),
                  const SizedBox(height: 14),
                  _buildSummaryBanner(),
                  const SizedBox(height: 12),
                  _buildInfoNote(),
                ],
              ),
            ),
            _buildFooterButtons(),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onStep4BackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Register New Display Device',
                style: TextStyle(color: Colors.white, fontSize: 16.5, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 2),
              Text(
                'Review all details before saving.',
                style: TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        Obx(
          () => GestureDetector(
            onTap: controller.isSaving.value ? null : controller.onSaveDevicePressed,
            child: const Column(
              children: [
                Icon(Icons.save_outlined, color: kPurple, size: 20),
                SizedBox(height: 2),
                Text(
                  'Save Device',
                  style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Stepper (step 4 active) ----------------
  Widget _buildStepper() {
    return Obx(
      () => Row(
        children: List.generate(controller.stepLabels.length, (index) {
          final stepNumber = index + 1;
          final isActive = stepNumber == controller.currentStep.value;
          final isCompleted = stepNumber < controller.currentStep.value;
          final isLast = stepNumber == controller.stepLabels.length;

          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 26,
                        height: 26,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: (isActive || isCompleted)
                              ? const LinearGradient(colors: [kIndigo, kPurple])
                              : null,
                          color: (isActive || isCompleted) ? null : kFieldBg,
                          border: Border.all(
                            color: (isActive || isCompleted) ? Colors.transparent : Colors.white24,
                          ),
                        ),
                        child: isCompleted
                            ? const Icon(Icons.check, color: Colors.white, size: 14)
                            : Text(
                                '$stepNumber',
                                style: TextStyle(
                                  color: isActive ? Colors.white : Colors.white38,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        controller.stepLabels[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isActive ? kPurple : Colors.white38,
                          fontSize: 9.5,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isLast)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 18),
                    child: SizedBox(
                      width: 18,
                      child: Divider(color: isCompleted ? kPurple : Colors.white24, thickness: 1.5),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- Shared card chrome with title + Edit link ----------------
  Widget _sectionCard({
    required IconData icon,
    required String title,
    required VoidCallback onEdit,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: kPurple, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              GestureDetector(
                onTap: onEdit,
                child: const Text(
                  'Edit',
                  style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _kv(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 108,
            child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11.5)),
          ),
          const Text(':  ', style: TextStyle(color: Colors.white38, fontSize: 11.5)),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Device Details ----------------
  Widget _buildDeviceDetailsCard() {
    return Obx(
      () => _sectionCard(
        icon: Icons.desktop_windows_outlined,
        title: 'Device Details',
        onEdit: controller.editDeviceDetails,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _kv('Device ID', controller.registeredDeviceId),
            _kv('Serial No.', controller.registeredSerialNo.replaceFirst('Serial No: ', '')),
            _kv('Device Name', controller.registeredDeviceName),
            _kv('Device Type', controller.deviceType.value.isEmpty ? '—' : controller.deviceType.value),
            _kv('Hardware Model',
                controller.hardwareModelCtrl.text.trim().isEmpty ? '—' : controller.hardwareModelCtrl.text.trim()),
            _kv('Screen Size', controller.screenSize.value.isEmpty ? '—' : controller.screenSize.value),
            _kv('Orientation', controller.orientation.value.isEmpty ? '—' : controller.orientation.value),
          ],
        ),
      ),
    );
  }

  // ---------------- Vehicle Assignment ----------------
  Widget _buildVehicleAssignmentCard() {
    return Obx(() {
      final v = controller.selectedVehicleDetails.value;
      return _sectionCard(
        icon: Icons.directions_bus_filled_outlined,
        title: 'Vehicle Assignment',
        onEdit: controller.editVehicleAssignment,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _kv('Organization / Fleet',
                      controller.organization.value.isEmpty ? '—' : controller.organization.value),
                  _kv('Vehicle', controller.selectedVehicle.value.isEmpty ? '—' : controller.selectedVehicle.value),
                  _kv('Vehicle Type', v?.vehicleType ?? '—'),
                  _kv('Depot / Location', v?.depotLocation ?? '—'),
                ],
              ),
            ),
            if (v != null) ...[
              const SizedBox(width: 10),
              Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 78,
                      height: 52,
                      color: Colors.white10,
                      child: const Icon(Icons.directions_bus_filled, color: Colors.white24, size: 24),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        v.status,
                        style: const TextStyle(color: kGreen, fontSize: 10, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ],
        ),
      );
    });
  }

  // ---------------- Configuration Summary ----------------
  Widget _buildConfigurationSummaryCard() {
    return Obx(
      () => _sectionCard(
        icon: Icons.settings_outlined,
        title: 'Configuration Summary',
        onEdit: controller.editConfiguration,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _kv('Screen Brightness', '${controller.screenBrightness.value.round()}%'),
                      _kv('Volume Level', '${controller.volumeLevel.value.round()}%'),
                      _kv('Orientation', controller.displayOrientation.value),
                      _kv('Screen Timeout', controller.screenTimeout.value),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _kv('Network Type', controller.networkType.value),
                      _kv('Wi-Fi Network (SSID)',
                          controller.networkType.value == 'Wi-Fi' ? controller.wifiSsidCtrl.text.trim() : '—'),
                      _kv('Content Source', controller.defaultContentSource.value),
                      _kv('Auto Play on Boot', controller.autoPlayOnBoot.value ? 'Enabled' : 'Disabled'),
                    ],
                  ),
                ),
              ],
            ),
            GestureDetector(
              onTap: controller.editConfiguration,
              child: const Text(
                'View Full Configuration',
                style: TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Notes ----------------
  Widget _buildNotesCard() {
    return  _sectionCard(
      icon: Icons.description_outlined,
      title: 'Notes (Optional)',
      onEdit: controller.editDeviceDetails,
      child: _kv('Notes', controller.reviewNotesText),
    );
  }

  // ---------------- Summary banner (green "All good") ----------------
  Widget _buildSummaryBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kGreen.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kGreen.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.checklist_rtl, color: kGreen, size: 16),
              SizedBox(width: 8),
              Text('Summary', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle),
                child: const Icon(Icons.check, color: Colors.white, size: 12),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'All good!',
                      style: TextStyle(color: kGreen, fontSize: 12.5, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'All information looks correct. You can save the device to complete registration.',
                      style: TextStyle(color: Colors.white60, fontSize: 11),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Obx(
                () => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.desktop_windows_outlined, color: Colors.white38, size: 13),
                        const SizedBox(width: 4),
                        const Text('Display Device', style: TextStyle(color: Colors.white38, fontSize: 9.5)),
                      ],
                    ),
                    Text(
                      controller.registeredDeviceId,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.directions_bus_outlined, color: Colors.white38, size: 13),
                        const SizedBox(width: 4),
                        const Text('Assigned Vehicle', style: TextStyle(color: Colors.white38, fontSize: 9.5)),
                      ],
                    ),
                    Text(
                      controller.selectedVehicle.value.isEmpty ? '—' : controller.selectedVehicle.value,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Info note ----------------
  Widget _buildInfoNote() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: const Row(
        children: [
          Icon(Icons.info_outline, color: Colors.white38, size: 15),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'After saving, this device will be available in your fleet and ready to receive content.',
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Footer (Back + Save Device) ----------------
  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: controller.onStep4BackPressed,
            child: Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kPurple.withOpacity(0.4)),
              ),
              alignment: Alignment.center,
              child: const Row(
                children: [
                  Icon(Icons.chevron_left, color: kPurple, size: 18),
                  Text('Back', style: TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(
              () => GestureDetector(
                onTap: controller.isSaving.value ? null : controller.onSaveDevicePressed,
                child: Container(
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [kBlue, kPurple]),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: controller.isSaving.value
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.save_outlined, color: Colors.white, size: 17),
                            SizedBox(width: 8),
                            Text(
                              'Save Device',
                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
