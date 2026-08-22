import 'package:get/get.dart';
import '../controllers/gov_campaign_details_controller.dart';

class GovCampaignDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GovCampaignDetailsController>(() => GovCampaignDetailsController());
  }
}
