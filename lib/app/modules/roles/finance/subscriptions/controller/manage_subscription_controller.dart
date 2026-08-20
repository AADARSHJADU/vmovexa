import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/model/subscription_model.dart';

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

  // ---------------- Actions ----------------
  void onBackPressed() => Get.back();

  void onEditPlan() {
    // TODO: navigate to a plan-selection/upgrade screen
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
    // TODO: navigate to a payment-method management screen
  }

  void toggleBillingNotifications(bool value) => billingNotifications.value = value;
  void toggleUsageAlerts(bool value) => usageAlerts.value = value;

  Future<void> onSaveChanges() async {
    isSaving.value = true;
    try {
      // TODO: persist changes via API
      await Future.delayed(const Duration(milliseconds: 900));
      Get.snackbar(
        'Changes Saved',
        'Subscription settings for ${subscription.companyName} have been updated.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSaving.value = false;
    }
  }
}
