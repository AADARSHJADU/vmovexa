import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/shared_tab_widgets.dart';

class BillingTab extends GetView<ManageSubscriptionController> {
  const BillingTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        TabSectionCard(
          title: 'Billing History',
          trailing: OutlinedPillButton(icon: Icons.download_outlined, label: 'Export', onTap: () {}),
          child: const TabEmptyState(
            icon: Icons.receipt_long_outlined,
            title: 'No Invoices Yet',
            subtitle: 'Past invoices for this subscription will appear here once generated.',
          ),
        ),
      ],
    );
  }
}
