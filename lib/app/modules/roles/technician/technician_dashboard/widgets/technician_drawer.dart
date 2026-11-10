import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/widgets/language_selector_sheet.dart';
import '../controller/technician_dashboard_controller.dart';

class TechnicianDrawer extends StatelessWidget {
  const TechnicianDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final dashboardCtrl = Get.find<TechnicianDashboardController>();

    return Drawer(
      backgroundColor: const Color(0xFF0A0C14),
      child: SafeArea(
        child: Column(
          children: [
            // Header with Live Profile Avatar & Details
            _buildDrawerHeader(dashboardCtrl),

            // Navigation List Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                children: [
                  _buildSectionHeader('primary_navigation_caps'.tr),
                  _buildDrawerItem(
                    title: 'overview_dashboard'.tr,
                    icon: 'assets/icons/home.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 0,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(0);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'field_work_orders'.tr,
                    icon: 'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 1,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(1);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'edge_devices_displays'.tr,
                    icon: 'assets/icons/tv.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 2,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(2);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'hardware_configuration'.tr,
                    icon: 'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 3,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(3);
                    },
                  ),

                  const SizedBox(height: 12),
                  _buildSectionHeader('hardware_diagnostics_caps'.tr),
                  _buildDrawerItem(
                    title: 'gps_installation'.tr,
                    icon: 'assets/icons/location.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.GPS_INSTALLATION);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'diagnostics_self_test'.tr,
                    icon: 'assets/icons/doctor.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.DEVICE_DIAGNOSTICS);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'connectivity_matrix'.tr,
                    icon: 'assets/icons/hotspot.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.CONNECTIVITY_TROUBLESHOOTING);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'hardware_status_health'.tr,
                    icon: 'assets/icons/monitor_heart.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.HARDWARE_STATUS);
                    },
                  ),

                  const SizedBox(height: 12),
                  _buildSectionHeader('account_settings_caps'.tr),
                  _buildDrawerItem(
                    title: 'alerts_notifications'.tr,
                    icon: 'assets/icons/notification.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.ALERT_NOTIFICATION);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'technician_profile'.tr,
                    icon: 'assets/icons/profile.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 4,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(4);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'change_language'.tr,
                    icon: 'assets/icons/settings.svg',
                    onTap: () {
                      Get.back();
                      LanguageSelectorSheet.show(context);
                    },
                  ),
                ],
              ),
            ),

            // Logout Footer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
              ),
              child: ListTile(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                leading: const Icon(Icons.logout_rounded, color: Color(0xFFFF4D4D), size: 20),
                title: Text(
                  'log_out'.tr,
                  style: const TextStyle(
                    color: Color(0xFFFF4D4D),
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                onTap: () {
                  Get.back();
                  dashboardCtrl.logout();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerHeader(TechnicianDashboardController controller) {
    final user = Get.isRegistered<StorageService>() ? StorageService.to.getUser() : null;
    final userName = user?.name ?? 'Central Technician';
    final userEmail = user?.email ?? 'tech@vmovexa.com';
    final userRole = user?.role ?? 'ROLE-TECHNICIAN';
    final rawAvatar = user?.avatarUrl;
    final avatarUrl = ApiConstants.resolveFileUrl(rawAvatar);

    return InkWell(
      onTap: () {
        Get.back();
        controller.onNavItemTapped(4); // Profile tab
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: avatarUrl.isEmpty ? AppColors.primaryGradient : null,
                border: Border.all(color: const Color(0xFF6366F1), width: 1.8),
                color: const Color(0xFF0F172A),
              ),
              child: ClipOval(
                child: avatarUrl.isNotEmpty
                    ? Image.network(
                        avatarUrl,
                        width: 48,
                        height: 48,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => _buildFallbackInitial(userName),
                      )
                    : _buildFallbackInitial(userName),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    userName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    userEmail,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 11,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      userRole.replaceAll('ROLE-', '').replaceAll('-', ' '),
                      style: const TextStyle(
                        color: Color(0xFF818CF8),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildFallbackInitial(String name) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'T';
    return Center(
      child: Text(
        initial,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 12, top: 10, bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.textMuted,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required String title,
    required String icon,
    required VoidCallback onTap,
    bool isSelected = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 3),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFF6366F1).withValues(alpha: 0.12) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: isSelected
            ? Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.35))
            : null,
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
        leading: SvgPicture.asset(
          icon,
          width: 18,
          height: 18,
          colorFilter: ColorFilter.mode(
            isSelected ? const Color(0xFF818CF8) : AppColors.textMuted,
            BlendMode.srcIn,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
        trailing: isSelected
            ? Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF6366F1),
                ),
              )
            : null,
        onTap: onTap,
      ),
    );
  }
}
