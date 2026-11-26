import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import '../../subscriptions/controller/subscriptions_controller.dart';
import '../../subscriptions/model/subscription_model.dart';
import '../../subscriptions/onboard_tenant/controller/onboard_tenant_controller.dart';
import '../../subscriptions/onboard_tenant/view/onboard_tenant_view.dart';

class ManageSubscriptionController extends GetxController {
  ManageSubscriptionController({required this.subscription});

  final Subscription subscription;

  // ---------------- Loading & Data State ----------------
  final RxBool isLoading = true.obs;
  final RxBool isActionLoading = false.obs;
  final RxMap<String, dynamic> orgData = <String, dynamic>{}.obs;

  // ---------------- 3 Sub-Tabs (Exact Admin Panel Parity) ----------------
  // 0 = overview ('Organization Overview')
  // 1 = depots ('Depot & Fleet Roster')
  // 2 = billing ('Tax Invoices')
  final RxInt selectedTabIndex = 0.obs;
  void selectTab(int index) => selectedTabIndex.value = index;

  // ---------------- Depots & Invoices Lists ----------------
  final RxList<TenantDepotItem> depotsList = <TenantDepotItem>[].obs;
  final RxList<TenantInvoiceItem> invoicesList = <TenantInvoiceItem>[].obs;

  // ---------------- Status ----------------
  final Rx<SubscriptionStatus> currentStatus = SubscriptionStatus.active.obs;
  final RxString paymentStatus = 'paid'.obs;

  @override
  void onInit() {
    super.onInit();
    currentStatus.value = subscription.status;
    paymentStatus.value = subscription.paymentStatus;
    fetchTenantDetails();
  }

