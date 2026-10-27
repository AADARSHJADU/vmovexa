import 'package:get/get.dart';
import '../controller/finance_dashboard_controller.dart';
import '../../home/controller/finance_home_controller.dart';
import '../../invoice/controller/invoice_controller.dart';
import '../../payments/controller/finance_payments_controller.dart';
import '../../reports/controller/finance_reports_controller.dart';
import '../../finance_profile/profile/controller/finance_profile_controller.dart';
import '../../revenue_reporting/controller/revenue_reporting_controller.dart';
import '../../gst_management/controller/gst_management_controller.dart';
import '../../financial reconciliation/controller/financial_reconciliation_controller.dart';
import '../../subscriptions/controller/subscriptions_controller.dart';
import '../../finance_profile/setting/controller/finance_settings_controller.dart';

class FinanceDashboardBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<FinanceDashboardController>(FinanceDashboardController());
    Get.lazyPut<FinanceHomeController>(() => FinanceHomeController());
    Get.lazyPut<InvoiceController>(() => InvoiceController());
    Get.lazyPut<FinancePaymentsController>(() => FinancePaymentsController());
    Get.lazyPut<FinanceReportsController>(() => FinanceReportsController());
    Get.lazyPut<FinanceProfileController>(() => FinanceProfileController());
    Get.lazyPut<RevenueReportingController>(() => RevenueReportingController());
    Get.lazyPut<GSTManagementController>(() => GSTManagementController());
    Get.lazyPut<FinancialReconciliationController>(() => FinancialReconciliationController());
    Get.lazyPut<SubscriptionsController>(() => SubscriptionsController());
    Get.lazyPut<FinanceSettingsController>(() => FinanceSettingsController());
  }
}
