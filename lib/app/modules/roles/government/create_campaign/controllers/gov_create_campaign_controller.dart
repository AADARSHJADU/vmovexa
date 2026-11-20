import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';
import 'package:vmovexa/app/data/services/government_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class GovCreateCampaignController extends GetxController {
  final GovernmentService _govService = GovernmentService.to;
  final ImagePicker _picker = ImagePicker();

  // Stepper State: 6 Steps matching Admin Panel
  final currentStep = 1.obs; // Step 1 to 6
  final int totalSteps = 6;
  List<String> get stepLabels => [
    'step_campaign_info'.tr,
    'step_creative_assets'.tr,
    'step_transit_routes'.tr,
    'step_broadcast_schedule'.tr,
    'step_budget_breakdown'.tr,
    'step_review_publish'.tr,
  ];

  final RxBool isSubmitting = false.obs;
  final RxBool isSubmitted = false.obs;
  final Rxn<GovCampaignModel> createdCampaign = Rxn<GovCampaignModel>();

  // Edit Mode state
  final RxBool isEditMode = false.obs;
  final RxString editingCampaignId = ''.obs;

  // Draft Persistence States matching Admin Panel
  final RxBool hasSavedDraft = false.obs;
  final RxString draftSavedAt = ''.obs;
  final Rx<Map<String, dynamic>?> draftInfo = Rx<Map<String, dynamic>?>(null);

  // ==========================================================
  // STEP 1: CAMPAIGN INFORMATION & NODAL OFFICER DETAILS
  // ==========================================================
  final nameController = TextEditingController();
  final brandNameController = TextEditingController();
  final descriptionController = TextEditingController();
  final RxString selectedCampaignType = 'Brand Awareness'.obs;
  final RxString selectedObjective = 'Increase Brand Awareness'.obs;
  final RxString selectedCategory = 'Retail'.obs;

  final List<String> campaignTypes = [
    'Brand Awareness',
    'Product Promotion',
    'Event',
    'Offer / Promotion',
  ];

  final List<String> objectives = [
    'Increase Brand Awareness',
    'Drive Sales',
    'Store Footfall',
    'Product Launch',
    'Lead Generation',
  ];

  final List<String> categories = [
    'Retail',
    'Technology',
    'Fashion',
    'Automotive',
    'FMCG / Grocery',
    'Real Estate',
    'Entertainment',
    'Healthcare',
    'Education',
  ];

  // Sponsoring Authority & Nodal Officer Details
  final clientNameController = TextEditingController();
  final clientCompanyController = TextEditingController();
  final clientPhoneController = TextEditingController();
  final clientEmailController = TextEditingController();
  final clientSearchController = TextEditingController();
  final clientAddressController = TextEditingController();
  final clientCityController = TextEditingController();
  final clientStateController = TextEditingController();
  final clientPincodeController = TextEditingController();
  final RxString clientCountry = 'India'.obs;
  final RxnDouble clientLatitude = RxnDouble();
  final RxnDouble clientLongitude = RxnDouble();
  final RxString clientPlaceId = ''.obs;

  // ==========================================================
  // STEP 2: CREATIVE ASSETS & VIDEO STREAMING URL
  // ==========================================================
  final RxString selectedCreativeType = 'All'.obs;
  final videoUrlController = TextEditingController();
  final RxString detectedYtId = ''.obs;
  final RxString ytThumbnailUrl = ''.obs;
  final RxList<CreativeItemModel> creativeItems = <CreativeItemModel>[].obs;
  final RxInt selectedPreviewIndex = 0.obs;

  // ==========================================================
  // STEP 3: TRANSIT INVENTORY (ROUTES, BUSES & SCREENS)
  // ==========================================================
  final RxList<FleetOptionModel> availableFleets = <FleetOptionModel>[].obs;
  final RxBool isLoadingFleets = false.obs;
  final RxList<TransitRouteModel> allTransitRoutes = <TransitRouteModel>[].obs;
  final RxList<TransitRouteModel> filteredTransitRoutes = <TransitRouteModel>[].obs;
  final RxList<SelectedTargetModel> selectedTargets = <SelectedTargetModel>[].obs;
  final RxString routeSearchQuery = ''.obs;
  final RxString selectedCityFilter = 'All'.obs;
  final RxList<String> availableCities = <String>['All'].obs;
  final RxMap<int, bool> expandedRoutes = <int, bool>{}.obs;
  final RxMap<String, bool> expandedBuses = <String, bool>{}.obs;

  int get totalSelectedVehicles => selectedTargets.fold(0, (sum, t) => sum + (t.vehicleIds.isNotEmpty ? t.vehicleIds.length : t.vehicleCount));
  int get totalSelectedScreens => selectedTargets.fold(0, (sum, t) => sum + (t.totalScreens > 0 ? t.totalScreens : t.screenIds.length));

  // ==========================================================
  // STEP 4: SCHEDULE & BROADCAST AIRTIME
  // ==========================================================
  final RxInt selectedDurationPreset = 14.obs;
  final Rx<DateTime> startDate = Rx<DateTime>(DateTime.now());
  final Rx<TimeOfDay> startTime = Rx<TimeOfDay>(const TimeOfDay(hour: 8, minute: 0));
  final Rx<DateTime> endDate = Rx<DateTime>(DateTime.now().add(const Duration(days: 13)));
  final Rx<TimeOfDay> endTime = Rx<TimeOfDay>(const TimeOfDay(hour: 22, minute: 0));
  final RxString repeatFrequency = 'Daily'.obs;
  final RxList<String> selectedDays = <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].obs;
  final RxString dailySlotStart = '08:00'.obs;
  final RxString dailySlotEnd = '22:00'.obs;
  final RxString selectedTimeSlotPreset = 'Prime Transit (08:00 - 22:00)'.obs;
  final RxString selectedPriority = 'Normal'.obs; // 'Normal', 'High', 'Emergency'
  final RxString timezone = 'IST (UTC+05:30)'.obs;
  final RxBool slotConflict = false.obs;
  final RxString slotConflictMessage = ''.obs;
  final RxBool isCheckingSlot = false.obs;
  final RxBool slotAvailable = true.obs;

  final List<String> timeSlotPresets = [
    'Prime Transit (08:00 - 22:00)',
    'Full Day (06:00 - 23:00)',
    'Morning Rush (07:00 - 12:00)',
    'Evening Rush (16:00 - 22:00)',
    'Custom Time',
  ];

  final List<String> priorityOptions = [
    'Normal',
    'High',
    'Emergency',
  ];

  int get durationDaysNumber {
    final diff = endDate.value.difference(startDate.value).inDays + 1;
    return diff > 0 ? diff : 1;
  }

  int get activeBroadcastDaysCount => selectedDays.length;

  double get dailyOperatingHours {
    try {
      final partsStart = dailySlotStart.value.split(':');
      final partsEnd = dailySlotEnd.value.split(':');
      final startMin = int.parse(partsStart[0]) * 60 + int.parse(partsStart[1]);
      final endMin = int.parse(partsEnd[0]) * 60 + int.parse(partsEnd[1]);
      final diffMin = endMin - startMin;
      return diffMin > 0 ? (diffMin / 60.0) : 14.0;
    } catch (_) {
      return 14.0;
    }
  }

  int get totalAirtimeHours => ((durationDaysNumber / 7.0) * selectedDays.length * dailyOperatingHours).round();

  int get estimatedLoopsPerDay => (dailyOperatingHours * 30).round();

  double get subtotalNet => baseAmountNum + totalCharges - totalDiscounts;

  // ==========================================================
  // STEP 5: BUDGET BREAKDOWN & CITIZEN QR IDENTITY
  // ==========================================================
  final baseAmountController = TextEditingController(text: '25000');
  final RxList<BreakdownItemModel> breakdownItems = <BreakdownItemModel>[].obs;
  final RxString budgetType = 'Daily'.obs;
  final RxBool enableQrCode = true.obs;
  final RxString qrCodeId = ''.obs;
  final qrRedirectUrlController = TextEditingController();

  double get baseAmountNum => double.tryParse(baseAmountController.text.trim()) ?? 0.0;

  double get totalCharges {
    return breakdownItems
        .where((it) => it.type == 'charge')
        .fold(0.0, (sum, it) => sum + it.amount);
  }

  double get totalTaxes {
    return breakdownItems
        .where((it) => it.type == 'tax')
        .fold(0.0, (sum, it) => sum + it.amount);
  }

  double get totalDiscounts {
    return breakdownItems
        .where((it) => it.type == 'discount')
        .fold(0.0, (sum, it) => sum + it.amount);
  }

  double get finalTotalAmount {
    final total = baseAmountNum + totalCharges + totalTaxes - totalDiscounts;
    return total > 0 ? total : 0.0;
  }

  String get trackingGatewayUrl => 'https://one.vmovexa.com/api/v1/qr/${qrCodeId.value}';

  void copyTrackingGatewayUrl() {
    Clipboard.setData(ClipboardData(text: trackingGatewayUrl));
    Get.snackbar(
      'tracking_gateway_url_label'.tr,
      'link_copied_msg'.tr,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
  }

  @override
  void onInit() {
    super.onInit();
    _initDefaults();
    generateQrCode();
    fetchFleetOptions();

    videoUrlController.addListener(() {
      _handleVideoUrlChanged(videoUrlController.text.trim());
    });

    ever(routeSearchQuery, (_) => filterRoutes());
    ever(selectedCityFilter, (_) => filterRoutes());

    final dynamic arg = Get.arguments;
    if (arg is GovCampaignModel) {
      initForEdit(arg);
    } else if (arg is Map) {
      if (arg['campaign'] is GovCampaignModel) {
        initForEdit(arg['campaign'] as GovCampaignModel);
      } else if (arg['type'] == 'Emergency') {
        selectedCampaignType.value = 'Emergency Announcement';
        selectedPriority.value = 'Emergency';
        selectedCategory.value = 'Disaster & Weather Alert';
        nameController.text = 'Public Safety Emergency Advisory';
      }
    }

    if (!isEditMode.value) {
      checkSavedDraft();
    }
  }

  void _initDefaults() {
    if (breakdownItems.isEmpty) {
      breakdownItems.assignAll([
        BreakdownItemModel(
          id: 'item_airtime_std',
          key: 'FEE_AIRTIME_BROADCAST',
          label: 'Public Airtime Playback Fee',
          type: 'charge',
          amount: 2500.0,
        ),
        BreakdownItemModel(
          id: 'item_cgst_std',
          key: 'GST_CGST',
          label: 'Central GST (CGST 9%)',
          type: 'tax',
          amount: 2250.0,
        ),
        BreakdownItemModel(
          id: 'item_sgst_std',
          key: 'GST_SGST',
          label: 'State GST (SGST 9%)',
          type: 'tax',
          amount: 2250.0,
        ),
      ]);
    }
  }

  void initForEdit(GovCampaignModel c) {
    isEditMode.value = true;
    editingCampaignId.value = c.id ?? '';
    hasSavedDraft.value = false;
    draftSavedAt.value = '';
    draftInfo.value = null;

    // Step 1: Info & Nodal Officer Details
    nameController.text = c.name ?? c.title ?? '';
    brandNameController.text = c.brandName ?? c.agencyName ?? '';
    descriptionController.text = c.description ?? '';
    if (c.category != null && categories.contains(c.category)) {
      selectedCategory.value = c.category!;
    }
    if (c.priority != null && c.priority!.isNotEmpty) {
      final p = c.priority!.toLowerCase();
      if (p.contains('emerg')) {
        selectedPriority.value = 'Emergency';
      } else if (p.contains('high')) {
        selectedPriority.value = 'High';
      } else {
        selectedPriority.value = 'Normal';
      }
    }

    clientCompanyController.text = c.clientCompany ?? c.brandName ?? c.agencyName ?? '';

    // Step 2: Creative Assets
    creativeItems.clear();
    if (c.mediaUrl != null && c.mediaUrl!.isNotEmpty) {
      creativeItems.add(
        CreativeItemModel(
          id: 'media_1',
          name: c.mediaUrl!.split('/').last,
          previewUrl: c.mediaUrl,
          type: (c.contentType ?? '').toLowerCase().contains('video') ? 'Video' : 'Image',
          resolution: '1920x1080',
          durationSec: 15,
          size: '2.0 MB',
        ),
      );
    }

    // Step 4: Schedule
    if (c.startDate != null) {
      startDate.value = c.startDate!;
    }
    if (c.endDate != null) {
      endDate.value = c.endDate!;
    }
    if (c.activeDays != null && c.activeDays!.isNotEmpty) {
      selectedDays.assignAll(c.activeDays!);
    }
    if (c.broadcastStartTime != null && c.broadcastStartTime!.isNotEmpty) {
      dailySlotStart.value = c.broadcastStartTime!;
    }
    if (c.broadcastEndTime != null && c.broadcastEndTime!.isNotEmpty) {
      dailySlotEnd.value = c.broadcastEndTime!;
    }

    // Step 5: Budget
    if (c.qrCodeId != null && c.qrCodeId!.isNotEmpty) {
      qrCodeId.value = c.qrCodeId!;
    }
    if (c.qrRedirectUrl != null) {
      qrRedirectUrlController.text = c.qrRedirectUrl!;
    }
  }

  @override
  void onClose() {
    nameController.dispose();
    brandNameController.dispose();
    descriptionController.dispose();
    clientNameController.dispose();
    clientCompanyController.dispose();
    clientPhoneController.dispose();
    clientEmailController.dispose();
    clientSearchController.dispose();
    clientAddressController.dispose();
    clientCityController.dispose();
    clientStateController.dispose();
    clientPincodeController.dispose();
    videoUrlController.dispose();
    baseAmountController.dispose();
    qrRedirectUrlController.dispose();
    for (final textController in amountControllers.values) {
      textController.dispose();
    }
    amountControllers.clear();
    super.onClose();
  }

  // ==========================================================
  // STEP 1 ACTIONS
  // ==========================================================
  void updateClientLocation(double lat, double lng, String address, String city, String state, String pincode) {
    clientLatitude.value = lat;
    clientLongitude.value = lng;
    if (address.isNotEmpty) clientAddressController.text = address;
    if (city.isNotEmpty) clientCityController.text = city;
    if (state.isNotEmpty) clientStateController.text = state;
    if (pincode.isNotEmpty) clientPincodeController.text = pincode;
  }

  // ==========================================================
  // STEP 2 ACTIONS (CREATIVE)
  // ==========================================================
  void _handleVideoUrlChanged(String url) {
    if (url.isEmpty) {
      detectedYtId.value = '';
      ytThumbnailUrl.value = '';
      return;
    }
    final ytId = _extractYouTubeId(url);
    if (ytId != null && ytId.isNotEmpty) {
      detectedYtId.value = ytId;
      ytThumbnailUrl.value = 'https://img.youtube.com/vi/$ytId/hqdefault.jpg';
    } else {
      detectedYtId.value = '';
      ytThumbnailUrl.value = '';
    }
  }

  String? _extractYouTubeId(String url) {
    final regExp = RegExp(
      r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})',
      caseSensitive: false,
    );
    final match = regExp.firstMatch(url);
    return match?.group(1);
  }

  Future<void> pickMedia(String type) async {
    try {
      if (type == 'Video') {
        final XFile? file = await _picker.pickVideo(source: ImageSource.gallery);
        if (file != null) {
          final int length = await file.length();
          final sizeMb = (length / (1024 * 1024)).toStringAsFixed(1);
          creativeItems.add(
            CreativeItemModel(
              id: 'media_${DateTime.now().millisecondsSinceEpoch}',
              name: file.name,
              type: 'Video',
              size: '$sizeMb MB',
              resolution: '1920x1080',
              durationSec: 15,
              localPath: file.path,
            ),
          );
          selectedPreviewIndex.value = creativeItems.length - 1;
        }
      } else if (type == 'PDF') {
        creativeItems.add(
          CreativeItemModel(
            id: 'pdf_${DateTime.now().millisecondsSinceEpoch}',
            name: 'Public_Advisory_Notification.pdf',
            type: 'PDF',
            size: '1.8 MB',
            resolution: '1920x1080 (Vector)',
            durationSec: 15,
            localPath: 'public_advisory.pdf',
          ),
        );
        selectedPreviewIndex.value = creativeItems.length - 1;
        Get.snackbar(
          'pdf_document_tab'.tr,
          'vector_pdf_creative'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 2),
        );
      } else {
        final XFile? file = await _picker.pickImage(source: ImageSource.gallery);
        if (file != null) {
          final int length = await file.length();
          final sizeMb = (length / (1024 * 1024)).toStringAsFixed(1);
          creativeItems.add(
            CreativeItemModel(
              id: 'media_${DateTime.now().millisecondsSinceEpoch}',
              name: file.name,
              type: 'Image',
              size: '$sizeMb MB',
              resolution: '1920x1080',
              durationSec: 15,
              localPath: file.path,
            ),
          );
          selectedPreviewIndex.value = creativeItems.length - 1;
        }
      }
    } catch (e) {
      Get.snackbar('Picker Error', 'Could not access gallery: $e',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  void addVideoUrlToCreatives() {
    final url = videoUrlController.text.trim();
    if (url.isEmpty) {
      Get.snackbar('missing_url'.tr, 'enter_valid_streaming_url_msg'.tr,
          backgroundColor: const Color(0xFFF59E0B), colorText: Colors.white);
      return;
    }
    final ytId = detectedYtId.value;
    final thumb = ytThumbnailUrl.value;

    creativeItems.add(
      CreativeItemModel(
        id: 'url_${DateTime.now().millisecondsSinceEpoch}',
        name: ytId.isNotEmpty ? 'YouTube ($ytId)' : 'Online Video Stream',
        type: 'URL',
        size: 'Cloud Stream',
        resolution: '1080p Stream',
        durationSec: 15,
        videoUrl: url,
        previewUrl: thumb.isNotEmpty ? thumb : url,
      ),
    );
    selectedPreviewIndex.value = creativeItems.length - 1;
    videoUrlController.clear();
    detectedYtId.value = '';
    ytThumbnailUrl.value = '';
  }

  void removeCreativeItem(String id) {
    creativeItems.removeWhere((it) => it.id == id);
    if (selectedPreviewIndex.value >= creativeItems.length) {
      selectedPreviewIndex.value = creativeItems.isEmpty ? 0 : creativeItems.length - 1;
    }
  }

  void selectPreviewItem(int index) {
    if (index >= 0 && index < creativeItems.length) {
      selectedPreviewIndex.value = index;
    }
  }

  void updateCreativeDuration(String id, int duration) {
    final idx = creativeItems.indexWhere((it) => it.id == id);
    if (idx != -1) {
      final old = creativeItems[idx];
      creativeItems[idx] = CreativeItemModel(
        id: old.id,
        name: old.name,
        type: old.type,
        size: old.size,
        resolution: old.resolution,
        durationSec: duration,
        localPath: old.localPath,
        previewUrl: old.previewUrl,
        videoUrl: old.videoUrl,
      );
    }
  }

  // ==========================================================
  // STEP 3 ACTIONS (ROUTES & SCREENS INVENTORY)
  // ==========================================================
  Future<void> fetchFleetOptions() async {
    isLoadingFleets.value = true;
    try {
      if (Get.isRegistered<AdvertiserService>()) {
        final res = await AdvertiserService.to.getFleetOptions();
        if (res.success && res.data != null && res.data!.isNotEmpty) {
          availableFleets.assignAll(res.data!);
          _buildAllTransitRoutes(res.data!);
          return;
        }
      }

      final routesRes = await _govService.getTrackingRoutes();
      if (routesRes.success && routesRes.data != null && routesRes.data!.isNotEmpty) {
        final List<TransitRouteModel> synth = routesRes.data!.map((r) {
          final routeNum = int.tryParse(r.id.replaceAll(RegExp(r'[^0-9]'), '')) ?? 101;
          final rCode = r.code ?? 'RT-$routeNum';
          final rName = r.name;
          final rCity = (r.city != null && r.city!.isNotEmpty) ? r.city! : 'Bhopal';
          return TransitRouteModel(
            id: routeNum,
            code: rCode,
            name: rName,
            city: rCity,
            fleetId: 1,
            fleetName: '$rCity Urban Transit',
            organizationId: 1,
            vehicleCount: 12,
            totalScreens: 24,
            screensPerVehicle: 2,
            vehicles: [
              TransitVehicleModel(
                id: routeNum * 10 + 1,
                busNumber: 'MP-04-TR-${routeNum % 100}',
                displaysCount: 2,
                screens: [
                  TransitScreenModel(id: routeNum * 100 + 1, code: 'SCR-F', type: 'Front Overhead', resolution: '1920x1080', status: 'active'),
                  TransitScreenModel(id: routeNum * 100 + 2, code: 'SCR-R', type: 'Rear Cabin Display', resolution: '1920x1080', status: 'active'),
                ],
              ),
              TransitVehicleModel(
                id: routeNum * 10 + 2,
                busNumber: 'MP-04-TR-${(routeNum % 100) + 1}',
                displaysCount: 2,
                screens: [
                  TransitScreenModel(id: routeNum * 100 + 3, code: 'SCR-F', type: 'Front Overhead', resolution: '1920x1080', status: 'active'),
                  TransitScreenModel(id: routeNum * 100 + 4, code: 'SCR-R', type: 'Passenger Display', resolution: '1920x1080', status: 'active'),
                ],
              ),
            ],
          );
        }).toList();

        allTransitRoutes.assignAll(synth);
        final Set<String> citySet = {'All'};
        for (final r in synth) {
          if (r.city.isNotEmpty) citySet.add(r.city);
        }
        availableCities.assignAll(citySet.toList());
        filterRoutes();
      } else {
        _populateFallbackRoutes();
      }
    } catch (e) {
      debugPrint('Error fetching fleet options: $e');
      _populateFallbackRoutes();
    } finally {
      isLoadingFleets.value = false;
    }
  }

  void _populateFallbackRoutes() {
    final fallback = [
      TransitRouteModel(
        id: 101,
        code: 'BRTS-01',
        name: 'BRTS Trunk Corridor 1',
        city: 'Bhopal',
        fleetId: 1,
        fleetName: 'Bhopal City Transit',
        organizationId: 1,
        vehicleCount: 2,
        totalScreens: 4,
        screensPerVehicle: 2,
        vehicles: [
          TransitVehicleModel(
            id: 1011,
            busNumber: 'MP-04-BC-1011',
            displaysCount: 2,
            screens: [
              TransitScreenModel(id: 10111, code: 'SCR-1', type: 'Front Passenger Display', resolution: '1920x1080', status: 'active'),
              TransitScreenModel(id: 10112, code: 'SCR-2', type: 'Center Infotainment Display', resolution: '1920x1080', status: 'active'),
            ],
          ),
          TransitVehicleModel(
            id: 1012,
            busNumber: 'MP-04-BC-1012',
            displaysCount: 2,
            screens: [
              TransitScreenModel(id: 10121, code: 'SCR-1', type: 'Front Passenger Display', resolution: '1920x1080', status: 'active'),
              TransitScreenModel(id: 10122, code: 'SCR-2', type: 'Rear Passenger Display', resolution: '1920x1080', status: 'active'),
            ],
          ),
        ],
      ),
    ];

    allTransitRoutes.assignAll(fallback);
    availableCities.assignAll(['All', 'Bhopal']);
    filterRoutes();
  }

  void _buildAllTransitRoutes(List<FleetOptionModel> fleets) {
    final List<TransitRouteModel> routes = [];
    final Set<String> citySet = {'All'};

    for (final fleet in fleets) {
      if (fleet.routes.isNotEmpty) {
        for (final r in fleet.routes) {
          routes.add(r);
          if (r.city.isNotEmpty && r.city != 'Transit Network') {
            citySet.add(r.city);
          }
        }
      } else {
        final synthRoute = TransitRouteModel(
          id: fleet.id,
          code: 'FLEET-${fleet.id}',
          name: '${fleet.name} Transit Network',
          city: fleet.city ?? 'Transit Network',
          fleetId: fleet.id,
          fleetName: fleet.name,
          organizationId: fleet.organizationId,
          vehicleCount: fleet.busCount,
          totalScreens: fleet.screensCount,
          screensPerVehicle: fleet.busCount > 0 ? (fleet.screensCount / fleet.busCount).round() : 1,
        );
        routes.add(synthRoute);
        if (fleet.city != null && fleet.city!.isNotEmpty) citySet.add(fleet.city!);
      }
    }

    allTransitRoutes.assignAll(routes);
    availableCities.assignAll(citySet.toList());
    filterRoutes();
  }

  void filterRoutes() {
    final q = routeSearchQuery.value.trim().toLowerCase();
    final city = selectedCityFilter.value;

    final filtered = allTransitRoutes.where((r) {
      final matchCity = (city == 'All' || r.city.toLowerCase() == city.toLowerCase());
      final matchQuery = q.isEmpty ||
          r.name.toLowerCase().contains(q) ||
          r.code.toLowerCase().contains(q) ||
          r.fleetName.toLowerCase().contains(q) ||
          r.city.toLowerCase().contains(q);
      return matchCity && matchQuery;
    }).toList();

    filteredTransitRoutes.assignAll(filtered);
  }

  bool isRouteSelected(int routeId) {
    return selectedTargets.any((t) => t.routeId == routeId);
  }

  SelectedTargetModel? getTargetForRoute(int routeId) {
    return selectedTargets.firstWhereOrNull((t) => t.routeId == routeId);
  }

  void toggleRoute(TransitRouteModel route) {
    final existingIndex = selectedTargets.indexWhere((t) => t.routeId == route.id);
    if (existingIndex >= 0) {
      selectedTargets.removeAt(existingIndex);
    } else {
      final vIds = route.vehicles.map((v) => v.id).toList();
      final sIds = route.vehicles.expand((v) => v.screens.map((s) => s.id)).toList();

      selectedTargets.add(
        SelectedTargetModel(
          fleetId: route.fleetId,
          fleetName: route.fleetName,
          organizationId: route.organizationId,
          routeId: route.id,
          routeName: route.name,
          routeCode: route.code,
          city: route.city,
          vehicleIds: vIds,
          screenIds: sIds,
          vehicleCount: route.vehicleCount,
          totalScreens: route.totalScreens,
          screensPerVehicle: route.screensPerVehicle,
        ),
      );
    }
    selectedTargets.refresh();
  }

  void toggleBus(TransitRouteModel route, TransitVehicleModel vehicle) {
    final target = getTargetForRoute(route.id);
    if (target == null) {
      final busScreens = vehicle.screens.map((s) => s.id).toList();
      selectedTargets.add(
        SelectedTargetModel(
          fleetId: route.fleetId,
          fleetName: route.fleetName,
          organizationId: route.organizationId,
          routeId: route.id,
          routeName: route.name,
          routeCode: route.code,
          city: route.city,
          vehicleIds: [vehicle.id],
          screenIds: busScreens,
          vehicleCount: 1,
          totalScreens: busScreens.isNotEmpty ? busScreens.length : vehicle.displaysCount,
          screensPerVehicle: vehicle.displaysCount,
        ),
      );
    } else {
      final vIds = List<int>.from(target.vehicleIds);
      final sIds = List<int>.from(target.screenIds);
      final isBusSelected = vIds.contains(vehicle.id);
      final busScreens = vehicle.screens.map((s) => s.id).toList();

      if (isBusSelected) {
        vIds.remove(vehicle.id);
        sIds.removeWhere((id) => busScreens.contains(id));
      } else {
        vIds.add(vehicle.id);
        sIds.addAll(busScreens);
      }

      if (vIds.isEmpty) {
        selectedTargets.removeWhere((t) => t.routeId == route.id);
      } else {
        final updatedTarget = target.copyWith(
          vehicleIds: vIds,
          screenIds: sIds,
          vehicleCount: vIds.length,
          totalScreens: sIds.isNotEmpty ? sIds.length : (vIds.length * route.screensPerVehicle),
        );
        final idx = selectedTargets.indexWhere((t) => t.routeId == route.id);
        selectedTargets[idx] = updatedTarget;
      }
    }
    selectedTargets.refresh();
  }

  void toggleScreen(TransitRouteModel route, TransitVehicleModel vehicle, TransitScreenModel screen) {
    final target = getTargetForRoute(route.id);
    if (target == null) {
      selectedTargets.add(
        SelectedTargetModel(
          fleetId: route.fleetId,
          fleetName: route.fleetName,
          organizationId: route.organizationId,
          routeId: route.id,
          routeName: route.name,
          routeCode: route.code,
          city: route.city,
          vehicleIds: [vehicle.id],
          screenIds: [screen.id],
          vehicleCount: 1,
          totalScreens: 1,
          screensPerVehicle: 1,
        ),
      );
    } else {
      final vIds = List<int>.from(target.vehicleIds);
      final sIds = List<int>.from(target.screenIds);
      final isScreenSelected = sIds.contains(screen.id);

      if (isScreenSelected) {
        sIds.remove(screen.id);
        final busScreenIds = vehicle.screens.map((s) => s.id).toSet();
        final hasOtherBusScreens = sIds.any((id) => busScreenIds.contains(id));
        if (!hasOtherBusScreens) {
          vIds.remove(vehicle.id);
        }
      } else {
        sIds.add(screen.id);
        if (!vIds.contains(vehicle.id)) {
          vIds.add(vehicle.id);
        }
      }

      if (sIds.isEmpty && vIds.isEmpty) {
        selectedTargets.removeWhere((t) => t.routeId == route.id);
      } else {
        final updated = target.copyWith(
          vehicleIds: vIds,
          screenIds: sIds,
          vehicleCount: vIds.length,
          totalScreens: sIds.length,
        );
        final idx = selectedTargets.indexWhere((t) => t.routeId == route.id);
        selectedTargets[idx] = updated;
      }
    }
    selectedTargets.refresh();
  }

  void selectAllRoutes() {
    for (final route in filteredTransitRoutes) {
      if (!isRouteSelected(route.id)) {
        final vIds = route.vehicles.map((v) => v.id).toList();
        final sIds = route.vehicles.expand((v) => v.screens.map((s) => s.id)).toList();

        selectedTargets.add(
          SelectedTargetModel(
            fleetId: route.fleetId,
            fleetName: route.fleetName,
            organizationId: route.organizationId,
            routeId: route.id,
            routeName: route.name,
            routeCode: route.code,
            city: route.city,
            vehicleIds: vIds,
            screenIds: sIds,
            vehicleCount: route.vehicleCount,
            totalScreens: route.totalScreens,
            screensPerVehicle: route.screensPerVehicle,
          ),
        );
      }
    }
    selectedTargets.refresh();
  }

  void clearAllRoutes() {
    selectedTargets.clear();
    selectedTargets.refresh();
  }

  void toggleRouteExpanded(int routeId) {
    final current = expandedRoutes[routeId] ?? false;
    expandedRoutes[routeId] = !current;
    expandedRoutes.refresh();
  }

  void toggleBusExpanded(String busKey) {
    final current = expandedBuses[busKey] ?? false;
    expandedBuses[busKey] = !current;
    expandedBuses.refresh();
  }

  // ==========================================================
  // STEP 4 ACTIONS (SCHEDULE & PRIORITY)
  // ==========================================================
  void setDurationPreset(int days) {
    selectedDurationPreset.value = days;
    endDate.value = startDate.value.add(Duration(days: days - 1));
  }

  void setStartDate(DateTime date) {
    startDate.value = date;
    endDate.value = date.add(Duration(days: selectedDurationPreset.value - 1));
  }

  void setEndDate(DateTime date) {
    if (date.isBefore(startDate.value)) {
      Get.snackbar('invalid_date'.tr, 'end_date_earlier_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }
    endDate.value = date;
    selectedDurationPreset.value = date.difference(startDate.value).inDays + 1;
  }

  Future<void> selectStartDatePicker(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: startDate.value,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
    );
    if (picked != null) {
      setStartDate(picked);
    }
  }

  Future<void> selectEndDatePicker(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: endDate.value,
      firstDate: startDate.value,
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
    );
    if (picked != null) {
      setEndDate(picked);
    }
  }

  Future<void> selectStartTime(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: startTime.value,
    );
    if (picked != null) {
      startTime.value = picked;
      final h = picked.hour.toString().padLeft(2, '0');
      final m = picked.minute.toString().padLeft(2, '0');
      dailySlotStart.value = '$h:$m';
      selectedTimeSlotPreset.value = 'Custom Time';
    }
  }

  Future<void> selectEndTime(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: endTime.value,
    );
    if (picked != null) {
      endTime.value = picked;
      final h = picked.hour.toString().padLeft(2, '0');
      final m = picked.minute.toString().padLeft(2, '0');
      dailySlotEnd.value = '$h:$m';
      selectedTimeSlotPreset.value = 'Custom Time';
    }
  }

  void setRepeatPreset(String preset) {
    repeatFrequency.value = preset;
    if (preset == 'Daily') {
      selectedDays.assignAll(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    } else if (preset == 'Weekdays') {
      selectedDays.assignAll(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    } else if (preset == 'Weekends') {
      selectedDays.assignAll(['Sat', 'Sun']);
    }
  }

  void toggleDay(String day) {
    if (selectedDays.contains(day)) {
      if (selectedDays.length > 1) {
        selectedDays.remove(day);
        repeatFrequency.value = 'Custom';
      } else {
        Get.snackbar('status_warning_badge'.tr, 'at_least_one_active_day_msg'.tr,
            backgroundColor: const Color(0xFFF59E0B), colorText: Colors.white);
      }
    } else {
      selectedDays.add(day);
      if (selectedDays.length == 7) {
        repeatFrequency.value = 'Daily';
      } else {
        repeatFrequency.value = 'Custom';
      }
    }
  }

  void handleTimeSlotPreset(String start, String end) {
    dailySlotStart.value = start;
    dailySlotEnd.value = end;
    try {
      final sParts = start.split(':');
      startTime.value = TimeOfDay(hour: int.parse(sParts[0]), minute: int.parse(sParts[1]));
      final eParts = end.split(':');
      endTime.value = TimeOfDay(hour: int.parse(eParts[0]), minute: int.parse(eParts[1]));
    } catch (_) {}
    selectedTimeSlotPreset.value = '$start - $end';
  }

  void setTimeSlotPreset(String preset) {
    selectedTimeSlotPreset.value = preset;
    if (preset.startsWith('Prime Transit') || preset.contains('08:00 - 22:00')) {
      dailySlotStart.value = '08:00';
      dailySlotEnd.value = '22:00';
      startTime.value = const TimeOfDay(hour: 8, minute: 0);
      endTime.value = const TimeOfDay(hour: 22, minute: 0);
    } else if (preset.startsWith('Full Day') || preset.contains('06:00 - 23:00')) {
      dailySlotStart.value = '06:00';
      dailySlotEnd.value = '23:00';
      startTime.value = const TimeOfDay(hour: 6, minute: 0);
      endTime.value = const TimeOfDay(hour: 23, minute: 0);
    } else if (preset.startsWith('Morning Rush') || preset.contains('07:00 - 12:00')) {
      dailySlotStart.value = '07:00';
      dailySlotEnd.value = '12:00';
      startTime.value = const TimeOfDay(hour: 7, minute: 0);
      endTime.value = const TimeOfDay(hour: 12, minute: 0);
    } else if (preset.startsWith('Evening Rush') || preset.contains('16:00 - 22:00')) {
      dailySlotStart.value = '16:00';
      dailySlotEnd.value = '22:00';
      startTime.value = const TimeOfDay(hour: 16, minute: 0);
      endTime.value = const TimeOfDay(hour: 22, minute: 0);
    } else if (preset == 'Custom Time') {
      selectedTimeSlotPreset.value = 'Custom Time';
    }
  }

  void setPriority(String priority) {
    selectedPriority.value = priority;
  }

  Future<void> checkSlotAvailability() async {
    isCheckingSlot.value = true;
    await Future.delayed(const Duration(milliseconds: 600));
    slotAvailable.value = true;
    slotConflict.value = false;
    isCheckingSlot.value = false;
    Get.snackbar(
      'slot_availability_title'.tr,
      'slot_available_success'.tr,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  // ==========================================================
  // STEP 5 ACTIONS (BUDGET BREAKDOWN & CITIZEN QR IDENTITY)
  // ==========================================================
  void generateQrCode() {
    final randomHex = (100000 + Random().nextInt(900000)).toString();
    qrCodeId.value = 'VMX-GOV-$randomHex';
  }

  void addBreakdownItem() {
    final id = 'item_${DateTime.now().millisecondsSinceEpoch}';
    breakdownItems.add(
      BreakdownItemModel(
        id: id,
        key: 'CUSTOM',
        label: 'Custom Public Service Item',
        type: 'charge',
        amount: 0.0,
      ),
    );
  }

  void removeBreakdownItem(String id) {
    breakdownItems.removeWhere((it) => it.id == id);
  }

  void applyAutoCgst() {
    final base = baseAmountNum;
    final amount = (base * 0.09).roundToDouble();
    final existing = breakdownItems.firstWhereOrNull((it) => it.key == 'GST_CGST');
    if (existing != null) {
      existing.amount = amount;
      breakdownItems.refresh();
    } else {
      breakdownItems.add(
        BreakdownItemModel(
          id: 'item_${DateTime.now().millisecondsSinceEpoch}_cgst',
          key: 'GST_CGST',
          label: 'Central GST (CGST 9%)',
          type: 'tax',
          amount: amount,
        ),
      );
    }
  }

  void applyAutoIgst() {
    final base = baseAmountNum;
    final amount = (base * 0.18).roundToDouble();
    final existing = breakdownItems.firstWhereOrNull((it) => it.key == 'GST_IGST');
    if (existing != null) {
      existing.amount = amount;
      breakdownItems.refresh();
    } else {
      breakdownItems.add(
        BreakdownItemModel(
          id: 'item_${DateTime.now().millisecondsSinceEpoch}_igst',
          key: 'GST_IGST',
          label: 'Integrated GST (IGST 18%)',
          type: 'tax',
          amount: amount,
        ),
      );
    }
  }

  void updateBreakdownItemType(String id, String newType) {
    final it = breakdownItems.firstWhereOrNull((e) => e.id == id);
    if (it != null) {
      it.type = newType;
      breakdownItems.refresh();
    }
  }

  void updateBreakdownItemLabel(String id, String newLabel) {
    final it = breakdownItems.firstWhereOrNull((e) => e.id == id);
    if (it != null) {
      it.label = newLabel;
    }
  }

  final Map<String, TextEditingController> amountControllers = <String, TextEditingController>{};

  TextEditingController getAmountController(dynamic item) {
    final String key = item.id.toString();
    return amountControllers.putIfAbsent(
      key,
      () => TextEditingController(
        text: (item.amount as num) > 0 ? (item.amount as num).toStringAsFixed(0) : '',
      ),
    );
  }

  void updateBreakdownItemAmount(String id, double amount) {
    final it = breakdownItems.firstWhereOrNull((e) => e.id == id);
    if (it != null) {
      it.amount = amount;
      breakdownItems.refresh();
    }
  }

  void applyTaxPercentToItem(String id, double percent) {
    final base = baseAmountNum;
    final taxVal = (base * (percent / 100.0)).roundToDouble();
    final it = breakdownItems.firstWhereOrNull((e) => e.id == id);
    if (it != null) {
      it.amount = taxVal;
      it.type = 'tax';
      breakdownItems.refresh();
    }
  }

  void selectBreakdownPreset(String id, String key) {
    final idx = breakdownItems.indexWhere((it) => it.id == id);
    if (idx < 0) return;

    String label = 'Custom Line Item';
    String type = 'charge';
    double amount = 0.0;
    final base = baseAmountNum;

    switch (key) {
      case 'GST_CGST':
        label = 'Central GST (CGST 9%)';
        type = 'tax';
        amount = (base * 0.09).roundToDouble();
        break;
      case 'GST_SGST':
        label = 'State GST (SGST 9%)';
        type = 'tax';
        amount = (base * 0.09).roundToDouble();
        break;
      case 'GST_IGST':
        label = 'Integrated GST (IGST 18%)';
        type = 'tax';
        amount = (base * 0.18).roundToDouble();
        break;
      case 'GST_CESS':
        label = 'GST Compensation Cess';
        type = 'tax';
        amount = 0.0;
        break;
      case 'FEE_AIRTIME_BROADCAST':
        label = 'Public Airtime Playback Fee';
        type = 'charge';
        amount = (base * 0.10).roundToDouble();
        break;
      case 'FEE_HARDWARE_RENTAL':
        label = 'Hardware Maintenance & Edge IoT Rental';
        type = 'charge';
        amount = 5000.0;
        break;
      case 'FEE_CREATIVE_DESIGN':
        label = 'Creative Verification & Compliance';
        type = 'charge';
        amount = 2500.0;
        break;
      case 'FEE_ONBOARDING_SETUP':
        label = 'Campaign Deployment & Fleet Onboarding';
        type = 'charge';
        amount = 3500.0;
        break;
      case 'DISCOUNT_VOLUME':
        label = 'High Frequency Broadcast Discount';
        type = 'discount';
        amount = (base * 0.15).roundToDouble();
        break;
      case 'DISCOUNT_PROMO':
        label = 'Welfare Campaign Concession';
        type = 'discount';
        amount = (base * 0.10).roundToDouble();
        break;
      default:
        label = 'Custom Surcharge / Fee';
        type = 'charge';
        amount = 0.0;
    }

    final item = breakdownItems[idx];
    item.key = key;
    item.label = label;
    item.type = type;
    item.amount = amount;
    if (amountControllers.containsKey(id)) {
      amountControllers[id]?.text = amount > 0 ? amount.toStringAsFixed(0) : '';
    }
    breakdownItems.refresh();
  }

  void shareQrCode() {
    final trackingUrl = trackingGatewayUrl;
    final landing = qrRedirectUrlController.text.trim();
    final text = 'Public Welfare Broadcast QR: ${qrCodeId.value}\nTracking Gateway: $trackingUrl${landing.isNotEmpty ? "\nCitizen Portal: $landing" : ""}';
    Get.snackbar(
      'share_qr_btn'.tr,
      text,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void downloadQrCode() {
    Get.snackbar(
      'download_qr_btn'.tr,
      'qr_code_saved_msg'.tr,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  // ==========================================================
  // STEP VALIDATIONS
  // ==========================================================
  bool validateStep1() {
    if (nameController.text.trim().isEmpty) {
      Get.snackbar('required_label'.tr, 'enter_campaign_name_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (clientNameController.text.trim().isEmpty) {
      Get.snackbar('required_label'.tr, 'gov_nodal_officer_ph'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (clientPhoneController.text.trim().isEmpty) {
      Get.snackbar('required_label'.tr, 'enter_customer_mobile_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (clientEmailController.text.trim().isEmpty) {
      Get.snackbar('required_label'.tr, 'enter_customer_email_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep2() {
    if (selectedCreativeType.value == 'URL' && videoUrlController.text.trim().isNotEmpty) {
      addVideoUrlToCreatives();
    }
    if (creativeItems.isEmpty) {
      Get.snackbar('required_label'.tr, 'attach_creative_or_url_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep3() {
    if (selectedTargets.isEmpty) {
      Get.snackbar('required_label'.tr, 'select_transit_route_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (totalSelectedScreens <= 0) {
      Get.snackbar('required_label'.tr, 'routes_zero_screens_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep4() {
    if (endDate.value.isBefore(startDate.value)) {
      Get.snackbar('required_label'.tr, 'end_date_before_start_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (selectedDays.isEmpty) {
      Get.snackbar('required_label'.tr, 'at_least_one_active_day_msg'.tr,
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (dailySlotStart.value.compareTo(dailySlotEnd.value) >= 0) {
      Get.snackbar('required_label'.tr, 'Daily Broadcast End Time must be later than Start Time',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep5() {
    return true;
  }

  // ==========================================================
  // STEPPER NAVIGATION
  // ==========================================================
  void nextStep() {
    if (isSubmitting.value) return;

    if (currentStep.value == 1 && !validateStep1()) return;
    if (currentStep.value == 2 && !validateStep2()) return;
    if (currentStep.value == 3 && !validateStep3()) return;
    if (currentStep.value == 4 && !validateStep4()) return;
    if (currentStep.value == 5 && !validateStep5()) return;

    if (currentStep.value < totalSteps) {
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

  void goToStep(int step) {
    if (isSubmitting.value) return;
    if (step >= 1 && step <= totalSteps) {
      currentStep.value = step;
    }
  }

  void closeWizard() {
    Get.back();
  }

  // ==========================================================
  // STEP 6: FINAL SUBMIT FOR CLEARANCE
  // ==========================================================
  Future<void> submitCampaign() async {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      final List<Map<String, dynamic>> uploadedMedia = [];
      for (int i = 0; i < creativeItems.length; i++) {
        final item = creativeItems[i];
        if (item.localPath != null && item.localPath!.isNotEmpty) {
          final res = await _govService.uploadCampaignMedia(item.localPath!);
          final fileUrl = res.data?['url'] ?? res.data?['file_url'] ?? res.data?['filePath'] ?? item.localPath;
          uploadedMedia.add({
            'file_url': fileUrl,
            'media_type': item.type == 'Video' ? 'video' : 'image',
            'resolution': item.resolution,
            'duration_sec': item.durationSec,
            'file_size': item.size,
            'sequence_order': i + 1,
            'is_enabled': true,
          });
        } else {
          uploadedMedia.add(item.toJson());
        }
      }

      final primaryMedia = uploadedMedia.isNotEmpty ? uploadedMedia.first : null;
      final mediaUrl = primaryMedia?['file_url']?.toString();
      final mediaType = primaryMedia?['media_type']?.toString() ?? 'image';

      final targetsPayload = selectedTargets.map((t) => t.toJson()).toList();

      final breakdownPayload = {
        'baseAmount': baseAmountNum,
        'charges': totalCharges,
        'taxes': totalTaxes,
        'discounts': totalDiscounts,
        'finalTotal': finalTotalAmount,
        'items': breakdownItems.map((it) => it.toJson()).toList(),
      };

      final slotsPayload = selectedTargets.map((t) {
        return {
          'routeId': t.routeId,
          'startDate': DateFormat('yyyy-MM-dd').format(startDate.value),
          'endDate': DateFormat('yyyy-MM-dd').format(endDate.value),
          'startTime': dailySlotStart.value,
          'endTime': dailySlotEnd.value,
          'activeDays': selectedDays.toList(),
          if (t.screenIds.isNotEmpty) 'screenIds': t.screenIds,
          if (t.vehicleIds.isNotEmpty) 'vehicleIds': t.vehicleIds,
        };
      }).toList();

      final authorityName = brandNameController.text.trim().isNotEmpty
          ? brandNameController.text.trim()
          : (clientCompanyController.text.trim().isNotEmpty
              ? clientCompanyController.text.trim()
              : 'Government Department');

      final payload = {
        'title': nameController.text.trim(),
        'name': nameController.text.trim(),
        'brand_name': authorityName,
        'brandName': authorityName,
        'campaign_type': selectedCampaignType.value,
        'owner_type': 'government',
        'ownerType': 'government',
        'type': 'government_psa',
        'priority': selectedPriority.value.toLowerCase(),
        'description': descriptionController.text.trim(),
        'objective': selectedObjective.value,
        'category': selectedCategory.value,
        'client_name': clientNameController.text.trim(),
        'client_company': clientCompanyController.text.trim().isNotEmpty
            ? clientCompanyController.text.trim()
            : authorityName,
        'client_phone': clientPhoneController.text.trim(),
        'client_email': clientEmailController.text.trim(),
        'client_address': clientAddressController.text.trim(),
        'client_city': clientCityController.text.trim(),
        'client_state': clientStateController.text.trim(),
        'client_pincode': clientPincodeController.text.trim(),
        'client_latitude': clientLatitude.value,
        'client_longitude': clientLongitude.value,
        'targeting_mode': 'All Screens',
        'placement': 'All Screens',
        'timezone': timezone.value,
        'start_date': DateFormat('yyyy-MM-dd').format(startDate.value),
        'end_date': DateFormat('yyyy-MM-dd').format(endDate.value),
        'duration_days': durationDaysNumber,
        'budget': finalTotalAmount,
        'budget_type': budgetType.value,
        'payment_breakdown': breakdownPayload,
        'qr_code': enableQrCode.value ? qrCodeId.value : null,
        'qr_redirect_url': enableQrCode.value ? qrRedirectUrlController.text.trim() : null,
        'media_url': mediaUrl,
        'media_type': mediaType,
        'media': uploadedMedia,
        'frequency': repeatFrequency.value,
        'active_days': selectedDays.toList(),
        'broadcast_start_time': dailySlotStart.value,
        'broadcast_end_time': dailySlotEnd.value,
        'targets': targetsPayload,
        'slots': slotsPayload,
        'total_vehicles': totalSelectedVehicles,
        'total_screens': totalSelectedScreens,
      };

      if (isEditMode.value && editingCampaignId.value.isNotEmpty) {
        final res = await _govService.updateCampaign(editingCampaignId.value, payload);
        if (res.success) {
          isSubmitted.value = true;
          await StorageService.to.clearGovCampaignDraft();
          hasSavedDraft.value = false;
          draftSavedAt.value = '';
          draftInfo.value = null;
          Get.snackbar('success'.tr, 'Broadcast updated successfully',
              backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        } else {
          Get.snackbar('Update Failed', res.message ?? 'Failed to update broadcast',
              backgroundColor: const Color(0xFFEF4444), colorText: Colors.white, duration: const Duration(seconds: 4));
        }
      } else {
        final res = await _govService.createCampaign(payload);
        if (res.success) {
          createdCampaign.value = res.data;
          isSubmitted.value = true;
          await StorageService.to.clearGovCampaignDraft();
          hasSavedDraft.value = false;
          draftSavedAt.value = '';
          draftInfo.value = null;
        } else {
          Get.snackbar('Submission Failed', res.message ?? 'Failed to create broadcast',
              backgroundColor: const Color(0xFFEF4444), colorText: Colors.white, duration: const Duration(seconds: 4));
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'An error occurred during submission: $e',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    } finally {
      isSubmitting.value = false;
    }
  }

  // ==========================================================
  // DRAFT PERSISTENCE (GOVERNMENT)
  // ==========================================================
  Future<void> saveDraft() async {
    try {
      final nowFormatted = DateFormat('dd MMM, hh:mm a').format(DateTime.now());
      final draftData = {
        'savedAt': nowFormatted,
        'step': currentStep.value,
        'name': nameController.text.trim(),
        'brandName': brandNameController.text.trim(),
        'category': selectedCategory.value,
        'type': selectedCampaignType.value,
        'objective': selectedObjective.value,
        'priority': selectedPriority.value,
        'description': descriptionController.text.trim(),
        'clientName': clientNameController.text.trim(),
        'clientCompany': clientCompanyController.text.trim(),
        'clientPhone': clientPhoneController.text.trim(),
        'clientEmail': clientEmailController.text.trim(),
        'clientAddress': clientAddressController.text.trim(),
        'clientCity': clientCityController.text.trim(),
        'clientState': clientStateController.text.trim(),
        'clientPincode': clientPincodeController.text.trim(),
        'clientLatitude': clientLatitude.value,
        'clientLongitude': clientLongitude.value,
        'startDate': startDate.value.toIso8601String(),
        'endDate': endDate.value.toIso8601String(),
        'dailySlotStart': dailySlotStart.value,
        'dailySlotEnd': dailySlotEnd.value,
        'selectedDays': selectedDays.toList(),
        'baseAmount': baseAmountController.text,
        'enableQrCode': enableQrCode.value,
        'qrCodeId': qrCodeId.value,
        'qrRedirectUrl': qrRedirectUrlController.text.trim(),
        'creatives': creativeItems.map((c) => {
          'id': c.id,
          'name': c.name,
          'type': c.type,
          'size': c.size,
          'resolution': c.resolution,
          'durationSec': c.durationSec,
          'localPath': c.localPath,
          'videoUrl': c.videoUrl,
          'previewUrl': c.previewUrl,
        }).toList(),
      };

      await StorageService.to.saveGovCampaignDraft(draftData);
      hasSavedDraft.value = true;
      draftSavedAt.value = nowFormatted;
      draftInfo.value = {
        'name': nameController.text.trim().isNotEmpty ? nameController.text.trim() : 'Public Welfare Broadcast',
        'savedTime': nowFormatted,
        'step': currentStep.value,
      };

      Get.snackbar(
        'save_draft_btn'.tr,
        'draft_saved_success_msg'.tr,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      Get.snackbar('Draft Error', 'Could not save draft: $e',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  void checkSavedDraft() {
    if (StorageService.to.hasGovCampaignDraft()) {
      final draft = StorageService.to.getGovCampaignDraft();
      if (draft != null) {
        hasSavedDraft.value = true;
        draftSavedAt.value = draft['savedAt']?.toString() ?? '';
        draftInfo.value = {
          'name': draft['name']?.toString().isNotEmpty == true ? draft['name'] : 'Public Welfare Broadcast',
          'savedTime': draft['savedAt']?.toString() ?? '',
          'step': draft['step'] ?? 1,
        };
      }
    }
  }

  void restoreDraft() {
    final draft = StorageService.to.getGovCampaignDraft();
    if (draft == null) return;

    try {
      if (draft['name'] != null) nameController.text = draft['name'];
      if (draft['brandName'] != null) brandNameController.text = draft['brandName'];
      if (draft['category'] != null && categories.contains(draft['category'])) {
        selectedCategory.value = draft['category'];
      }
      if (draft['type'] != null && campaignTypes.contains(draft['type'])) {
        selectedCampaignType.value = draft['type'];
      }
      if (draft['objective'] != null && objectives.contains(draft['objective'])) {
        selectedObjective.value = draft['objective'];
      }
      if (draft['priority'] != null && priorityOptions.contains(draft['priority'])) {
        selectedPriority.value = draft['priority'];
      }
      if (draft['description'] != null) descriptionController.text = draft['description'];
      if (draft['clientName'] != null) clientNameController.text = draft['clientName'];
      if (draft['clientCompany'] != null) clientCompanyController.text = draft['clientCompany'];
      if (draft['clientPhone'] != null) clientPhoneController.text = draft['clientPhone'];
      if (draft['clientEmail'] != null) clientEmailController.text = draft['clientEmail'];
      if (draft['clientAddress'] != null) clientAddressController.text = draft['clientAddress'];
      if (draft['clientCity'] != null) clientCityController.text = draft['clientCity'];
      if (draft['clientState'] != null) clientStateController.text = draft['clientState'];
      if (draft['clientPincode'] != null) clientPincodeController.text = draft['clientPincode'];
      if (draft['clientLatitude'] != null) clientLatitude.value = (draft['clientLatitude'] as num).toDouble();
      if (draft['clientLongitude'] != null) clientLongitude.value = (draft['clientLongitude'] as num).toDouble();

      if (draft['startDate'] != null) {
        final d = DateTime.tryParse(draft['startDate']);
        if (d != null) startDate.value = d;
      }
      if (draft['endDate'] != null) {
        final d = DateTime.tryParse(draft['endDate']);
        if (d != null) endDate.value = d;
      }
      if (draft['dailySlotStart'] != null) dailySlotStart.value = draft['dailySlotStart'];
      if (draft['dailySlotEnd'] != null) dailySlotEnd.value = draft['dailySlotEnd'];
      if (draft['selectedDays'] is List) {
        selectedDays.assignAll(List<String>.from(draft['selectedDays']));
      }

      if (draft['baseAmount'] != null) baseAmountController.text = draft['baseAmount'].toString();
      if (draft['enableQrCode'] != null) enableQrCode.value = draft['enableQrCode'] == true;
      if (draft['qrCodeId'] != null) qrCodeId.value = draft['qrCodeId'];
      if (draft['qrRedirectUrl'] != null) qrRedirectUrlController.text = draft['qrRedirectUrl'];

      if (draft['creatives'] is List) {
        creativeItems.clear();
        for (final it in draft['creatives']) {
          if (it is Map) {
            creativeItems.add(
              CreativeItemModel(
                id: it['id']?.toString() ?? 'media_${DateTime.now().millisecondsSinceEpoch}',
                name: it['name']?.toString() ?? 'Asset',
                type: it['type']?.toString() ?? 'Image',
                size: it['size']?.toString() ?? '',
                resolution: it['resolution']?.toString() ?? '1920x1080',
                durationSec: it['durationSec'] is int ? it['durationSec'] : 15,
                localPath: it['localPath']?.toString(),
                videoUrl: it['videoUrl']?.toString(),
                previewUrl: it['previewUrl']?.toString(),
              ),
            );
          }
        }
      }

      if (draft['step'] != null) {
        final st = int.tryParse(draft['step'].toString()) ?? 1;
        currentStep.value = st.clamp(1, totalSteps);
      }

      Get.snackbar(
        'restore_draft_btn'.tr,
        'draft_restored_success_msg'.tr,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );
    } catch (e) {
      Get.snackbar('Restore Error', 'Could not restore draft: $e',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> discardDraft() async {
    await StorageService.to.clearGovCampaignDraft();
    hasSavedDraft.value = false;
    draftSavedAt.value = '';
    draftInfo.value = null;
    Get.snackbar(
      'discard_btn'.tr,
      'draft_discarded_msg'.tr,
      backgroundColor: const Color(0xFF6B7280),
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
  }
}
