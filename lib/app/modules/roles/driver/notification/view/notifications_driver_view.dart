import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/notification/controller/notifications_driver_controller.dart';

import '../model/driver_notification_model.dart';

class NotificationsDriverView extends GetView<NotificationsDriverController> {
  const NotificationsDriverView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);

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
                children: [
                  _buildHeader(),
                  const SizedBox(height: 14),
                  _buildTabBar(),
                ],
              ),
            ),
            Expanded(
              child: Obx(
                () => controller.isLoading.value && controller.allNotifications.isEmpty
                    ? const Center(child: CircularProgressIndicator(color: kPurple))
                    : RefreshIndicator(
                        color: kPurple,
                        backgroundColor: kCardBg,
                        onRefresh: controller.onRefresh,
                        child: _buildNotificationsList(),
                      ),
              ),
            ),
            _buildPushBanner(),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onBackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Notifications', style: TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w800)),
              SizedBox(height: 2),
              Text('Stay updated with important alerts and updates.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onOpenFilterSheet,
          child: const Icon(Icons.tune, color: kPurple, size: 20),
        ),
      ],
    );
  }

  // ---------------- Tab bar (All / Alerts / Updates / System) ----------------
  Widget _buildTabBar() {
    return Obx(
      () => Row(
        children: [
          Expanded(child: _TabItem(label: 'All', icon: null, isActive: controller.selectedTabIndex.value == 0, onTap: () => controller.selectTab(0))),
          Expanded(child: _TabItem(label: 'Alerts', icon: Icons.warning_amber_rounded, isActive: controller.selectedTabIndex.value == 1, onTap: () => controller.selectTab(1))),
          Expanded(child: _TabItem(label: 'Updates', icon: Icons.campaign_outlined, isActive: controller.selectedTabIndex.value == 2, onTap: () => controller.selectTab(2))),
          Expanded(child: _TabItem(label: 'System', icon: Icons.settings_outlined, isActive: controller.selectedTabIndex.value == 3, onTap: () => controller.selectTab(3))),
        ],
      ),
    );
  }

  // ---------------- Notifications list ----------------
  Widget _buildNotificationsList() {
    return Obx(() {
      final items = controller.filteredNotifications;
      if (items.isEmpty) {
        return ListView(
          children: const [
            SizedBox(height: 60),
            Center(child: Text('No notifications', style: TextStyle(color: Colors.white38, fontSize: 13))),
          ],
        );
      }
      return ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final notification = items[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _NotificationCard(
              notification: notification,
              onTap: () => controller.onNotificationTap(notification),
            ),
          );
        },
      );
    });
  }

  // ---------------- Push notification banner (footer) ----------------
  Widget _buildPushBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: kCardBg,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Row(
        children: [
          const Icon(Icons.notifications_none_rounded, color: kPurple, size: 20),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Enable push notifications to never miss important updates.',
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            // onTap: controller.onManagePushSettings,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: kPurple.withOpacity(0.6)),
              ),
              child: const Text('Manage', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Tab item (icon optional — "All" has no icon)
// =====================================================================
class _TabItem extends StatelessWidget {
  final String label;
  final IconData? icon;
  final bool isActive;
  final VoidCallback onTap;

  const _TabItem({required this.label, required this.icon, required this.isActive, required this.onTap});

  static const Color kPurple = NotificationsDriverView.kPurple;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Column(
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 15, color: isActive ? kPurple : Colors.white38),
                  const SizedBox(height: 3),
                ],
                Text(
                  label,
                  style: TextStyle(
                    color: isActive ? (icon == null ? kPurple : Colors.white) : Colors.white38,
                    fontSize: 12,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            height: 2.5,
            width: double.infinity,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: isActive ? kPurple : Colors.transparent,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Notification card
// =====================================================================
class _NotificationCard extends StatelessWidget {
  final DriverNotification notification;
  final VoidCallback onTap;

  const _NotificationCard({required this.notification, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = notification.category.color;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: NotificationsDriverView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: NotificationsDriverView.kBorder),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                  child: Icon(notification.icon, color: color, size: 18),
                ),
                if (!notification.isRead)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      width: 9,
                      height: 9,
                      decoration: BoxDecoration(
                        color: NotificationsDriverView.kPurple,
                        shape: BoxShape.circle,
                        border: Border.all(color: NotificationsDriverView.kCardBg, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(notification.timeAgo, style: const TextStyle(color: Colors.white38, fontSize: 10)),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(notification.message, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      notification.category.label,
                      style: TextStyle(color: color, fontSize: 9.5, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
