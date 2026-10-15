import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';

class VehicleListController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'All'.obs;
  final RxBool isLoading = false.obs;

  final RxList<VehicleItemModel> vehicles = <VehicleItemModel>[].obs;
  final RxList<VehicleItemModel> filteredVehicles = <VehicleItemModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadVehicles();
    searchController.addListener(_filterVehicles);
    ever(selectedTab, (_) => _filterVehicles());
  }

  Future<void> loadVehicles() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getVehicles();
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        vehicles.assignAll(res.data!);
      } else {
        _loadDefaultVehicles();
      }
    } catch (_) {
      _loadDefaultVehicles();
    } finally {
      isLoading.value = false;
      _filterVehicles();
    }
  }

  void _loadDefaultVehicles() {
    vehicles.assignAll([
      VehicleItemModel(
        id: 'veh_01',
        registrationNumber: 'MP09-CV-9821',
        make: 'Tata Motors',
        model: 'Starbus Ultra EV',
        year: 2025,
        capacity: 42,
        fuelType: 'electric',
        status: 'on_route',
        assignedDriverName: 'Ramesh Verma',
        speedKmh: 34.5,
        batterySocPct: 82,
        fleetName: 'BRTS Electric Corridor',
      ),
      VehicleItemModel(
        id: 'veh_02',
        registrationNumber: 'MP09-TA-4412',
        make: 'Ashok Leyland',
        model: 'CityTransit Diesel BS6',
        year: 2024,
        capacity: 38,
        fuelType: 'diesel',
        status: 'in_depot',
        assignedDriverName: 'Sunil Sharma',
        speedKmh: 0.0,
        batterySocPct: null,
        fleetName: 'City Feeder Fleet',
      ),
      VehicleItemModel(
        id: 'veh_03',
        registrationNumber: 'MP09-EV-1109',
        make: 'Eicher Motors',
        model: 'Skyline Pro Electric',
        year: 2025,
        capacity: 32,
        fuelType: 'electric',
        status: 'on_route',
        assignedDriverName: 'Amit Patel',
        speedKmh: 42.0,
        batterySocPct: 64,
        fleetName: 'BRTS Electric Corridor',
      ),
      VehicleItemModel(
        id: 'veh_04',
        registrationNumber: 'MP09-TR-7788',
        make: 'Tata Motors',
        model: 'Marcopolo Low Floor',
        year: 2023,
        capacity: 45,
        fuelType: 'cng',
        status: 'maintenance',
        assignedDriverName: null,
        speedKmh: 0.0,
        batterySocPct: null,
        fleetName: 'Airport Shuttle Division',
      ),
    ]);
  }

  void _filterVehicles() {
    final query = searchController.text.trim().toLowerCase();
    final tab = selectedTab.value;

    final results = vehicles.where((v) {
      final matchesSearch = v.registrationNumber.toLowerCase().contains(query) ||
          v.model.toLowerCase().contains(query) ||
          (v.assignedDriverName ?? '').toLowerCase().contains(query);

      bool matchesTab = true;
      if (tab == 'On Route') {
        matchesTab = v.status.toLowerCase() == 'on_route' || v.status.toLowerCase() == 'active';
      } else if (tab == 'In Depot') {
        matchesTab = v.status.toLowerCase() == 'in_depot';
      } else if (tab == 'Maintenance') {
        matchesTab = v.status.toLowerCase() == 'maintenance';
      } else if (tab == 'Electric EV') {
        matchesTab = v.fuelType.toLowerCase() == 'electric';
      }

      return matchesSearch && matchesTab;
    }).toList();

    filteredVehicles.assignAll(results);
  }

  void selectTab(String tabName) {
    selectedTab.value = tabName;
  }
}

