import 'package:get/get.dart';
import '../controller/tech_work_orders_controller.dart';

class TechWorkOrdersBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechWorkOrdersController>(() => TechWorkOrdersController());
  }
}
