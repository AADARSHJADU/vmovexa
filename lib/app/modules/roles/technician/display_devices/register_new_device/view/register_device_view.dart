import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../../theme/app_theme.dart';
import '../controller/register_device_controller.dart';

class RegisterDeviceView extends GetView<RegisterDeviceController> {
  const RegisterDeviceView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);

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
                  _sectionTitle(Icons.desktop_windows_outlined, kPurple, 'Device Information'),
                  const SizedBox(height: 12),
                  _buildDeviceInformationCard(),
                  const SizedBox(height: 20),
                  _sectionTitle(Icons.tv_outlined, kBlue, 'Display Information'),
                  const SizedBox(height: 12),
                  _buildDisplayInformationCard(),
                  const SizedBox(height: 20),
                  _sectionTitle(Icons.location_on_outlined, kPurple, 'Installation Location'),
                  const SizedBox(height: 12),
                  _buildInstallationLocationCard(),
                ],
              ),
            ),
            _buildNextButton(),
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
          onTap: controller.onBackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Register New Display Device',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Add a new display device to the system.',
                style: TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onScanQr,
          child: const Column(
            children: [
              Icon(Icons.qr_code_scanner, color: kPurple, size: 20),
              SizedBox(height: 2),
              Text(
                'Scan QR',
                style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Stepper (1 Device Details -> 4 Review & Save) ----------------
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

  // ---------------- Section title with icon ----------------
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

  // ---------------- Device Information card ----------------
  Widget _buildDeviceInformationCard() {
    return _cardWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => _LabeledTextField(
              label: 'Device ID',
              required: true,
              controller: controller.deviceIdCtrl,
              hint: 'Enter Device ID / Serial Number',
              maxLength: RegisterDeviceController.deviceIdMaxLen,
              currentLength: controller.deviceIdLen.value,
              errorText: controller.deviceIdError.value,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledTextField(
              label: 'Device Name',
              required: true,
              controller: controller.deviceNameCtrl,
              hint: 'Enter a name for this device',
              maxLength: RegisterDeviceController.deviceNameMaxLen,
              currentLength: controller.deviceNameLen.value,
              errorText: controller.deviceNameError.value,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Device Type',
              required: true,
              hint: 'Select device type',
              value: controller.deviceType.value.isEmpty ? null : controller.deviceType.value,
              items: controller.deviceTypeOptions,
              onChanged: controller.setDeviceType,
              errorText: controller.deviceTypeError.value,
            ),
          ),
          const SizedBox(height: 14),
          _LabeledTextField(
            label: 'Hardware Model',
            required: false,
            controller: controller.hardwareModelCtrl,
            hint: 'Enter hardware model (if available)',
          ),
        ],
      ),
    );
  }

  // ---------------- Display Information card ----------------
  Widget _buildDisplayInformationCard() {
    return _cardWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Obx(
                  () => _LabeledDropdown(
                    label: 'Screen Size (Inches)',
                    hint: 'Select screen size',
                    value: controller.screenSize.value.isEmpty ? null : controller.screenSize.value,
                    items: controller.screenSizeOptions,
                    onChanged: controller.setScreenSize,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Obx(
                  () => _LabeledDropdown(
                    label: 'Resolution',
                    hint: 'Select resolution',
                    value: controller.resolution.value.isEmpty ? null : controller.resolution.value,
                    items: controller.resolutionOptions,
                    onChanged: controller.setResolution,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Orientation',
              hint: 'Select orientation',
              value: controller.orientation.value.isEmpty ? null : controller.orientation.value,
              items: controller.orientationOptions,
              onChanged: controller.setOrientation,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Installation Location card ----------------
  Widget _buildInstallationLocationCard() {
    return _cardWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => _LabeledDropdown(
              label: 'Location / Depot',
              required: true,
              hint: 'Select location / depot',
              value: controller.locationDepot.value.isEmpty ? null : controller.locationDepot.value,
              items: controller.locationDepotOptions,
              onChanged: controller.setLocationDepot,
              errorText: controller.locationDepotError.value,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledTextField(
              label: 'Notes (Optional)',
              controller: controller.notesCtrl,
              hint: 'Add any notes about this device',
              maxLines: 3,
              maxLength: RegisterDeviceController.notesMaxLen,
              currentLength: controller.notesLen.value,
            ),
          ),
        ],
      ),
    );
  }

  Widget _cardWrapper({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: child,
    );
  }

  // ---------------- Bottom Next button ----------------
  Widget _buildNextButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Obx(
        () => GestureDetector(
          onTap: controller.isSaving.value ? null : controller.onNextPressed,
          child: Container(
            height: 50,
            decoration: BoxDecoration(
              gradient:AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: controller.isSaving.value
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2.4,
                    ),
                  )
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.save_outlined, color: Colors.white, size: 17),
                      SizedBox(width: 8),
                      Text(
                        'Next: Vehicle Assignment',
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
    );
  }
}

// =====================================================================
// Labeled text field with optional char counter + error text
// =====================================================================
class _LabeledTextField extends StatelessWidget {
  final String label;
  final bool required;
  final TextEditingController controller;
  final String hint;
  final int maxLines;
  final int? maxLength;
  final int? currentLength;
  final String? errorText;

  const _LabeledTextField({
    required this.label,
    this.required = false,
    required this.controller,
    required this.hint,
    this.maxLines = 1,
    this.maxLength,
    this.currentLength,
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
                    TextSpan(
                      text: ' *',
                      style: TextStyle(color: Color(0xFFFF4D4D)),
                    ),
                  ]
                : [],
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: errorText != null
                  ? const Color(0xFFFF4D4D)
                  : Colors.white.withOpacity(0.08),
            ),
          ),
          child: TextField(
            controller: controller,
            maxLines: maxLines,
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
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            if (errorText != null)
              Expanded(
                child: Text(
                  errorText!,
                  style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5),
                ),
              )
            else
              const SizedBox(),
            if (maxLength != null)
              Text(
                '${currentLength ?? 0}/$maxLength',
                style: const TextStyle(color: Colors.white24, fontSize: 10),
              ),
          ],
        ),
      ],
    );
  }
}

// =====================================================================
// Labeled dropdown
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
                    TextSpan(
                      text: ' *',
                      style: TextStyle(color: Color(0xFFFF4D4D)),
                    ),
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
          Text(
            errorText!,
            style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5),
          ),
        ],
      ],
    );
  }
}
