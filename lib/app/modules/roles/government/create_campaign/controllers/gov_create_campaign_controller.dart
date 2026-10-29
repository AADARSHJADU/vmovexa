import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/government_service.dart';
import '../../dashboard/controllers/government_dashboard_controller.dart';

class GovCreateCampaignController extends GetxController {
  final GovernmentService _govService = GovernmentService.to;
  final ImagePicker _picker = ImagePicker();

  final currentStep = 1.obs; // Step 1 to 5
  final RxBool isSubmitted = false.obs; // True when campaign is successfully submitted
  final RxBool isSubmitting = false.obs;
  final RxBool isUploadingMedia = false.obs;

  // Step 1: Info & Type
  final campaignNameController = TextEditingController();
  final descriptionController = TextEditingController();
  final RxString selectedCampaignType = 'Public Information'.obs; // 'Public Information', 'Emergency Announcement'

  // Content Selection
  final RxString selectedContentType = 'Image'.obs; // Image, Video, PDF, YouTube URL
  final RxString uploadedFileName = ''.obs;
  final RxString uploadedFileSize = ''.obs;
  final RxString uploadedFileResolution = ''.obs;
  final RxString uploadedFilePath = ''.obs;
  final RxString uploadedMediaServerUrl = ''.obs;
  final youtubeUrlController = TextEditingController();

  // Step 2: Content Settings
  final RxBool selectAllDisplays = true.obs;
  final RxBool selectPassengerDisplays = false.obs;
  final RxBool selectInternalDisplays = false.obs;
  final RxInt contentDuration = 30.obs; // Seconds

  // Step 3: Targeting (Dynamic from Live Telemetry & API)
  final RxBool isLoadingTargeting = false.obs;
  final RxList<TrackingRouteModel> availableRoutes = <TrackingRouteModel>[].obs;
  final RxList<LiveTrackingVehicle> liveVehicles = <LiveTrackingVehicle>[].obs;
  final RxList<String> selectedRouteIds = <String>[].obs;
  final RxString selectedCityFilter = 'All'.obs;
  final RxList<String> availableCities = <String>['All', 'Bhopal', 'Indore'].obs;
  final RxString targetAudienceMode = 'All Vehicles'.obs; // 'All Vehicles', 'Selected Vehicles', 'Display Groups'
  final RxString displayTargetMode = 'All Displays'.obs; // 'All Displays', 'Passenger Displays', 'External Displays'
  final RxString selectedVehicleType = 'All Types'.obs; // 'All Types', 'AC Bus', 'Standard Bus', 'Electric Bus', 'Mini Bus'
  final RxString selectedTimeZone = 'IST (UTC+05:30)'.obs;
  final RxString selectedScreenCategory = 'All Screens'.obs;
  final RxInt mapZoom = 12.obs;
  final RxDouble mapCenterLat = 23.2599.obs;
  final RxDouble mapCenterLng = 77.4126.obs;

