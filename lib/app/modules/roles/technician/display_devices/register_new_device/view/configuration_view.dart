import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/register_device_controller.dart';
import 'register_device_view.dart' show RegisterDeviceView;

/// Step 3 of the Register Device wizard — Configuration.
/// Shares `RegisterDeviceController` with Steps 1 & 2.
class ConfigurationView extends GetView<RegisterDeviceController> {
  const ConfigurationView({super.key});

  static const Color kBg = RegisterDeviceView.kBg;
  static const Color kCardBg = RegisterDeviceView.kCardBg;
  static const Color kFieldBg = RegisterDeviceView.kFieldBg;
  static const Color kPurple = RegisterDeviceView.kPurple;
  static const Color kIndigo = RegisterDeviceView.kIndigo;
  static const Color kBlue = RegisterDeviceView.kBlue;
  static const Color kBorder = RegisterDeviceView.kBorder;

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
                  _sectionTitle(Icons.tune, kPurple, 'Display Settings'),
                  const SizedBox(height: 12),
                  _buildDisplaySettingsCard(),
                  const SizedBox(height: 20),
                  _sectionTitle(Icons.wifi, kPurple, 'Connectivity Settings'),
                  const SizedBox(height: 12),
                  _buildConnectivitySettingsCard(),
                  const SizedBox(height: 20),
                  _sectionTitle(Icons.play_circle_outline, kPurple, 'Content & Playback Settings'),
                  const SizedBox(height: 12),
                  _buildContentPlaybackCard(),
                  const SizedBox(height: 20),
                  _sectionTitle(Icons.build_outlined, kPurple, 'System & Maintenance'),
                  const SizedBox(height: 12),
                  _buildSystemMaintenanceCard(),
                  const SizedBox(height: 20),
                  _sectionTitle(Icons.description_outlined, kPurple, 'Notes (Optional)'),
                  const SizedBox(height: 12),
                  _buildNotesCard(),
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
          onTap: controller.onStep3BackPressed,
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
                'Configure device settings and connectivity.',
                style: TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onStep3NextPressed,
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

  // ---------------- Stepper (step 3 active) ----------------
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

