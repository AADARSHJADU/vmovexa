import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controller/manage_subscription_controller.dart';
import '../../model/subscription_model.dart';
import '../shared_tab_widgets.dart';

class PlanDetailsTab extends GetView<ManageSubscriptionController> {
  const PlanDetailsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        TabSectionCard(
          title: 'Plan & Pricing',
          trailing: OutlinedPillButton(icon: Icons.edit_outlined, label: 'Edit Plan', onTap: controller.onEditPlan),
          child: Obx(
            () => Column(
              children: [
                KeyValueRow(label: 'Plan Name', value: controller.planName.value),
                KeyValueRow(label: 'Billing Cycle', value: controller.billingCycle.value),
                KeyValueRow(label: 'Plan Amount', value: controller.planAmount.value),
                KeyValueRow(label: controller.taxesLabel.value, value: controller.taxesAmount.value),
                const Divider(color: Colors.white10, height: 18),
                KeyValueRow(label: 'Total Amount', value: controller.totalAmount.value, emphasize: true),
                KeyValueRow(label: 'Currency', value: controller.currency.value),
                KeyValueRow(label: 'Next Billing Date', value: controller.nextBillingDate.value),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        TabSectionCard(
          title: 'Subscription Status',
          trailing: OutlinedPillButton(icon: Icons.sync, label: 'Change Status', onTap: controller.onChangeStatus),
          child: Obx(
            () => Column(
              children: [
                KeyValueRow(label: 'Status', value: controller.status.value.label, valueColor: controller.status.value.color, emphasize: true),
                KeyValueRow(label: 'Start Date', value: controller.startDate.value),
                KeyValueRow(label: 'End Date', value: controller.endDate.value),
                KeyValueRow(label: 'Auto Renewal', value: controller.autoRenewal.value ? 'Enabled' : 'Disabled', valueColor: controller.autoRenewal.value ? kGreen : Colors.white54),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        TabSectionCard(
          title: 'Payment Method',
          trailing: OutlinedPillButton(icon: Icons.credit_card_outlined, label: 'Update Payment Method', onTap: controller.onUpdatePaymentMethod),
          child: Obx(
            () => Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white.withOpacity(0.06))),
              child: Row(
                children: [
                  Container(
                    width: 34,
                    height: 24,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4)),
                    alignment: Alignment.center,
                    child: const Text('VISA', style: TextStyle(color: Color(0xFF1A1F71), fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text('\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  ${controller.cardLastFour.value}', style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600, letterSpacing: 1)),
                  ),
                  if (controller.isPrimaryPaymentMethod.value) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: kGreen.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                      child: const Text('Primary', style: TextStyle(color: kGreen, fontSize: 9.5, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Text('Expires ${controller.cardExpiry.value}', style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
        TabSectionCard(
          title: 'Additional Settings',
          child: Column(
            children: [
              Obx(
                () => SettingsToggleRow(
                  icon: Icons.mail_outline,
                  title: 'Billing Notifications',
                  subtitle: 'Receive billing and invoice notifications',
                  value: controller.billingNotifications.value,
                  onChanged: controller.toggleBillingNotifications,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingsToggleRow(
                  icon: Icons.description_outlined,
                  title: 'Usage Alerts',
                  subtitle: 'Get notified for usage limit and add-on usage',
                  value: controller.usageAlerts.value,
                  onChanged: controller.toggleUsageAlerts,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
