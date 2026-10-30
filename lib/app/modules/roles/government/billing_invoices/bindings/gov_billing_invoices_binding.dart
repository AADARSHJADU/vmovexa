// lib/app/modules/roles/government/billing_invoices/bindings/gov_billing_invoices_binding.dart
import 'package:get/get.dart';
import '../controllers/gov_billing_invoices_controller.dart';

class GovBillingInvoicesBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GovBillingInvoicesController>(
      () => GovBillingInvoicesController(),
    );
  }
}
