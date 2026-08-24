import 'package:get/get.dart';
import '../controllers/create_campaign_controller.dart';

class CreateCampaignBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<CreateCampaignController>(CreateCampaignController());
  }
}
