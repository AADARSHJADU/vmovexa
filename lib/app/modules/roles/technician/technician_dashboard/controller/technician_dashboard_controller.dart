import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
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
    selectedNavIndex.value = 3;
  }

  void goToProfile() {
    selectedNavIndex.value = 4;
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

  Future<void> logout() async {
    try {
      if (Get.isRegistered<AuthService>()) {
        await AuthService.to.logout();
      }
    } catch (_) {}
    Get.offAllNamed(Routes.LOGIN);
  }
}
