import 'package:get/get.dart';
import '../controller/connectivity_troubleshooting_controller.dart';

class ConnectivityTroubleshootingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ConnectivityTroubleshootingController>(() => ConnectivityTroubleshootingController());
  }
}
