import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../../theme/app_theme.dart';
import '../controller/register_device_controller.dart';
import '../model/vehicle_details_model.dart';
import 'register_device_view.dart' show RegisterDeviceView;

/// Step 2 of the Register Device wizard — Vehicle Assignment.
/// Shares `RegisterDeviceController` with Step 1 so device info entered
/// there is available here (registeredDeviceId, registeredDeviceName, etc).
class VehicleAssignmentView extends GetView<RegisterDeviceController> {
  const VehicleAssignmentView({super.key});

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
                  _buildDeviceSummaryCard(),
                  const SizedBox(height: 20),
                  _sectionTitle(Icons.directions_bus_filled_outlined, kPurple, 'Vehicle Details'),
                  const SizedBox(height: 12),
                  _buildVehicleDetailsCard(),
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
          onTap: controller.onStep2BackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Vehicle Assignment',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Assign this display device to a vehicle.',
                style: TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onStep2NextPressed,
          child: const Column(
            children: [
              Icon(Icons.save_outlined, color: kPurple, size: 20),
              SizedBox(height: 2),
              Text(
                'Save & Next',
                style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Stepper (same pattern as Step 1, step 2 active) ----------------
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
                            color: (isActive || isCompleted)
                                ? Colors.transparent
                                : Colors.white24,
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
                      child: Divider(
                        color: isCompleted ? kPurple : Colors.white24,
                        thickness: 1.5,
                      ),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- Device summary card (device chosen in Step 1) ----------------
  Widget _buildDeviceSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: kPurple.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.desktop_windows_outlined, color: kPurple, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.registeredDeviceId,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Display Device',
                  style: TextStyle(color: Colors.white54, fontSize: 11),
                ),
                const SizedBox(height: 2),
                Text(
                  controller.registeredSerialNo,
                  style: const TextStyle(color: Colors.white38, fontSize: 10),
                ),
              ],
            ),
          ),
          Obx(
            () => Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: controller.isDeviceOnline.value ? kGreen : Colors.redAccent,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  controller.isDeviceOnline.value ? 'Online' : 'Offline',
                  style: TextStyle(
                    color: controller.isDeviceOnline.value ? kGreen : Colors.redAccent,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(IconData icon, Color color, String title) {
    return Row(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  // ---------------- Vehicle Details card ----------------
  Widget _buildVehicleDetailsCard() {
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
          Obx(
            () => _LabeledDropdown(
              label: 'Select Organization / Fleet',
              required: true,
              hint: 'Select organization / fleet',
              value: controller.organization.value.isEmpty ? null : controller.organization.value,
              items: controller.organizationOptions,
              onChanged: controller.setOrganization,
              errorText: controller.organizationError.value,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Select Vehicle',
              required: true,
              hint: 'Select vehicle',
              value: controller.selectedVehicle.value.isEmpty ? null : controller.selectedVehicle.value,
              items: controller.vehicleOptions,
              onChanged: controller.setSelectedVehicle,
              errorText: controller.vehicleError.value,
            ),
          ),
          const SizedBox(height: 14),
          Obx(() {
            final v = controller.selectedVehicleDetails.value;
            if (v == null) return const SizedBox();
            return _VehiclePreviewCard(vehicle: v);
          }),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Installation Position in Vehicle',
              hint: 'Select position',
              value: controller.installationPosition.value.isEmpty
                  ? null
                  : controller.installationPosition.value,
              items: controller.installationPositionOptions,
              onChanged: controller.setInstallationPosition,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Power Source',
              hint: 'Select power source',
              value: controller.powerSource.value.isEmpty ? null : controller.powerSource.value,
              items: controller.powerSourceOptions,
              onChanged: controller.setPowerSource,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledNotesField(
              label: 'Notes (Optional)',
              controller: controller.vehicleNotesCtrl,
              hint: 'Add any notes about this assignment',
              maxLength: 200,
              currentLength: controller.vehicleNotesLen.value,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Footer (Back + Next: Register) ----------------
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
            onTap: controller.onStep2BackPressed,
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
                  Text(
                    'Back',
                    style: TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: controller.onStep2NextPressed,
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  gradient:AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Next: Register',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.chevron_right, color: Colors.white, size: 18),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Vehicle preview card (photo + status + details rows)
// =====================================================================
class _VehiclePreviewCard extends StatelessWidget {
  final VehicleDetails vehicle;

  const _VehiclePreviewCard({required this.vehicle});

  static const Color kFieldBg = RegisterDeviceView.kFieldBg;
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 64,
                  height: 64,
                  color: Colors.white10,
                  child: const Icon(Icons.directions_bus_filled, color: Colors.white24, size: 28),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vehicle.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: kGreen.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        vehicle.status,
                        style: const TextStyle(
                          color: kGreen,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _detailRow(Icons.directions_bus_outlined, 'Vehicle Type', vehicle.vehicleType),
          _detailRow(Icons.location_on_outlined, 'Depot / Location', vehicle.depotLocation),
          _detailRow(Icons.event_seat_outlined, 'Capacity', vehicle.capacity),
          _detailRow(Icons.person_outline, 'Driver', vehicle.driver),
          _detailRow(Icons.alt_route_outlined, 'Route', vehicle.route),
        ],
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFFB042FF), size: 13),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Labeled dropdown (shared styling with Step 1)
// =====================================================================
class _LabeledDropdown extends StatelessWidget {
  final String label;
  final bool required;
  final String hint;
  final String? value;
  final List<String> items;
  final ValueChanged<String?> onChanged;
  final String? errorText;

  const _LabeledDropdown({
    required this.label,
    this.required = false,
    required this.hint,
    required this.value,
    required this.items,
    required this.onChanged,
    this.errorText,
  });

  static const Color kFieldBg = RegisterDeviceView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            text: label,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
            children: required
                ? const [
                    TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D))),
                  ]
                : [],
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: errorText != null
                  ? const Color(0xFFFF4D4D)
                  : Colors.white.withOpacity(0.08),
            ),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              dropdownColor: kFieldBg,
              icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 20),
              hint: Text(hint, style: const TextStyle(color: Colors.white30, fontSize: 12.5)),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              items: items
                  .map((item) => DropdownMenuItem(value: item, child: Text(item)))
                  .toList(),
              onChanged: onChanged,
            ),
          ),
        ),
        if (errorText != null) ...[
          const SizedBox(height: 4),
          Text(errorText!, style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5)),
        ],
      ],
    );
  }
}

// =====================================================================
// Labeled multiline notes field with char counter
// =====================================================================
class _LabeledNotesField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String hint;
  final int maxLength;
  final int currentLength;

  const _LabeledNotesField({
    required this.label,
    required this.controller,
    required this.hint,
    required this.maxLength,
    required this.currentLength,
  });

  static const Color kFieldBg = RegisterDeviceView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: TextField(
            controller: controller,
            maxLines: 3,
            maxLength: maxLength,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              border: InputBorder.none,
              counterText: '',
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 12.5),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Align(
          alignment: Alignment.centerRight,
          child: Text(
            '$currentLength/$maxLength',
            style: const TextStyle(color: Colors.white24, fontSize: 10),
          ),
        ),
      ],
    );
  }
}
