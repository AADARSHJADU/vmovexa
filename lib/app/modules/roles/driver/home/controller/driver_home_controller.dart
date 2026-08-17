import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../model/driver_dashboard_models.dart';

class DriverHomeController extends GetxController {
  // ---------------- Driver identity ----------------
  final RxString driverName = 'Raj'.obs;
  final RxBool isOnDuty = true.obs;

  // ---------------- Notification bell ----------------
  final RxInt notificationCount = 3.obs;

  // ---------------- Today's Route ----------------
  final RxString routeName = 'Route MH12A'.obs;
  final RxString routeFrom = 'Andheri Depot'.obs;
  final RxString routeTo = 'Colaba Depot'.obs;
  final RxString busNumber = 'Bus MH12 AB 1234'.obs;

  final RxString departureTime = '06:30 AM'.obs;
  final RxString departureLocation = 'Andheri Depot'.obs;

  final RxString nextStopName = 'JVLR Signal'.obs;
  final RxString nextStopEta = 'ETA 06:45 AM'.obs;

  final RxString endOfRouteTime = '08:15 PM'.obs;
  final RxString endOfRouteLocation = 'Colaba Depot'.obs;

  // ---------------- Today's Schedule ----------------
  final RxList<ScheduleEntry> schedule = <ScheduleEntry>[].obs;

  // ---------------- Operational Notifications ----------------
  final RxList<OperationalNotification> notifications = <OperationalNotification>[].obs;

  // ---------------- Quick Actions ----------------
  final RxList<DriverQuickAction> quickActions = <DriverQuickAction>[].obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository calls
      _loadSchedule();
      _loadNotifications();
      _loadQuickActions();
    } finally {
      isLoading.value = false;
    }
  }

  void _loadSchedule() {
    schedule.assignAll([
      ScheduleEntry(
        time: '06:30 AM',
        routeName: 'Route MH12A',
        routeDescription: 'Andheri Depot \u2192 Colaba Depot',
        status: ScheduleStatus.upcoming,
      ),
      ScheduleEntry(
        time: '09:00 PM',
        routeName: 'Route MH12A (Return)',
        routeDescription: 'Colaba Depot \u2192 Andheri Depot',
        status: ScheduleStatus.pending,
      ),
    ]);
  }

  void _loadNotifications() {
    notifications.assignAll([
      OperationalNotification(
        id: 'notif_1',
        message: 'Traffic congestion on Western Express Highway.',
        subMessage: 'Expect minor delays.',
        timeAgo: '10 min ago',
        icon: Icons.campaign_outlined,
      ),
      OperationalNotification(
        id: 'notif_2',
        message: 'Diversion on SV Road due to road work.',
        subMessage: 'Follow alternate route via Link Road.',
        timeAgo: '25 min ago',
        icon: Icons.alt_route_outlined,
      ),
      OperationalNotification(
        id: 'notif_3',
        message: 'Vehicle inspection completed successfully.',
        subMessage: 'You are good to go.',
        timeAgo: '1 hr ago',
        icon: Icons.fact_check_outlined,
      ),
    ]);
  }

  void _loadQuickActions() {
    quickActions.assignAll([
      DriverQuickAction(
        title: 'My Route',
        icon: Icons.map_outlined,
        color: const Color(0xFFB042FF),
        route: '/my-route',
      ),
      DriverQuickAction(
        title: 'Schedule',
        icon: Icons.calendar_today_outlined,
        color: const Color(0xFF3F7BF5),
        route: '/schedule',
      ),
      DriverQuickAction(
        title: 'Notifications',
        icon: Icons.notifications_outlined,
        color: const Color(0xFFB042FF),
        route: '/notifications',
        badgeCount: notificationCount.value,
      ),
      DriverQuickAction(
        title: 'Report Incident',
        icon: Icons.local_activity_outlined,
        color: const Color(0xFFFF4D9E),
        route: '/report-incident',
      ),
    ]);
  }

  // ---------------- Actions ----------------
  void onMenuTap() {
    Get.back(); // or open a drawer, depending on your shell
  }

  void onNotificationBellTap() {
    Get.toNamed('/notifications');
  }

  void onViewRouteDetails() {
    Get.toNamed('/my-route');
  }

  void onViewFullSchedule() {
    Get.toNamed('/schedule');
  }

  void onViewAllNotifications() {
    Get.toNamed('/notifications');
  }

  void onQuickActionTap(DriverQuickAction action) {
    Get.toNamed(action.route);
  }

  Future<void> onRefresh() async {
    await fetchDashboardData();
  }
}
