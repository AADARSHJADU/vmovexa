import 'package:get/get.dart';

import '../../../../../routes/app_routes.dart';
import '../model/display_device_model.dart';

class DisplayDevicesController extends GetxController {
  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Search ----------------
  final RxString searchQuery = ''.obs;

  // ---------------- Filter ----------------
  final Rx<DeviceStatus?> activeStatusFilter = Rx<DeviceStatus?>(null);

  // ---------------- Master list (all devices) ----------------
  final RxList<DisplayDevice> allDevices = <DisplayDevice>[].obs;

  // ---------------- Pagination ----------------
  final RxInt currentPage = 1.obs;
  final int pageSize = 6;

  // Filtered list (search + status filter applied), derived getter
  List<DisplayDevice> get filteredDevices {
    var list = allDevices.toList();

    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((d) {
        return d.id.toLowerCase().contains(q) ||
            d.vehicleNumber.toLowerCase().contains(q) ||
            d.location.toLowerCase().contains(q);
      }).toList();
    }

    if (activeStatusFilter.value != null) {
      list = list.where((d) => d.status == activeStatusFilter.value).toList();
    }

    return list;
  }

  // Devices shown on the current page
  List<DisplayDevice> get pagedDevices {
    final list = filteredDevices;
    final start = (currentPage.value - 1) * pageSize;
    if (start >= list.length) return [];
    final end = (start + pageSize).clamp(0, list.length);
    return list.sublist(start, end);
  }

  int get totalPages {
    final total = filteredDevices.length;
    if (total == 0) return 1;
    return (total / pageSize).ceil();
  }

  int get showingFrom {
    if (filteredDevices.isEmpty) return 0;
    return (currentPage.value - 1) * pageSize + 1;
  }

  int get showingTo {
    final end = currentPage.value * pageSize;
    return end > filteredDevices.length ? filteredDevices.length : end;
  }

  // ---------------- Summary counts (based on full list, not filtered) ----------------
  int get totalDevices => allDevices.length;
  int get onlineCount =>
      allDevices.where((d) => d.status == DeviceStatus.online).length;
  int get offlineCount =>
      allDevices.where((d) => d.status == DeviceStatus.offline).length;
  int get maintenanceCount =>
      allDevices.where((d) => d.status == DeviceStatus.maintenance).length;

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
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    currentPage.value = 1;
    await fetchDevices();
  }

  // ---------------- Search / filter actions ----------------
  void onSearchChanged(String value) {
    searchQuery.value = value;
    currentPage.value = 1;
  }

  void onFilterSelected(DeviceStatus? status) {
    activeStatusFilter.value = status;
    currentPage.value = 1;
  }

  void clearFilter() {
    activeStatusFilter.value = null;
    currentPage.value = 1;
  }

  // ---------------- Pagination actions ----------------
  void goToPage(int page) {
    if (page < 1 || page > totalPages) return;
    currentPage.value = page;
  }

  void nextPage() => goToPage(currentPage.value + 1);
  void previousPage() => goToPage(currentPage.value - 1);

  // ---------------- Navigation ----------------
  void onDeviceTap(DisplayDevice device) {
    Get.toNamed('/display-device-detail', arguments: device.id);
  }

  void onRegisterNewDevice() {
    Get.toNamed(Routes.REGISTER_DISPLAY_DEVICE,);
  }

  void onOpenFilterSheet() {
    // Hook this up to a bottom sheet / dialog that calls onFilterSelected()
  }

  // ---------------- Mock data ----------------
  List<DisplayDevice> _mockDevices() {
    return [
      DisplayDevice(
        id: 'VMX-DP-1001',
        vehicleNumber: 'Bus MH12 AB 1234',
        location: 'Mumbai Central Depot',
        status: DeviceStatus.online,
        lastSeen: 'Just now',
      ),
      DisplayDevice(
        id: 'VMX-DP-1002',
        vehicleNumber: 'Bus MH12 AB 5678',
        location: 'Andheri Depot',
        status: DeviceStatus.offline,
        lastSeen: '15 min ago',
      ),
      DisplayDevice(
        id: 'VMX-DP-1003',
        vehicleNumber: 'Bus MH12 AB 9101',
        location: 'Thane Depot',
        status: DeviceStatus.maintenance,
        lastSeen: '2 hours ago',
      ),
      DisplayDevice(
        id: 'VMX-DP-1004',
        vehicleNumber: 'Bus MH12 AB 1122',
        location: 'Borivali Depot',
        status: DeviceStatus.online,
        lastSeen: 'Just now',
      ),
      DisplayDevice(
        id: 'VMX-DP-1005',
        vehicleNumber: 'Bus MH12 AB 3344',
        location: 'Kurla Depot',
        status: DeviceStatus.offline,
        lastSeen: '1 hour ago',
      ),
      DisplayDevice(
        id: 'VMX-DP-1006',
        vehicleNumber: 'Bus MH12 AB 7788',
        location: 'Navi Mumbai Depot',
        status: DeviceStatus.online,
        lastSeen: 'Just now',
      ),
      DisplayDevice(
        id: 'VMX-DP-1007',
        vehicleNumber: 'Bus MH12 AB 4455',
        location: 'Dadar Depot',
        status: DeviceStatus.online,
        lastSeen: 'Just now',
      ),
      DisplayDevice(
        id: 'VMX-DP-1008',
        vehicleNumber: 'Bus MH12 AB 6677',
        location: 'Vashi Depot',
        status: DeviceStatus.offline,
        lastSeen: '30 min ago',
      ),
    ];
  }
}
