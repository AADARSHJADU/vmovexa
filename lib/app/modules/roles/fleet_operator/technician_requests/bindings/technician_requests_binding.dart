import 'package:get/get.dart';
import '../controllers/technician_requests_controller.dart';

class TechnicianRequestsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechnicianRequestsController>(() => TechnicianRequestsController());
  }
}
