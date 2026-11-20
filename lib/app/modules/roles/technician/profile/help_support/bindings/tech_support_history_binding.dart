import 'package:get/get.dart';
import '../controller/tech_support_history_controller.dart';

class TechSupportHistoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechSupportHistoryController>(() => TechSupportHistoryController());
  }
}