class VehicleListView extends StatelessWidget {
  const VehicleListView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(VehicleListController());

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          // Top Header Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.directions_car_rounded, color: Colors.lightBlueAccent, size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Vehicles & Displays',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => Get.toNamed(Routes.ADD_VEHICLE),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.add, size: 16, color: Colors.white),
                  label: const Text(
                    'Add Vehicle',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // Search Input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.inputBorder, width: 1.2),
              ),
              child: TextField(
                controller: controller.searchController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: const InputDecoration(
                  icon: Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
                  hintText: 'Search Registration, Model or Driver...',
                  hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),

          // Filter Tab Pills
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Obx(
              () => Row(
                children: ['All', 'On Route', 'In Depot', 'Maintenance', 'Electric EV'].map((tab) {
                  final isSelected = controller.selectedTab.value == tab;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => controller.selectTab(tab),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                          ),
                        ),
                        child: Text(
                          tab,
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.textMuted,
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Vehicle Cards List
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
              }

              if (controller.filteredVehicles.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.directions_bus_filled_outlined, size: 48, color: Colors.white.withValues(alpha: 0.2)),
                      const SizedBox(height: 12),
                      const Text('No vehicles found', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
                    ],
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: controller.loadVehicles,
                color: const Color(0xFF6366F1),
                backgroundColor: AppColors.cardBg,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  itemCount: controller.filteredVehicles.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final vehicle = controller.filteredVehicles[index];
                    return _buildVehicleCard(vehicle);
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleCard(VehicleItemModel v) {
    Color statusColor;
    String statusLabel;
    switch (v.status.toLowerCase()) {
      case 'on_route':
      case 'active':
        statusColor = const Color(0xFF10B981);
        statusLabel = 'ON ROUTE';
        break;
      case 'in_depot':
        statusColor = const Color(0xFF38BDF8);
        statusLabel = 'IN DEPOT';
        break;
      case 'maintenance':
        statusColor = const Color(0xFFF59E0B);
        statusLabel = 'MAINTENANCE';
        break;
      default:
        statusColor = const Color(0xFF94A3B8);
        statusLabel = v.status.toUpperCase();
    }

    final isElectric = v.fuelType.toLowerCase() == 'electric';

    return InkWell(
      onTap: () => Get.toNamed(Routes.VEHICLE_DETAILS, arguments: {'vehicleId': v.id}),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Reg number & Status badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: Colors.white24),
                      ),
                      child: Text(
                        v.registrationNumber,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: isElectric
                            ? const Color(0xFF10B981).withValues(alpha: 0.15)
                            : Colors.white10,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isElectric ? Icons.bolt_rounded : Icons.local_gas_station_rounded,
                            size: 13,
                            color: isElectric ? const Color(0xFF34D399) : AppColors.textMuted,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            v.fuelType.toUpperCase(),
                            style: TextStyle(
                              color: isElectric ? const Color(0xFF34D399) : AppColors.textMuted,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Vehicle Model & Fleet Division
            Text(
              '${v.make} ${v.model}'.trim(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (v.fleetName != null) ...[
              const SizedBox(height: 2),
              Text(
                v.fleetName!,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ],

            const Divider(color: AppColors.cardBorder, height: 18),

            // Footer Details: Driver + Speed / Battery
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.person_outline_rounded, size: 15, color: AppColors.textMuted),
                    const SizedBox(width: 5),
                    Text(
                      v.assignedDriverName ?? 'No Driver Assigned',
                      style: TextStyle(
                        color: v.assignedDriverName != null ? Colors.white70 : AppColors.textMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    if (v.speedKmh != null) ...[
                      const Icon(Icons.speed_rounded, size: 15, color: Colors.cyanAccent),
                      const SizedBox(width: 4),
                      Text(
                        '${v.speedKmh!.toStringAsFixed(1)} km/h',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 10),
                    ],
                    if (v.batterySocPct != null) ...[
                      const Icon(Icons.battery_charging_full_rounded, size: 15, color: Color(0xFF10B981)),
                      const SizedBox(width: 3),
                      Text(
                        '${v.batterySocPct}%',
                        style: const TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
