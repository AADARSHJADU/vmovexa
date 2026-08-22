import 'package:get/get.dart';
import '../controller/finance_help_support_controller.dart';

class FinanceHelpSupportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinanceHelpSupportController>(() => FinanceHelpSupportController());
  }
}
