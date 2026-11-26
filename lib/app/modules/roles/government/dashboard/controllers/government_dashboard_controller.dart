// lib/app/modules/roles/government/dashboard/controllers/government_dashboard_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/government_service.dart';

// Alias for backwards compatibility with any existing view references
typedef GovCampaign = GovCampaignModel;

class GovernmentDashboardController extends GetxController {
  final GovernmentService _govService = GovernmentService.to;
  final AuthService _authService = AuthService.to;

  final RxInt selectedNavIndex = 0.obs;
  final RxString selectedAnalyticsSubTab = 'Overview'.obs;

  // Loading States
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxBool isBroadcasting = false.obs;
  final RxBool isUploadingMedia = false.obs;

  // Live Data Observables
  final Rx<GovAnalyticsModel> analytics = GovAnalyticsModel().obs;
  final RxList<GovCampaignModel> campaigns = <GovCampaignModel>[].obs;
  final RxList<GovCampaignModel> filteredCampaigns = <GovCampaignModel>[].obs;
  final RxList<EmergencyBroadcastModel> emergencyBroadcasts = <EmergencyBroadcastModel>[].obs;
  final Rx<LiveTrackingDataModel> liveTracking = LiveTrackingDataModel().obs;
  final Rxn<EmergencyBroadcastModel> activeAlert = Rxn<EmergencyBroadcastModel>();

  // Filter & Search
  static const List<String> campaignTabs = [
    'All',
    'Approved',
    'Running',
    'Under Review',
    'Scheduled',
    'Draft',
    'Completed',
    'Paused',
    'Rejected',
  ];

  final RxString campaignsFilterTab = 'All'.obs;
  final campaignSearchController = TextEditingController();
  final RxString campaignSearchQuery = ''.obs;
  final RxString sortBy = 'Recent'.obs; // 'Recent', 'Name', 'Budget-High', 'Budget-Low', 'Screens'
  final RxMap<String, int> tabCounts = <String, int>{}.obs;

  // Emergency Broadcast Form Fields (Mirroring GovEmergencyBroadcastPage.jsx)
  final alertHeadlineController = TextEditingController();
  final RxInt headlineCharLength = 0.obs;
  final emergencyNumberController = TextEditingController();
  final RxString selectedSeverity = 'Critical'.obs; // Critical, High, Medium, Low
  final RxBool targetAllScreens = true.obs;
  final RxList<Map<String, dynamic>> selectedTargets = <Map<String, dynamic>>[].obs;
  final RxBool sendPushNotification = true.obs;
  final RxString autoExpireAlert = '6 Hours'.obs;
  final RxList<EmergencyMediaItem> mediaItems = <EmergencyMediaItem>[].obs;
  final RxInt selectedPreviewIndex = 0.obs;
  final RxString activeCreativeTab = 'All'.obs; // 'All', 'Image', 'Video', 'PDF', 'URL'
  final mediaUrlInputController = TextEditingController();

  // Route & Vehicle Screen Picker state (Mirroring RouteVehicleScreenPicker.jsx)
  final RxList<FleetRouteOptionModel> allFleetRoutes = <FleetRouteOptionModel>[].obs;
  final RxString routeCityFilter = 'All'.obs;
  final routeSearchController = TextEditingController();
  final RxString routeSearchQuery = ''.obs;
  final RxSet<String> expandedRouteKeys = <String>{}.obs;

  // Backwards compatibility fields
  final alertMessageController = TextEditingController();
  final RxString selectedAlertArea = 'Entire Transit Network'.obs;
  final RxBool broadcastToVehicles = true.obs;
  final RxBool broadcastToDisplays = true.obs;
  final RxString attachedMediaUrl = ''.obs;
  final RxString attachedMediaName = ''.obs;
  final RxInt unreadNotificationCount = 0.obs;

  // Emergency Broadcasts List Controls & Filter (Mirroring GovEmergencyListPage.jsx)
  final emergencySearchController = TextEditingController();
  final RxString emergencySearchQuery = ''.obs;
  final RxString selectedEmergencyTab = 'All'.obs; // 'All', 'Active', 'Pending Approval', 'Approved', 'Revoked', 'Expired'
  final RxString selectedEmergencySeverity = 'all'.obs; // 'all', 'critical', 'high', 'medium', 'low'
  final RxString selectedEmergencyScope = 'all'.obs; // 'all', 'all_screens', 'partial'
  final RxString selectedEmergencySort = 'newest'.obs; // 'newest', 'oldest', 'severity'

  @override
  void onInit() {
    super.onInit();
    alertHeadlineController.addListener(() {
      headlineCharLength.value = alertHeadlineController.text.length;
    });
    routeSearchController.addListener(() {
      routeSearchQuery.value = routeSearchController.text.trim();
    });
    campaignSearchController.addListener(() {
      campaignSearchQuery.value = campaignSearchController.text.trim();
      filterCampaigns();
    });
    emergencySearchController.addListener(() {
      emergencySearchQuery.value = emergencySearchController.text.trim();
    });
    loadDashboardData();
    loadFleetOptions();
  }

