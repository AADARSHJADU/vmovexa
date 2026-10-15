import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';

class DriverStaffController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'All'.obs;
  final RxBool isLoading = false.obs;

  final RxList<DriverItemModel> drivers = <DriverItemModel>[].obs;
  final RxList<DriverItemModel> filteredDrivers = <DriverItemModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadDrivers();
    searchController.addListener(_filterDrivers);
    ever(selectedTab, (_) => _filterDrivers());
  }

  Future<void> loadDrivers() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getDrivers();
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        drivers.assignAll(res.data!);
      } else {
        _loadDefaultDrivers();
      }
    } catch (_) {
      _loadDefaultDrivers();
    } finally {
      isLoading.value = false;
      _filterDrivers();
    }
  }

  void _loadDefaultDrivers() {
    drivers.assignAll([
      DriverItemModel(
        id: 'drv_01',
        name: 'Ramesh Kumar Verma',
        phone: '+91 98260 12345',
        email: 'ramesh.verma@transit.in',
        licenseNumber: 'MP09-2019-009124',
        status: 'on_duty',
        assignedVehicleReg: 'MP09-CV-9821',
        rating: 4.9,
      ),
      DriverItemModel(
        id: 'drv_02',
        name: 'Sunil Sharma',
        phone: '+91 98270 99887',
        email: 'sunil.sharma@transit.in',
        licenseNumber: 'MP09-2021-004412',
        status: 'on_duty',
        assignedVehicleReg: 'MP09-TA-4412',
        rating: 4.7,
      ),
      DriverItemModel(
        id: 'drv_03',
        name: 'Amit Patel',
        phone: '+91 98930 55441',
        email: 'amit.patel@transit.in',
        licenseNumber: 'MP09-2018-001109',
        status: 'off_duty',
        assignedVehicleReg: 'MP09-EV-1109',
        rating: 4.8,
      ),
      DriverItemModel(
        id: 'drv_04',
        name: 'Deepak Joshi',
        phone: '+91 97550 88221',
        email: 'deepak.joshi@transit.in',
        licenseNumber: 'MP09-2022-007788',
        status: 'on_leave',
        assignedVehicleReg: null,
        rating: 4.6,
      ),
    ]);
  }

  void _filterDrivers() {
    final query = searchController.text.trim().toLowerCase();
    final tab = selectedTab.value;

    final results = drivers.where((d) {
      final matchesSearch = d.name.toLowerCase().contains(query) ||
          d.phone.toLowerCase().contains(query) ||
          d.licenseNumber.toLowerCase().contains(query);

      bool matchesTab = true;
      if (tab == 'On Duty') {
        matchesTab = d.status.toLowerCase() == 'on_duty';
      } else if (tab == 'Off Duty') {
        matchesTab = d.status.toLowerCase() == 'off_duty' || d.status.toLowerCase() == 'active';
      } else if (tab == 'On Leave') {
        matchesTab = d.status.toLowerCase() == 'on_leave';
      }

      return matchesSearch && matchesTab;
    }).toList();

    filteredDrivers.assignAll(results);
  }

  void selectTab(String tabName) {
    selectedTab.value = tabName;
  }
}

class DriverStaffListView extends StatelessWidget {
  const DriverStaffListView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(DriverStaffController());

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
                    Icon(Icons.badge_outlined, color: Color(0xFF10B981), size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Drivers & Staff',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => Get.toNamed(Routes.ADD_DRIVER),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.person_add_rounded, size: 16, color: Colors.white),
                  label: const Text(
                    'Onboard Driver',
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
                  hintText: 'Search Driver Name, Phone or License...',
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
                children: ['All', 'On Duty', 'Off Duty', 'On Leave'].map((tab) {
                  final isSelected = controller.selectedTab.value == tab;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => controller.selectTab(tab),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF10B981) : AppColors.cardBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF10B981) : AppColors.cardBorder,
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

          // Driver Cards List
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
              }

              if (controller.filteredDrivers.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.person_off_outlined, size: 48, color: Colors.white.withValues(alpha: 0.2)),
                      const SizedBox(height: 12),
                      const Text('No drivers found', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
                    ],
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: controller.loadDrivers,
                color: const Color(0xFF10B981),
                backgroundColor: AppColors.cardBg,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  itemCount: controller.filteredDrivers.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final driver = controller.filteredDrivers[index];
                    return _buildDriverCard(driver);
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildDriverCard(DriverItemModel d) {
    Color statusColor;
    String statusLabel;
    switch (d.status.toLowerCase()) {
      case 'on_duty':
        statusColor = const Color(0xFF10B981);
        statusLabel = 'ON DUTY';
        break;
      case 'off_duty':
      case 'active':
        statusColor = const Color(0xFF64748B);
        statusLabel = 'OFF DUTY';
        break;
      case 'on_leave':
        statusColor = const Color(0xFFF59E0B);
        statusLabel = 'ON LEAVE';
        break;
      default:
        statusColor = const Color(0xFF94A3B8);
        statusLabel = d.status.toUpperCase();
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 1.2),
                ),
                child: Center(
                  child: Text(
                    d.name.isNotEmpty ? d.name[0].toUpperCase() : 'D',
                    style: const TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Name & License
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      d.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.phone_outlined, size: 12, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text(d.phone, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.credit_card_outlined, size: 12, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text('DL: ${d.licenseNumber}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              ),

              // Status badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 6, height: 6, decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    Text(
                      statusLabel,
                      style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const Divider(color: AppColors.cardBorder, height: 18),

          // Bottom Info: Rating & Assigned Bus
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.star_rounded, size: 16, color: Color(0xFFFBBF24)),
                  const SizedBox(width: 3),
                  Text(
                    d.rating.toStringAsFixed(1),
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(width: 4),
                  const Text('Rating', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                ],
              ),
              if (d.assignedVehicleReg != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.directions_bus_rounded, size: 12, color: Color(0xFF818CF8)),
                      const SizedBox(width: 4),
                      Text(
                        d.assignedVehicleReg!,
                        style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                TextButton(
                  onPressed: () => Get.toNamed(Routes.ASSIGN_DRIVER),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    '+ Assign Bus',
                    style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
