import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hardware_config_controller.dart';
import 'hardware_configuration_view.dart' show HardwareConfigurationView;

/// Shown after `onConfirmSaveConfig()` succeeds on the Review & Save screen.
/// Shares `HardwareConfigController` so it can read back what was just saved.
class ConfigurationSavedView extends GetView<HardwareConfigController> {
  const ConfigurationSavedView({super.key});

  static const Color kBg = HardwareConfigurationView.kBg;
  static const Color kCardBg = HardwareConfigurationView.kCardBg;
  static const Color kFieldBg = HardwareConfigurationView.kFieldBg;
  static const Color kPurple = HardwareConfigurationView.kPurple;
  static const Color kIndigo = HardwareConfigurationView.kIndigo;
  static const Color kBorder = HardwareConfigurationView.kBorder;
  static const Color kGreen = HardwareConfigurationView.kGreen;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildSuccessBadge(),
                const SizedBox(height: 18),
                const Text(
                  'Configuration Saved!',
                  style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Your device configuration has been saved successfully.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white54, fontSize: 12.5),
                ),
                const SizedBox(height: 22),
                _buildDetailsCard(),
                const SizedBox(height: 22),
                _buildStatusIllustration(),
                const SizedBox(height: 22),
                _buildPrimaryButton(),
                const SizedBox(height: 10),
                _buildSecondaryButton(),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------- Success badge (green ring + check + decorative dots) ----------------
  Widget _buildSuccessBadge() {
    return SizedBox(
      width: 130,
      height: 130,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ..._buildDots(),
          Container(
            width: 84,
            height: 84,
            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: kGreen, width: 2.5)),
            child: const Icon(Icons.check, color: kGreen, size: 38),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDots() {
    const positions = [
      Alignment(-0.75, -0.75),
      Alignment(0.85, -0.55),
      Alignment(-0.95, 0.15),
      Alignment(0.75, 0.75),
      Alignment(-0.35, 0.95),
      Alignment(0.25, -0.98),
    ];
    return positions
        .map(
          (a) => Align(
            alignment: a,
            child: Container(
              width: 5,
              height: 5,
              decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle),
            ),
          ),
        )
        .toList();
  }

  // ---------------- Details card ----------------
  Widget _buildDetailsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Obx(
        () => Column(
          children: [
            _detailRow(
              icon: Icons.desktop_windows_outlined,
              label: '${'device_colon'.tr} ${controller.deviceId.value}',
              value: '${controller.vehicleNumber.value} · ${controller.depotLocation.value}',
              trailing: Row(
                children: [
                  const Icon(Icons.circle, color: kGreen, size: 7),
                  const SizedBox(width: 5),
                  Text('online'.tr, style: const TextStyle(color: kGreen, fontSize: 11.5, fontWeight: FontWeight.w600)),
                ],
              ),
              isHeaderRow: true,
            ),
            _divider(),
            _detailRow(icon: Icons.event_available_outlined, label: 'saved_on_label'.tr, value: controller.savedOnText, alignEnd: true),
            _divider(),
            _detailRow(icon: Icons.person_outline, label: 'saved_by_label'.tr, value: controller.savedByLabel.value, alignEnd: true),
            _divider(),
            _detailRow(
              icon: Icons.info_outline,
              label: 'config_version_label'.tr,
              value: controller.configVersionLabel.value,
              alignEnd: true,
            ),
            _divider(),
            _detailRow(
              icon: Icons.checklist_rtl,
              label: 'sections_updated_label'.tr,
              value: controller.sectionsUpdatedLabel.value,
              alignEnd: true,
            ),
            _divider(),
            _detailRow(
              icon: Icons.description_outlined,
              label: 'change_log_label'.tr,
              value: '',
              alignEnd: true,
              trailing: GestureDetector(
                onTap: () {
                  // TODO: navigate to a detailed change-log screen
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('view_details_btn'.tr, style: const TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                    const Icon(Icons.chevron_right, color: kPurple, size: 15),
                  ],
                ),
              ),
              isLast: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withValues(alpha: 0.06), height: 1);

  Widget _detailRow({
    required IconData icon,
    required String label,
    required String value,
    Widget? trailing,
    bool alignEnd = false,
    bool isHeaderRow = false,
    bool isLast = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(color: kPurple.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: kPurple, size: 15),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: isHeaderRow
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(label, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(value, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                    ],
                  )
                : Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          ),
          if (!isHeaderRow)
            Flexible(
              child: trailing ??
                  Text(
                    value,
                    textAlign: TextAlign.end,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
                  ),
            ),
          if (isHeaderRow && trailing != null) trailing,
        ],
      ),
    );
  }

  // ---------------- Device illustration + status line ----------------
  Widget _buildStatusIllustration() {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: const Icon(Icons.desktop_windows_outlined, color: Colors.white24, size: 28),
            ),
            Positioned(
              bottom: -2,
              right: -2,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(color: kBg, shape: BoxShape.circle),
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle),
                  child: const Icon(Icons.check, color: Colors.white, size: 12),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        const Text(
          'The new configuration has been applied\nand the device is up to date.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white38, fontSize: 11),
        ),
      ],
    );
  }

  // ---------------- Buttons ----------------
  Widget _buildPrimaryButton() {
    return GestureDetector(
      onTap: controller.onGoToDisplayDevices,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppTheme.gradientPink.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.home_outlined, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                'go_to_display_devices'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecondaryButton() {
    return GestureDetector(
      onTap: controller.onConfigureAnotherDevice,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kPurple.withValues(alpha: 0.5)),
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.tune, color: kPurple, size: 18),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                'configure_another_device'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: kPurple, fontSize: 14.5, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
