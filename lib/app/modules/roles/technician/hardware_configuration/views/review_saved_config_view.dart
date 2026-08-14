import 'package:flutter/material.dart';
import 'package:get/get.dart';
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
                    title: 'Assigned Vehicle',
                    tabIndexToEdit: null,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('Vehicle', controller.assignedVehicle.value),
                          _kv('Organization / Fleet', controller.organizationFleet.value),
                          _kv('Depot / Location', controller.depotLocation.value),
                          _kv('Installation Position', controller.installationPosition.value),
                          _kv('Power Source', controller.vehiclePowerSource.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.tv_outlined,
                    title: 'Display Settings',
                    tabIndexToEdit: 0,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('Screen Brightness', '${controller.screenBrightness.value.round()}%'),
                          _kv('Screen Timeout', controller.screenTimeout.value),
                          _kv('Auto Brightness', controller.autoBrightness.value ? 'Enabled' : 'Disabled'),
                          _kv('Screen Orientation', controller.screenOrientation.value),
                          _kv('Display Mode', controller.displayMode.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.wifi,
                    title: 'Network Settings',
                    tabIndexToEdit: 1,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('Connection Type', controller.connectionType.value),
                          _kv('SSID', controller.wifiSsid.value),
                          _kv('IP Configuration', 'DHCP'),
                          _kv('IP Address', controller.ipAddress.value),
                          _kvSignal('Signal Strength', controller.signalStrengthPercent.value),
                          _kv('Proxy', controller.useProxy.value ? 'Enabled' : 'Disabled'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.settings_outlined,
                    title: 'System Settings',
                    tabIndexToEdit: 2,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('Device Date & Time', controller.deviceDateTime.value),
                          _kv('Time Zone', controller.timeZoneLabel.value),
                          _kv('Auto Time Sync', controller.autoTimeSync.value ? 'Enabled' : 'Disabled'),
                          _kv('Firmware Version', controller.firmwareVersion.value),
                          _kv('Edge Agent Version', controller.edgeAgentVersion.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.volume_up_outlined,
                    title: 'Audio Settings',
                    tabIndexToEdit: 0,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('Volume Level', '${controller.volumeLevel.value.round()}%'),
                          _kv('Mute', controller.isMuted.value ? 'Enabled' : 'Disabled'),
                          _kv('Audio Output', controller.audioOutput.value),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildSectionCard(
                    icon: Icons.bolt_outlined,
                    title: 'Power Settings',
                    tabIndexToEdit: 0,
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('Power Mode', controller.powerMode.value),
                          _kv('Auto Power On', controller.autoPowerOn.value),
                          _kv('Auto Power Off', controller.autoPowerOff.value),
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
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Review & Save', style: TextStyle(color: Colors.white, fontSize: 16.5, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text(
                'Review all settings before saving the configuration.',
                style: TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        Obx(
              () => GestureDetector(
            onTap: controller.isSaving.value ? null : controller.onConfirmSaveConfig,
            child: const Column(
              children: [
                Icon(Icons.save_outlined, color: kPurple, size: 20),
                SizedBox(height: 2),
                Text('Save Config', style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600)),
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
            decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
            child: const Icon(Icons.desktop_windows_outlined, color: kPurple, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Obx(
                  () => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Device: ${controller.deviceId.value}',
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
              Row(
                children: [
                  Icon(icon, color: kPurple, size: 16),
                  const SizedBox(width: 8),
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
              if (tabIndexToEdit != null)
                GestureDetector(
                  onTap: () => controller.onEditSection(tabIndexToEdit),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Edit', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
                      SizedBox(width: 3),
                      Icon(Icons.edit_outlined, color: kPurple, size: 13),
                    ],
                  ),
                ),
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
            child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11.5)),
          ),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600)),
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
          Text('Excellent ($percent%)',
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
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
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
                    onTap: controller.isSaving.value ? null : controller.onConfirmSaveConfig,
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
                            'Save Configuration',
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
          const SizedBox(height: 8),
          const Row(
            children: [
              Icon(Icons.info_outline, color: Colors.white38, size: 13),
              SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Configuration will be applied to the device after saving.',
                  style: TextStyle(color: Colors.white38, fontSize: 10.5),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}