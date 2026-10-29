import 'package:get/get.dart';
import '../controller/driver_incidents_list_controller.dart';

class DriverIncidentsListBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverIncidentsListController>(
      () => DriverIncidentsListController(),
    );
  }
}
