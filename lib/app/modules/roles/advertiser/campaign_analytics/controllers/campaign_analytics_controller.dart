import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../dashboard/controllers/advertiser_dashboard_controller.dart';

class CampaignAnalyticsController extends GetxController {
  late Rx<AdvertiserCampaign> campaign;
  final RxBool isPaused = false.obs;

  @override
  void onInit() {
    super.onInit();
    final AdvertiserCampaign argCampaign = Get.arguments;
    campaign = argCampaign.obs;
  }

  void togglePauseState() {
    isPaused.value = !isPaused.value;
    Get.snackbar(
      isPaused.value ? 'Campaign Paused' : 'Campaign Resumed',
      isPaused.value 
          ? 'Your campaign has been paused successfully.' 
          : 'Your campaign is now live and running on VMOVEXA screens.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void duplicateCampaign() {
    Get.snackbar(
      'Campaign Duplicated',
      'A draft replica of this campaign has been created successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
