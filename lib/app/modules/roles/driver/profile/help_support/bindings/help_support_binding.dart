import 'package:get/get.dart';
import '../../../../fleet_operator/help_support/controllers/help_support_controller.dart';
import '../controller/driver_help_support_controller.dart';

class DriverHelpSupportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverHelpSupportController>(() => DriverHelpSupportController());
  }
}
