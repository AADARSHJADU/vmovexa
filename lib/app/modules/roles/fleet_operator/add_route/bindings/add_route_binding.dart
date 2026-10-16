import 'package:get/get.dart';
import '../controllers/add_route_controller.dart';

class AddRouteBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AddRouteController>(() => AddRouteController());
  }
}