  /// Loads all live data concurrently from APIs
  Future<void> loadDashboardData({bool silent = false}) async {
    if (!silent) isLoading.value = true;
    try {
      fetchUnreadNotificationCount();
      final results = await Future.wait([
        _govService.getAgencyAnalytics(),
        _govService.getCampaigns(ownerType: 'government'),
        _govService.getEmergencyBroadcasts(),
        _govService.getLiveTracking(),
      ]);

      // 1. Analytics
      final analyticsRes = results[0];
      if (analyticsRes.success && analyticsRes.data != null) {
        analytics.value = analyticsRes.data as GovAnalyticsModel;
      }

      // 2. Campaigns
      final campaignsRes = results[1];
      if (campaignsRes.success && campaignsRes.data != null) {
        campaigns.value = campaignsRes.data as List<GovCampaignModel>;
      }

      // 3. Emergency Broadcasts
      final broadcastsRes = results[2];
      if (broadcastsRes.success && broadcastsRes.data != null) {
        final list = broadcastsRes.data as List<EmergencyBroadcastModel>;
        emergencyBroadcasts.value = list;

        // Find current active emergency alert
        final activeList = list.where((b) => b.active && b.status != 'revoked').toList();
        if (activeList.isNotEmpty) {
          activeAlert.value = activeList.first;
        } else {
          activeAlert.value = null;
        }
      }

      // 4. Live Telemetry & Tracking
      final trackingRes = results[3];
      if (trackingRes.success && trackingRes.data != null) {
        liveTracking.value = trackingRes.data as LiveTrackingDataModel;
      }

      filterCampaigns();
    } catch (e) {
      debugPrint('Error loading government dashboard data: $e');
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  /// Pull-to-refresh
  Future<void> onRefresh() async {
    isRefreshing.value = true;
    await loadDashboardData(silent: true);
  }

  Future<void> fetchUnreadNotificationCount() async {
    try {
      final res = await _govService.getNotifications(limit: 50);
      if (res.success && res.data != null) {
        unreadNotificationCount.value = res.data!.where((n) => !n.isRead.value).length;
      }
    } catch (_) {}
  }

  void updateNavIndex(int index) {
    selectedNavIndex.value = index;
    if (index == 1) {
      filterCampaigns();
    }
  }

  // ==========================================
  // CAMPAIGNS FILTERING & SEARCH
  // ==========================================
  void setCampaignsFilterTab(String tab) {
    campaignsFilterTab.value = tab;
    filterCampaigns();
  }

  void computeTabCounts() {
    final Map<String, int> counts = {};
    for (final tab in campaignTabs) {
      if (tab == 'All') {
        counts[tab] = campaigns.length;
      } else {
        counts[tab] = campaigns.where((c) => c.mappedStatus == tab).length;
      }
    }
    tabCounts.value = counts;
  }

  void filterCampaigns() {
    computeTabCounts();
    final query = campaignSearchQuery.value.toLowerCase();
    final tab = campaignsFilterTab.value;

    final list = campaigns.where((camp) {
      // Tab filter
      final matchesTab = (tab == 'All') || (camp.mappedStatus == tab);

      // Search filter
      final title = (camp.title ?? camp.name ?? '').toLowerCase();
      final brand = (camp.brandName ?? camp.clientCompany ?? camp.departmentOrClient).toLowerCase();
      final client = (camp.clientName ?? '').toLowerCase();
      final code = (camp.code ?? camp.id ?? '').toLowerCase();
      final cat = (camp.category ?? '').toLowerCase();
      final loc = (camp.displayLocations).toLowerCase();

      final matchesSearch = query.isEmpty ||
          title.contains(query) ||
          brand.contains(query) ||
          client.contains(query) ||
          code.contains(query) ||
          cat.contains(query) ||
          loc.contains(query);

      return matchesTab && matchesSearch;
    }).toList();

    // Sort options: 'Recent', 'Name', 'Budget-High', 'Budget-Low', 'Screens'
    if (sortBy.value == 'Name') {
      list.sort((a, b) => a.displayName.toLowerCase().compareTo(b.displayName.toLowerCase()));
    } else if (sortBy.value == 'Budget-High') {
      list.sort((a, b) => b.totalAmount.compareTo(a.totalAmount));
    } else if (sortBy.value == 'Budget-Low') {
      list.sort((a, b) => a.totalAmount.compareTo(b.totalAmount));
    } else if (sortBy.value == 'Screens') {
      list.sort((a, b) => b.totalScreens.compareTo(a.totalScreens));
    } else {
      // 'Recent'
      list.sort((a, b) => (b.createdAt ?? DateTime(2025)).compareTo(a.createdAt ?? DateTime(2025)));
    }

    filteredCampaigns.value = list;
  }

  // ==========================================
  // CAMPAIGN 3-DOTS ACTIONS
  // ==========================================
  Future<void> handleStartCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    try {
      final res = await _govService.startCampaign(id);
      if (res.success) {
        Get.snackbar(
          'broadcast_started_title'.tr,
          'broadcast_started_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        loadDashboardData(silent: true);
      } else {
        Get.snackbar('failed'.tr, res.message ?? 'could_not_start_campaign'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('error'.tr, 'failed_start_campaign_err'.trParams({'error': e.toString()}), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> handlePauseCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    try {
      final res = await _govService.pauseCampaign(id);
      if (res.success) {
        Get.snackbar(
          'broadcast_paused_title'.tr,
          'broadcast_paused_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFF59E0B),
          colorText: Colors.white,
        );
        loadDashboardData(silent: true);
      } else {
        Get.snackbar('failed'.tr, res.message ?? 'could_not_pause_campaign'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('error'.tr, 'failed_pause_campaign_err'.trParams({'error': e.toString()}), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> handleEndCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('gov_confirm_end_title'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text('gov_confirm_end_msg'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('Cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('Confirm'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        final res = await _govService.endCampaign(id);
        if (res.success) {
          Get.snackbar(
            'campaign_ended_title'.tr,
            'campaign_ended_msg'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          loadDashboardData(silent: true);
        } else {
          Get.snackbar('failed'.tr, res.message ?? 'could_not_end_campaign'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('error'.tr, 'failed_end_campaign_err'.trParams({'error': e.toString()}), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  Future<void> handleApproveCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    try {
      final res = await _govService.approveCampaign(id);
      if (res.success) {
        Get.snackbar(
          'broadcast_approved_title'.tr,
          'broadcast_approved_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        loadDashboardData(silent: true);
      } else {
        Get.snackbar('failed'.tr, res.message ?? 'approval_failed_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('error'.tr, 'approval_failed_err'.trParams({'error': e.toString()}), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> handleRejectCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    final remarksController = TextEditingController();
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('gov_reject_dialog_title'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('gov_reject_dialog_hint'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: remarksController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              maxLines: 3,
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF0F172A),
                hintText: 'enter_reason_hint'.tr,
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('Cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('Submit'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final reason = remarksController.text.trim();
      try {
        final res = await _govService.rejectCampaign(id, reason.isNotEmpty ? reason : 'creative_specs_incomplete_reason'.tr);
        if (res.success) {
          Get.snackbar(
            'campaign_rejected_title'.tr,
            'campaign_rejected_msg'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
          );
          loadDashboardData(silent: true);
        } else {
          Get.snackbar('failed'.tr, res.message ?? 'could_not_reject_campaign'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('error'.tr, 'failed_reject_campaign_err'.trParams({'error': e.toString()}), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  Future<void> handleDeleteCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('gov_confirm_delete_title'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text('gov_confirm_delete_msg'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('Cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('Confirm'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        final res = await _govService.deleteCampaign(id);
        if (res.success) {
          Get.snackbar(
            'campaign_deleted_title'.tr,
            'campaign_deleted_msg'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          loadDashboardData(silent: true);
        } else {
          Get.snackbar('failed'.tr, res.message ?? 'could_not_delete_campaign'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('error'.tr, 'failed_delete_campaign_err'.trParams({'error': e.toString()}), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  // ==========================================
  // EMERGENCY CREATIVES & TARGETING LOGIC
  // ==========================================
  final ImagePicker _mediaPicker = ImagePicker();

  List<String> get availableCities {
    final set = <String>{};
    for (final r in allFleetRoutes) {
      if (r.city.isNotEmpty) {
        set.add(r.city.split(RegExp(r'[,/(&]')).first.trim());
      }
    }
    final sorted = set.toList()..sort();
    return ['All', ...sorted];
  }

  List<FleetRouteOptionModel> get filteredRoutes {
    return allFleetRoutes.where((r) {
      if (routeCityFilter.value != 'All' && !r.city.toLowerCase().contains(routeCityFilter.value.toLowerCase())) {
        return false;
      }
      final q = routeSearchQuery.value.toLowerCase();
      if (q.isNotEmpty) {
        return r.name.toLowerCase().contains(q) ||
            r.code.toLowerCase().contains(q) ||
            (r.fleetName ?? '').toLowerCase().contains(q);
      }
      return true;
    }).toList();
  }

  int get totalSelectedRoutesCount => selectedTargets.length;
  int get totalSelectedVehiclesCount => selectedTargets.fold(0, (s, t) => s + (t['vehicleCount'] as int? ?? 0));
  int get totalSelectedScreensCount => selectedTargets.fold(0, (s, t) => s + (t['totalScreens'] as int? ?? 0));

  bool isRouteSelected(FleetRouteOptionModel route) {
    return selectedTargets.any((t) => t['routeKey'] == route.routeKey || t['routeId'] == route.id);
  }

  bool isVehicleSelected(FleetRouteOptionModel route, String vid) {
    final t = selectedTargets.firstWhereOrNull((x) => x['routeKey'] == route.routeKey || x['routeId'] == route.id);
    if (t == null) return false;
    final List vids = (t['vehicleIds'] as List?) ?? [];
    return vids.contains(vid);
  }

  void toggleRoute(FleetRouteOptionModel route) {
    final targets = List<Map<String, dynamic>>.from(selectedTargets);
    final idx = targets.indexWhere((t) => t['routeKey'] == route.routeKey || t['routeId'] == route.id);
    if (idx >= 0) {
      targets.removeAt(idx);
    } else {
      targets.add({
        'fleetName': route.fleetName,
        'organizationId': route.organizationId,
        'routeId': route.id,
        'routeName': route.name,
        'routeCode': route.code,
        'routeKey': route.routeKey,
        'city': route.city,
        'vehicleIds': route.vehicles.map((v) => v.id).toList(),
        'screensPerVehicle': route.screensPerVehicle,
        'totalScreens': route.totalScreens,
        'vehicleCount': route.vehicleCount,
      });
    }
    selectedTargets.assignAll(targets);
  }

  void toggleVehicle(FleetRouteOptionModel route, String vid) {
    final targets = List<Map<String, dynamic>>.from(selectedTargets);
    final idx = targets.indexWhere((t) => t['routeKey'] == route.routeKey || t['routeId'] == route.id);
    if (idx < 0) {
      targets.add({
        'fleetName': route.fleetName,
        'organizationId': route.organizationId,
        'routeId': route.id,
        'routeName': route.name,
        'routeCode': route.code,
        'routeKey': route.routeKey,
        'city': route.city,
        'vehicleIds': [vid],
        'screensPerVehicle': route.screensPerVehicle,
        'totalScreens': route.screensPerVehicle,
        'vehicleCount': 1,
      });
      selectedTargets.assignAll(targets);
      return;
    }

    final t = Map<String, dynamic>.from(targets[idx]);
    final ids = List<String>.from((t['vehicleIds'] as List?)?.map((e) => e.toString()) ?? []);
    if (ids.contains(vid)) {
      ids.remove(vid);
    } else {
      ids.add(vid);
    }
    t['vehicleIds'] = ids;
    t['vehicleCount'] = ids.length;
    t['totalScreens'] = ids.length * (route.screensPerVehicle);
    if (ids.isEmpty) {
      targets.removeAt(idx);
    } else {
      targets[idx] = t;
    }
    selectedTargets.assignAll(targets);
  }

  Future<void> loadFleetOptions() async {
    try {
      final res = await _govService.getFleetOptions();
      final routeMap = <String, FleetRouteOptionModel>{};

      List fleets = [];
      if (res.success && res.data != null) {
        if (res.data!['fleets'] is List) {
          fleets = res.data!['fleets'] as List;
        } else if (res.data!['data'] is List) {
          fleets = res.data!['data'] as List;
        }
      }

      for (var f in fleets) {
        if (f is Map && f['routes'] is List) {
          final fId = f['id']?.toString() ?? '';
          final fName = f['name']?.toString() ?? 'Transit Fleet';
          final orgId = f['organization_id']?.toString() ?? f['organizationId']?.toString();
          final fCity = f['city']?.toString() ?? 'Transit Network';

          for (var r in (f['routes'] as List)) {
            if (r is Map) {
              final rid = r['id']?.toString() ?? '';
              final key = 'route-$rid';
              final vList = <FleetVehicleOptionModel>[];
              if (r['vehicles'] is List) {
                for (var v in (r['vehicles'] as List)) {
                  if (v is Map) {
                    vList.add(FleetVehicleOptionModel(
                      id: v['id']?.toString() ?? '',
                      busNumber: v['bus_number']?.toString() ?? v['busNumber']?.toString() ?? 'Bus ${v['id']}',
                      displaysCount: int.tryParse(v['displaysCount']?.toString() ?? '1') ?? 1,
                    ));
                  }
                }
              }
              final busCount = int.tryParse(r['vehicleCount']?.toString() ?? vList.length.toString()) ?? vList.length;
              final screensPerVehicle = vList.isNotEmpty ? vList[0].displaysCount : 1;
              final totalScreens = int.tryParse(r['totalScreens']?.toString() ?? '') ?? (busCount * screensPerVehicle);

              if (!routeMap.containsKey(rid)) {
                routeMap[rid] = FleetRouteOptionModel(
                  routeKey: key,
                  fleetId: fId,
                  fleetName: fName,
                  organizationId: orgId,
                  id: rid,
                  name: r['name']?.toString() ?? 'Route $rid',
                  code: r['code']?.toString() ?? 'RT-$rid',
                  city: r['city']?.toString() ?? fCity,
                  vehicles: vList,
                  vehicleCount: busCount,
                  screensPerVehicle: screensPerVehicle,
                  totalScreens: totalScreens,
                );
              }
            }
          }
        }
      }

      // Fallback to tracking routes if empty
      if (routeMap.isEmpty) {
        final trackingRes = await _govService.getTrackingRoutes();
        if (trackingRes.success && trackingRes.data != null && trackingRes.data!.isNotEmpty) {
          for (var tr in trackingRes.data!) {
            final key = 'route-${tr.id}';
            routeMap[tr.id] = FleetRouteOptionModel(
              routeKey: key,
              fleetName: 'Transit Fleet',
              id: tr.id,
              name: tr.name,
              code: tr.code ?? 'RT-${tr.id}',
              city: tr.city ?? 'Transit Network',
              vehicles: [
                FleetVehicleOptionModel(id: 'v_${tr.id}_1', busNumber: 'Bus MP-04-${tr.id}01', displaysCount: 2),
                FleetVehicleOptionModel(id: 'v_${tr.id}_2', busNumber: 'Bus MP-04-${tr.id}02', displaysCount: 2),
              ],
              vehicleCount: 2,
              screensPerVehicle: 2,
              totalScreens: 4,
            );
          }
        }
      }

      // Defaults if still empty to ensure active previewable selection
      if (routeMap.isEmpty) {
        final defaults = [
          FleetRouteOptionModel(
            routeKey: 'route-101',
            id: '101',
            name: 'Route 101 - Coastal Express',
            code: 'RT-101',
            city: 'Bhopal',
            vehicles: [
              FleetVehicleOptionModel(id: 'b1', busNumber: 'Bus MP-04-101A', displaysCount: 2),
              FleetVehicleOptionModel(id: 'b2', busNumber: 'Bus MP-04-101B', displaysCount: 2),
              FleetVehicleOptionModel(id: 'b3', busNumber: 'Bus MP-04-101C', displaysCount: 1),
            ],
            vehicleCount: 3,
            screensPerVehicle: 2,
            totalScreens: 5,
          ),
          FleetRouteOptionModel(
            routeKey: 'route-204',
            id: '204',
            name: 'Route 204 - Metro Ring Road Corridor',
            code: 'RT-204',
            city: 'Indore',
            vehicles: [
              FleetVehicleOptionModel(id: 'b4', busNumber: 'Bus MP-09-204A', displaysCount: 2),
              FleetVehicleOptionModel(id: 'b5', busNumber: 'Bus MP-09-204B', displaysCount: 2),
            ],
            vehicleCount: 2,
            screensPerVehicle: 2,
            totalScreens: 4,
          ),
          FleetRouteOptionModel(
            routeKey: 'route-305',
            id: '305',
            name: 'Route 305 - Downtown Transit Hub',
            code: 'RT-305',
            city: 'Bhopal',
            vehicles: [
              FleetVehicleOptionModel(id: 'b6', busNumber: 'Bus MP-04-305A', displaysCount: 2),
              FleetVehicleOptionModel(id: 'b7', busNumber: 'Bus MP-04-305B', displaysCount: 1),
            ],
            vehicleCount: 2,
            screensPerVehicle: 2,
            totalScreens: 3,
          ),
        ];
        for (var d in defaults) {
          routeMap[d.id] = d;
        }
      }

      allFleetRoutes.value = routeMap.values.toList();
    } catch (e) {
      debugPrint('Error loading fleet options: $e');
    }
  }

  Future<void> pickCreativeMedia(String format) async {
    try {
      if (format == 'Video') {
        final XFile? file = await _mediaPicker.pickVideo(source: ImageSource.gallery);
        if (file != null) {
          final int length = await file.length();
          final sizeMb = (length / (1024 * 1024)).toStringAsFixed(1);
          mediaItems.add(EmergencyMediaItem(
            id: 'emg_${DateTime.now().millisecondsSinceEpoch}',
            name: file.name,
            type: 'Video',
            localPath: file.path,
            previewUrl: file.path,
            size: '$sizeMb MB',
            resolution: '1920x1080',
            durationSec: 15,
            displayDurationSec: 15,
          ));
          selectedPreviewIndex.value = mediaItems.length - 1;
        }
      } else {
        final XFile? file = await _mediaPicker.pickImage(source: ImageSource.gallery);
        if (file != null) {
          final int length = await file.length();
          final sizeMb = (length / (1024 * 1024)).toStringAsFixed(1);
          final type = format == 'PDF' ? 'PDF' : 'Image';
          mediaItems.add(EmergencyMediaItem(
            id: 'emg_${DateTime.now().millisecondsSinceEpoch}',
            name: file.name,
            type: type,
            localPath: file.path,
            previewUrl: file.path,
            size: '$sizeMb MB',
            resolution: '1920x1080',
            durationSec: 15,
            displayDurationSec: 15,
          ));
          selectedPreviewIndex.value = mediaItems.length - 1;
        }
      }
    } catch (e) {
      Get.snackbar('picker_error_title'.tr, 'could_not_pick_file_err'.trParams({'error': e.toString()}),
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  void addWebMediaUrl() {
    final raw = mediaUrlInputController.text.trim();
    if (raw.isEmpty) return;
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      Get.snackbar('invalid_url_title'.tr, 'gov_emergency.invalid_url'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }
    if (mediaItems.any((i) => i.url == raw)) {
      Get.snackbar('common.notice'.tr, 'gov_emergency.url_already_added'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }

    String type = 'URL';
    final lower = raw.toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
      type = 'Video';
    } else if (lower.endsWith('.pdf')) {
      type = 'PDF';
    } else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
      type = 'Image';
    }

    mediaItems.add(EmergencyMediaItem(
      id: 'emg_${DateTime.now().millisecondsSinceEpoch}',
      name: type == 'Video' ? 'Motion Video Feed' : raw.split('/').last.split('?').first.isNotEmpty ? raw.split('/').last.split('?').first : 'Online Media',
      type: type,
      url: raw,
      previewUrl: raw,
      size: 'Web Stream',
      resolution: 'Adaptive',
      durationSec: 15,
      displayDurationSec: 15,
    ));
    mediaUrlInputController.clear();
    selectedPreviewIndex.value = mediaItems.length - 1;
  }

  void removeCreativeItem(String id) {
    mediaItems.removeWhere((i) => i.id == id);
    if (selectedPreviewIndex.value >= mediaItems.length) {
      selectedPreviewIndex.value = mediaItems.isEmpty ? 0 : mediaItems.length - 1;
    }
  }

  void clearAllCreatives() {
    mediaItems.clear();
    selectedPreviewIndex.value = 0;
  }

  void updateCreativeDuration(String id, int sec) {
    final idx = mediaItems.indexWhere((i) => i.id == id);
    if (idx != -1) {
      final clamped = sec.clamp(1, 300);
      final item = mediaItems[idx];
      mediaItems[idx] = EmergencyMediaItem(
        id: item.id,
        name: item.name,
        type: item.type,
        localPath: item.localPath,
        url: item.url,
        previewUrl: item.previewUrl,
        size: item.size,
        resolution: item.resolution,
        durationSec: clamped,
        displayDurationSec: clamped,
      );
    }
  }

  // ==========================================
  // EMERGENCY BROADCAST CREATION & REVOCATION
  // ==========================================
  Future<void> broadcastEmergencyAlert() async {
    final headline = alertHeadlineController.text.trim();
    if (headline.isEmpty) {
      Get.snackbar('required_field'.tr, 'gov_emergency.err_headline_required'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white);
      return;
    }

    if (mediaItems.isEmpty) {
      Get.snackbar('required_field'.tr, 'gov_emergency.err_visual_required'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white);
      return;
    }

    if (!targetAllScreens.value && selectedTargets.isEmpty) {
      Get.snackbar('required_field'.tr, 'gov_emergency.err_target_required'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white);
      return;
    }

    isBroadcasting.value = true;
    try {
      // 1. Upload local files if any
      final uploadedMediaList = <Map<String, dynamic>>[];
      for (final item in mediaItems) {
        String uploadedUrl = item.url ?? '';
        if (uploadedUrl.isEmpty && item.localPath != null && item.localPath!.isNotEmpty) {
          try {
            final upRes = await _govService.uploadCampaignMedia(item.localPath!, purpose: 'emergency');
            if (upRes.success && upRes.data != null) {
              uploadedUrl = upRes.data!['url']?.toString() ?? upRes.data!['file_url']?.toString() ?? '';
              item.url = uploadedUrl;
            }
          } catch (_) {}
        }
        uploadedMediaList.add({
          'name': item.name,
          'mediaType': item.type.toLowerCase(),
          'mediaUrl': uploadedUrl.isNotEmpty ? uploadedUrl : (item.previewUrl ?? ''),
          'displayDurationSec': item.displayDurationSec,
        });
      }

      int autoExpireMins = 360;
      if (autoExpireAlert.value.contains('2')) autoExpireMins = 120;
      if (autoExpireAlert.value.contains('12')) autoExpireMins = 720;
      if (autoExpireAlert.value.contains('24')) autoExpireMins = 1440;

      final targetsPayload = targetAllScreens.value
          ? []
          : selectedTargets.map((t) => {
                'routeId': t['routeId'],
                'organizationId': t['organizationId'],
                'vehicleIds': t['vehicleIds'] ?? [],
                'routeName': t['routeName'],
                'city': t['city'],
              }).toList();

      final payload = {
        'title': '$headline: Transit Override',
        'headline': headline,
        'message': headline,
        'bodyText': headline,
        'tickerText': null,
        'authority': officerDepartment,
        'severity': selectedSeverity.value.toLowerCase(),
        'targetScope': targetAllScreens.value ? 'all' : 'partial',
        'targetArea': targetAllScreens.value
            ? 'Entire Transit Network'
            : (selectedTargets.isNotEmpty ? selectedTargets[0]['city'] ?? 'Transit Network' : 'Transit Network'),
        if (emergencyNumberController.text.trim().isNotEmpty)
          'emergencyNumber': emergencyNumberController.text.trim(),
        'pushNotification': sendPushNotification.value,
        'autoExpireMinutes': autoExpireMins,
        'targets': targetsPayload,
        'media': uploadedMediaList,
        'mediaUrl': uploadedMediaList.isNotEmpty ? uploadedMediaList[0]['mediaUrl'] : null,
        'mediaType': uploadedMediaList.isNotEmpty ? uploadedMediaList[0]['mediaType'] : null,
      };

      final response = await _govService.createEmergencyBroadcast(payload);

      if (response.success) {
        Get.snackbar(
          'emergency_alert_broadcasted_title'.tr,
          'gov_emergency.broadcast_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
        );

        alertHeadlineController.clear();
        emergencyNumberController.clear();
        mediaItems.clear();
        selectedTargets.clear();
        targetAllScreens.value = true;

        // Reload broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.success && broadcastsRes.data != null) {
          emergencyBroadcasts.value = broadcastsRes.data!;
          final activeList = broadcastsRes.data!.where((b) => b.active && b.status != 'revoked').toList();
          activeAlert.value = activeList.isNotEmpty ? activeList.first : null;
        }

        // Return from Create Screen if pushed
        if (Get.key.currentState?.canPop() ?? false) {
          Get.back();
        }
      } else {
        Get.snackbar(
          'broadcast_failed_title'.tr,
          response.message ?? 'failed_transmit_alert_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        'alert_transmit_err_msg'.trParams({'error': e.toString()}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isBroadcasting.value = false;
    }
  }

  Future<void> pickMediaForAlert() async {
    await pickCreativeMedia('Image');
  }

  Future<void> revokeEmergencyAlert(String id) async {
    try {
      final res = await _govService.revokeEmergencyBroadcast(id);
      if (res.success) {
        Get.snackbar(
          'alert_revoked_title'.tr,
          'gov_emergency.revoke_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        // Refresh broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.success && broadcastsRes.data != null) {
          emergencyBroadcasts.value = broadcastsRes.data!;
          final activeList = broadcastsRes.data!.where((b) => b.active && b.status != 'revoked').toList();
          activeAlert.value = activeList.isNotEmpty ? activeList.first : null;
        }
      } else {
        Get.snackbar('revoke_failed_title'.tr, res.message ?? 'failed_revoke_alert_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('error'.tr, 'failed_revoke_alert_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> deleteEmergencyBroadcast(String id) async {
    try {
      final res = await _govService.deleteEmergencyBroadcast(id);
      if (res.success) {
        Get.snackbar(
          'deleted'.tr,
          'gov_emergency.delete_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        // Refresh broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.success && broadcastsRes.data != null) {
          emergencyBroadcasts.value = broadcastsRes.data!;
          final activeList = broadcastsRes.data!.where((b) => b.active && b.status != 'revoked').toList();
          activeAlert.value = activeList.isNotEmpty ? activeList.first : null;
        }
      } else {
        Get.snackbar('delete_failed_title'.tr, res.message ?? 'failed_delete_broadcast_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('error'.tr, 'failed_delete_broadcast_err'.trParams({'error': e.toString()}), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  void createNewCampaign() {
    Get.toNamed(Routes.GOVERNMENT_CREATE_CAMPAIGN)?.then((_) => loadDashboardData(silent: true));
  }

  // ==========================================
  // GETTERS & DERIVED DATA
  // ==========================================
  String get officerName {
    final u = _authService.currentUser;
    return u?.name ?? 'Government Authority';
  }

  String get officerDepartment {
    final u = _authService.currentUser;
    return u?.organization?.name ?? 'State Public Transit Department';
  }

  String get officerEmail {
    final u = _authService.currentUser;
    return u?.email ?? 'authority@gov.in';
  }

  void logout() async {
    try {
      await _authService.logout();
    } catch (_) {}
    Get.offAllNamed(Routes.LOGIN);
  }

  String get currentDateFormatted {
    final now = DateTime.now();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${now.day} ${months[now.month - 1]}, ${now.year}';
  }

  String get currentDayName {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[DateTime.now().weekday - 1];
  }

  List<GovCampaignModel> get recentCampaigns {
    final nonDraft = campaigns.where((c) => (c.status ?? '').toLowerCase() != 'draft').toList();
    return nonDraft.take(3).toList();
  }

  int get kpiActiveCampaignsCount {
    if (analytics.value.activeCampaigns > 0) return analytics.value.activeCampaigns;
    return campaigns.where((c) {
      final s = (c.status ?? '').toLowerCase();
      return s == 'live' || s == 'active' || s == 'approved';
    }).length;
  }

  int get kpiScheduledCampaignsCount {
    if (analytics.value.pendingApprovals > 0) return analytics.value.pendingApprovals;
    return campaigns.where((c) {
      final s = (c.status ?? '').toLowerCase();
      return s == 'pending_approval' || s == 'scheduled' || s == 'draft';
    }).length;
  }

  int get kpiCompletedCampaignsCount {
    if (analytics.value.completedCampaigns > 0) return analytics.value.completedCampaigns;
    return campaigns.where((c) => (c.status ?? '') == 'completed').length;
  }

  int get kpiVehiclesWithGpsCount => liveTracking.value.withGps;
  int get kpiBroadcastingVehiclesCount => liveTracking.value.broadcasting;
  int get kpiTotalVehiclesCount => liveTracking.value.total;

  int get kpiEmergencyAlertsCount {
    final active = emergencyBroadcasts.where((b) => b.active && (b.status ?? '') != 'revoked').length;
    if (active > 0) return active;
    if (analytics.value.emergencyBroadcasts > 0) return analytics.value.emergencyBroadcasts;
    return emergencyBroadcasts.length;
  }

  int get calculatedTotalQrScans {
    if (analytics.value.totalScans > 0) return analytics.value.totalScans;
    int total = 0;
    for (final c in campaigns) {
      total += (c.qrScansCount ?? 0);
    }
    return total;
  }

  String get kpiLiveCoveragePercentage {
    if (liveTracking.value.total > 0) {
      final pct = ((liveTracking.value.broadcasting / liveTracking.value.total) * 100).round();
      return '$pct%';
    }
    return '${analytics.value.averageReach}%';
  }

  /// Generates Google Static Map URL from active live vehicles or default city center
  String get googleMapPreviewUrl {
    final vehiclesWithGps = liveTracking.value.vehicles.where((v) => v.lat != null && v.lng != null).toList();
    double centerLat = 23.2380;
    double centerLng = 77.4180;

    final markers = <Map<String, dynamic>>[];
    for (final v in vehiclesWithGps.take(10)) {
      markers.add({
        'lat': v.lat,
        'lng': v.lng,
        'color': v.screenStatus == 'Broadcasting' ? 'green' : 'red',
      });
    }

    if (vehiclesWithGps.isNotEmpty) {
      centerLat = vehiclesWithGps.first.lat!;
      centerLng = vehiclesWithGps.first.lng!;
    }

    return ApiConstants.buildGoogleStaticMapUrl(
      lat: centerLat,
      lng: centerLng,
      zoom: 12,
      markers: markers,
    );
  }

  // ==========================================
  // EMERGENCY BROADCASTS LIST & FILTER GETTERS
  // ==========================================
  Map<String, int> get emergencyCounts {
    final list = emergencyBroadcasts;
    int all = list.length;
    int active = 0;
    int pending = 0;
    int approved = 0;
    int revoked = 0;
    int expired = 0;

    for (final b in list) {
      final st = (b.status ?? '').toLowerCase();
      final isAct = b.active == true || st == 'active';
      if (isAct && st != 'revoked' && st != 'expired') {
        active++;
      } else if (st == 'pending_approval' || st == 'pending') {
        pending++;
      } else if (st == 'approved') {
        approved++;
      } else if (st == 'revoked') {
        revoked++;
      } else if (st == 'expired') {
        expired++;
      }
    }
    return {
      'all': all,
      'active': active,
      'pending': pending,
      'approved': approved,
      'revoked': revoked,
      'expired': expired,
      'inactive': revoked + expired,
    };
  }

  List<EmergencyBroadcastModel> get filteredEmergencyBroadcasts {
    final q = emergencySearchController.text.trim().toLowerCase();
    final tab = selectedEmergencyTab.value;
    final sev = selectedEmergencySeverity.value.toLowerCase();
    final scope = selectedEmergencyScope.value.toLowerCase();
    final sort = selectedEmergencySort.value;

    final filtered = emergencyBroadcasts.where((b) {
      final st = (b.status ?? '').toLowerCase();
      final isAct = b.active == true || st == 'active';

      // Tab filtering (Mirroring GovEmergencyListPage.jsx lines 138-142)
      if (tab == 'Active' && !(isAct && st != 'revoked' && st != 'expired')) return false;
      if (tab == 'Pending Approval' && !(st == 'pending_approval' || st == 'pending')) return false;
      if (tab == 'Approved' && !(st == 'approved' && !isAct)) return false;
      if (tab == 'Revoked' && st != 'revoked') return false;
      if (tab == 'Expired' && st != 'expired') return false;

      // Severity filtering
      if (sev != 'all') {
        if ((b.severity ?? '').toLowerCase() != sev) return false;
      }

      // Scope filtering
      if (scope != 'all') {
        final scp = (b.targetScope ?? '').toLowerCase();
        if (scope == 'all_screens' && (scp != 'all' && scp != 'all_screens')) return false;
        if (scope == 'partial' && (scp == 'all' || scp == 'all_screens')) return false;
      }

      // Keyword Search filtering
      if (q.isNotEmpty) {
        final headline = (b.headline ?? b.title ?? '').toLowerCase();
        final code = (b.code ?? b.id ?? '').toLowerCase();
        final msg = (b.message ?? b.bodyText ?? '').toLowerCase();
        final authority = (b.authority ?? '').toLowerCase();
        final area = (b.targetArea ?? '').toLowerCase();
        if (!headline.contains(q) &&
            !code.contains(q) &&
            !msg.contains(q) &&
            !authority.contains(q) &&
            !area.contains(q)) {
          return false;
        }
      }

      return true;
    }).toList();

    // Sorting (Mirroring GovEmergencyListPage.jsx lines 172-183)
    filtered.sort((a, b) {
      if (sort == 'oldest') {
        final dateA = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final dateB = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return dateA.compareTo(dateB);
      }
      if (sort == 'severity') {
        const rank = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1};
        final rankA = rank[(a.severity ?? '').toLowerCase()] ?? 0;
        final rankB = rank[(b.severity ?? '').toLowerCase()] ?? 0;
        return rankB.compareTo(rankA);
      }
      // default newest
      final dateA = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final dateB = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      return dateB.compareTo(dateA);
    });

    return filtered;
  }

  bool get hasActiveEmergencyFilters =>
      selectedEmergencyTab.value != 'All' ||
      emergencySearchController.text.trim().isNotEmpty ||
      selectedEmergencySeverity.value != 'all' ||
      selectedEmergencyScope.value != 'all' ||
      selectedEmergencySort.value != 'newest';

  void resetEmergencyFilters() {
    selectedEmergencyTab.value = 'All';
    emergencySearchController.clear();
    emergencySearchQuery.value = '';
    selectedEmergencySeverity.value = 'all';
    selectedEmergencyScope.value = 'all';
    selectedEmergencySort.value = 'newest';
  }

  // ==========================================
  // TRANSIT ANALYTICS STATE & GETTERS (Mirroring GovAnalyticsDashboardPage.jsx)
  // ==========================================
  final RxString analyticsMainTab = 'overview'.obs; // 'overview' | 'qr'
  final RxString analyticsDateRange = '7days'.obs; // '7days' | '30days' | 'month'
  final RxString analyticsCategory = 'all'.obs;
  final RxString analyticsViewMode = 'card'.obs; // 'card' | 'table'
  final RxBool isAnalyticsRefreshing = false.obs;

  Future<void> refreshTransitAnalytics() async {
    isAnalyticsRefreshing.value = true;
    try {
      await Future.wait([
        _govService.getAgencyAnalytics(
          dateRange: analyticsDateRange.value,
          category: analyticsCategory.value,
        ),
        _govService.getCampaigns(ownerType: 'government'),
        _govService.getEmergencyBroadcasts(),
        _govService.getLiveTracking(),
      ]).then((results) {
        if (results[0].success && results[0].data != null) {
          analytics.value = results[0].data as GovAnalyticsModel;
        }
        if (results[1].success && results[1].data != null) {
          campaigns.value = results[1].data as List<GovCampaignModel>;
        }
        if (results[2].success && results[2].data != null) {
          emergencyBroadcasts.value = results[2].data as List<EmergencyBroadcastModel>;
        }
        if (results[3].success && results[3].data != null) {
          liveTracking.value = results[3].data as LiveTrackingDataModel;
        }
      });
    } catch (_) {
    } finally {
      isAnalyticsRefreshing.value = false;
    }
  }

  Future<void> fetchAgencyAnalytics({String? range, String? cat}) async {
    final selectedRange = range ?? analyticsDateRange.value;
    final selectedCat = cat ?? analyticsCategory.value;
    try {
      final res = await _govService.getAgencyAnalytics(
        dateRange: selectedRange,
        category: selectedCat,
      );
      if (res.success && res.data != null) {
        analytics.value = res.data!;
      }
    } catch (_) {}
  }

  int get analyticsTotalCampaigns => analytics.value.totalCampaigns > 0 ? analytics.value.totalCampaigns : campaigns.length;
  int get analyticsActiveCampaigns => analytics.value.activeCampaigns > 0
      ? analytics.value.activeCampaigns
      : campaigns.where((c) => ['live', 'active'].contains((c.status ?? '').toLowerCase())).length;
  int get analyticsScheduledCampaigns => analytics.value.pendingApprovals > 0
      ? analytics.value.pendingApprovals
      : campaigns.where((c) => ['pending_approval', 'scheduled', 'draft'].contains((c.status ?? '').toLowerCase())).length;
  int get analyticsCompletedCampaigns => analytics.value.completedCampaigns > 0
      ? analytics.value.completedCampaigns
      : campaigns.where((c) => (c.status ?? '').toLowerCase() == 'completed').length;
  int get analyticsEmergencyAlerts => analytics.value.emergencyBroadcasts > 0 ? analytics.value.emergencyBroadcasts : emergencyBroadcasts.length;
  int get analyticsTotalImpressions => analytics.value.totalImpressions > 0
      ? analytics.value.totalImpressions
      : campaigns.fold(0, (acc, c) => acc + (c.impressions ?? 0));
  int get analyticsTotalScans => calculatedTotalQrScans;
  int get analyticsUniqueScans {
    if (analytics.value.uniqueScans > 0) return analytics.value.uniqueScans;
    return analyticsTotalScans;
  }
  int get analyticsNetworkReachPct => liveTracking.value.total > 0
      ? ((liveTracking.value.broadcasting / liveTracking.value.total) * 100).round()
      : (analytics.value.averageReach > 0 ? analytics.value.averageReach : 85);
  int get analyticsActiveVehiclesCount => liveTracking.value.broadcasting > 0
      ? liveTracking.value.broadcasting
      : (analytics.value.monitoredBuses > 0 ? analytics.value.monitoredBuses : 24);
  int get analyticsTotalVehiclesCount => liveTracking.value.total > 0
      ? liveTracking.value.total
      : (analytics.value.totalVehicles > 0 ? analytics.value.totalVehicles : 32);

  List<String> get analyticsAvailableCategories {
    final set = <String>{};
    for (final c in campaigns) {
      if (c.category != null && c.category!.trim().isNotEmpty) {
        set.add(c.category!.trim());
      }
    }
    return ['all', ...set.toList()..sort()];
  }

  List<Map<String, dynamic>> get analyticsDaysTrend {
    final today = DateTime.now();
    int count = 7;
    if (analyticsDateRange.value == '30days') count = 30;
    if (analyticsDateRange.value == 'month') count = today.day;
    if (count < 1) count = 1;

    // Use API telemetry if available
    if (analytics.value.daysTrend.isNotEmpty) {
      final list = <Map<String, dynamic>>[];
      for (final item in analytics.value.daysTrend) {
        if (item is Map) {
          list.add(Map<String, dynamic>.from(item));
        }
      }
      if (list.isNotEmpty) return list;
    }

    final list = <Map<String, dynamic>>[];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (int i = count - 1; i >= 0; i--) {
      final d = today.subtract(Duration(days: i));
      final dayLabel = '${d.day} ${monthNames[d.month - 1]}';
      list.add({
        'day': dayLabel,
        'date': '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}',
        'count': 0, // Real 0 telemetry (matches Admin panel GovAnalyticsDashboardPage.jsx line 99)
      });
    }
    return list;
  }

  int get analyticsMaxDayCount {
    final trend = analyticsDaysTrend;
    int maxVal = 1;
    for (final d in trend) {
      final c = (d['count'] as int? ?? 0);
      if (c > maxVal) maxVal = c;
    }
    return maxVal;
  }

  int get analyticsTotalPlaysInWindow {
    final trend = analyticsDaysTrend;
    return trend.fold(0, (acc, d) => acc + (d['count'] as int? ?? 0));
  }

  List<Map<String, dynamic>> get analyticsTopCampaigns {
    final list = List<GovCampaignModel>.from(campaigns);
    if (analyticsCategory.value != 'all') {
      list.retainWhere((c) => (c.category ?? '').toLowerCase() == analyticsCategory.value.toLowerCase());
    }

    list.sort((a, b) => (b.impressions ?? 0).compareTo(a.impressions ?? 0));
    final top = list.take(5).toList();
    final result = <Map<String, dynamic>>[];

    for (int i = 0; i < top.length; i++) {
      final c = top[i];
      final delivered = c.impressions ?? 0;
      final target = c.budget != null && c.budget! > 0 ? (c.budget! * 10).round() : 10000;
      final reachPct = target > 0 ? ((delivered / target) * 100).round().clamp(10, 100) : 75;

      result.add({
        'id': c.id ?? 'camp_$i',
        'rank': i + 1,
        'name': c.displayName,
        'category': c.category ?? 'General PSA',
        'status': (c.status ?? 'active').toLowerCase(),
        'reach': '$reachPct%',
        'impressions': delivered, // Real impressions without dummy additions
      });
    }
    return result;
  }

  /// Real QR Scans by Public Campaign (Only campaigns with actual scans > 0)
  /// Matches Admin panel GovAnalyticsDashboardPage.jsx lines 152-171
  List<Map<String, dynamic>> get analyticsQrByCampaign {
    final total = analyticsTotalScans;
    final sorted = List<GovCampaignModel>.from(campaigns)
      ..sort((a, b) => (b.qrScansCount ?? b.clicks ?? 0).compareTo(a.qrScansCount ?? a.clicks ?? 0));

    final colors = [
      const Color(0xFF3B82F6),
      const Color(0xFFEF4444),
      const Color(0xFF10B981),
      const Color(0xFFF59E0B),
      const Color(0xFF8B5CF6),
    ];

    final result = <Map<String, dynamic>>[];
    // Strictly filter campaigns with actual scans > 0 (exact match with Admin web .filter(c => c.scans > 0))
    final activeScans = sorted.where((c) => (c.qrScansCount ?? c.clicks ?? 0) > 0).take(5).toList();

    for (int i = 0; i < activeScans.length; i++) {
      final c = activeScans[i];
      final sc = c.qrScansCount ?? c.clicks ?? 0;
      final pct = total > 0 ? ((sc / total) * 100).round().clamp(1, 100) : 0;
      result.add({
        'id': c.id ?? 'c_$i',
        'name': c.displayName,
        'scans': sc,
        'scansFormatted': NumberFormat('#,##,###').format(sc),
        'pct': pct,
        'color': colors[i % colors.length],
      });
    }

    return result;
  }

  /// Real QR Device Type Breakdown from DB telemetry
  /// Matches Admin panel GovAnalyticsDashboardPage.jsx lines 173-198
  Map<String, Map<String, dynamic>> get analyticsQrDeviceStats {
    final breakdown = analytics.value.qrDeviceBreakdown;
    final mobile = int.tryParse(breakdown['mobile']?.toString() ?? '0') ?? 0;
    final tablet = int.tryParse(breakdown['tablet']?.toString() ?? '0') ?? 0;
    final web = int.tryParse(breakdown['web']?.toString() ?? '0') ?? 0;
    final sum = (mobile + tablet + web > 0) ? (mobile + tablet + web) : analyticsTotalScans;

    if (sum == 0) {
      return {
        'mobile': {'count': 0, 'pct': 0},
        'tablet': {'count': 0, 'pct': 0},
        'web': {'count': 0, 'pct': 0},
      };
    }

    final mobilePct = ((mobile / sum) * 100).round();
    final tabletPct = ((tablet / sum) * 100).round();
    final webPct = (100 - mobilePct - tabletPct).clamp(0, 100);

    return {
      'mobile': {
        'count': mobile,
        'pct': mobilePct,
      },
      'tablet': {
        'count': tablet,
        'pct': tabletPct,
      },
      'web': {
        'count': web,
        'pct': webPct,
      },
    };
  }

  int get analyticsAvgScansPerDay {
    int days = 7;
    if (analyticsDateRange.value == '30days') days = 30;
    if (analyticsDateRange.value == 'month') days = DateTime.now().day;
    if (days < 1) days = 1;
    return (analyticsTotalScans / days).round();
  }

  String get analyticsOverallScanRate {
    if (analyticsTotalImpressions > 0 && analyticsTotalScans > 0) {
      final rate = (analyticsTotalScans / analyticsTotalImpressions) * 100;
      return '${rate.toStringAsFixed(2)}%';
    }
    return '0.00%';
  }

  @override
  void onClose() {
    campaignSearchController.dispose();
    alertHeadlineController.dispose();
    alertMessageController.dispose();
    emergencyNumberController.dispose();
    emergencySearchController.dispose();
    super.onClose();
  }
}
