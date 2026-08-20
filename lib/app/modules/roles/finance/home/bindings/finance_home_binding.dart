import 'package:get/get.dart';
import '../controller/finance_home_controller.dart';

class FinanceHomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinanceHomeController>(() => FinanceHomeController());
  }
}
