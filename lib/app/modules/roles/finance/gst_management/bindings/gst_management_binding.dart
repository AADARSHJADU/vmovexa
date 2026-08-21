import 'package:get/get.dart';
import '../controller/gst_management_controller.dart';

class GSTManagementBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GSTManagementController>(
      () => GSTManagementController(),
    );
  }
}
