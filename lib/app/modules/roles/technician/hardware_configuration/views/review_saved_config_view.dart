import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/hardware_config_controller.dart';
import 'hardware_configuration_view.dart' show HardwareConfigurationView;

/// Shown when the technician taps "Save Config" / "Save Configuration" on
/// the Hardware Configuration screen — a final read-only review before the
/// settings are actually persisted. Shares `HardwareConfigController`.
class ReviewAndSaveConfigView extends GetView<HardwareConfigController> {
  const ReviewAndSaveConfigView({super.key});

  static const Color kBg = HardwareConfigurationView.kBg;
  static const Color kCardBg = HardwareConfigurationView.kCardBg;
  static const Color kFieldBg = HardwareConfigurationView.kFieldBg;
  static const Color kPurple = HardwareConfigurationView.kPurple;
  static const Color kBlue = HardwareConfigurationView.kBlue;
  static const Color kBorder = HardwareConfigurationView.kBorder;
  static const Color kGreen = HardwareConfigurationView.kGreen;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: _buildHeader(),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  _buildDeviceSummaryCard(),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.directions_bus_filled_outlined,
                    title: 'assigned_vehicle_section'.tr,
                    tabIndexToEdit: null,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('vehicle'.tr, controller.assignedVehicle.value),
                          _kv('organization'.tr, controller.organizationFleet.value),
                          _kv('depot'.tr, controller.depotLocation.value),
                          _kv('installation_position'.tr, controller.installationPosition.value),
                          _kv('power_source'.tr, controller.vehiclePowerSource.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.tv_outlined,
                    title: 'display_settings_section'.tr,
                    tabIndexToEdit: 0,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('screen_brightness_label'.tr, '${controller.screenBrightness.value.round()}%'),
                          _kv('screen_timeout_label'.tr, controller.screenTimeout.value),
                          _kv('auto_brightness_label'.tr, controller.autoBrightness.value ? 'enabled_status'.tr : 'disabled_status'.tr),
                          _kv('screen_orientation_label'.tr, controller.screenOrientation.value),
                          _kv('display_mode_label'.tr, controller.displayMode.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.wifi,
                    title: 'network_settings_section'.tr,
                    tabIndexToEdit: 1,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('connection_type_label'.tr, controller.connectionType.value),
                          _kv('ssid_label'.tr, controller.wifiSsid.value),
                          _kv('ip_config_label'.tr, 'DHCP'),
                          _kv('ip_address'.tr, controller.ipAddress.value),
                          _kvSignal('signal_strength_label'.tr, controller.signalStrengthPercent.value),
                          _kv('proxy_label'.tr, controller.useProxy.value ? 'enabled_status'.tr : 'disabled_status'.tr),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.settings_outlined,
                    title: 'system_settings_section'.tr,
                    tabIndexToEdit: 2,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('device_datetime_label'.tr, controller.deviceDateTime.value),
                          _kv('timezone_label'.tr, controller.timeZoneLabel.value),
                          _kv('auto_time_sync_label'.tr, controller.autoTimeSync.value ? 'enabled_status'.tr : 'disabled_status'.tr),
                          _kv('firmware_version_label'.tr, controller.firmwareVersion.value),
                          _kv('edge_agent_version_label'.tr, controller.edgeAgentVersion.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.volume_up_outlined,
                    title: 'audio_settings_section'.tr,
                    tabIndexToEdit: 0,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('volume_level_label'.tr, '${controller.volumeLevel.value.round()}%'),
                          _kv('mute_label'.tr, controller.isMuted.value ? 'enabled_status'.tr : 'disabled_status'.tr),
                          _kv('audio_output_label'.tr, controller.audioOutput.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.bolt_outlined,
                    title: 'power_settings_section'.tr,
                    tabIndexToEdit: 0,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('power_mode_label'.tr, controller.powerMode.value),
                          _kv('auto_power_on_label'.tr, controller.autoPowerOn.value),
                          _kv('auto_power_off_label'.tr, controller.autoPowerOff.value),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            _buildFooter(),
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
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('review_and_save_title'.tr, style: const TextStyle(color: Colors.white, fontSize: 16.5, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(
                'review_and_save_subtitle'.tr,
                style: const TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        Obx(
              () => GestureDetector(
            onTap: controller.isSaving.value ? null : controller.onConfirmSaveConfig,
            child: Column(
              children: [
                const Icon(Icons.save_outlined, color: kPurple, size: 20),
                const SizedBox(height: 2),
                Text('save_config_action'.tr, style: const TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Device summary strip ----------------
  Widget _buildDeviceSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: kPurple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(9)),
            child: const Icon(Icons.desktop_windows_outlined, color: kPurple, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Obx(
                  () => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${'device_colon'.tr} ${controller.deviceId.value}',
                      style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text('${controller.vehicleNumber.value} · ${controller.depotLocation.value}',
                      style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                ],
              ),
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
                  controller.isDeviceOnline.value ? 'online'.tr : 'offline'.tr,
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

  // ---------------- Shared section card with Edit link ----------------
  Widget _buildSectionCard({
    required IconData icon,
    required String title,
    required int? tabIndexToEdit,
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
              Expanded(
                child: Row(
                  children: [
                    Icon(icon, color: kPurple, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ),
              if (tabIndexToEdit != null) ...[
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => controller.onEditSection(tabIndexToEdit),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'edit'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(width: 3),
                      const Icon(Icons.edit_outlined, color: kPurple, size: 13),
                    ],
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  Widget _kv(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white54, fontSize: 11.5),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _kvSignal(String label, int percent) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11.5))),
          const Icon(Icons.signal_cellular_alt, color: kGreen, size: 13),
          const SizedBox(width: 4),
          Text('${'good_signal'.tr} ($percent%)',
              style: const TextStyle(color: kGreen, fontSize: 11.5, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  // ---------------- Footer (Back + Save Configuration + info note) ----------------
  Widget _buildFooter() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: controller.onBackPressed,
                child: Container(
                  height: 50,
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: kPurple.withValues(alpha: 0.4)),
                  ),
                  alignment: Alignment.center,
                  child: Row(
                    children: [
                      const Icon(Icons.chevron_left, color: kPurple, size: 18),
                      Text(
                        'back'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Obx(
                      () => GestureDetector(
                    onTap: controller.isSaving.value ? null : controller.onConfirmSaveConfig,
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
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4),
                      )
                          : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.save_outlined, color: Colors.white, size: 17),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'save_configuration'.tr,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
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
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.info_outline, color: Colors.white38, size: 13),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'review_and_save_subtitle'.tr,
                  style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}