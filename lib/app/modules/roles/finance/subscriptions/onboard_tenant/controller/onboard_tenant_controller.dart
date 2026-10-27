import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../../controller/subscriptions_controller.dart';

class PresetAvatar {
  final String id;
  final String title;
  final Color color;
  final IconData icon;
  const PresetAvatar(this.id, this.title, this.color, this.icon);
}

class SubscriptionPlanItem {
  final dynamic id;
  final String name;
  final double monthlyPrice;
  final int busesLimit;
  final int depotsLimit;
  final int adRevenueShareRate;

  SubscriptionPlanItem({
    required this.id,
    required this.name,
    required this.monthlyPrice,
    required this.busesLimit,
    required this.depotsLimit,
    required this.adRevenueShareRate,
  });

  factory SubscriptionPlanItem.fromJson(Map<String, dynamic> json) {
    final features = json['features'] is Map ? json['features'] : {};
    return SubscriptionPlanItem(
      id: json['id'] ?? 1,
      name: (json['name'] ?? 'Standard Tier').toString(),
      monthlyPrice: double.tryParse(json['monthly_price']?.toString() ?? '') ?? 25000.0,
      busesLimit: int.tryParse(json['buses_limit']?.toString() ?? '') ?? 25,
      depotsLimit: int.tryParse(features['depots_limit']?.toString() ?? json['depots_limit']?.toString() ?? '') ?? 2,
      adRevenueShareRate: int.tryParse(json['ad_revenue_share_rate']?.toString() ?? '') ?? 65,
    );
  }
}

class OnboardTenantController extends GetxController {
  // Stepper state (1 to 4)
  final RxInt currentStep = 1.obs;
  final RxBool isSubmitting = false.obs;

  // ---------------- STEP 1: Company Info ----------------
  final nameCtrl = TextEditingController();
  final cityCtrl = TextEditingController(text: 'Mumbai');
  final officeAddressCtrl = TextEditingController();
  final pincodeCtrl = TextEditingController();
  final cinCtrl = TextEditingController();
  final gstinCtrl = TextEditingController();

  final RxString selectedState = 'Maharashtra'.obs;
  final RxString selectedAvatarId = 'transit_blue'.obs;

  static const List<PresetAvatar> presetAvatars = [
    PresetAvatar('transit_blue', 'Blue Bus Transit', Color(0xFF2563EB), Icons.directions_bus),
    PresetAvatar('city_emerald', 'Emerald City Corp', Color(0xFF059669), Icons.location_city),
    PresetAvatar('shield_indigo', 'Indigo Security Fleet', Color(0xFF4F46E5), Icons.security),
    PresetAvatar('express_amber', 'Amber Express Fleet', Color(0xFFD97706), Icons.flash_on),
    PresetAvatar('global_rose', 'Rose Global Mobility', Color(0xFFE11D48), Icons.public),
    PresetAvatar('metro_violet', 'Violet Tech Transit', Color(0xFF7C3AED), Icons.subway),
    PresetAvatar('cyan_logistics', 'Cyan Freight & Logistics', Color(0xFF0891B2), Icons.local_shipping),
  ];

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

  @override
  void onClose() {
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
        }

