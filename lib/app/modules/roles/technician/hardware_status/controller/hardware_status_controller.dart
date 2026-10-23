import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/edge_device_model.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/technician_service.dart';
import '../../../../../routes/app_routes.dart';
import '../model/hardware_status_device_model.dart';

class HardwareStatusController extends GetxController {
  TechnicianService get _techService => TechnicianService.to;

  // ---------------- Loading & Refreshing ----------------
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  // ---------------- Data Lists ----------------
  final RxList<VehicleItemModel> vehicleList = <VehicleItemModel>[].obs;
  final RxList<EdgeDeviceModel> deviceList = <EdgeDeviceModel>[].obs;
  final RxMap<String, EdgeDeviceModel> vehicleStatusMap = <String, EdgeDeviceModel>{}.obs;

  // ---------------- Search & Filter ----------------
  final RxString searchQuery = ''.obs;
  final RxString activeFilter = 'All'.obs; // 'All', 'Healthy', 'Warnings', 'Critical / Offline'
  final RxString viewMode = 'card'.obs; // 'card' or 'table'

  // Backward compatibility with previous models if needed
  final Rx<DeviceOnlineState?> activeOnlineFilter = Rx<DeviceOnlineState?>(null);
  final RxBool issuesOnlyFilter = false.obs;
  final RxList<HardwareStatusDevice> allDevices = <HardwareStatusDevice>[].obs;

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

  // ---------------- KPIs (Matching TechHardwareStatusPage.jsx) ----------------
  int get totalMonitored => vehicleList.length;

  int get onlineDevices => deviceList
      .where((d) => d.status.trim().toLowerCase() == 'online')
      .length;

  int get offlineDevices => deviceList
      .where((d) => d.status.trim().toLowerCase() == 'offline')
      .length;

  int get brokenWithIssues {
    final online = onlineDevices;
    final offline = offlineDevices;
    final total = deviceList.length;
    final issues = total - online - offline;
    return issues > 0 ? issues : 0;
  }

  // Backward compatibility getters
  int get totalDevices => totalMonitored;
  int get onlineCount => onlineDevices;
  int get offlineCount => offlineDevices;
  int get issuesCount => brokenWithIssues;

  // ---------------- Categorized Vehicle Counts for Filter Tabs ----------------
  int get healthyVehiclesCount {
    return vehicleList.where((v) {
      final dev = getDeviceForVehicle(v);
      return (dev?.status ?? '').trim().toLowerCase() == 'online';
    }).length;
  }

  int get criticalVehiclesCount {
    return vehicleList.where((v) {
      final dev = getDeviceForVehicle(v);
      return (dev?.status ?? '').trim().toLowerCase() == 'offline';
    }).length;
  }

  int get warningVehiclesCount {
    return vehicleList.where((v) {
      final dev = getDeviceForVehicle(v);
      final st = (dev?.status ?? '').trim().toLowerCase();
      return st != 'online' && st != 'offline';
    }).length;
  }

  // ---------------- Filtered Vehicle List ----------------
  List<VehicleItemModel> get filteredVehicles {
    return vehicleList.where((v) {
      final q = searchQuery.value.trim().toLowerCase();
      final dev = getDeviceForVehicle(v);

      if (q.isNotEmpty) {
        final matches = v.registrationNumber.toLowerCase().contains(q) ||
            v.vehicleType.toLowerCase().contains(q) ||
            (v.depotName ?? '').toLowerCase().contains(q) ||
            (v.depotId?.toString() ?? '').toLowerCase().contains(q) ||
            (dev?.boxId ?? '').toLowerCase().contains(q) ||
            (dev?.deviceId ?? '').toLowerCase().contains(q);
        if (!matches) return false;
      }

      final st = (dev?.status ?? '').trim().toLowerCase();
      if (activeFilter.value == 'Healthy') {
        return st == 'online';
      } else if (activeFilter.value == 'Critical / Offline') {
        return st == 'offline';
      } else if (activeFilter.value == 'Warnings') {
        return st != 'online' && st != 'offline';
      }
      return true;
    }).toList();
  }

  // Backward compatibility for old view if referenced
  List<HardwareStatusDevice> get filteredDevices => allDevices;

  @override
  void onInit() {
    super.onInit();
    fetchHardwareStatusData();
  }

