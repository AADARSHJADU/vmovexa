import 'package:get/get.dart';
import '../controllers/gps_list_controller.dart';

class GpsListBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GpsListController>(() => GpsListController());
  }
}
