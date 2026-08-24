import 'package:get/get.dart';
import '../../dashboard/controllers/advertiser_dashboard_controller.dart';

class CampaignDetailsController extends GetxController {
  late Rx<AdvertiserCampaign> campaign;
  
  final RxInt qrScans = 1420.obs;
  final RxInt vmovexaLeads = 320.obs;
  final RxDouble qrConversion = 22.5.obs;

  @override
  void onInit() {
    super.onInit();
    final AdvertiserCampaign argCampaign = Get.arguments;
    campaign = argCampaign.obs;

    // Simulate different stats for different campaigns
    if (campaign.value.title.contains('Monsoon')) {
      qrScans.value = 980;
      vmovexaLeads.value = 180;
      qrConversion.value = 18.3;
    } else if (campaign.value.title.contains('Product')) {
      qrScans.value = 860;
      vmovexaLeads.value = 210;
      qrConversion.value = 24.4;
    }
  }

  void toggleStatus() {
    String current = campaign.value.status;
    String newStatus = current == 'RUNNING' ? 'PAUSED' : 'RUNNING';
    
    // Create new campaign instance to trigger reactive updates
    campaign.value = AdvertiserCampaign(
      id: campaign.value.id,
      title: campaign.value.title,
      client: campaign.value.client,
      dates: campaign.value.dates,
      budget: campaign.value.budget,
      screens: campaign.value.screens,
      impressions: campaign.value.impressions,
      status: newStatus,
      imagePath: campaign.value.imagePath,
      themeColor: campaign.value.themeColor,
    );
  }
}
