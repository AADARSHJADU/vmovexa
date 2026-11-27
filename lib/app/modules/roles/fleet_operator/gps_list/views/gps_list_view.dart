import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/gps_device_model.dart';
import '../controllers/gps_list_controller.dart';

class GpsListView extends GetView<GpsListController> {
  const GpsListView({super.key});

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
                onRefresh: controller.fetchDevices,
                color: const Color(0xFF10B981),
                backgroundColor: const Color(0xFF1E293B),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. 3 Stat KPI Cards (Total Edge Units, Assigned to Bus, Spare Units)
                      _buildStatsBanner(),
                      const SizedBox(height: 16),

                      // 2. Search & View Mode Switcher
                      _buildSearchAndToolbar(),
                      const SizedBox(height: 12),

                      // 3. Status Filter Tabs (All, Assigned, Spare)
                      _buildFilterTabs(),
                      const SizedBox(height: 16),

                      // 4. Main Device List / Grid Display
                      _buildDeviceList(),
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

  // --- Top Bar ---
  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          const CustomBackButton(),
          const SizedBox(width: 8),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Edge & GPS IoT Devices',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Edge computing hardware and onboard telematics directory',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 11,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          OutlinedButton.icon(
            onPressed: controller.fetchDevices,
            icon: const Icon(Icons.refresh_rounded, size: 14, color: Colors.white70),
            label: const Text('Refresh', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              side: const BorderSide(color: AppColors.cardBorder, width: 1.2),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              backgroundColor: AppColors.cardBg,
            ),
          ),
        ],
      ),
    );
  }

  // --- 3 Stat KPI Cards (Total Edge Units, Assigned to Bus, Spare Units) ---
  Widget _buildStatsBanner() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 360;
        return Obx(() {
          // Explicitly touch controller.devices so GetX registers reactive dependency immediately
          final devList = controller.devices;
          final total = devList.length;
          final assigned = devList.where((g) => g.isAssigned).length;
          final spare = devList.where((g) => !g.isAssigned).length;

          return Row(
            children: [
              // Card 1: Total Edge Devices
              Expanded(
                child: _buildStatCard(
                  title: 'TOTAL EDGE DEVICES',
                  value: total.toString(),
                  sub: 'Edge boxes allocated to your fleet',
                  icon: Icons.memory_rounded,
                  iconColor: const Color(0xFF38BDF8),
                  bgTint: const Color(0xFF0284C7).withValues(alpha: 0.12),
                  borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
                  isNarrow: isNarrow,
                ),
              ),
              const SizedBox(width: 8),

              // Card 2: Connected to Buses
              Expanded(
                child: _buildStatCard(
                  title: 'CONNECTED TO BUSES',
                  value: assigned.toString(),
                  sub: 'Active buses with live edge & GPS link',
                  icon: Icons.directions_bus_rounded,
                  iconColor: const Color(0xFF10B981),
                  bgTint: const Color(0xFF10B981).withValues(alpha: 0.12),
                  borderColor: const Color(0xFF10B981).withValues(alpha: 0.3),
                  isNarrow: isNarrow,
                ),
              ),
              const SizedBox(width: 8),

              // Card 3: Available (Spare)
              Expanded(
                child: _buildStatCard(
                  title: 'AVAILABLE (SPARE)',
                  value: spare.toString(),
                  sub: 'Spare edge hardware ready for bus installation',
                  icon: Icons.sync_rounded,
                  iconColor: const Color(0xFFF59E0B),
                  bgTint: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                  borderColor: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                  isNarrow: isNarrow,
                ),
              ),
            ],
          );
        });
      },
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String sub,
    required IconData icon,
    required Color iconColor,
    required Color bgTint,
    required Color borderColor,
    bool isNarrow = false,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: isNarrow ? 8 : 10, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.3,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: bgTint,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 14),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: iconColor,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            sub,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 9,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // --- Search & View Mode Switcher ---
  Widget _buildSearchAndToolbar() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.inputBorder, width: 1.2),
            ),
            child: TextField(
              controller: controller.searchController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                icon: Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 18),
                hintText: 'Search by Box ID, MAC, Bus, Fleet, Org...',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Obx(() {
          final isTable = controller.viewMode.value == 'table';
          return Container(
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.inputBorder, width: 1.2),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: Icon(
                    Icons.view_list_rounded,
                    color: isTable ? const Color(0xFF6366F1) : AppColors.textMuted,
                    size: 20,
                  ),
                  onPressed: () => controller.setViewMode('table'),
                  tooltip: 'list_view_tooltip'.tr,
                  padding: const EdgeInsets.all(8),
                  constraints: const BoxConstraints(),
                ),
                Container(width: 1, height: 20, color: AppColors.cardBorder),
                IconButton(
                  icon: Icon(
                    Icons.grid_view_rounded,
                    color: !isTable ? const Color(0xFF6366F1) : AppColors.textMuted,
                    size: 18,
                  ),
                  onPressed: () => controller.setViewMode('grid'),
                  tooltip: 'grid_view_tooltip'.tr,
                  padding: const EdgeInsets.all(8),
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // --- Filter Tabs (Matching Web Admin: All Edge Units, Assigned to Bus, Spare Units) ---
  Widget _buildFilterTabs() {
    final tabs = [
      {'id': 'All', 'label': 'All Edge Units'},
      {'id': 'Assigned', 'label': 'Assigned to Bus'},
      {'id': 'Spare', 'label': 'Spare Units'},
    ];

    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: tabs.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final tabId = tabs[index]['id']!;
          final tabLabel = tabs[index]['label']!;

          return Obx(() {
            final isSelected = controller.activeTab.value == tabId;
            final count = controller.countForTab(tabId);

            return InkWell(
              onTap: () => controller.setActiveTab(tabId),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppTheme.primaryGradient : null,
                  color: isSelected ? null : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? Colors.transparent : AppColors.cardBorder,
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
                      tabLabel,
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Colors.white.withValues(alpha: 0.25)
                            : const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        count.toString(),
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textMuted,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          });
        },
      ),
    );
  }

  // --- Main Device List / Grid Display ---
  Widget _buildDeviceList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 60),
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          ),
        );
      }

      final list = controller.filteredDevices;
      if (list.isEmpty) {
        return _buildEmptyState();
      }

      final isTable = controller.viewMode.value == 'table';
      if (isTable) {
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: list.length,
          separatorBuilder: (_, _) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            return _buildEdgeDeviceRow(list[index]);
          },
        );
      } else {
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: list.length,
          separatorBuilder: (_, _) => const SizedBox(height: 14),
          itemBuilder: (context, index) {
            return _buildEdgeDeviceCard(list[index]);
          },
        );
      }
    });
  }

  // --- Empty State ---
  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 48),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0284C7).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.memory_rounded, color: Color(0xFF38BDF8), size: 36),
          ),
          const SizedBox(height: 16),
          const Text(
            'No Edge Devices Found',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            controller.searchQuery.isNotEmpty
                ? 'No bus or Edge Device matched your filter criteria.'
                : 'No Edge Devices currently available in this category.',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // --- 1. Edge Device Row (Table / List Mode) ---
  Widget _buildEdgeDeviceRow(GpsDeviceModel g) {
    final isAssigned = g.isAssigned;
    final busLabel = g.vehicle != null && g.vehicle!.busNumber.isNotEmpty
        ? g.vehicle!.busNumber
        : (g.vehicleId != null ? 'Bus #${g.vehicleId}' : null);

    return InkWell(
      onTap: () => controller.goToDetails(g),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isAssigned
                ? const Color(0xFF10B981).withValues(alpha: 0.3)
                : AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Box ID, Status badge & Assignment badge
            Row(
              children: [
                // Edge Device Box Icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0284C7).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF0284C7).withValues(alpha: 0.4)),
                  ),
                  child: const Center(
                    child: Icon(Icons.memory_rounded, color: Color(0xFF38BDF8), size: 22),
                  ),
                ),
                const SizedBox(width: 10),

                // Box ID & Hardware Model
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              g.displayCode,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          _buildOnlineStatusBadge(g.status),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${g.model} • MAC: ${g.displayMacOrImei}',
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Assignment badge
                _buildAssignmentBadge(isAssigned),

                const SizedBox(width: 4),
                IconButton(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white70, size: 20),
                  onPressed: () => _showActionSheet(g),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),

            const SizedBox(height: 10),
            const Divider(height: 1, color: AppColors.cardBorder),
            const SizedBox(height: 10),

            // Middle Section: Assigned Vehicle Context
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: isAssigned
                    ? const Color(0xFF10B981).withValues(alpha: 0.08)
                    : const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isAssigned
                      ? const Color(0xFF10B981).withValues(alpha: 0.25)
                      : const Color(0xFF334155),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.directions_bus_rounded,
                    size: 16,
                    color: isAssigned ? const Color(0xFF10B981) : Colors.amberAccent,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        InkWell(
                          onTap: isAssigned && (g.vehicleId != null || g.vehicle != null)
                              ? () => controller.goToVehicleDetails(g.vehicleId ?? g.vehicle?.id)
                              : null,
                          child: Text(
                            isAssigned
                                ? (busLabel ?? 'Bound Vehicle')
                                : 'Spare Unit (Ready for Installation)',
                            style: TextStyle(
                              color: isAssigned ? Colors.white : Colors.amberAccent,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              decoration: isAssigned ? TextDecoration.underline : null,
                              decorationColor: Colors.white38,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (isAssigned && g.vehicle != null && g.vehicle!.model.isNotEmpty)
                          Text(
                            '${g.vehicle!.model}${g.vehicle!.depotName.isNotEmpty ? ' • ${g.vehicle!.depotName}' : ''}',
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 10,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                  if (isAssigned)
                    TextButton(
                      onPressed: () => controller.handleUnlink(g),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Unlink',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: Colors.amberAccent, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    )
                  else
                    ElevatedButton(
                      onPressed: () => controller.goToAssign(g),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                      child: const Text('Assign', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Footer strip: SIM, Storage & Agent Version
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.sim_card_outlined, size: 12, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      g.sim.isNotEmpty ? g.sim : (g.network.isNotEmpty ? g.network : '4G LTE IoT'),
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    const Icon(Icons.sd_storage_outlined, size: 12, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      '${g.storageUsedGb}/${g.storageTotalGb} GB',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'v${g.agentVersion}',
                      style: const TextStyle(
                        color: Color(0xFF818CF8),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
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

  // --- 2. Edge Device Card (Grid Mode - Matching Web Admin Grid Cards) ---
  Widget _buildEdgeDeviceCard(GpsDeviceModel g) {
    final isAssigned = g.isAssigned;
    final busLabel = g.vehicle != null && g.vehicle!.busNumber.isNotEmpty
        ? g.vehicle!.busNumber
        : (g.vehicleId != null ? 'Bus #${g.vehicleId}' : null);

    final orgName = g.vehicle?.orgName.isNotEmpty == true ? g.vehicle!.orgName : 'Tenant Organization';
    final fleetName = g.vehicle?.fleetName.isNotEmpty == true ? g.vehicle!.fleetName : (isAssigned ? 'General Fleet' : '—');
    final depotName = g.vehicle?.depotName;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isAssigned ? const Color(0xFF10B981).withValues(alpha: 0.35) : AppColors.cardBorder,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Card Header: Bus & Status
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isAssigned
                      ? const Color(0xFF3B82F6).withValues(alpha: 0.15)
                      : const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isAssigned
                        ? const Color(0xFF3B82F6).withValues(alpha: 0.4)
                        : const Color(0xFF334155),
                  ),
                ),
                child: Center(
                  child: Icon(
                    Icons.directions_bus_rounded,
                    color: isAssigned ? const Color(0xFF60A5FA) : const Color(0xFF94A3B8),
                    size: 22,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    InkWell(
                      onTap: isAssigned && (g.vehicleId != null || g.vehicle != null)
                          ? () => controller.goToVehicleDetails(g.vehicleId ?? g.vehicle?.id)
                          : null,
                      child: Text(
                        isAssigned ? (busLabel ?? 'Bound Vehicle') : 'Unassigned to any bus',
                        style: TextStyle(
                          color: isAssigned ? Colors.white : const Color(0xFF94A3B8),
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          fontStyle: isAssigned ? FontStyle.normal : FontStyle.italic,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      g.vehicle?.model.isNotEmpty == true
                          ? g.vehicle!.model
                          : (isAssigned ? 'Linked Fleet Vehicle' : 'Spare Edge Hardware'),
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              _buildAssignmentBadge(isAssigned),
            ],
          ),
          const SizedBox(height: 12),

          // 2. Tenant, Fleet & Depot Context Block (matching web light blue container)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0284C7).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF0284C7).withValues(alpha: 0.2)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'TENANT ORG',
                      style: TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Flexible(
                      child: Text(
                        orgName,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'FLEET',
                      style: TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Flexible(
                      child: Text(
                        fleetName,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                if (depotName != null && depotName.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'DEPOT',
                        style: TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Flexible(
                        child: Text(
                          depotName,
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),

          // 3. Hardware Specs Box (matching web card hardware specs)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('BOX ID', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          g.displayCode,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                        ),
                        const SizedBox(width: 6),
                        _buildOnlineStatusBadge(g.status),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('MAC / IMEI', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
                    Text(
                      g.displayMacOrImei,
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11, fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('MODEL', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
                    Text(
                      '${g.model} (v${g.agentVersion})',
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('SIM / 4G', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
                    Text(
                      g.sim.isNotEmpty ? g.sim : (g.network.isNotEmpty ? g.network : '4G IoT'),
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Divider(height: 1, color: Color(0xFF1E293B)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('CONNECTED GPS', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        const Icon(Icons.gps_fixed_rounded, color: Colors.amberAccent, size: 12),
                        const SizedBox(width: 4),
                        Text(
                          isAssigned ? 'Streaming Telemetry' : 'Receiver Linked',
                          style: const TextStyle(color: Colors.amberAccent, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 4. Card Footer Action Controls (matching web grid card footer)
          Row(
            children: [
              if (isAssigned) ...[
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => controller.goToAssign(g),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      foregroundColor: const Color(0xFF93C5FD),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: const BorderSide(color: Color(0xFF334155)),
                      ),
                    ),
                    child: const Text('Reassign Bus', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () => controller.handleUnlink(g),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber.withValues(alpha: 0.15),
                    foregroundColor: Colors.amberAccent,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: Colors.amber),
                    ),
                  ),
                  child: const Text('Unlink', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.map_rounded, color: Color(0xFF34D399), size: 18),
                    onPressed: () => controller.goToLiveTracking(g.vehicleId ?? g.vehicle?.id, g.vehicle?.busNumber),
                    tooltip: 'Live Track',
                    padding: const EdgeInsets.all(8),
                    constraints: const BoxConstraints(),
                  ),
                ),
              ] else ...[
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: ElevatedButton(
                      onPressed: () => controller.goToAssign(g),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Assign to Bus', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
              ],
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.more_vert_rounded, color: Colors.white70, size: 20),
                onPressed: () => _showActionSheet(g),
                padding: const EdgeInsets.all(6),
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- Status & Badges ---
  Widget _buildOnlineStatusBadge(String status) {
    final s = status.toLowerCase();
    final isOnline = s == 'online' || s == 'active';
    final isMaint = s == 'maintenance';

    if (isOnline) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(radius: 3, backgroundColor: Color(0xFF10B981)),
            SizedBox(width: 4),
            Text(
              'Online',
              style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
    } else if (isMaint) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
        decoration: BoxDecoration(
          color: Colors.amber.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
        ),
        child: const Text(
          'Maintenance',
          style: TextStyle(color: Colors.amberAccent, fontSize: 9, fontWeight: FontWeight.bold),
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: const Text(
        'Standby',
        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildAssignmentBadge(bool isAssigned) {
    if (isAssigned) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_outline_rounded, color: Color(0xFF34D399), size: 12),
            SizedBox(width: 4),
            Text(
              'Assigned',
              style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.inventory_2_outlined, color: Colors.amberAccent, size: 12),
          SizedBox(width: 4),
          Text(
            'Spare Unit',
            style: TextStyle(color: Colors.amberAccent, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  // --- Action Sheet (Matching Web Frontend Admin Options) ---
  void _showActionSheet(GpsDeviceModel g) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: const BoxDecoration(
          color: Color(0xFF161922),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: Color(0xFF334155), width: 1.2)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        g.displayCode,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${g.model} • MAC: ${g.displayMacOrImei}',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(height: 1, color: Color(0xFF262A36)),
              const SizedBox(height: 10),

              // 1. View Details
              _buildSheetAction(
                icon: Icons.visibility_outlined,
                iconColor: const Color(0xFF818CF8),
                title: 'View Device Details',
                onTap: () {
                  Get.back();
                  controller.goToDetails(g);
                },
              ),

              // 1b. View Bus Profile (if vehicle assigned)
              if (g.isAssigned && (g.vehicleId != null || g.vehicle != null))
                _buildSheetAction(
                  icon: Icons.directions_bus_rounded,
                  iconColor: const Color(0xFF60A5FA),
                  title: 'View Bus Profile',
                  onTap: () {
                    Get.back();
                    controller.goToVehicleDetails(g.vehicleId ?? g.vehicle?.id);
                  },
                ),

              // 1c. Live Telematics Track (if vehicle assigned)
              if (g.isAssigned && (g.vehicleId != null || g.vehicle != null))
                _buildSheetAction(
                  icon: Icons.map_rounded,
                  iconColor: const Color(0xFF34D399),
                  title: 'Live Telematics Track',
                  onTap: () {
                    Get.back();
                    controller.goToLiveTracking(g.vehicleId ?? g.vehicle?.id, g.vehicle?.busNumber);
                  },
                ),

              // 2. Assign / Reassign
              _buildSheetAction(
                icon: Icons.directions_bus_rounded,
                iconColor: const Color(0xFF38BDF8),
                title: g.isAssigned ? 'Reassign to Another Bus' : 'Assign to Bus',
                onTap: () {
                  Get.back();
                  controller.goToAssign(g);
                },
              ),

              // 3. Unlink (if assigned)
              if (g.isAssigned)
                _buildSheetAction(
                  icon: Icons.link_off_rounded,
                  iconColor: Colors.amberAccent,
                  title: 'Unlink from Vehicle',
                  onTap: () {
                    Get.back();
                    controller.handleUnlink(g);
                  },
                ),

              // 4. Reboot Device
              _buildSheetAction(
                icon: Icons.restart_alt_rounded,
                iconColor: const Color(0xFF34D399),
                title: 'Reboot Edge Device Hardware',
                onTap: () {
                  Get.back();
                  controller.handleReboot(g);
                },
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildSheetAction({
    required IconData icon,
    required Color iconColor,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        child: Row(
          children: [
            Icon(icon, color: iconColor, size: 20),
            const SizedBox(width: 14),
            Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const Spacer(),
            const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 12),
          ],
        ),
      ),
    );
  }
}