  // ---------------- Display Settings ----------------
  Widget _buildDisplaySettingsCard() {
    return _cardWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => _SliderRow(
              icon: Icons.wb_sunny_outlined,
              label: 'Screen Brightness',
              required: true,
              value: controller.screenBrightness.value,
              onChanged: controller.setScreenBrightness,
              valueLabel: '${controller.screenBrightness.value.round()}%',
            ),
          ),
          const SizedBox(height: 16),
          Obx(
            () => _SliderRow(
              icon: Icons.volume_up_outlined,
              label: 'Volume Level',
              required: true,
              value: controller.volumeLevel.value,
              onChanged: controller.setVolumeLevel,
              valueLabel: '${controller.volumeLevel.value.round()}%',
            ),
          ),
          const SizedBox(height: 16),
          Obx(
            () => _InlineDropdownRow(
              icon: Icons.crop_landscape_outlined,
              label: 'Orientation',
              required: true,
              value: controller.displayOrientation.value,
              items: controller.displayOrientationOptions,
              onChanged: controller.setDisplayOrientation,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _InlineDropdownRow(
              icon: Icons.timer_outlined,
              label: 'Screen Timeout',
              required: true,
              value: controller.screenTimeout.value,
              items: controller.screenTimeoutOptions,
              onChanged: controller.setScreenTimeout,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Connectivity Settings ----------------
  Widget _buildConnectivitySettingsCard() {
    return _cardWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => _LabeledDropdown(
              label: 'Network Type',
              required: true,
              hint: 'Select network type',
              value: controller.networkType.value.isEmpty ? null : controller.networkType.value,
              items: controller.networkTypeOptions,
              onChanged: controller.setNetworkType,
            ),
          ),
          Obx(() {
            if (controller.networkType.value != 'Wi-Fi') return const SizedBox();
            return Column(
              children: [
                const SizedBox(height: 14),
                Obx(
                  () => _LabeledTextField(
                    label: 'Wi-Fi Network (SSID)',
                    required: true,
                    controller: controller.wifiSsidCtrl,
                    hint: 'Enter Wi-Fi network name',
                    errorText: controller.ssidError.value,
                  ),
                ),
                const SizedBox(height: 14),
                Obx(
                  () => _LabeledTextField(
                    label: 'Wi-Fi Password',
                    required: true,
                    controller: controller.wifiPasswordCtrl,
                    hint: 'Enter Wi-Fi password',
                    obscureText: !controller.isWifiPasswordVisible.value,
                    errorText: controller.wifiPasswordError.value,
                    suffixIcon: IconButton(
                      onPressed: controller.toggleWifiPasswordVisibility,
                      icon: Icon(
                        controller.isWifiPasswordVisible.value
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: Colors.white38,
                        size: 18,
                      ),
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

  // ---------------- Content & Playback Settings ----------------
  Widget _buildContentPlaybackCard() {
    return _cardWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => _ToggleRow(
              label: 'Auto Play on Boot',
              required: true,
              value: controller.autoPlayOnBoot.value,
              onChanged: controller.toggleAutoPlayOnBoot,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _ToggleRow(
              label: 'Loop Content',
              value: controller.loopContent.value,
              onChanged: controller.toggleLoopContent,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Default Content Source',
              required: true,
              hint: 'Select content source',
              value: controller.defaultContentSource.value.isEmpty
                  ? null
                  : controller.defaultContentSource.value,
              items: controller.defaultContentSourceOptions,
              onChanged: controller.setDefaultContentSource,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Content Update Frequency',
              hint: 'Select update frequency',
              value: controller.contentUpdateFrequency.value.isEmpty
                  ? null
                  : controller.contentUpdateFrequency.value,
              items: controller.contentUpdateFrequencyOptions,
              onChanged: controller.setContentUpdateFrequency,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _ToggleRow(
              label: 'Sync Time with Server',
              showInfoIcon: true,
              value: controller.syncTimeWithServer.value,
              onChanged: controller.toggleSyncTimeWithServer,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- System & Maintenance ----------------
  Widget _buildSystemMaintenanceCard() {
    return _cardWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => _ToggleRow(
              label: 'Remote Monitoring',
              value: controller.remoteMonitoring.value,
              onChanged: controller.toggleRemoteMonitoring,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _ToggleRow(
              label: 'Enable Alerts & Notifications',
              value: controller.enableAlerts.value,
              onChanged: controller.toggleEnableAlerts,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Reboot Schedule',
              hint: 'Select reboot schedule',
              value: controller.rebootSchedule.value.isEmpty ? null : controller.rebootSchedule.value,
              items: controller.rebootScheduleOptions,
              onChanged: controller.setRebootSchedule,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => _LabeledDropdown(
              label: 'Time Zone',
              required: true,
              hint: 'Select time zone',
              value: controller.timeZone.value.isEmpty ? null : controller.timeZone.value,
              items: controller.timeZoneOptions,
              onChanged: controller.setTimeZone,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Notes ----------------
  Widget _buildNotesCard() {
    return _cardWrapper(
      child: Obx(
        () => _LabeledNotesField(
          controller: controller.configNotesCtrl,
          hint: 'Add any notes about the configuration',
          maxLength: 200,
          currentLength: controller.configNotesLen.value,
        ),
      ),
    );
  }

  // ---------------- Footer (Back + Next: Review & Save) ----------------
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
            onTap: controller.onStep3BackPressed,
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
              onTap: controller.onStep3NextPressed,
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [kBlue, kPurple]),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Next: Review & Save',
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
// Slider row (Screen Brightness / Volume Level)
// =====================================================================
class _SliderRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool required;
  final double value;
  final ValueChanged<double> onChanged;
  final String valueLabel;

  const _SliderRow({
    required this.icon,
    required this.label,
    this.required = false,
    required this.value,
    required this.onChanged,
    required this.valueLabel,
  });

  static const Color kPurple = RegisterDeviceView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: kPurple, size: 16),
        const SizedBox(width: 8),
        SizedBox(
          width: 92,
          child: RichText(
            text: TextSpan(
              text: label,
              style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600),
              children: required
                  ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))]
                  : [],
            ),
          ),
        ),
        Expanded(
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: kPurple,
              inactiveTrackColor: Colors.white12,
              thumbColor: kPurple,
              overlayColor: kPurple.withOpacity(0.2),
              trackHeight: 3,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
            ),
            child: Slider(
              value: value,
              min: 0,
              max: 100,
              onChanged: onChanged,
            ),
          ),
        ),
        SizedBox(
          width: 36,
          child: Text(
            valueLabel,
            textAlign: TextAlign.right,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}

// =====================================================================
// Inline icon + label + dropdown row (Orientation / Screen Timeout)
// =====================================================================
class _InlineDropdownRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool required;
  final String value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const _InlineDropdownRow({
    required this.icon,
    required this.label,
    this.required = false,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  static const Color kPurple = RegisterDeviceView.kPurple;
  static const Color kFieldBg = RegisterDeviceView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: kPurple, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              text: label,
              style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600),
              children: required
                  ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))]
                  : [],
            ),
          ),
        ),
        SizedBox(
          width: 150,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value.isEmpty ? null : value,
                isExpanded: true,
                dropdownColor: kFieldBg,
                icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 18),
                style: const TextStyle(color: Colors.white, fontSize: 12.5),
                items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
                onChanged: onChanged,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// =====================================================================
// Toggle row (switch settings)
// =====================================================================
class _ToggleRow extends StatelessWidget {
  final String label;
  final bool required;
  final bool showInfoIcon;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleRow({
    required this.label,
    this.required = false,
    this.showInfoIcon = false,
    required this.value,
    required this.onChanged,
  });

  static const Color kPurple = RegisterDeviceView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Flexible(
          child: RichText(
            text: TextSpan(
              text: label,
              style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600),
              children: required
                  ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))]
                  : [],
            ),
          ),
        ),
        if (showInfoIcon) ...[
          const SizedBox(width: 4),
          const Icon(Icons.info_outline, color: Colors.white24, size: 13),
        ],
        const Spacer(),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: Colors.white,
          activeTrackColor: kPurple,
          inactiveThumbColor: Colors.white54,
          inactiveTrackColor: Colors.white12,
        ),
      ],
    );
  }
}

