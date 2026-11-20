import 'package:get/get.dart';
import '../controller/tech_work_order_detail_controller.dart';

class TechWorkOrderDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechWorkOrderDetailController>(() => TechWorkOrderDetailController());
  }
}
