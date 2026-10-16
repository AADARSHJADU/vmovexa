import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../data/models/fleet_models.dart';
import '../controllers/routes_list_controller.dart';

class RoutesListView extends GetView<RoutesListController> {
  const RoutesListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Get.back(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Transit Routes',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'Corridors, Waypoints & Fleet Deployments',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
            onPressed: () => controller.fetchRoutes(),
            tooltip: 'Refresh Routes',
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => controller.fetchRoutes(),
        color: const Color(0xFF6366F1),
        backgroundColor: const Color(0xFF1E293B),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Action Row
              _buildTopBar(context),
              const SizedBox(height: 16),

              // KPI 4-Card Strip
              _buildStatsStrip(),
              const SizedBox(height: 16),

              // Status Filter Tabs
              _buildFilterTabs(),
              const SizedBox(height: 12),

              // Search Bar
              _buildSearchBar(),
              const SizedBox(height: 16),

              // Routes List
              _buildRoutesList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Route Network',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Manage corridors & waypoint schedules',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: controller.goToAddRoute,
                borderRadius: BorderRadius.circular(12),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add_rounded, color: Colors.white, size: 18),
                      SizedBox(width: 6),
                      Text(
                        'Add Route',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
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
    );
  }

  Widget _buildStatsStrip() {
    return Obx(() {
      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 2.2,
        children: [
          _buildStatCard(
            'Total Routes',
            controller.totalRoutesCount.toString(),
            'Corridors registered',
            Icons.alt_route_rounded,
            const Color(0xFF3B82F6),
            const Color(0xFF3B82F6).withValues(alpha: 0.15),
          ),
          _buildStatCard(
            'Active Lines',
            controller.activeCorridorsCount.toString(),
            'Operational corridors',
            Icons.check_circle_outline_rounded,
            const Color(0xFF10B981),
            const Color(0xFF10B981).withValues(alpha: 0.15),
          ),
          _buildStatCard(
            'Pending Review',
            controller.pendingReviewCount.toString(),
            'Awaiting approval',
            Icons.hourglass_top_rounded,
            const Color(0xFFF59E0B),
            const Color(0xFFF59E0B).withValues(alpha: 0.15),
          ),
          _buildStatCard(
            'Waypoints',
            controller.totalWaypointsCount.toString(),
            'Total scheduled stops',
            Icons.pin_drop_outlined,
            const Color(0xFF818CF8),
            const Color(0xFF818CF8).withValues(alpha: 0.15),
          ),
        ],
      );
    });
  }

  Widget _buildStatCard(
    String label,
    String value,
    String subtitle,
    IconData icon,
    Color color,
    Color bg,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    color: color,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    final tabs = [
      {'key': 'ALL', 'label': 'All Routes'},
      {'key': 'active', 'label': 'Active'},
      {'key': 'pending_approval', 'label': 'Pending'},
      {'key': 'rejected', 'label': 'Rejected'},
    ];

    return Obx(() {
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: tabs.map((t) {
            final isSelected = controller.statusFilter.value == t['key'];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: InkWell(
                onTap: () => controller.setStatusFilter(t['key']!),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF2563EB) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF334155),
                    ),
                  ),
                  child: Text(
                    t['label']!,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: TextField(
        controller: controller.searchController,
        onChanged: controller.onSearchChanged,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          hintText: 'Search by corridor, code, stops...',
          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
          suffixIcon: Obx(() {
            return controller.searchQuery.value.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear_rounded, color: AppColors.textMuted, size: 18),
                    onPressed: () {
                      controller.searchController.clear();
                      controller.onSearchChanged('');
                    },
                  )
                : const SizedBox.shrink();
          }),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
        ),
      ),
    );
  }

  Widget _buildRoutesList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          ),
        );
      }

      final list = controller.filteredRoutes;

      if (list.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Column(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: const Color(0xFF334155).withValues(alpha: 0.5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.alt_route_rounded, color: AppColors.textMuted, size: 30),
              ),
              const SizedBox(height: 12),
              const Text(
                'No Transit Routes Found',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                controller.searchQuery.value.isNotEmpty
                    ? 'No corridors match "${controller.searchQuery.value}".'
                    : 'Create your first transit corridor with multiple stops and GPS coordinates.',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: controller.goToAddRoute,
                    borderRadius: BorderRadius.circular(12),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 18, vertical: 11),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add_rounded, color: Colors.white, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Create Transit Route',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
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
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final route = list[index];
          return _buildRouteCard(route);
        },
      );
    });
  }

  Widget _buildRouteCard(RouteItemModel route) {
    Color statusColor;
    Color statusBg;
    String statusLabel;

    if (route.isActive) {
      statusColor = const Color(0xFF10B981);
      statusBg = const Color(0xFF10B981).withValues(alpha: 0.15);
      statusLabel = 'Active';
    } else if (route.isPending) {
      statusColor = const Color(0xFFF59E0B);
      statusBg = const Color(0xFFF59E0B).withValues(alpha: 0.15);
      statusLabel = 'Pending Approval';
    } else {
      statusColor = const Color(0xFFEF4444);
      statusBg = const Color(0xFFEF4444).withValues(alpha: 0.15);
      statusLabel = 'Rejected';
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => controller.goToRouteDetails(route),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header: Code Badge + Route Name + Status + Popup Menu
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        route.displayCode,
                        style: const TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        route.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert_rounded, color: AppColors.textMuted, size: 20),
                      color: const Color(0xFF1E293B),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Color(0xFF334155)),
                      ),
                      onSelected: (val) {
                        switch (val) {
                          case 'view':
                            controller.goToRouteDetails(route);
                            break;
                          case 'edit':
                            controller.goToEditRoute(route);
                            break;
                          case 'approve':
                            controller.approveRoute(route);
                            break;
                          case 'reject':
                            controller.openRejectDialog(route);
                            break;
                          case 'delete':
                            controller.confirmDeleteRoute(route);
                            break;
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'view',
                          child: Row(
                            children: [
                              Icon(Icons.visibility_outlined, color: Colors.blueAccent, size: 16),
                              SizedBox(width: 8),
                              Text('View Details & Stops', style: TextStyle(color: Colors.white, fontSize: 12)),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit_outlined, color: Colors.amberAccent, size: 16),
                              SizedBox(width: 8),
                              Text('Edit Route', style: TextStyle(color: Colors.white, fontSize: 12)),
                            ],
                          ),
                        ),
                        if (route.isPending) ...[
                          const PopupMenuItem(
                            value: 'approve',
                            child: Row(
                              children: [
                                Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 16),
                                SizedBox(width: 8),
                                Text('Approve Route', style: TextStyle(color: Color(0xFF10B981), fontSize: 12)),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'reject',
                            child: Row(
                              children: [
                                Icon(Icons.cancel_outlined, color: Color(0xFFF43F5E), size: 16),
                                SizedBox(width: 8),
                                Text('Reject Route', style: TextStyle(color: Color(0xFFF43F5E), fontSize: 12)),
                              ],
                            ),
                          ),
                        ],
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 16),
                              SizedBox(width: 8),
                              Text('Delete Route', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Corridor Graphic: Origin ➔ Destination
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155).withValues(alpha: 0.5)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              route.originDisplay,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 3.5),
                        child: Row(
                          children: [
                            Container(
                              width: 1,
                              height: 14,
                              color: const Color(0xFF475569),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFFEF4444),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              route.destinationDisplay,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Metrics Badges: Distance • Duration • Stops • Assigned Buses
             Column(
               crossAxisAlignment: CrossAxisAlignment.start,
               children: [
                 Row(
                   children: [
                     _buildMetricChip(
                       icon: Icons.straighten_rounded,
                       text: route.totalDistanceKm > 0 ? '${route.totalDistanceKm} km' : '— km',
                       color: const Color(0xFF38BDF8),
                     ),
                     const SizedBox(width: 8),
                     _buildMetricChip(
                       icon: Icons.timer_outlined,
                       text: route.totalDurationMin > 0 ? '~${route.totalDurationMin} min' : '— min',
                       color: const Color(0xFFA78BFA),
                     ),
                     const SizedBox(width: 8),
                     _buildMetricChip(
                       icon: Icons.location_on_outlined,
                       text: '${route.stopsCount} stops',
                       color: const Color(0xFF34D399),
                     ),
                   ],
                 ),
                 const SizedBox(height: 8),
                 Row(
                   children: [


                     const SizedBox(width: 8),
                     _buildMetricChip(
                       icon: Icons.directions_bus_rounded,
                       text: '${route.assignedVehiclesCount} buses',
                       color: const Color(0xFFFBBF24),
                     ),

                   ],
                 ),
               ],
             )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricChip({
    required IconData icon,
    required String text,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 12),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
