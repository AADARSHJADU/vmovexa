import 'package:get/get.dart';
import '../controllers/add_depot_controller.dart';

class AddDepotBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AddDepotController>(() => AddDepotController());
  }
}
