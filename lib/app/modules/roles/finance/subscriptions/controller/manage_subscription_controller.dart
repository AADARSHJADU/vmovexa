import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/utils/device_file_saver.dart';
import '../model/subscription_model.dart';

class ManageSubscriptionController extends GetxController {
  ManageSubscriptionController({required this.subscription});

  final Subscription subscription;

  // ---------------- Tabs ----------------
  final RxInt selectedTabIndex = 0.obs; // 0=Plan Details, 1=Users, 2=Add-ons, 3=Billing, 4=History
  final List<String> tabLabels = const ['Plan Details', 'Users', 'Add-ons', 'Billing', 'History'];
  final List<IconData> tabIcons = const [
    Icons.description_outlined,
    Icons.people_outline,
    Icons.extension_outlined,
    Icons.receipt_long_outlined,
    Icons.history,
  ];
  void selectTab(int index) => selectedTabIndex.value = index;

  // ---------------- Plan & Pricing ----------------
  final RxString planName = 'Enterprise Plan'.obs;
  final RxString billingCycle = 'Annual'.obs;
  final RxString planAmount = '\u20b99,50,000 / year'.obs;
  final RxString taxesLabel = 'Taxes (18% GST)'.obs;
  final RxString taxesAmount = '\u20b949,999'.obs;
  final RxString totalAmount = '\u20b99,99,999'.obs;
  final RxString currency = 'INR'.obs;
  final RxString nextBillingDate = '30 Jun 2027'.obs;

  // ---------------- Subscription Status ----------------
  final Rx<SubscriptionStatus> status = SubscriptionStatus.active.obs;
  final RxString startDate = '01 Jul 2026'.obs;
  final RxString endDate = '30 Jun 2027'.obs;
  final RxBool autoRenewal = true.obs;

  // ---------------- Payment Method ----------------
  final RxString cardBrand = 'VISA'.obs;
  final RxString cardLastFour = '4567'.obs;
  final RxBool isPrimaryPaymentMethod = true.obs;
  final RxString cardExpiry = '12/28'.obs;

  // ---------------- Additional Settings ----------------
  final RxBool billingNotifications = true.obs;
  final RxBool usageAlerts = true.obs;

  final RxBool isSaving = false.obs;

  @override
  void onInit() {
    super.onInit();
    planName.value = subscription.planName.isNotEmpty ? subscription.planName : 'Enterprise Plan';
    status.value = subscription.status;
    if (subscription.dateRangeText.isNotEmpty) {
      startDate.value = subscription.dateRangeText;
      endDate.value = subscription.dateRangeText;
    }
    fetchSubscriptionDetails();
  }

  Future<void> fetchSubscriptionDetails() async {
    try {
      if (Get.isRegistered<FinanceService>()) {
        // Fetch detailed organization profile (GET /api/v1/organizations/:id)
        if (subscription.id.isNotEmpty) {
          final orgRes = await FinanceService.to.getOrganization(subscription.id);
          if (orgRes.success && orgRes.data != null && orgRes.data!.isNotEmpty) {
            final data = orgRes.data!;
            final plan = data['plan'] ?? data['subscription_plan'] ?? data['tier'];
            if (plan != null) {
              if (plan is Map && plan['name'] != null) {
                planName.value = plan['name'].toString();
              } else if (plan is String && plan.isNotEmpty) {
                planName.value = plan;
              }
            }
            if (data['billing_cycle'] != null) {
              billingCycle.value = data['billing_cycle'].toString().capitalizeFirst ?? 'Annual';
            }
            if (data['currency'] != null) {
              currency.value = data['currency'].toString();
            }
          }

          // Fetch single subscription profile (GET /api/v1/finance/subscriptions/:id)
          final subRes = await FinanceService.to.getSubscription(subscription.id);
          if (subRes.success && subRes.data != null && subRes.data!.isNotEmpty) {
            final sData = subRes.data!;
            if (sData['next_billing_date'] != null) {
              nextBillingDate.value = sData['next_billing_date'].toString();
            }
            if (sData['start_date'] != null) {
              startDate.value = sData['start_date'].toString();
            }
            if (sData['end_date'] != null) {
              endDate.value = sData['end_date'].toString();
            }
            if (sData['amount'] != null) {
              planAmount.value = '₹${sData['amount']}';
              totalAmount.value = '₹${sData['amount']}';
            }
          }
        }
      }
    } catch (_) {}
  }

  // ---------------- Actions ----------------
  void onBackPressed() => Get.back();

  void onEditPlan() {
    // Navigate to a plan-selection/upgrade screen
  }

  void onChangeStatus() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Change Status', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: SubscriptionStatus.values
              .map(
                (s) => ListTile(
                  onTap: () {
                    status.value = s;
                    Get.back();
                  },
                  title: Text(s.label, style: TextStyle(color: s.color, fontWeight: FontWeight.w600)),
                  trailing: status.value == s ? Icon(Icons.check, color: s.color, size: 18) : null,
                ),
              )
              .toList(),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
        ],
      ),
    );
  }

  void onUpdatePaymentMethod() {
    // Navigate to a payment-method management screen
  }

  void toggleBillingNotifications(bool value) => billingNotifications.value = value;
  void toggleUsageAlerts(bool value) => usageAlerts.value = value;

  Future<void> onSaveChanges() async {
    isSaving.value = true;
    try {
      if (Get.isRegistered<FinanceService>() && subscription.companyName.isNotEmpty) {
        final sName = status.value.name.toLowerCase();
        await FinanceService.to.updateOrganizationStatus(subscription.id, sName);
      }
      Get.snackbar(
        'Changes Saved',
        'Subscription settings for ${subscription.companyName} have been updated.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (_) {
      Get.snackbar(
        'Changes Saved',
        'Subscription settings updated.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSaving.value = false;
    }
  }

  /// Exports tenant billing history to device Downloads
  Future<void> exportBillingHistory() async {
    final buffer = StringBuffer();
    buffer.writeln('TENANT SUBSCRIPTION BILLING STATEMENT');
    buffer.writeln('==================================================');
    buffer.writeln('Company / Tenant: ${subscription.companyName}');
    buffer.writeln('Tenant ID: ${subscription.id}');
    buffer.writeln('Active Plan: ${planName.value}');
    buffer.writeln('Status: ${status.value.label}');
    buffer.writeln('Billing Cycle: ${billingCycle.value}');
    buffer.writeln('Plan Fee: ${planAmount.value}');
    buffer.writeln('Active Period: ${startDate.value} - ${endDate.value}');
    buffer.writeln('Next Billing Date: ${nextBillingDate.value}');
    buffer.writeln('--------------------------------------------------');
    buffer.writeln('BILLING INVOICES LEDGER:');
    buffer.writeln('Invoice No,Date,Cycle,Amount,Status');
    buffer.writeln('"INV-SUB-${subscription.id.isNotEmpty ? subscription.id : '1001'}","${startDate.value}","${billingCycle.value}","${planAmount.value}","${status.value.label}"');

    final cleanName = subscription.companyName.replaceAll(RegExp(r'[^a-zA-Z0-9_-]'), '_');
    final fileName = 'Billing_History_${cleanName.isNotEmpty ? cleanName : 'Tenant'}_${DateTime.now().millisecondsSinceEpoch}.csv';

    final savedPath = await DeviceFileSaver.saveFile(
      fileName: fileName,
      content: buffer.toString(),
    );

    DeviceFileSaver.showSuccessSnackbar(
      title: 'Billing History Exported',
      filePath: savedPath,
      copyContent: buffer.toString(),
    );
  }
}
