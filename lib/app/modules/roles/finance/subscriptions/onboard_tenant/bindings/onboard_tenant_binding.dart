import 'package:get/get.dart';
import '../controller/onboard_tenant_controller.dart';

class OnboardTenantBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OnboardTenantController>(() => OnboardTenantController());
  }
}
