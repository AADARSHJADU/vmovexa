import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hardware_config_controller.dart';
import 'shared_widgets.dart';

class SystemSettingsTab extends GetView<HardwareConfigController> {
  const SystemSettingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        _buildDeviceInformationCard(),
        const SizedBox(height: 16),
        _buildDateTimeCard(),
        const SizedBox(height: 16),
        _buildDeviceManagementCard(),
        const SizedBox(height: 16),
        const InfoNoteBanner(),
      ],
    );
  }

  Widget _buildDeviceInformationCard() {
    return SectionCard(
      icon: Icons.info_outline,
      title: 'Device Information',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(() => InfoKeyValueRow(icon: Icons.badge_outlined, label: 'Device ID', value: controller.deviceId.value)),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.memory_outlined, label: 'Hardware Model', value: controller.hardwareModel.value)),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.numbers_outlined, label: 'Serial Number', value: controller.serialNumber.value)),
          const ThinDivider(),
          Obx(
            () => InfoKeyValueRow(
              icon: Icons.system_update_outlined,
              label: 'Firmware Version',
              value: controller.firmwareVersion.value,
              trailingBadge: controller.isFirmwareUpToDate.value ? const StatusBadge(label: 'Up to date') : null,
            ),
          ),
          const ThinDivider(),
          Obx(
            () => InfoKeyValueRow(
              icon: Icons.hub_outlined,
              label: 'Edge Agent Version',
              value: controller.edgeAgentVersion.value,
              trailingBadge: controller.isEdgeAgentUpToDate.value ? const StatusBadge(label: 'Up to date') : null,
            ),
          ),
          const ThinDivider(),
          Obx(
            () => InfoKeyValueRow(
              icon: Icons.android_outlined,
              label: 'OS Version',
              value: controller.osVersion.value,
              trailingBadge: controller.isOsUpToDate.value ? const StatusBadge(label: 'Up to date') : null,
            ),
          ),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.timelapse_outlined, label: 'Uptime', value: controller.uptime.value)),
          const ThinDivider(),
          Obx(
            () => InfoKeyValueRow(
              icon: Icons.monitor_heart_outlined,
              label: 'Device Status',
              value: controller.deviceStatus.value,
              trailingBadge: const Icon(Icons.check_circle, color: kGreen, size: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateTimeCard() {
    return SectionCard(
      icon: Icons.access_time,
      title: 'Date & Time',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => NavRow(
              icon: Icons.calendar_today_outlined,
              label: 'Device Date & Time',
              value: controller.deviceDateTime.value,
              onTap: controller.onDeviceDateTimeTap,
            ),
          ),
          const ThinDivider(),
          Obx(
            () => NavRow(
              icon: Icons.public,
              label: 'Time Zone',
              value: controller.timeZoneLabel.value,
              onTap: controller.onTimeZoneTap,
            ),
          ),
          const ThinDivider(),
          const SizedBox(height: 6),
          Obx(
            () => Row(
              children: [
                const Icon(Icons.sync, color: kPurple, size: 15),
                const SizedBox(width: 8),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Auto Time Sync', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
                      Text('Synchronize time with server', style: TextStyle(color: Colors.white38, fontSize: 10)),
                    ],
                  ),
                ),
                Switch(
                  value: controller.autoTimeSync.value,
                  onChanged: controller.toggleAutoTimeSync,
                  activeColor: Colors.white,
                  activeTrackColor: kPurple,
                  inactiveThumbColor: Colors.white54,
                  inactiveTrackColor: Colors.white12,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceManagementCard() {
    return SectionCard(
      icon: Icons.build_outlined,
      title: 'Device Management',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => ActionRow(
              icon: Icons.restart_alt,
              label: 'Restart Device',
              description: 'Restart the device to apply changes',
              buttonLabel: 'Restart',
              buttonColor: kBlue,
              isLoading: controller.isRestarting.value,
              onPressed: controller.onRestartDevice,
            ),
          ),
          const ThinDivider(),
          Obx(
            () => ActionRow(
              icon: Icons.cleaning_services_outlined,
              label: 'Clear Cache',
              description: 'Clear local cache and temporary files',
              buttonLabel: 'Clear',
              buttonColor: kPurple,
              isLoading: controller.isClearingCache.value,
              onPressed: controller.onClearCache,
            ),
          ),
          const ThinDivider(),
          ActionRow(
            icon: Icons.warning_amber_rounded,
            label: 'Factory Reset',
            description: 'Reset device to factory default settings',
            buttonLabel: 'Reset',
            buttonColor: kRed,
            isDanger: true,
            onPressed: controller.onFactoryReset,
          ),
        ],
      ),
    );
  }
}