  // ---------------- Fetch Live Organization Profile ----------------
  Future<void> fetchTenantDetails() async {
    if (subscription.id.isEmpty) {
      isLoading.value = false;
      return;
    }
    isLoading.value = true;
    try {
      final res = await FinanceService.to.getOrganization(subscription.id);
      if (res.success && res.data != null) {
        orgData.value = res.data!;

        // Update status
        final rawSt = (orgData['status'] ?? subscription.rawStatus).toString().toLowerCase();
        if (rawSt == 'pending_approval' || rawSt == 'pending') {
          currentStatus.value = SubscriptionStatus.pendingApproval;
        } else if (rawSt == 'approved') {
          currentStatus.value = SubscriptionStatus.approved;
        } else if (rawSt == 'suspended') {
          currentStatus.value = SubscriptionStatus.suspended;
        } else if (rawSt == 'payment_pending') {
          currentStatus.value = SubscriptionStatus.paymentPending;
        } else {
          currentStatus.value = SubscriptionStatus.active;
        }

        // Update payment status
        if (orgData['payment_status'] != null) {
          paymentStatus.value = orgData['payment_status'].toString().toLowerCase();
        }

        // Parse Depots
        if (orgData['depots'] is List) {
          depotsList.value = (orgData['depots'] as List)
              .map((d) => TenantDepotItem.fromJson(
                  d is Map<String, dynamic> ? d : Map<String, dynamic>.from(d as Map)))
              .toList();
        } else {
          depotsList.clear();
        }

        // Parse Invoices
        if (orgData['invoices'] is List) {
          invoicesList.value = (orgData['invoices'] as List)
              .map((i) => TenantInvoiceItem.fromJson(
                  i is Map<String, dynamic> ? i : Map<String, dynamic>.from(i as Map)))
              .toList();
        } else {
          invoicesList.clear();
        }
      }
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------- Getters for View Rendering ----------------
  String get companyName =>
      orgData['name']?.toString() ?? subscription.companyName;

  String get companyCode =>
      orgData['code']?.toString() ?? subscription.subscriptionCode;

  String? get logoUrl =>
      orgData['logo_url']?.toString() ??
      orgData['logoUrl']?.toString() ??
      subscription.logoUrl;

  String get locationText {
    final city = orgData['city']?.toString() ?? subscription.city;
    final state = orgData['state']?.toString() ?? subscription.state;
    return [city, state].where((s) => s.isNotEmpty).join(', ');
  }

  String get officeAddress =>
      orgData['office_address']?.toString() ??
      orgData['officeAddress']?.toString() ??
      '—';

  String get gstin =>
      orgData['gstin']?.toString() ??
      orgData['gst_number']?.toString() ??
      subscription.gstin;

  String get cin =>
      orgData['cin']?.toString() ?? subscription.cin;

  String get joinedDate {
    final dt = orgData['joined_date'] ?? orgData['created_at'];
    if (dt != null) {
      try {
        final d = DateTime.parse(dt.toString());
        return DateFormat('dd MMM yyyy').format(d);
      } catch (_) {}
    }
    return subscription.dateRangeText.isNotEmpty ? subscription.dateRangeText : '—';
  }

  // Primary Admin Getters
  Map<String, dynamic> get primaryAdminData {
    if (orgData['primaryAdmin'] is Map) {
      return Map<String, dynamic>.from(orgData['primaryAdmin'] as Map);
    }
    if (orgData['admin'] is Map) {
      return Map<String, dynamic>.from(orgData['admin'] as Map);
    }
    if (orgData['users'] is List && (orgData['users'] as List).isNotEmpty) {
      final first = (orgData['users'] as List).first;
      if (first is Map) return Map<String, dynamic>.from(first);
    }
    return {};
  }

  String get adminName {
    final a = primaryAdminData;
    if (a['name'] != null && a['name'].toString().isNotEmpty) {
      return a['name'].toString();
    }
    return subscription.adminName.isNotEmpty ? subscription.adminName : '—';
  }

  String get adminEmail {
    final a = primaryAdminData;
    if (a['email'] != null && a['email'].toString().isNotEmpty) {
      return a['email'].toString();
    }
    return subscription.adminEmail.isNotEmpty ? subscription.adminEmail : '—';
  }

  String get adminPhone {
    final a = primaryAdminData;
    if (a['phone'] != null && a['phone'].toString().isNotEmpty) {
      return a['phone'].toString();
    }
    return subscription.adminPhone.isNotEmpty ? subscription.adminPhone : '—';
  }

  String? get adminEnrollmentNo =>
      primaryAdminData['enrollment_no']?.toString();

  // Subscription Plan & Pricing Getters
  Map<String, dynamic> get planMap {
    if (orgData['plan'] is Map) {
      return Map<String, dynamic>.from(orgData['plan'] as Map);
    }
    if (orgData['subscription'] is Map) {
      return Map<String, dynamic>.from(orgData['subscription'] as Map);
    }
    return {};
  }

  bool get hasSubscriptionOrPlan {
    if (planMap.isNotEmpty) return true;
    if (subscription.planName.isNotEmpty &&
        !subscription.planName.toLowerCase().contains('no plan')) {
      return true;
    }
    final pId = orgData['plan_id'] ?? subscription.planId;
    return pId != null && pId.toString() != '0';
  }

  String get planName {
    if (planMap['name'] != null) return planMap['name'].toString();
    if (subscription.planName.isNotEmpty) return subscription.planName;
    return 'Standard Tier';
  }

  double get planMonthlyPrice {
    if (planMap['monthly_price'] != null) {
      return double.tryParse(planMap['monthly_price'].toString()) ?? 25000.0;
    }
    final mrr = double.tryParse(orgData['mrr']?.toString() ?? '');
    if (mrr != null && mrr > 0) return mrr;
    return 25000.0;
  }

  bool get isPaid {
    final isPending = currentStatus.value == SubscriptionStatus.pendingApproval;
    final hasPaid = paymentStatus.value == 'paid' ||
        invoicesList.any((i) => i.status == 'paid');
    return hasPaid && !isPending && hasSubscriptionOrPlan;
  }

  String get formattedPurchasedDate {
    final dt = orgData['subscription']?['created_at'] ??
        orgData['created_at'];
    if (dt != null) {
      try {
        final d = DateTime.parse(dt.toString());
        return DateFormat('dd MMM yyyy, hh:mm a').format(d);
      } catch (_) {}
    }
    return isPaid ? 'Active' : 'Awaiting Activation';
  }

  String get formattedRenewalDate {
    final dt = orgData['subscription']?['current_period_end'] ??
        orgData['subscription']?['next_billing_at'];
    if (dt != null) {
      try {
        final d = DateTime.parse(dt.toString());
        return DateFormat('dd MMM yyyy').format(d);
      } catch (_) {}
    }
    return isPaid ? 'Renews Monthly' : 'Monthly upon activation';
  }

  String get portalSlug =>
      orgData['slug']?.toString() ??
      subscription.companyName.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '-');

  // ---------------- Core 4 SaaS Plan Quotas Calculations (Exact Parity) ----------------
  // 1. Buses / Fleet Vehicles
  int get busLimit {
    final l = planMap['buses_limit'] ?? orgData['buses_quota'];
    return int.tryParse(l?.toString() ?? '') ?? (subscription.busesCount > 0 ? subscription.busesCount : 25);
  }

  int get busUsed =>
      int.tryParse(orgData['actual_buses_count']?.toString() ?? '') ?? subscription.fleetsCount;

  double get busPercent => busLimit > 0 ? min(1.0, busUsed / busLimit) : 0.0;
  int get busRemaining => max(0, busLimit - busUsed);

  // 2. Drivers
  int get driverLimit {
    final f = planMap['features'] is Map ? planMap['features'] : {};
    final l = planMap['drivers_limit'] ?? f['drivers_limit'];
    return int.tryParse(l?.toString() ?? '') ?? 15;
  }

  int get driverUsed =>
      int.tryParse(orgData['actual_drivers_count']?.toString() ?? '') ?? (busUsed > 0 ? busUsed : 0);

  double get driverPercent => driverLimit > 0 ? min(1.0, driverUsed / driverLimit) : 0.0;
  int get driverRemaining => max(0, driverLimit - driverUsed);

  // 3. Depots & Garages
  int get depotLimit {
    final f = planMap['features'] is Map ? planMap['features'] : {};
    final l = planMap['depots_limit'] ?? f['depots_limit'] ?? orgData['depots_count'];
    return int.tryParse(l?.toString() ?? '') ?? (subscription.depotsCount > 0 ? subscription.depotsCount : 2);
  }

  int get depotUsed =>
      int.tryParse(orgData['actual_depots_count']?.toString() ?? '') ?? depotsList.length;

  double get depotPercent => depotLimit > 0 ? min(1.0, depotUsed / depotLimit) : 0.0;
  int get depotRemaining => max(0, depotLimit - depotUsed);

  // 4. Fleet Operators
  int get operatorLimit {
    final f = planMap['features'] is Map ? planMap['features'] : {};
    final l = planMap['operators_limit'] ?? f['operators_limit'];
    return int.tryParse(l?.toString() ?? '') ?? 3;
  }

  int get operatorUsed =>
      int.tryParse(orgData['actual_operators_count']?.toString() ?? '') ?? 1;

  double get operatorPercent => operatorLimit > 0 ? min(1.0, operatorUsed / operatorLimit) : 0.0;
  int get operatorRemaining => max(0, operatorLimit - operatorUsed);

  // ---------------- Actions ----------------
  void onBackPressed() => Get.back();

  // Edit Tenant -> Open OnboardTenant in edit mode
  Future<void> onEditTenant() async {
    final onboardCtrl = Get.isRegistered<OnboardTenantController>()
        ? Get.find<OnboardTenantController>()
        : Get.put(OnboardTenantController());
    onboardCtrl.initForEdit(subscription, orgData);
    final updated = await Get.to(() => const OnboardTenantView());
    if (updated == true) {
      fetchTenantDetails();
      if (Get.isRegistered<SubscriptionsController>()) {
        Get.find<SubscriptionsController>().fetchSubscriptions();
      }
    }
  }

  // Approve Tenant Application
  Future<void> onApproveTenant() async {
    isActionLoading.value = true;
    try {
      final res = await FinanceService.to.approveOrganization(subscription.id);
      if (res.success) {
        currentStatus.value = SubscriptionStatus.active;
        Get.snackbar(
          'success'.tr,
          'tenant_approved_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        fetchTenantDetails();
        if (Get.isRegistered<SubscriptionsController>()) {
          Get.find<SubscriptionsController>().fetchSubscriptions();
        }
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'tenant_approval_failed'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar('error'.tr, e.toString(),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white);
    } finally {
      isActionLoading.value = false;
    }
  }

  // Toggle Suspend / Reactivate
  Future<void> onToggleStatus() async {
    final isSuspended = currentStatus.value == SubscriptionStatus.suspended;
    final nextStatus = isSuspended ? 'active' : 'suspended';

    isActionLoading.value = true;
    try {
      final res = await FinanceService.to.updateOrganizationStatus(subscription.id, nextStatus);
      if (res.success) {
        currentStatus.value = isSuspended ? SubscriptionStatus.active : SubscriptionStatus.suspended;
        Get.snackbar(
          'success'.tr,
          isSuspended ? 'tenant_activated_success'.tr : 'tenant_suspended_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: isSuspended ? const Color(0xFF10B981) : const Color(0xFFEF4444),
          colorText: Colors.white,
        );
        fetchTenantDetails();
        if (Get.isRegistered<SubscriptionsController>()) {
          Get.find<SubscriptionsController>().fetchSubscriptions();
        }
      } else {
        Get.snackbar('error'.tr, res.message ?? 'failed_to_update_status'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('error'.tr, e.toString(),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white);
    } finally {
      isActionLoading.value = false;
    }
  }

  // Reset Admin Password Modal (Mirroring Admin Panel lines 61-68 & 1418-1420)
  void onResetAdminPassword() {
    final newPassCtrl = TextEditingController(text: _generateSecurePassword());
    final isShow = true.obs;

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: Color(0x1FFFFFFF))),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(color: const Color(0x1F3B82F6), borderRadius: BorderRadius.circular(8)),
                        child: const Icon(Icons.lock_reset, color: Color(0xFF3B82F6), size: 18),
                      ),
                      const SizedBox(width: 8),
                      Text('reset_admin_password_title'.tr, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  IconButton(onPressed: () => Get.back(), icon: const Icon(Icons.close, color: Colors.white54, size: 18), padding: EdgeInsets.zero, constraints: const BoxConstraints()),
                ],
              ),
              const SizedBox(height: 6),
              Text('${'reset_pass_desc'.tr} $adminEmail', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5)),
              const SizedBox(height: 16),
              Text('new_password'.tr, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Obx(() => Container(
                    decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0x1FFFFFFF))),
                    child: TextField(
                      controller: newPassCtrl,
                      obscureText: !isShow.value,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        suffixIcon: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(isShow.value ? Icons.visibility_off : Icons.visibility, color: Colors.white54, size: 18),
                              onPressed: () => isShow.toggle(),
                            ),
                            IconButton(
                              icon: const Icon(Icons.refresh, color: Color(0xFF3B82F6), size: 18),
                              onPressed: () => newPassCtrl.text = _generateSecurePassword(),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0x2FFFFFFF)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                      ),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: newPassCtrl.text));
                        Get.snackbar('copied'.tr, 'password_copied_clipboard'.tr, snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
                      },
                      child: Text('copy_info'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                      ),
                      onPressed: () async {
                        try {
                          await HttpClientService.to.patch(
                            '/users/reset-password',
                            body: {
                              'email': adminEmail,
                              'new_password': newPassCtrl.text,
                            },
                          );
                        } catch (_) {}
                        Get.back();
                        Get.snackbar('success'.tr, 'password_reset_success'.tr, snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
                      },
                      child: Text('btn_apply_password'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _generateSecurePassword() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#\$%^&*';
    final rnd = Random.secure();
    final chars = [
      upper[rnd.nextInt(upper.length)],
      lower[rnd.nextInt(lower.length)],
      numbers[rnd.nextInt(numbers.length)],
      special[rnd.nextInt(special.length)],
      for (int i = 0; i < 6; i++)
        (upper + lower + numbers + special)[rnd.nextInt(upper.length + lower.length + numbers.length + special.length)],
    ]..shuffle(rnd);
    return chars.join();
  }

  void copyToClipboard(String text, String message) {
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      'copied'.tr,
      message,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
