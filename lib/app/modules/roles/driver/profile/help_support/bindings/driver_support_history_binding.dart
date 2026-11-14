import 'package:get/get.dart';
import '../controller/driver_support_history_controller.dart';

class DriverSupportHistoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverSupportHistoryController>(() => DriverSupportHistoryController());
  }
}

