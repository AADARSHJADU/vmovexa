import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class AdvertiserCampaign {
  final String id;
  final String title;
  final String client;
  final String dates;
  final String budget;
  final int screens;
  final String impressions;
  final String status; // 'RUNNING', 'SCHEDULED', 'PENDING', 'COMPLETED', 'PAUSED'
  final String imagePath; // Local assets or network, color placeholder
  final Color themeColor;

  AdvertiserCampaign({
    required this.id,
    required this.title,
    required this.client,
    required this.dates,
    required this.budget,
    required this.screens,
    required this.impressions,
    required this.status,
    required this.imagePath,
    required this.themeColor,
  });
}

class AdvertiserDashboardController extends GetxController {
  final RxInt selectedNavIndex = 0.obs;
  final RxString tab4Mode = 'profile'.obs; // 'profile', 'billing', 'help'
  final RxString selectedReportCampaign = 'Summer Sale 2026'.obs;
  final RxString selectedReportRange = '20 May 2026 - 10 Jun 2026'.obs;
  final List<String> reportCampaigns = ['Summer Sale 2026', 'Monsoon Offer', 'New Product Launch'];
  final List<String> reportRanges = ['20 May 2026 - 10 Jun 2026', '15 May 2026 - 30 May 2026'];

  void switchToBilling() {
    tab4Mode.value = 'billing';
    selectedNavIndex.value = 4;
  }

  void switchToProfile() {
    tab4Mode.value = 'profile';
    selectedNavIndex.value = 4;
  }

  void switchToHelp() {
    tab4Mode.value = 'help';
    selectedNavIndex.value = 4;
  }



  // Active status category filter pill selection inside Campaigns Tab
  final RxString activeFilter = 'All'.obs;

  final List<AdvertiserCampaign> allCampaigns = [
    AdvertiserCampaign(
      id: 'CAMP-2026-0001',
      title: 'Summer Sale 2026',
      client: 'City Ride',
      dates: '15 May 2026 - 30 May 2026',
      budget: '₹ 2.50L',
      screens: 1250,
      impressions: '2.45M',
      status: 'RUNNING',
      imagePath: 'assets/images/summer_sale.png',
      themeColor: const Color(0xFFEC4899),
    ),
    AdvertiserCampaign(
      id: 'CAMP-2026-0002',
      title: 'Monsoon Offer',
      client: 'Metro Connect',
      dates: '22 May 2026 - 05 Jun 2026',
      budget: '₹ 1.80L',
      screens: 980,
      impressions: '1.32M',
      status: 'SCHEDULED',
      imagePath: 'assets/images/monsoon_offer.png',
      themeColor: const Color(0xFF3B82F6),
    ),
    AdvertiserCampaign(
      id: 'CAMP-2026-0003',
      title: 'New Product Launch',
      client: 'Urban Link',
      dates: '20 May 2026 - 10 Jun 2026',
      budget: '₹ 1.25L',
      screens: 860,
      impressions: '980K',
      status: 'PENDING',
      imagePath: 'assets/images/product_launch.png',
      themeColor: const Color(0xFF8B5CF6),
    ),
    AdvertiserCampaign(
      id: 'CAMP-2026-0004',
      title: 'Brand Awareness Drive',
      client: 'City Ride',
      dates: '01 May 2026 - 14 May 2026',
      budget: '₹ 1.60L',
      screens: 1100,
      impressions: '2.10M',
      status: 'COMPLETED',
      imagePath: 'assets/images/brand_awareness.png',
      themeColor: const Color(0xFF10B981),
    ),
    AdvertiserCampaign(
      id: 'CAMP-2026-0005',
      title: 'Festive Bonanza',
      client: 'Metro Connect',
      dates: '10 Apr 2026 - 25 Apr 2026',
      budget: '₹ 2.20L',
      screens: 650,
      impressions: '720K',
      status: 'PAUSED',
      imagePath: 'assets/images/festive.png',
      themeColor: const Color(0xFFF59E0B),
    ),
  ];

  final RxList<AdvertiserCampaign> filteredCampaigns = <AdvertiserCampaign>[].obs;

  @override
  void onInit() {
    super.onInit();
    filteredCampaigns.assignAll(allCampaigns);
    ever(activeFilter, (_) => _applyFilter());
  }

  void changeTab(int index) {
    selectedNavIndex.value = index;
  }

  void filterCampaigns(String filter) {
    activeFilter.value = filter;
  }

  void _applyFilter() {
    String filter = activeFilter.value;
    if (filter == 'All') {
      filteredCampaigns.assignAll(allCampaigns);
    } else {
      filteredCampaigns.assignAll(
        allCampaigns.where((c) => c.status.toLowerCase() == filter.toLowerCase()).toList(),
      );
    }
  }

  void goToCreateCampaign() {
    Get.toNamed(Routes.CREATE_CAMPAIGN);
  }

  void goToCampaignDetails(AdvertiserCampaign campaign) {
    if (campaign.status == 'RUNNING') {
      Get.toNamed(Routes.CAMPAIGN_ANALYTICS, arguments: campaign);
    } else {
      Get.toNamed(Routes.CAMPAIGN_DETAILS, arguments: campaign);
    }
  }


  void logout() {
    Get.offAllNamed(Routes.LOGIN);
  }
}
