import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../model/profile_settings_models.dart';

class FinanceProfileController extends GetxController {
  // ---------------- Identity ----------------
  final RxString fullName = 'Riya Agarwal'.obs;
  final RxString roleLabel = 'Finance Manager'.obs;
  final RxString email = 'riya.agarwal@vmovexa.com'.obs;
  final RxString phone = '+91 98765 43210'.obs;
  final RxString initials = 'RA'.obs;
  final RxBool isActive = true.obs;

  // ---------------- Profile Details ----------------
  final RxList<ProfileDetailRow> profileDetails = <ProfileDetailRow>[].obs;

  // ---------------- Documents ----------------
  final RxInt documentsCount = 3.obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      profileDetails.assignAll([
        ProfileDetailRow(id: 'full_name', icon: Icons.person_outline, label: 'Full Name', value: fullName.value),
        ProfileDetailRow(id: 'email', icon: Icons.mail_outline, label: 'Email Address', value: email.value),
        ProfileDetailRow(id: 'mobile', icon: Icons.call_outlined, label: 'Mobile Number', value: phone.value),
        ProfileDetailRow(id: 'role', icon: Icons.badge_outlined, label: 'Role', value: roleLabel.value),
        ProfileDetailRow(id: 'department', icon: Icons.apartment_outlined, label: 'Department', value: 'Finance'),
        ProfileDetailRow(id: 'joined_on', icon: Icons.calendar_today_outlined, label: 'Joined On', value: '15 Jan 2024'),
        ProfileDetailRow(id: 'time_zone', icon: Icons.public, label: 'Time Zone', value: 'IST (UTC +05:30)'),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchProfile();

  // ---------------- Actions ----------------
  void onBackPressed() => Get.back();

  void onEditProfile() {
    // TODO: navigate to an edit-profile form pre-filled with the fields above
  }

  void onChangeAvatar() {
    // TODO: open image picker and upload avatar
  }

  void onDetailRowTap(ProfileDetailRow row) {
    // TODO: open an edit sheet/screen for this specific field
  }

  void onDocumentsTap() {
     // Get.toNamed('/driver-documents');
  }

  void onViewAllDocuments() => onDocumentsTap();

  void onSecurityTap() {
    Get.toNamed('/account-security');
  }

  void onSettingsTap() {
    Get.toNamed('/finance-settings');
  }
}
