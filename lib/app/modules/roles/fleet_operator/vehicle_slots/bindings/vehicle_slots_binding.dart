import 'package:get/get.dart';
import '../controllers/vehicle_slots_controller.dart';

class VehicleSlotsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<VehicleSlotsController>(() => VehicleSlotsController());
  }
}

