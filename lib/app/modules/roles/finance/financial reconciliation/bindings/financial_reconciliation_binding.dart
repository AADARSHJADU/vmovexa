import 'package:get/get.dart';
import '../controller/financial_reconciliation_controller.dart';

class FinancialReconciliationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinancialReconciliationController>(
      () => FinancialReconciliationController(),
    );
  }
}
