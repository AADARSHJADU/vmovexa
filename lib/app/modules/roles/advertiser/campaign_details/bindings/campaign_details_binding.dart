import 'package:get/get.dart';
import '../controllers/campaign_details_controller.dart';

class CampaignDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<CampaignDetailsController>(CampaignDetailsController());
  }
}
