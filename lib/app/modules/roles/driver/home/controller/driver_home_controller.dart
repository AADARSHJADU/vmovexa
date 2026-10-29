import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import '../../driver_dashboard/controller/driver_dashboard_controller.dart';
import '../model/driver_dashboard_models.dart';

class DriverHomeController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Driver identity ----------------
  final RxString driverName = 'Driver'.obs;
  final RxString avatarUrl = ''.obs;
  final RxBool isOnDuty = false.obs;
  final RxBool isUpdatingDuty = false.obs;
  final RxBool isDocumentsVerified = true.obs;

  // ---------------- Notification bell ----------------
  final RxInt notificationCount = 0.obs;

  // ---------------- Today's Route ----------------
  final RxString routeName = 'No Route Assigned'.obs;
  final RxString routeFrom = '--'.obs;
  final RxString routeTo = '--'.obs;
  final RxString busNumber = 'Not Assigned'.obs;

  final RxString departureTime = '--:--'.obs;
  final RxString departureLocation = '--'.obs;

  final RxString nextStopName = '--'.obs;
  final RxString nextStopEta = '--'.obs;

  final RxString endOfRouteTime = '--:--'.obs;
  final RxString endOfRouteLocation = '--'.obs;

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
    _loadQuickActions();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _fetchProfile(),
        _fetchSchedule(),
        _fetchActiveRoute(),
        _fetchNotifications(),
      ]);
    } catch (e) {
      debugPrint('DriverHomeController fetch error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _fetchProfile() async {
    if (Get.isRegistered<StorageService>()) {
      final cachedUser = StorageService.to.getUser();
      if (cachedUser != null) {
        if (cachedUser.avatarUrl != null && cachedUser.avatarUrl!.isNotEmpty) {
          avatarUrl.value = cachedUser.avatarUrl!;
        }
        if (cachedUser.name != null && cachedUser.name!.isNotEmpty) {
          driverName.value = cachedUser.name!;
        }
      }
    }

    final response = await _driverService.getProfile();
    if (response.success && response.data != null) {
      final profile = response.data!;
      driverName.value = profile.name ?? driverName.value;
      isOnDuty.value = profile.isOnDuty;
      isDocumentsVerified.value = profile.documentsVerified ?? true;
      if (profile.assignedVehicle != null) {
        busNumber.value = profile.assignedVehicle!.displayName;
      }
      if (profile.avatarUrl != null && profile.avatarUrl!.isNotEmpty) {
        avatarUrl.value = profile.avatarUrl!;
      }
    }

    try {
      if (Get.isRegistered<AuthService>()) {
        final meRes = await AuthService.to.getMe();
        if (meRes.success && meRes.data != null) {
          if (meRes.data!.avatarUrl != null && meRes.data!.avatarUrl!.isNotEmpty) {
            avatarUrl.value = meRes.data!.avatarUrl!;
          }
          if (meRes.data!.name != null && meRes.data!.name!.isNotEmpty) {
            driverName.value = meRes.data!.name!;
          }
        }
      }
    } catch (_) {}
  }

  Future<void> _fetchSchedule() async {
    final response = await _driverService.getTodaySchedule();
    if (response.success && response.data != null) {
      final data = response.data!;
      if (data.assignedRoute != null) {
        final r = data.assignedRoute!;
        routeName.value = r.name ?? (r.routeNumber != null ? 'Route ${r.routeNumber}' : 'Assigned Route');
        routeFrom.value = r.fromStop ?? '--';
        routeTo.value = r.toStop ?? '--';
        departureLocation.value = r.fromStop ?? '--';
        endOfRouteLocation.value = r.toStop ?? '--';
      }

      if (data.shift != null) {
        departureTime.value = data.shift!.startTime ?? '--:--';
        endOfRouteTime.value = data.shift!.endTime ?? '--:--';
      }

      if (data.upcomingTrips.isNotEmpty) {
        final entries = data.upcomingTrips.map((trip) {
          ScheduleStatus status = ScheduleStatus.upcoming;
          if (trip.status == 'in_progress') status = ScheduleStatus.inProgress;
          if (trip.status == 'pending') status = ScheduleStatus.pending;

          String timeLabel = trip.scheduledDeparture ?? '--:--';
          if (timeLabel.contains('T')) {
            try {
              final parsed = DateTime.parse(timeLabel).toLocal();
              final hour12 = parsed.hour % 12 == 0 ? 12 : parsed.hour % 12;
              final minute = parsed.minute.toString().padLeft(2, '0');
              final period = parsed.hour >= 12 ? 'PM' : 'AM';
              timeLabel = '$hour12:$minute $period';
            } catch (_) {}
          }

          return ScheduleEntry(
            time: timeLabel,
            routeName: routeName.value,
            routeDescription: '${trip.fromStop ?? "Depot"} \u2192 ${trip.toStop ?? "Destination"}',
            status: status,
          );
        }).toList();
        schedule.assignAll(entries);
      } else if (data.assignedRoute != null) {
        schedule.assignAll([
          ScheduleEntry(
            time: departureTime.value,
            routeName: routeName.value,
            routeDescription: '${routeFrom.value} \u2192 ${routeTo.value}',
            status: isOnDuty.value ? ScheduleStatus.inProgress : ScheduleStatus.pending,
          ),
        ]);
      } else {
        schedule.clear();
      }
    } else {
      schedule.clear();
    }
  }

  Future<void> _fetchActiveRoute() async {
    final response = await _driverService.getActiveRoute();
    if (response.success && response.data != null) {
      final active = response.data!;
      if (active.routeName != null || active.route != null) {
        final name = active.routeName ?? active.route?.name ?? 'Assigned Route';
        final num = active.routeNumber ?? active.route?.routeNumber;
        routeName.value = (num != null && !name.contains(num)) ? '$num - $name' : name;
        if (active.origin != null) routeFrom.value = active.origin!;
        if (active.destination != null) routeTo.value = active.destination!;
        if (active.departureTime != null) departureTime.value = active.departureTime!;
        if (active.endTime != null) endOfRouteTime.value = active.endTime!;
        if (active.busNumber != null) busNumber.value = active.busNumber!;
        if (active.nextStop != null) nextStopName.value = active.nextStop!;
        if (active.nextStopEta != null) nextStopEta.value = 'ETA: ${active.nextStopEta!}';

        // Also update isOnDuty if activeTrip indicates in_progress
        if (active.rawStatus == 'in_progress') {
          isOnDuty.value = true;
        }
      }
    }
  }

  Future<void> _fetchNotifications() async {
    final response = await _driverService.getNotifications(page: 1, limit: 10);
    if (response.success && response.data != null && response.data!.isNotEmpty) {
      int unread = 0;
      final list = response.data!.map((item) {
        final isRead = item['is_read'] == true || item['read'] == true;
        if (!isRead) unread++;

        final type = (item['type'] ?? item['category'] ?? '').toString().toLowerCase();
        String iconPath = 'assets/icons/advertiser_ic/speaker.svg';
        if (type.contains('alert') || type.contains('warning')) {
          iconPath = 'assets/icons/advertiser_ic/speaker.svg';
        } else if (type.contains('calendar') || type.contains('schedule')) {
          iconPath = 'assets/icons/calendar.svg';
        }

        return OperationalNotification(
          id: item['id']?.toString() ?? '',
          message: item['title']?.toString() ?? item['message']?.toString() ?? 'Notification',
          subMessage: item['message']?.toString() ?? '',
          timeAgo: item['time_ago']?.toString() ?? 'Recently',
          icon: iconPath,
          isUnread: !isRead,
        );
      }).toList();

      notifications.assignAll(list);
      notificationCount.value = unread;
      _loadQuickActions();
    } else {
      notifications.clear();
      notificationCount.value = 0;
      _loadQuickActions();
    }
  }

  Future<void> toggleDutyStatus() async {
    if (isUpdatingDuty.value) return;
    isUpdatingDuty.value = true;
    final nextStatus = isOnDuty.value ? 'off_duty' : 'on_duty';
    try {
      final response = await _driverService.updateDutyStatus(status: nextStatus);
      if (response.success) {
        isOnDuty.value = (nextStatus == 'on_duty');
        Get.snackbar(
          'Duty Status Updated',
          'You are now ${isOnDuty.value ? "ON DUTY" : "OFF DUTY"}',
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 2),
        );
      } else {
        Get.snackbar(
          'Failed',
          response.message ?? 'Could not update duty status',
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.redAccent,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Error updating duty status: $e',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUpdatingDuty.value = false;
    }
  }

  void _loadQuickActions() {
    quickActions.assignAll([
      DriverQuickAction(
        title: 'My Route',
        icon: "assets/icons/live_location.svg",
        color: const Color(0xFFB042FF),
        route: Routes.MY_ROUTE,
      ),
      DriverQuickAction(
        title: 'Schedule',
        icon: "assets/icons/calendar.svg",
        color: const Color(0xFF3F7BF5),
        route: Routes.DRIVER_SCHEDULE,
      ),
      DriverQuickAction(
        title: 'Notifications',
        icon: "assets/icons/notification.svg",
        color: const Color(0xFFB042FF),
        route: Routes.DRIVER_NOTIFICATION,
        badgeCount: notificationCount.value,
      ),
      DriverQuickAction(
        title: 'Report Incident',
        icon: "assets/icons/advertiser_ic/layers.svg",
        color: const Color(0xFFFF4D9E),
        route: Routes.DRIVER_REPORT_INCIDENT,
      ),
    ]);
  }

  // ---------------- Actions ----------------
  void onMenuTap() {
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().openDrawer();
    }
  }

  void onNotificationBellTap() {
    Get.toNamed(Routes.DRIVER_NOTIFICATION);
  }

  void onViewRouteDetails() {
    Get.toNamed(Routes.MY_ROUTE);
  }

  void onViewFullSchedule() {
    Get.toNamed(Routes.DRIVER_SCHEDULE);
  }

  void onUploadDocumentsTap() {
    Get.toNamed(Routes.DRIVER_DOCUMENT);
  }

  void onViewAllNotifications() {
    Get.toNamed(Routes.DRIVER_NOTIFICATION);
  }

  void onQuickActionTap(DriverQuickAction action) {
    Get.toNamed(action.route);
  }

  Future<void> onRefresh() async {
    await fetchDashboardData();
  }
}
