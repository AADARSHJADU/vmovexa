import 'package:get/get.dart';
import '../controller/finance_edit_profile_controller.dart';

class FinanceEditProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinanceEditProfileController>(
      () => FinanceEditProfileController(),
    );
  }
}
