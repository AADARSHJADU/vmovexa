import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../model/profile_model.dart';
import '../../technician_dashboard/controller/technician_dashboard_controller.dart';
import '../../../../../routes/app_routes.dart';

class ProfileController extends GetxController {
  final profile = Rxn<TechnicianProfile>();
  final isDarkMode = true.obs;
  final selectedLanguage = 'English'.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfileData();
  }

  void loadProfileData() {
    // Populate mock profile data based on mockup design details
    profile.value = TechnicianProfile(
      name: 'Rahul Sharma',
      role: 'Senior Technician',
      techId: 'TECH-0078',
      employeeId: 'EMP-1456',
      email: 'rahul.sharma@vmovexa.com',
      phoneNumber: '+91 98765 43210',
      dateOfBirth: '15 May 1990',
      gender: 'Male',
      address: 'Bandra East, Mumbai, Maharashtra - 400051',
      department: 'Field Operations',
      reportingManager: 'Amit Verma',
      workLocation: 'Mumbai Zone',
      joinedDate: '10 Jan 2022',
      username: 'rahul.sharma',
    );
  }

  void editProfile() {
    Get.toNamed(Routes.TECHNICIAN_EDIT_PROFILE);
  }

  void changePassword() {
    Get.toNamed(Routes.CHANGE_PASSWORD);
  }

  void goToNotificationSettings() {
    Get.toNamed(Routes.NOTIFICATION_SETTINGS);
  }

  void goToPrivacyPolicy() {
    Get.toNamed(Routes.PRIVACY_POLICY);
  }

  void goToTermsConditions() {
    Get.toNamed(Routes.TERMS_CONDITIONS);
  }

  void goToDeviceSessions() {
    Get.snackbar(
      'Device Sessions',
      'Manage active sessions functionality is coming soon.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF15151F),
      colorText: Colors.white,
    );
  }

  void changeLanguage() {
    // Toggle between English and Hindi as a demonstration
    if (selectedLanguage.value == 'English') {
      selectedLanguage.value = 'Hindi';
      Get.updateLocale(const Locale('hi', 'IN'));
    } else {
      selectedLanguage.value = 'English';
      Get.updateLocale(const Locale('en', 'US'));
    }
  }

  void toggleDarkMode(bool value) {
    isDarkMode.value = value;
    Get.changeThemeMode(value ? ThemeMode.dark : ThemeMode.light);
  }

  void onBackPressed() {
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().selectedNavIndex.value = 0;
    } else {
      Get.back();
    }
  }

  void logout() {
    // if (Get.isRegistered<TechnicianDashboardController>()) {
    //   Get.find<TechnicianDashboardController>().logout();
    // } else {
    //   Get.offAllNamed(Routes.LOGIN);
    // }
  }
}
