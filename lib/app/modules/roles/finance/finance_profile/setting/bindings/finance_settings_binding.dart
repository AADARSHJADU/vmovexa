import 'package:get/get.dart';
import '../controller/finance_settings_controller.dart';

class FinanceSettingsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinanceSettingsController>(() => FinanceSettingsController());
  }
}
