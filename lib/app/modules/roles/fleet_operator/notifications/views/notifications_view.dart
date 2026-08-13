import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/notifications_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class NotificationsView extends GetView<NotificationsController> {
  const NotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    // Auto-create controller if not already present in the Get tree (e.g., when routing directly)
    final c = Get.isRegistered<NotificationsController>() 
        ? Get.find<NotificationsController>() 
        : Get.put(NotificationsController());

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
                  TextButton(
                    onPressed: c.markAllAsRead,
                    child: const Text(
                      'Mark all as read',
                      style: TextStyle(color: AppColors.textLink, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
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
                  children: [
                    _buildFilterCapsule(c, 'All', '12'),
                    const SizedBox(width: 10),
                    _buildFilterCapsule(c, 'Alerts', '4'),
                    const SizedBox(width: 10),
                    _buildFilterCapsule(c, 'Maintenance', '5'),
                    const SizedBox(width: 10),
                    _buildFilterCapsule(c, 'Trips', '3'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Notification Groups
            Expanded(
              child: Obx(
                () {
                  final todayList = c.filteredNotifications.where((n) => !n.time.contains('Yesterday')).toList();
                  final yesterdayList = c.filteredNotifications.where((n) => n.time.contains('Yesterday')).toList();

                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    physics: const BouncingScrollPhysics(),
                    children: [
                      // Today Section Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Today',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${todayList.where((n) => n.isUnread.value).length} Unread',
                            style: const TextStyle(color: AppColors.textLink, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Today Cards List
                      if (todayList.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Center(child: Text('No notifications today', style: TextStyle(color: AppColors.textMuted, fontSize: 12))),
                        )
                      else
                        ...todayList.map((n) => _buildNotificationCard(n)),

                      const SizedBox(height: 16),

                      // Yesterday Section Header (Collapsible)
                      GestureDetector(
                        onTap: c.toggleYesterdayExpanded,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          color: Colors.transparent,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Yesterday',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              Row(
                                children: [
                                  Text(
                                    '${yesterdayList.where((n) => n.isUnread.value).length}',
                                    style: const TextStyle(color: AppColors.textLink, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(
                                    c.yesterdayExpanded.value ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                                    color: AppColors.textMuted,
                                    size: 16,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Yesterday Cards List
                      if (c.yesterdayExpanded.value)
                        if (yesterdayList.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Center(child: Text('No historical notifications', style: TextStyle(color: AppColors.textMuted, fontSize: 12))),
                          )
                        else
                          ...yesterdayList.map((n) => _buildNotificationCard(n)),

                      const SizedBox(height: 20),
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
                    fontSize: 12,
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
                    style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
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
          // Unread Blue dot indicator
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

          // Icon
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(cardIcon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 14),

          // Message content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      n.title,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      n.time,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  n.body,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.3),
                ),
                const SizedBox(height: 10),
                // Status Category Capsule
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    n.type,
                    style: TextStyle(color: iconColor, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
        ],
      ),
    );
  }
}
