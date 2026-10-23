import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/edge_device_model.dart';
import '../../../../../data/models/fleet_models.dart';
import '../controller/hardware_status_controller.dart';

class HardwareStatusView extends GetView<HardwareStatusController> {
  const HardwareStatusView({super.key});

  // Dark Theme Colors
  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kCardBorder = Color(0x1AFFFFFF);
  static const Color kFieldBg = Color(0xFF1C1C28);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kPurpleBg = Color(0x26B042FF);
  static const Color kEmerald = Color(0xFF10B981);
  static const Color kEmeraldText = Color(0xFF34D399);
  static const Color kEmeraldBg = Color(0x2610B981);
  static const Color kAmber = Color(0xFFF59E0B);
  static const Color kAmberText = Color(0xFFFBBF24);
  static const Color kAmberBg = Color(0x26F59E0B);
  static const Color kRed = Color(0xFFEF4444);
  static const Color kRedText = Color(0xFFF87171);
  static const Color kRedBg = Color(0x26EF4444);
  static const Color kSlate = Color(0xFF71717A);
  static const Color kSlateText = Color(0xFFA1A1AA);
  static const Color kSlateBg = Color(0x1FFFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.vehicleList.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(color: kPurple),
            );
          }

          return RefreshIndicator(
            color: kPurple,
            backgroundColor: kCardBg,
            onRefresh: controller.onRefresh,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeader(),
                        const SizedBox(height: 16),
                        _buildKpiMetricsGrid(),
                        const SizedBox(height: 18),
                        _buildFilterTabs(),
                        const SizedBox(height: 14),
                        _buildSearchAndToggleRow(),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
                _buildVehicleHardwareList(),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    child: _buildFooter(),
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // =====================================================================
  // Header with Breadcrumb and Actions
  // =====================================================================
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Breadcrumb
        Row(
          children: [
            GestureDetector(
              onTap: controller.onBackPressed,
              child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white70, size: 16),
            ),
            const SizedBox(width: 8),
            const Text(
              'Technician',
              style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w500),
            ),
            const Text(
              '  /  ',
              style: TextStyle(color: Colors.white24, fontSize: 12),
            ),
            const Text(
              'Hardware Subsystems',
              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Title & Actions Row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hardware Subsystems Status',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Real-time multi-subsystem telemetry matrix across GPS, Displays, Network, and Core Hardware',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            // Refresh Button
            Obx(
              () => InkWell(
                onTap: controller.onRefresh,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kCardBorder),
                  ),
                  child: controller.isRefreshing.value
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: kPurple),
                        )
                      : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Run All Diagnostics Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: controller.runAllDiagnostics,
            icon: const Icon(Icons.track_changes_rounded, size: 16, color: Colors.white),
            label: const Text(
              'Run All Diagnostics',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: kPurple,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              elevation: 0,
            ),
          ),
        ),
      ],
    );
  }

  // =====================================================================
  // 4 KPI Metrics Grid (Total Monitored / Online / Issues / Offline)
  // =====================================================================
  Widget _buildKpiMetricsGrid() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = (constraints.maxWidth - 10) / 2;
        return Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            SizedBox(
              width: cardWidth,
              child: _KpiStatCard(
                title: 'TOTAL MONITORED',
                value: '${controller.totalMonitored} Fleets',
                textColor: Colors.white,
                borderColor: kCardBorder,
                icon: Icons.directions_bus_rounded,
                iconColor: Colors.white70,
              ),
            ),
            SizedBox(
              width: cardWidth,
              child: _KpiStatCard(
                title: 'ONLINE DEVICES',
                value: '${controller.onlineDevices} Systems',
                textColor: kEmeraldText,
                borderColor: const Color(0x3310B981),
                icon: Icons.check_circle_rounded,
                iconColor: kEmerald,
              ),
            ),
            SizedBox(
              width: cardWidth,
              child: _KpiStatCard(
                title: 'WITH ISSUES',
                value: '${controller.brokenWithIssues} Issues',
                textColor: kAmberText,
                borderColor: const Color(0x33F59E0B),
                icon: Icons.warning_amber_rounded,
                iconColor: kAmber,
              ),
            ),
            SizedBox(
              width: cardWidth,
              child: _KpiStatCard(
                title: 'OFFLINE / FAULTS',
                value: '${controller.offlineDevices} Offline',
                textColor: kRedText,
                borderColor: const Color(0x33EF4444),
                icon: Icons.error_outline_rounded,
                iconColor: kRed,
              ),
            ),
          ],
        );
      },
    );
  }

  // =====================================================================
  // Filter Tabs (All / Healthy / Warnings / Critical)
  // =====================================================================
  Widget _buildFilterTabs() {
    return Obx(() {
      final current = controller.activeFilter.value;
      final tabs = [
        {'label': 'All', 'count': controller.totalMonitored},
        {'label': 'Healthy', 'count': controller.healthyVehiclesCount},
        {'label': 'Warnings', 'count': controller.warningVehiclesCount},
        {'label': 'Critical / Offline', 'count': controller.criticalVehiclesCount},
      ];

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: tabs.map((tab) {
            final label = tab['label'] as String;
            final count = tab['count'] as int;
            final isSelected = current == label;

            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: InkWell(
                onTap: () => controller.setFilter(label),
                borderRadius: BorderRadius.circular(10),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.white : kCardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? Colors.white : kCardBorder,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          color: isSelected ? Colors.black : Colors.white70,
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFE4E4E7) : const Color(0xFF27272A),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$count',
                          style: TextStyle(
                            color: isSelected ? Colors.black87 : Colors.white70,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  // =====================================================================
  // Search Bar + View Mode Switcher
  // =====================================================================
  Widget _buildSearchAndToggleRow() {
    return Row(
      children: [
        // Search field
        Expanded(
          child: Container(
            height: 42,
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(11),
              border: Border.all(color: kCardBorder),
            ),
            child: TextField(
              onChanged: controller.onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              cursorColor: kPurple,
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 11),
                hintText: 'Search by Device ID, Bus or Depot...',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 12),
                prefixIcon: Icon(Icons.search_rounded, color: Colors.white38, size: 19),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        // View mode toggle
        Obx(
          () => InkWell(
            onTap: controller.toggleViewMode,
            borderRadius: BorderRadius.circular(10),
            child: Container(
              height: 42,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kCardBorder),
              ),
              child: Row(
                children: [
                  Icon(
                    controller.viewMode.value == 'card'
                        ? Icons.view_agenda_outlined
                        : Icons.table_rows_outlined,
                    color: kPurple,
                    size: 18,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    controller.viewMode.value == 'card' ? 'Card' : 'Table',
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // =====================================================================
  // Vehicle Hardware List / Slivers
  // =====================================================================
  Widget _buildVehicleHardwareList() {
    return Obx(() {
      final vehicles = controller.filteredVehicles;

      if (vehicles.isEmpty) {
        return SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
            child: Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: kCardBg,
                      shape: BoxShape.circle,
                      border: Border.all(color: kCardBorder),
                    ),
                    child: const Icon(Icons.search_off_rounded, color: Colors.white38, size: 32),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'No Fleet Hardware Found',
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'No vehicles or edge units match the current search query or filter criteria.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: controller.clearFilters,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: kPurple),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Reset All Filters', style: TextStyle(color: kPurple, fontSize: 12)),
                  ),
                ],
              ),
            ),
          ),
        );
      }

      final isCardView = controller.viewMode.value == 'card';

      return SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final vehicle = vehicles[index];
              final device = controller.getDeviceForVehicle(vehicle);

              if (isCardView) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _VehicleHardwareCard(
                    vehicle: vehicle,
                    device: device,
                    gpsStatus: controller.getGpsStatus(vehicle),
                    displayStatus: controller.getDisplayStatus(device, vehicle),
                    netStatus: controller.getNetworkStatus(device, vehicle),
                    hwHealth: controller.getHardwareHealth(device),
                    onRunDiagnostics: () => controller.onRunDiagnostics(vehicle, device),
                    onTroubleshoot: () => controller.onTroubleshoot(vehicle, device),
                  ),
                );
              } else {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _VehicleHardwareTableRow(
                    vehicle: vehicle,
                    device: device,
                    gpsStatus: controller.getGpsStatus(vehicle),
                    displayStatus: controller.getDisplayStatus(device, vehicle),
                    netStatus: controller.getNetworkStatus(device, vehicle),
                    hwHealth: controller.getHardwareHealth(device),
                    onRunDiagnostics: () => controller.onRunDiagnostics(vehicle, device),
                    onTroubleshoot: () => controller.onTroubleshoot(vehicle, device),
                  ),
                );
              }
            },
            childCount: vehicles.length,
          ),
        ),
      );
    });
  }

  // =====================================================================
  // Footer (Last Updated & Refresh)
  // =====================================================================
  Widget _buildFooter() {
    return Obx(
      () => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Last updated: ${controller.lastUpdatedText}',
            style: const TextStyle(color: Colors.white38, fontSize: 11),
          ),
          InkWell(
            onTap: controller.onRefresh,
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.refresh_rounded, color: kPurple, size: 14),
                SizedBox(width: 4),
                Text(
                  'Refresh',
                  style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// KPI Stat Card Widget
// =====================================================================
class _KpiStatCard extends StatelessWidget {
  final String title;
  final String value;
  final Color textColor;
  final Color borderColor;
  final IconData icon;
  final Color iconColor;

  const _KpiStatCard({
    required this.title,
    required this.value,
    required this.textColor,
    required this.borderColor,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: HardwareStatusView.kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white38,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
              Icon(icon, color: iconColor, size: 14),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: textColor,
              fontSize: 16,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.3,
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Subsystem Pill Widget (Matching Admin Panel getSubsystemPill)
// =====================================================================
class _SubsystemPill extends StatelessWidget {
  final String status;

  const _SubsystemPill({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    Color dot;

    final st = status.trim();

    if (st == 'Online' ||
        st == 'Good Signal' ||
        st.startsWith('Connected') ||
        st == 'Healthy') {
      bg = HardwareStatusView.kEmeraldBg;
      text = HardwareStatusView.kEmeraldText;
      dot = HardwareStatusView.kEmerald;
    } else if (st == 'Not Installed' || st == '—' || st.isEmpty) {
      bg = HardwareStatusView.kSlateBg;
      text = HardwareStatusView.kSlateText;
      dot = HardwareStatusView.kSlate;
    } else if (st == 'Maintenance' ||
        st == 'Weak Signal' ||
        st.contains('Fallback') ||
        st.contains('Degraded') ||
        st.contains('High Temp')) {
      bg = HardwareStatusView.kAmberBg;
      text = HardwareStatusView.kAmberText;
      dot = HardwareStatusView.kAmber;
    } else {
      bg = HardwareStatusView.kRedBg;
      text = HardwareStatusView.kRedText;
      dot = HardwareStatusView.kRed;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: dot.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5.5,
            height: 5.5,
            decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
          ),
          const SizedBox(width: 4.5),
          Flexible(
            child: Text(
              st.isEmpty ? '—' : st,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: text, fontSize: 10.5, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Vehicle Hardware Card (Card View)
// =====================================================================
class _VehicleHardwareCard extends StatelessWidget {
  final VehicleItemModel vehicle;
  final EdgeDeviceModel? device;
  final String gpsStatus;
  final String displayStatus;
  final String netStatus;
  final String hwHealth;
  final VoidCallback onRunDiagnostics;
  final VoidCallback onTroubleshoot;

  const _VehicleHardwareCard({
    required this.vehicle,
    required this.device,
    required this.gpsStatus,
    required this.displayStatus,
    required this.netStatus,
    required this.hwHealth,
    required this.onRunDiagnostics,
    required this.onTroubleshoot,
  });

  @override
  Widget build(BuildContext context) {
    final depotText = vehicle.depotName ?? vehicle.depotId?.toString() ?? 'Main Depot';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: HardwareStatusView.kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: HardwareStatusView.kCardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vehicle Header Info
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.directions_bus_rounded, color: HardwareStatusView.kPurple, size: 16),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            vehicle.registrationNumber,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${vehicle.vehicleType} · $depotText',
                      style: const TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                  ],
                ),
              ),
              _SubsystemPill(status: hwHealth),
            ],
          ),
          const SizedBox(height: 12),

          // 4 Subsystems Telemetry Grid
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1B26),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              children: [
                _buildTelemetryRow(
                  label: 'GPS Telematics',
                  subLabel: vehicle.gpsDeviceId ?? vehicle.vin,
                  pill: _SubsystemPill(status: gpsStatus),
                ),
                const Divider(height: 14, color: Color(0x0FFFFFFF)),
                _buildTelemetryRow(
                  label: 'Display Screen',
                  subLabel: device?.displayId ?? 'No Display',
                  pill: _SubsystemPill(status: displayStatus),
                ),
                const Divider(height: 14, color: Color(0x0FFFFFFF)),
                _buildTelemetryRow(
                  label: 'Network',
                  subLabel: device?.simNetwork ?? 'Cellular',
                  pill: _SubsystemPill(status: netStatus),
                ),
                const Divider(height: 14, color: Color(0x0FFFFFFF)),
                _buildTelemetryRow(
                  label: 'Hardware Health',
                  subLabel: device?.status.toUpperCase() ?? 'UNLINKED',
                  pill: _SubsystemPill(status: hwHealth),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Action Buttons matching Admin Panel
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onRunDiagnostics,
                  icon: const Icon(Icons.bolt_rounded, size: 14, color: Colors.white),
                  label: const Text(
                    'Run Diagnostics',
                    style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF27273A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: onTroubleshoot,
                icon: const Icon(Icons.build_outlined, size: 13, color: Color(0xFF60A5FA)),
                label: const Text(
                  'Troubleshoot',
                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFF60A5FA)),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0x3360A5FA)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryRow({
    required String label,
    required String? subLabel,
    required Widget pill,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
              ),
              if (subLabel != null && subLabel.isNotEmpty && subLabel != '—')
                Text(
                  subLabel,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontFamily: 'monospace'),
                ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        pill,
      ],
    );
  }
}

// =====================================================================
// Vehicle Hardware Table Row (Compact View)
// =====================================================================
class _VehicleHardwareTableRow extends StatelessWidget {
  final VehicleItemModel vehicle;
  final EdgeDeviceModel? device;
  final String gpsStatus;
  final String displayStatus;
  final String netStatus;
  final String hwHealth;
  final VoidCallback onRunDiagnostics;
  final VoidCallback onTroubleshoot;

  const _VehicleHardwareTableRow({
    required this.vehicle,
    required this.device,
    required this.gpsStatus,
    required this.displayStatus,
    required this.netStatus,
    required this.hwHealth,
    required this.onRunDiagnostics,
    required this.onTroubleshoot,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: HardwareStatusView.kCardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: HardwareStatusView.kCardBorder),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.directions_bus_rounded, color: HardwareStatusView.kPurple, size: 14),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        vehicle.registrationNumber,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _SubsystemPill(status: hwHealth),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  _SubsystemPill(status: gpsStatus),
                  const SizedBox(width: 6),
                  _SubsystemPill(status: displayStatus),
                ],
              ),
              Row(
                children: [
                  InkWell(
                    onTap: onRunDiagnostics,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF27273A),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('Test', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(width: 6),
                  InkWell(
                    onTap: onTroubleshoot,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0x2660A5FA),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('Fix', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
