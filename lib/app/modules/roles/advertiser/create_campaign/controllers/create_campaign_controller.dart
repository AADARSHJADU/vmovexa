import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../dashboard/controllers/advertiser_dashboard_controller.dart';


class CreateCampaignController extends GetxController {
  final currentStep = 1.obs; // Step 1 to 7
  final RxBool isSubmitted = false.obs; // True when campaign is successfully submitted


  // Step 1: Campaign Info
  final campaignNameController = TextEditingController(text: 'Summer Sale 2026');
  final brandNameController = TextEditingController(text: 'City Mart');
  final campaignDescriptionController = TextEditingController(text: 'Special summer discount of up to 50% off on all items across metropolitan transit screens.');
  final RxString selectedCampaignType = 'Offer / Promotion'.obs;
  final RxString selectedObjective = 'Increase Brand Awareness'.obs;
  final RxString selectedCategory = 'Retail'.obs;

  final List<String> objectives = ['Increase Brand Awareness', 'Drive Sales', 'Generate Leads', 'App Installs'];
  final List<String> categories = ['Retail', 'Transportation', 'Technology', 'FMCG', 'Entertainment'];

  // Step 2: Creative states
  final RxBool hasUploadedFile = true.obs; // Default true to match screenshots
  final RxString uploadedFileName = 'summer_sale_banner.mp4'.obs;
  final RxString uploadedFileSize = 'MP4 • 42 MB • 1920x1080'.obs;
  final RxString selectedCreativeType = 'Video'.obs;
  final RxBool enableQrOverlay = true.obs;

  // Step 3: Fleet target states
  final RxBool selectCityRide = true.obs;
  final RxBool selectMetroConnect = true.obs;
  final RxBool selectUrbanLink = true.obs;
  final RxBool selectExpressMove = false.obs;
  final RxString selectScreenType = 'All Screens'.obs;

  // Step 4: Schedule Campaign
  final RxString repeatType = 'Weekly'.obs; // 'One Time', 'Daily', 'Weekly', 'Custom'
  final RxBool daySun = false.obs;
  final RxBool dayMon = true.obs;
  final RxBool dayTue = true.obs;
  final RxBool dayWed = true.obs;
  final RxBool dayThu = true.obs;
  final RxBool dayFri = true.obs;
  final RxBool daySat = false.obs;

  final startTimeController = TextEditingController(text: '08:00 AM');
  final endTimeController = TextEditingController(text: '10:00 PM');
  final timezone = '(GMT +05:30) India Standard Time'.obs;

  // Step 5: Budget & Summary
  final budgetController = TextEditingController(text: '2,50,000');
  final RxString budgetType = 'Total Budget'.obs; // 'Total Budget', 'Daily Budget'
  final RxString paymentMethod = 'UPI / Wallet'.obs;
  final promoCodeController = TextEditingController();
  final RxBool promoApplied = false.obs;

  // Step 6: QR Identity details
  final RxString qrCodeId = 'VMX-QR-8F29A7'.obs;
  final RxString qrAssetCode = 'MH12AB1234'.obs;
  final RxString qrRoute = 'Pune – Mumbai Expressway'.obs;

  // Step 7: Review
  final RxBool agreeTerms = true.obs;

  void nextStep() {
    if (currentStep.value < 7) {
      currentStep.value++;
    } else {
      submitCampaign();
    }
  }

  void previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    } else {
      Get.back();
    }
  }


  void selectCampaignType(String type) {
    selectedCampaignType.value = type;
  }

  void selectCreativeType(String type) {
    selectedCreativeType.value = type;
  }

  void selectScreenOption(String type) {
    selectScreenType.value = type;
  }

  void setBudgetType(String type) {
    budgetType.value = type;
  }

  void setRepeatType(String type) {
    repeatType.value = type;
  }

  void simulateUpload() {
    hasUploadedFile.value = true;
    uploadedFileName.value = 'summer_sale_banner.mp4';
    uploadedFileSize.value = 'MP4 • 42 MB • 1920x1080';
  }

  void removeUploaded() {
    hasUploadedFile.value = false;
    uploadedFileName.value = '';
    uploadedFileSize.value = '';
  }

  void applyPromo() {
    if (promoCodeController.text.isNotEmpty) {
      promoApplied.value = true;
      Get.snackbar(
        'Promo Applied',
        'Promo code successfully applied to your campaign cost.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );
    }
  }

  void submitCampaign() {
    isSubmitted.value = true;
  }


  void closeWizard() {
    Get.back();
  }

  void onViewCampaigns() {
    Get.offAndToNamed(
      Routes.CAMPAIGN_DETAILS,
      arguments: AdvertiserCampaign(
        id: 'CMP-2026-000124',
        title: campaignNameController.text.isNotEmpty ? campaignNameController.text : 'Summer Sale 2026',
        client: brandNameController.text.isNotEmpty ? brandNameController.text : 'City Mart',
        dates: '20 May 2026 - 10 Jun 2026',
        budget: '₹2,50,000',
        screens: 1250,
        impressions: '0',
        status: 'PENDING', // PENDING means "Under Review" state
        imagePath: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=200',
        themeColor: const Color(0xFF8B5CF6),
      ),
    );
  }


  void createAnother() {
    // Reset state
    currentStep.value = 1;
    isSubmitted.value = false;
    campaignNameController.text = '';
    brandNameController.text = '';
    campaignDescriptionController.text = '';
    budgetController.text = '2,50,000';
  }

  @override
  void onClose() {
    campaignNameController.dispose();
    brandNameController.dispose();
    campaignDescriptionController.dispose();
    startTimeController.dispose();
    endTimeController.dispose();
    budgetController.dispose();
    promoCodeController.dispose();
    super.onClose();
  }
}
