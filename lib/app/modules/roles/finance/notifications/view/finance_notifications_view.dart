 import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../controller/finance_notifications_controller.dart';
import '../model/notification_model.dart';

class FinanceNotificationsView extends GetView<FinanceNotificationsController> {
  const FinanceNotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header / App Bar
            _buildHeader(),

            // Tab Bar
            _buildTabBarSection(),

            // Filter row (dropdown + filter button)
            _buildFilterRowSection(),

            // Notifications List
            Expanded(
              child: Obx(() {
                if (controller.groupedNotifications.isEmpty) {
                  return _buildEmptyState();
                }
                return _buildNotificationsList();
              }),
            ),

            // Bottom Settings Banner
            _buildBottomSettingsBanner(),
          ],
        ),
      ),
    );
  }

  // Header section
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Notifications',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Stay updated with important\nfinance activities',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
          ),
          InkWell(
            onTap: () => controller.markAllAsRead(),
            child: const Row(
              children: [
                Icon(Icons.mail_sharp, color: Color(0xFFA855F7), size: 14),
                SizedBox(width: 4),
                Text(
                  'Mark all as read',
                  style: TextStyle(
                    color: Color(0xFFA855F7),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Tab Bar Section (with dynamic counts)
  Widget _buildTabBarSection() {
    return Obx(() {
      return Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
        ),
        child: TabBar(
          controller: controller.tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          dividerColor: Colors.transparent,
          indicatorColor: const Color(0xFFA855F7),
          labelColor: const Color(0xFFA855F7),
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          unselectedLabelStyle: const TextStyle(fontSize: 12),
          tabs: [
            Tab(text: 'All (${controller.getCountForAll()})'),
            Tab(text: 'Unread (${controller.getCountForUnread()})'),
            Tab(text: 'Invoices (${controller.getCountForInvoices()})'),
            Tab(text: 'Payments (${controller.getCountForPayments()})'),
            Tab(text: 'Subscriptions (${controller.getCountForSubscriptions()})'),
          ],
        ),
      );
    });
  }

  // Dropdown + Filter Button
  Widget _buildFilterRowSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Filter Type Dropdown
          InkWell(
            onTap: () => controller.filterDropdownTapped(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Row(
                children: [
                  Obx(() => Text(
                        controller.selectedTypeFilter.value,
                        style: const TextStyle(color: Colors.white, fontSize: 11),
                      )),
                  const SizedBox(width: 8),
                  const Icon(Icons.keyboard_arrow_down, size: 14, color: AppColors.textSecondary),
                ],
              ),
            ),
          ),
          // Filter Button
          InkWell(
            onTap: () => controller.showFilterWizard(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF10121A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: const Row(
                children: [
                  Icon(Icons.filter_list, size: 12, color: Color(0xFFA855F7)),
                  SizedBox(width: 6),
                  Text(
                    'Filter',
                    style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Notifications List grouped by day
  Widget _buildNotificationsList() {
    final groups = controller.groupedNotifications.keys.toList();
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: groups.length,
      itemBuilder: (context, index) {
        final groupTitle = groups[index];
        final list = controller.groupedNotifications[groupTitle] ?? [];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 14, bottom: 8),
              child: Text(
                groupTitle,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: list.length,
                separatorBuilder: (context, idx) => const Divider(color: AppColors.cardBorder, height: 1),
                itemBuilder: (context, idx) {
                  final item = list[idx];
                  return _buildNotificationItem(item);
                },
              ),
            ),
          ],
        );
      },
    );
  }

  // Individual Notification Row Card
  Widget _buildNotificationItem(FinanceNotificationModel item) {
    return Obx(() {
      return InkWell(
        onTap: () => controller.markAsRead(item.id),
        child: Container(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon block
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: item.iconBgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(item.icon, color: item.iconColor, size: 18),
              ),
              const SizedBox(width: 12),
              // Text Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.description,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 10,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Time & Unread dot
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    item.time,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                  ),
                  const SizedBox(height: 10),
                  if (item.isUnread.value)
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFFA855F7), // Purple unread dot
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      );
    });
  }

  // Empty State Widget
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_none, size: 48, color: AppColors.textMuted.withOpacity(0.5)),
          const SizedBox(height: 12),
          const Text(
            'No notifications found',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'We will notify you when there are new finance updates.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
        ],
      ),
    );
  }

  // Bottom settings link banner
  Widget _buildBottomSettingsBanner() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF10121A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFFA855F7).withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.notifications_outlined, size: 18, color: Color(0xFFA855F7)),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Customize your notifications',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Manage how and when you receive notifications.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          TextButton(
            onPressed: () => controller.goToSettings(),
            child: const Row(
              children: [
                Text(
                  'Go to Settings',
                  style: TextStyle(color: Color(0xFFA855F7), fontSize: 10, fontWeight: FontWeight.bold),
                ),
                Icon(Icons.chevron_right, size: 14, color: Color(0xFFA855F7)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
