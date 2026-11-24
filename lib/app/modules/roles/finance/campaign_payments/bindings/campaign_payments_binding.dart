import 'package:get/get.dart';
import '../controller/campaign_payments_controller.dart';

class CampaignPaymentsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CampaignPaymentsController>(() => CampaignPaymentsController());
  }
}
