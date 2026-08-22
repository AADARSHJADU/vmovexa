import 'package:get/get.dart';
import '../controllers/gov_create_campaign_controller.dart';

class GovCreateCampaignBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GovCreateCampaignController>(
      () => GovCreateCampaignController(),
    );
  }
}
