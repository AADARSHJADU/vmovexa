import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';
import '../shared_tab_widgets.dart';

class UsersTab extends GetView<ManageSubscriptionController> {
  const UsersTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        TabSectionCard(
          title: 'Users (${controller.subscription.userCount})',
          trailing: OutlinedPillButton(icon: Icons.person_add_alt_outlined, label: 'Invite User', onTap: () {}),
          child: const TabEmptyState(
            icon: Icons.people_outline,
            title: 'User Management',
            subtitle: 'View, invite, and manage users on this subscription from here.',
          ),
        ),
      ],
    );
  }
}
