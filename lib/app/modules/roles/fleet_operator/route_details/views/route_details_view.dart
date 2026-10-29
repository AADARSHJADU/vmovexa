import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../data/models/fleet_models.dart';
import 'package:vmovexa/app/widgets/route_map_viewer_widget.dart';
import '../controllers/route_details_controller.dart';

class RouteDetailsView extends GetView<RouteDetailsController> {
  const RouteDetailsView({super.key});

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
        title: Obx(() {
          final r = controller.route.value;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                r != null ? r.name : 'Route Details',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                r != null ? r.displayCode : 'Corridor dossier & schedules',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
              ),
            ],
          );
        }),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: Colors.amberAccent, size: 20),
            onPressed: controller.goToEdit,
            tooltip: 'Edit Route',
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
            onPressed: controller.confirmDelete,
            tooltip: 'Delete Route',
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          );
        }

        final r = controller.route.value;
        if (r == null) {
          return const Center(
            child: Text(
              'Route details not found',
              style: TextStyle(color: Colors.white70),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => controller.loadData(),
          color: const Color(0xFF6366F1),
          backgroundColor: const Color(0xFF1E293B),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Hero Dossier Banner
                _buildHeroBanner(r),
                const SizedBox(height: 14),

                // Live Corridor Route Map (Google Static Map & Polyline)
                _buildRouteCorridorMap(r),
                const SizedBox(height: 14),

                // 2. Pending Approval Action Bar (if route is pending)
                if (r.isPending) ...[
                  _buildPendingApprovalBanner(),
                  const SizedBox(height: 14),
                ],

                // 3. 4-Card KPI Strip
                _buildMetricsStrip(r),
                const SizedBox(height: 16),

                // 4. Tab Switcher (Stops Sequence vs Assigned Vehicles)
                _buildTabSwitcher(),
                const SizedBox(height: 14),

                // 5. Active Tab Content
                Obx(() {
                  return controller.activeTab.value == 0
                      ? _buildStopsSequenceTab(r)
                      : _buildVehicleDeploymentsTab();
                }),
                const SizedBox(height: 30),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildRouteCorridorMap(RouteItemModel r) {
    final List<Map<String, dynamic>> stopsList = [];
    for (final s in r.stops) {
      if (s.latitude != null && s.longitude != null) {
        stopsList.add({
          'latitude': s.latitude,
          'longitude': s.longitude,
          'name': s.name,
        });
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: const [
            Icon(Icons.map_rounded, color: Color(0xFF6366F1), size: 16),
            SizedBox(width: 8),
            Text(
              'LIVE DRIVING CORRIDOR MAP',
              style: TextStyle(
                color: Color(0xFF818CF8),
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        RouteMapViewerWidget(
          startLat: r.startLatitude,
          startLng: r.startLongitude,
          endLat: r.endLatitude,
          endLng: r.endLongitude,
          stops: stopsList,
          polyline: r.polyline,
          distanceKm: r.totalDistanceKm > 0 ? r.totalDistanceKm : null,
          durationMinutes: r.totalDurationMin > 0 ? r.totalDurationMin : null,
        ),
      ],
    );
  }

  Widget _buildHeroBanner(RouteItemModel r) {
    Color statusColor;
    Color statusBg;
    String statusLabel;

    if (r.isActive) {
      statusColor = const Color(0xFF10B981);
      statusBg = const Color(0xFF10B981).withValues(alpha: 0.15);
      statusLabel = 'Active Corridor';
    } else if (r.isPending) {
      statusColor = const Color(0xFFF59E0B);
      statusBg = const Color(0xFFF59E0B).withValues(alpha: 0.15);
      statusLabel = 'Pending Review';
    } else {
      statusColor = const Color(0xFFEF4444);
      statusBg = const Color(0xFFEF4444).withValues(alpha: 0.15);
      statusLabel = 'Rejected';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Code Badge + Status Badge
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                ),
                child: Text(
                  r.displayCode,
                  style: const TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      statusLabel,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Route Name
          Text(
            r.name,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 14),

          // Corridor Visual Flow: Origin ➔ Destination
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.only(top: 3),
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ORIGIN TERMINAL',
                            style: TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                          ),
                          Text(
                            r.originDisplay,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          if (r.startFullAddress != null && r.startFullAddress!.isNotEmpty)
                            Text(
                              r.startFullAddress!,
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 4.5),
                  child: Row(
                    children: [
                      Container(
                        width: 1,
                        height: 20,
                        color: const Color(0xFF475569),
                      ),
                    ],
                  ),
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.only(top: 3),
                      decoration: const BoxDecoration(
                        color: Color(0xFFEF4444),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'DESTINATION TERMINAL',
                            style: TextStyle(color: Color(0xFFEF4444), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                          ),
                          Text(
                            r.destinationDisplay,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          if (r.endFullAddress != null && r.endFullAddress!.isNotEmpty)
                            Text(
                              r.endFullAddress!,
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingApprovalBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.hourglass_top_rounded, color: Color(0xFFF59E0B), size: 18),
              SizedBox(width: 8),
              Text(
                'Approval Review Pending',
                style: TextStyle(color: Color(0xFFF59E0B), fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'This route is submitted for tenant admin verification before dispatching live revenue trips.',
            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: controller.approveRoute,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
                  label: const Text('Approve Route', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: controller.openRejectDialog,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFF43F5E),
                    side: const BorderSide(color: Color(0xFFF43F5E)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.cancel_outlined, size: 16),
                  label: const Text('Reject Route', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsStrip(RouteItemModel r) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 2.3,
      children: [
        _buildMetricTile(
          'Total Distance',
          r.totalDistanceKm > 0 ? '${r.totalDistanceKm} km' : '— km',
          Icons.straighten_rounded,
          const Color(0xFF38BDF8),
        ),
        _buildMetricTile(
          'Est. Duration',
          r.totalDurationMin > 0 ? '~${r.totalDurationMin} min' : '— min',
          Icons.timer_outlined,
          const Color(0xFFA78BFA),
        ),
        _buildMetricTile(
          'Waypoint Stops',
          '${r.stopsCount} stops',
          Icons.location_on_outlined,
          const Color(0xFF34D399),
        ),
        _buildMetricTile(
          'Scheduled Buses',
          '${controller.routeVehicles.length} buses',
          Icons.directions_bus_rounded,
          const Color(0xFFFBBF24),
        ),
      ],
    );
  }

  Widget _buildMetricTile(String label, String value, IconData icon, Color color) {
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
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 18),
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
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10,
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

  Widget _buildTabSwitcher() {
    return Obx(() {
      final tab = controller.activeTab.value;
      return Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () => controller.activeTab.value = 0,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    gradient: tab == 0 ? AppTheme.primaryGradient : null,
                    color: tab == 0 ? null : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: tab == 0
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientPink.withValues(alpha: 0.3),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.pin_drop_outlined, size: 14, color: tab == 0 ? Colors.white : AppColors.textSecondary),
                        const SizedBox(width: 6),
                        Text(
                          'Waypoints & Stops',
                          style: TextStyle(
                            color: tab == 0 ? Colors.white : AppColors.textSecondary,
                            fontSize: 12,
                            fontWeight: tab == 0 ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: InkWell(
                onTap: () => controller.activeTab.value = 1,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    gradient: tab == 1 ? AppTheme.primaryGradient : null,
                    color: tab == 1 ? null : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: tab == 1
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientPink.withValues(alpha: 0.3),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.directions_bus_rounded, size: 14, color: tab == 1 ? Colors.white : AppColors.textSecondary),
                        const SizedBox(width: 6),
                        Text(
                          'Fleet Deployments (${controller.routeVehicles.length})',
                          style: TextStyle(
                            color: tab == 1 ? Colors.white : AppColors.textSecondary,
                            fontSize: 12,
                            fontWeight: tab == 1 ? FontWeight.bold : FontWeight.w500,
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
    });
  }

  Widget _buildStopsSequenceTab(RouteItemModel r) {
    if (r.stops.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Column(
          children: [
            const Icon(Icons.alt_route_rounded, color: AppColors.textMuted, size: 36),
            const SizedBox(height: 10),
            const Text(
              'No Waypoint Stops Configured',
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Only Origin and Destination endpoints are currently set for this corridor.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            CustomButton(
              text: 'Add Waypoint Stops',
              prefixIcon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
              onTap: controller.goToEdit,
              width: 200,
              height: 42,
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Corridor Stops Sequence',
              style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            Text(
              '${r.stops.length} scheduled stops',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Timeline list
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: r.stops.length,
          separatorBuilder: (_, _) => const SizedBox(height: 8),
          itemBuilder: (context, idx) {
            final stop = r.stops[idx];
            return _buildTimelineStopCard(stop, idx, r.stops.length);
          },
        ),
      ],
    );
  }

  Widget _buildTimelineStopCard(RouteStopModel stop, int idx, int total) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step sequence circle
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withValues(alpha: 0.18),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF818CF8)),
            ),
            child: Center(
              child: Text(
                '${idx + 1}',
                style: const TextStyle(
                  color: Color(0xFF818CF8),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  stop.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (stop.address.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    stop.address,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                  ),
                ],
                const SizedBox(height: 8),

                // Stop Chips: Dist, ETA, Geofence
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    if (stop.distanceKm > 0)
                      _buildMiniBadge(Icons.straighten_rounded, '${stop.distanceKm} km', const Color(0xFF38BDF8)),
                    if (stop.eta.isNotEmpty)
                      _buildMiniBadge(Icons.timer_outlined, stop.eta, const Color(0xFFA78BFA)),
                    _buildMiniBadge(Icons.radar_rounded, '${stop.geofenceRadius}m geofence', const Color(0xFF10B981)),
                  ],
                ),

                if (stop.haltReason.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.info_outline_rounded, color: Color(0xFFFBBF24), size: 12),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          stop.haltReason,
                          style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10, fontStyle: FontStyle.italic),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniBadge(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 10),
          const SizedBox(width: 3),
          Text(
            text,
            style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleDeploymentsTab() {
    return Obx(() {
      final list = controller.routeVehicles;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Deploy Vehicle button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Active Fleet on Route',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '${list.length} buses running schedule',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                  ),
                ],
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                      blurRadius: 12,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: controller.openAssignVehicleModal,
                    borderRadius: BorderRadius.circular(10),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add_rounded, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text(
                            'Deploy Bus',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
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
          const SizedBox(height: 12),

          if (list.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.directions_bus_outlined, color: AppColors.textMuted, size: 36),
                  const SizedBox(height: 10),
                  const Text(
                    'No Buses Deployed on this Corridor',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Deploy a vehicle from your registered fleet onto this daily transit schedule.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 14),
                  Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                          blurRadius: 12,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: controller.openAssignVehicleModal,
                        borderRadius: BorderRadius.circular(10),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.add_rounded, color: Colors.white, size: 16),
                              SizedBox(width: 6),
                              Text(
                                'Deploy First Bus',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
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
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, idx) {
                final assign = list[idx];
                return _buildAssignmentCard(assign);
              },
            ),
        ],
      );
    });
  }

  Widget _buildAssignmentCard(RouteAssignmentModel assign) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFF2563EB).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF60A5FA), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      assign.vehicleRegNo,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFA855F7).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFA855F7).withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        assign.shift,
                        style: const TextStyle(
                          color: Color(0xFFC084FC),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                if (assign.vehicleModel.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    assign.vehicleModel,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                  ),
                ],
                if (assign.notes.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Notes: ${assign.notes}',
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontStyle: FontStyle.italic),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.link_off_rounded, color: Color(0xFFF43F5E), size: 20),
            onPressed: () => controller.removeAssignment(assign),
            tooltip: 'Remove from schedule',
          ),
        ],
      ),
    );
  }
}
