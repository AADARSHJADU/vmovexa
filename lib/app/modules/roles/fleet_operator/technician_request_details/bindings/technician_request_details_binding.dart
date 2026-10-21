import 'package:get/get.dart';
import '../controllers/technician_request_details_controller.dart';

class TechnicianRequestDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechnicianRequestDetailsController>(() => TechnicianRequestDetailsController());
  }
}
