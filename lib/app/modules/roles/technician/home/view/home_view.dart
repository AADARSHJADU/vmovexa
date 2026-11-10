import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../controller/home_controller.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0C14),
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.todaysWorkOrders.isEmpty && controller.totalDevicesCount.value == 0) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF6366F1)),
            );
          }

          return RefreshIndicator(
            color: const Color(0xFF6366F1),
            backgroundColor: const Color(0xFF1E293B),
            onRefresh: controller.onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                const SizedBox(height: 10),
                _buildTopBar(context),
                const SizedBox(height: 14),
                _buildProfileBanner(),
                const SizedBox(height: 18),
                _buildKpiMetricsGrid(),
                const SizedBox(height: 22),
                _buildSectionHeader('quick_action_dispatch_caps'.tr),
                const SizedBox(height: 10),
                _buildQuickActionsGrid(),
                const SizedBox(height: 22),
                _buildTodaysWorkOrdersHeader(),
                const SizedBox(height: 10),
                _buildTodaysWorkOrdersList(context),
                const SizedBox(height: 30),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- Top App Bar (Hamburger, Logo, Notification) ----------------
  Widget _buildTopBar(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        IconButton(
          onPressed: controller.openDrawer,
          icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/app_logo/newLogo.png', width: 140, height: 38),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
              ),
              child: const Text(
                'TECH',
                style: TextStyle(
                  color: Color(0xFF818CF8),
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
        IconButton(
          onPressed: controller.goToNotifications,
          icon: const Icon(Icons.notifications_none_rounded, color: Colors.white70, size: 24),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
      ],
    );
  }

  // ---------------- Technician Profile Banner (matching admin panel) ----------------
  Widget _buildProfileBanner() {
    return Obx(() {
      final name = controller.technicianName.value;
      final role = controller.technicianRole.value;
      final depot = controller.depotName.value;
      final badge = controller.badgeId.value;
      final avatar = controller.avatarUrl.value;
      final synced = controller.isSynced.value;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF1E1B4B).withValues(alpha: 0.35),
              const Color(0xFF111827),
            ],
          ),
        ),
        child: Column(
          children: [
            Row(
              children: [
                // Avatar
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: avatar.isEmpty ? AppColors.primaryGradient : null,
                    border: Border.all(color: const Color(0xFF6366F1), width: 1.8),
                    color: const Color(0xFF0F172A),
                  ),
                  child: ClipOval(
                    child: avatar.isNotEmpty
                        ? Image.network(
                            avatar,
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _buildAvatarInitial(name),
                          )
                        : _buildAvatarInitial(name),
                  ),
                ),
                const SizedBox(width: 14),

                // Name & Role
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: synced ? const Color(0xFF10B981) : Colors.amber,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  synced ? 'Online' : 'Offline',
                                  style: const TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        role,
                        style: const TextStyle(
                          color: Color(0xFF818CF8),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_city_rounded, color: AppColors.textMuted, size: 12),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              depot,
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            'ID: $badge',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildAvatarInitial(String name) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'T';
    return Center(
      child: Text(
        initial,
        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }

  // ---------------- 4 KPIs Grid (Online, Offline, Issues, Total) ----------------
  Widget _buildKpiMetricsGrid() {
    return Obx(() {
      final online = controller.onlineDevicesCount.value;
      final offline = controller.offlineDevicesCount.value;
      final issues = controller.issuesDevicesCount.value;
      final total = controller.totalDevicesCount.value;

      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.55,
        children: [
          _buildKpiCard(
            title: 'online_devices'.tr,
            count: '$online',
            subtitle: 'operational'.tr,
            color: const Color(0xFF10B981),
            icon: Icons.check_circle_rounded,
          ),
          _buildKpiCard(
            title: 'offline_devices'.tr,
            count: '$offline',
            subtitle: 'needs_attention'.tr,
            color: const Color(0xFFEF4444),
            icon: Icons.error_rounded,
          ),
          _buildKpiCard(
            title: 'devices_with_issues'.tr,
            count: '$issues',
            subtitle: 'action_required'.tr,
            color: const Color(0xFFF59E0B),
            icon: Icons.warning_rounded,
          ),
          _buildKpiCard(
            title: 'total_fleet_units'.tr,
            count: '$total',
            subtitle: 'registered_devices'.tr,
            color: const Color(0xFF6366F1),
            icon: Icons.developer_board_rounded,
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String count,
    required String subtitle,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Icon(icon, color: color, size: 18),
            ],
          ),
          Text(
            count,
            style: TextStyle(
              color: color,
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            subtitle,
            style: TextStyle(
              color: color.withValues(alpha: 0.8),
              fontSize: 9.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Quick Action Grid ----------------
  Widget _buildQuickActionsGrid() {
    return Obx(() {
      final assignedTasks = controller.todaysWorkOrders.length;
      final totalDevices = controller.totalDevicesCount.value;

      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.45,
        children: [
          _buildQuickActionTile(
            title: 'field_work_orders'.tr,
            subtitle: 'repair_dispatch_queue'.tr,
            badge: '$assignedTasks ${'assigned'.tr}',
            icon: 'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
            iconColor: const Color(0xFF38BDF8),
            onTap: controller.onViewAllTasks,
          ),
          _buildQuickActionTile(
            title: 'edge_devices'.tr,
            subtitle: 'transit_screen_units'.tr,
            badge: '$totalDevices ${'total'.tr}',
            icon: 'assets/icons/tv.svg',
            iconColor: const Color(0xFF818CF8),
            onTap: controller.goToEdgeDevicesTab,
          ),
          _buildQuickActionTile(
            title: 'hardware_config'.tr,
            subtitle: 'screen_network_power'.tr,
            badge: 'configure_btn'.tr,
            icon: 'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
            iconColor: const Color(0xFFF59E0B),
            onTap: controller.goToHardwareConfigTab,
          ),
          _buildQuickActionTile(
            title: 'gps_installation'.tr,
            subtitle: 'vehicle_pairing_mount'.tr,
            badge: 'assign'.tr,
            icon: 'assets/icons/location.svg',
            iconColor: const Color(0xFF10B981),
            onTap: controller.goToGpsInstallation,
          ),
          _buildQuickActionTile(
            title: 'diagnostics_self_test'.tr,
            subtitle: 'hardware_self_test'.tr,
            badge: 'run_test_btn'.tr,
            icon: 'assets/icons/doctor.svg',
            iconColor: const Color(0xFFEC4899),
            onTap: controller.goToDiagnostics,
          ),
          _buildQuickActionTile(
            title: 'connectivity_matrix'.tr,
            subtitle: 'ping_mqtt_heartbeat'.tr,
            badge: 'test_ping_btn'.tr,
            icon: 'assets/icons/hotspot.svg',
            iconColor: const Color(0xFFA855F7),
            onTap: controller.goToConnectivity,
          ),
        ],
      );
    });
  }

  Widget _buildQuickActionTile({
    required String title,
    required String subtitle,
    required String badge,
    required String icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: SvgPicture.asset(
                    icon,
                    width: 16,
                    height: 16,
                    colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    badge,
                    style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Today's Work Orders Section Header ----------------
  Widget _buildTodaysWorkOrdersHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildSectionHeader("todays_field_work_orders_caps".tr),
        InkWell(
          onTap: controller.onViewAllTasks,
          child: Row(
            children: [
              Text(
                'view_all'.tr,
                style: const TextStyle(
                  color: Color(0xFF818CF8),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Color(0xFF818CF8), size: 16),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Today's Work Orders List ----------------
  Widget _buildTodaysWorkOrdersList(BuildContext context) {
    return Obx(() {
      final orders = controller.todaysWorkOrders;

      if (orders.isEmpty) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF1F2937)),
          ),
          child: Center(
            child: Column(
              children: [
                const Icon(Icons.assignment_turned_in_outlined, color: AppColors.textMuted, size: 36),
                const SizedBox(height: 8),
                Text(
                  'no_assigned_tasks_today'.tr,
                  style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  'dispatch_queue_clear'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: orders.take(5).length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final order = orders[index];
          return _WorkOrderSummaryTile(
            order: order,
            onTap: () => controller.onTaskTap(context, order),
          );
        },
      );
    });
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: AppColors.textMuted,
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.1,
      ),
    );
  }
}

class _WorkOrderSummaryTile extends StatelessWidget {
  final WorkOrderModel order;
  final VoidCallback onTap;

  const _WorkOrderSummaryTile({required this.order, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF1F2937), width: 1.1),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.build_rounded, color: Color(0xFF818CF8), size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        order.code,
                        style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 6),
                      _buildUrgencyPill(order.urgency),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    order.issueCategory,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${order.busNumber} • ${order.depotName}',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            _buildStatusBadge(order.status),
          ],
        ),
      ),
    );
  }

  Widget _buildUrgencyPill(String urgency) {
    Color color;
    switch (urgency.toLowerCase()) {
      case 'critical':
        color = const Color(0xFFEF4444);
        break;
      case 'high':
        color = const Color(0xFFF59E0B);
        break;
      default:
        color = const Color(0xFF38BDF8);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        urgency.toUpperCase(),
        style: TextStyle(color: color, fontSize: 8.5, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label = status;
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
        color = const Color(0xFF10B981);
        label = 'Resolved';
        break;
      case 'on_site':
      case 'in_progress':
        color = const Color(0xFFF59E0B);
        label = 'On-Site';
        break;
      default:
        color = const Color(0xFF6366F1);
        label = 'Dispatched';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 9.5, fontWeight: FontWeight.bold),
      ),
    );
  }
}
