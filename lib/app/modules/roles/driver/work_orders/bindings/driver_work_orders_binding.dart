import 'package:get/get.dart';
import '../controllers/driver_work_orders_controller.dart';
import '../controllers/driver_create_work_order_controller.dart';
import '../controllers/driver_work_order_details_controller.dart';

class DriverWorkOrdersBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverWorkOrdersController>(() => DriverWorkOrdersController());
  }
}

class DriverCreateWorkOrderBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverCreateWorkOrderController>(() => DriverCreateWorkOrderController());
  }
}

class DriverWorkOrderDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverWorkOrderDetailsController>(() => DriverWorkOrderDetailsController());
  }
}

