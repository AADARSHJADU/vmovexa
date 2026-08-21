import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/finance_dashboard/controller/finance_dashboard_controller.dart' show FinanceDashboardController;
import 'package:vmovexa/app/modules/roles/finance/home/controller/finance_home_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/subscriptions_controller.dart';
import '../../finance_profile/setting/controller/finance_settings_controller.dart';
import '../../financial reconciliation/controller/financial_reconciliation_controller.dart';
import '../../invoice/controller/invoice_controller.dart';



class FinanceDashboardBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<FinanceDashboardController>(FinanceDashboardController());
    Get.lazyPut<FinanceHomeController>(() => FinanceHomeController());
    Get.lazyPut<SubscriptionsController>(() => SubscriptionsController());
    Get.lazyPut<InvoiceController>(() => InvoiceController());
    Get.lazyPut<FinancialReconciliationController>(() => FinancialReconciliationController());
    Get.lazyPut<FinanceSettingsController>(() => FinanceSettingsController());
  }
}
