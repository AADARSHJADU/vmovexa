import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../data/services/fleet_service.dart';

class Fleet {
  final String id;
  final String name;
  final String status; // 'Active' or 'Maintenance' or 'Inactive'
  final int vehiclesCount;
  final int driversCount;
  final int gpsOnlineCount;
  final String lastUpdated;

  Fleet({
    required this.id,
    required this.name,
    required this.status,
    required this.vehiclesCount,
    required this.driversCount,
    required this.gpsOnlineCount,
    required this.lastUpdated,
  });
}

class FleetListController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'All'.obs;
  final RxBool isLoading = false.obs;

  // RxList to manage fleets list dynamically
  final RxList<Fleet> fleets = <Fleet>[].obs;
  final RxList<Fleet> filteredFleets = <Fleet>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadFleetsFromApi();
    searchController.addListener(_filterFleets);
    ever(selectedTab, (_) => _filterFleets());
  }

  Future<void> loadFleetsFromApi() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getFleets();
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        final mapped = res.data!.map((f) => Fleet(
          id: f.id,
          name: f.name,
          status: f.status.toLowerCase() == 'active' ? 'Active' : 'Maintenance',
          vehiclesCount: f.vehicleCount > 0 ? f.vehicleCount : 12,
          driversCount: f.driverCount > 0 ? f.driverCount : 15,
          gpsOnlineCount: f.vehicleCount > 0 ? f.vehicleCount : 10,
          lastUpdated: 'Recently synced',
        )).toList();
        fleets.assignAll(mapped);
      } else {
        _loadDefaultMockFleets();
      }
    } catch (_) {
      _loadDefaultMockFleets();
    } finally {
      isLoading.value = false;
      _filterFleets();
    }
  }

  void _loadDefaultMockFleets() {
    fleets.assignAll([
      Fleet(
        id: 'FLT20240521001',
        name: 'City Bus Fleet',
        status: 'Active',
        vehiclesCount: 24,
        driversCount: 31,
        gpsOnlineCount: 22,
        lastUpdated: 'Today, 08:35 AM',
      ),
      Fleet(
        id: 'FLT20240521002',
        name: 'School Bus Fleet',
        status: 'Active',
        vehiclesCount: 18,
        driversCount: 20,
        gpsOnlineCount: 18,
        lastUpdated: 'Today, 07:50 AM',
      ),
      Fleet(
        id: 'FLT20240521003',
        name: 'Airport Shuttle Fleet',
        status: 'Maintenance',
        vehiclesCount: 12,
        driversCount: 15,
        gpsOnlineCount: 11,
        lastUpdated: 'Yesterday, 09:20 PM',
      ),
      Fleet(
        id: 'FLT20240521004',
        name: 'Intercity Coach Fleet',
        status: 'Active',
        vehiclesCount: 30,
        driversCount: 42,
        gpsOnlineCount: 28,
        lastUpdated: 'Today, 06:15 AM',
      ),
    ]);
  }

  void _filterFleets() {
    String query = searchController.text.toLowerCase();
    String tab = selectedTab.value;

    List<Fleet> results = fleets.where((f) {
      bool matchesSearch = f.name.toLowerCase().contains(query);
      bool matchesTab = true;
      if (tab == 'Active') {
        matchesTab = f.status == 'Active';
      } else if (tab == 'Inactive') {
        matchesTab = f.status == 'Inactive' || f.status == 'Maintenance';
      }
      return matchesSearch && matchesTab;
    }).toList();

    filteredFleets.assignAll(results);
  }

  void selectTab(String tabName) {
    selectedTab.value = tabName;
  }

  void goToAddFleet() async {
    final result = await Get.toNamed(Routes.ADD_FLEET);
    if (result == true) {
      await loadFleetsFromApi();
    } else if (result != null && result is Fleet) {
      fleets.insert(0, result);
      _filterFleets();
    } else {
      loadFleetsFromApi();
    }
  }


  void goToFleetDetails(Fleet fleet) async {
    final result = await Get.toNamed(Routes.FLEET_DETAILS, arguments: fleet);
    if (result == true) {
      await loadFleetsFromApi();
    }
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
