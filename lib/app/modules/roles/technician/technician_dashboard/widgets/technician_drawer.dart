import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
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
                  _buildSectionHeader('PRIMARY NAVIGATION'),
                  _buildDrawerItem(
                    title: 'Overview Dashboard',
                    icon: 'assets/icons/home.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 0,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(0);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'Field Work Orders',
                    icon: 'assets/icons/fleet_operator_icons/tripsA.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 1,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(1);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'Edge Devices & Displays',
                    icon: 'assets/icons/tv.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 2,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(2);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'Hardware Configuration',
                    icon: 'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 3,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(3);
                    },
                  ),

                  const SizedBox(height: 12),
                  _buildSectionHeader('HARDWARE & DIAGNOSTICS'),
                  _buildDrawerItem(
                    title: 'GPS Installation',
                    icon: 'assets/icons/location.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.GPS_INSTALLATION);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'Diagnostics Self-Test',
                    icon: 'assets/icons/doctor.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.DEVICE_DIAGNOSTICS);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'Connectivity Matrix',
                    icon: 'assets/icons/hotspot.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.CONNECTIVITY_TROUBLESHOOTING);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'Hardware Status & Health',
                    icon: 'assets/icons/monitor_heart.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.HARDWARE_STATUS);
                    },
                  ),

                  const SizedBox(height: 12),
                  _buildSectionHeader('ACCOUNT & SETTINGS'),
                  _buildDrawerItem(
                    title: 'Alerts & Notifications',
                    icon: 'assets/icons/notification.svg',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.ALERT_NOTIFICATION);
                    },
                  ),
                  _buildDrawerItem(
                    title: 'Technician Profile',
                    icon: 'assets/icons/profile.svg',
                    isSelected: dashboardCtrl.selectedNavIndex.value == 4,
                    onTap: () {
                      Get.back();
                      dashboardCtrl.onNavItemTapped(4);
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
                title: const Text(
                  'Logout Portal',
                  style: TextStyle(
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
