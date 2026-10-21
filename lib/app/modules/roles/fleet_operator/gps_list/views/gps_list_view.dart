import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/constants/api_constants.dart';
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
                      // 1. Stat Cards Banner (4 Metrics)
                      _buildStatsGrid(),
                      const SizedBox(height: 16),

                      // 2. Search & View Mode Switcher
                      _buildSearchAndToolbar(),
                      const SizedBox(height: 12),

                      // 3. Status Filter Tabs
                      _buildFilterTabs(),
                      const SizedBox(height: 16),

                      // 4. Main List / Grid Display
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
                  'GPS & Telematics Units',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'IoT tracking hardware & telematics binding',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 22),
            onPressed: controller.fetchDevices,
            tooltip: 'Refresh list',
          ),
          Container(
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: controller.goToAdd,
                borderRadius: BorderRadius.circular(10),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add_rounded, color: Colors.white, size: 16),
                      SizedBox(width: 4),
                      Text(
                        'Register',
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
    );
  }

  // --- 4 Stat Metric Cards ---
  Widget _buildStatsGrid() {
    return Obx(() {
      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.8,
        children: [
          _buildStatCard(
            title: 'TOTAL UNITS',
            value: controller.totalCount.toString(),
            icon: Icons.memory_rounded,
            iconColor: const Color(0xFF3B82F6),
            bgColor: const Color(0xFF1E293B),
          ),
          _buildStatCard(
            title: 'AVAILABLE / ACTIVE',
            value: controller.availableCount.toString(),
            icon: Icons.check_circle_outline_rounded,
            iconColor: const Color(0xFF10B981),
            bgColor: const Color(0xFF1E293B),
            valueColor: const Color(0xFF10B981),
          ),
          _buildStatCard(
            title: 'PENDING APPROVAL',
            value: controller.pendingCount.toString(),
            icon: Icons.pending_actions_rounded,
            iconColor: Colors.amberAccent,
            bgColor: const Color(0xFF1E293B),
            valueColor: Colors.amberAccent,
          ),
          _buildStatCard(
            title: 'ASSIGNED / IN-USE',
            value: controller.assignedCount.toString(),
            icon: Icons.directions_bus_rounded,
            iconColor: const Color(0xFF818CF8),
            bgColor: const Color(0xFF1E293B),
            valueColor: const Color(0xFF818CF8),
          ),
        ],
      );
    });
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    Color valueColor = Colors.white,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    letterSpacing: 0.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 16),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
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
                hintText: 'Search by Code, IMEI, Vendor, Bus...',
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
                  tooltip: 'List View',
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
                  tooltip: 'Grid View',
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

  // --- 5 Status Filter Tabs with Counts ---
  Widget _buildFilterTabs() {
    final tabs = ['All', 'Available', 'Assigned', 'Pending', 'Rejected'];

    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: tabs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final tab = tabs[index];

          return Obx(() {
            final isSelected = controller.activeTab.value == tab;
            final count = controller.countForTab(tab);

            return InkWell(
              onTap: () => controller.setActiveTab(tab),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected
                        ? const Color(0xFF818CF8)
                        : AppColors.cardBorder,
                    width: 1.2,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      tab,
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
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
/*  Widget _buildFilterTabs() {
    final tabs = ['All', 'Available', 'Assigned', 'Pending', 'Rejected'];

    return Obx(() {
      return SizedBox(
        height: 36,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: tabs.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final tab = tabs[index];
            final isSelected = controller.activeTab.value == tab;
            final count = controller.countForTab(tab);

            return InkWell(
              onTap: () => controller.setActiveTab(tab),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF818CF8) : AppColors.cardBorder,
                    width: 1.2,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      tab,
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
          },
        ),
      );
    });
  }*/

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
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            return _buildTableItem(list[index]);
          },
        );
      } else {
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 1,
            mainAxisSpacing: 12,
            mainAxisExtent: 210,
          ),
          itemCount: list.length,
          itemBuilder: (context, index) {
            return _buildGridCard(list[index]);
          },
        );
      }
    });
  }

  // --- Empty State ---
  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
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
              color: const Color(0xFF1E293B),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.memory_rounded, color: AppColors.textMuted, size: 36),
          ),
          const SizedBox(height: 14),
          const Text(
            'No GPS Devices Found',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            controller.searchQuery.isNotEmpty
                ? 'No hardware units match your search query.'
                : 'No GPS devices registered in this category yet.',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: controller.goToAdd,
            icon: const Icon(Icons.add_rounded, size: 16),
            label: const Text('Register First GPS Unit'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  // --- Table / Compact Row View ---
  Widget _buildTableItem(GpsDeviceModel g) {
    final photoUrl = ApiConstants.resolveFileUrl(g.imageUrl);

    return InkWell(
      onTap: () => controller.goToDetails(g),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Device Icon / Image
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: photoUrl.isNotEmpty
                      ? Image.network(
                          photoUrl,
                          width: 44,
                          height: 44,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildFallbackDeviceIcon(),
                        )
                      : _buildFallbackDeviceIcon(),
                ),
                const SizedBox(width: 12),

                // Main Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Text(
                              g.displayCode,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          _buildStatusBadge(g.status),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${g.vendor} ${g.model}'.trim(),
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.fingerprint_rounded, size: 12, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              'IMEI: ${g.imei.isNotEmpty ? g.imei : '—'}',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 11,
                                fontFamily: 'monospace',
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Action Menu Icon
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
            const SizedBox(height: 8),

            // Bottom row: Bound Vehicle & SIM network
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Vehicle
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        Icons.directions_bus_rounded,
                        size: 13,
                        color: g.isAssigned ? const Color(0xFF60A5FA) : AppColors.textMuted,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          g.vehicle != null && g.vehicle!.busNumber.isNotEmpty
                              ? g.vehicle!.busNumber
                              : (g.vehicleId != null ? 'Bus #${g.vehicleId}' : 'Unassigned (In Stock)'),
                          style: TextStyle(
                            color: g.isAssigned ? const Color(0xFF93C5FD) : AppColors.textMuted,
                            fontSize: 11,
                            fontWeight: g.isAssigned ? FontWeight.w600 : FontWeight.normal,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),

                // SIM line
                Row(
                  children: [
                    const Icon(Icons.sim_card_outlined, size: 13, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      g.sim.isNotEmpty ? g.sim : 'No SIM',
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontFamily: 'monospace',
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

  // --- Grid Card View ---
  Widget _buildGridCard(GpsDeviceModel g) {
    final photoUrl = ApiConstants.resolveFileUrl(g.imageUrl);

    return InkWell(
      onTap: () => controller.goToDetails(g),
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
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Header Row
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: photoUrl.isNotEmpty
                      ? Image.network(
                          photoUrl,
                          width: 44,
                          height: 44,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildFallbackDeviceIcon(),
                        )
                      : _buildFallbackDeviceIcon(),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        g.displayCode,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${g.vendor} ${g.model}'.trim(),
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                _buildStatusBadge(g.status),
                const SizedBox(width: 4),
                IconButton(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white70, size: 20),
                  onPressed: () => _showActionSheet(g),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),

            // Parameters 2x2 grid
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildParamSnippet('IMEI', g.imei.isNotEmpty ? g.imei : '—', isMono: true),
                      ),
                      Expanded(
                        child: _buildParamSnippet('S/N', g.serialNumber.isNotEmpty ? g.serialNumber : 'N/A', isMono: true),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _buildParamSnippet('SIM LINE', g.sim.isNotEmpty ? g.sim : 'Unassigned', isMono: true),
                      ),
                      Expanded(
                        child: _buildParamSnippet(
                          'ASSIGNED BUS',
                          g.vehicle?.busNumber.isNotEmpty == true
                              ? g.vehicle!.busNumber
                              : (g.vehicleId != null ? 'Bus #${g.vehicleId}' : 'In Stock'),
                          highlight: g.isAssigned,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Footer action strip
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.signal_cellular_alt_rounded, size: 14, color: Color(0xFF10B981)),
                    const SizedBox(width: 4),
                    Text(
                      g.networkType.isNotEmpty ? g.networkType : '4G LTE',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    ),
                  ],
                ),
                InkWell(
                  onTap: () => controller.goToDetails(g),
                  child: const Row(
                    children: [
                      Text(
                        'View Details',
                        style: TextStyle(
                          color: Color(0xFF818CF8),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(width: 2),
                      Icon(Icons.arrow_forward_ios_rounded, size: 10, color: Color(0xFF818CF8)),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildParamSnippet(String label, String val, {bool isMono = false, bool highlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 1),
        Text(
          val,
          style: TextStyle(
            color: highlight ? const Color(0xFF93C5FD) : Colors.white,
            fontSize: 11,
            fontFamily: isMono ? 'monospace' : null,
            fontWeight: highlight ? FontWeight.bold : FontWeight.w500,
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildFallbackDeviceIcon() {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: const Center(
        child: Icon(Icons.memory_rounded, color: Colors.amberAccent, size: 22),
      ),
    );
  }

  // --- Status Badge ---
  Widget _buildStatusBadge(String status) {
    final s = status.toLowerCase();
    Color bg = const Color(0xFF1E293B);
    Color fg = const Color(0xFF94A3B8);
    Color border = const Color(0xFF334155);
    String label = status.toUpperCase();

    if (s == 'available' || s == 'online') {
      bg = const Color(0xFF10B981).withValues(alpha: 0.15);
      fg = const Color(0xFF34D399);
      border = const Color(0xFF10B981).withValues(alpha: 0.4);
      label = 'AVAILABLE';
    } else if (s == 'assigned') {
      bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
      fg = const Color(0xFF60A5FA);
      border = const Color(0xFF3B82F6).withValues(alpha: 0.4);
      label = 'ASSIGNED';
    } else if (s == 'pending_approval') {
      bg = Colors.amber.withValues(alpha: 0.15);
      fg = Colors.amberAccent;
      border = Colors.amber.withValues(alpha: 0.4);
      label = 'PENDING';
    } else if (s == 'rejected') {
      bg = Colors.redAccent.withValues(alpha: 0.15);
      fg = Colors.redAccent;
      border = Colors.redAccent.withValues(alpha: 0.4);
      label = 'REJECTED';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fg,
          fontSize: 9,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  // --- Action BottomSheet (Matching Admin Actions) ---
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
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFF334155),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          g.displayCode,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${g.vendor} ${g.model}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                    _buildStatusBadge(g.status),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Divider(height: 1, color: Color(0xFF1E293B)),
              const SizedBox(height: 8),

              // View Details
              _buildSheetActionItem(
                icon: Icons.visibility_rounded,
                color: const Color(0xFF818CF8),
                title: 'View Device Details',
                subtitle: 'Hardware specs, diagnostics & vehicle pairing',
                onTap: () {
                  Get.back();
                  controller.goToDetails(g);
                },
              ),

              // Edit Config
              _buildSheetActionItem(
                icon: Icons.edit_rounded,
                color: const Color(0xFF60A5FA),
                title: 'Edit Device Config',
                subtitle: 'Update IMEI, SIM, model, mounting location',
                onTap: () {
                  Get.back();
                  controller.goToEdit(g);
                },
              ),

              // Assign to Bus Vehicle
              _buildSheetActionItem(
                icon: Icons.directions_bus_rounded,
                color: Colors.amberAccent,
                title: g.isAssigned ? 'Reassign / Unassign Bus' : 'Assign to Bus Vehicle',
                subtitle: g.isAssigned
                    ? 'Currently mounted on ${g.vehicle?.busNumber ?? 'Bus #' + g.vehicleId.toString()}'
                    : 'Bind hardware tracker to a fleet vehicle',
                onTap: () {
                  Get.back();
                  controller.goToAssign(g);
                },
              ),

              // Approve (if pending)
              if (g.isPending)
                _buildSheetActionItem(
                  icon: Icons.check_circle_rounded,
                  color: const Color(0xFF10B981),
                  title: 'Approve Device',
                  subtitle: 'Verify and activate telematics tracking',
                  onTap: () {
                    Get.back();
                    controller.handleApprove(g);
                  },
                ),

              // Reject (if pending)
              if (g.isPending)
                _buildSheetActionItem(
                  icon: Icons.cancel_rounded,
                  color: Colors.redAccent,
                  title: 'Reject Device',
                  subtitle: 'Send rejection feedback to technician',
                  onTap: () {
                    Get.back();
                    controller.showRejectDialog(g);
                  },
                ),

              // Delete Device
              _buildSheetActionItem(
                icon: Icons.delete_outline_rounded,
                color: Colors.redAccent,
                title: 'Delete Hardware Record',
                subtitle: g.isAssigned ? 'Cannot delete while assigned to a bus' : 'Permanently remove from inventory',
                isDestructive: true,
                onTap: () {
                  Get.back();
                  controller.handleDelete(g);
                },
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildSheetActionItem({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isDestructive ? Colors.redAccent : Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 12),
    );
  }
}
