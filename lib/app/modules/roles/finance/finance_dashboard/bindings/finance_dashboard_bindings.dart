import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/finance_dashboard/controller/finance_dashboard_controller.dart' show FinanceDashboardController;



class FinanceDashboardBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<FinanceDashboardController>(FinanceDashboardController());
    // Get.lazyPut<DriverHomeController>(() => DriverHomeController());
    // Get.lazyPut<MyRouteController>(() => MyRouteController());
    // Get.lazyPut<ScheduleController>(() => ScheduleController());
    // Get.lazyPut<ReportIncidentController>(() => ReportIncidentController());
    // Get.lazyPut<DriverProfileController>(() => DriverProfileController());
  }
}
