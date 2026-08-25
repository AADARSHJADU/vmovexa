import 'package:get/get.dart';
import '../controllers/campaign_analytics_controller.dart';

class CampaignAnalyticsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<CampaignAnalyticsController>(CampaignAnalyticsController());
  }
}
