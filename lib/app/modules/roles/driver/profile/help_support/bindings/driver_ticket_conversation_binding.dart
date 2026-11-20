import 'package:get/get.dart';
import '../controller/driver_ticket_conversation_controller.dart';

class DriverTicketConversationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverTicketConversationController>(() => DriverTicketConversationController());
  }
}

