import 'package:get/get.dart';
import '../controller/report_incident_controller.dart';

class ReportIncidentBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ReportIncidentController>(() => ReportIncidentController());
  }
}
