import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class CreateCampaignController extends GetxController {
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
  final Rxn<CampaignModel> createdCampaign = Rxn<CampaignModel>();

  // Edit Mode state
  final RxBool isEditMode = false.obs;
  final RxString editingCampaignId = ''.obs;

  // Draft Persistence States matching Admin Panel
  final RxBool hasSavedDraft = false.obs;
  final RxString draftSavedAt = ''.obs;
  final Rx<Map<String, dynamic>?> draftInfo = Rx<Map<String, dynamic>?>(null);

  // ==========================================================
  // STEP 1: CAMPAIGN INFORMATION & CUSTOMER DETAILS
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

  // Customer / Client Details (External client on whose behalf ad is created)
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
  // STEP 2: CREATIVE ASSETS & VIDEO URL
  // ==========================================================
  final RxString selectedCreativeType = 'All'.obs;
  final videoUrlController = TextEditingController();
  final RxString detectedYtId = ''.obs;
  final RxString ytThumbnailUrl = ''.obs;
  final RxList<CreativeItemModel> creativeItems = <CreativeItemModel>[].obs;
  final ImagePicker _picker = ImagePicker();

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
  final RxList<String> selectedDays = <String>['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].obs;
  final RxString dailySlotStart = '08:00'.obs;
  final RxString dailySlotEnd = '22:00'.obs;
  final RxString selectedTimeSlotPreset = 'Prime Transit (08:00 - 22:00)'.obs;
  final RxString timezone = 'GMT +05:30 India Standard Time'.obs;
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

  int get durationDaysNumber {
    final diff = endDate.value.difference(startDate.value).inDays + 1;
    return diff > 0 ? diff : 1;
  }

  int get activeBroadcastDaysCount => selectedDays.length;

  double get dailyOperatingHours {
    try {
      final sParts = dailySlotStart.value.split(':').map(int.parse).toList();
      final eParts = dailySlotEnd.value.split(':').map(int.parse).toList();
      final sMins = sParts[0] * 60 + sParts[1];
      final eMins = eParts[0] * 60 + eParts[1];
      final diff = eMins - sMins;
      return diff > 0 ? (diff / 60.0) : 0.0;
    } catch (_) {
      return 14.0;
    }
  }

  String get formattedDailyOperatingHours {
    final h = dailyOperatingHours;
    return h == h.roundToDouble() ? h.toInt().toString() : h.toStringAsFixed(1);
  }

  // ==========================================================
  // STEP 5: BUDGET & DYNAMIC PAYMENT BREAKDOWN + QR IDENTITY
  // ==========================================================
  final RxString budgetType = 'Total Budget'.obs;
  final baseAmountController = TextEditingController(text: '0');
  final RxList<BreakdownItemModel> breakdownItems = <BreakdownItemModel>[].obs;
  final RxString qrCodeId = ''.obs;
  final qrRedirectUrlController = TextEditingController();

  double get baseAmountNum {
    final text = baseAmountController.text.replaceAll(',', '').trim();
    return double.tryParse(text) ?? 0.0;
  }

  double get totalCharges {
    return breakdownItems.where((it) => it.type == 'charge').fold(0.0, (sum, it) => sum + it.amount);
  }

  double get totalTaxes {
    return breakdownItems.where((it) => it.type == 'tax').fold(0.0, (sum, it) => sum + it.amount);
  }

  double get totalDiscounts {
    return breakdownItems.where((it) => it.type == 'discount').fold(0.0, (sum, it) => sum + it.amount);
  }

  double get finalTotalAmount {
    final total = baseAmountNum + totalCharges + totalTaxes - totalDiscounts;
    return total > 0 ? total : 0.0;
  }

  double get subtotalNet => baseAmountNum + totalCharges - totalDiscounts;

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

  AdvertiserService get _service => AdvertiserService.to;

  @override
  void onInit() {
    super.onInit();
    generateQrCode();
    fetchFleetOptions();

    videoUrlController.addListener(() {
      _handleVideoUrlChanged(videoUrlController.text.trim());
    });

    ever(routeSearchQuery, (_) => filterRoutes());
    ever(selectedCityFilter, (_) => filterRoutes());

    final dynamic arg = Get.arguments;
    if (arg is CampaignModel) {
      initForEdit(arg);
    } else if (arg is Map && (arg['campaign'] is CampaignModel || arg['isEdit'] == true)) {
      if (arg['campaign'] is CampaignModel) {
        initForEdit(arg['campaign'] as CampaignModel);
      }
    }

    if (!isEditMode.value) {
      checkSavedDraft();
    }
  }

  void initForEdit(CampaignModel c) {
    isEditMode.value = true;
    editingCampaignId.value = c.id;
    hasSavedDraft.value = false;
    draftSavedAt.value = '';
    draftInfo.value = null;

    // Step 1: Info & Client Details
    nameController.text = c.displayTitle;
    brandNameController.text = c.brandName ?? '';
    descriptionController.text = c.description ?? '';
    if (c.type != null && campaignTypes.contains(c.type)) {
      selectedCampaignType.value = c.type!;
    }
    if (c.category != null && categories.contains(c.category)) {
      selectedCategory.value = c.category!;
    }
    clientNameController.text = c.clientName ?? '';
    clientCompanyController.text = c.clientCompany ?? '';
    clientPhoneController.text = c.clientPhone ?? '';
    clientEmailController.text = c.clientEmail ?? '';
    clientAddressController.text = c.clientAddress ?? '';
    clientCityController.text = c.clientCity ?? '';
    clientStateController.text = c.clientState ?? '';
    clientPincodeController.text = c.clientPincode ?? '';
    if (c.clientLatitude != null) clientLatitude.value = c.clientLatitude;
    if (c.clientLongitude != null) clientLongitude.value = c.clientLongitude;

    // Step 2: Creative Assets
    creativeItems.clear();
    for (int i = 0; i < c.media.length; i++) {
      final m = c.media[i];
      creativeItems.add(
        CreativeItemModel(
          id: 'media_${i + 1}',
          name: m.fileUrl?.split('/').last ?? 'Creative Asset ${i + 1}',
          previewUrl: m.fileUrl,
          type: (m.mediaType ?? '').toLowerCase().contains('video') ? 'Video' : 'Image',
          resolution: m.resolution ?? '1920x1080',
          durationSec: m.durationSec ?? 15,
          size: m.fileSize ?? '2.4 MB',
        ),
      );
    }
    if (c.videoUrl != null && c.videoUrl!.isNotEmpty) {
      videoUrlController.text = c.videoUrl!;
      _handleVideoUrlChanged(c.videoUrl!);
    } else if (creativeItems.isEmpty && c.mediaUrl != null && c.mediaUrl!.isNotEmpty) {
      creativeItems.add(
        CreativeItemModel(
          id: 'media_1',
          name: c.mediaUrl!.split('/').last,
          previewUrl: c.mediaUrl,
          type: (c.mediaType ?? '').toLowerCase().contains('video') ? 'Video' : 'Image',
          resolution: '1920x1080',
          durationSec: 15,
          size: '2.0 MB',
        ),
      );
    }

    // Step 3: Targets
    selectedTargets.clear();
    for (final t in c.targets) {
      selectedTargets.add(
        SelectedTargetModel(
          fleetId: t.fleetId ?? 1,
          fleetName: t.fleetName ?? 'City Transit',
          routeId: t.routeId ?? 1,
          routeName: t.fleetName ?? 'Target Route',
          routeCode: 'RT-${t.routeId ?? 1}',
          city: t.city ?? 'All',
          vehicleCount: t.vehiclesCount > 0 ? t.vehiclesCount : 1,
          totalScreens: t.screensCount > 0 ? t.screensCount : 2,
          vehicleIds: t.vehicleIds,
          screenIds: t.screenIds,
        ),
      );
    }

    // Step 4: Schedule
    if (c.startDate != null) {
      final d = DateTime.tryParse(c.startDate!);
      if (d != null) startDate.value = d;
    }
    if (c.endDate != null) {
      final d = DateTime.tryParse(c.endDate!);
      if (d != null) endDate.value = d;
    }
    if (c.slot != null) {
      if (c.slot!.startTime != null) dailySlotStart.value = c.slot!.startTime!;
      if (c.slot!.endTime != null) dailySlotEnd.value = c.slot!.endTime!;
      if (c.slot!.activeDays.isNotEmpty) selectedDays.assignAll(c.slot!.activeDays);
    }

    // Step 5: Budget & Breakdown
    final pb = c.paymentBreakdown;
    if (pb != null && pb['baseAmount'] != null) {
      baseAmountController.text = pb['baseAmount'].toString();
    } else if (c.rawBudget != null) {
      baseAmountController.text = c.rawBudget!.toStringAsFixed(0);
    }

    if (pb != null && pb['items'] is List) {
      breakdownItems.clear();
      for (final it in pb['items']) {
        if (it is Map) {
          breakdownItems.add(
            BreakdownItemModel(
              id: it['id']?.toString() ?? 'item_${DateTime.now().millisecondsSinceEpoch}',
              key: it['key']?.toString() ?? 'CUSTOM',
              label: it['label']?.toString() ?? 'Fee',
              type: it['type']?.toString() ?? 'charge',
              amount: double.tryParse(it['amount']?.toString() ?? '0') ?? 0.0,
            ),
          );
        }
      }
    }

    if (c.promoCode != null && c.promoCode!.isNotEmpty) {
      qrCodeId.value = c.promoCode!;
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
        }
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
      Get.snackbar('Missing URL', 'Please enter a valid YouTube or video streaming URL',
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
    videoUrlController.clear();
    detectedYtId.value = '';
    ytThumbnailUrl.value = '';
  }

  void removeCreativeItem(String id) {
    creativeItems.removeWhere((it) => it.id == id);
  }

  // ==========================================================
  // STEP 3 ACTIONS (ROUTES & SCREENS INVENTORY)
  // ==========================================================
  Future<void> fetchFleetOptions() async {
    isLoadingFleets.value = true;
    try {
      final res = await _service.getFleetOptions();
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        availableFleets.assignAll(res.data!);
        _buildAllTransitRoutes(res.data!);
      }
    } catch (e) {
      debugPrint('Error fetching fleet options: $e');
    } finally {
      isLoadingFleets.value = false;
    }
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
        // Synthesize route if only fleet level is given
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
      // Create new target with only this bus
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
  // STEP 4 ACTIONS (SCHEDULE)
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
      Get.snackbar('Invalid Date', 'End date cannot be earlier than start date',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }
    endDate.value = date;
    selectedDurationPreset.value = date.difference(startDate.value).inDays + 1;
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
      selectedDays.assignAll(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
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
        Get.snackbar('Warning', 'At least 1 active day is required',
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
    } else if (preset.startsWith('Morning Rush') || preset.contains('07:00 - 12:00') || preset.contains('08:00 - 12:00')) {
      dailySlotStart.value = '07:00';
      dailySlotEnd.value = '12:00';
      startTime.value = const TimeOfDay(hour: 7, minute: 0);
      endTime.value = const TimeOfDay(hour: 12, minute: 0);
    } else if (preset.startsWith('Evening Rush') || preset.contains('16:00 - 22:00') || preset.contains('16:00 - 21:00')) {
      dailySlotStart.value = '16:00';
      dailySlotEnd.value = '22:00';
      startTime.value = const TimeOfDay(hour: 16, minute: 0);
      endTime.value = const TimeOfDay(hour: 22, minute: 0);
    } else if (preset == 'Custom Time' || preset == 'Custom Operating Hours') {
      selectedTimeSlotPreset.value = 'Custom Time';
    }
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
  // STEP 5 ACTIONS (BUDGET BREAKDOWN & QR IDENTITY)
  // ==========================================================
  void generateQrCode() {
    final randomHex = (100000 + Random().nextInt(900000)).toString();
    qrCodeId.value = 'VMX-QR-$randomHex';
  }

  void addBreakdownItem() {
    final id = 'item_${DateTime.now().millisecondsSinceEpoch}';
    breakdownItems.add(
      BreakdownItemModel(
        id: id,
        key: 'CUSTOM',
        label: 'Custom Item',
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
  final Map<String, TextEditingController> amountControllers =
  <String, TextEditingController>{};

  TextEditingController getAmountController(item) {
    final String key = item.id.toString();

    return amountControllers.putIfAbsent(
      key,
          () => TextEditingController(
        text: (item.amount as num) > 0
            ? (item.amount as num).toStringAsFixed(0)
            : '',
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

    String label = 'Custom Item';
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
        label = 'Compensation Cess (1%)';
        type = 'tax';
        amount = (base * 0.01).roundToDouble();
        break;
      case 'FEE_AIRTIME_BROADCAST':
        label = 'Standard Airtime Playback Fee';
        type = 'charge';
        amount = (base * 0.10).roundToDouble();
        break;
      case 'FEE_HARDWARE_RENTAL':
        label = 'Hardware Screen Rental Fee';
        type = 'charge';
        amount = 5000.0;
        break;
      case 'FEE_CREATIVE_DESIGN':
        label = 'Creative Review & Verification';
        type = 'charge';
        amount = 2500.0;
        break;
      case 'FEE_ONBOARDING_SETUP':
        label = 'Setup & Deployment Fee';
        type = 'charge';
        amount = 3500.0;
        break;
      case 'DISCOUNT_VOLUME':
        label = 'Volume Fleet Discount';
        type = 'discount';
        amount = (base * 0.05).roundToDouble();
        break;
      case 'DISCOUNT_PROMO':
        label = 'Promotional Discount';
        type = 'discount';
        amount = 2000.0;
        break;
      default:
        label = 'Custom Line Item';
        type = 'charge';
        amount = 0.0;
    }

    final item = breakdownItems[idx];
    item.key = key;
    item.label = label;
    item.type = type;
    item.amount = amount;
    breakdownItems.refresh();
  }

  void shareQrCode() {
    final trackingUrl = trackingGatewayUrl;
    final landing = qrRedirectUrlController.text.trim();
    final text = 'Transit Campaign QR: ${qrCodeId.value}\nTracking Gateway: $trackingUrl${landing.isNotEmpty ? "\nLanding Target: $landing" : ""}';
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
      Get.snackbar('Required', 'Please enter a Campaign Name',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (brandNameController.text.trim().isEmpty) {
      Get.snackbar('Required', 'Please enter Brand / Company Name',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (clientNameController.text.trim().isEmpty) {
      Get.snackbar('Required', 'Please enter Customer / Client Contact Name',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (clientPhoneController.text.trim().isEmpty) {
      Get.snackbar('Required', 'Please enter Customer Mobile Number (required for SMS payment link)',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (clientEmailController.text.trim().isEmpty) {
      Get.snackbar('Required', 'Please enter Customer Email Address (required for invoice & link)',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep2() {
    // If URL tab is active and user typed a URL but forgot to click Add
    if (selectedCreativeType.value == 'URL' && videoUrlController.text.trim().isNotEmpty) {
      addVideoUrlToCreatives();
    }
    if (creativeItems.isEmpty) {
      Get.snackbar('Required', 'Please attach at least one creative file (Image, Video) or enter a Video URL',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep3() {
    if (selectedTargets.isEmpty) {
      Get.snackbar('Required', 'Please select at least one transit route for your campaign',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (totalSelectedScreens <= 0) {
      Get.snackbar('Required', 'Selected routes have 0 active screens. Please select at least one bus screen.',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep4() {
    if (endDate.value.isBefore(startDate.value)) {
      Get.snackbar('Required', 'End Date cannot be before Start Date',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (selectedDays.isEmpty) {
      Get.snackbar('Required', 'Please select at least one active broadcast day of the week',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    if (dailySlotStart.value.compareTo(dailySlotEnd.value) >= 0) {
      Get.snackbar('Required', 'Daily Broadcast End Time must be later than Start Time',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
    return true;
  }

  bool validateStep5() {
    if (finalTotalAmount <= 0) {
      Get.snackbar('Required', 'Please enter a valid Campaign Budget (greater than ₹0)',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return false;
    }
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
  // STEP 6: FINAL SUBMIT & API PAYLOAD CREATION
  // ==========================================================
  Future<void> submitCampaign() async {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      // 1. Upload local files if any
      final List<Map<String, dynamic>> uploadedMedia = [];
      for (int i = 0; i < creativeItems.length; i++) {
        final item = creativeItems[i];
        if (item.localPath != null && item.localPath!.isNotEmpty) {
          final res = await _service.uploadCreativeFile(item.localPath!);
          final fileUrl = res.data?['url'] ?? res.data?['file_url'] ?? item.localPath;
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
      final mediaType = primaryMedia?['media_type']?.toString() ?? 'video';

      // 2. Build target payload
      final targetsPayload = selectedTargets.map((t) => t.toJson()).toList();

      // 3. Build payment breakdown payload
      final breakdownPayload = {
        'baseAmount': baseAmountNum,
        'charges': totalCharges,
        'taxes': totalTaxes,
        'discounts': totalDiscounts,
        'finalTotal': finalTotalAmount,
        'items': breakdownItems.map((it) => it.toJson()).toList(),
      };

      // 4. Build slots payload for route collision prevention
      final slotsPayload = selectedTargets.map((t) {
        return {
          'routeId': t.routeId,
          'startDate': startDate.value.toIso8601String().split('T')[0],
          'endDate': endDate.value.toIso8601String().split('T')[0],
          'startTime': dailySlotStart.value,
          'endTime': dailySlotEnd.value,
          'activeDays': selectedDays.toList(),
          if (t.screenIds.isNotEmpty) 'screenIds': t.screenIds,
          if (t.vehicleIds.isNotEmpty) 'vehicleIds': t.vehicleIds,
        };
      }).toList();

      final payload = {
        'title': nameController.text.trim(),
        'brand_name': brandNameController.text.trim(),
        'campaign_type': selectedCampaignType.value,
        'owner_type': 'advertiser',
        'type': 'commercial_ad',
        'description': descriptionController.text.trim(),
        'objective': selectedObjective.value,
        'category': selectedCategory.value,
        'client_name': clientNameController.text.trim(),
        'client_company': clientCompanyController.text.trim(),
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
        'start_date': startDate.value.toIso8601String().split('T')[0],
        'end_date': endDate.value.toIso8601String().split('T')[0],
        'duration_days': durationDaysNumber,
        'budget': finalTotalAmount,
        'budget_type': budgetType.value,
        'payment_breakdown': breakdownPayload,
        'qr_code': qrCodeId.value,
        'qr_redirect_url': qrRedirectUrlController.text.trim(),
        'media_url': ?mediaUrl,
        'media_type': mediaType,
        'media': uploadedMedia,
        'frequency': repeatFrequency.value,
        'active_days': selectedDays.toList(),
        'broadcast_start_time': dailySlotStart.value,
        'broadcast_end_time': dailySlotEnd.value,
        'targets': targetsPayload,
        'slots': slotsPayload,
      };

      if (isEditMode.value && editingCampaignId.value.isNotEmpty) {
        final res = await _service.updateCampaign(editingCampaignId.value, payload);
        if (res.success) {
          createdCampaign.value = res.data;
          isSubmitted.value = true;
          await StorageService.to.clearCampaignDraft();
          hasSavedDraft.value = false;
          draftSavedAt.value = '';
          draftInfo.value = null;
          Get.snackbar('Success', 'Campaign updated successfully',
              backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        } else {
          Get.snackbar('Update Failed', res.message ?? 'Failed to update campaign',
              backgroundColor: const Color(0xFFEF4444), colorText: Colors.white, duration: const Duration(seconds: 4));
        }

      } else {
        final res = await _service.createCampaign(payload);
        if (res.success) {
          createdCampaign.value = res.data;
          isSubmitted.value = true;
          await StorageService.to.clearCampaignDraft();
          hasSavedDraft.value = false;
          draftSavedAt.value = '';
          draftInfo.value = null;
        } else {
          Get.snackbar('Submission Failed', res.message ?? 'Failed to create campaign',
              backgroundColor: const Color(0xFFEF4444), colorText: Colors.white, duration: const Duration(seconds: 4));
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'Unexpected error: $e',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    } finally {
      isSubmitting.value = false;
    }
  }

  // ==========================================================
  // DRAFT PERSISTENCE (SAVE / RESTORE / DISCARD)
  // ==========================================================
  void checkSavedDraft() {
    if (isEditMode.value) return;
    try {
      final draft = StorageService.to.getCampaignDraft();
      if (draft != null) {
        hasSavedDraft.value = true;
        final savedAtRaw = draft['savedAt'] as String?;
        String formattedTime = draft['savedTimeFormatted'] as String? ?? '';
        if (formattedTime.isEmpty && savedAtRaw != null) {
          try {
            final dt = DateTime.parse(savedAtRaw);
            formattedTime = DateFormat('hh:mm a').format(dt);
          } catch (_) {}
        }
        draftSavedAt.value = formattedTime;
        draftInfo.value = {
          'name': (draft['name'] != null && draft['name'].toString().trim().isNotEmpty)
              ? draft['name'].toString().trim()
              : 'step_campaign_info'.tr,
          'savedTime': formattedTime,
          'step': draft['savedStep'] ?? 1,
        };
      } else {
        hasSavedDraft.value = false;
        draftSavedAt.value = '';
        draftInfo.value = null;
      }
    } catch (_) {
      hasSavedDraft.value = false;
    }
  }

  Future<void> saveDraft() async {
    if (isSubmitting.value) return;
    try {
      final now = DateTime.now();
      final timeStr = DateFormat('hh:mm a').format(now);

      final draftPayload = <String, dynamic>{
        // Step 1: Info & Client Details
        'name': nameController.text.trim(),
        'brandName': brandNameController.text.trim(),
        'description': descriptionController.text.trim(),
        'selectedCampaignType': selectedCampaignType.value,
        'selectedObjective': selectedObjective.value,
        'selectedCategory': selectedCategory.value,
        'clientName': clientNameController.text.trim(),
        'clientCompany': clientCompanyController.text.trim(),
        'clientPhone': clientPhoneController.text.trim(),
        'clientEmail': clientEmailController.text.trim(),
        'clientSearch': clientSearchController.text.trim(),
        'clientAddress': clientAddressController.text.trim(),
        'clientCity': clientCityController.text.trim(),
        'clientState': clientStateController.text.trim(),
        'clientPincode': clientPincodeController.text.trim(),
        'clientCountry': clientCountry.value,
        'clientLatitude': clientLatitude.value,
        'clientLongitude': clientLongitude.value,
        'clientPlaceId': clientPlaceId.value,

        // Step 2: Creative Assets
        'selectedCreativeType': selectedCreativeType.value,
        'videoUrl': videoUrlController.text.trim(),
        'creativeItems': creativeItems.map((c) => {
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

        // Step 3: Transit Inventory
        'selectedTargets': selectedTargets.map((t) => {
          'fleetId': t.fleetId,
          'fleetName': t.fleetName,
          'organizationId': t.organizationId,
          'routeId': t.routeId,
          'routeName': t.routeName,
          'routeCode': t.routeCode,
          'city': t.city,
          'vehicleIds': t.vehicleIds,
          'screenIds': t.screenIds,
          'vehicleCount': t.vehicleCount,
          'totalScreens': t.totalScreens,
          'screensPerVehicle': t.screensPerVehicle,
        }).toList(),

        // Step 4: Schedule
        'selectedDurationPreset': selectedDurationPreset.value,
        'startDate': startDate.value.toIso8601String(),
        'startTimeHour': startTime.value.hour,
        'startTimeMinute': startTime.value.minute,
        'endDate': endDate.value.toIso8601String(),
        'endTimeHour': endTime.value.hour,
        'endTimeMinute': endTime.value.minute,
        'repeatFrequency': repeatFrequency.value,
        'selectedDays': selectedDays.toList(),
        'dailySlotStart': dailySlotStart.value,
        'dailySlotEnd': dailySlotEnd.value,
        'selectedTimeSlotPreset': selectedTimeSlotPreset.value,
        'timezone': timezone.value,

        // Step 5: Budget & QR Code
        'budgetType': budgetType.value,
        'baseAirtimeAmount': baseAmountController.text.trim(),
        'breakdownItems': breakdownItems.map((b) => {
          'id': b.id,
          'key': b.key,
          'label': b.label,
          'type': b.type,
          'amount': b.amount,
        }).toList(),
        'qrCodeId': qrCodeId.value,
        'qrRedirectUrl': qrRedirectUrlController.text.trim(),

        // Meta
        'savedStep': currentStep.value,
        'savedAt': now.toIso8601String(),
        'savedTimeFormatted': timeStr,
      };

      await StorageService.to.saveCampaignDraft(draftPayload);

      hasSavedDraft.value = true;
      draftSavedAt.value = timeStr;
      final campaignTitle = nameController.text.trim().isNotEmpty
          ? nameController.text.trim()
          : 'step_campaign_info'.tr;
      draftInfo.value = {
        'name': campaignTitle,
        'savedTime': timeStr,
        'step': currentStep.value,
      };

      Get.snackbar(
        'saved_badge'.tr,
        'draft_saved_success'.trParams({
          'name': campaignTitle,
          'step': currentStep.value.toString(),
          'total': totalSteps.toString(),
        }),
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 3),
      );
    } catch (e) {
      Get.snackbar(
        'alert_title'.tr,
        'failed_to_save_draft'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    }
  }

  void restoreDraft() {
    if (isSubmitting.value) return;
    try {
      final draft = StorageService.to.getCampaignDraft();
      if (draft == null) {
        Get.snackbar(
          'alert_title'.tr,
          'no_saved_draft_found'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
        return;
      }

      // Step 1: Info & Client Details
      if (draft['name'] != null) nameController.text = draft['name'].toString();
      if (draft['brandName'] != null) brandNameController.text = draft['brandName'].toString();
      if (draft['description'] != null) descriptionController.text = draft['description'].toString();
      if (draft['selectedCampaignType'] != null && campaignTypes.contains(draft['selectedCampaignType'])) {
        selectedCampaignType.value = draft['selectedCampaignType'].toString();
      }
      if (draft['selectedObjective'] != null && objectives.contains(draft['selectedObjective'])) {
        selectedObjective.value = draft['selectedObjective'].toString();
      }
      if (draft['selectedCategory'] != null && categories.contains(draft['selectedCategory'])) {
        selectedCategory.value = draft['selectedCategory'].toString();
      }
      if (draft['clientName'] != null) clientNameController.text = draft['clientName'].toString();
      if (draft['clientCompany'] != null) clientCompanyController.text = draft['clientCompany'].toString();
      if (draft['clientPhone'] != null) clientPhoneController.text = draft['clientPhone'].toString();
      if (draft['clientEmail'] != null) clientEmailController.text = draft['clientEmail'].toString();
      if (draft['clientSearch'] != null) clientSearchController.text = draft['clientSearch'].toString();
      if (draft['clientAddress'] != null) clientAddressController.text = draft['clientAddress'].toString();
      if (draft['clientCity'] != null) clientCityController.text = draft['clientCity'].toString();
      if (draft['clientState'] != null) clientStateController.text = draft['clientState'].toString();
      if (draft['clientPincode'] != null) clientPincodeController.text = draft['clientPincode'].toString();
      if (draft['clientCountry'] != null) clientCountry.value = draft['clientCountry'].toString();
      if (draft['clientLatitude'] != null) clientLatitude.value = (draft['clientLatitude'] as num).toDouble();
      if (draft['clientLongitude'] != null) clientLongitude.value = (draft['clientLongitude'] as num).toDouble();
      if (draft['clientPlaceId'] != null) clientPlaceId.value = draft['clientPlaceId'].toString();

      // Step 2: Creative Assets
      if (draft['selectedCreativeType'] != null) {
        selectedCreativeType.value = draft['selectedCreativeType'].toString();
      }
      if (draft['videoUrl'] != null) {
        videoUrlController.text = draft['videoUrl'].toString();
        _handleVideoUrlChanged(videoUrlController.text.trim());
      }
      if (draft['creativeItems'] is List) {
        creativeItems.clear();
        for (final c in draft['creativeItems'] as List) {
          if (c is Map) {
            creativeItems.add(
              CreativeItemModel(
                id: c['id']?.toString() ?? 'restored_${DateTime.now().millisecondsSinceEpoch}',
                name: c['name']?.toString() ?? 'Media',
                type: c['type']?.toString() ?? 'Video',
                size: c['size']?.toString() ?? '0 MB',
                resolution: c['resolution']?.toString() ?? '1920x1080',
                durationSec: (c['durationSec'] as num?)?.toInt() ?? 15,
                localPath: c['localPath']?.toString(),
                videoUrl: c['videoUrl']?.toString(),
                previewUrl: c['previewUrl']?.toString(),
              ),
            );
          }
        }
      }

      // Step 3: Transit Inventory
      if (draft['selectedTargets'] is List) {
        selectedTargets.clear();
        for (final t in draft['selectedTargets'] as List) {
          if (t is Map) {
            selectedTargets.add(
              SelectedTargetModel(
                fleetId: (t['fleetId'] as num?)?.toInt() ?? (t['fleet_id'] as num?)?.toInt() ?? 0,
                fleetName: t['fleetName']?.toString() ?? t['fleet_name']?.toString() ?? '',
                organizationId: (t['organizationId'] as num?)?.toInt(),
                routeId: (t['routeId'] as num?)?.toInt() ?? (t['route_id'] as num?)?.toInt() ?? 0,
                routeName: t['routeName']?.toString() ?? t['route_name']?.toString() ?? '',
                routeCode: t['routeCode']?.toString() ?? t['route_code']?.toString() ?? '',
                city: t['city']?.toString() ?? 'Transit Network',
                vehicleIds: (t['vehicleIds'] as List?)?.map((e) => (e as num).toInt()).toList() ??
                    (t['vehicle_ids'] as List?)?.map((e) => (e as num).toInt()).toList() ?? [],
                screenIds: (t['screenIds'] as List?)?.map((e) => (e as num).toInt()).toList() ??
                    (t['screen_ids'] as List?)?.map((e) => (e as num).toInt()).toList() ?? [],
                vehicleCount: (t['vehicleCount'] as num?)?.toInt() ?? (t['vehicles_count'] as num?)?.toInt() ?? 0,
                totalScreens: (t['totalScreens'] as num?)?.toInt() ?? (t['screens_count'] as num?)?.toInt() ?? 0,
                screensPerVehicle: (t['screensPerVehicle'] as num?)?.toInt() ?? (t['screens_per_vehicle'] as num?)?.toInt() ?? 1,
              ),
            );
          }
        }
      }

      // Step 4: Schedule
      if (draft['selectedDurationPreset'] != null) {
        selectedDurationPreset.value = (draft['selectedDurationPreset'] as num).toInt();
      }
      if (draft['startDate'] != null) {
        try {
          startDate.value = DateTime.parse(draft['startDate'].toString());
        } catch (_) {}
      }
      if (draft['endDate'] != null) {
        try {
          endDate.value = DateTime.parse(draft['endDate'].toString());
        } catch (_) {}
      }
      if (draft['startTimeHour'] != null && draft['startTimeMinute'] != null) {
        startTime.value = TimeOfDay(
          hour: (draft['startTimeHour'] as num).toInt(),
          minute: (draft['startTimeMinute'] as num).toInt(),
        );
      }
      if (draft['endTimeHour'] != null && draft['endTimeMinute'] != null) {
        endTime.value = TimeOfDay(
          hour: (draft['endTimeHour'] as num).toInt(),
          minute: (draft['endTimeMinute'] as num).toInt(),
        );
      }
      if (draft['repeatFrequency'] != null) {
        repeatFrequency.value = draft['repeatFrequency'].toString();
      }
      if (draft['selectedDays'] is List) {
        selectedDays.assignAll((draft['selectedDays'] as List).map((e) => e.toString()));
      }
      if (draft['dailySlotStart'] != null) {
        dailySlotStart.value = draft['dailySlotStart'].toString();
      }
      if (draft['dailySlotEnd'] != null) {
        dailySlotEnd.value = draft['dailySlotEnd'].toString();
      }
      if (draft['selectedTimeSlotPreset'] != null) {
        selectedTimeSlotPreset.value = draft['selectedTimeSlotPreset'].toString();
      }
      if (draft['timezone'] != null) {
        timezone.value = draft['timezone'].toString();
      }

      // Step 5: Budget & QR Code
      if (draft['budgetType'] != null) {
        budgetType.value = draft['budgetType'].toString();
      }
      if (draft['baseAirtimeAmount'] != null) {
        baseAmountController.text = draft['baseAirtimeAmount'].toString();
      }
      if (draft['breakdownItems'] is List) {
        breakdownItems.clear();
        for (final b in draft['breakdownItems'] as List) {
          if (b is Map) {
            breakdownItems.add(
              BreakdownItemModel(
                id: b['id']?.toString() ?? 'item_${DateTime.now().millisecondsSinceEpoch}',
                key: b['key']?.toString() ?? 'CUSTOM',
                label: b['label']?.toString() ?? b['description']?.toString() ?? '',
                type: b['type']?.toString() ?? 'charge',
                amount: (b['amount'] as num?)?.toDouble() ?? 0.0,
              ),
            );
          }
        }
      }
      if (draft['qrCodeId'] != null && draft['qrCodeId'].toString().isNotEmpty) {
        qrCodeId.value = draft['qrCodeId'].toString();
      }
      if (draft['qrRedirectUrl'] != null) {
        qrRedirectUrlController.text = draft['qrRedirectUrl'].toString();
      }

      // Jump to saved step
      final savedStep = (draft['savedStep'] as num?)?.toInt() ?? 1;
      if (savedStep >= 1 && savedStep <= totalSteps) {
        currentStep.value = savedStep;
      }

      final campaignTitle = nameController.text.trim().isNotEmpty
          ? nameController.text.trim()
          : 'step_campaign_info'.tr;

      Get.snackbar(
        'restore_draft_btn'.tr,
        'draft_restored_success'.trParams({
          'name': campaignTitle,
          'step': currentStep.value.toString(),
        }),
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 3),
      );
    } catch (e) {
      Get.snackbar(
        'alert_title'.tr,
        'failed_to_restore_draft'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    }
  }

  Future<void> discardDraft() async {
    if (isSubmitting.value) return;
    try {
      await StorageService.to.clearCampaignDraft();
      hasSavedDraft.value = false;
      draftSavedAt.value = '';
      draftInfo.value = null;

      Get.snackbar(
        'discard_btn'.tr,
        'saved_draft_discarded'.tr,
        backgroundColor: const Color(0xFF6B7280),
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 2),
      );
    } catch (_) {
      Get.snackbar(
        'alert_title'.tr,
        'failed_to_save_draft'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    }
  }

  void resetForm() {
    currentStep.value = 1;
    isSubmitted.value = false;
    createdCampaign.value = null;
    nameController.clear();
    brandNameController.clear();
    descriptionController.clear();
    clientNameController.clear();
    clientCompanyController.clear();
    clientPhoneController.clear();
    clientEmailController.clear();
    clientSearchController.clear();
    clientAddressController.clear();
    clientCityController.clear();
    clientStateController.clear();
    clientPincodeController.clear();
    clientLatitude.value = null;
    clientLongitude.value = null;
    creativeItems.clear();
    videoUrlController.clear();
    selectedTargets.clear();
    baseAmountController.text = '0';
    breakdownItems.clear();
    generateQrCode();
    checkSavedDraft();
  }
}
