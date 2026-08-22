import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

import '../../model/profile_settings_models.dart';

class FinanceSettingsController extends GetxController {
  // ---------------- Identity header ----------------
  final RxString fullName = 'Riya Agarwal'.obs;
  final RxString roleLabel = 'Finance Manager'.obs;
  final RxString email = 'riya.agarwal@vmovexa.com'.obs;
  final RxString phone = '+91 98765 43210'.obs;
  final RxString initials = 'RA'.obs;

  // ---------------- Preferences (shown as trailing text in the list) ----------------
  final RxString language = 'English'.obs;
  final RxString timeZone = 'IST (UTC +05:30)'.obs;
  final RxString theme = 'Dark'.obs;
  final RxString appVersion = 'v1.4.0'.obs;

  // ---------------- Sections ----------------
  final RxList<SettingsMenuItem> accountItems = <SettingsMenuItem>[].obs;
  final RxList<SettingsMenuItem> preferenceItems = <SettingsMenuItem>[].obs;
  final RxList<SettingsMenuItem> appItems = <SettingsMenuItem>[].obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _buildMenus();
  }

  void _buildMenus() {
    accountItems.assignAll([
      SettingsMenuItem(
        id: 'profile_information',
        icon: Icons.person_outline,
        title: 'Profile Information',
        subtitle: 'View and update your personal information',
        route: '/finance-profile',
      ),
      SettingsMenuItem(
        id: 'change_password',
        icon: Icons.lock_outline,
        title: 'Change Password',
        subtitle: 'Update your account password',
        route: '/change-password',
      ),
      // SettingsMenuItem(
      //   id: 'account_activity',
      //   icon: Icons.work_outline,
      //   title: 'Account Activity',
      //   subtitle: 'View your recent account activity and sessions',
      //   route: '/account-activity',
      // ),
    ]);

    preferenceItems.assignAll([
      SettingsMenuItem(
        id: 'notification_preferences',
        icon: Icons.notifications_none_rounded,
        title: 'Notification Preferences',
        subtitle: 'Manage email and in-app notification settings',
        route: Routes.FINANCE_NOTIFICATION_SETTINGS,
      ),
      // SettingsMenuItem(
      //   id: 'language',
      //   icon: Icons.public,
      //   title: 'Language',
      //   subtitle: 'Choose your preferred language',
      //   trailingText: language.value,
      //   route: '/language-settings',
      // ),
      // SettingsMenuItem(
      //   id: 'time_zone',
      //   icon: Icons.access_time,
      //   title: 'Time Zone',
      //   subtitle: 'Set your preferred time zone',
      //   trailingText: timeZone.value,
      //   route: '/timezone-settings',
      // ),
      // SettingsMenuItem(
      //   id: 'theme',
      //   icon: Icons.palette_outlined,
      //   title: 'Theme',
      //   subtitle: 'Choose your preferred app theme',
      //   trailingText: theme.value,
      //   route: '/theme-settings',
      // ),
    ]);

    appItems.assignAll([
      // SettingsMenuItem(
      //   id: 'data_storage',
      //   icon: Icons.storage_outlined,
      //   title: 'Data & Storage',
      //   subtitle: 'Manage app data and storage usage',
      //   route: '/data-storage',
      // ),
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

  void onHeaderTap() => Get.toNamed('/finance-profile');

  void onMenuItemTap(SettingsMenuItem item) {
    if (item.id == 'logout') {
      onLogout();
      return;
    }
    Get.toNamed(item.route);
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
            onPressed: () {
              Get.back();
              // TODO: clear session/tokens
              Get.offAllNamed('/login');
            },
            child: const Text('Log Out', style: TextStyle(color: Color(0xFFFF4D4D), fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
