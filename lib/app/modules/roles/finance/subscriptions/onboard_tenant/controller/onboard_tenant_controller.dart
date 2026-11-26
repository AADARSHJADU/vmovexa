import 'dart:async';
import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import '../../controller/subscriptions_controller.dart';
import '../../model/subscription_model.dart';

class SubscriptionPlanItem {
  final dynamic id;
  final String name;
  final double monthlyPrice;
  final int busesLimit;
  final int depotsLimit;

  SubscriptionPlanItem({
    required this.id,
    required this.name,
    required this.monthlyPrice,
    required this.busesLimit,
    required this.depotsLimit,
  });

  factory SubscriptionPlanItem.fromJson(Map<String, dynamic> json) {
    final features = json['features'] is Map ? json['features'] : {};
    return SubscriptionPlanItem(
      id: json['id'] ?? 1,
      name: (json['name'] ?? 'Standard Tier').toString(),
      monthlyPrice: double.tryParse(json['monthly_price']?.toString() ?? '') ?? 25000.0,
      busesLimit: int.tryParse(json['buses_limit']?.toString() ?? '') ?? 25,
      depotsLimit: int.tryParse(features['depots_limit']?.toString() ?? json['depots_limit']?.toString() ?? '') ?? 2,
    );
  }
}

class OnboardTenantController extends GetxController {
  // Stepper state (1 to 4)
  final RxInt currentStep = 1.obs;
  final RxBool isSubmitting = false.obs;
  final RxBool isEditMode = false.obs;
  String? editingTenantId;

  // ---------------- STEP 1: Company Info ----------------
  final nameCtrl = TextEditingController();
  final cityCtrl = TextEditingController(text: 'Mumbai');
  final officeAddressCtrl = TextEditingController();
  final pincodeCtrl = TextEditingController();
  final cinCtrl = TextEditingController();
  final gstinCtrl = TextEditingController();

  final RxString selectedState = 'Maharashtra'.obs;

  // Logo / Image Upload
  final Rxn<File> logoFile = Rxn<File>();
  final RxString logoPreviewUrl = ''.obs;
  final RxBool isUploadingLogo = false.obs;

  // Google Places Autocomplete for Office Address
  final RxList<GooglePlaceItemModel> placesPredictions = <GooglePlaceItemModel>[].obs;
  final RxBool isSearchingPlaces = false.obs;
  final RxBool showPlacesDropdown = false.obs;
  final Rxn<double> latitude = Rxn<double>();
  final Rxn<double> longitude = Rxn<double>();
  final RxString placeId = ''.obs;
  Timer? _placesDebounceTimer;

