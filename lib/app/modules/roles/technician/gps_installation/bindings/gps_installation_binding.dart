import 'package:get/get.dart';

import '../controller/gps_installation_controller.dart';

class GpsInstallationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GpsInstallationController>(() => GpsInstallationController());
  }
}
