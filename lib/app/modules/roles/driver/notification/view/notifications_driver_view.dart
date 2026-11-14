import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/notifications_driver_controller.dart';
import '../model/driver_notification_model.dart';

class NotificationsDriverView extends GetView<NotificationsDriverController> {
  const NotificationsDriverView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Column(
                children: [
                  _buildHeader(),
                  const SizedBox(height: 12),
                  _buildSearchBar(),
                  const SizedBox(height: 12),
                  _buildFilterTabs(),
                  const SizedBox(height: 8),
                ],
              ),
            ),
            Expanded(
              child: Obx(
                () => controller.isLoading.value && controller.allNotifications.isEmpty
                    ? const Center(
                        child: CircularProgressIndicator(color: AppTheme.gradientBlue),
                      )
                    : RefreshIndicator(
                        color: AppTheme.gradientBlue,
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
          child: Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorder),
            ),
            child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'notifications'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Obx(() {
                  //   final unread = controller.unreadCount;
                  //   if (unread <= 0) return const SizedBox.shrink();
                  //   return Container(
                  //     padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  //     decoration: BoxDecoration(
                  //       gradient: AppTheme.primaryGradient,
                  //       borderRadius: BorderRadius.circular(10),
                  //     ),
                  //     child: Text(
                  //       '$unread ${'new_badge'.tr}',
                  //       style: const TextStyle(
                  //         color: Colors.white,
                  //         fontSize: 10,
                  //         fontWeight: FontWeight.bold,
                  //       ),
                  //     ),
                  //   );
                  // }),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                'stay_updated_alerts_sub'.tr,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        Obx(() {
          final unread = controller.unreadCount;
          if (unread > 0) {
            return GestureDetector(
              onTap: controller.markAllAsRead,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.done_all_rounded, color: Colors.white, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'mark_all_read'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }
          return GestureDetector(
            onTap: controller.confirmClearAll,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: kBorder),
              ),
              child: const Icon(Icons.delete_sweep_outlined, color: Colors.white60, size: 18),
            ),
          );
        }),
      ],
    );
  }

  // ---------------- Search bar ----------------
  Widget _buildSearchBar() {
    return Container(
      height: 42,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        controller: controller.searchController,
        onChanged: controller.onSearchChanged,
        style: const TextStyle(color: Colors.white, fontSize: 12.5),
        decoration: InputDecoration(
          hintText: 'search_alerts'.tr,
          hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
          prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 18),
          suffixIcon: Obx(() {
            if (controller.searchQuery.value.isEmpty) return const SizedBox.shrink();
            return GestureDetector(
              onTap: controller.clearSearch,
              child: const Icon(Icons.close, color: Colors.white54, size: 16),
            );
          }),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 10),
        ),
      ),
    );
  }

  // ---------------- Filter tabs (All, Unread, Critical, Warning, Info) with AppTheme.primaryGradient ----------------
  Widget _buildFilterTabs() {
    return Obx(() {
      final active = controller.activeTab.value;
      final tabs = [
        {'id': 'All', 'label': '${'all_tab'.tr} (${controller.countAll})'},
        {'id': 'Unread', 'label': '${'unread'.tr} (${controller.countUnread})'},
        {'id': 'Critical', 'label': '${'critical_alert'.tr} (${controller.countCritical})'},
        {'id': 'Warning', 'label': '${'warning_alert'.tr} (${controller.countWarning})'},
        {'id': 'Info', 'label': '${'info_alert'.tr} (${controller.countInfo})'},
      ];

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: tabs.map((tab) {
            final isSelected = active == tab['id'];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () => controller.selectTab(tab['id']!),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : kCardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: isSelected ? null : Border.all(color: Colors.white.withValues(alpha: 0.08)),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientBlue.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Text(
                    tab['label']!,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white60,
                      fontSize: 11.5,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  // ---------------- Notifications list ----------------
  Widget _buildNotificationsList() {
    return Obx(() {
      final items = controller.filteredNotifications;
      if (items.isEmpty) {
        return ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            const SizedBox(height: 70),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: kCardBg,
                      shape: BoxShape.circle,
                      border: Border.all(color: kBorder),
                    ),
                    child: const Icon(Icons.notifications_off_outlined, color: Colors.white38, size: 28),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'no_notifications_found'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      controller.searchQuery.value.isNotEmpty
                          ? 'no_alerts_matched'.tr
                          : 'inbox_clean_sub'.tr,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white38, fontSize: 11.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      }

      return ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final notification = items[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _NotificationCard(
              notification: notification,
              onTap: () => controller.onNotificationTap(notification),
              onMarkRead: () => controller.markAsRead(notification),
              onDelete: () => controller.deleteNotification(notification),
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
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06))),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'enable_push_notifications_sub'.tr,
              style: const TextStyle(color: Colors.white70, fontSize: 11),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: controller.onManagePushSettings,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'manage_btn'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Notification Card with AppTheme.primaryGradient Action Button
// =====================================================================
class _NotificationCard extends StatelessWidget {
  final DriverNotification notification;
  final VoidCallback onTap;
  final VoidCallback onMarkRead;
  final VoidCallback onDelete;

  const _NotificationCard({
    required this.notification,
    required this.onTap,
    required this.onMarkRead,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final isUnread = !notification.isRead.value;

      return GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: NotificationsDriverView.kCardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isUnread
                  ? AppTheme.gradientBlue.withValues(alpha: 0.35)
                  : NotificationsDriverView.kBorder,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Leading Icon with severity styling and unread indicator dot
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: notification.severityBgColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      notification.icon,
                      color: notification.severityColor,
                      size: 19,
                    ),
                  ),
                  if (isUnread)
                    Positioned(
                      top: -2,
                      right: -2,
                      child: Container(
                        width: 9,
                        height: 9,
                        decoration: BoxDecoration(
                          color: AppTheme.gradientPink,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: NotificationsDriverView.kCardBg,
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              // Body Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header: Title + Severity badge + TimeAgo
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: isUnread ? FontWeight.w800 : FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        _buildSeverityBadge(),
                      ],
                    ),
                    const SizedBox(height: 3),
                    // Message
                    Text(
                      notification.message,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11.5,
                        height: 1.35,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    // Action Footer Row: "Tap to view" button with AppTheme.primaryGradient + Time + Icons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Dynamic Tap-to-Navigate Button with AppTheme.primaryGradient
                        GestureDetector(
                          onTap: onTap,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4.5),
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  notification.actionButtonText,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.arrow_forward_rounded,
                                  color: Colors.white,
                                  size: 11,
                                ),
                              ],
                            ),
                          ),
                        ),
                        Row(
                          children: [
                            Text(
                              notification.timeAgo,
                              style: const TextStyle(
                                color: Colors.white38,
                                fontSize: 10,
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (isUnread)
                              GestureDetector(
                                onTap: onMarkRead,
                                child: Container(
                                  padding: const EdgeInsets.all(3),
                                  child: const Icon(
                                    Icons.done_rounded,
                                    color: Color(0xFF2ECC71),
                                    size: 16,
                                  ),
                                ),
                              ),
                            const SizedBox(width: 4),
                            GestureDetector(
                              onTap: onDelete,
                              child: Container(
                                padding: const EdgeInsets.all(3),
                                child: const Icon(
                                  Icons.close_rounded,
                                  color: Colors.white38,
                                  size: 16,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildSeverityBadge() {
    final sev = notification.severity.toLowerCase();
    Color bg;
    Color fg;
    String label;

    if (sev == 'critical' || sev == 'danger' || sev == 'error' || sev == 'emergency') {
      bg = const Color(0xFFFF5252).withValues(alpha: 0.15);
      fg = const Color(0xFFFF5252);
      label = 'critical_alert'.tr;
    } else if (sev == 'warning' || sev == 'warn') {
      bg = const Color(0xFFFFA726).withValues(alpha: 0.15);
      fg = const Color(0xFFFFA726);
      label = 'warning_alert'.tr;
    } else {
      bg = const Color(0xFF3F7BF5).withValues(alpha: 0.15);
      fg = const Color(0xFF3F7BF5);
      label = 'info_alert'.tr;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fg,
          fontSize: 9.5,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