        if (raw is List && raw.isNotEmpty) {
          list = raw.map((it) => SubscriptionPlanItem.fromJson(Map<String, dynamic>.from(it as Map))).toList();
        }
      }

      // Fallback standard tiers if empty from backend
      if (list.isEmpty) {
        list = [
          SubscriptionPlanItem(
            id: 1,
            name: 'Starter Tier',
            monthlyPrice: 25000,
            busesLimit: 25,
            depotsLimit: 2,
            adRevenueShareRate: 65,
          ),
          SubscriptionPlanItem(
            id: 2,
            name: 'Growth Tier',
            monthlyPrice: 45000,
            busesLimit: 50,
            depotsLimit: 5,
            adRevenueShareRate: 70,
          ),
          SubscriptionPlanItem(
            id: 3,
            name: 'Enterprise Tier',
            monthlyPrice: 85000,
            busesLimit: 100,
            depotsLimit: 10,
            adRevenueShareRate: 75,
          ),
        ];
      }

      plans.assignAll(list);
      selectedPlan.value = list.first;
    } catch (_) {
      // Fallback
      plans.assignAll([
        SubscriptionPlanItem(
          id: 1,
          name: 'Starter Tier',
          monthlyPrice: 25000,
          busesLimit: 25,
          depotsLimit: 2,
          adRevenueShareRate: 65,
        ),
      ]);
      selectedPlan.value = plans.first;
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

  // ---------------- Stepper Navigation ----------------
  void nextStep() {
    if (currentStep.value == 1) {
      if (nameCtrl.text.trim().isEmpty) {
        _showError('Company Name is required');
        return;
      }
      if (cityCtrl.text.trim().isEmpty) {
        _showError('City is required');
        return;
      }
      if (pincodeCtrl.text.trim().isNotEmpty && pincodeCtrl.text.trim().length != 6) {
        _showError('Pincode must be exactly 6 digits');
        return;
      }
      if (cinCtrl.text.trim().isNotEmpty && cinCtrl.text.trim().length != 21) {
        _showError('CIN must be 21 characters');
        return;
      }
      if (gstinCtrl.text.trim().isNotEmpty && gstinCtrl.text.trim().length != 15) {
        _showError('GSTIN must be 15 characters');
        return;
      }
      currentStep.value = 2;
    } else if (currentStep.value == 2) {
      if (adminNameCtrl.text.trim().isEmpty) {
        _showError('Admin Full Name is required');
        return;
      }
      final email = adminEmailCtrl.text.trim();
      if (email.isEmpty || !GetUtils.isEmail(email)) {
        _showError('Enter a valid Admin Email address');
        return;
      }
      final phone = adminPhoneCtrl.text.trim();
      if (phone.isEmpty || phone.length != 10) {
        _showError('Enter a valid 10-digit mobile number');
        return;
      }
      if (adminPasswordCtrl.text.isEmpty || adminPasswordCtrl.text.length < 8) {
        _showError('Password must be at least 8 characters');
        return;
      }
      currentStep.value = 3;
    } else if (currentStep.value == 3) {
      if (selectedPlan.value == null) {
        _showError('Please select a subscription plan tier');
        return;
      }
      if (paymentMode.value == 'offline') {
        if (bankNameCtrl.text.trim().isEmpty) {
          _showError('Bank name is required for offline settlement');
          return;
        }
        if (bankRefCtrl.text.trim().isEmpty) {
          _showError('Bank reference / UTR is required');
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
      'Validation Error',
      msg,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.redAccent,
      colorText: Colors.white,
    );
  }

  // ---------------- Final Submission ----------------
  Future<void> submitTenant() async {
    if (!acceptContract.value) {
      _showError('Please confirm the declaration checkbox to proceed');
      return;
    }

    final plan = selectedPlan.value;
    final pDate = paymentDate.value;
    final formattedDate =
        '${pDate.year}-${pDate.month.toString().padLeft(2, '0')}-${pDate.day.toString().padLeft(2, '0')}';

    final payload = <String, dynamic>{
      'name': nameCtrl.text.trim(),
      'logoUrl': selectedAvatarId.value,
      'state': selectedState.value,
      'city': cityCtrl.text.trim(),
      if (cinCtrl.text.trim().isNotEmpty) 'cin': cinCtrl.text.trim().toUpperCase(),
      if (gstinCtrl.text.trim().isNotEmpty) 'gstin': gstinCtrl.text.trim().toUpperCase(),
      if (officeAddressCtrl.text.trim().isNotEmpty) 'officeAddress': officeAddressCtrl.text.trim(),
      if (pincodeCtrl.text.trim().isNotEmpty) 'pincode': pincodeCtrl.text.trim(),
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
      'adRevenueShareRate': plan?.adRevenueShareRate ?? 65,
      if (paymentMode.value == 'offline') ...{
        'bankName': bankNameCtrl.text.trim(),
        'bankRef': bankRefCtrl.text.trim(),
        'amount': plan?.monthlyPrice ?? 25000,
        'paymentDate': formattedDate,
      },
      'created_by_role': 'ROLE-FINANCE-OFFICER',
    };

    isSubmitting.value = true;
    try {
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
        _showError((res.message != null && res.message!.isNotEmpty) ? res.message! : 'Failed to create tenant organization');
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
      final text = 'VMOVEXA Tenant Login Credentials\n'
          'Company: ${d['orgName']}\n'
          'Email: ${d['adminEmail']}\n'
          'Password: ${d['adminPassword']}';
      Clipboard.setData(ClipboardData(text: text));
      Get.snackbar(
        'Copied!',
        'Tenant credentials copied to clipboard',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );
    }
  }
}
