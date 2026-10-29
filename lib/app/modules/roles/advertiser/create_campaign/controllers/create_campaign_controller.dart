import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';

class CreateCampaignController extends GetxController {
  // Stepper State: 6 Steps matching Admin Panel
  final currentStep = 1.obs; // Step 1 to 6
  final int totalSteps = 6;
  final List<String> stepLabels = [
    'Information',
    'Creative',
    'Routes & Screens',
    'Schedule',
    'Budget & QR',
    'Review & Submit',
  ];

  final RxBool isSubmitting = false.obs;
  final RxBool isSubmitted = false.obs;
  final Rxn<CampaignModel> createdCampaign = Rxn<CampaignModel>();

  // Edit Mode state
  final RxBool isEditMode = false.obs;
  final RxString editingCampaignId = ''.obs;

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
  final RxString selectedTimeSlotPreset = 'Full Day'.obs;
  final RxString timezone = 'GMT +05:30 India Standard Time'.obs;
  final RxBool slotConflict = false.obs;
  final RxString slotConflictMessage = ''.obs;

  int get durationDaysNumber {
    final diff = endDate.value.difference(startDate.value).inDays + 1;
    return diff > 0 ? diff : 1;
  }

  int get activeBroadcastDaysCount => selectedDays.length;

  // ==========================================================
  // STEP 5: BUDGET & DYNAMIC PAYMENT BREAKDOWN + QR IDENTITY
  // ==========================================================
  final RxString budgetType = 'Total Budget'.obs;
  final baseAmountController = TextEditingController(text: '0');
  final RxList<BreakdownItemModel> breakdownItems = <BreakdownItemModel>[].obs;
  final RxString qrCodeId = ''.obs;
  final qrRedirectUrlController = TextEditingController();
  final RxString selectedQrPlacement = 'Rear Screen'.obs;
  final promoCodeController = TextEditingController();
  final RxBool promoApplied = false.obs;

  final List<String> qrPlacements = [
    'Rear Screen',
    'Bottom-Right Overlay',
    'Bottom-Left Overlay',
    'Corner Badge',
  ];

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
  }

  void initForEdit(CampaignModel c) {
    isEditMode.value = true;
    editingCampaignId.value = c.id;

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
    promoCodeController.dispose();
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
      if (res.isSuccess && res.data != null && res.data!.isNotEmpty) {
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
  }

  void selectAllRoutes() {
    for (final route in filteredTransitRoutes) {
      if (!isRouteSelected(route.id)) {
        toggleRoute(route);
      }
    }
  }

  void clearAllRoutes() {
    selectedTargets.clear();
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
    if (preset == 'Full Day') {
      dailySlotStart.value = '06:00';
      dailySlotEnd.value = '23:00';
    } else if (preset == 'Morning Rush') {
      dailySlotStart.value = '07:00';
      dailySlotEnd.value = '12:00';
    } else if (preset == 'Evening Prime') {
      dailySlotStart.value = '17:00';
      dailySlotEnd.value = '22:00';
    }
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

  void applyPromoCode() {
    final code = promoCodeController.text.trim().toUpperCase();
    if (code.isEmpty) return;
    if (code == 'VMX50' || code == 'FIRSTFREE' || code == 'FESTIVE') {
      promoApplied.value = true;
      Get.snackbar('Promo Applied', '$code applied successfully!',
          backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
    } else {
      Get.snackbar('Invalid Promo', 'Code $code is invalid or expired',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
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
        'placement': selectedQrPlacement.value,
        'timezone': timezone.value,
        'start_date': startDate.value.toIso8601String().split('T')[0],
        'end_date': endDate.value.toIso8601String().split('T')[0],
        'duration_days': durationDaysNumber,
        'budget': finalTotalAmount,
        'budget_type': budgetType.value,
        'payment_breakdown': breakdownPayload,
        'qr_code': qrCodeId.value,
        'qr_redirect_url': qrRedirectUrlController.text.trim(),
        if (promoApplied.value) 'promo_code': promoCodeController.text.trim(),
        if (mediaUrl != null) 'media_url': mediaUrl,
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
        if (res.isSuccess) {
          createdCampaign.value = res.data;
          isSubmitted.value = true;
          Get.snackbar('Success', 'Campaign updated successfully',
              backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        } else {
          Get.snackbar('Update Failed', res.message ?? 'Failed to update campaign',
              backgroundColor: const Color(0xFFEF4444), colorText: Colors.white, duration: const Duration(seconds: 4));
        }
      } else {
        final res = await _service.createCampaign(payload);
        if (res.isSuccess) {
          createdCampaign.value = res.data;
          isSubmitted.value = true;
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

  void saveDraft() {
    Get.snackbar(
      'Draft Saved',
      'Campaign "${nameController.text.trim().isNotEmpty ? nameController.text.trim() : 'New Campaign'}" draft saved.',
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
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
    promoCodeController.clear();
    promoApplied.value = false;
    generateQrCode();
  }
}
