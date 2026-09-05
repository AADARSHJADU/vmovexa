import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

import '../controller/display_devices_controller.dart';
import '../model/display_device_model.dart';

class DisplayDevicesView extends GetView<DisplayDevicesController> {
  const DisplayDevicesView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.allDevices.isEmpty
              ? const Center(
                  child: CircularProgressIndicator(color: kPurple),
                )
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
                        'View and manage all registered display devices.',
                        style: TextStyle(color: Colors.white54, fontSize: 12.5),
                      ),
                      const SizedBox(height: 16),
                      _buildSearchAndFilterRow(),
                      const SizedBox(height: 14),
                      _buildStatsBar(),
                      const SizedBox(height: 20),
                      _buildListHeaderRow(),
                      const SizedBox(height: 12),
                      _buildDeviceList(),
                      const SizedBox(height: 14),
                      _buildPaginationFooter(),
                      const SizedBox(height: 16),
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
        IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
        const SizedBox(width: 8),
        const Expanded(
          child: Text(
            'Display Devices',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        Stack(
          clipBehavior: Clip.none,
          children: [
            const Icon(Icons.notifications_none_rounded, color: Colors.white70),
            Positioned(
              right: -2,
              top: -2,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(
                  color: kPurple,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
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
                hintText: 'Search by Device ID, Vehicle or Location',
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
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kPurple.withOpacity(0.4)),
            ),
            child: SvgPicture.asset(
              'assets/icons/filter.svg'),
          ),
        ),
      ],
    );
  }

  // ---------------- Stats bar (Total / Online / Offline / Maintenance) ----------------
  Widget _buildStatsBar() {
    return Obx(
      () => Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            Expanded(
              child: _StatPill(
                svgPath: 'assets/icons/tv.svg',
                iconColor: kPurple,
                count: '${controller.totalDevices}',
                label: 'Total Devices',
                showDot: false,
              ),
            ),
            _divider(),
            Expanded(
              child: _StatPill(
                icon: null,
                iconColor: const Color(0xFF2ECC71),
                count: '${controller.onlineCount}',
                label: 'Online',
                showDot: true,
              ),
            ),
            _divider(),
            Expanded(
              child: _StatPill(
                icon: null,
                iconColor: const Color(0xFFFF4D4D),
                count: '${controller.offlineCount}',
                label: 'Offline',
                showDot: true,
              ),
            ),
            _divider(),
            Expanded(
              child: _StatPill(
                icon: null,
                iconColor: const Color(0xFFFFA726),
                count: '${controller.maintenanceCount}',
                label: 'Maintenance',
                showDot: true,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _divider() => Container(
        height: 34,
        width: 1,
        color: Colors.white.withOpacity(0.08),
      );

  // ---------------- "Device List (32)" + Register button ----------------
  Widget _buildListHeaderRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Obx(
          () => Text(
            'Device List (${controller.filteredDevices.length})',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        GestureDetector(
          onTap: controller.onRegisterNewDevice,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.add_circle_outline, color: Colors.white, size: 15),
                SizedBox(width: 6),
                Text(
                  'Register New Device',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Device list ----------------
  Widget _buildDeviceList() {
    return Obx(() {
      final devices = controller.pagedDevices;
      if (devices.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 30),
          child: Center(
            child: Text(
              'No devices found',
              style: TextStyle(color: Colors.white38, fontSize: 13),
            ),
          ),
        );
      }
      return Column(
        children: devices
            .map(
              (device) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _DeviceCard(
                  device: device,
                  onTap: () => controller.onDeviceTap(device),
                ),
              ),
            )
            .toList(),
      );
    });
  }

  // ---------------- Pagination footer ----------------
  Widget _buildPaginationFooter() {
    return Obx(
      () => Column(
        children: [
          Text(
            controller.filteredDevices.isEmpty
                ? 'No devices found'
                : 'Showing ${controller.showingFrom} to ${controller.showingTo} of ${controller.filteredDevices.length} devices',
            style: const TextStyle(color: Colors.white38, fontSize: 11.5),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _PageNavButton(
                label: 'Previous',
                icon: Icons.chevron_left,
                iconLeading: true,
                enabled: controller.currentPage.value > 1,
                onTap: controller.previousPage,
              ),
              const SizedBox(width: 8),
              ..._buildPageNumbers(),
              const SizedBox(width: 8),
              _PageNavButton(
                label: 'Next',
                icon: Icons.chevron_right,
                iconLeading: false,
                enabled: controller.currentPage.value < controller.totalPages,
                onTap: controller.nextPage,
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _buildPageNumbers() {
    final total = controller.totalPages;
    final current = controller.currentPage.value;
    // Show up to 5 page numbers
    final pages = <int>[];
    for (int i = 1; i <= total; i++) {
      pages.add(i);
    }
    final visible = pages.take(5).toList();

    return visible
        .map(
          (page) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 3),
            child: GestureDetector(
              onTap: () => controller.goToPage(page),
              child: Container(
                width: 30,
                height: 30,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: page == current
                      ? const LinearGradient(colors: [kIndigo, kPurple])
                      : null,
                  color: page == current ? null : kCardBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: page == current
                        ? Colors.transparent
                        : Colors.white.withOpacity(0.08),
                  ),
                ),
                child: Text(
                  '$page',
                  style: TextStyle(
                    color: page == current ? Colors.white : Colors.white54,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        )
        .toList();
  }
}

// =====================================================================
// Stat pill (used inside the stats bar)
// =====================================================================
class _StatPill extends StatelessWidget {
  final IconData? icon;
  final String? svgPath;
  final Color iconColor;
  final String count;
  final String label;
  final bool showDot;

  const _StatPill({
    this.icon,
    this.svgPath,
    required this.iconColor,
    required this.count,
    required this.label,
    this.showDot = false,
  });

  @override
  Widget build(BuildContext context) {
    final bool hasSvg = svgPath != null && svgPath!.isNotEmpty;
    final bool hasIcon = icon != null;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // SVG Image
            if (hasSvg) ...[
              SvgPicture.asset(
                svgPath!,
                width: 16,
                height: 16,
              ),
              const SizedBox(width: 4),
            ]

            // Normal Icon
            else if (hasIcon) ...[
              Icon(
                icon,
                color: iconColor,
                size: 16,
              ),
              const SizedBox(width: 4),
            ]

            // Dot
            else if (showDot) ...[
                Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: iconColor,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
              ],

            Text(
              count,
              style: TextStyle(
                color: (hasSvg || hasIcon)
                    ? Colors.white
                    : iconColor,
                fontSize: 15,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        const SizedBox(height: 3),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white38,
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}

// =====================================================================
// Device card
// =====================================================================
class _DeviceCard extends StatelessWidget {
  final DisplayDevice device;
  final VoidCallback onTap;

  const _DeviceCard({required this.device, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: DisplayDevicesView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: device.status.color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: SvgPicture.asset(
                'assets/icons/tv.svg',
                width: 18,
                height: 18,
                // Agar device status color apply karna ho to:
                // colorFilter: ColorFilter.mode(
                //   device.status.color,
                //   BlendMode.srcIn,
                // ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    device.id,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    device.vehicleNumber,
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          color: Colors.white38, size: 11),
                      const SizedBox(width: 2),
                      Text(
                        device.location,
                        style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: device.status.color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      device.status.label,
                      style: TextStyle(
                        color: device.status.color,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  'Last Seen: ${device.lastSeen}',
                  style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                ),
              ],
            ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Pagination nav button (Previous / Next)
// =====================================================================
class _PageNavButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool iconLeading;
  final bool enabled;
  final VoidCallback onTap;

  const _PageNavButton({
    required this.label,
    required this.icon,
    required this.iconLeading,
    required this.enabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final children = [
      if (iconLeading) Icon(icon, size: 15, color: enabled ? Colors.white70 : Colors.white24),
      Text(
        label,
        style: TextStyle(
          color: enabled ? Colors.white70 : Colors.white24,
          fontSize: 11.5,
          fontWeight: FontWeight.w600,
        ),
      ),
      if (!iconLeading) Icon(icon, size: 15, color: enabled ? Colors.white70 : Colors.white24),
    ];

    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: DisplayDevicesView.kCardBg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: children),
      ),
    );
  }
}
