import 'package:get/get.dart';
import '../controllers/depots_list_controller.dart';

class DepotsListBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DepotsListController>(() => DepotsListController());
  }
}
