import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class DriverDashboardController extends GetxController {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final RxInt selectedNavIndex = 0.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map && args.containsKey('tab')) {
      selectedNavIndex.value = args['tab'];
    }
  }

  void openDrawer() {
    if (scaffoldKey.currentState?.isDrawerOpen != true) {
      scaffoldKey.currentState?.openDrawer();
    }
  }

  void closeDrawer() {
    if (scaffoldKey.currentState?.isDrawerOpen == true) {
      scaffoldKey.currentState?.closeDrawer();
    }
  }

  void setNavIndex(int index) {
    if (scaffoldKey.currentState?.isDrawerOpen == true) {
      scaffoldKey.currentState?.closeDrawer();
    }
    selectedNavIndex.value = index;
  }

  void onNavItemTapped(int index) {
    selectedNavIndex.value = index;
  }

  void goToFleetList() {
    Get.toNamed(Routes.FLEET_LIST);
  }

  void goToLiveTracking() {
    Get.toNamed(Routes.LIVE_TRACKING);
  }

  void goToReports() {
    selectedNavIndex.value = 2;
  }

  void goToVehicles() {
    Get.toNamed(Routes.ADD_VEHICLE);
  }

  void goToDrivers() {
    Get.toNamed(Routes.ADD_DRIVER);
  }

  void goToGpsDevices() {
    Get.toNamed(Routes.ADD_GPS);
  }

  Future<void> logout() async {
    if (Get.isRegistered<AuthService>()) {
      await AuthService.to.logout();
    }
    Get.offAllNamed(Routes.LOGIN);
  }
}


