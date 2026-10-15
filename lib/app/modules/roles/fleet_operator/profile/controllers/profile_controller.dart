import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/models/user_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class FleetOpProfileController extends GetxController {
  final Rx<UserModel?> user = Rx<UserModel?>(null);
  final RxBool isLoading = false.obs;

  // Stat metrics (Matching Admin Panel Profile: Fleets, Vehicles, Drivers)
  final RxInt fleetCount = 0.obs;
  final RxInt vehicleCount = 0.obs;
  final RxInt driverCount = 0.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfileData();
  }

  /// Initial load or refresh of profile and KPI counts
  Future<void> loadProfileData() async {
    // 1. Immediately read from local storage if available for instant UI
    if (Get.isRegistered<StorageService>()) {
      final cachedUser = StorageService.to.getUser();
      if (cachedUser != null) {
        user.value = cachedUser;
      }
    }

    try {
      isLoading.value = true;

      // 2. Fetch fresh user details via GET /auth/me
      if (Get.isRegistered<AuthService>()) {
        final meRes = await AuthService.to.getMe();
        if (meRes.success && meRes.data != null) {
          user.value = meRes.data;
        }
      }

      // 3. Fetch fresh fleet KPIs (fleets, vehicles, drivers)
      if (Get.isRegistered<FleetService>()) {
        final kpiRes = await FleetService.to.getDashboardKpis();
        if (kpiRes.success && kpiRes.data != null) {
          final kpis = kpiRes.data!;
          fleetCount.value = kpis.totalFleets;
          vehicleCount.value = kpis.totalVehicles;
          driverCount.value = kpis.totalDrivers;
        }
      }
    } catch (e) {
      debugPrint('Error loading fleet operator profile: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Operator full display name
  String get displayName => user.value?.name ?? 'Fleet Operator';

  /// Operator display role
  String get displayRole => user.value?.displayRole ?? 'Fleet Operator';

  /// Organization / Company Name
  String get organizationName =>
      user.value?.organization?.name ??
      user.value?.organizationName ??
      'VMOVEXA Transport Solutions';

  /// Operator ID code
  String get operatorId =>
      user.value?.enrollmentNo ??
      user.value?.code ??
      (user.value?.id != null ? 'OP-${user.value!.id}' : 'OP-987654');

  /// Avatar URL
  String? get avatarUrl {
    final raw = user.value?.avatarUrl;
    if (raw == null || raw.trim().isEmpty) return null;
    return ApiConstants.resolveFileUrl(raw);
  }

  /// Logout confirmation dialog & action
  void confirmLogout() {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.redAccent.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(Icons.logout_rounded, color: Colors.redAccent, size: 26),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Logout Account',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Are you sure you want to end your session and log out of the Fleet Console?',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF334155)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text('Cancel', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        Get.back();
                        await logout();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEF4444),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        'Logout',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Perform logout
  Future<void> logout() async {
    try {
      if (Get.isRegistered<AuthService>()) {
        await AuthService.to.logout();
      } else if (Get.isRegistered<StorageService>()) {
        await StorageService.to.clearAuth();
      }
    } catch (_) {
      if (Get.isRegistered<StorageService>()) {
        await StorageService.to.clearAuth();
      }
    } finally {
      Get.offAllNamed(Routes.LOGIN);
    }
  }
}
