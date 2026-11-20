import 'package:get/get.dart';
import '../controller/tech_ticket_conversation_controller.dart';

class TechTicketConversationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechTicketConversationController>(() => TechTicketConversationController());
  }
}
