import 'package:get/get.dart';
import '../controller/campaign_payment_details_controller.dart';

class CampaignPaymentDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CampaignPaymentDetailsController>(
      () => CampaignPaymentDetailsController(),
    );
  }
}
