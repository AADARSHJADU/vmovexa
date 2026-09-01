import 'package:get/get.dart';
import '../controller/goverment_profile_controller.dart';

class GovermentProfileBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<GovernmentProfileController>(GovernmentProfileController());
  }
}
