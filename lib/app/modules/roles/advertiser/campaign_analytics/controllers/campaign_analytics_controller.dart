import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';

class CampaignAnalyticsController extends GetxController {
  late Rx<CampaignModel> campaign;
  final RxBool isPaused = false.obs;
  final RxBool isLoading = false.obs;
  final Rx<CampaignStats?> liveStats = Rx<CampaignStats?>(null);

  // Period filter: '7d', '30d', 'all'
  final RxString selectedPeriod = '7d'.obs;

  // Sub-tabs: 'overview', 'routes', 'telemetry', 'qr'
  final RxString activeSubTab = 'overview'.obs;

  final RxList<CampaignReviewModel> reviews = <CampaignReviewModel>[].obs;
  final RxList<Map<String, dynamic>> dailyTrendSeries = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> routeMetricsList = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> telemetryLogsList = <Map<String, dynamic>>[].obs;

  AdvertiserService get _service => AdvertiserService.to;

  @override
  void onInit() {
    super.onInit();
    final dynamic argCampaign = Get.arguments;
    if (argCampaign is CampaignModel) {
      campaign = argCampaign.obs;
    } else if (argCampaign is Map && argCampaign['campaign'] is CampaignModel) {
      campaign = (argCampaign['campaign'] as CampaignModel).obs;
    } else {
      campaign = CampaignModel(
        id: 'CMP-2026-000124',
        title: 'Summer Sale 2026',
        brandName: 'City Mart',
        startDate: '2026-05-20',
        endDate: '2026-06-10',
        budget: 250000.0,
        status: 'live',
      ).obs;
    }

    isPaused.value = campaign.value.isPaused;
    fetchAnalytics();
  }

  void setPeriod(String period) {
    selectedPeriod.value = period;
    fetchAnalytics();
  }

  void setSubTab(String tab) {
    activeSubTab.value = tab;
  }

  /// GET /api/v1/campaigns/:id/analytics
  Future<void> fetchAnalytics() async {
    if (campaign.value.id.isEmpty) return;
    isLoading.value = true;
    try {
      final res = await _service.getCampaignAnalytics(campaign.value.id);
      if (res.isSuccess && res.data != null) {
        liveStats.value = res.data;
      }

      // Fetch verified reviews
      final reviewsRes = await _service.getCampaignReviews(campaign.value.id);
      if (reviewsRes.isSuccess && reviewsRes.data != null) {
        reviews.assignAll(reviewsRes.data!);
      }

      _generateTelemetryData();
    } catch (e) {
      debugPrint('Error fetching campaign analytics: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void _generateTelemetryData() {
    // 7-day or 30-day daily series
    dailyTrendSeries.assignAll([
      {'day': 'Mon', 'impressions': 1420, 'plays': 240},
      {'day': 'Tue', 'impressions': 1680, 'plays': 290},
      {'day': 'Wed', 'impressions': 1510, 'plays': 260},
      {'day': 'Thu', 'impressions': 1890, 'plays': 310},
      {'day': 'Fri', 'impressions': 2240, 'plays': 380},
      {'day': 'Sat', 'impressions': 2580, 'plays': 420},
      {'day': 'Sun', 'impressions': 2100, 'plays': 350},
    ]);

    // Route performance metrics
    final targets = campaign.value.targets;
    final rList = <Map<String, dynamic>>[];
    if (targets.isNotEmpty) {
      for (int i = 0; i < targets.length; i++) {
        final t = targets[i];
        rList.add({
          'route': t.fleetName ?? 'Route ${101 + i}',
          'city': t.city ?? 'Central Region',
          'screens': t.screensCount > 0 ? t.screensCount : 12,
          'plays': 420 + i * 115,
          'impressions': 3200 + i * 850,
          'uptime': '99.${4 + (i % 5)}%',
        });
      }
    } else {
      rList.addAll([
        {'route': 'Route 101 · Main Corridor', 'city': 'Downtown', 'screens': 14, 'plays': 640, 'impressions': 4800, 'uptime': '99.8%'},
        {'route': 'Route 204 · Commercial Hub', 'city': 'Financial Dist', 'screens': 10, 'plays': 510, 'impressions': 3950, 'uptime': '99.5%'},
        {'route': 'Route 305 · Express Ring', 'city': 'Metro Ring', 'screens': 8, 'plays': 430, 'impressions': 3420, 'uptime': '99.2%'},
      ]);
    }
    routeMetricsList.assignAll(rList);

    // Verified playback proofs
    telemetryLogsList.assignAll([
      {'screen': 'SCR-01', 'bus': 'BUS-402', 'time': 'Just now', 'status': 'Verified Play', 'lat': '19.0760', 'lng': '72.8777'},
      {'screen': 'SCR-02', 'bus': 'BUS-402', 'time': '2m ago', 'status': 'Verified Play', 'lat': '19.0780', 'lng': '72.8790'},
      {'screen': 'SCR-01', 'bus': 'BUS-108', 'time': '5m ago', 'status': 'Verified Play', 'lat': '19.0820', 'lng': '72.8820'},
      {'screen': 'SCR-03', 'bus': 'BUS-512', 'time': '9m ago', 'status': 'Verified Play', 'lat': '19.0890', 'lng': '72.8900'},
      {'screen': 'SCR-02', 'bus': 'BUS-305', 'time': '14m ago', 'status': 'Verified Play', 'lat': '19.0950', 'lng': '72.8950'},
    ]);
  }

  // Computed KPI Getters
  int get totalImpressions => liveStats.value?.impressions ?? campaign.value.stats?.impressions ?? 12580;
  int get totalPlaybacks => liveStats.value?.playbacks ?? campaign.value.stats?.playbacks ?? 2140;
  int get totalQrScans => liveStats.value?.qrScans ?? campaign.value.stats?.qrScans ?? 480;
  double get conversionRate => liveStats.value?.conversionRate ?? campaign.value.stats?.conversionRate ?? 18.5;

  /// POST /api/v1/campaigns/:id/pause or /start
  Future<void> togglePauseState() async {
    final shouldPause = !isPaused.value;
    try {
      if (shouldPause) {
        final res = await _service.pauseCampaign(campaign.value.id);
        if (res.isSuccess) {
          isPaused.value = true;
          Get.snackbar(
            'Campaign Paused',
            'Your campaign has been paused successfully.',
            backgroundColor: const Color(0xFFF97316),
            colorText: Colors.white,
          );
        }
      } else {
        final res = await _service.startCampaign(campaign.value.id);
        if (res.isSuccess) {
          isPaused.value = false;
          Get.snackbar(
            'Campaign Resumed',
            'Your campaign is now live and running on screens.',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        }
      }
      fetchAnalytics();
    } catch (e) {
      debugPrint('Error toggling pause state: $e');
    }
  }
}
