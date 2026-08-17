import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller/hardware_status_controller.dart';
import '../model/hardware_status_device_model.dart';

class HardwareStatusView extends GetView<HardwareStatusController> {
  const HardwareStatusView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);
  static const Color kRed = Color(0xFFFF4D4D);
  static const Color kOrange = Color(0xFFFFA726);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.allDevices.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 4),
                      const Text(
                        'View real-time status of all devices.',
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                      const SizedBox(height: 16),
                      _buildSearchAndFilterRow(),
                      const SizedBox(height: 14),
                      _buildStatsRow(),
                      const SizedBox(height: 16),
                      _buildDeviceList(),
                      const SizedBox(height: 14),
                      _buildFooter(),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
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
        const Text(
          'Hardware Status',
          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  // ---------------- Search bar + filter button ----------------
  Widget _buildSearchAndFilterRow() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: TextField(
              onChanged: controller.onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 14),
                hintText: 'Search by Device ID or Vehicle',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 12.5),
                prefixIcon: Icon(Icons.search, color: Colors.white38, size: 20),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        GestureDetector(
          onTap: controller.onOpenFilterSheet,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kPurple.withOpacity(0.4)),
            ),
            child: const Icon(Icons.tune, color: kPurple, size: 18),
          ),
        ),
      ],
    );
  }

  // ---------------- Stats row (Total / Online / Offline / Issues) ----------------
  Widget _buildStatsRow() {
    return Obx(
      () => Row(
        children: [
          Expanded(
            child: _StatPill(
              icon: Icons.desktop_windows_outlined,
              iconColor: kPurple,
              count: '${controller.totalDevices}',
              label: 'Total Devices',
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatPill(
              icon: Icons.check_circle_outline,
              iconColor: kGreen,
              count: '${controller.onlineCount}',
              label: 'Online',
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatPill(
              icon: Icons.wifi,
              iconColor: Colors.white54,
              count: '${controller.offlineCount}',
              label: 'Offline',
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatPill(
              icon: Icons.settings_outlined,
              iconColor: kPurple,
              count: '${controller.issuesCount}',
              label: 'Issues',
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Device list ----------------
  Widget _buildDeviceList() {
    return Obx(() {
      final devices = controller.filteredDevices;
      if (devices.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(
            child: Text('No devices found', style: TextStyle(color: Colors.white38, fontSize: 13)),
          ),
        );
      }
      return Column(
        children: devices
            .map(
              (device) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _DeviceStatusCard(
                  device: device,
                  onTap: () => controller.onDeviceTap(device),
                ),
              ),
            )
            .toList(),
      );
    });
  }

  // ---------------- Footer (Last updated + Refresh) ----------------
  Widget _buildFooter() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Obx(
          () => Text(
            'Last updated: ${controller.lastUpdatedText}',
            style: const TextStyle(color: Colors.white38, fontSize: 11),
          ),
        ),
        GestureDetector(
          onTap: controller.onRefresh,
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.refresh, color: kPurple, size: 14),
              SizedBox(width: 4),
              Text('Refresh', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }
}

// =====================================================================
// Stat pill
// =====================================================================
class _StatPill extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String count;
  final String label;

  const _StatPill({required this.icon, required this.iconColor, required this.count, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
      decoration: BoxDecoration(
        color: HardwareStatusView.kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HardwareStatusView.kBorder),
      ),
      child: Column(
        children: [
          Icon(icon, color: iconColor, size: 16),
          const SizedBox(height: 6),
          Text(count, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 9)),
        ],
      ),
    );
  }
}

// =====================================================================
// Device status card
// =====================================================================
class _DeviceStatusCard extends StatelessWidget {
  final HardwareStatusDevice device;
  final VoidCallback onTap;

  const _DeviceStatusCard({required this.device, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: HardwareStatusView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: HardwareStatusView.kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: HardwareStatusView.kPurple.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.desktop_windows_outlined, color: HardwareStatusView.kPurple, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(device.deviceId, style: const TextStyle(color: Colors.white, fontSize: 10)),
                      const SizedBox(height: 2),
                      Text(
                        device.vehicleNumber,
                        style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 2),
                      Text(device.depotLocation, style: const TextStyle(color: Colors.white, fontSize: 10.5)),
                    ],
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(color: device.onlineState.color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      device.onlineState.label,
                      style: TextStyle(color: device.onlineState.color, fontSize: 10.5, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(width: 2),
                const Icon(Icons.chevron_right, color: Colors.white, size: 16),
              ],
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.only(left: 46),
              child: Row(
                children: [
                  _SubStatusChip(icon: device.gpsStatus.icon, color: device.gpsStatus.color, label: 'GPS', valueLabel: device.gpsStatus.label),
                  const SizedBox(width: 20),
                  _SubStatusChip(icon: device.displayStatus.icon, color: device.displayStatus.color, label: 'Display', valueLabel: device.displayStatus.label),
                  const SizedBox(width: 20),
                  _SubStatusChip(icon: device.hardwareStatus.icon, color: device.hardwareStatus.color, label: 'Hardware', valueLabel: device.hardwareStatus.label),
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
// Sub-status chip (GPS / Display / Hardware column)
// =====================================================================
class _SubStatusChip extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String valueLabel;

  const _SubStatusChip({required this.icon, required this.color, required this.label, required this.valueLabel});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 9.5)),
        const SizedBox(height: 3),
        Icon(icon, color: color, size: 17),
        const SizedBox(height: 2),
        Text(valueLabel, style: TextStyle(color: color, fontSize: 9.5, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
