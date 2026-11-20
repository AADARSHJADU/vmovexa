import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../routes/app_routes.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
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
  final RxString orgName = '—'.obs;
  final RxString badgeId = '—'.obs;
  final RxBool isOnDuty = false.obs;
  final RxBool isUpdatingDuty = false.obs;
  final RxBool isDocumentsVerified = true.obs;

  // ---------------- Notification bell ----------------
  final RxInt notificationCount = 0.obs;

  // ---------------- Active Route / Cockpit ----------------
  final Rx<DriverActiveRouteData?> activeRouteData = Rx<DriverActiveRouteData?>(null);
  final RxString routeName = 'No Route Assigned'.obs;
  final RxString routeFrom = '--'.obs;
  final RxString routeTo = '--'.obs;
  final RxString busNumber = 'Not Assigned'.obs;
  final RxString vehicleType = '—'.obs;
  final RxString shiftTypeLabel = ''.obs;
  final RxString statusLabel = ''.obs;

  final RxString departureTime = '--:--'.obs;
  final RxString departureLocation = '--'.obs;

  final RxString nextStopName = '--'.obs;
  final RxString nextStopEta = '--'.obs;

  final RxString endOfRouteTime = '--:--'.obs;
  final RxString endOfRouteLocation = '--'.obs;

  bool get hasActiveRoute {
    final a = activeRouteData.value;
    if (a != null) {
      if (a.routeName != null && a.routeName!.isNotEmpty) return true;
      if (a.routeNumber != null && a.routeNumber!.isNotEmpty) return true;
      if (a.origin != null && a.origin!.isNotEmpty) return true;
    }
    return routeName.value != 'No Route Assigned' && routeName.value.isNotEmpty;
  }

  // ---------------- Shift Schedule & Timetable (Latest shifts) ----------------
  final RxList<DriverShiftItem> shiftSchedules = <DriverShiftItem>[].obs;

  // ---------------- Legacy schedule & notifications (kept for model compatibility) ----------------
  final RxList<ScheduleEntry> schedule = <ScheduleEntry>[].obs;
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
      if (profile.organization != null && profile.organization!.name != null) {
        orgName.value = profile.organization!.name!;
      }
      if (profile.id != null) {
        badgeId.value = 'DRV-${profile.id}';
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

      // 1. Map to Shift Schedule strip (latest 5 shifts)
      if (data.schedules.isNotEmpty) {
        shiftSchedules.assignAll(data.schedules.take(5));
      } else if (data.upcomingTrips.isNotEmpty) {
        final mapped = data.upcomingTrips.map((t) {
          final isComp = t.status == 'completed';
          final isTransit = t.status == 'in_progress';

          String sTime = t.scheduledDeparture ?? '--:--';
          if (sTime.contains('T')) {
            try {
              final parsed = DateTime.parse(sTime).toLocal();
              final hour12 = parsed.hour % 12 == 0 ? 12 : parsed.hour % 12;
              final minute = parsed.minute.toString().padLeft(2, '0');
              final period = parsed.hour >= 12 ? 'PM' : 'AM';
              sTime = '$hour12:$minute $period';
            } catch (_) {}
          }

          return DriverShiftItem(
            id: t.id,
            routeNumber: routeName.value,
            busNumber: busNumber.value,
            shiftTypeLabel: data.shift?.shiftType,
            startTime: sTime,
            endTime: data.shift?.endTime ?? '--:--',
            date: data.date ?? 'Today',
            startDepot: t.fromStop ?? 'Depot',
            endDepot: t.toStop ?? 'Terminus',
            status: t.status ?? 'Scheduled',
            isCompleted: isComp,
            isInTransit: isTransit,
          );
        }).toList();
        shiftSchedules.assignAll(mapped.take(5));
      } else if (data.assignedRoute != null) {
        shiftSchedules.assignAll([
          DriverShiftItem(
            id: 'today_1',
            routeNumber: data.assignedRoute?.routeNumber ?? 'ROUTE',
            routeName: data.assignedRoute?.name,
            busNumber: busNumber.value,
            shiftTypeLabel: data.shift?.shiftType,
            startTime: data.shift?.startTime ?? '--:--',
            endTime: data.shift?.endTime ?? '--:--',
            date: data.date ?? 'Today',
            startDepot: data.assignedRoute?.fromStop ?? 'Depot',
            endDepot: data.assignedRoute?.toStop ?? 'Terminus',
            status: isOnDuty.value ? 'In Transit' : 'Scheduled',
            isCompleted: false,
            isInTransit: isOnDuty.value,
          ),
        ]);
      } else {
        shiftSchedules.clear();
      }

      // 2. Active route fallbacks if needed
      if (data.assignedRoute != null) {
        final r = data.assignedRoute!;
        if (routeName.value == 'No Route Assigned' || routeName.value.isEmpty) {
          routeName.value = r.name ?? (r.routeNumber != null ? 'Route ${r.routeNumber}' : 'Assigned Route');
          routeFrom.value = r.fromStop ?? '--';
          routeTo.value = r.toStop ?? '--';
          departureLocation.value = r.fromStop ?? '--';
          endOfRouteLocation.value = r.toStop ?? '--';
        }
      }

      if (data.shift != null) {
        if (departureTime.value == '--:--') {
          departureTime.value = data.shift!.startTime ?? '--:--';
        }
        if (endOfRouteTime.value == '--:--') {
          endOfRouteTime.value = data.shift!.endTime ?? '--:--';
        }
        if (data.shift!.shiftType != null) {
          shiftTypeLabel.value = data.shift!.shiftType!;
        }
      }
    } else {
      shiftSchedules.clear();
    }
  }

  Future<void> _fetchActiveRoute() async {
    final response = await _driverService.getActiveRoute();
    if (response.success && response.data != null) {
      final active = response.data!;
      activeRouteData.value = active;
      if (active.routeName != null || active.route != null || active.origin != null) {
        final name = active.routeName ?? active.route?.name ?? 'Assigned Route';
        final num = active.routeNumber ?? active.route?.routeNumber;
        routeName.value = (num != null && !name.contains(num)) ? '$num - $name' : name;
        if (active.origin != null) routeFrom.value = active.origin!;
        if (active.destination != null) routeTo.value = active.destination!;
        if (active.departureTime != null) departureTime.value = active.departureTime!;
        if (active.endTime != null) endOfRouteTime.value = active.endTime!;
        if (active.busNumber != null) busNumber.value = active.busNumber!;
        if (active.vehicleType != null) vehicleType.value = active.vehicleType!;
        if (active.nextStop != null) nextStopName.value = active.nextStop!;
        if (active.nextStopEta != null) nextStopEta.value = active.nextStopEta!;
        if (active.status != null) statusLabel.value = active.status!;

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
          'duty_status_updated'.tr,
          isOnDuty.value ? 'on_duty'.tr : 'off_duty'.tr,
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 2),
        );
      } else {
        Get.snackbar(
          'error'.tr,
          response.message ?? 'update_failed'.tr,
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.redAccent,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
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
        title: 'my_routes_trips',
        subtitle: 'live_corridor_cockpit',
        icon: 'assets/icons/bus.svg',
        color: const Color(0xFF1C68FD),
        tabIndex: 1,
        route: Routes.MY_ROUTE,
        requiresVerification: true,
      ),
      DriverQuickAction(
        title: 'shift_timetables',
        subtitle: 'seven_day_roster',
        icon: 'assets/icons/calendar.svg',
        color: const Color(0xFF3F7BF5),
        tabIndex: 2,
        route: Routes.DRIVER_SCHEDULE,
        requiresVerification: true,
      ),
      DriverQuickAction(
        title: 'kyc_documents',
        subtitle: 'license_compliance',
        icon: 'assets/icons/advertiser_ic/layers.svg',
        color: const Color(0xFFB042FF),
        route: Routes.DRIVER_DOCUMENT,
        requiresVerification: false,
      ),
      DriverQuickAction(
        title: 'sos_report',
        subtitle: 'sos_roadside_log',
        icon: 'assets/icons/advertiser_ic/speaker.svg',
        color: const Color(0xFFFF4D9E),
        route: Routes.DRIVER_REPORT_INCIDENT,
        requiresVerification: false,
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

  void onReportIncidentTap() {
    Get.toNamed(Routes.DRIVER_REPORT_INCIDENT);
  }

  void onViewRouteDetails() {
    if (!isDocumentsVerified.value) {
      Get.snackbar(
        'access_restricted'.tr,
        'locked_pending_approval'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2A1C0E),
        colorText: Colors.amber,
      );
      return;
    }
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().setNavIndex(1);
    } else {
      Get.toNamed(Routes.MY_ROUTE);
    }
  }

  void onViewFullSchedule() {
    if (!isDocumentsVerified.value) {
      Get.snackbar(
        'access_restricted'.tr,
        'locked_pending_approval'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2A1C0E),
        colorText: Colors.amber,
      );
      return;
    }
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().setNavIndex(2);
    } else {
      Get.toNamed(Routes.DRIVER_SCHEDULE);
    }
  }

  void onShiftItemTap(DriverShiftItem shift) {
    if (!isDocumentsVerified.value) {
      Get.snackbar(
        'access_restricted'.tr,
        'locked_pending_approval'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2A1C0E),
        colorText: Colors.amber,
      );
      return;
    }
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().setNavIndex(1);
    } else {
      Get.toNamed(Routes.MY_ROUTE, arguments: {'slotId': shift.slotId});
    }
  }

  void onUploadDocumentsTap() {
    Get.toNamed(Routes.DRIVER_DOCUMENT);
  }

  void onViewAllNotifications() {
    Get.toNamed(Routes.DRIVER_NOTIFICATION);
  }

  void onQuickActionTap(DriverQuickAction action) {
    if (action.requiresVerification && !isDocumentsVerified.value) {
      Get.snackbar(
        'access_restricted'.tr,
        'locked_pending_approval'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2A1C0E),
        colorText: Colors.amber,
      );
      return;
    }

    if (action.tabIndex != null && Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().setNavIndex(action.tabIndex!);
      return;
    }

    if (action.route != null) {
      Get.toNamed(action.route!);
    }
  }

  Future<void> onRefresh() async {
    await fetchDashboardData();
  }
}
