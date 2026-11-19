import 'package:get/get.dart';
import '../controllers/advertiser_help_support_controller.dart';
import '../controllers/advertiser_raise_ticket_controller.dart';
import '../controllers/advertiser_support_history_controller.dart';

class AdvertiserHelpSupportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdvertiserHelpSupportController>(() => AdvertiserHelpSupportController());
    Get.lazyPut<AdvertiserRaiseTicketController>(() => AdvertiserRaiseTicketController());
    Get.lazyPut<AdvertiserSupportHistoryController>(() => AdvertiserSupportHistoryController());
  }
}
