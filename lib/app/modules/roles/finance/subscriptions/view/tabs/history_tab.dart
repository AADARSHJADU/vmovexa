import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';

import '../shared_tab_widgets.dart';

class HistoryTab extends GetView<ManageSubscriptionController> {
  const HistoryTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        const TabSectionCard(
          title: 'Activity History',
          child: TabEmptyState(
            icon: Icons.history,
            title: 'No Activity Yet',
            subtitle: 'Changes made to this subscription (plan, status, payment) will be logged here.',
          ),
        ),
      ],
    );
  }
}
