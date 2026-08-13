import 'package:get/get.dart';
import '../controllers/setup_complete_controller.dart';

class SetupCompleteBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<SetupCompleteController>(SetupCompleteController());
  }
}
