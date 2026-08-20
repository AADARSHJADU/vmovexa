import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/subscriptions_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/model/subscription_model.dart';

class SubscriptionsView extends GetView<SubscriptionsController> {
  const SubscriptionsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.allSubscriptions.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 4),
                      const Text('View and manage all your subscriptions', style: TextStyle(color: Colors.white54, fontSize: 12)),
                      const SizedBox(height: 16),
                      _buildSearchAndFilterRow(),
                      const SizedBox(height: 12),
                      _buildFilterTabs(),
                      const SizedBox(height: 14),
                      _buildSubscriptionsList(),
                      const SizedBox(height: 12),
                      _buildHelpBanner(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(onTap: controller.onMenuTap, child: const Icon(Icons.menu, color: kPurple)),
        const SizedBox(width: 12),
        const Expanded(
          child: Text('All Subscriptions', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
        ),
        GestureDetector(
          onTap: controller.onNotificationTap,
          child: Obx(
            () => Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.notifications_none_rounded, color: Colors.white70, size: 22),
                if (controller.notificationCount.value > 0)
                  Positioned(
                    right: -1,
                    top: -1,
                    child: Container(width: 8, height: 8, decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle)),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: controller.onProfileTap,
          child: Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(gradient: LinearGradient(colors: [kPurple, kIndigo]), shape: BoxShape.circle),
            alignment: Alignment.center,
            child: Obx(() => Text(controller.userInitial.value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700))),
          ),
        ),
      ],
    );
  }

  // ---------------- Search + filter icon ----------------
  Widget _buildSearchAndFilterRow() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.08))),
            child: TextField(
              onChanged: controller.onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 13),
                hintText: 'Search by company name',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 12.5),
                prefixIcon: Icon(Icons.search, color: Colors.white38, size: 19),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        GestureDetector(
          onTap: controller.onOpenFilterSheet,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: kPurple.withOpacity(0.4))),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.tune, color: kPurple, size: 15),
                SizedBox(width: 5),
                Text('Filter', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Filter chips (All / Active / Expiring Soon / Inactive) ----------------
  Widget _buildFilterTabs() {
    return Obx(
      () => SizedBox(
        height: 34,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: [
            _FilterChip(label: 'All (${controller.totalCount})', isActive: controller.selectedFilterIndex.value == 0, onTap: () => controller.selectFilter(0)),
            const SizedBox(width: 8),
            _FilterChip(label: 'Active (${controller.activeCount})', isActive: controller.selectedFilterIndex.value == 1, onTap: () => controller.selectFilter(1)),
            const SizedBox(width: 8),
            _FilterChip(label: 'Expiring Soon (${controller.expiringSoonCount})', isActive: controller.selectedFilterIndex.value == 2, onTap: () => controller.selectFilter(2)),
            const SizedBox(width: 8),
            _FilterChip(label: 'Inactive (${controller.inactiveCount})', isActive: controller.selectedFilterIndex.value == 3, onTap: () => controller.selectFilter(3)),
          ],
        ),
      ),
    );
  }

  // ---------------- Subscriptions list ----------------
  Widget _buildSubscriptionsList() {
    return Obx(() {
      final list = controller.filteredSubscriptions;
      if (list.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(child: Text('No subscriptions found', style: TextStyle(color: Colors.white38, fontSize: 13))),
        );
      }
      return Column(
        children: list
            .map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _SubscriptionCard(subscription: s, onTap: () => controller.onSubscriptionTap(s)),
                ))
            .toList(),
      );
    });
  }

  // ---------------- Help banner ----------------
  Widget _buildHelpBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.06))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, color: kPurple, size: 16),
          const SizedBox(width: 8),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Need help?', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                SizedBox(height: 2),
                Text('Contact our support team for any subscription related queries.', style: TextStyle(color: Colors.white38, fontSize: 10.5)),
              ],
            ),
          ),
          GestureDetector(
            onTap: controller.onContactSupport,
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Contact Support', style: TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                Icon(Icons.chevron_right, color: kPurple, size: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Filter chip
// =====================================================================
class _FilterChip extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.isActive, required this.onTap});

  static const Color kPurple = SubscriptionsView.kPurple;
  static const Color kCardBg = SubscriptionsView.kCardBg;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isActive ? kPurple : kCardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isActive ? Colors.transparent : Colors.white.withOpacity(0.08)),
        ),
        child: Text(
          label,
          style: TextStyle(color: isActive ? Colors.white : Colors.white54, fontSize: 11.5, fontWeight: isActive ? FontWeight.w700 : FontWeight.w500),
        ),
      ),
    );
  }
}

// =====================================================================
// Subscription card
// =====================================================================
class _SubscriptionCard extends StatelessWidget {
  final Subscription subscription;
  final VoidCallback onTap;

  const _SubscriptionCard({required this.subscription, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: SubscriptionsView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: SubscriptionsView.kBorder),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: subscription.avatarColor, borderRadius: BorderRadius.circular(10)),
              alignment: Alignment.center,
              child: Text(subscription.initials, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(subscription.companyName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(subscription.planName, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined, color: Colors.white24, size: 11),
                      const SizedBox(width: 4),
                      Text(subscription.dateRangeText, style: const TextStyle(color: Colors.white38, fontSize: 9.5)),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(color: subscription.status.color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                  child: Text(subscription.status.label, style: TextStyle(color: subscription.status.color, fontSize: 10, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 14),
                const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
