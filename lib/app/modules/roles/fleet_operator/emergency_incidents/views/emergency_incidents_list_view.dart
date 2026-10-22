import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/incident_model.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/emergency_incidents_controller.dart';

class EmergencyIncidentsListView extends GetView<EmergencyIncidentsController> {
  const EmergencyIncidentsListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildTopAppBar(),
            Expanded(
              child: RefreshIndicator(
                color: const Color(0xFFEF4444),
                backgroundColor: AppColors.cardBg,
                onRefresh: () => controller.fetchIncidents(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Banner
                      _buildHeaderBanner(),
                      const SizedBox(height: 16),

                      // 4 Top KPI Metric Cards
                      _buildKpiMetricsGrid(),
                      const SizedBox(height: 16),

                      // Search Bar & Filter Tabs
                      _buildSearchAndFilterSection(),
                      const SizedBox(height: 16),

                      // Incidents List
                      _buildIncidentsList(),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFEF4444),
        icon: const Icon(Icons.add_alert_rounded, color: Colors.white),
        label: const Text(
          'Report Incident',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        onPressed: () {
          controller.loadReportResources();
          Get.toNamed(Routes.FLEET_REPORT_INCIDENT);
        },
      ),
    );
  }

  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          const Text(
            'Emergency & SOS',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.2,
            ),
          ),
          IconButton(
            onPressed: () => controller.fetchIncidents(),
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            tooltip: 'Refresh',
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFEF4444).withOpacity(0.3),
          width: 1.2,
        ),
        gradient: LinearGradient(
          colors: [
            const Color(0xFFEF4444).withOpacity(0.12),
            AppColors.cardBg,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFEF4444).withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.warning_amber_rounded,
              color: Color(0xFFEF4444),
              size: 28,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Safety & Incident Desk',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Monitor breakdowns, accidents, driver SOS calls, and clearance status.',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 11.5,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKpiMetricsGrid() {
    return Obx(() {
      return Row(
        children: [
          Expanded(
            child: _buildMetricCard(
              label: 'Total Reports',
              value: controller.totalCount.toString(),
              icon: Icons.shield_outlined,
              iconColor: const Color(0xFF6366F1),
              borderColor: AppColors.cardBorder,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMetricCard(
              label: 'Critical SOS',
              value: controller.criticalCount.toString(),
              icon: Icons.error_outline_rounded,
              iconColor: const Color(0xFFEF4444),
              borderColor: const Color(0xFFEF4444).withOpacity(0.3),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMetricCard(
              label: 'Investigating',
              value: controller.investigatingCount.toString(),
              icon: Icons.pending_actions_rounded,
              iconColor: const Color(0xFFF59E0B),
              borderColor: AppColors.cardBorder,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMetricCard(
              label: 'Resolved',
              value: controller.resolvedCount.toString(),
              icon: Icons.check_circle_outline_rounded,
              iconColor: const Color(0xFF10B981),
              borderColor: AppColors.cardBorder,
            ),
          ),
        ],
      );
    });
  }

  Widget _buildMetricCard({
    required String label,
    required String value,
    required IconData icon,
    required Color iconColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: iconColor, size: 18),
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilterSection() {
    return Column(
      children: [
        // Search Input
        Container(
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.inputBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.inputBorder),
          ),
          child: TextField(
            controller: controller.searchController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search by Vehicle, Driver, Type, ID...',
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 12),
              prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey, size: 20),
              suffixIcon: Obx(() {
                if (controller.searchQuery.value.isEmpty) return const SizedBox.shrink();
                return IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.grey, size: 18),
                  onPressed: () => controller.searchController.clear(),
                );
              }),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Filter Pills
        Obx(() {
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterPill('ALL', 'All Incidents', null),
                const SizedBox(width: 8),
                _buildFilterPill('critical', 'Critical SOS', const Color(0xFFEF4444)),
                const SizedBox(width: 8),
                _buildFilterPill('investigating', 'Under Investigation', const Color(0xFFF59E0B)),
                const SizedBox(width: 8),
                _buildFilterPill('resolved', 'Resolved & Cleared', const Color(0xFF10B981)),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildFilterPill(String key, String label, Color? indicatorColor) {
    final isSelected = controller.selectedFilter.value == key;
    return GestureDetector(
      onTap: () => controller.selectedFilter.value = key,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? (indicatorColor?.withOpacity(0.2) ?? const Color(0xFF6366F1).withOpacity(0.2))
              : AppColors.cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? (indicatorColor ?? const Color(0xFF6366F1))
                : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (indicatorColor != null) ...[
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: indicatorColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey.shade400,
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIncidentsList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(
            child: CircularProgressIndicator(color: Color(0xFFEF4444)),
          ),
        );
      }

      final list = controller.filteredIncidents;
      if (list.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.check_circle_outline_rounded, size: 48, color: Colors.grey.shade600),
              const SizedBox(height: 12),
              const Text(
                'No Incidents Found',
                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                controller.searchQuery.value.isNotEmpty
                    ? 'No incidents match your search query.'
                    : 'All fleet routes & vehicles are operating safely.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
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
          final inc = list[index];
          return _buildIncidentCard(inc);
        },
      );
    });
  }

  Widget _buildIncidentCard(IncidentItemModel inc) {
    return GestureDetector(
      onTap: () {
        controller.selectIncidentForDetail(inc);
        Get.toNamed(Routes.FLEET_INCIDENT_DETAILS);
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: inc.isCritical
                ? const Color(0xFFEF4444).withOpacity(0.4)
                : AppColors.cardBorder,
            width: inc.isCritical ? 1.4 : 1.0,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Type, Severity badge & Status badge
            Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        Icons.warning_amber_rounded,
                        color: inc.severityColor,
                        size: 18,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          inc.incidentType,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                // Severity Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: inc.severityColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: inc.severityColor.withOpacity(0.5)),
                  ),
                  child: Text(
                    inc.severity.toUpperCase(),
                    style: TextStyle(
                      color: inc.severityColor,
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                // Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: inc.statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: inc.statusColor.withOpacity(0.5)),
                  ),
                  child: Text(
                    inc.formattedStatus.toUpperCase(),
                    style: TextStyle(
                      color: inc.statusColor,
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Description
            Text(
              inc.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: Colors.grey.shade300,
                fontSize: 12,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 12),

            // Metadata row: Vehicle, Driver, Location
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.background.withOpacity(0.6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.directions_bus_rounded, size: 14, color: Color(0xFF6366F1)),
                      const SizedBox(width: 5),
                      Text(
                        inc.displayVehicleNumber,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.person_rounded, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        inc.displayDriverName,
                        style: TextStyle(
                          color: Colors.grey.shade300,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  if (inc.location != null && inc.location!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 13, color: Colors.redAccent),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            inc.location!,
                            style: TextStyle(color: Colors.grey.shade400, fontSize: 10.5),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Casualties / Injury Warning Chip if present
            if (inc.deadCasualty > 0 || inc.injuredCount > 0) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.local_hospital_rounded, size: 13, color: Color(0xFFEF4444)),
                    const SizedBox(width: 5),
                    Text(
                      'Casualties: ${inc.deadCasualty} • Injured: ${inc.injuredCount}',
                      style: const TextStyle(
                        color: Color(0xFFEF4444),
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 8),
            // Bottom Action Prompt
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  inc.createdAt != null && inc.createdAt!.length >= 10
                      ? inc.createdAt!.substring(0, 10)
                      : 'Recorded',
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                ),
                Row(
                  children: const [
                    Text(
                      'View & Resolve',
                      style: TextStyle(
                        color: Color(0xFF6366F1),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 2),
                    Icon(Icons.chevron_right_rounded, size: 16, color: Color(0xFF6366F1)),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
