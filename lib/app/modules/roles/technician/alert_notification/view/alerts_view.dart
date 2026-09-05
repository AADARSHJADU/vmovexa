import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';

import '../../hardware_configuration/views/shared_widgets.dart';
import '../controller/alerts_controller.dart';
import '../model/alert_item_model.dart';

class AlertsView extends GetView<AlertsController> {
  const AlertsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.allAlerts.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildStatsGrid(),
                      const SizedBox(height: 16),
                      _buildSearchBar(),
                      const SizedBox(height: 18),
                      _buildRecentAlertsHeader(),
                      const SizedBox(height: 10),
                      _buildAlertsList(),
                      const SizedBox(height: 14),
                      _buildLoadMoreButton(),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Alerts', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
              SizedBox(height: 3),
              Text('View and manage system alerts.', style: TextStyle(color: Colors.white, fontSize: 12.5)),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onOpenFilterSheet,
          child: Container(
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorder),
            ),
            child: SvgPicture.asset(
              'assets/icons/filter.svg',
              width: 18,
              height: 18,
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- 4-stat grid (Critical / Warning / Info / Resolved) ----------------
  Widget _buildStatsGrid() {
    return Obx(
      () => Row(
        children: [
          Expanded(
            child: _StatCard(
              svgPath: AlertSeverity.critical.svgPath,
              color: const Color(0xFFFF4D4D),
              count: '${controller.criticalCount}',
              label: 'Critical',
              onTap: () => controller.onFilterSeverity(AlertSeverity.critical),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatCard(
              svgPath: AlertSeverity.warning.svgPath,
              color: const Color(0xFFFFA726),
              count: '${controller.warningCount}',
              label: 'Warning',
              onTap: () => controller.onFilterSeverity(AlertSeverity.warning),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatCard(
              svgPath: AlertSeverity.info.svgPath,
              color: const Color(0xFF3F7BF5),
              count: '${controller.infoCount}',
              label: 'Info',
              onTap: () => controller.onFilterSeverity(AlertSeverity.info),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatCard(
              svgPath: AlertSeverity.resolved.svgPath,
              color: const Color(0xFF2ECC71),
              count: '${controller.resolvedCount}',
              label: 'Resolved',
              onTap: () => controller.onFilterSeverity(AlertSeverity.resolved),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Search bar ----------------
  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: TextField(
        onChanged: controller.onSearchChanged,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: const InputDecoration(
          border: InputBorder.none,
          isDense: true,
          contentPadding: EdgeInsets.symmetric(vertical: 14),
          hintText: 'Search alerts by device, type or message',
          hintStyle: TextStyle(color: Colors.white38, fontSize: 12.5),
          prefixIcon: Icon(Icons.search, color: Colors.white38, size: 20),
        ),
      ),
    );
  }

  // ---------------- "Recent Alerts" + Mark all as read ----------------
  Widget _buildRecentAlertsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text('Recent Alerts', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
        GestureDetector(
          onTap: controller.onMarkAllAsRead,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Mark all as read', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(width: 6),
              SvgPicture.asset(
                'assets/icons/new_fleet-op-ic/mynaui_mail.svg',
                width: 15,
                height: 15,
                colorFilter: const ColorFilter.mode(kPurple, BlendMode.srcIn),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Alerts list ----------------
  Widget _buildAlertsList() {
    return Obx(() {
      final alerts = controller.visibleAlerts;
      if (alerts.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(child: Text('No alerts found', style: TextStyle(color: Colors.white38, fontSize: 13))),
        );
      }
      return Column(
        children: alerts
            .map(
              (alert) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _AlertCard(
                  alert: alert,
                  timeText: controller.formatTimestamp(alert.timestamp),
                  onTap: () => controller.onAlertTap(alert),
                ),
              ),
            )
            .toList(),
      );
    });
  }

  // ---------------- Load More button ----------------
  Widget _buildLoadMoreButton() {
    return Obx(() {
      if (!controller.canLoadMore) return const SizedBox();
      return GestureDetector(
        onTap: controller.isLoadingMore.value ? null : controller.onLoadMore,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: kBorder),
          ),
          alignment: Alignment.center,
          child: controller.isLoadingMore.value
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(color: kPurple, strokeWidth: 2),
                )
              : const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.refresh, color: kPurple, size: 16),
                    SizedBox(width: 6),
                    Text('Load More', style: TextStyle(color: kPurple, fontSize: 13, fontWeight: FontWeight.w600)),
                  ],
                ),
        ),
      );
    });
  }
}

// =====================================================================
// Stat card (Critical / Warning / Info / Resolved)
// =====================================================================
class _StatCard extends StatelessWidget {
  final String svgPath;
  final Color color;
  final String count;
  final String label;
  final VoidCallback onTap;

  const _StatCard({
    required this.svgPath,
    required this.color,
    required this.count,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 6),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                SvgPicture.asset(
                  svgPath,
                  width: 18,
                  height: 18,
                  colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
                ),
                const SizedBox(width: 6),
                Text(count, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w800)),
              ],
            ),
            const SizedBox(height: 2),
            Center(child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 10))),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Alert card
// =====================================================================
class _AlertCard extends StatelessWidget {
  final AlertItem alert;
  final String timeText;
  final VoidCallback onTap;

  const _AlertCard({required this.alert, required this.timeText, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AlertsView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AlertsView.kBorder),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: alert.severity.color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: SvgPicture.asset(
                alert.severity.svgPath,
                width: 18,
                height: 18,
                colorFilter: ColorFilter.mode(alert.severity.color, BlendMode.srcIn),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          alert.title,
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                        ),
                      ),
                      Text(timeText, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                      const SizedBox(width: 6),
                      if (!alert.isRead)
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(color: Color(0xFFB042FF), shape: BoxShape.circle),
                        ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(alert.message, style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      SvgPicture.asset(
                        'assets/icons/tv.svg',
                        width: 12,
                        height: 12,
                        colorFilter: const ColorFilter.mode(AppColors.indicatorActive, BlendMode.srcIn),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${alert.deviceId} \u2022 ${alert.depotLocation}',
                        style: const TextStyle(color: AppColors.indicatorActive, fontSize: 10.5),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
