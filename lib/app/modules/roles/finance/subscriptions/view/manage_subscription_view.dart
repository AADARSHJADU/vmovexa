import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/tabs/addons_tab.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/tabs/billing_tab.dart' show BillingTab;
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/tabs/history_tab.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/tabs/plan_details_tab.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/tabs/users_tab.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

import '../model/subscription_model.dart';

class ManageSubscriptionView extends GetView<ManageSubscriptionController> {
  const ManageSubscriptionView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: controller.onBackPressed,
                    child: const Row(
                      children: [
                        Icon(Icons.arrow_back, color: kPurple, size: 15),
                        SizedBox(width: 6),
                        Text('Back to Subscriptions', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text('Manage Subscription', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  const Text('Update subscription details and settings', style: TextStyle(color: Colors.white54, fontSize: 12)),
                  const SizedBox(height: 14),
                  _buildSummaryCard(),
                  const SizedBox(height: 12),
                  _buildTabBar(),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: Obx(() {
                switch (controller.selectedTabIndex.value) {
                  case 1:
                    return const UsersTab();
                  case 2:
                    return const AddonsTab();
                  case 3:
                    return const BillingTab();
                  case 4:
                    return const HistoryTab();
                  default:
                    return const PlanDetailsTab();
                }
              }),
            ),
            Obx(() {
              if (controller.selectedTabIndex.value != 0) return const SizedBox();
              return _buildFooter();
            }),
          ],
        ),
      ),
    );
  }

  // ---------------- Subscription summary card ----------------
  Widget _buildSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(color: controller.subscription.avatarColor, borderRadius: BorderRadius.circular(10)),
            alignment: Alignment.center,
            child: Text(controller.subscription.initials, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(controller.subscription.companyName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                      child: Obx(() => Text(controller.planName.value, style: const TextStyle(color: kPurple, fontSize: 9.5, fontWeight: FontWeight.w600))),
                    ),
                    Text(controller.subscription.subscriptionCode, style: const TextStyle(color: Colors.white38, fontSize: 10)),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, color: Colors.white24, size: 11),
                    const SizedBox(width: 4),
                    Text(controller.subscription.dateRangeText, style: const TextStyle(color: Colors.white38, fontSize: 9.5)),
                    const SizedBox(width: 10),
                    const Icon(Icons.people_outline, color: Colors.white24, size: 12),
                    const SizedBox(width: 3),
                    Text('${controller.subscription.userCount} Users', style: const TextStyle(color: Colors.white38, fontSize: 9.5)),
                  ],
                ),
              ],
            ),
          ),
          Obx(
            () => Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
              decoration: BoxDecoration(color: controller.status.value.color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
              child: Text(controller.status.value.label, style: TextStyle(color: controller.status.value.color, fontSize: 10, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Tab bar ----------------
  Widget _buildTabBar() {
    return SizedBox(
        height: 34,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: controller.tabLabels.length,
          separatorBuilder: (_, __) => const SizedBox(width: 6),
          itemBuilder: (context, index) {
            return Obx((){
              final isActive = controller.selectedTabIndex.value == index;
              return GestureDetector(
                onTap: () => controller.selectTab(index),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    border: Border(bottom: BorderSide(color: isActive ? kPurple : Colors.transparent, width: 2)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(controller.tabIcons[index], size: 14, color: isActive ? kPurple : Colors.white38),
                      const SizedBox(width: 6),
                      Text(
                        controller.tabLabels[index],
                        style: TextStyle(color: isActive ? Colors.white : Colors.white38, fontSize: 12, fontWeight: isActive ? FontWeight.w700 : FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              );
            });
          },
        ),
      );
  }

  // ---------------- Footer (Save Changes — Plan Details tab only) ----------------
  Widget _buildFooter() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        // gradient: AppThe,
          border: Border(top: BorderSide(color:
          Colors.white.withOpacity(0.06)))),
      child: Obx(
        () => GestureDetector(
          onTap: controller.isSaving.value ? null : controller.onSaveChanges,
          child: Container(
            width: double.infinity,
            height: 50,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(12)),
            alignment: Alignment.center,
            child: controller.isSaving.value
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4))
                : const Text('Save Changes', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
          ),
        ),
      ),
    );
  }
}
