import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/revenue_reporting/controller/revenue_reporting_controller.dart';

class RevenueReportingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RevenueReportingController>(() => RevenueReportingController());
  }
}
