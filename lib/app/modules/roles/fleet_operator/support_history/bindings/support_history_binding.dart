import 'package:get/get.dart';
import '../controllers/support_history_controller.dart';

class SupportHistoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<SupportHistoryController>(SupportHistoryController());
  }
}
