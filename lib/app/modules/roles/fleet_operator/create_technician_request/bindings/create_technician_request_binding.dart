import 'package:get/get.dart';
import '../controllers/create_technician_request_controller.dart';

class CreateTechnicianRequestBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CreateTechnicianRequestController>(() => CreateTechnicianRequestController());
  }
}
