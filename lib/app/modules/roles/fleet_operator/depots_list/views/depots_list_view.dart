import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/fleet_models.dart';
import '../controllers/depots_list_controller.dart';

class DepotsListView extends GetView<DepotsListController> {
  const DepotsListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            _buildTopBar(),

            Expanded(
              child: RefreshIndicator(
                onRefresh: controller.fetchDepots,
                color: const Color(0xFF10B981),
                backgroundColor: const Color(0xFF1E293B),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 3 Stat Metrics Strip
                      _buildStatsStrip(),
                      const SizedBox(height: 16),

                      // Search & Status Filter
                      _buildSearchAndFilters(),
                      const SizedBox(height: 16),

                      // Depots List
                      _buildDepotsList(),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          const Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                'Depots & Maintenance Yards',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF9333EA).withOpacity(0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: controller.goToAddDepot,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.add, color: Colors.white, size: 20),
                      SizedBox(width: 6),
                      Text(
                        'Add Depot',
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
          // ElevatedButton.icon(
          //   onPressed: controller.goToAddDepot,
          //   style: ElevatedButton.styleFrom(
          //     backgroundColor: const Color(0xFF10B981),
          //     foregroundColor: Colors.white,
          //     padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          //     elevation: 0,
          //   ),
          //   icon: const Icon(Icons.add_rounded, size: 16),
          //   label: const Text(
          //     'Add Depot',
          //     style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          //   ),
          // ),
        ],
      ),
    );
  }

  Widget _buildStatsStrip() {
    return Obx(() {
      final total = controller.totalDepotsCount;
      final operational = controller.operationalCount;
      final chargers = controller.totalEvChargers;

      return Row(
        children: [
          Expanded(
            child: _buildStatCard(
              title: 'TOTAL DEPOTS',
              value: '$total',
              subtitle: 'Facilities',
              valueColor: Colors.white,
              borderColor: AppColors.cardBorder,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              title: 'OPERATIONAL',
              value: '$operational',
              subtitle: 'Active bases',
              valueColor: const Color(0xFF10B981),
              borderColor: const Color(0xFF10B981).withValues(alpha: 0.3),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              title: 'EV CHARGERS',
              value: '$chargers',
              subtitle: 'Fast ports',
              valueColor: const Color(0xFF38BDF8),
              borderColor: const Color(0xFF38BDF8).withValues(alpha: 0.3),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    required Color valueColor,
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
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.4,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 10,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Column(
      children: [
        // Search Bar
        Container(
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: TextField(
            controller: controller.searchController,
            onChanged: controller.onSearchChanged,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search depot by name, code, city or address...',
              hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
              suffixIcon: Obx(() {
                if (controller.searchQuery.value.isNotEmpty) {
                  return IconButton(
                    icon: const Icon(Icons.clear_rounded, color: AppColors.textMuted, size: 18),
                    onPressed: () {
                      controller.searchController.clear();
                      controller.onSearchChanged('');
                    },
                  );
                }
                return const SizedBox.shrink();
              }),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Status Filter Chips
        Obx(() {
          final current = controller.statusFilter.value;
          return Row(
            children: [
              _buildFilterChip('All Facilities', 'all', current),
              const SizedBox(width: 8),
              _buildFilterChip('Operational Only', 'operational', current),
              const SizedBox(width: 8),
              _buildFilterChip('Closed', 'closed', current),
            ],
          );
        }),
      ],
    );
  }

  Widget _buildFilterChip(String label, String value, String current) {
    final isSelected = current == value;
    return Expanded(
      child: InkWell(
        onTap: () => controller.setStatusFilter(value),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF10B981).withValues(alpha: 0.15) : AppColors.cardBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? const Color(0xFF10B981) : AppColors.cardBorder,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textMuted,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
    );
  }

  Widget _buildDepotsList() {
    return Obx(() {
      if (controller.isLoading.value && controller.depots.isEmpty) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 60),
            child: CircularProgressIndicator(color: Color(0xFF10B981)),
          ),
        );
      }

      final list = controller.filteredDepots;
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
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.amberAccent.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.warehouse_rounded, color: Colors.amberAccent, size: 32),
              ),
              const SizedBox(height: 12),
              const Text(
                'No Depot Facilities Found',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              const Text(
                'No maintenance depot facilities match your active search or status criteria.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              CustomButton(
                text: 'Add First Depot',
                prefixIcon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
                onTap: controller.goToAddDepot,
                width: 200,
                height: 42,
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
          final dep = list[index];
          return _buildDepotCard(dep);
        },
      );
    });
  }

  Widget _buildDepotCard(DepotItemModel dep) {
    final statusColor = dep.isOperational
        ? const Color(0xFF10B981)
        : dep.isMaintenance
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);

    final fillPct = dep.fillPercentage;
    final fillBarColor = fillPct > 90
        ? const Color(0xFFEF4444)
        : fillPct > 70
            ? const Color(0xFFF59E0B)
            : const Color(0xFF10B981);

    return InkWell(
      onTap: () => controller.goToDepotDetails(dep),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Code, City, Type & Status
            Row(
              children: [
                // Code Tag
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    dep.displayCode,
                    style: const TextStyle(
                      color: Color(0xFF38BDF8),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                // if (dep.city.isNotEmpty) ...[
                //   const SizedBox(width: 6),
                //   Container(
                //     padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                //     decoration: BoxDecoration(
                //       color: Colors.white.withValues(alpha: 0.08),
                //       borderRadius: BorderRadius.circular(6),
                //     ),
                //     child: Text(
                //       dep.city,
                //       style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600),
                //     ),
                //   ),
                // ],
                // const SizedBox(width: 6),
                // Container(
                //   padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                //   decoration: BoxDecoration(
                //     color: const Color(0xFFA855F7).withValues(alpha: 0.15),
                //     borderRadius: BorderRadius.circular(6),
                //   ),
                //   child: Text(
                //     dep.displayType.toUpperCase(),
                //     style: const TextStyle(
                //       color: Color(0xFFA855F7),
                //       fontSize: 9,
                //       fontWeight: FontWeight.bold,
                //     ),
                //   ),
                // ),
                const Spacer(),
                // Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    dep.status.toUpperCase(),
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Facility Name
            Text(
              dep.name,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (dep.address.isNotEmpty) ...[
              const SizedBox(height: 3),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, color: AppColors.textMuted, size: 14),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      dep.address,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 12),

            // Capacity Progress Bar
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Parking Bays Occupancy',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                    Text(
                      '${dep.currentParked} / ${dep.capacity} Bays ($fillPct%)',
                      style: TextStyle(color: fillBarColor, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: dep.capacity > 0 ? (dep.currentParked / dep.capacity).clamp(0.0, 1.0) : 0.0,
                    minHeight: 6,
                    backgroundColor: Colors.white.withValues(alpha: 0.1),
                    valueColor: AlwaysStoppedAnimation<Color>(fillBarColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 3 KPI Strip: Total Bays, Stationed Buses, EV Chargers
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.inputBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TOTAL BAYS', style: TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text('${dep.capacity}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  Container(width: 1, height: 24, color: AppColors.cardBorder),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('PARKED BUSES', style: TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text('${dep.currentParked}', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 13, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  Container(width: 1, height: 24, color: AppColors.cardBorder),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('EV CHARGERS', style: TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text('${dep.evChargers}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Bottom Bar: Contact & 3-Dot Action Menu
            Row(
              children: [
                if (dep.contactPhone.isNotEmpty) ...[
                  const Icon(Icons.phone_outlined, size: 13, color: AppColors.textMuted),
                  const SizedBox(width: 5),
                  Text(
                    dep.contactPhone,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontFamily: 'monospace'),
                  ),
                ] else
                  const Text('No phone listed', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                const Spacer(),

                // 3-Dot Action Menu
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white70, size: 20),
                  color: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  onSelected: (val) {
                    switch (val) {
                      case 'view':
                        controller.goToDepotDetails(dep);
                        break;
                      case 'edit':
                        controller.goToEditDepot(dep);
                        break;
                      case 'toggle_status':
                        controller.toggleDepotStatus(dep);
                        break;
                      case 'delete':
                        controller.confirmDeleteDepot(dep);
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'view',
                      child: Row(
                        children: [
                          Icon(Icons.visibility_outlined, size: 16, color: Color(0xFF38BDF8)),
                          SizedBox(width: 10),
                          Text('View Facility Dossier', style: TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit_outlined, size: 16, color: Color(0xFF10B981)),
                          SizedBox(width: 10),
                          Text('Edit Facility Details', style: TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'toggle_status',
                      child: Row(
                        children: [
                          Icon(
                            dep.isOperational ? Icons.cancel_outlined : Icons.check_circle_outline_rounded,
                            size: 16,
                            color: const Color(0xFFF59E0B),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            dep.isOperational ? 'Close Facility' : 'Reopen Facility',
                            style: const TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    const PopupMenuDivider(height: 1),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline_rounded, size: 16, color: Color(0xFFEF4444)),
                          SizedBox(width: 10),
                          Text('Delete Facility', style: TextStyle(color: Color(0xFFEF4444), fontSize: 12)),
                        ],
                      ),
                    ),
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
