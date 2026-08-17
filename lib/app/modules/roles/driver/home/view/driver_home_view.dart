import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../technician/hardware_configuration/views/shared_widgets.dart' as DriverDashboardView;
import '../controller/driver_home_controller.dart';
import '../model/driver_dashboard_models.dart';

class DriverHomeView extends GetView<DriverHomeController> {
  const DriverHomeView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.schedule.isEmpty
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
                      _buildGreeting(),
                      const SizedBox(height: 18),
                      _buildTodaysRouteCard(),
                      const SizedBox(height: 16),
                      _buildScheduleCard(),
                      const SizedBox(height: 16),
                      _buildNotificationsCard(),
                      const SizedBox(height: 16),
                      _buildQuickActionsCard(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header (menu + bell) ----------------
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: controller.onMenuTap,
          child: const Icon(Icons.menu, color: Colors.white70),
        ),
        GestureDetector(
          onTap: controller.onNotificationBellTap,
          child: Obx(
            () => Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.notifications_none_rounded, color: Colors.white70, size: 24),
                if (controller.notificationCount.value > 0)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle),
                      alignment: Alignment.center,
                      child: Text(
                        '${controller.notificationCount.value}',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Greeting ----------------
  Widget _buildGreeting() {
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Good Morning, ${controller.driverName.value}!',
            style: const TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('Have a safe and smooth journey.', style: TextStyle(color: Colors.white54, fontSize: 12.5)),
        ],
      ),
    );
  }

  // ---------------- Today's Route ----------------
  Widget _buildTodaysRouteCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.directions_bus_filled_outlined, color: kPurple, size: 17),
                  SizedBox(width: 8),
                  Text("Today's Route", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
              Obx(
                () => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: kGreen.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 6, height: 6, decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle)),
                      const SizedBox(width: 5),
                      Text(controller.isOnDuty.value ? 'On Duty' : 'Off Duty', style: const TextStyle(color: kGreen, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.directions_bus, color: kPurple, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Obx(
                  () => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(controller.routeName.value, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text('${controller.routeFrom.value} \u2192 ${controller.routeTo.value}', style: const TextStyle(color: Colors.white54, fontSize: 11.5)),
                      const SizedBox(height: 4),
                      Text(controller.busNumber.value, style: const TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: Colors.white.withOpacity(0.07), height: 1),
          const SizedBox(height: 14),
          Obx(
            () => Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _RouteInfoColumn(
                    label: 'Departure',
                    value: controller.departureTime.value,
                    subValue: controller.departureLocation.value,
                  ),
                ),
                Expanded(
                  child: _RouteInfoColumn(
                    label: 'Next Stop',
                    value: controller.nextStopName.value,
                    subValue: controller.nextStopEta.value,
                    subValueColor: kPurple,
                  ),
                ),
                Expanded(
                  child: _RouteInfoColumn(
                    label: 'End of Route',
                    value: controller.endOfRouteTime.value,
                    subValue: controller.endOfRouteLocation.value,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: controller.onViewRouteDetails,
            child: Container(
              width: double.infinity,
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [kBlue, kPurple]),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map_outlined, color: Colors.white, size: 17),
                  SizedBox(width: 8),
                  Text('View Route Details', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                  SizedBox(width: 4),
                  Icon(Icons.chevron_right, color: Colors.white, size: 17),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Today's Schedule ----------------
  Widget _buildScheduleCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.calendar_today_outlined, color: kPurple, size: 15),
                  SizedBox(width: 8),
                  Text("Today's Schedule", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
              GestureDetector(
                onTap: controller.onViewFullSchedule,
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('View Full Schedule', style: TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                    Icon(Icons.chevron_right, color: kPurple, size: 15),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Obx(
            () => Column(
              children: List.generate(controller.schedule.length, (index) {
                final entry = controller.schedule[index];
                final isLast = index == controller.schedule.length - 1;
                return _ScheduleRow(entry: entry, isLast: isLast);
              }),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Operational Notifications ----------------
  Widget _buildNotificationsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.campaign_outlined, color: kPurple, size: 16),
                  SizedBox(width: 8),
                  Text('Operational Notifications', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
              GestureDetector(
                onTap: controller.onViewAllNotifications,
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('View All', style: TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                    Icon(Icons.chevron_right, color: kPurple, size: 15),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Obx(
            () => Column(
              children: controller.notifications
                  .map((n) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _NotificationRow(notification: n),
                      ))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Quick Actions ----------------
  Widget _buildQuickActionsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Quick Actions', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 14),
          Obx(
            () => Row(
              children: controller.quickActions
                  .map(
                    (action) => Expanded(
                      child: _QuickActionColumn(
                        action: action,
                        onTap: () => controller.onQuickActionTap(action),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Route info column (Departure / Next Stop / End of Route)
// =====================================================================
class _RouteInfoColumn extends StatelessWidget {
  final String label;
  final String value;
  final String subValue;
  final Color? subValueColor;

  const _RouteInfoColumn({required this.label, required this.value, required this.subValue, this.subValueColor});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 2),
        Text(
          subValue,
          style: TextStyle(color: subValueColor ?? Colors.white38, fontSize: 10, fontWeight: subValueColor != null ? FontWeight.w600 : FontWeight.w400),
        ),
      ],
    );
  }
}

// =====================================================================
// Schedule timeline row
// =====================================================================
class _ScheduleRow extends StatelessWidget {
  final ScheduleEntry entry;
  final bool isLast;

  const _ScheduleRow({required this.entry, required this.isLast});

  static const Color kPurple = DriverDashboardView.kPurple;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 9,
                height: 9,
                decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle),
              ),
              if (!isLast) Expanded(child: Container(width: 1.5, color: Colors.white12)),
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 66,
                    child: Text(entry.time, style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600)),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(entry.routeName, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text(entry.routeDescription, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: entry.status.color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      entry.status.label,
                      style: TextStyle(color: entry.status.color, fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Operational notification row
// =====================================================================
class _NotificationRow extends StatelessWidget {
  final OperationalNotification notification;

  const _NotificationRow({required this.notification});

  static const Color kPurple = DriverDashboardView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
          child: Icon(notification.icon, color: kPurple, size: 15),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(notification.message, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(notification.subMessage, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(notification.timeAgo, style: const TextStyle(color: Colors.white38, fontSize: 9.5)),
            if (notification.isUnread) ...[
              const SizedBox(height: 4),
              Container(width: 6, height: 6, decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle)),
            ],
          ],
        ),
      ],
    );
  }
}

// =====================================================================
// Quick action column (icon + label, optional badge)
// =====================================================================
class _QuickActionColumn extends StatelessWidget {
  final DriverQuickAction action;
  final VoidCallback onTap;

  const _QuickActionColumn({required this.action, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                padding: const EdgeInsets.all(13),
                decoration: BoxDecoration(color: action.color.withOpacity(0.15), borderRadius: BorderRadius.circular(14)),
                child: Icon(action.icon, color: action.color, size: 20),
              ),
              if (action.badgeCount != null && action.badgeCount! > 0)
                Positioned(
                  right: -4,
                  top: -4,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    constraints: const BoxConstraints(minWidth: 15, minHeight: 15),
                    decoration: const BoxDecoration(color: Color(0xFFFF4D4D), shape: BoxShape.circle),
                    alignment: Alignment.center,
                    child: Text(
                      '${action.badgeCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            action.title,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
