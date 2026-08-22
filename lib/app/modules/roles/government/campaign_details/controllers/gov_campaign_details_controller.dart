import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../dashboard/controllers/government_dashboard_controller.dart';

class GovCampaignDetailsController extends GetxController {
  late Rx<GovCampaign> campaign;
  final RxString selectedTab = 'Live Coverage'.obs;
  final RxBool isPaused = false.obs;

  // Live Coverage Metrics (Image 1)
  final RxInt liveDisplays = 28.obs;
  final RxInt inactiveDisplays = 6.obs;
  final RxInt upcomingDisplays = 4.obs;
  final RxInt totalDisplays = 40.obs;

  // Core Metrics (Image 2)
  final RxInt impressions = 1982.obs;
  final RxInt reach = 1456.obs;
  final RxInt clicks = 248.obs;
  final RxDouble engagementRate = 6.24.obs;

  // QR Overview Metrics (Image 3)
  final RxInt qrTotalScans = 4512.obs;
  final RxInt qrUniqueScans = 3102.obs;
  final RxDouble qrScanRate = 2.45.obs;
  final RxInt qrAvgScansPerDay = 642.obs;

  // Live Activity Feed Items (Image 1)
  final List<Map<String, dynamic>> activityFeed = [
    {
      'displayId': 'BH-1025',
      'status': 'Live',
      'location': 'MP Nagar, Bhopal',
      'time': '2 mins ago',
      'icon': Icons.wifi,
      'color': const Color(0xFF10B981),
    },
    {
      'displayId': 'BH-1008',
      'status': 'Inactive',
      'location': 'Habib Ganj, Bhopal',
      'time': '15 mins ago',
      'icon': Icons.pause_circle_outline_rounded,
      'color': const Color(0xFFF59E0B),
    },
    {
      'displayId': 'BH-1042',
      'status': 'Scheduled',
      'location': 'Kolar Road, Bhopal',
      'time': '30 mins ago',
      'icon': Icons.access_time_rounded,
      'color': const Color(0xFF3B82F6),
    },
  ];

  // Top QR campaigns (Image 3)
  final List<Map<String, dynamic>> topQrCampaigns = [
    {
      'rank': 1,
      'title': 'Road Safety Awareness',
      'scans': 4512,
      'unique': 3102,
      'rate': '2.45%',
      'avg': 642,
      'percentage': 24.2,
      'color': const Color(0xFF8B5CF6),
      'image': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200',
    },
    {
      'rank': 2,
      'title': 'Monsoon Preparedness',
      'scans': 3856,
      'unique': 2632,
      'rate': '2.18%',
      'avg': 551,
      'percentage': 20.7,
      'color': const Color(0xFF3B82F6),
      'image': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200',
    },
    {
      'rank': 3,
      'title': 'Clean City Initiative',
      'scans': 2941,
      'unique': 1987,
      'rate': '1.92%',
      'avg': 420,
      'percentage': 15.8,
      'color': const Color(0xFF10B981),
      'image': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=200',
    },
    {
      'rank': 4,
      'title': 'Dengue Prevention Drive',
      'scans': 2678,
      'unique': 1842,
      'rate': '1.75%',
      'avg': 382,
      'percentage': 14.4,
      'color': const Color(0xFFF59E0B),
      'image': 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=200',
    },
    {
      'rank': 5,
      'title': 'Traffic Rules Matter',
      'scans': 1987,
      'unique': 1302,
      'rate': '1.60%',
      'avg': 283,
      'percentage': 10.7,
      'color': const Color(0xFF8B5CF6),
      'image': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200',
    },
  ];

  @override
  void onInit() {
    super.onInit();
    if (Get.arguments != null && Get.arguments is GovCampaign) {
      campaign = Rx<GovCampaign>(Get.arguments as GovCampaign);
    } else {
      // Fallback default campaign
      campaign = Rx<GovCampaign>(
        GovCampaign(
          id: 'ROAD-2025-0012',
          title: 'Road Safety Awareness',
          type: 'Public Information',
          dates: '12 May – 20 May 2025',
          locations: 'Bhopal, MP',
          coverage: 84,
          reach: 721,
          status: 'Active',
          imagePath: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200',
          themeColor: const Color(0xFF3B82F6),
        ),
      );
    }
  }

  void updateTab(String tab) {
    selectedTab.value = tab;
  }

  void togglePlayback() {
    isPaused.value = !isPaused.value;
  }
}
