import 'package:get/get.dart';
import '../controller/tech_help_support_controller.dart';

class TechHelpSupportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechHelpSupportController>(() => TechHelpSupportController());
  }
}
