import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/models/user_model.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/theme/app_colors.dart';

class FleetOpDashboardController extends GetxController {
  final RxInt selectedNavIndex = 0.obs;
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  final Rx<UserModel?> user = Rx<UserModel?>(null);
  final Rx<FleetKpisModel> kpis = FleetKpisModel().obs;
  final RxList<FleetItemModel> activeFleets = <FleetItemModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map && args.containsKey('tab')) {
      selectedNavIndex.value = args['tab'];
    }
    loadUserData();
    loadDashboardData();
  }

  void loadUserData() {
    if (Get.isRegistered<StorageService>()) {
      user.value = StorageService.to.getUser();
    }
  }

  void onNavItemTapped(int index) {
    selectedNavIndex.value = index;
  }

  void setNavIndex(int index) {
    selectedNavIndex.value = index;
  }

  Future<void> loadDashboardData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _loadKpis(),
        _loadActiveFleets(),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshDashboard() async {
    isRefreshing.value = true;
    try {
      await Future.wait([
        _loadKpis(),
        _loadActiveFleets(),
      ]);
    } finally {
      isRefreshing.value = false;
    }
  }

  Future<void> _loadKpis() async {
    try {
      final res = await FleetService.to.getDashboardKpis();
      if (res.success && res.data != null) {
        kpis.value = res.data!;
      } else {
        _loadDefaultKpis();
      }
    } catch (_) {
      _loadDefaultKpis();
    }
  }

  void _loadDefaultKpis() {
    kpis.value = FleetKpisModel(
      totalFleets: 4,
      activeFleets: 4,
      totalVehicles: 38,
      activeVehicles: 31,
      totalDrivers: 45,
      activeDrivers: 38,
      totalGps: 36,
      onlineGps: 32,
      openIncidents: 2,
      activeTrips: 14,
    );
  }

  Future<void> _loadActiveFleets() async {
    try {
      final res = await FleetService.to.getFleets(limit: 4);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        activeFleets.assignAll(res.data!);
      } else {
        _loadDefaultFleets();
      }
    } catch (_) {
      _loadDefaultFleets();
    }
  }

  void _loadDefaultFleets() {
    activeFleets.assignAll([
      FleetItemModel(
        id: 'flt_01',
        name: 'BRTS Corridor High-Speed Electric',
        description: 'Dedicated iBus electric fleet running on AB Road corridor',
        status: 'active',
        vehicleCount: 24,
        driverCount: 31,
        depotName: 'North Depot - Vijay Nagar',
      ),
      FleetItemModel(
        id: 'flt_02',
        name: 'City Feeder Diesel BS6 Division',
        description: 'East-West suburban metro connector feeder buses',
        status: 'active',
        vehicleCount: 18,
        driverCount: 20,
        depotName: 'East Ring Road Depot',
      ),
      FleetItemModel(
        id: 'flt_03',
        name: 'Airport Express AC Shuttles',
        description: 'Non-stop premium electric shuttle to Indore Airport',
        status: 'active',
        vehicleCount: 12,
        driverCount: 15,
        depotName: 'Airport Transit Yard',
      ),
    ]);
  }

  void goToFleetList() {
    selectedNavIndex.value = 1;
  }

  void goToVehicles() {
    selectedNavIndex.value = 2;
  }

  void goToDrivers() {
    selectedNavIndex.value = 3;
  }

  void goToLiveTracking() {
    Get.toNamed(Routes.LIVE_TRACKING);
  }

  void goToReports() {
    Get.toNamed(Routes.VEHICLE_ANALYTICS);
  }

  void goToGpsDevices() {
    Get.toNamed(Routes.ADD_GPS);
  }

  void goToTrips() {
    Get.toNamed(Routes.TRIP_DETAILS);
  }

  void openDepotsDialog() {
    Get.defaultDialog(
      title: 'Depots & Transit Yards',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: AppColors.cardBg,
      radius: 14,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Column(
          children: [
            _buildDialogItem('North Depot - Vijay Nagar', 'Capacity: 50 Buses • 34 Stationed', Icons.warehouse_rounded, Colors.indigoAccent),
            const SizedBox(height: 8),
            _buildDialogItem('East Ring Road Yard', 'Capacity: 40 Buses • 28 Stationed', Icons.warehouse_rounded, Colors.cyanAccent),
            const SizedBox(height: 8),
            _buildDialogItem('Bhopal Transit Complex', 'Capacity: 60 Buses • 42 Stationed', Icons.warehouse_rounded, Colors.amberAccent),
          ],
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
        onPressed: () => Get.back(),
        child: const Text('Close', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  void openRoutesDialog() {
    Get.defaultDialog(
      title: 'Transit Routes & Corridors',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: AppColors.cardBg,
      radius: 14,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Column(
          children: [
            _buildDialogItem('Route 7A: Rajwada ↔ Vijay Nagar', '12.8 km • 14 Active Buses', Icons.alt_route_rounded, Colors.tealAccent),
            const SizedBox(height: 8),
            _buildDialogItem('Route 11B: Bypass ↔ Airport', '24.5 km • 8 Active Buses', Icons.alt_route_rounded, Colors.pinkAccent),
            const SizedBox(height: 8),
            _buildDialogItem('Route 3C: MR-10 ↔ Bhanwarkuan', '16.2 km • 11 Active Buses', Icons.alt_route_rounded, Colors.amberAccent),
          ],
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
        onPressed: () => Get.back(),
        child: const Text('Close', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  void openTechnicianDialog() {
    Get.defaultDialog(
      title: 'Technician Work Orders',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: AppColors.cardBg,
      radius: 14,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Column(
          children: [
            _buildDialogItem('Display Panel Diagnostic #WO-401', 'MP09-CV-9821 • Assigned to Tech Rakesh', Icons.build_circle_outlined, Colors.cyanAccent),
            const SizedBox(height: 8),
            _buildDialogItem('GPS Unit Recalibration #WO-389', 'MP09-TA-4412 • In Progress (North Depot)', Icons.build_circle_outlined, Colors.amberAccent),
          ],
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
        onPressed: () => Get.back(),
        child: const Text('Close', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  void openIncidentsDialog() {
    Get.defaultDialog(
      title: 'Emergency Incidents & SOS',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: AppColors.cardBg,
      radius: 14,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Column(
          children: [
            _buildDialogItem('Coolant Temp Spike Warning', 'Bus MP09-CV-9821 • Palasia Square (Resolved)', Icons.warning_amber_rounded, Colors.amberAccent),
            const SizedBox(height: 8),
            _buildDialogItem('Route 7A Traffic Congestion Alert', '15 min delay reported • Driver Ramesh', Icons.timer_outlined, Colors.redAccent),
          ],
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
        onPressed: () => Get.back(),
        child: const Text('Close', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  void openActivityLogsDialog() {
    Get.toNamed(Routes.ACTIVITY_LOGS);
  }

  Widget _buildDialogItem(String title, String subtitle, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void logout() async {
    try {
      await AuthService.to.logout();
    } catch (_) {}
    Get.offAllNamed(Routes.LOGIN);
  }
}