// =====================================================================
// Labeled dropdown (full-width, shared styling)
// =====================================================================
class _LabeledDropdown extends StatelessWidget {
  final String label;
  final bool required;
  final String hint;
  final String? value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const _LabeledDropdown({
    required this.label,
    this.required = false,
    required this.hint,
    required this.value,
    required this.items,
    required this.onChanged,
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
            style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
            children: required
                ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))]
                : [],
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              dropdownColor: kFieldBg,
              icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 20),
              hint: Text(hint, style: const TextStyle(color: Colors.white30, fontSize: 12.5)),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

// =====================================================================
// Labeled text field (used for SSID / Wi-Fi password)
// =====================================================================
class _LabeledTextField extends StatelessWidget {
  final String label;
  final bool required;
  final TextEditingController controller;
  final String hint;
  final bool obscureText;
  final Widget? suffixIcon;
  final String? errorText;

  const _LabeledTextField({
    required this.label,
    this.required = false,
    required this.controller,
    required this.hint,
    this.obscureText = false,
    this.suffixIcon,
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
            style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
            children: required
                ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))]
                : [],
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: errorText != null ? const Color(0xFFFF4D4D) : Colors.white.withOpacity(0.08),
            ),
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              border: InputBorder.none,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 12.5),
              suffixIcon: suffixIcon,
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
  final String? label;
  final TextEditingController controller;
  final String hint;
  final int maxLength;
  final int currentLength;

  const _LabeledNotesField({
    this.label,
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
        if (label != null) ...[
          Text(
            label!,
            style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
        ],
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
