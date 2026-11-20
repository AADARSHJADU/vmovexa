import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../theme/app_theme.dart';

class VehicleListController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'All'.obs;
  final RxBool isLoading = false.obs;
  final RxBool isDeleting = false.obs;

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
        vehicles.clear();
      }
    } catch (_) {
      vehicles.clear();
    } finally {
      isLoading.value = false;
      _filterVehicles();
    }
  }

  void _filterVehicles() {
    final query = searchController.text.trim().toLowerCase();
    final tab = selectedTab.value;

    final results = vehicles.where((v) {
      final matchesSearch = v.registrationNumber.toLowerCase().contains(query) ||
          v.model.toLowerCase().contains(query) ||
          (v.assignedDriverName ?? '').toLowerCase().contains(query) ||
          (v.fleetName ?? '').toLowerCase().contains(query);

      bool matchesTab = true;
      if (tab == 'On Route') {
        matchesTab = v.status.toLowerCase() == 'on_route' || v.status.toLowerCase() == 'active' || v.status.toLowerCase() == 'moving';
      } else if (tab == 'In Depot') {
        matchesTab = v.status.toLowerCase() == 'in_depot' || v.status.toLowerCase() == 'idle';
      } else if (tab == 'Maintenance') {
        matchesTab = v.status.toLowerCase() == 'maintenance' || v.status.toLowerCase() == 'offline';
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

  Future<void> navigateToAddVehicle() async {
    final res = await Get.toNamed(Routes.ADD_VEHICLE);
    if (res == true) {
      await loadVehicles();
    }
  }

  Future<void> navigateToEditVehicle(VehicleItemModel v) async {
    final res = await Get.toNamed(Routes.ADD_VEHICLE, arguments: {
      'id': v.id,
      'vehicleId': v.id,
      'vehicle': v,
    });
    if (res == true) {
      await loadVehicles();
    }
  }

  Future<void> navigateToVehicleDetails(VehicleItemModel v) async {
    final res = await Get.toNamed(Routes.VEHICLE_DETAILS, arguments: {
      'id': v.id,
      'vehicleId': v.id,
      'vehicle': v,
    });
    if (res == true) {
      await loadVehicles();
    }
  }

  Future<void> confirmDeleteVehicle(VehicleItemModel v) async {
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            const SizedBox(width: 8),
            Text(
              'delete_vehicle'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          '${'confirm_delete_vehicle'.tr} ${v.registrationNumber}?\n${'action_cannot_undone'.tr}',
          style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () => Get.back(result: true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('delete'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      isDeleting.value = true;
      try {
        final res = await FleetService.to.deleteVehicle(v.id);
        if (res.success) {
          Get.snackbar(
            'delete_vehicle'.tr,
            'vehicle_deleted_success'.tr,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
            margin: const EdgeInsets.all(16),
          );
          await loadVehicles();
        } else {
          Get.snackbar(
            'error'.tr,
            res.message ?? 'failed_to_delete_vehicle'.tr,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
            margin: const EdgeInsets.all(16),
          );
        }
      } catch (e) {
        Get.snackbar(
          'error'.tr,
          e.toString(),
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      } finally {
        isDeleting.value = false;
      }
    }
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
                Row(
                  children: [
                    const Icon(Icons.directions_car_rounded, color: Colors.lightBlueAccent, size: 24),
                    const SizedBox(width: 8),
                    Text(
                      'vehicles_displays'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap:  controller.navigateToAddVehicle,
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.add, color: Colors.white, size: 20),
                            const SizedBox(width: 6),
                            Text(
                              'add_vehicle'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
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
                decoration: InputDecoration(
                  icon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
                  hintText: 'search_vehicle_hint'.tr,
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
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
                children: [
                  {'key': 'All', 'label': 'all'.tr},
                  {'key': 'On Route', 'label': 'on_route_status'.tr},
                  {'key': 'In Depot', 'label': 'in_depot_status'.tr},
                  {'key': 'Maintenance', 'label': 'maintenance_status'.tr},
                  {'key': 'Electric EV', 'label': 'electric_ev'.tr},
                ].map((tab) {
                  final tabKey = tab['key']!;
                  final tabLabel = tab['label']!;
                  final isSelected = controller.selectedTab.value == tabKey;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => controller.selectTab(tabKey),
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
                          tabLabel,
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
                      Text('no_vehicles_found'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 14)),
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
                    return _buildVehicleCard(context, controller, vehicle);
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleCard(BuildContext context, VehicleListController controller, VehicleItemModel v) {
    Color statusColor;
    String statusLabel;
    switch (v.status.toLowerCase()) {
      case 'on_route':
      case 'active':
      case 'moving':
        statusColor = const Color(0xFF10B981);
        statusLabel = 'on_route_status'.tr;
        break;
      case 'in_depot':
      case 'idle':
        statusColor = const Color(0xFF38BDF8);
        statusLabel = 'in_depot_status'.tr;
        break;
      case 'maintenance':
      case 'offline':
        statusColor = const Color(0xFFF59E0B);
        statusLabel = 'maintenance_status'.tr;
        break;
      case 'pending_approval':
        statusColor = Colors.amber;
        statusLabel = 'pending'.tr;
        break;
      default:
        statusColor = const Color(0xFF94A3B8);
        statusLabel = v.status.toUpperCase();
    }

    return InkWell(
      onTap: () => controller.navigateToVehicleDetails(v),
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
            // Top Row: Reg number, Fuel Badge, Status badge, and 3-dot menu
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
                    // const SizedBox(width: 8),
                    // Container(
                    //   padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    //   decoration: BoxDecoration(
                    //     color: isElectric
                    //         ? const Color(0xFF10B981).withValues(alpha: 0.15)
                    //         : Colors.white10,
                    //     borderRadius: BorderRadius.circular(6),
                    //   ),
                    //   child: Row(
                    //     children: [
                    //       Icon(
                    //         isElectric ? Icons.bolt_rounded : Icons.local_gas_station_rounded,
                    //         size: 13,
                    //         color: isElectric ? const Color(0xFF34D399) : AppColors.textMuted,
                    //       ),
                    //       const SizedBox(width: 3),
                    //       Text(
                    //         v.fuelType.toUpperCase(),
                    //         style: TextStyle(
                    //           color: isElectric ? const Color(0xFF34D399) : AppColors.textMuted,
                    //           fontSize: 10,
                    //           fontWeight: FontWeight.bold,
                    //         ),
                    //       ),
                    //     ],
                    //   ),
                    // ),
                  ],
                ),
                Row(
                  children: [
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
                    const SizedBox(width: 4),
                    // Action 3-dot menu matching Admin Panel
                    PopupMenuButton<String>(
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 40),
                      icon: const Icon(Icons.more_vert, color: Colors.white60, size: 20),
                      color: const Color(0xFF1E293B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      onSelected: (val) {
                        if (val == 'view') {
                          controller.navigateToVehicleDetails(v);
                        } else if (val == 'edit') {
                          controller.navigateToEditVehicle(v);
                        } else if (val == 'delete') {
                          controller.confirmDeleteVehicle(v);
                        }
                      },
                      itemBuilder: (_) => [
                        PopupMenuItem(
                          value: 'view',
                          child: Row(
                            children: [
                              const Icon(Icons.visibility_outlined, size: 16, color: Color(0xFF60A5FA)),
                              const SizedBox(width: 8),
                              Text('view_details'.tr, style: const TextStyle(color: Colors.white, fontSize: 12)),
                            ],
                          ),
                        ),
                        PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              const Icon(Icons.edit_outlined, size: 16, color: Colors.amberAccent),
                              const SizedBox(width: 8),
                              Text('edit_vehicle'.tr, style: const TextStyle(color: Colors.white, fontSize: 12)),
                            ],
                          ),
                        ),
                        const PopupMenuDivider(height: 1),
                        PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              const Icon(Icons.delete_outline_rounded, size: 16, color: Colors.redAccent),
                              const SizedBox(width: 8),
                              Text('delete'.tr, style: const TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Vehicle Model & Fleet Division & Displays badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${v.make} ${v.model}'.trim().isEmpty ? v.vehicleType : '${v.make} ${v.model}'.trim(),
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
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8B5CF6).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.tv_rounded, size: 12, color: Color(0xFFC084FC)),
                      const SizedBox(width: 4),
                      Text(
                        '${v.displaysCount} ${'displays'.tr}',
                        style: const TextStyle(color: Color(0xFFC084FC), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),

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
                      v.assignedDriverName ?? 'no_driver_assigned'.tr,
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
