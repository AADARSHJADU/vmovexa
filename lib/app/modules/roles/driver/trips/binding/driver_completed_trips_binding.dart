import 'package:get/get.dart';
import '../controller/driver_completed_trips_controller.dart';

class DriverCompletedTripsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverCompletedTripsController>(
      () => DriverCompletedTripsController(),
    );
  }
}
