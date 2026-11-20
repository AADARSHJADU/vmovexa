import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/view/driver_profile_view.dart';
import 'package:vmovexa/app/modules/roles/driver/schedule/view/schedule_view.dart';
import '../../../../../theme/app_colors.dart';
import '../../home/view/driver_home_view.dart';
import '../../report/view/driver_incidents_list_view.dart';
import '../../routes/view/my_route_view.dart';
import '../controller/driver_dashboard_controller.dart';
import '../widgets/driver_drawer.dart';

class DriverDashboardView extends GetView<DriverDashboardController> {
  const DriverDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: controller.scaffoldKey,
      drawer: const DriverDrawer(),
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 0:
              return const DriverHomeView();
            case 1:
              return const MyRouteView();
            case 2:
              return const ScheduleView();
            case 3:
              return const DriverIncidentsListView();
            case 4:
              return const DriverProfileView();
            default:
              return const Placeholder();
          }
        }),
      ),
      bottomNavigationBar: Obx(
        () => Container(
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
          ),
          child: BottomNavigationBar(
            currentIndex: controller.selectedNavIndex.value,
            onTap: controller.onNavItemTapped,
            backgroundColor: AppColors.cardBg,
            type: BottomNavigationBarType.fixed,
            selectedItemColor: AppColors.accentPurple,
            unselectedItemColor: AppColors.textMuted,
            selectedFontSize: 11,
            unselectedFontSize: 11,
            items: [
              BottomNavigationBarItem(
                icon: const Icon(Icons.home_outlined),
                activeIcon: const Icon(Icons.home),
                label: 'home'.tr,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.directions_bus_outlined),
                activeIcon: const Icon(Icons.directions_bus),
                label: 'routes'.tr,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.calendar_month_outlined),
                activeIcon: const Icon(Icons.calendar_month),
                label: 'schedule'.tr,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.assignment_outlined),
                activeIcon: const Icon(Icons.assignment),
                label: 'incidents'.tr,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.person_outline),
                activeIcon: const Icon(Icons.person),
                label: 'profile'.tr,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
