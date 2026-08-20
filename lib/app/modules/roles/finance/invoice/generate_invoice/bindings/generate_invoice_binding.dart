import 'package:get/get.dart';
import '../controller/generate_invoice_controller.dart';

class GenerateInvoiceBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GenerateInvoiceController>(() => GenerateInvoiceController());
  }
}
