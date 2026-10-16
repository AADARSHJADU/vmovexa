import 'package:get/get.dart';
import '../controllers/routes_list_controller.dart';

class RoutesListBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RoutesListController>(() => RoutesListController());
  }
}
