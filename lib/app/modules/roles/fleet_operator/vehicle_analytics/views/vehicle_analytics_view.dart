import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import '../controllers/vehicle_analytics_controller.dart';

class VehicleAnalyticsView extends GetView<VehicleAnalyticsController> {
  const VehicleAnalyticsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar with Timeframe & Export Action
            _buildTopAppBar(),

            // Scrollable Content
            Expanded(
              child: RefreshIndicator(
                color: const Color(0xFF2563EB),
                backgroundColor: AppColors.cardBg,
                onRefresh: () => controller.fetchReportData(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Banner
                      _buildHeaderBanner(),
                      const SizedBox(height: 16),

                      // 4 Interactive Report Type Cards
                      _buildReportTypeSelectorCards(),
                      const SizedBox(height: 16),

                      // 4 Summary KPI Stat Strip
                      _buildSummaryKpiStrip(),
                      const SizedBox(height: 20),

                      // Visual Analytics Section: Donut Efficiency Gauge
                      _buildEfficiencyScoreCard(),
                      const SizedBox(height: 16),

                      // Weekly Gradient Bar Chart with Metric Switchers
                      _buildWeeklyBarChartCard(),
                      const SizedBox(height: 24),

                      // Dynamic Report Data Cards Header & Filters
                      _buildReportDataFilterBar(),
                      const SizedBox(height: 12),

                      // Dynamic Report List View
                      _buildDynamicReportList(),
                      const SizedBox(height: 60),
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

  // ==========================================
  // TOP APP BAR
  // ==========================================
  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const CustomBackButton(),
              const Text(
                'Reports & Analytics',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox()
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Timeframe dropdown
              Obx(() {
                return Container(
                  height: 34,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.timeframe.value,
                      dropdownColor: AppColors.cardBg,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      items: const [
                        DropdownMenuItem(value: 'today', child: Text('Today')),
                        DropdownMenuItem(value: 'week', child: Text('This Week')),
                        DropdownMenuItem(value: 'month', child: Text('This Month')),
                        DropdownMenuItem(value: 'quarter', child: Text('This Quarter')),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.timeframe.value = val;
                      },
                    ),
                  ),
                );
              }),
              const SizedBox(width: 8),
              // Export Button
              Obx(() {
                return SizedBox(
                  height: 34,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: controller.isExporting.value
                        ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 1.5))
                        : const Icon(Icons.file_download_outlined, color: Colors.white, size: 15),
                    label: const Text('Export CSV', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: controller.isExporting.value ? null : () => controller.exportReport(),
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // HEADER BANNER
  // ==========================================
  Widget _buildHeaderBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2563EB).withValues(alpha: 0.3), width: 1.2),
        gradient: LinearGradient(
          colors: [
            const Color(0xFF2563EB).withValues(alpha: 0.15),
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
              color: const Color(0xFF2563EB).withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.analytics_rounded, color: Color(0xFF38BDF8), size: 26),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    const Text(
                      'Live Telematics Engine',
                      style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                const Text(
                  'Reports & Fleet Telematics Analytics',
                  style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  'Real-time GPS telemetry, dispatch milestones, fuel/EV health, and driver roster metrics.',
                  style: TextStyle(color: Colors.grey.shade400, fontSize: 11, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 4 INTERACTIVE REPORT TYPE CARDS
  // ==========================================
  Widget _buildReportTypeSelectorCards() {
    return Obx(() {
      final activeDriversCount = controller.drivers
          .where((d) => d.status.toLowerCase() == 'active')
          .length;

      final reports = [
        {
          'id': 'vehicle',
          'title': 'Vehicle Telematics',
          'desc': 'Speed, active telemetry, GPS connectivity & models',
          'count': '${controller.totalVehiclesCount} Registered',
          'sub': '${controller.onRouteCount} Currently Active',
          'icon': Icons.directions_bus_rounded,
          'colors': [const Color(0xFF2563EB), const Color(0xFF4F46E5)],
        },
        {
          'id': 'driver',
          'title': 'Driver Rosters',
          'desc': 'Driver ratings, licenses, and shift assignment',
          'count': '${controller.drivers.length} Drivers',
          'sub': '$activeDriversCount Active On Roster',
          'icon': Icons.badge_outlined,
          'colors': [const Color(0xFF059669), const Color(0xFF0D9488)],
        },
        {
          'id': 'trip',
          'title': 'Trip & Dispatch',
          'desc': 'Corridor transit times, milestones, and routes',
          'count': '${controller.trips.length} Logged Trips',
          'sub': '${controller.activeTripsCount} Active Dispatches',
          'icon': Icons.explore_rounded,
          'colors': [const Color(0xFF7C3AED), const Color(0xFFDB2777)],
        },
        {
          'id': 'fuel',
          'title': 'Fuel & EV Health',
          'desc': 'Battery state-of-charge, regeneration & fuel usage',
          'count': '94% Fleet Health',
          'sub': 'Zero Hardware Faults',
          'icon': Icons.battery_charging_full_rounded,
          'colors': [const Color(0xFFD97706), const Color(0xFFEA580C)],
        },
      ];

      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.25,
        children: reports.map((r) {
          final id = r['id'] as String;
          final isSelected = controller.selectedReportType.value == id;
          final colors = r['colors'] as List<Color>;

          return GestureDetector(
            onTap: () => controller.selectedReportType.value = id,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? const Color(0xFF38BDF8) : AppColors.cardBorder,
                  width: isSelected ? 1.8 : 1.0,
                ),
                boxShadow: isSelected
                    ? [BoxShadow(color: const Color(0xFF38BDF8).withValues(alpha: 0.18), blurRadius: 8, offset: const Offset(0, 2))]
                    : [],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: colors),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(r['icon'] as IconData, color: Colors.white, size: 16),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF38BDF8).withValues(alpha: 0.15) : AppColors.background,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          isSelected ? 'ACTIVE' : 'SELECT',
                          style: TextStyle(
                            color: isSelected ? const Color(0xFF38BDF8) : Colors.grey.shade500,
                            fontSize: 8.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        r['title'] as String,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        r['desc'] as String,
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 9.5),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(r['count'] as String, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          Text(r['sub'] as String, style: const TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      Icon(Icons.chevron_right_rounded, size: 16, color: isSelected ? const Color(0xFF38BDF8) : Colors.grey),
                    ],
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      );
    });
  }

  // ==========================================
  // 4 SUMMARY KPI STRIP
  // ==========================================
  Widget _buildSummaryKpiStrip() {
    return Obx(() {
      return Row(
        children: [
          Expanded(
            child: _buildKpiBox(
              title: 'UTILIZATION',
              value: '${controller.fleetUtilizationRate}%',
              sub: '${controller.onRouteCount} on route',
              color: const Color(0xFF38BDF8),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildKpiBox(
              title: 'DISTANCE',
              value: '${controller.totalDistanceKm.toStringAsFixed(1)} km',
              sub: 'Transit routes',
              color: const Color(0xFF10B981),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildKpiBox(
              title: 'DISPATCHES',
              value: '${controller.trips.length}',
              sub: '${controller.activeTripsCount} active trips',
              color: const Color(0xFFA855F7),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildKpiBox(
              title: 'TELEMETRY',
              value: '${controller.telemetryUnitsOnline}',
              sub: 'Live MQTT Units',
              color: const Color(0xFFF59E0B),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildKpiBox({required String title, required String value, required String sub, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(sub, style: TextStyle(color: Colors.grey.shade500, fontSize: 8.5), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  // ==========================================
  // CHART 1: CIRCULAR FLEET EFFICIENCY SCORE GAUGE
  // ==========================================
  Widget _buildEfficiencyScoreCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'FLEET EFFICIENCY SCORE',
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
              Text(
                'Composite Telematics',
                style: TextStyle(color: Colors.grey, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Donut Gauge Canvas
          SizedBox(
            width: 150,
            height: 150,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  size: const Size(150, 150),
                  painter: _DonutEfficiencyPainter(scorePercentage: 0.94),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      '94%',
                      style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(width: 5, height: 5, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                        const SizedBox(width: 4),
                        const Text(
                          'OPTIMAL',
                          style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: AppColors.cardBorder, height: 1),
          const SizedBox(height: 12),
          // Sub-metrics
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildEfficiencySubItem('On-Time Dispatch', '98.2%', const Color(0xFF38BDF8)),
              _buildEfficiencySubItem('Ping Reliability', '99.8%', const Color(0xFF10B981)),
              _buildEfficiencySubItem('Average Speed', '45.0 km/h', const Color(0xFFA855F7)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEfficiencySubItem(String label, String val, Color valColor) {
    return Column(
      children: [
        Text(val, style: TextStyle(color: valColor, fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 9.5)),
      ],
    );
  }

  // ==========================================
  // CHART 2: WEEKLY GRADIENT BAR CHART (LIVE ENGINE)
  // ==========================================
  Widget _buildWeeklyBarChartCard() {
    return Obx(() {
      final points = controller.chartData;
      final maxVal = controller.maxChartValue;
      final selectedIdx = controller.selectedDayIndex.value;
      final selectedPoint = (selectedIdx >= 0 && selectedIdx < points.length) ? points[selectedIdx] : points.first;

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'WEEKLY PERFORMANCE TREND',
                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Tap any bar to inspect daily telematics telemetry',
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 10),
                    ),
                  ],
                ),

              ],
            ),
            const SizedBox(height: 5),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF2563EB).withValues(alpha: 0.4)),
              ),
              child: const Text(
                'Live Visualizer',
                style: TextStyle(color: Color(0xFF38BDF8), fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 14),

            // 4 Metric Filter Tabs
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildMetricTab('distance', 'Distance (km)'),
                  const SizedBox(width: 6),
                  _buildMetricTab('speed', 'Avg Speed'),
                  const SizedBox(width: 6),
                  _buildMetricTab('trips', 'Trips Count'),
                  const SizedBox(width: 6),
                  _buildMetricTab('efficiency', 'Efficiency (%)'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Active Selected Point Callout
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${selectedPoint.label} Telematics Reading:',
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                  ),
                  Text(
                    '${selectedPoint.value} ${selectedPoint.unit} ${selectedPoint.isPeak ? "(PEAK)" : ""}',
                    style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Vertical Gradient Bars Visualization
            SizedBox(
              height: 160,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(points.length, (i) {
                  final p = points[i];
                  final isSelected = selectedIdx == i;
                  final heightPct = (p.value / maxVal).clamp(0.15, 1.0);

                  return GestureDetector(
                    onTap: () => controller.selectedDayIndex.value = i,
                    child: Container(
                      width: 38,
                      color: Colors.transparent,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (p.isPeak)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1.5),
                              margin: const EdgeInsets.only(bottom: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('PEAK', style: TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.bold)),
                            )
                          else
                            const SizedBox(height: 14),

                          // The Bar
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            width: isSelected ? 30 : 26,
                            height: 100 * heightPct,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: p.gradientColors,
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                              ),
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                              border: isSelected ? Border.all(color: Colors.white, width: 1.5) : null,
                              boxShadow: isSelected
                                  ? [BoxShadow(color: p.gradientColors.last.withValues(alpha: 0.4), blurRadius: 10, offset: const Offset(0, -2))]
                                  : [],
                            ),
                            child: Align(
                              alignment: Alignment.topCenter,
                              child: Container(
                                height: 3,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            p.label,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.grey.shade400,
                              fontSize: 10,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildMetricTab(String key, String label) {
    final isSelected = controller.chartMetric.value == key;
    return GestureDetector(
      onTap: () => controller.chartMetric.value = key,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB) : AppColors.background,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? const Color(0xFF2563EB) : AppColors.cardBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey.shade400,
            fontSize: 10.5,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  // ==========================================
  // DYNAMIC REPORT TABLE / REGISTRY VIEW
  // ==========================================
  Widget _buildReportDataFilterBar() {
    return Obx(() {
      final repType = controller.selectedReportType.value;
      String title = 'Vehicle Telematics Registry';
      if (repType == 'driver') title = 'Driver Shift & Safety Roster';
      if (repType == 'trip') title = 'Trip Dispatch & Corridor Logs';
      if (repType == 'fuel') title = 'EV Battery & Telematics Health';

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
              Text(
                _getRecordCountText(),
                style: TextStyle(color: Colors.grey.shade400, fontSize: 10.5),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Filter Row
          Row(
            children: [
              // Fleet division filter
              Expanded(
                child: Container(
                  height: 34,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.selectedFleetId.value,
                      dropdownColor: AppColors.cardBg,
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      items: [
                        DropdownMenuItem(value: 'all', child: Text('All Divisions (${controller.fleets.length})')),
                        ...controller.fleets.map((f) => DropdownMenuItem(value: f.id.toString(), child: Text(f.name))),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.selectedFleetId.value = val;
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Status Filter
              Expanded(
                child: Container(
                  height: 34,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.selectedStatus.value,
                      dropdownColor: AppColors.cardBg,
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('All Statuses')),
                        DropdownMenuItem(value: 'on_route', child: Text('On Route / Active')),
                        DropdownMenuItem(value: 'in_depot', child: Text('In Depot')),
                        DropdownMenuItem(value: 'active', child: Text('Active')),
                        DropdownMenuItem(value: 'maintenance', child: Text('Maintenance')),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.selectedStatus.value = val;
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      );
    });
  }

  String _getRecordCountText() {
    switch (controller.selectedReportType.value) {
      case 'driver':
        return 'Showing ${controller.filteredDrivers.length} drivers';
      case 'trip':
        return 'Showing ${controller.filteredTrips.length} trips';
      case 'fuel':
        return 'Showing ${controller.filteredVehicles.length} units';
      case 'vehicle':
      default:
        return 'Showing ${controller.filteredVehicles.length} vehicles';
    }
  }

  Widget _buildDynamicReportList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(child: CircularProgressIndicator(color: Color(0xFF2563EB))),
        );
      }

      switch (controller.selectedReportType.value) {
        case 'driver':
          return _buildDriverReportList();
        case 'trip':
          return _buildTripReportList();
        case 'fuel':
          return _buildFuelReportList();
        case 'vehicle':
        default:
          return _buildVehicleReportList();
      }
    });
  }

  // 1. VEHICLE REPORT LIST
  Widget _buildVehicleReportList() {
    final list = controller.filteredVehicles;
    if (list.isEmpty) return _buildEmptyState('No vehicles match the selected filters.');

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final v = list[index];
        final isGpsOnline = v.gpsDeviceId != null && v.gpsDeviceId!.isNotEmpty;
        final isActive = v.status.toLowerCase() == 'on_route' || v.status.toLowerCase() == 'active';

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 18),
                      const SizedBox(width: 8),
                      Text(
                        v.registrationNumber,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isActive
                          ? const Color(0xFF10B981).withValues(alpha: 0.15)
                          : Colors.grey.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      v.status.toUpperCase(),
                      style: TextStyle(
                        color: isActive
                            ? const Color(0xFF10B981)
                            : Colors.grey.shade400,
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${v.make} ${v.model} • Year: ${v.year ?? 2024} • Depot: ${v.depotName ?? "Central Depot"}',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.wifi, size: 13, color: isGpsOnline ? const Color(0xFF10B981) : Colors.redAccent),
                      const SizedBox(width: 4),
                      Text(
                        isGpsOnline ? 'GPS Online' : 'GPS Offline',
                        style: TextStyle(color: isGpsOnline ? const Color(0xFF10B981) : Colors.redAccent, fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  Text(
                    'Speed: ${v.speedKmh?.toStringAsFixed(0) ?? "0"} km/h',
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // 2. DRIVER REPORT LIST
  Widget _buildDriverReportList() {
    final list = controller.filteredDrivers;
    if (list.isEmpty) return _buildEmptyState('No drivers match the selected filters.');

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final d = list[index];

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: Color(0xFF10B981), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d.name, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(
                      'Lic: ${d.licenseNumber.isNotEmpty ? d.licenseNumber : d.badgeId} • Bus: ${d.assignedVehicleReg ?? "None"}',
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 10.5),
                    ),
                    const SizedBox(height: 4),
                    Text('Status: ${d.status.toUpperCase()}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              if (d.phone.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.phone, color: Color(0xFF10B981), size: 18),
                  onPressed: () async {
                    final uri = Uri.parse('tel:${d.phone}');
                    if (await canLaunchUrl(uri)) await launchUrl(uri);
                  },
                ),
            ],
          ),
        );
      },
    );
  }

  // 3. TRIP REPORT LIST
  Widget _buildTripReportList() {
    final list = controller.filteredTrips;
    if (list.isEmpty) return _buildEmptyState('No trips logged for the selected fleet.');

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final t = list[index];
        final isCompleted = t.status.toLowerCase() == 'completed';

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    t.code.isNotEmpty ? t.code : 'Trip #${t.id}',
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? const Color(0xFF10B981).withValues(alpha: 0.15)
                          : const Color(0xFF7C3AED).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      t.status.toUpperCase(),
                      style: TextStyle(
                        color: isCompleted
                            ? const Color(0xFF10B981)
                            : const Color(0xFFC084FC),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Route: ${t.route?.name ?? "Transit Corridor"} • Vehicle: ${t.vehicle?.busNumber ?? t.vehicleId ?? "Assigned"}',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${t.origin} ➔ ${t.destination}',
                    style: TextStyle(color: Colors.grey.shade300, fontSize: 10.5),
                  ),
                  Text(
                    '${t.distanceKm.toStringAsFixed(1)} km',
                    style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // 4. FUEL / EV REPORT LIST
  Widget _buildFuelReportList() {
    final list = controller.filteredVehicles;
    if (list.isEmpty) return _buildEmptyState('No fleet units available for fuel tracking.');

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final v = list[index];
        final battery = v.batterySocPct ?? 90;

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(v.registrationNumber, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  Text('${v.fuelType.toUpperCase()} (EV)', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 10.5, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Battery SOC / Energy Health:', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                  Text('$battery%', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: (battery / 100).clamp(0.0, 1.0),
                  backgroundColor: AppColors.background,
                  color: battery > 20 ? const Color(0xFF10B981) : Colors.redAccent,
                  minHeight: 6,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Efficiency: 94%', style: TextStyle(color: Colors.grey, fontSize: 10.5)),
                  Text('Telematics: Optimal', style: TextStyle(color: Color(0xFF10B981), fontSize: 10.5, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(String msg) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Center(
        child: Text(msg, style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
      ),
    );
  }
}

// ==========================================
// CUSTOM DONUT EFFICIENCY PAINTER
// ==========================================
class _DonutEfficiencyPainter extends CustomPainter {
  final double scorePercentage;

  _DonutEfficiencyPainter({required this.scorePercentage});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - 10;
    const strokeWidth = 14.0;

    // Track Background Circle
    final bgPaint = Paint()
      ..color = const Color(0xFF1C1F2E)
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(center, radius, bgPaint);

    // Progress Arc with Gradient
    final rect = Rect.fromCircle(center: center, radius: radius);
    const gradient = SweepGradient(
      startAngle: -pi / 2,
      endAngle: 3 * pi / 2,
      colors: [
        Color(0xFF3B82F6),
        Color(0xFF6366F1),
        Color(0xFF10B981),
      ],
    );

    final progressPaint = Paint()
      ..shader = gradient.createShader(rect)
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    const startAngle = -pi / 2;
    final sweepAngle = 2 * pi * scorePercentage;

    canvas.drawArc(rect, startAngle, sweepAngle, false, progressPaint);
  }

  @override
  bool shouldRepaint(covariant _DonutEfficiencyPainter oldDelegate) {
    return oldDelegate.scorePercentage != scorePercentage;
  }
}