  // ---------------- Fetch Data from Real APIs ----------------
  Future<void> fetchHardwareStatusData() async {
    isLoading.value = true;
    try {
      await _loadAllData();
      lastUpdatedDateTime.value = DateTime.now();
    } catch (e) {
      debugPrint('Error fetching hardware status: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    isRefreshing.value = true;
    try {
      await _loadAllData();
      lastUpdatedDateTime.value = DateTime.now();
    } catch (e) {
      debugPrint('Error refreshing hardware status: $e');
    } finally {
      isRefreshing.value = false;
    }
  }

  Future<void> _loadAllData() async {
    final results = await Future.wait([
      _techService.getVehicles(page: 1, limit: 100),
      _techService.getEdgeDevices(page: 1, limit: 100),
    ]);

    final vehRes = results[0];
    final devRes = results[1];

    if (vehRes.success && vehRes.data is List<VehicleItemModel>) {
      vehicleList.assignAll(vehRes.data as List<VehicleItemModel>);
    }

    if (devRes.success && devRes.data is List<EdgeDeviceModel>) {
      final devs = devRes.data as List<EdgeDeviceModel>;
      deviceList.assignAll(devs);

      // Build vehicleStatusMap
      final map = <String, EdgeDeviceModel>{};
      for (final d in devs) {
        if (d.vehicleId != null) {
          map[d.vehicleId.toString()] = d;
        }
      }
      vehicleStatusMap.assignAll(map);
    }
  }

  // ---------------- Helper to pair Vehicle with EdgeDevice ----------------
  EdgeDeviceModel? getDeviceForVehicle(VehicleItemModel v) {
    final byId = vehicleStatusMap[v.id.toString()];
    if (byId != null) return byId;

    // Fallback: match by registration number
    for (final d in deviceList) {
      if (d.vehicleRegistration.isNotEmpty &&
          d.vehicleRegistration != '—' &&
          d.vehicleRegistration.trim().toLowerCase() ==
              v.registrationNumber.trim().toLowerCase()) {
        return d;
      }
    }
    return null;
  }

  // ---------------- Subsystem Status Evaluators (Matching Admin Panel) ----------------
  String getGpsStatus(VehicleItemModel v) {
    if (v.gpsDeviceId != null && v.gpsDeviceId!.isNotEmpty) {
      return 'Online';
    }
    return 'Not Installed';
  }

  String getDisplayStatus(EdgeDeviceModel? dev, VehicleItemModel v) {
    if (dev != null) {
      return dev.isOnline ? 'Online' : 'Offline';
    }
    return 'Not Installed';
  }

  String getNetworkStatus(EdgeDeviceModel? dev, VehicleItemModel v) {
    if (dev != null) {
      if (dev.isOnline && dev.simNetwork.isNotEmpty) {
        return 'Connected (${dev.simNetwork})';
      }
      return 'Offline';
    }
    return 'Not Installed';
  }

  String getHardwareHealth(EdgeDeviceModel? dev) {
    if (dev == null) return 'Maintenance';
    if (dev.isOnline) return 'Healthy';
    if (dev.isOffline) return 'Degraded / Offline';
    return 'Maintenance';
  }

  // ---------------- Filter Actions ----------------
  void onSearchChanged(String val) {
    searchQuery.value = val;
  }

  void setFilter(String filter) {
    activeFilter.value = filter;
  }

  void toggleViewMode() {
    viewMode.value = viewMode.value == 'card' ? 'table' : 'card';
  }

  void setViewMode(String mode) {
    viewMode.value = mode;
  }

  // ---------------- Navigations ----------------
  void onBackPressed() {
    Get.back();
  }

  void runAllDiagnostics() {
    Get.toNamed(Routes.DEVICE_DIAGNOSTICS);
  }

  void onRunDiagnostics(VehicleItemModel v, EdgeDeviceModel? dev) {
    Get.toNamed(
      Routes.DEVICE_DIAGNOSTICS,
      arguments: {
        'deviceId': dev?.boxId.isNotEmpty == true
            ? dev!.boxId
            : (dev?.idStr.isNotEmpty == true ? dev!.idStr : v.id),
        'deviceType': dev?.deviceType ?? 'Display Screen',
        'vehicleNumber': v.registrationNumber,
        'device': dev,
        'vehicle': v,
      },
    );
  }

  void onTroubleshoot(VehicleItemModel v, EdgeDeviceModel? dev) {
    Get.toNamed(
      Routes.CONNECTIVITY_TROUBLESHOOTING,
      arguments: {
        'deviceId': dev?.boxId.isNotEmpty == true
            ? dev!.boxId
            : (dev?.idStr.isNotEmpty == true ? dev!.idStr : v.id),
        'vehicleNumber': v.registrationNumber,
        'device': dev,
        'vehicle': v,
      },
    );
  }

  void onConfigureDevice(EdgeDeviceModel? dev) {
    if (dev != null) {
      Get.toNamed(Routes.HARDWARE_CONFIGURATION, arguments: dev);
    } else {
      Get.toNamed(Routes.HARDWARE_CONFIGURATION);
    }
  }

  void onInstallGps(VehicleItemModel v) {
    Get.toNamed(Routes.GPS_INSTALLATION, arguments: {'vehicle': v});
  }

  // Backward compatibility method
  void onDeviceTap(HardwareStatusDevice device) {
    Get.toNamed(Routes.DEVICE_DIAGNOSTICS, arguments: {
      'deviceId': device.deviceId,
      'deviceType': 'Display Device',
      'vehicleNumber': device.vehicleNumber,
    });
  }

  void onFilterOnline(DeviceOnlineState? state) => activeOnlineFilter.value = state;
  void toggleIssuesOnlyFilter() => issuesOnlyFilter.value = !issuesOnlyFilter.value;
  void clearFilters() {
    activeFilter.value = 'All';
    searchQuery.value = '';
    activeOnlineFilter.value = null;
    issuesOnlyFilter.value = false;
  }

  void onOpenFilterSheet() {}
}