  // Step 4: Schedule
  final RxString startDate = '20 May 2026'.obs;
  final RxString endDate = '10 Jun 2026'.obs;
  final RxString startTime = '10:00 AM'.obs;
  final RxString endTime = '10:00 PM'.obs;
  final RxList<String> activeDays = <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].obs;
  final RxString selectedPriority = 'Normal'.obs; // 'Low', 'Normal', 'High'
  final RxBool repeatCampaign = true.obs;
  final RxString repeatFrequency = 'Daily'.obs; // 'Daily', 'Weekly', 'Monthly'

  @override
  void onInit() {
    super.onInit();
    _initDefaults();
    loadTargetingData();

    youtubeUrlController.addListener(() {
      if (selectedContentType.value == 'YouTube URL') {
        uploadedFileName.value = youtubeUrlController.text.trim().isNotEmpty
            ? youtubeUrlController.text.trim()
            : 'https://youtube.com/watch?v=traffic_safety';
      }
    });

    // Support pre-initializing as Emergency Announcement if routed from shortcut
    final args = Get.arguments;
    if (args != null && args is Map && args['type'] == 'Emergency') {
      selectedCampaignType.value = 'Emergency Announcement';
      uploadedFileName.value = 'emergency_heavy_rainfall_alert.jpg';
      selectedPriority.value = 'High';
    }
  }

  void _initDefaults() {
    // Set realistic defaults for dates starting from today
    final now = DateTime.now();
    final end = now.add(const Duration(days: 30));
    startDate.value = _formatDateDisplay(now);
    endDate.value = _formatDateDisplay(end);
  }

  String _formatDateDisplay(DateTime dt) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
  }

  // ==========================================
  // DYNAMIC TARGETING & ROUTES LOADING
  // ==========================================
  Future<void> loadTargetingData() async {
    isLoadingTargeting.value = true;
    try {
      final res = await _govService.getLiveTracking();
      if (res.isSuccess && res.data != null) {
        liveVehicles.value = res.data!.vehicles;

        // Set map center from first live vehicle with coords if available
        final vWithCoords = liveVehicles.firstWhereOrNull((v) => v.lat != null && v.lng != null);
        if (vWithCoords != null) {
          mapCenterLat.value = vWithCoords.lat!;
          mapCenterLng.value = vWithCoords.lng!;
        }
      }

      final routesRes = await _govService.getTrackingRoutes();
      if (routesRes.isSuccess && routesRes.data != null && routesRes.data!.isNotEmpty) {
        availableRoutes.value = routesRes.data!;
      } else {
        _populateDefaultRoutes();
      }

      // Select all routes by default
      selectedRouteIds.value = availableRoutes.map((r) => r.id).toList();
    } catch (_) {
      _populateDefaultRoutes();
    } finally {
      isLoadingTargeting.value = false;
    }
  }

  void _populateDefaultRoutes() {
    availableRoutes.value = [
      TrackingRouteModel(id: 'RT-101', name: 'BRTS Trunk Corridor 1', code: 'TR-1', city: 'Bhopal'),
      TrackingRouteModel(id: 'RT-102', name: 'Bhopal Station - Mandideep Link', code: 'TR-2', city: 'Bhopal'),
      TrackingRouteModel(id: 'RT-103', name: 'Kolar Road - New Market Express', code: 'TR-3', city: 'Bhopal'),
      TrackingRouteModel(id: 'RT-104', name: 'Indore BRTS A.B. Road Corridor', code: 'IN-1', city: 'Indore'),
      TrackingRouteModel(id: 'RT-105', name: 'Airport - Super Corridor Metro Feeder', code: 'IN-2', city: 'Indore'),
    ];
    selectedRouteIds.value = availableRoutes.map((r) => r.id).toList();
  }

  // ==========================================
  // NAVIGATION STEPPER
  // ==========================================
  Future<void> nextStep() async {
    if (currentStep.value == 1) {
      if (campaignNameController.text.trim().isEmpty) {
        Get.snackbar(
          'Title Required',
          'Please enter a campaign name to continue',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }
    }

    if (currentStep.value < 5) {
      currentStep.value++;
    } else {
      await submitCampaign();
    }
  }

  void previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    } else {
      Get.back();
    }
  }

  void setCampaignType(String type) {
    selectedCampaignType.value = type;
  }

  // ==========================================
  // CONTENT & MEDIA PICKER
  // ==========================================
  void setContentType(String type) {
    selectedContentType.value = type;
    if (type == 'YouTube URL') {
      if (youtubeUrlController.text.trim().isNotEmpty) {
        uploadedFileName.value = youtubeUrlController.text.trim();
      }
      uploadedFileSize.value = 'Web Stream';
      uploadedFileResolution.value = '1080p (YouTube)';
    }
  }

  Future<void> pickMediaFile() async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );

      if (file != null) {
        uploadedFileName.value = file.name;
        uploadedFilePath.value = file.path;
        final fileLength = await file.length();
        uploadedFileSize.value = '${(fileLength / (1024 * 1024)).toStringAsFixed(1)} MB';
        uploadedFileResolution.value = '1920 × 1080 (HD)';

        isUploadingMedia.value = true;
        final uploadRes = await _govService.uploadCampaignMedia(file.path);
        if (uploadRes.isSuccess && uploadRes.data != null && uploadRes.data!.isNotEmpty) {
          uploadedMediaServerUrl.value = uploadRes.data!['url']?.toString() ??
              uploadRes.data!['file_url']?.toString() ??
              file.path;
          Get.snackbar(
            'Media Ready',
            'Creative file processed and ready for broadcast',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        } else {
          uploadedMediaServerUrl.value = file.path;
        }
      }
    } catch (e) {
      Get.snackbar('Upload Error', 'Could not pick file: $e', snackPosition: SnackPosition.BOTTOM);
    } finally {
      isUploadingMedia.value = false;
    }
  }

  void clearUploadedMedia() {
    uploadedFilePath.value = '';
    uploadedMediaServerUrl.value = '';
    uploadedFileName.value = '';
    uploadedFileSize.value = '';
    uploadedFileResolution.value = '';
  }

  Future<void> pasteYouTubeUrlFromClipboard() async {
    final clipboardData = await Clipboard.getData(Clipboard.kTextPlain);
    if (clipboardData != null && clipboardData.text != null && clipboardData.text!.trim().isNotEmpty) {
      youtubeUrlController.text = clipboardData.text!.trim();
      uploadedFileName.value = youtubeUrlController.text;
      uploadedFileSize.value = 'Web Stream';
      uploadedFileResolution.value = '1080p (YouTube)';
    }
  }

  // ==========================================
  // DISPLAY & DURATION SETTINGS
  // ==========================================
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

  // ==========================================
  // TARGETING & MAP CONTROLS
  // ==========================================
  void toggleRoute(String routeId) {
    if (selectedRouteIds.contains(routeId)) {
      selectedRouteIds.remove(routeId);
    } else {
      selectedRouteIds.add(routeId);
    }
  }

  void selectAllRoutes() {
    selectedRouteIds.value = availableRoutes.map((r) => r.id).toList();
  }

  void clearAllRoutes() {
    selectedRouteIds.clear();
  }

  void setCityFilter(String city) {
    selectedCityFilter.value = city;
  }

  void setTargetAudienceMode(String mode) {
    targetAudienceMode.value = mode;
  }

  void setDisplayTargetMode(String mode) {
    displayTargetMode.value = mode;
  }

  void setVehicleType(String type) {
    selectedVehicleType.value = type;
  }

  void setTimeZone(String tz) {
    selectedTimeZone.value = tz;
  }

  void zoomInMap() {
    if (mapZoom.value < 18) mapZoom.value++;
  }

  void zoomOutMap() {
    if (mapZoom.value > 6) mapZoom.value--;
  }

  String getGoogleStaticMapPreview() {
    final markers = <GoogleMapMarker>[];
    for (final v in liveVehicles) {
      if (v.lat != null && v.lng != null) {
        markers.add(GoogleMapMarker(
          lat: v.lat!,
          lng: v.lng!,
          color: v.isActive ? 'green' : 'blue',
          label: v.busNumber.length > 2 ? v.busNumber.substring(v.busNumber.length - 2) : 'B',
        ));
      }
    }

    if (markers.isEmpty) {
      markers.add(GoogleMapMarker(
        lat: mapCenterLat.value,
        lng: mapCenterLng.value,
        color: 'red',
        label: 'T',
      ));
    }

    return ApiConstants.buildGoogleStaticMapUrl(
      centerLat: mapCenterLat.value,
      centerLng: mapCenterLng.value,
      zoom: mapZoom.value,
      width: 600,
      height: 320,
      mapType: 'roadmap',
      markers: markers.take(15).toList(),
    );
  }

  // ==========================================
  // SCHEDULE PICKERS
  // ==========================================
  Future<void> selectStartDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF3B82F6),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      startDate.value = _formatDateDisplay(picked);
    }
  }

  Future<void> selectEndDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 30)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
      builder: (ctx, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF3B82F6),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      endDate.value = _formatDateDisplay(picked);
    }
  }

  Future<void> selectStartTime(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 10, minute: 0),
      builder: (ctx, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF3B82F6),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final hour = picked.hourOfPeriod == 0 ? 12 : picked.hourOfPeriod;
      final minute = picked.minute.toString().padLeft(2, '0');
      final period = picked.period == DayPeriod.am ? 'AM' : 'PM';
      startTime.value = '$hour:$minute $period';
    }
  }

  Future<void> selectEndTime(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 22, minute: 0),
      builder: (ctx, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF3B82F6),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final hour = picked.hourOfPeriod == 0 ? 12 : picked.hourOfPeriod;
      final minute = picked.minute.toString().padLeft(2, '0');
      final period = picked.period == DayPeriod.am ? 'AM' : 'PM';
      endTime.value = '$hour:$minute $period';
    }
  }

  void toggleDayOfWeek(String day) {
    if (activeDays.contains(day)) {
      if (activeDays.length > 1) {
        activeDays.remove(day);
      }
    } else {
      activeDays.add(day);
    }
  }

  void setPriority(String priority) {
    selectedPriority.value = priority;
  }

  void setRepeatFrequency(String freq) {
    repeatFrequency.value = freq;
  }

  // ==========================================
  // PREVIEW, QR ACTIONS & SUBMIT
  // ==========================================
  String get dynamicQrUrl {
    final slug = campaignNameController.text.trim().isNotEmpty
        ? campaignNameController.text.trim().replaceAll(RegExp(r'\s+'), '-').toLowerCase()
        : 'public-awareness';
    return 'https://vmovexa.com/c/$slug';
  }

  void copyQrLink() {
    Clipboard.setData(ClipboardData(text: dynamicQrUrl));
    Get.snackbar(
      'Copied!',
      'Campaign redirect URL copied to clipboard',
      backgroundColor: const Color(0xFF3B82F6),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void downloadQr() {
    Get.snackbar(
      'QR Code Downloaded',
      'Campaign broadcast QR code saved to your gallery',
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void shareQr() {
    Get.snackbar(
      'Share Campaign',
      'Campaign URL: $dynamicQrUrl',
      backgroundColor: const Color(0xFF8B5CF6),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  int get effectiveVehiclesCount {
    if (targetAudienceMode.value == 'All Vehicles') {
      return liveVehicles.isNotEmpty ? liveVehicles.length : 248;
    }
    return selectedRouteIds.length * 12;
  }

  int get effectiveScreensCount {
    return effectiveVehiclesCount * 3;
  }

  Future<void> submitCampaign() async {
    if (isSubmitting.value) return;

    final name = campaignNameController.text.trim();
    if (name.isEmpty) {
      Get.snackbar('Required', 'Please enter a campaign title', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      currentStep.value = 1;
      return;
    }

    isSubmitting.value = true;
    try {
      final media = uploadedMediaServerUrl.value.isNotEmpty
          ? uploadedMediaServerUrl.value
          : (selectedContentType.value == 'YouTube URL'
              ? youtubeUrlController.text.trim()
              : (uploadedFilePath.value.isNotEmpty
                  ? uploadedFilePath.value
                  : 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600'));

      final sDate = _formatDateToIso(startDate.value);
      final eDate = _formatDateToIso(endDate.value);

      final payload = {
        'title': name,
        'name': name,
        'description': descriptionController.text.trim().isNotEmpty
            ? descriptionController.text.trim()
            : 'Government public transit announcement',
        'owner_type': 'government',
        'ownerType': 'government',
        'type': 'government_psa',
        'category': selectedCampaignType.value,
        'priority': selectedPriority.value.toLowerCase(),
        'content_type': selectedContentType.value.toLowerCase(),
        'media_url': media,
        'creative_url': media,
        'display_type': selectAllDisplays.value
            ? 'all'
            : (selectPassengerDisplays.value ? 'passenger' : 'internal'),
        'duration': contentDuration.value,
        'duration_per_play_sec': contentDuration.value,
        'screen_category': selectedScreenCategory.value,
        'start_date': sDate,
        'startDate': sDate,
        'end_date': eDate,
        'endDate': eDate,
        'start_time': startTime.value,
        'end_time': endTime.value,
        'status': 'pending_approval',
        'qr_redirect_url': dynamicQrUrl,
        'active_days': activeDays.toList(),
      };

      final res = await _govService.createCampaign(payload);
      if (res.isSuccess) {
        isSubmitted.value = true;
        Get.snackbar(
          'Published!',
          'Government campaign published across transit network',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );

        if (Get.isRegistered<GovernmentDashboardController>()) {
          Get.find<GovernmentDashboardController>().loadDashboardData();
        }
      } else {
        Get.snackbar(
          'Submission Error',
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'Could not create campaign',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar('Error', 'Submission failed: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    } finally {
      isSubmitting.value = false;
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
    youtubeUrlController.text = '';
    uploadedFilePath.value = '';
    uploadedMediaServerUrl.value = '';
    uploadedFileName.value = '';
    uploadedFileSize.value = '';
  }

  String _formatDateToIso(String dateStr) {
    try {
      final parts = dateStr.trim().split(' ');
      if (parts.length == 3) {
        final day = int.tryParse(parts[0]);
        final monthStr = parts[1].toLowerCase();
        final year = int.tryParse(parts[2]);
        const months = {
          'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
          'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        };
        int? month;
        for (final entry in months.entries) {
          if (monthStr.startsWith(entry.key)) {
            month = entry.value;
            break;
          }
        }
        if (day != null && month != null && year != null) {
          final d = day.toString().padLeft(2, '0');
          final m = month.toString().padLeft(2, '0');
          return '$year-$m-$d';
        }
      }
      return dateStr;
    } catch (_) {
      return dateStr;
    }
  }

  @override
  void onClose() {
    campaignNameController.dispose();
    descriptionController.dispose();
    youtubeUrlController.dispose();
    super.onClose();
  }
}
