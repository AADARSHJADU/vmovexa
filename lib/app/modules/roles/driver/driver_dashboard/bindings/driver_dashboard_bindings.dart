import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/home/controller/driver_home_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/controller/driver_profile_controller.dart';

import '../../report/controller/report_incident_controller.dart';
import '../../routes/controller/my_route_controller.dart';
import '../../schedule/controller/schedule_controller.dart';
import '../controller/driver_dashboard_controller.dart';


class DriverDashboardBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<DriverDashboardController>(DriverDashboardController());
    Get.lazyPut<DriverHomeController>(() => DriverHomeController());
    Get.lazyPut<MyRouteController>(() => MyRouteController());
    Get.lazyPut<ScheduleController>(() => ScheduleController());
    Get.lazyPut<ReportIncidentController>(() => ReportIncidentController());
    Get.lazyPut<DriverProfileController>(() => DriverProfileController());
  }
}
