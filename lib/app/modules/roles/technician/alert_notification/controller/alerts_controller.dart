import 'package:get/get.dart';

import '../model/alert_item_model.dart';

class AlertsController extends GetxController {
  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;
  final RxBool isLoadingMore = false.obs;

  // ---------------- Search ----------------
  final RxString searchQuery = ''.obs;

  // ---------------- Filter ----------------
  final Rx<AlertSeverity?> activeSeverityFilter = Rx<AlertSeverity?>(null);

  // ---------------- Alerts ----------------
  final RxList<AlertItem> allAlerts = <AlertItem>[].obs;

  // Pagination — how many of the filtered list are currently visible
  final RxInt visibleCount = 5.obs;
  static const int pageSize = 5;

  List<AlertItem> get filteredAlerts {
    var list = allAlerts.toList();

    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((a) =>
          a.title.toLowerCase().contains(q) ||
          a.message.toLowerCase().contains(q) ||
          a.deviceId.toLowerCase().contains(q) ||
          a.vehicleNumber.toLowerCase().contains(q)).toList();
    }

    if (activeSeverityFilter.value != null) {
      list = list.where((a) => a.severity == activeSeverityFilter.value).toList();
    }

    return list;
  }

  List<AlertItem> get visibleAlerts {
    final list = filteredAlerts;
    return list.take(visibleCount.value).toList();
  }

  bool get canLoadMore => visibleCount.value < filteredAlerts.length;

  // ---------------- Summary counts (based on full unfiltered list) ----------------
  int get criticalCount => allAlerts.where((a) => a.severity == AlertSeverity.critical).length;
  int get warningCount => allAlerts.where((a) => a.severity == AlertSeverity.warning).length;
  int get infoCount => allAlerts.where((a) => a.severity == AlertSeverity.info).length;
  int get resolvedCount => allAlerts.where((a) => a.severity == AlertSeverity.resolved).length;

  @override
  void onInit() {
    super.onInit();
    fetchAlerts();
  }

  Future<void> fetchAlerts() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      allAlerts.assignAll(_mockAlerts());
      visibleCount.value = pageSize;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    visibleCount.value = pageSize;
    await fetchAlerts();
  }

  // ---------------- Search / filter actions ----------------
  void onSearchChanged(String value) {
    searchQuery.value = value;
    visibleCount.value = pageSize;
  }

  void onFilterSeverity(AlertSeverity? severity) {
    activeSeverityFilter.value = severity;
    visibleCount.value = pageSize;
  }

  void clearFilter() {
    activeSeverityFilter.value = null;
    visibleCount.value = pageSize;
  }

  void onOpenFilterSheet() {
    // Hook this up to a bottom sheet / dialog calling onFilterSeverity()
  }

  // ---------------- Load more ----------------
  Future<void> onLoadMore() async {
    if (!canLoadMore || isLoadingMore.value) return;
    isLoadingMore.value = true;
    try {
      // TODO: replace with real paginated API call
      await Future.delayed(const Duration(milliseconds: 500));
      visibleCount.value += pageSize;
    } finally {
      isLoadingMore.value = false;
    }
  }

  // ---------------- Read state ----------------
  void onAlertTap(AlertItem alert) {
    alert.isRead = true;
    allAlerts.refresh();
    Get.toNamed('/device-diagnostics', arguments: {
      'deviceId': alert.deviceId,
      'deviceType': 'Display Device',
      'vehicleNumber': alert.vehicleNumber,
    });
  }

  void onMarkAllAsRead() {
    for (final alert in allAlerts) {
      alert.isRead = true;
    }
    allAlerts.refresh();
  }

  void onBackPressed() => Get.back();

  // ---------------- Timestamp formatting ----------------
  String formatTimestamp(DateTime dt) {
    final now = DateTime.now();
    final isToday = dt.year == now.year && dt.month == now.month && dt.day == now.day;
    final yesterday = now.subtract(const Duration(days: 1));
    final isYesterday = dt.year == yesterday.year && dt.month == yesterday.month && dt.day == yesterday.day;

    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    final time = '${hour12.toString().padLeft(2, '0')}:$minute $period';

    if (isToday) return time;
    if (isYesterday) return 'Yesterday $time';
    return '${dt.day}/${dt.month}/${dt.year} $time';
  }

  // ---------------- Mock data ----------------
  List<AlertItem> _mockAlerts() {
    final now = DateTime.now();
    return [
      AlertItem(
        id: 'alert_1',
        title: 'Display Offline',
        message: 'Bus MH12 AD 9101 is offline.',
        deviceId: 'VMX-DISP-003',
        vehicleNumber: 'Bus MH12 AD 9101',
        depotLocation: 'Mumbai West Depot',
        timestamp: DateTime(now.year, now.month, now.day, 10, 30),
        severity: AlertSeverity.critical,
        isRead: false,
      ),
      AlertItem(
        id: 'alert_2',
        title: 'GPS Signal Lost',
        message: 'GPS signal lost for Bus MH12 AF 1357.',
        deviceId: 'VMX-DISP-005',
        vehicleNumber: 'Bus MH12 AF 1357',
        depotLocation: 'Mumbai Central Depot',
        timestamp: DateTime(now.year, now.month, now.day, 10, 15),
        severity: AlertSeverity.warning,
        isRead: false,
      ),
      AlertItem(
        id: 'alert_3',
        title: 'Low Storage',
        message: 'Storage is below 10% for Bus MH12 AE 2468.',
        deviceId: 'VMX-DISP-004',
        vehicleNumber: 'Bus MH12 AE 2468',
        depotLocation: 'Mumbai West Depot',
        timestamp: DateTime(now.year, now.month, now.day, 9, 45),
        severity: AlertSeverity.warning,
        isRead: false,
      ),
      AlertItem(
        id: 'alert_4',
        title: 'Configuration Updated',
        message: 'Hardware configuration updated for Bus MH12 AB 1234.',
        deviceId: 'VMX-DISP-001',
        vehicleNumber: 'Bus MH12 AB 1234',
        depotLocation: 'Mumbai Central Depot',
        timestamp: DateTime(now.year, now.month, now.day, 9, 20),
        severity: AlertSeverity.info,
        isRead: false,
      ),
      AlertItem(
        id: 'alert_5',
        title: 'Diagnostics Completed',
        message: 'Diagnostics completed for Bus MH12 AC 5678.',
        deviceId: 'VMX-DISP-002',
        vehicleNumber: 'Bus MH12 AC 5678',
        depotLocation: 'Andheri Depot',
        timestamp: DateTime(now.year, now.month, now.day - 1, 18, 30),
        severity: AlertSeverity.resolved,
        isRead: false,
      ),
      AlertItem(
        id: 'alert_6',
        title: 'Device Restarted',
        message: 'Bus MH12 AG 7890 restarted successfully.',
        deviceId: 'VMX-DISP-006',
        vehicleNumber: 'Bus MH12 AG 7890',
        depotLocation: 'Andheri Depot',
        timestamp: DateTime(now.year, now.month, now.day - 1, 15, 10),
        severity: AlertSeverity.resolved,
        isRead: true,
      ),
      AlertItem(
        id: 'alert_7',
        title: 'Power Fluctuation',
        message: 'Power fluctuation detected for Bus MH12 AD 9101.',
        deviceId: 'VMX-DISP-003',
        vehicleNumber: 'Bus MH12 AD 9101',
        depotLocation: 'Mumbai West Depot',
        timestamp: DateTime(now.year, now.month, now.day - 1, 12, 5),
        severity: AlertSeverity.warning,
        isRead: true,
      ),
      AlertItem(
        id: 'alert_8',
        title: 'Firmware Updated',
        message: 'Firmware updated to v1.2.0 for Bus MH12 AB 1234.',
        deviceId: 'VMX-DISP-001',
        vehicleNumber: 'Bus MH12 AB 1234',
        depotLocation: 'Mumbai Central Depot',
        timestamp: DateTime(now.year, now.month, now.day - 2, 8, 0),
        severity: AlertSeverity.info,
        isRead: true,
      ),
    ];
  }
}
