import 'package:get/get.dart';
import '../controllers/trips_list_controller.dart';

class TripsListBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TripsListController>(() => TripsListController());
  }
}
