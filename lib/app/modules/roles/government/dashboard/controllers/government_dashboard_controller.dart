import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class GovCampaign {
  final String id;
  final String title;
  final String type; // 'Public Information', 'Emergency'
  final String dates;
  final String locations;
  final int coverage;
  final int reach;
  final String status; // 'Active', 'Scheduled', 'Completed'
  final String imagePath;
  final Color themeColor;

  GovCampaign({
    required this.id,
    required this.title,
    required this.type,
    required this.dates,
    required this.locations,
    required this.coverage,
    required this.reach,
    required this.status,
    required this.imagePath,
    required this.themeColor,
  });
}

class GovernmentDashboardController extends GetxController {
  final RxInt selectedNavIndex = 0.obs;
  final RxString selectedAnalyticsSubTab = 'Overview'.obs;

  // Mock campaigns list mapping Image 3 details
  final RxList<GovCampaign> campaigns = <GovCampaign>[
    GovCampaign(
      id: 'ROAD-2025-0012',
      title: 'Road Safety Awareness',
      type: 'Public Information',
      dates: '12 May – 20 May, 2025',
      locations: 'Bhopal, Indore, Dewas',
      coverage: 82,
      reach: 721,
      status: 'Active',
      imagePath: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200',
      themeColor: const Color(0xFF3B82F6),
    ),
    GovCampaign(
      id: 'HLTH-2025-0044',
      title: 'Health Alert Campaign',
      type: 'Emergency',
      dates: '10 May – 17 May, 2025',
      locations: 'Bhopal, Raisen',
      coverage: 94,
      reach: 654,
      status: 'Active',
      imagePath: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200',
      themeColor: const Color(0xFFEF4444),
    ),
    GovCampaign(
      id: 'CLEN-2025-0091',
      title: 'Clean City Initiative',
      type: 'Public Information',
      dates: '05 May – 15 May, 2025',
      locations: 'Bhopal, Sehore',
      coverage: 76,
      reach: 512,
      status: 'Active',
      imagePath: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=200',
      themeColor: const Color(0xFF10B981),
    ),
    GovCampaign(
      id: 'TAX-2025-0023',
      title: 'Tax Awareness Drive',
      type: 'Public Information',
      dates: '20 May – 30 May, 2025',
      locations: 'Bhopal, Indore, Ujjain',
      coverage: 0,
      reach: 680,
      status: 'Scheduled',
      imagePath: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200',
      themeColor: const Color(0xFF8B5CF6),
    ),
    GovCampaign(
      id: 'RAIN-2025-0005',
      title: 'Heavy Rainfall Alert',
      type: 'Emergency',
      dates: '08 May – 12 May, 2025',
      locations: 'Bhopal, Hoshangabad',
      coverage: 91,
      reach: 701,
      status: 'Active',
      imagePath: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=200',
      themeColor: const Color(0xFFF59E0B),
    ),
  ].obs;

  // Active alerts count
  final RxInt activeAlertsCount = 2.obs;

  // Emergency Broadcast Form Fields
  final alertMessageController = TextEditingController(
    text: 'Heavy rainfall warning in Bhopal. Please avoid unnecessary travel and follow safety guidelines.',
  );
  final RxString selectedSeverity = 'Critical'.obs; // Critical, High, Medium, Low
  final RxString selectedAlertArea = 'Bhopal Region'.obs;
  final RxBool broadcastToVehicles = true.obs;
  final RxBool broadcastToDisplays = true.obs;
  final RxBool sendPushNotification = true.obs;
  final RxString autoExpireAlert = '6 Hours'.obs;

  void updateNavIndex(int index) {
    selectedNavIndex.value = index;
  }

  void createNewCampaign() {
    Get.toNamed(Routes.GOVERNMENT_CREATE_CAMPAIGN);
  }

  void broadcastEmergencyAlert() {
    Get.snackbar(
      'Alert Broadcasted',
      'The emergency alert has been broadcasted immediately to all selected displays.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFFEF4444),
      colorText: Colors.white,
    );
  }

  @override
  void onClose() {
    alertMessageController.dispose();
    super.onClose();
  }
}
