import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/technician/profile/view/profile_view.dart';
import '../../../../../theme/app_colors.dart';
import '../../display_devices/view/display_devices_view.dart';
import '../../hardware_configuration/views/hardware_configuration_view.dart';
import '../../work_orders/views/tech_work_orders_view.dart';
import '../../home/view/home_view.dart';
import '../controller/technician_dashboard_controller.dart';
import '../widgets/technician_drawer.dart';

class TechnicianDashboardView extends GetView<TechnicianDashboardController> {
  const TechnicianDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: controller.scaffoldKey,
      drawer: const TechnicianDrawer(),
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 0:
              return const HomeView();
            case 1:
              return const TechWorkOrdersView();
            case 2:
              return DisplayDevicesView();
            case 3:
              return const HardwareConfigurationView();
            case 4:
              return const ProfileView();
            default:
              return const HomeView();
          }
        }),
      ),

      // Bottom Navigation Bar (5 Items: Dashboard, Field Work Order, Edge Device, Hardware Config, Profile)
      bottomNavigationBar: Obx(
        () => Container(
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A),
            border: Border(top: BorderSide(color: Color(0xFF1E293B), width: 1.2)),
          ),
          child: BottomNavigationBar(
            currentIndex: controller.selectedNavIndex.value,
            onTap: controller.onNavItemTapped,
            backgroundColor: const Color(0xFF0F172A),
            type: BottomNavigationBarType.fixed,
            selectedItemColor: const Color(0xFF818CF8),
            unselectedItemColor: AppColors.textMuted,
            selectedFontSize: 10,
            unselectedFontSize: 10,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
            items: [
              BottomNavigationBarItem(
                icon: SvgPicture.asset(
                  'assets/icons/home.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(AppColors.textMuted, BlendMode.srcIn),
                ),
                activeIcon: SvgPicture.asset(
                  'assets/icons/home.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(Color(0xFF818CF8), BlendMode.srcIn),
                ),
                label: 'Dashboard',
              ),
              BottomNavigationBarItem(
                icon: SvgPicture.asset(
                  'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(AppColors.textMuted, BlendMode.srcIn),
                ),
                activeIcon: SvgPicture.asset(
                  'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(Color(0xFF818CF8), BlendMode.srcIn),
                ),
                label: 'Field Orders',
              ),
              BottomNavigationBarItem(
                icon: SvgPicture.asset(
                  'assets/icons/tv.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(AppColors.textMuted, BlendMode.srcIn),
                ),
                activeIcon: SvgPicture.asset(
                  'assets/icons/tv.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(Color(0xFF818CF8), BlendMode.srcIn),
                ),
                label: 'Edge Devices',
              ),
              BottomNavigationBarItem(
                icon: SvgPicture.asset(
                  'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(AppColors.textMuted, BlendMode.srcIn),
                ),
                activeIcon: SvgPicture.asset(
                  'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(Color(0xFF818CF8), BlendMode.srcIn),
                ),
                label: 'Hardware Config',
              ),
              BottomNavigationBarItem(
                icon: SvgPicture.asset(
                  'assets/icons/profile.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(AppColors.textMuted, BlendMode.srcIn),
                ),
                activeIcon: SvgPicture.asset(
                  'assets/icons/profile.svg',
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(Color(0xFF818CF8), BlendMode.srcIn),
                ),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
