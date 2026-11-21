import 'package:get/get.dart';
import '../controllers/gov_compliance_reports_controller.dart';

class GovComplianceReportsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GovComplianceReportsController>(
      () => GovComplianceReportsController(),
    );
  }
}
