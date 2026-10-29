import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../theme/app_theme.dart';

class DriverStaffController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'All'.obs;
  final RxBool isLoading = false.obs;

  final RxList<DriverItemModel> drivers = <DriverItemModel>[].obs;
  final RxList<DriverItemModel> filteredDrivers = <DriverItemModel>[].obs;

  int get totalDriversCount => drivers.length;
  int get onDutyCount => drivers.where((d) => d.isOnDuty).length;
  int get pendingApprovalCount => drivers.where((d) => d.isPendingApproval).length;
  int get verifiedCount => drivers.where((d) => d.isVerified).length;
  int get dlExpiryAlertsCount => drivers.where((d) => d.dlStatus.toLowerCase().contains('expir')).length;
  int get complianceBlockedCount => drivers.where((d) => d.isComplianceBlocked || d.dlStatus.toLowerCase().contains('expired')).length;

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
      final res = await FleetService.to.getDrivers(limit: 100);
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
        id: '1',
        name: 'Ramesh Kumar Verma',
        empId: 'EMP-01',
        badgeId: 'MP09-DRV-01',
        phone: '+91 98260 12345',
        email: 'ramesh.verma@transit.in',
        licenseNumber: 'MP09-2019-009124',
        licenseType: 'Commercial Heavy (HMV)',
        dlExpiry: '2029-08-30',
        issuingAuthority: 'RTO Indore',
        depotName: 'Vijay Nagar Depot',
        assignedVehicleReg: 'MP09-CV-9821',
        status: 'on_duty',
        documentsVerified: true,
        aadhaarVerified: true,
        activeShift: 'Morning Shift (06:00 AM - 02:00 PM)',
        rating: 4.9,
      ),
      DriverItemModel(
        id: '2',
        name: 'Sunil Sharma',
        empId: 'EMP-02',
        badgeId: 'MP09-DRV-02',
        phone: '+91 98270 99887',
        email: 'sunil.sharma@transit.in',
        licenseNumber: 'MP09-2021-004412',
        licenseType: 'Commercial Heavy (HMV)',
        dlExpiry: '2028-11-15',
        issuingAuthority: 'RTO Bhopal',
        depotName: 'Rajwada Hub',
        assignedVehicleReg: 'MP09-TA-4412',
        status: 'available',
        documentsVerified: true,
        aadhaarVerified: true,
        activeShift: 'Evening Shift (02:00 PM - 10:00 PM)',
        rating: 4.7,
      ),
      DriverItemModel(
        id: '3',
        name: 'Amit Patel',
        empId: 'EMP-03',
        badgeId: 'MP09-DRV-03',
        phone: '+91 98930 55441',
        email: 'amit.patel@transit.in',
        licenseNumber: 'MP09-2018-001109',
        licenseType: 'Commercial Heavy (HMV)',
        dlExpiry: '2026-10-30',
        issuingAuthority: 'RTO Ujjain',
        depotName: 'Bhawarkua Depot',
        assignedVehicleReg: 'MP09-EV-1109',
        status: 'pending_approval',
        documentsVerified: false,
        aadhaarVerified: false,
        dlStatus: 'expiring_soon',
        activeShift: 'Split Roster (07:00 AM - 07:00 PM)',
        rating: 4.8,
      ),
      DriverItemModel(
        id: '4',
        name: 'Deepak Joshi',
        empId: 'EMP-04',
        badgeId: 'MP09-DRV-04',
        phone: '+91 97550 88221',
        email: 'deepak.joshi@transit.in',
        licenseNumber: 'MP09-2022-007788',
        licenseType: 'Commercial Heavy (HMV)',
        dlExpiry: '2030-05-20',
        issuingAuthority: 'RTO Indore',
        depotName: 'Palasia Depot',
        assignedVehicleReg: null,
        status: 'off_duty',
        documentsVerified: true,
        aadhaarVerified: true,
        activeShift: 'Night Feeder (10:00 PM - 06:00 AM)',
        rating: 4.6,
      ),
    ]);
  }

  void _filterDrivers() {
    final query = searchController.text.trim().toLowerCase();
    final tab = selectedTab.value;

    final results = drivers.where((d) {
      final name = d.name.toLowerCase();
      final phone = d.phone.toLowerCase();
      final dl = d.licenseNumber.toLowerCase();
      final badge = d.displayBadgeId.toLowerCase();
      final depot = d.displayDepot.toLowerCase();

      final matchesSearch = query.isEmpty ||
          name.contains(query) ||
          phone.contains(query) ||
          dl.contains(query) ||
          badge.contains(query) ||
          depot.contains(query);

      bool matchesTab = true;
      if (tab == 'On Duty') {
        matchesTab = d.isOnDuty;
      } else if (tab == 'Pending Approval') {
        matchesTab = d.isPendingApproval;
      } else if (tab == 'Verified') {
        matchesTab = d.isVerified;
      } else if (tab == 'DL Expiry Alerts') {
        matchesTab = d.dlStatus.toLowerCase().contains('expir');
      }

      return matchesSearch && matchesTab;
    }).toList();

    filteredDrivers.assignAll(results);
  }

  void selectTab(String tabName) {
    selectedTab.value = tabName;
  }

  Future<void> toggleDutyStatus(DriverItemModel driver, String newStatus) async {
    try {
      final res = await FleetService.to.updateDriverStatus(driver.id, newStatus);
      if (res.success) {
        Get.snackbar(
          'Status Updated',
          '${driver.name} duty status set to ${newStatus.toUpperCase()}',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await loadDrivers();
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to update duty status',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> verifyDriverKYC(DriverItemModel driver) async {
    try {
      final res = await FleetService.to.verifyDriverDocuments(driver.id);
      if (res.success) {
        Get.snackbar(
          'KYC Verified',
          '${driver.name} documents verified successfully!',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await loadDrivers();
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to verify driver',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  void confirmDeleteDriver(DriverItemModel driver) {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Delete Driver Profile',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        content: Text(
          'Are you sure you want to delete "${driver.name}" (${driver.displayBadgeId}) from the roster? This will unassign any active buses.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              await _executeDeleteDriver(driver);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Delete Driver', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _executeDeleteDriver(DriverItemModel driver) async {
    try {
      final res = await FleetService.to.deleteDriver(driver.id);
      if (res.success) {
        Get.snackbar(
          'Driver Deleted',
          'Driver ${driver.name} removed successfully!',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await loadDrivers();
      } else {
        Get.snackbar(
          'Delete Failed',
          res.message ?? 'Could not delete driver',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> goToAddDriver() async {
    final result = await Get.toNamed(Routes.ADD_DRIVER);
    if (result == true) {
      await loadDrivers();
    }
  }

  Future<void> goToEditDriver(DriverItemModel driver) async {
    final result = await Get.toNamed(Routes.ADD_DRIVER, arguments: driver);
    if (result == true) {
      await loadDrivers();
    }
  }

  Future<void> goToDriverDetails(DriverItemModel driver) async {
    final result = await Get.toNamed(Routes.DRIVER_DETAILS, arguments: driver);
    if (result == true) {
      await loadDrivers();
    }
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
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
                      'Drivers Roster',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Row(
                    children: [
                      // IconButton(
                      //   icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                      //   tooltip: 'Refresh Roster',
                      //   onPressed: controller.loadDrivers,
                      // ),
                      Container(
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF9333EA).withOpacity(0.25),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap:  controller.goToAddDriver,
                            borderRadius: BorderRadius.circular(12),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Icon(Icons.person_add_rounded, color: Colors.white, size: 20),
                                  SizedBox(width: 6),
                                  Text(
                                    'Onboard Driver',
                                    style: TextStyle(
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
                      // ElevatedButton.icon(
                      //   onPressed: controller.goToAddDriver,
                      //   style: ElevatedButton.styleFrom(
                      //     backgroundColor: const Color(0xFF10B981),
                      //     padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      //   ),
                      //   icon: const Icon(Icons.person_add_rounded, size: 16, color: Colors.white),
                      //   label: const Text(
                      //     'Onboard Driver',
                      //     style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      //   ),
                      // ),
                    ],
                  ),

              ],
            ),
          ),

          // 4-Card Stats Strip (Matching AdminDriversPage.jsx)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Obx(
              () => Row(
                children: [
                  Expanded(
                    child: _buildStatCard('TOTAL ROSTER', '${controller.totalDriversCount}', Colors.white),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildStatCard('VERIFIED', '${controller.verifiedCount}', const Color(0xFF10B981)),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildStatCard('EXPIRING / PEND', '${controller.pendingApprovalCount + controller.dlExpiryAlertsCount}', const Color(0xFFF59E0B)),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildStatCard('SUSPENDED', '${controller.complianceBlockedCount}', const Color(0xFFEF4444)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Search Input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              height: 46,
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
                  hintText: 'Search by Driver Name, Badge ID, DL or Depot...',
                  hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),

          // Filter Tab Pills (Matching AdminDriversPage.jsx)
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Obx(
              () => Row(
                children: [
                  _buildTabPill(controller, 'All', controller.totalDriversCount),
                  _buildTabPill(controller, 'On Duty', controller.onDutyCount),
                  _buildTabPill(controller, 'Pending Approval', controller.pendingApprovalCount),
                  _buildTabPill(controller, 'Verified', controller.verifiedCount),
                  _buildTabPill(controller, 'DL Expiry Alerts', controller.dlExpiryAlertsCount),
                ],
              ),
            ),
          ),

          const SizedBox(height: 10),

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
                      const Text(
                        'No drivers found on roster',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 14),
                      ),
                      const SizedBox(height: 14),
                      CustomButton(
                        text: 'Add First Driver',
                        prefixIcon: const Icon(Icons.add, size: 16, color: Colors.white),
                        onTap: controller.goToAddDriver,
                        width: 200,
                        height: 42,
                      ),
                    ],
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: controller.loadDrivers,
                color: const Color(0xFF10B981),
                backgroundColor: AppColors.cardBg,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  itemCount: controller.filteredDrivers.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final driver = controller.filteredDrivers[index];
                    return _buildDriverCard(context, controller, driver);
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String count, Color countColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1.1),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 0.4),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            count,
            style: TextStyle(color: countColor, fontSize: 14, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildTabPill(DriverStaffController controller, String label, int count) {
    final isSelected = controller.selectedTab.value == label;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () => controller.selectTab(label),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            color: isSelected ? null : AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? Colors.transparent : AppColors.cardBorder,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.gradientPink.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                ),
              ),
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white.withValues(alpha: 0.25) : AppColors.inputBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textMuted,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDriverCard(BuildContext context, DriverStaffController controller, DriverItemModel d) {
    Color dutyColor = const Color(0xFF64748B);
    String dutyLabel = d.status.toUpperCase();
    if (d.isOnDuty) {
      dutyColor = const Color(0xFF3B82F6);
      dutyLabel = 'ON DUTY';
    } else if (d.isAvailable) {
      dutyColor = const Color(0xFF10B981);
      dutyLabel = 'AVAILABLE';
    } else if (d.isPendingApproval) {
      dutyColor = const Color(0xFFF59E0B);
      dutyLabel = 'PENDING';
    } else if (d.isComplianceBlocked) {
      dutyColor = const Color(0xFFEF4444);
      dutyLabel = 'BLOCKED';
    }

    final avatarUrl = ApiConstants.resolveFileUrl(d.avatarUrl);

    return InkWell(
      onTap: () => controller.goToDriverDetails(d),
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
            // Top Row: Avatar + Details + Badges
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar with Duty status dot
                Stack(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 1.5),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: avatarUrl.isNotEmpty
                          ? Image.network(
                              avatarUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => _buildAvatarInitial(d),
                            )
                          : _buildAvatarInitial(d),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        width: 11,
                        height: 11,
                        decoration: BoxDecoration(
                          color: dutyColor,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.cardBg, width: 1.5),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),

                // Name & Badge ID
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              d.displayBadgeId,
                              style: const TextStyle(
                                color: Color(0xFF60A5FA),
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                          if (d.bloodGroup.isNotEmpty) ...[
                            const SizedBox(width: 4),
                            Text(
                              '• ${d.bloodGroup}',
                              style: const TextStyle(color: Color(0xFFF87171), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 3),
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
                          Text(d.phone.isNotEmpty ? d.phone : '—', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                        ],
                      ),
                    ],
                  ),
                ),

                // Duty & KYC Badges
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: dutyColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: dutyColor.withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(width: 5, height: 5, decoration: BoxDecoration(color: dutyColor, shape: BoxShape.circle)),
                          const SizedBox(width: 4),
                          Text(dutyLabel, style: TextStyle(color: dutyColor, fontSize: 9, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (d.kycRejected)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
                        ),
                        child: const Text('KYC REJECTED', style: TextStyle(color: Color(0xFFEF4444), fontSize: 8, fontWeight: FontWeight.bold)),
                      )
                    else if (d.isVerified)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                        ),
                        child: const Text('VERIFIED', style: TextStyle(color: Color(0xFF10B981), fontSize: 8, fontWeight: FontWeight.bold)),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                        ),
                        child: const Text('DOCS PENDING', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 8, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Middle Info Strip: DL Number & Depot / Shift
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.inputBorder, width: 1),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('DL NUMBER', style: TextStyle(color: AppColors.textMuted, fontSize: 8, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 1),
                        Text(
                          d.licenseNumber,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(width: 1, height: 26, color: AppColors.cardBorder),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('DEPOT & SHIFT', style: TextStyle(color: AppColors.textMuted, fontSize: 8, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 1),
                        Text(
                          '${d.displayDepot} • ${d.displayShift.split('(')[0].trim()}',
                          style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w500),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Bottom Info: Rating, Assigned Bus & 3-Dot Action Menu
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.star_rounded, size: 15, color: Color(0xFFFBBF24)),
                    const SizedBox(width: 3),
                    Text(
                      d.rating.toStringAsFixed(1),
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                      decoration: BoxDecoration(
                        color: d.assignedVehicleReg != null
                            ? const Color(0xFF6366F1).withValues(alpha: 0.15)
                            : Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: d.assignedVehicleReg != null
                              ? const Color(0xFF6366F1).withValues(alpha: 0.4)
                              : Colors.white.withValues(alpha: 0.15),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.directions_bus_rounded,
                            size: 11,
                            color: d.assignedVehicleReg != null ? const Color(0xFF818CF8) : AppColors.textMuted,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            d.displayBus,
                            style: TextStyle(
                              color: d.assignedVehicleReg != null ? const Color(0xFF818CF8) : AppColors.textMuted,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // 3-Dot Action Menu (Matching AdminDriversPage.jsx)
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white70, size: 20),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  color: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  onSelected: (action) {
                    if (action == 'view') {
                      controller.goToDriverDetails(d);
                    } else if (action == 'edit') {
                      controller.goToEditDriver(d);
                    } else if (action == 'available') {
                      controller.toggleDutyStatus(d, 'available');
                    } else if (action == 'off_duty') {
                      controller.toggleDutyStatus(d, 'off_duty');
                    } else if (action == 'verify') {
                      controller.verifyDriverKYC(d);
                    } else if (action == 'delete') {
                      controller.confirmDeleteDriver(d);
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'view',
                      child: Row(
                        children: [
                          Icon(Icons.remove_red_eye_outlined, color: Color(0xFF38BDF8), size: 16),
                          SizedBox(width: 8),
                          Text('View KYC Dossier', style: TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit_outlined, color: Color(0xFF94A3B8), size: 16),
                          SizedBox(width: 8),
                          Text('Edit Roster Details', style: TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                      ),
                    ),
                    if (!d.isAvailable)
                      const PopupMenuItem(
                        value: 'available',
                        child: Row(
                          children: [
                            Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 16),
                            SizedBox(width: 8),
                            Text('Set Active (Available)', style: TextStyle(color: Color(0xFF10B981), fontSize: 12)),
                          ],
                        ),
                      ),
                    if (d.isAvailable || d.isOnDuty)
                      const PopupMenuItem(
                        value: 'off_duty',
                        child: Row(
                          children: [
                            Icon(Icons.pause_circle_outline_rounded, color: Color(0xFF94A3B8), size: 16),
                            SizedBox(width: 8),
                            Text('Set Off Duty', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          ],
                        ),
                      ),
                    if (!d.isVerified)
                      const PopupMenuItem(
                        value: 'verify',
                        child: Row(
                          children: [
                            Icon(Icons.verified_outlined, color: Color(0xFF14B8A6), size: 16),
                            SizedBox(width: 8),
                            Text('Verify Driver KYC', style: TextStyle(color: Color(0xFF14B8A6), fontSize: 12)),
                          ],
                        ),
                      ),
                    const PopupMenuDivider(height: 6),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 16),
                          SizedBox(width: 8),
                          Text('Delete Driver', style: TextStyle(color: Color(0xFFEF4444), fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarInitial(DriverItemModel d) {
    return Center(
      child: Text(
        d.name.isNotEmpty ? d.name[0].toUpperCase() : 'D',
        style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }
}
