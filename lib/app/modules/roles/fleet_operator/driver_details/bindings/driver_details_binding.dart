import 'package:get/get.dart';
import '../controllers/driver_details_controller.dart';

class DriverDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverDetailsController>(() => DriverDetailsController());
  }
}
