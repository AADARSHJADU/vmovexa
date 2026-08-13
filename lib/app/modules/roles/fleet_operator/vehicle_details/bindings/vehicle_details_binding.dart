import 'package:get/get.dart';
import '../controllers/vehicle_details_controller.dart';

class VehicleDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<VehicleDetailsController>(VehicleDetailsController());
  }
}
