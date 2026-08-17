import 'package:get/get.dart';

import '../model/hardware_status_device_model.dart';

class HardwareStatusController extends GetxController {
  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Search ----------------
  final RxString searchQuery = ''.obs;

  // ---------------- Filter ----------------
  final Rx<DeviceOnlineState?> activeOnlineFilter = Rx<DeviceOnlineState?>(null);
  final RxBool issuesOnlyFilter = false.obs;

  // ---------------- Devices ----------------
  final RxList<HardwareStatusDevice> allDevices = <HardwareStatusDevice>[].obs;

  List<HardwareStatusDevice> get filteredDevices {
    var list = allDevices.toList();

    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((d) =>
          d.deviceId.toLowerCase().contains(q) ||
          d.vehicleNumber.toLowerCase().contains(q) ||
          d.depotLocation.toLowerCase().contains(q)).toList();
    }

    if (activeOnlineFilter.value != null) {
      list = list.where((d) => d.onlineState == activeOnlineFilter.value).toList();
    }

    if (issuesOnlyFilter.value) {
      list = list.where((d) => d.hasIssue).toList();
    }

    return list;
  }

  // ---------------- Summary counts (based on full list) ----------------
  int get totalDevices => allDevices.length;
  int get onlineCount => allDevices.where((d) => d.onlineState == DeviceOnlineState.online).length;
  int get offlineCount => allDevices.where((d) => d.onlineState == DeviceOnlineState.offline).length;
  int get issuesCount => allDevices.where((d) => d.hasIssue).length;

  // ---------------- Last updated ----------------
  final Rxn<DateTime> lastUpdatedDateTime = Rxn<DateTime>();

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get lastUpdatedText {
    final dt = lastUpdatedDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year} \u2022 ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  @override
  void onInit() {
    super.onInit();
    fetchDevices();
  }

  Future<void> fetchDevices() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      allDevices.assignAll(_mockDevices());
      lastUpdatedDateTime.value = DateTime(2025, 5, 14, 10, 30);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      await Future.delayed(const Duration(milliseconds: 700));
      allDevices.assignAll(_mockDevices());
      lastUpdatedDateTime.value = DateTime.now();
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------- Search / filter actions ----------------
  void onSearchChanged(String value) => searchQuery.value = value;

  void onFilterOnline(DeviceOnlineState? state) => activeOnlineFilter.value = state;
  void toggleIssuesOnlyFilter() => issuesOnlyFilter.value = !issuesOnlyFilter.value;
  void clearFilters() {
    activeOnlineFilter.value = null;
    issuesOnlyFilter.value = false;
  }

  void onOpenFilterSheet() {
    // Hook this up to a bottom sheet / dialog calling onFilterOnline() / toggleIssuesOnlyFilter()
  }

  // ---------------- Navigation ----------------
  void onDeviceTap(HardwareStatusDevice device) {
    Get.toNamed('/device-diagnostics', arguments: {
      'deviceId': device.deviceId,
      'deviceType': 'Display Device',
      'vehicleNumber': device.vehicleNumber,
    });
  }

  void onBackPressed() => Get.back();

  // ---------------- Mock data ----------------
  List<HardwareStatusDevice> _mockDevices() {
    return [
      HardwareStatusDevice(
        deviceId: 'VMX-DISP-001',
        vehicleNumber: 'Bus MH12 AB 1234',
        depotLocation: 'Mumbai Central Depot',
        onlineState: DeviceOnlineState.online,
        gpsStatus: GpsSubStatus.active,
        displayStatus: DisplaySubStatus.normal,
        hardwareStatus: HardwareSubStatus.healthy,
      ),
      HardwareStatusDevice(
        deviceId: 'VMX-DISP-002',
        vehicleNumber: 'Bus MH12 AC 5678',
        depotLocation: 'Mumbai Central Depot',
        onlineState: DeviceOnlineState.online,
        gpsStatus: GpsSubStatus.active,
        displayStatus: DisplaySubStatus.normal,
        hardwareStatus: HardwareSubStatus.healthy,
      ),
      HardwareStatusDevice(
        deviceId: 'VMX-DISP-003',
        vehicleNumber: 'Bus MH12 AD 9101',
        depotLocation: 'Mumbai West Depot',
        onlineState: DeviceOnlineState.offline,
        gpsStatus: GpsSubStatus.noSignal,
        displayStatus: DisplaySubStatus.normal,
        hardwareStatus: HardwareSubStatus.issue,
      ),
      HardwareStatusDevice(
        deviceId: 'VMX-DISP-004',
        vehicleNumber: 'Bus MH12 AE 2468',
        depotLocation: 'Mumbai West Depot',
        onlineState: DeviceOnlineState.online,
        gpsStatus: GpsSubStatus.active,
        displayStatus: DisplaySubStatus.normal,
        hardwareStatus: HardwareSubStatus.healthy,
      ),
      HardwareStatusDevice(
        deviceId: 'VMX-DISP-005',
        vehicleNumber: 'Bus MH12 AF 1357',
        depotLocation: 'Mumbai Central Depot',
        onlineState: DeviceOnlineState.offline,
        gpsStatus: GpsSubStatus.noSignal,
        displayStatus: DisplaySubStatus.noOutput,
        hardwareStatus: HardwareSubStatus.issue,
      ),
      HardwareStatusDevice(
        deviceId: 'VMX-DISP-006',
        vehicleNumber: 'Bus MH12 AG 7890',
        depotLocation: 'Andheri Depot',
        onlineState: DeviceOnlineState.online,
        gpsStatus: GpsSubStatus.active,
        displayStatus: DisplaySubStatus.normal,
        hardwareStatus: HardwareSubStatus.healthy,
      ),
    ];
  }
}
