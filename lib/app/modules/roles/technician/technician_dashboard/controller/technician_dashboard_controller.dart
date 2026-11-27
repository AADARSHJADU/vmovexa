import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../../../../../routes/app_routes.dart';

class TechnicianDashboardController extends GetxController {
  final RxInt selectedNavIndex = 0.obs;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map && args.containsKey('tab')) {
      selectedNavIndex.value = args['tab'];
    }
  }

  void onNavItemTapped(int index) {
    selectedNavIndex.value = index;
  }

  void openDrawer() {
    scaffoldKey.currentState?.openDrawer();
  }

  void goToWorkOrders() {
    selectedNavIndex.value = 1;
  }

  void goToEdgeDevices() {
    selectedNavIndex.value = 2;
  }

  void goToHardwareConfig() {
    Get.toNamed(Routes.HARDWARE_CONFIGURATION);
  }

  void goToProfile() {
    selectedNavIndex.value = 3;
  }

  void goToGpsInstallation() {
    Get.toNamed(Routes.GPS_INSTALLATION);
  }

  void goToDiagnostics() {
    Get.toNamed(Routes.DEVICE_DIAGNOSTICS);
  }

  void goToConnectivity() {
    Get.toNamed(Routes.CONNECTIVITY_TROUBLESHOOTING);
  }

  void goToHardwareStatus() {
    Get.toNamed(Routes.HARDWARE_STATUS);
  }

  void goToNotifications() {
    Get.toNamed(Routes.ALERT_NOTIFICATION);
  }

  void confirmLogout() {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 26),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'confirm_logout'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'logout_technician_confirm_msg'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        Get.back();
                        await logout();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            'log_out'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
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

  Future<void> logout() async {
    try {
      if (Get.isRegistered<AuthService>()) {
        await AuthService.to.logout();
      }
    } catch (_) {}
    Get.offAllNamed(Routes.LOGIN);
  }
}
