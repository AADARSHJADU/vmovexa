import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../../model/profile_settings_models.dart';

class FinanceSettingsController extends GetxController {
  // ---------------- Identity header ----------------
  final RxString fullName = 'Finance Manager'.obs;
  final RxString roleLabel = 'Finance Officer'.obs;
  final RxString email = ''.obs;
  final RxString phone = ''.obs;
  final RxString initials = 'FM'.obs;

  // ---------------- Preferences (shown as trailing text in the list) ----------------
  final RxString language = 'English'.obs;
  final RxString timeZone = 'IST (UTC +05:30)'.obs;
  final RxString theme = 'Dark'.obs;
  final RxString appVersion = 'v1.4.0'.obs;

  // ---------------- Corporate Finance Settings ----------------
  final RxMap<String, dynamic> corporateSettings = <String, dynamic>{}.obs;

  // ---------------- Sections ----------------
  final RxList<SettingsMenuItem> accountItems = <SettingsMenuItem>[].obs;
  final RxList<SettingsMenuItem> preferenceItems = <SettingsMenuItem>[].obs;
  final RxList<SettingsMenuItem> appItems = <SettingsMenuItem>[].obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadUserHeader();
    _buildMenus();
    fetchCorporateSettings();
  }

  void _loadUserHeader() {
    try {
      if (Get.isRegistered<StorageService>()) {
        final u = StorageService.to.getUser();
        if (u != null) {
          if (u.name != null && u.name!.isNotEmpty) fullName.value = u.name!;
          if (u.email != null && u.email!.isNotEmpty) email.value = u.email!;
          if (u.phone != null && u.phone!.isNotEmpty) phone.value = u.phone!;
          if (u.role != null && u.role!.isNotEmpty) {
            roleLabel.value = u.role!.replaceAll('ROLE-', '').replaceAll('-', ' ');
          }
          if (fullName.value.isNotEmpty) initials.value = fullName.value[0].toUpperCase();
        }
      }
    } catch (_) {}
  }

  Future<void> fetchCorporateSettings() async {
    isLoading.value = true;
    try {
      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.getSettings();
        if (res.success && res.data != null && res.data!.isNotEmpty) {
          corporateSettings.assignAll(res.data!);
        }
      }
    } catch (_) {} finally {
      isLoading.value = false;
    }
  }

  void _buildMenus() {
    accountItems.assignAll([
      SettingsMenuItem(
        id: 'profile_information',
        icon: Icons.person_outline,
        title: 'Profile Information',
        subtitle: 'View and update your personal information',
        route: Routes.FINANCE_PROFILE,
      ),
      SettingsMenuItem(
        id: 'change_password',
        icon: Icons.lock_outline,
        title: 'Change Password',
        subtitle: 'Update your account password',
        route: Routes.CHANGE_PASSWORD,
      ),
    ]);

    preferenceItems.assignAll([
      SettingsMenuItem(
        id: 'notification_preferences',
        icon: Icons.notifications_none_rounded,
        title: 'Notification Preferences',
        subtitle: 'Manage email and in-app notification settings',
        route: Routes.FINANCE_NOTIFICATION_SETTINGS,
      ),
    ]);

    appItems.assignAll([
      SettingsMenuItem(
        id: 'about',
        icon: Icons.info_outline,
        title: 'About VMOVEXA',
        subtitle: 'App version and information',
        trailingText: appVersion.value,
        route: '/about',
      ),
      SettingsMenuItem(
        id: 'help_support',
        icon: Icons.headset_mic_outlined,
        title: 'Help & Support',
        subtitle: 'Get help and contact support',
        route: Routes.FINANCE_HELP_SUPPORT,
      ),
      SettingsMenuItem(
        id: 'logout',
        icon: Icons.logout,
        title: 'Logout',
        subtitle: 'Sign out from your account',
        isDanger: true,
        route: '',
      ),
    ]);
  }

  // ---------------- Actions ----------------
  void onBackPressed() => Get.back();

  void onHeaderTap() => Get.toNamed(Routes.FINANCE_PROFILE);

  void onMenuItemTap(SettingsMenuItem item) {
    if (item.id == 'logout') {
      onLogout();
      return;
    }
    if (item.route.isNotEmpty) {
      Get.toNamed(item.route);
    }
  }

  void onLogout() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Log Out', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to log out of your account?', style: TextStyle(color: Colors.white60, fontSize: 13)),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Get.back();
              try {
                if (Get.isRegistered<AuthService>()) {
                  await AuthService.to.logout();
                } else if (Get.isRegistered<StorageService>()) {
                  await StorageService.to.clearAuth();
                }
              } catch (_) {}
              Get.offAllNamed(Routes.LOGIN);
            },
            child: const Text('Log Out', style: TextStyle(color: Color(0xFFFF4D4D), fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
