import 'package:get/get.dart';
import '../controllers/gov_help_support_controller.dart';
import '../controllers/gov_raise_ticket_controller.dart';
import '../controllers/gov_support_history_controller.dart';

class GovHelpSupportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GovHelpSupportController>(() => GovHelpSupportController());
    Get.lazyPut<GovRaiseTicketController>(() => GovRaiseTicketController());
    Get.lazyPut<GovSupportHistoryController>(() => GovSupportHistoryController());
  }
}
