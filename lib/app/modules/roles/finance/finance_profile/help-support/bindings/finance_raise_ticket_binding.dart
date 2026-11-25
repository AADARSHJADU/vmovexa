import 'package:get/get.dart';
import '../controller/finance_raise_ticket_controller.dart';

class FinanceRaiseTicketBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinanceRaiseTicketController>(() => FinanceRaiseTicketController());
  }
}
