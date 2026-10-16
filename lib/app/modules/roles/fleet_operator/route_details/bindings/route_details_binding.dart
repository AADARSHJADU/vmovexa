import 'package:get/get.dart';
import '../controllers/route_details_controller.dart';

class RouteDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RouteDetailsController>(() => RouteDetailsController());
  }
}
