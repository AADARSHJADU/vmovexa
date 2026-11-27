import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/display_devices_controller.dart';

class DisplayDevicesView extends GetView<DisplayDevicesController> {
  const DisplayDevicesView({super.key});

  @override
  Widget build(BuildContext context) {

    // Ensure controller is registered before accessing GetView.controller
    if (!Get.isRegistered<DisplayDevicesController>()) {
      Get.put<DisplayDevicesController>(
        DisplayDevicesController(),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0C14),
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value &&
              controller.allDevices.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF6366F1),
              ),
            );
          }

          return RefreshIndicator(
            color: const Color(0xFF6366F1),
            backgroundColor: const Color(0xFF1E293B),
            onRefresh: controller.onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                const SizedBox(height: 12),
                _buildHeader(context),
                const SizedBox(height: 14),
                _buildStatsGrid(),
                const SizedBox(height: 16),
                _buildSearchBar(),
                const SizedBox(height: 12),
                _buildFilterTabs(),
                const SizedBox(height: 14),
                _buildSectionTitle(context),
                const SizedBox(height: 10),
                _buildDeviceList(context),
                const SizedBox(height: 16),
                if (controller.filteredDevices.isNotEmpty)
                  _buildPaginationFooter(),
                const SizedBox(height: 24),
              ],
            ),
          );
        }),
      ),
    );
  }


  // ---------------- Header with Edge Setup & Refresh ----------------
  Widget _buildHeader(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Left Side: Title + Description
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      'edge_devices'.tr,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: const Color(0xFF6366F1).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Obx(
                            () => Text(
                          '${controller.allDevices.length} UNITS',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 3),
              const Text(
                'RK3588 edge player boxes, display screens & IoT telematics',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(width: 6),

        // Edge Setup Button
        InkWell(
          onTap: controller.goToEdgeSetup,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 7,
            ),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.gradientPink.withValues(alpha: 0.25),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.terminal_rounded,
                  color: Colors.white,
                  size: 14,
                ),
                const SizedBox(width: 4),
                Text(
                  'edge_setup'.tr,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(width: 4),

        // Refresh Button
        IconButton(
          onPressed: controller.onRefresh,
          icon: const Icon(
            Icons.refresh_rounded,
            color: Colors.white70,
            size: 18,
          ),
          constraints: const BoxConstraints(
            minWidth: 36,
            minHeight: 36,
          ),
          padding: const EdgeInsets.all(8),
          style: IconButton.styleFrom(
            backgroundColor: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- 4 KPI Stat Cards (Matching Admin Panel) ----------------
  Widget _buildStatsGrid() {
    return Obx(() {
      return GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 2.1,
        children: [
          _buildStatCard(
            title: 'total_units_caps'.tr,
            count: controller.totalDevices.toString(),
            color: const Color(0xFF6366F1),
            icon: Icons.memory_rounded,
          ),
          _buildStatCard(
            title: 'online_units_caps'.tr,
            count: controller.onlineCount.toString(),
            color: const Color(0xFF10B981),
            icon: Icons.check_circle_rounded,
          ),
          _buildStatCard(
            title: 'active_units_caps'.tr,
            count: controller.activeCount.toString(),
            color: const Color(0xFF38BDF8),
            icon: Icons.power_rounded,
          ),
          _buildStatCard(
            title: 'offline_units_caps'.tr,
            count: controller.offlineCount.toString(),
            color: const Color(0xFFEF4444),
            icon: Icons.signal_cellular_connected_no_internet_4_bar_rounded,
          ),
        ],
      );
    });
  }

  Widget _buildStatCard({
    required String title,
    required String count,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 2),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    count,
                    style: TextStyle(
                      color: color,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
        ],
      ),
    );
  }

  // ---------------- Search Bar ----------------
  Widget _buildSearchBar() {
    return TextField(
      onChanged: controller.onSearchChanged,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        hintText: 'search_devices_hint'.tr,
        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
        filled: true,
        fillColor: const Color(0xFF1E293B),
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  // ---------------- Filter Tabs ('All', 'Online', 'Offline', 'Active', 'Inactive') ----------------
  Widget _buildFilterTabs() {
    return Obx(() {
      final current = controller.activeTab.value;
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildTabChip('All', controller.totalDevices, current == 'All', const Color(0xFF818CF8)),
            const SizedBox(width: 8),
            _buildTabChip('Online', controller.onlineCount, current == 'Online', const Color(0xFF10B981)),
            const SizedBox(width: 8),
            _buildTabChip('Offline', controller.offlineCount, current == 'Offline', const Color(0xFFEF4444)),
            const SizedBox(width: 8),
            _buildTabChip('Active', controller.activeCount, current == 'Active', const Color(0xFF38BDF8)),
            const SizedBox(width: 8),
            _buildTabChip('Inactive', controller.inactiveCount, current == 'Inactive', Colors.white54),
          ],
        ),
      );
    });
  }

  Widget _buildTabChip(String label, int count, bool isSelected, Color color) {
    return GestureDetector(
      onTap: () => controller.setActiveTab(label),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          gradient: isSelected ? AppTheme.primaryGradient : null,
          color: isSelected ? null : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? Colors.transparent : const Color(0xFF334155),
            width: 1.2,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppTheme.gradientPink.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textMuted,
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(
                color: isSelected ? Colors.white.withValues(alpha: 0.25) : Colors.white12,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                count.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Section Title + Add Device Button ----------------
  Widget _buildSectionTitle(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Obx(
            () => Text(
              '${'deployed_devices_caps'.tr} (${controller.filteredDevices.length})',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: AppTheme.gradientPink.withValues(alpha: 0.25),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: ElevatedButton.icon(
            onPressed: controller.onRegisterNewDevice,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              elevation: 0,
            ),
            icon: const Icon(Icons.add_rounded, size: 16),
            label: Text(
              'add_edge_device'.tr,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Device List ----------------
  Widget _buildDeviceList(BuildContext context) {
    return Obx(() {
      final devices = controller.pagedDevices;
      if (devices.isEmpty) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 40),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            children: [
              Icon(Icons.devices_other_rounded, color: Colors.white.withValues(alpha: 0.2), size: 44),
              const SizedBox(height: 12),
              Text(
                'no_edge_devices_found'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'try_adjusting_search'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ],
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: devices.length,
        separatorBuilder: (ctx, idx) => const SizedBox(height: 12),
        itemBuilder: (ctx, idx) => _buildDeviceCard(ctx, devices[idx]),
      );
    });
  }

  // ---------------- Single Edge Device Card (Matching TechDevicesPage.jsx) ----------------
  Widget _buildDeviceCard(BuildContext context, EdgeDeviceModel device) {
    final isOnline = device.isOnline;
    final isActive = device.isActive;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Box ID, Status Badge, Active Toggle
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    device.boxId,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFF818CF8),
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Row(
                children: [
                  // Status badge (online/offline)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isOnline
                          ? const Color(0xFF10B981).withValues(alpha: 0.15)
                          : const Color(0xFFEF4444).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isOnline
                            ? const Color(0xFF10B981).withValues(alpha: 0.3)
                            : const Color(0xFFEF4444).withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 5,
                          height: 5,
                          decoration: BoxDecoration(
                            color: isOnline ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          device.status.toUpperCase(),
                          style: TextStyle(
                            color: isOnline ? const Color(0xFF34D399) : const Color(0xFFF87171),
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  // Active/Inactive Toggle Button
                  GestureDetector(
                    onTap: () => controller.toggleDeviceActive(device),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isActive
                            ? const Color(0xFF38BDF8).withValues(alpha: 0.15)
                            : Colors.white10,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isActive
                              ? const Color(0xFF38BDF8).withValues(alpha: 0.4)
                              : Colors.white24,
                        ),
                      ),
                      child: Text(
                        isActive ? 'Active' : 'Inactive',
                        style: TextStyle(
                          color: isActive ? const Color(0xFF38BDF8) : Colors.white54,
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Device Name & MAC
          Text(
            device.name.isNotEmpty ? device.name : device.boxId,
            style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            'MAC: ${device.mac.isNotEmpty ? device.mac : "—"}',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5, fontFamily: 'monospace'),
          ),

          const SizedBox(height: 10),

          // Details Matrix Panel
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                _buildInfoRow('assigned_bus'.tr, device.vehicleRegistration, Icons.directions_bus_rounded),
                const SizedBox(height: 6),
                _buildInfoRow('sim_network'.tr, device.simNetwork, Icons.signal_cellular_alt_rounded),
                const SizedBox(height: 6),
                _buildInfoRow('agent_version'.tr, device.agentVersion, Icons.code_rounded),
                const SizedBox(height: 6),
                _buildInfoRow('depot'.tr, device.depotName, Icons.location_on_outlined),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Action Buttons: Configure Hardware, Edit, Reboot, Delete
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => controller.configureHardware(device),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: const Color(0xFF818CF8),
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.settings_outlined, size: 14),
                  label: Text(
                    'configure_hardware'.tr,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Edit Button (Navigates to full-page Edit Device matching Admin Panel)
              IconButton(
                onPressed: () => controller.goToEditDevice(device),
                tooltip: 'edit_edge_device'.tr,
                icon: const Icon(Icons.edit_outlined, color: Color(0xFF818CF8), size: 18),
                constraints: const BoxConstraints(),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.all(8),
                ),
              ),
              const SizedBox(width: 8),

              // Reboot Button
              IconButton(
                onPressed: () => controller.rebootDevice(context, device),
                tooltip: 'reboot_edge_device'.tr,
                icon: const Icon(Icons.restart_alt_rounded, color: Color(0xFF38BDF8), size: 18),
                constraints: const BoxConstraints(),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.all(8),
                ),
              ),
              const SizedBox(width: 8),

              // Delete Button
              IconButton(
                onPressed: () => controller.deleteDevice(context, device),
                tooltip: 'delete_edge_device'.tr,
                icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                constraints: const BoxConstraints(),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.all(8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          flex: 1,
          child: Row(
            children: [
              Icon(icon, color: AppColors.textMuted, size: 13),
              const SizedBox(width: 5),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 1,
          child: Text(
            value.isNotEmpty ? value : '—',
            textAlign: TextAlign.end,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  // ---------------- Pagination Footer ----------------
  Widget _buildPaginationFooter() {
    return Obx(() {
      final current = controller.currentPage.value;
      final total = controller.totalPages;

      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              '${'showing_count'.tr} ${controller.showingFrom}–${controller.showingTo} ${'of_count'.tr} ${controller.filteredDevices.length}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
          ),
          const SizedBox(width: 8),
          Row(
            children: [
              IconButton(
                onPressed: current > 1 ? controller.previousPage : null,
                icon: const Icon(Icons.chevron_left_rounded, size: 18),
                color: Colors.white,
                disabledColor: Colors.white24,
                constraints: const BoxConstraints(),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.all(6),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '$current / $total',
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: current < total ? controller.nextPage : null,
                icon: const Icon(Icons.chevron_right_rounded, size: 18),
                color: Colors.white,
                disabledColor: Colors.white24,
                constraints: const BoxConstraints(),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.all(6),
                ),
              ),
            ],
          ),
        ],
      );
    });
  }
}
