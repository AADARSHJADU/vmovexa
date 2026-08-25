import 'package:flutter/material.dart';
import 'package:get/get.dart';

class GovCreateCampaignController extends GetxController {
  final currentStep = 1.obs; // Step 1 to 5
  final RxBool isSubmitted = false.obs; // True when campaign is successfully submitted

  // Step 1: Info & Type
  final campaignNameController = TextEditingController();
  final descriptionController = TextEditingController();
  final RxString selectedCampaignType = 'Public Information'.obs; // 'Public Information', 'Emergency Announcement'

  // Content Selection
  final RxString selectedContentType = 'Image'.obs; // Image, Video, PDF, HTML5, Live URL, RSS Feed, JSON, Interactive
  final RxString uploadedFileName = 'road_safety_awareness.jpg'.obs;
  final RxString uploadedFileSize = '2.4 MB'.obs;
  final RxString uploadedFileResolution = '1920 × 1080'.obs;

  // Step 2: Content Settings
  final RxBool selectAllDisplays = true.obs;
  final RxBool selectPassengerDisplays = false.obs;
  final RxBool selectInternalDisplays = false.obs;
  final RxInt contentDuration = 30.obs; // Seconds

  // Step 3: Targeting
  final RxBool selectCityRide = true.obs;
  final RxBool selectMetroConnect = true.obs;
  final RxBool selectUrbanLink = true.obs;
  final RxBool selectExpressMove = false.obs;
  final RxString selectedScreenCategory = 'All Screens'.obs; // All Screens, By Location, By Route, By Screen ID

  // Step 4: Schedule
  final RxString startDate = '20 May 2026'.obs;
  final RxString endDate = '10 Jun 2026'.obs;
  final RxString startTime = '10:00 AM'.obs;
  final RxString endTime = '10:00 PM'.obs;

  @override
  void onInit() {
    super.onInit();
    // Support pre-initializing as Emergency Announcement if routed from shortcut
    final args = Get.arguments;
    if (args != null && args is Map && args['type'] == 'Emergency') {
      selectedCampaignType.value = 'Emergency Announcement';
      uploadedFileName.value = 'emergency_heavy_rainfall_alert.jpg';
    }
  }

  void nextStep() {
    if (currentStep.value < 5) {
      currentStep.value++;
    } else {
      isSubmitted.value = true;
    }
  }

  void previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  void setCampaignType(String type) {
    selectedCampaignType.value = type;
  }

  void setContentType(String type) {
    selectedContentType.value = type;
    if (type == 'Video') {
      uploadedFileName.value = 'road_safety_video.mp4';
      uploadedFileSize.value = '24 MB';
      uploadedFileResolution.value = '1920 × 1080 (20s)';
    } else if (type == 'PDF') {
      uploadedFileName.value = 'bhopal_traffic_guidelines.pdf';
      uploadedFileSize.value = '1.8 MB';
      uploadedFileResolution.value = 'A4 Format';
    } else {
      uploadedFileName.value = 'road_safety_awareness.jpg';
      uploadedFileSize.value = '2.4 MB';
      uploadedFileResolution.value = '1920 × 1080';
    }
  }

  void selectDisplayType(String type) {
    if (type == 'All') {
      selectAllDisplays.value = !selectAllDisplays.value;
      if (selectAllDisplays.value) {
        selectPassengerDisplays.value = false;
        selectInternalDisplays.value = false;
      }
    } else if (type == 'Passenger') {
      selectPassengerDisplays.value = !selectPassengerDisplays.value;
      if (selectPassengerDisplays.value) selectAllDisplays.value = false;
    } else if (type == 'Internal') {
      selectInternalDisplays.value = !selectInternalDisplays.value;
      if (selectInternalDisplays.value) selectAllDisplays.value = false;
    }
  }

  void incrementDuration() {
    contentDuration.value += 5;
  }

  void decrementDuration() {
    if (contentDuration.value > 5) {
      contentDuration.value -= 5;
    }
  }

  void closeWizard() {
    Get.back();
  }

  void createAnother() {
    currentStep.value = 1;
    isSubmitted.value = false;
    campaignNameController.text = '';
    descriptionController.text = '';
  }

  @override
  void onClose() {
    campaignNameController.dispose();
    descriptionController.dispose();
    super.onClose();
  }
}
