import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/advertiser_notifications_controller.dart';

class AdvertiserNotificationsView extends GetView<AdvertiserNotificationsController> {
  const AdvertiserNotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            _buildTopBar(context),
            const Divider(color: Color(0xFF1E293B), height: 1),

            // Content
            Expanded(
              child: RefreshIndicator(
                onRefresh: controller.loadNotifications,
                color: const Color(0xFF2563EB),
                backgroundColor: AppColors.cardBg,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Control Bar: Filter Tabs & Search
                      _buildControlBar(),
                      const SizedBox(height: 16),

                      // Notification List / Empty State
                      Obx(() {
                        if (controller.isLoading.value) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 40),
                            child: Center(
                              child: CircularProgressIndicator(color: Color(0xFF2563EB)),
                            ),
                          );
                        }

                        final items = controller.paginatedNotifications;
                        if (items.isEmpty) {
                          return _buildEmptyState();
                        }

                        return Column(
                          children: [
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: items.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 10),
                              itemBuilder: (ctx, i) {
                                return _buildNotificationCard(items[i]);
                              },
                            ),
                            const SizedBox(height: 16),

                            // Pagination Controls
                            _buildPaginationBar(),
                          ],
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // TOP BAR
  // ==========================================================
  Widget _buildTopBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const CustomBackButton(),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'Notifications & Alerts',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    // const SizedBox(width: 8),
                    // Obx(() {
                    //   final unread = controller.unreadCount;
                    //   if (unread == 0) return const SizedBox.shrink();
                    //   return Container(
                    //     padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    //     decoration: BoxDecoration(
                    //       color: const Color(0xFF1D4ED8).withValues(alpha: 0.25),
                    //       borderRadius: BorderRadius.circular(12),
                    //       border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5)),
                    //     ),
                    //     child: Text(
                    //       '$unread New',
                    //       style: const TextStyle(
                    //         color: Color(0xFF93C5FD),
                    //         fontSize: 10,
                    //         fontWeight: FontWeight.bold,
                    //       ),
                    //     ),
                    //   );
                    // }),
                  ],
                ),
                const SizedBox(height: 2),
                const Text(
                  'Campaign approvals, live telemetry & billing',
                  style: TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),

          // Actions: Preferences & Mark All Read
          Row(
            children: [
              // IconButton(
              //   icon: const Icon(Icons.tune_rounded, color: Colors.white70, size: 20),
              //   tooltip: 'Notification Preferences',
              //   onPressed: () => Get.toNamed(Routes.ADVERTISER_NOTIFICATION_SETTINGS),
              // ),
              Obx(() {
                if (controller.unreadCount == 0) return const SizedBox.shrink();
                return IconButton(
                  icon: const Icon(Icons.done_all_rounded, color: Color(0xFF60A5FA), size: 20),
                  tooltip: 'Mark All Read',
                  onPressed: controller.markAllAsRead,
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // CONTROL BAR: TABS & SEARCH
  // ==========================================================
  Widget _buildControlBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          // Filter Tabs (Horizontal Scrollable)
          Obx(() {
            final active = controller.activeTab.value;
            final tabs = [
              {'label': 'All', 'count': controller.allCount},
              {'label': 'Campaigns', 'count': controller.campaignsCount},
              {'label': 'Payments', 'count': controller.paymentsCount},
              {'label': 'System', 'count': controller.systemCount},
            ];

            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: tabs.map((tab) {
                  final label = tab['label'] as String;
                  final count = tab['count'] as int;
                  final isSelected = active == label;

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => controller.setTab(label),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                          gradient: isSelected ? AppTheme.primaryGradient : null,
                          color: isSelected ? null : const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? Colors.transparent : const Color(0xFF334155),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              label,
                              style: TextStyle(
                                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                                fontSize: 11.5,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? Colors.white.withValues(alpha: 0.25)
                                    : const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '$count',
                                style: TextStyle(
                                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            );
          }),

          const SizedBox(height: 12),

          // Search Field
          Container(
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                const SizedBox(width: 10),
                const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    onChanged: controller.onSearchChanged,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: const InputDecoration(
                      hintText: 'Search campaign, invoice, or playback alerts...',
                      hintStyle: TextStyle(color: Color(0xFF475569), fontSize: 11.5),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                Obx(() {
                  if (controller.searchQuery.value.isEmpty) return const SizedBox.shrink();
                  return IconButton(
                    icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B), size: 16),
                    onPressed: controller.clearSearch,
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // NOTIFICATION CARD
  // ==========================================================
  Widget _buildNotificationCard(AdvertiserNotificationItem item) {
    final iconConfig = _getIconConfig(item.icon);

    return Obx(() {
      final isRead = item.isRead.value;

      return Container(
        decoration: BoxDecoration(
          color: isRead ? AppColors.cardBg : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isRead ? AppColors.cardBorder : const Color(0xFF2563EB).withValues(alpha: 0.35),
            width: isRead ? 1.0 : 1.2,
          ),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => controller.markAsRead(item),
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type Icon
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: iconConfig.color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: iconConfig.color.withValues(alpha: 0.3)),
                    ),
                    child: Icon(iconConfig.icon, color: iconConfig.color, size: 18),
                  ),
                  const SizedBox(width: 12),

                  // Message Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                item.title,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            // Category Tag
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFF334155)),
                              ),
                              child: Text(
                                item.category,
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                            if (!isRead) ...[
                              const SizedBox(width: 6),
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF3B82F6),
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.desc,
                          style: const TextStyle(
                            color: Color(0xFFCBD5E1),
                            fontSize: 11.5,
                            height: 1.35,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item.time,
                              style: const TextStyle(
                                color: Color(0xFF64748B),
                                fontSize: 10,
                                fontFamily: 'monospace',
                              ),
                            ),
                            Row(
                              children: [
                                if (!isRead)
                                  InkWell(
                                    onTap: () => controller.markAsRead(item),
                                    borderRadius: BorderRadius.circular(6),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      child: Row(
                                        children: [
                                          Icon(Icons.check_rounded, color: Color(0xFF10B981), size: 14),
                                          SizedBox(width: 2),
                                          Text('Read', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                    ),
                                  ),
                                const SizedBox(width: 8),
                                InkWell(
                                  onTap: () => controller.deleteItem(item),
                                  borderRadius: BorderRadius.circular(6),
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                    child: Icon(Icons.close_rounded, color: Color(0xFF64748B), size: 14),
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
          ),
        ),
      );
    });
  }

  // ==========================================================
  // PAGINATION BAR
  // ==========================================================
  Widget _buildPaginationBar() {
    return Obx(() {
      final current = controller.currentPage.value;
      final total = controller.totalPages;
      final totalFiltered = controller.filteredNotifications.length;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Showing ${controller.paginatedNotifications.length} of $totalFiltered alerts',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left_rounded, size: 20),
                  color: current > 1 ? Colors.white : const Color(0xFF475569),
                  onPressed: current > 1 ? controller.prevPage : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 8),
                Text(
                  '$current / $total',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.chevron_right_rounded, size: 20),
                  color: current < total ? Colors.white : const Color(0xFF475569),
                  onPressed: current < total ? controller.nextPage : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  // ==========================================================
  // EMPTY STATE
  // ==========================================================
  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: const Icon(Icons.notifications_none_rounded, color: Color(0xFF64748B), size: 28),
          ),
          const SizedBox(height: 14),
          const Text(
            'No notifications yet',
            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Obx(() {
            final q = controller.searchQuery.value;
            return Text(
              q.isNotEmpty
                  ? 'No alerts match your search query "$q".'
                  : "You're all caught up. Campaign, payment, and system alerts will show up here.",
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5, height: 1.4),
            );
          }),
        ],
      ),
    );
  }

  _NotificationIconConfig _getIconConfig(String icon) {
    switch (icon) {
      case 'check':
        return _NotificationIconConfig(Icons.check_circle_outline_rounded, const Color(0xFF10B981));
      case 'live':
        return _NotificationIconConfig(Icons.rocket_launch_rounded, const Color(0xFF6366F1));
      case 'payment':
        return _NotificationIconConfig(Icons.credit_card_rounded, const Color(0xFFF59E0B));
      case 'invoice':
        return _NotificationIconConfig(Icons.receipt_long_rounded, const Color(0xFF3B82F6));
      case 'report':
        return _NotificationIconConfig(Icons.bar_chart_rounded, const Color(0xFFA855F7));
      case 'complete':
        return _NotificationIconConfig(Icons.task_alt_rounded, const Color(0xFF14B8A6));
      case 'alert':
      default:
        return _NotificationIconConfig(Icons.warning_amber_rounded, const Color(0xFFF43F5E));
    }
  }
}

class _NotificationIconConfig {
  final IconData icon;
  final Color color;

  _NotificationIconConfig(this.icon, this.color);
}

