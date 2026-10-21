import 'package:get/get.dart';
import '../controllers/gps_details_controller.dart';

class GpsDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GpsDetailsController>(() => GpsDetailsController());
  }
}