  static const List<String> indianStatesAndUts = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Puducherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];

  // ---------------- STEP 2: Admin Account ----------------
  final adminNameCtrl = TextEditingController();
  final adminEmailCtrl = TextEditingController();
  final adminPhoneCtrl = TextEditingController();
  final adminPasswordCtrl = TextEditingController();
  final RxBool showPassword = false.obs;

  // ---------------- STEP 3: Plan & Billing ----------------
  final RxList<SubscriptionPlanItem> plans = <SubscriptionPlanItem>[].obs;
  final RxBool loadingPlans = false.obs;
  final Rxn<SubscriptionPlanItem> selectedPlan = Rxn<SubscriptionPlanItem>();

  final RxString paymentMode = 'offline'.obs; // 'offline' | 'online'
  final bankNameCtrl = TextEditingController(text: 'State Bank of India');
  final bankRefCtrl = TextEditingController();
  final Rx<DateTime> paymentDate = Rx<DateTime>(DateTime.now());

  // ---------------- STEP 4: Review & Confirm ----------------
  final RxBool acceptContract = false.obs;
  final RxBool showReviewPassword = false.obs;

  // Success dialog data
  final Rxn<Map<String, dynamic>> successModalData = Rxn<Map<String, dynamic>>();

  @override
  void onInit() {
    super.onInit();
    generateRandomPassword();
    fetchPlans();
  }

  void initForEdit(dynamic sub, [Map<String, dynamic>? orgDetails]) {
    isEditMode.value = true;
    currentStep.value = 1;

    String cName = '';
    String cCity = '';
    String cState = 'Maharashtra';
    String cCin = '';
    String cGstin = '';
    String cLogo = '';
    String aName = '';
    String aEmail = '';
    String aPhone = '';
    String tId = '';
    String? pId;

    if (sub is Subscription) {
      tId = sub.id;
      cName = sub.companyName;
      cCity = sub.city;
      cState = sub.state.isNotEmpty ? sub.state : 'Maharashtra';
      cCin = sub.cin;
      cGstin = sub.gstin;
      cLogo = sub.logoUrl ?? '';
      aName = sub.adminName;
      aEmail = sub.adminEmail;
      aPhone = sub.adminPhone.replaceAll('+91', '').trim();
      pId = sub.planId;
    } else if (sub is Map) {
      tId = (sub['id'] ?? '').toString();
      cName = (sub['name'] ?? '').toString();
      cCity = (sub['city'] ?? '').toString();
      cState = (sub['state'] ?? 'Maharashtra').toString();
      cCin = (sub['cin'] ?? '').toString();
      cGstin = (sub['gstin'] ?? '').toString();
      cLogo = (sub['logo_url'] ?? sub['logoUrl'] ?? '').toString();
      pId = sub['plan_id']?.toString();
    }

    editingTenantId = tId;
    nameCtrl.text = cName;
    cityCtrl.text = cCity;
    selectedState.value = indianStatesAndUts.contains(cState) ? cState : 'Maharashtra';
    cinCtrl.text = cCin;
    gstinCtrl.text = cGstin;
    logoPreviewUrl.value = cLogo;
    adminNameCtrl.text = aName;
    adminEmailCtrl.text = aEmail;
    adminPhoneCtrl.text = aPhone;
    acceptContract.value = true;

    if (orgDetails != null && orgDetails.isNotEmpty) {
      if (orgDetails['office_address'] != null) {
        officeAddressCtrl.text = orgDetails['office_address'].toString();
      } else if (orgDetails['officeAddress'] != null) {
        officeAddressCtrl.text = orgDetails['officeAddress'].toString();
      }
      if (orgDetails['pincode'] != null) {
        pincodeCtrl.text = orgDetails['pincode'].toString();
      }
      if (orgDetails['latitude'] != null) {
        latitude.value = double.tryParse(orgDetails['latitude'].toString());
      }
      if (orgDetails['longitude'] != null) {
        longitude.value = double.tryParse(orgDetails['longitude'].toString());
      }
      if (pId == null && orgDetails['plan_id'] != null) {
        pId = orgDetails['plan_id'].toString();
      }
      final admin = orgDetails['primaryAdmin'] ??
          orgDetails['admin'] ??
          (orgDetails['users'] is List && (orgDetails['users'] as List).isNotEmpty ? orgDetails['users'][0] : null);
      if (admin is Map) {
        if (adminNameCtrl.text.isEmpty && admin['name'] != null) adminNameCtrl.text = admin['name'].toString();
        if (adminEmailCtrl.text.isEmpty && admin['email'] != null) adminEmailCtrl.text = admin['email'].toString();
        if (adminPhoneCtrl.text.isEmpty && admin['phone'] != null) {
          adminPhoneCtrl.text = admin['phone'].toString().replaceAll('+91', '').trim();
        }
      }
    }

    if (pId != null && plans.isNotEmpty) {
      final matched = plans.firstWhereOrNull((p) => p.id.toString() == pId);
      if (matched != null) selectedPlan.value = matched;
    }
  }

  @override
  void onClose() {
    _placesDebounceTimer?.cancel();
    nameCtrl.dispose();
    cityCtrl.dispose();
    officeAddressCtrl.dispose();
    pincodeCtrl.dispose();
    cinCtrl.dispose();
    gstinCtrl.dispose();
    adminNameCtrl.dispose();
    adminEmailCtrl.dispose();
    adminPhoneCtrl.dispose();
    adminPasswordCtrl.dispose();
    bankNameCtrl.dispose();
    bankRefCtrl.dispose();
    super.onClose();
  }

  // ---------------- Logo / Image Upload Methods ----------------
  Future<void> pickLogo(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );
      if (picked == null) return;

      final file = File(picked.path);
      final sizeInBytes = await file.length();
      if (sizeInBytes > 5 * 1024 * 1024) {
        _showError('image_size_exceeds'.tr);
        return;
      }

      logoFile.value = file;
      logoPreviewUrl.value = picked.path;
      Get.snackbar(
        'success'.tr,
        'image_selected_ready'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      _showError('${'failed_to_pick_image'.tr}: $e');
    }
  }

  void removeLogo() {
    logoFile.value = null;
    logoPreviewUrl.value = '';
  }

  // ---------------- Google Places Autocomplete ----------------
  void onAddressSearchChanged(String text) {
    if (_placesDebounceTimer?.isActive ?? false) _placesDebounceTimer?.cancel();

    if (text.trim().length < 2) {
      placesPredictions.clear();
      showPlacesDropdown.value = false;
      return;
    }

    _placesDebounceTimer = Timer(const Duration(milliseconds: 350), () async {
      isSearchingPlaces.value = true;
      try {
        final res = await FleetService.to.searchGooglePlaces(text.trim());
        if (res.success && res.data != null) {
          placesPredictions.assignAll(res.data!);
          showPlacesDropdown.value = placesPredictions.isNotEmpty;
        } else {
          placesPredictions.clear();
          showPlacesDropdown.value = false;
        }
      } catch (_) {
        placesPredictions.clear();
        showPlacesDropdown.value = false;
      } finally {
        isSearchingPlaces.value = false;
      }
    });
  }

  void selectPlace(GooglePlaceItemModel place) {
    final name = place.name;
    final address = place.formattedAddress.isNotEmpty ? place.formattedAddress : name;

    officeAddressCtrl.text = address;

    if (place.city != null && place.city!.isNotEmpty) {
      cityCtrl.text = place.city!;
    }

    if (place.state != null && place.state!.isNotEmpty) {
      final stateQuery = place.state!.toLowerCase();
      final matched = indianStatesAndUts.firstWhereOrNull(
        (s) => s.toLowerCase() == stateQuery || stateQuery.contains(s.toLowerCase()),
      );
      if (matched != null) {
        selectedState.value = matched;
      }
    }

    if (place.pincode != null && place.pincode!.isNotEmpty) {
      final cleanPin = place.pincode!.replaceAll(RegExp(r'\D'), '');
      if (cleanPin.isNotEmpty) {
        pincodeCtrl.text = cleanPin.substring(0, min(6, cleanPin.length));
      }
    }

    if (place.latitude != null) latitude.value = place.latitude;
    if (place.longitude != null) longitude.value = place.longitude;
    placeId.value = place.placeId ?? place.id;

    showPlacesDropdown.value = false;
    placesPredictions.clear();
  }

  void clearAddress() {
    officeAddressCtrl.clear();
    latitude.value = null;
    longitude.value = null;
    placeId.value = '';
    showPlacesDropdown.value = false;
    placesPredictions.clear();
  }

  // ---------------- Plans Fetching ----------------
  Future<void> fetchPlans() async {
    loadingPlans.value = true;
    try {
      final res = await FinanceService.to.getBillingPlans();
      List<SubscriptionPlanItem> list = [];
      if (res.success && res.data != null) {
        dynamic raw = res.data;
        if (raw is Map && raw.containsKey('items')) {
          raw = raw['items'];
        } else if (raw is Map && raw.containsKey('rows')) {
          raw = raw['rows'];
        } else if (raw is Map && raw.containsKey('data')) {
          raw = raw['data'];
        }

        if (raw is List && raw.isNotEmpty) {
          list = raw.map((it) => SubscriptionPlanItem.fromJson(Map<String, dynamic>.from(it as Map))).toList();
        }
      }

      plans.assignAll(list);
      selectedPlan.value = list.isNotEmpty ? list.first : null;
    } catch (_) {
      plans.clear();
      selectedPlan.value = null;
    } finally {
      loadingPlans.value = false;
    }
  }

  void selectPlan(SubscriptionPlanItem p) {
    selectedPlan.value = p;
  }

  void generateRandomPassword() {
    final rand = Random();
    final num = 1000 + rand.nextInt(9000);
    const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    final randLetter = alpha[rand.nextInt(alpha.length)];
    final generated = 'Vmovexa#$num$randLetter';
    adminPasswordCtrl.text = generated;
  }

  // ---------------- Stepper Navigation & Validations ----------------
  void nextStep() {
    if (currentStep.value == 1) {
      if (nameCtrl.text.trim().isEmpty) {
        _showError('err_company_name_req'.tr);
        return;
      }
      if (cityCtrl.text.trim().isEmpty) {
        _showError('err_city_req'.tr);
        return;
      }
      if (pincodeCtrl.text.trim().isNotEmpty && pincodeCtrl.text.trim().length != 6) {
        _showError('err_pincode_invalid'.tr);
        return;
      }
      if (cinCtrl.text.trim().isNotEmpty && cinCtrl.text.trim().length != 21) {
        _showError('err_cin_invalid'.tr);
        return;
      }
      if (gstinCtrl.text.trim().isNotEmpty && gstinCtrl.text.trim().length != 15) {
        _showError('err_gstin_invalid'.tr);
        return;
      }
      currentStep.value = 2;
    } else if (currentStep.value == 2) {
      if (adminNameCtrl.text.trim().isEmpty) {
        _showError('err_admin_name_req'.tr);
        return;
      }
      final email = adminEmailCtrl.text.trim();
      if (email.isEmpty || !GetUtils.isEmail(email)) {
        _showError('err_admin_email_invalid'.tr);
        return;
      }
      final phone = adminPhoneCtrl.text.trim();
      if (phone.isEmpty || phone.length != 10) {
        _showError('err_admin_phone_invalid'.tr);
        return;
      }
      if (adminPasswordCtrl.text.isEmpty || adminPasswordCtrl.text.length < 8) {
        _showError('err_password_min'.tr);
        return;
      }
      currentStep.value = 3;
    } else if (currentStep.value == 3) {
      if (selectedPlan.value == null) {
        _showError('err_select_plan'.tr);
        return;
      }
      if (paymentMode.value == 'offline') {
        if (bankNameCtrl.text.trim().isEmpty) {
          _showError('err_bank_name_req'.tr);
          return;
        }
        if (bankRefCtrl.text.trim().isEmpty) {
          _showError('err_bank_ref_req'.tr);
          return;
        }
      }
      currentStep.value = 4;
    }
  }

  void prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  void goToStep(int step) {
    if (step >= 1 && step <= 4) {
      currentStep.value = step;
    }
  }

  void _showError(String msg) {
    Get.snackbar(
      'validation_error'.tr,
      msg,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.redAccent,
      colorText: Colors.white,
    );
  }

  // ---------------- Final Submission ----------------
  Future<void> submitTenant() async {
    if (!acceptContract.value) {
      _showError('err_accept_contract'.tr);
      return;
    }

    final plan = selectedPlan.value;
    final pDate = paymentDate.value;
    final formattedDate =
        '${pDate.year}-${pDate.month.toString().padLeft(2, '0')}-${pDate.day.toString().padLeft(2, '0')}';

    isSubmitting.value = true;
    try {
      String? finalLogoUrl;

      // 1. Upload logo if file is selected
      if (logoFile.value != null) {
        isUploadingLogo.value = true;
        try {
          final uploadRes = await HttpClientService.to.uploadFile(
            filePath: logoFile.value!.path,
            purpose: 'logos',
          );
          if (uploadRes.success && uploadRes.data != null) {
            finalLogoUrl = uploadRes.data!['url']?.toString() ??
                uploadRes.data!['file_url']?.toString() ??
                uploadRes.data!['logo_url']?.toString() ??
                uploadRes.data!['path']?.toString();
          }
        } catch (_) {} finally {
          isUploadingLogo.value = false;
        }
      }

      // 2. Build payload matching Admin Panel exactly
      final payload = <String, dynamic>{
        'name': nameCtrl.text.trim(),
        if (finalLogoUrl != null && finalLogoUrl.isNotEmpty) ...{
          'logoUrl': finalLogoUrl,
          'logo_url': finalLogoUrl,
        },
        'state': selectedState.value,
        'city': cityCtrl.text.trim(),
        if (cinCtrl.text.trim().isNotEmpty) 'cin': cinCtrl.text.trim().toUpperCase(),
        if (gstinCtrl.text.trim().isNotEmpty) 'gstin': gstinCtrl.text.trim().toUpperCase(),
        if (officeAddressCtrl.text.trim().isNotEmpty) ...{
          'officeAddress': officeAddressCtrl.text.trim(),
          'office_address': officeAddressCtrl.text.trim(),
        },
        if (pincodeCtrl.text.trim().isNotEmpty) 'pincode': pincodeCtrl.text.trim(),
        if (latitude.value != null) 'latitude': latitude.value,
        if (longitude.value != null) 'longitude': longitude.value,
        if (placeId.value.isNotEmpty) ...{
          'placeId': placeId.value,
          'place_id': placeId.value,
        },
        'adminName': adminNameCtrl.text.trim(),
        'adminEmail': adminEmailCtrl.text.trim(),
        'adminPhone': adminPhoneCtrl.text.trim(),
        'adminPassword': adminPasswordCtrl.text.trim(),
        'planId': plan?.id,
        'paymentMode': paymentMode.value,
        'busesCount': plan?.busesLimit ?? 25,
        'busesQuota': plan?.busesLimit ?? 25,
        'depotsCount': plan?.depotsLimit ?? 2,
        'depotsQuota': plan?.depotsLimit ?? 2,
        if (paymentMode.value == 'offline') ...{
          'bankName': bankNameCtrl.text.trim(),
          'bankRef': bankRefCtrl.text.trim(),
          'amount': plan?.monthlyPrice ?? 25000,
          'paymentDate': formattedDate,
        },
        'created_by_role': 'ROLE-FINANCE-OFFICER',
      };

      if (isEditMode.value && editingTenantId != null && editingTenantId!.isNotEmpty) {
        final res = await HttpClientService.to
            .patch('/organizations/$editingTenantId', body: payload);
        if (res.success) {
          Get.snackbar(
            'success'.tr,
            'tenant_updated_success'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          if (Get.isRegistered<SubscriptionsController>()) {
            Get.find<SubscriptionsController>().fetchSubscriptions();
          }
          Get.back(result: true);
        } else {
          _showError((res.message != null && res.message!.isNotEmpty) ? res.message! : 'err_update_tenant_failed'.tr);
        }
        return;
      }

      final res = await FinanceService.to.createOrganization(payload);
      if (res.success) {
        final data = res.data ?? {};
        successModalData.value = {
          'orgName': nameCtrl.text.trim(),
          'orgId': data['id'] ?? data['organization_id'] ?? 'ORG-${DateTime.now().millisecondsSinceEpoch % 10000}',
          'adminEmail': adminEmailCtrl.text.trim(),
          'adminPassword': adminPasswordCtrl.text.trim(),
          'planName': plan?.name ?? 'Standard Tier',
        };

        // Refresh tenants list if controller registered
        if (Get.isRegistered<SubscriptionsController>()) {
          Get.find<SubscriptionsController>().fetchSubscriptions();
        }
      } else {
        _showError((res.message != null && res.message!.isNotEmpty) ? res.message! : 'err_create_tenant_failed'.tr);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isSubmitting.value = false;
    }
  }

  void copyCredentials() {
    final d = successModalData.value;
    if (d != null) {
      final text = '${'tenant_credentials_header'.tr}\n'
          '${'lbl_company_name'.tr}: ${d['orgName']}\n'
          '${'lbl_login_email'.tr}: ${d['adminEmail']}\n'
          '${'password'.tr}: ${d['adminPassword']}';
      Clipboard.setData(ClipboardData(text: text));
      Get.snackbar(
        'copied'.tr,
        'credentials_copied_clipboard'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );
    }
  }
}
