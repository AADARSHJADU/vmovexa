import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/notifications_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../auth/login/controllers/login_controller.dart';

class NotificationsView extends GetView<NotificationsController> {
  const NotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<NotificationsController>() 
        ? Get.find<NotificationsController>() 
        : Get.put(NotificationsController());

    final isAdvertiser = LoginController.currentRole == 'Advertisement';
    final isGovernment = LoginController.currentRole == 'Government';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const CustomBackButton(),
                  const Text(
                    'Notifications',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Row(
                    children: [
                      TextButton(
                        onPressed: c.markAllAsRead,
                        child: const Text(
                          'Mark all as read',
                          style: TextStyle(color: AppColors.textLink, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.settings_outlined, color: Colors.white, size: 18),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Filters Row capsules
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: SizedBox(
                height: 38,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  children: isAdvertiser 
                      ? [
                          _buildFilterCapsule(c, 'All', '${c.notifications.length}'),
                          const SizedBox(width: 10),
                          _buildFilterCapsule(c, 'Campaigns', '${c.notifications.where((n) => n.type == 'Campaigns').length}'),
                          const SizedBox(width: 10),
                          _buildFilterCapsule(c, 'Payments', '${c.notifications.where((n) => n.type == 'Payments').length}'),
                          const SizedBox(width: 10),
                          _buildFilterCapsule(c, 'System', '${c.notifications.where((n) => n.type == 'System').length}'),
                        ]
                      : isGovernment
                          ? [
                              _buildFilterCapsule(c, 'All', '${c.notifications.length}'),
                              const SizedBox(width: 10),
                              _buildFilterCapsule(c, 'Alerts', '${c.notifications.where((n) => n.type == 'Alerts').length}'),
                              const SizedBox(width: 10),
                              _buildFilterCapsule(c, 'Updates', '${c.notifications.where((n) => n.type == 'Updates').length}'),
                              const SizedBox(width: 10),
                              _buildFilterCapsule(c, 'Reports', '${c.notifications.where((n) => n.type == 'Reports').length}'),
                              const SizedBox(width: 10),
                              _buildFilterCapsule(c, 'System', '${c.notifications.where((n) => n.type == 'System').length}'),
                            ]
                          : [
                              _buildFilterCapsule(c, 'All', '${c.notifications.length}'),
                              const SizedBox(width: 10),
                              _buildFilterCapsule(c, 'Alerts', '${c.notifications.where((n) => n.type == 'Alerts').length}'),
                              const SizedBox(width: 10),
                              _buildFilterCapsule(c, 'Maintenance', '${c.notifications.where((n) => n.type == 'Maintenance').length}'),
                              const SizedBox(width: 10),
                              _buildFilterCapsule(c, 'Trips', '${c.notifications.where((n) => n.type == 'Trips').length}'),
                            ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Notification Groups
            Expanded(
              child: Obx(
                () {
                  final all = c.filteredNotifications;

                  // Define groupings dynamically based on time string prefixes
                  final todayList = all.where((n) => n.time.startsWith('Today') || (!n.time.contains(',') && !n.time.contains('Yesterday') && !n.time.contains('Week') && !n.time.contains('Earlier'))).toList();
                  final yesterdayList = all.where((n) => n.time.startsWith('Yesterday') || n.time.contains('Yesterday')).toList();
                  final thisWeekList = all.where((n) => n.time.startsWith('This Week')).toList();
                  final earlierList = all.where((n) => n.time.startsWith('Earlier')).toList();

                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    physics: const BouncingScrollPhysics(),
                    children: [
                      // Today Group
                      if (todayList.isNotEmpty || (!isAdvertiser && yesterdayList.isEmpty)) ...[
                        _buildGroupHeader('Today', todayList),
                        const SizedBox(height: 10),
                        ...todayList.map((n) => _buildNotificationCard(n)),
                        const SizedBox(height: 16),
                      ],

                      // Yesterday Group
                      if (yesterdayList.isNotEmpty) ...[
                        _buildGroupHeader('Yesterday', yesterdayList),
                        const SizedBox(height: 10),
                        ...yesterdayList.map((n) => _buildNotificationCard(n)),
                        const SizedBox(height: 16),
                      ],

                      // This Week Group
                      if (thisWeekList.isNotEmpty) ...[
                        _buildGroupHeader('This Week', thisWeekList),
                        const SizedBox(height: 10),
                        ...thisWeekList.map((n) => _buildNotificationCard(n)),
                        const SizedBox(height: 16),
                      ],

                      // Earlier Group
                      if (earlierList.isNotEmpty) ...[
                        _buildGroupHeader('Earlier', earlierList),
                        const SizedBox(height: 10),
                        ...earlierList.map((n) => _buildNotificationCard(n)),
                        const SizedBox(height: 20),
                      ],
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGroupHeader(String title, List<AppNotification> items) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
        ),
        Text(
          '${items.where((n) => n.isUnread.value).length} Unread',
          style: const TextStyle(color: AppColors.textLink, fontSize: 10.5, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildFilterCapsule(NotificationsController c, String filterName, String count) {
    return Obx(
      () {
        bool isSelected = c.activeFilter.value == filterName;
        return GestureDetector(
          onTap: () => c.activeFilter.value = filterName,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF6366F1).withOpacity(0.12) : AppColors.cardBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                width: 1.2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  filterName,
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                    fontSize: 11.5,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF3B82F6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    count,
                    style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildNotificationCard(AppNotification n) {
    IconData cardIcon;
    Color iconColor;

    // Check titles for Advertiser specifics
    if (n.title.contains('Approved')) {
      cardIcon = Icons.check_circle_outline_rounded;
      iconColor = const Color(0xFF10B981);
    } else if (n.title.contains('Live')) {
      cardIcon = Icons.play_arrow_rounded;
      iconColor = const Color(0xFF8B5CF6);
    } else if (n.title.contains('Successful')) {
      cardIcon = Icons.wallet_giftcard_rounded;
      iconColor = const Color(0xFFF59E0B);
    } else if (n.title.contains('Invoice')) {
      cardIcon = Icons.description_outlined;
      iconColor = const Color(0xFF3B82F6);
    } else if (n.title.contains('Budget')) {
      cardIcon = Icons.notifications_active_outlined;
      iconColor = const Color(0xFFF59E0B);
    } else if (n.title.contains('Report')) {
      cardIcon = Icons.bar_chart_rounded;
      iconColor = const Color(0xFF8B5CF6);
    } else if (n.title.contains('Completed')) {
      cardIcon = Icons.outlined_flag_rounded;
      iconColor = const Color(0xFFEF4444);
    } else if (LoginController.currentRole == 'Government') {
      switch (n.type) {
        case 'Alerts':
          cardIcon = Icons.warning_rounded;
          iconColor = const Color(0xFFEF4444);
          break;
        case 'Updates':
          cardIcon = Icons.trending_up_rounded;
          iconColor = const Color(0xFF10B981);
          break;
        case 'Reports':
          cardIcon = Icons.description_outlined;
          iconColor = const Color(0xFF3B82F6);
          break;
        case 'System':
          cardIcon = Icons.settings_outlined;
          iconColor = const Color(0xFF64748B);
          break;
        default:
          cardIcon = Icons.notifications_none_rounded;
          iconColor = Colors.grey;
      }
    } else {
      // Fleet Operator default fallback
      switch (n.type) {
        case 'Maintenance':
          cardIcon = Icons.build_outlined;
          iconColor = const Color(0xFF8B5CF6);
          break;
        case 'Trips':
          cardIcon = Icons.directions_bus_rounded;
          iconColor = const Color(0xFF3B82F6);
          break;
        case 'Alerts':
          cardIcon = Icons.warning_amber_rounded;
          iconColor = Colors.orangeAccent;
          break;
        default:
          cardIcon = Icons.notifications_none_rounded;
          iconColor = Colors.grey;
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Unread indicator dot
          Obx(
            () => Container(
              width: 6,
              height: 6,
              margin: const EdgeInsets.only(top: 14, right: 10),
              decoration: BoxDecoration(
                color: n.isUnread.value ? const Color(0xFF3B82F6) : Colors.transparent,
                shape: BoxShape.circle,
              ),
            ),
          ),

          // Icon background box
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(cardIcon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 14),

          // Notification Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        n.title,
                        style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      n.time.contains(',') ? n.time.split(',').last.trim() : n.time,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  n.body,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, height: 1.3),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
        ],
      ),
    );
  }
}
