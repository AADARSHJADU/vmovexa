import 'package:get/get.dart';
import '../controller/my_route_controller.dart';

class MyRouteBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MyRouteController>(() => MyRouteController());
  }
}
