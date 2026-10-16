import 'package:get/get.dart';
import '../controllers/depot_details_controller.dart';

class DepotDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DepotDetailsController>(() => DepotDetailsController());
  }
}
