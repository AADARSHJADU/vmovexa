import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../hardware_status/model/hardware_status_device_model.dart';
import '../controller/connectivity_troubleshooting_controller.dart';
import '../model/troubleshoot_device_model.dart';


class ConnectivityTroubleshootingView extends GetView<ConnectivityTroubleshootingController> {
  const ConnectivityTroubleshootingView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
          children: [
            _buildHeader(),
            const SizedBox(height: 16),
            _buildDeviceSelector(),
            Obx(() => controller.isDevicePickerOpen.value ? _buildDevicePickerPanel() : const SizedBox()),
            Obx(() {
              if (controller.isDevicePickerOpen.value) return const SizedBox();
              final device = controller.selectedDevice.value;
              if (device == null) return const SizedBox();
              return Column(
                children: [
                  const SizedBox(height: 16),
                  _buildStatusCard(device),
                ],
              );
            }),
            const SizedBox(height: 20),
            const Text(
              'Troubleshooting Actions',
              style: TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            _buildTroubleshootingActions(),
            const SizedBox(height: 20),
            const Text(
              'Resolution / Status',
              style: TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            _buildResolutionStatusCard(),
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
                'Connectivity Troubleshooting',
                style: TextStyle(color: Colors.white, fontSize: 17.5, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 2),
              Text(
                'Troubleshoot and resolve connectivity issues.',
                style: TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Selected Device selector row ----------------
  Widget _buildDeviceSelector() {
    return GestureDetector(
      onTap: controller.toggleDevicePicker,
      child: Obx(
        () {
          final isOpen = controller.isDevicePickerOpen.value;
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kPurple.withOpacity(isOpen ? 0.7 : 0.4)),
            ),
            child: Row(
              children: [
                const Text('Selected Device', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w700)),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    controller.selectedDevice.value?.vehicleNumber ?? 'Select a device to troubleshoot',
                    textAlign: TextAlign.right,
                    style: TextStyle(
                      color: controller.selectedDevice.value != null ? Colors.white : Colors.white38,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Icon(isOpen ? Icons.keyboard_arrow_up : Icons.chevron_right, color: kPurple, size: 18),
              ],
            ),
          );
        },
      ),
    );
  }

  // ---------------- Device picker dropdown panel ----------------
  Widget _buildDevicePickerPanel() {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select Device', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: TextField(
              onChanged: controller.onDeviceSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 12),
                hintText: 'Search by Bus Number or Device ID',
                hintStyle: TextStyle(color: Colors.white30, fontSize: 12),
                prefixIcon: Icon(Icons.search, color: Colors.white38, size: 18),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Obx(
            () => Column(
              children: controller.devicePickerPreview
                  .map(
                    (device) => _DevicePickerRow(
                      device: device,
                      onTap: () => controller.onSelectDevice(device),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: controller.onViewAllDevices,
            child: const Row(
              children: [
                Text('View All Devices', style: TextStyle(color: kPurple, fontSize: 12.5, fontWeight: FontWeight.w600)),
                Spacer(),
                Icon(Icons.chevron_right, color: kPurple, size: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Status card (selected device summary + 4 status rows) ----------------
  Widget _buildStatusCard(TroubleshootDevice device) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.desktop_windows_outlined, color: kPurple, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(device.deviceId, style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text('${device.vehicleNumber}', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                      Text(device.depotLocation, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: device.onlineState.color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 6, height: 6, decoration: BoxDecoration(color: device.onlineState.color, shape: BoxShape.circle)),
                      const SizedBox(width: 4),
                      Text(device.onlineState.label, style: TextStyle(color: device.onlineState.color, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white10, height: 1),
          _StatusRow(icon: Icons.wifi, title: 'Connection Status', subtitle: 'Device connectivity', statusLabel: device.onlineState.label, isOk: device.onlineState == DeviceOnlineState.online),
          const Divider(color: Colors.white10, height: 1, indent: 12, endIndent: 12),
          _StatusRow(icon: Icons.bar_chart, title: 'Network Status', subtitle: 'Network connection', statusLabel: device.networkStatus.label, isOk: device.networkStatus == ConnSubStatus.connected),
          const Divider(color: Colors.white10, height: 1, indent: 12, endIndent: 12),
          _StatusRow(icon: Icons.location_on_outlined, title: 'GPS Connection', subtitle: 'GPS signal and connectivity', statusLabel: device.gpsStatus.label, isOk: device.gpsStatus == ConnSubStatus.connected),
          const Divider(color: Colors.white10, height: 1, indent: 12, endIndent: 12),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.access_time, color: kPurple, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Last Connection', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(device.lastConnectionText, style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Troubleshooting actions (Test Connection / Reconnect) ----------------
  Widget _buildTroubleshootingActions() {
    return Row(
      children: [
        Expanded(
          child: Obx(
            () => _ActionCard(
              icon: Icons.refresh,
              title: 'Test Connection',
              subtitle: 'Test device, network and\nGPS connectivity',
              isLoading: controller.isTestingConnection.value,
              onTap: controller.onTestConnection,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Obx(
            () => _ActionCard(
              icon: Icons.podcasts,
              title: 'Reconnect',
              subtitle: 'Retry connection to device\nand network',
              isLoading: controller.isReconnecting.value,
              onTap: controller.onReconnect,
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Resolution / Status card ----------------
  Widget _buildResolutionStatusCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Obx(
        () => Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: (controller.noIssuesDetected.value ? kGreen : const Color(0xFFFF4D4D)).withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                controller.noIssuesDetected.value ? Icons.check : Icons.close,
                color: controller.noIssuesDetected.value ? kGreen : const Color(0xFFFF4D4D),
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    controller.noIssuesDetected.value ? 'No issues detected' : 'Issues detected',
                    style: TextStyle(
                      color: controller.noIssuesDetected.value ? kGreen : const Color(0xFFFF4D4D),
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(controller.resolutionMessage.value, style: const TextStyle(color: Colors.white54, fontSize: 11.5)),
                  const SizedBox(height: 10),
                  Text(
                    'Last checked: ${controller.lastCheckedText}',
                    style: const TextStyle(color: Colors.white38, fontSize: 10.5),
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

// =====================================================================
// Device picker row (inside dropdown panel)
// =====================================================================
class _DevicePickerRow extends StatelessWidget {
  final TroubleshootDevice device;
  final VoidCallback onTap;

  const _DevicePickerRow({required this.device, required this.onTap});

  static const Color kFieldBg = ConnectivityTroubleshootingView.kFieldBg;
  static const Color kPurple = ConnectivityTroubleshootingView.kPurple;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
        decoration: BoxDecoration(
          color: kFieldBg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
              child: const Icon(Icons.directions_bus_filled_outlined, color: kPurple, size: 15),
            ),
            const SizedBox(width: 9),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(device.vehicleNumber, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 1),
                  Text(device.deviceId, style: const TextStyle(color: Colors.white38, fontSize: 10)),
                ],
              ),
            ),
            Row(
              children: [
                Container(width: 6, height: 6, decoration: BoxDecoration(color: device.onlineState.color, shape: BoxShape.circle)),
                const SizedBox(width: 4),
                Text(device.onlineState.label, style: TextStyle(color: device.onlineState.color, fontSize: 10.5, fontWeight: FontWeight.w600)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Status row (Connection / Network / GPS status)
// =====================================================================
class _StatusRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String statusLabel;
  final bool isOk;

  const _StatusRow({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.statusLabel,
    required this.isOk,
  });

  static const Color kPurple = ConnectivityTroubleshootingView.kPurple;
  static const Color kGreen = ConnectivityTroubleshootingView.kGreen;

  @override
  Widget build(BuildContext context) {
    final color = isOk ? kGreen : const Color(0xFFFF4D4D);
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: kPurple, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
              ],
            ),
          ),
          Row(
            children: [
              Icon(isOk ? Icons.check_circle : Icons.cancel, color: color, size: 16),
              const SizedBox(width: 4),
              Text(statusLabel, style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Troubleshooting action card (Test Connection / Reconnect)
// =====================================================================
class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isLoading;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isLoading,
    required this.onTap,
  });

  static const Color kCardBg = ConnectivityTroubleshootingView.kCardBg;
  static const Color kPurple = ConnectivityTroubleshootingView.kPurple;
  static const Color kBorder = ConnectivityTroubleshootingView.kBorder;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: kPurple.withOpacity(0.15), shape: BoxShape.circle),
              child: isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(color: kPurple, strokeWidth: 2),
                    )
                  : Icon(icon, color: kPurple, size: 16),
            ),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 3),
            Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}
