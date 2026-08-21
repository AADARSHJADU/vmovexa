import 'package:get/get.dart';
import '../controller/finance_profile_controller.dart';

class FinanceProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinanceProfileController>(() => FinanceProfileController());
  }
}
