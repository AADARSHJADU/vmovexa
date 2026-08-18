import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/model/driver_document.dart';

class DriverProfileController extends GetxController {
  // ==========================================================
  // Identity
  // ==========================================================
  final RxString fullName = 'Rohan Mehta'.obs;
  final RxString roleLabel = 'Fleet Operator'.obs;
  final RxString companyName = 'VMOVEXA Transport Solutions'.obs;
  final RxString driverId = 'DRV987654'.obs;
  final RxString avatarUrl = ''.obs; // empty => placeholder icon

  // ==========================================================
  // Stats (Routes / Schedules / Notifications / Documents)
  // ==========================================================
  final RxInt routesCount = 24.obs;
  final RxInt schedulesCount = 5.obs;
  final RxInt notificationsCount = 12.obs;
  final RxInt documentsCount = 4.obs;

  // ==========================================================
  // Documents
  // ==========================================================
  final RxList<DriverDocument> documents = <DriverDocument>[].obs;

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
      documents.assignAll(_mockDocuments());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    await fetchProfile();
  }

  // ==========================================================
  // Actions
  // ==========================================================
  void onOpenSettings() {
    Get.toNamed('/settings');
  }

  void onViewCompanyDetails() {
    // TODO: navigate to fleet/company details screen
  }

  void onChangeAvatar() {
    // TODO: open image picker and upload avatar
  }

  void onStatTap(String label) {
    switch (label) {
      case 'Routes':
        Get.toNamed('/my-route');
        break;
      case 'Schedules':
        Get.toNamed('/schedule');
        break;
      case 'Notifications':
        Get.toNamed('/notifications');
        break;
      case 'Documents':
      // stays on this screen — documents are listed below
        break;
    }
  }

  void onPersonalInformationTap() {
    Get.toNamed('/personal-information');
  }

  void onSecurityTap() {
    Get.toNamed('/account-security');
  }

  void onNotificationPreferencesTap() {
    Get.toNamed('/notification-settings');
  }

  void onDocumentTap(DriverDocument document) {
    Get.toNamed('/document-detail', arguments: {'documentId': document.id});
  }

  void onHelpSupportTap() {
    Get.toNamed('/help-support');
  }

  void onAboutTap() {
    Get.toNamed('/about');
  }

  void onLogout() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Log Out', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
        content: const Text(
          'Are you sure you want to log out of your account?',
          style: TextStyle(color: Colors.white60, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              // TODO: clear session/tokens and navigate to the login screen
              Get.offAllNamed('/login');
            },
            child: const Text('Log Out', style: TextStyle(color: Color(0xFFFF4D4D), fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // Mock data
  // ==========================================================
  List<DriverDocument> _mockDocuments() {
    return [
      DriverDocument(
        id: 'driving_license',
        title: 'Driving License',
        icon: Icons.badge_outlined,
        status: DocumentStatus.verified,
        statusLabel: 'Verified',
      ),
      DriverDocument(
        id: 'insurance',
        title: 'Insurance',
        icon: Icons.shield_outlined,
        status: DocumentStatus.verified,
        statusLabel: 'Verified',
      ),
      DriverDocument(
        id: 'medical_certificate',
        title: 'Medical Certificate',
        icon: Icons.description_outlined,
        status: DocumentStatus.underReview,
        statusLabel: 'Under Review',
      ),
      DriverDocument(
        id: 'other_documents',
        title: 'Other Documents',
        icon: Icons.folder_outlined,
        status: DocumentStatus.uploaded,
        statusLabel: '2 Uploaded',
      ),
    ];
  }
}