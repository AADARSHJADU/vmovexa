import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';
import '../shared_tab_widgets.dart';

class AddonsTab extends GetView<ManageSubscriptionController> {
  const AddonsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        TabSectionCard(
          title: 'Add-ons',
          trailing: OutlinedPillButton(icon: Icons.add, label: 'Add', onTap: () {}),
          child: const TabEmptyState(
            icon: Icons.extension_outlined,
            title: 'No Add-ons Yet',
            subtitle: 'Extend this subscription with extra storage, seats, or premium features.',
          ),
        ),
      ],
    );
  }
}
