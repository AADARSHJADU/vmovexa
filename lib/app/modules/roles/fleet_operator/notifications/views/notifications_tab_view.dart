import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/notifications_controller.dart';
import '../../../../../theme/app_colors.dart';

class NotificationsTabView extends StatelessWidget {
  const NotificationsTabView({super.key});

  @override
  Widget build(BuildContext context) {
    // Auto-create controller if not already present in the Get tree
    final c = Get.isRegistered<NotificationsController>() 
        ? Get.find<NotificationsController>() 
        : Get.put(NotificationsController());

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          // Top Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
                  onPressed: () {},
                ),
                const Text(
                  'Notifications',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 24),
                  onPressed: () {},
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
                  _buildTabCapsule(c, 'All', '5', const Color(0xFF3B82F6)),
                  const SizedBox(width: 10),
                  _buildTabCapsule(c, 'Alerts', '3', Colors.redAccent),
                  const SizedBox(width: 10),
                  _buildTabCapsule(c, 'System', '1', const Color(0xFF3B82F6)),
                  const SizedBox(width: 10),
                  _buildTabCapsule(c, 'Updates', '1', const Color(0xFF8B5CF6)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Notifications List
          Expanded(
            child: Obx(
              () {
                // Return subset of notifications to match Tab counts (5 items)
                final list = c.notifications.take(5).toList();

                return ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  physics: const BouncingScrollPhysics(),
                  children: [
                    ...list.map((n) => _buildTabNotificationCard(n)),
                    const SizedBox(height: 24),
                    const Center(
                      child: Text(
                        'No more notifications',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabCapsule(NotificationsController c, String filterName, String count, Color accentColor) {
    bool isSelected = c.activeFilter.value == filterName;
    return GestureDetector(
      onTap: () => c.activeFilter.value = filterName,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? accentColor.withOpacity(0.12) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? accentColor : AppColors.cardBorder,
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
                color: accentColor,
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
  }

  Widget _buildTabNotificationCard(AppNotification n) {
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

    // Specific custom status for Over Speeding
    if (n.title.contains('Overspeed')) {
      iconColor = Colors.redAccent;
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
          // Dot Indicator
          Container(
            width: 6,
            height: 6,
            margin: const EdgeInsets.only(top: 14, right: 10),
            decoration: BoxDecoration(
              color: iconColor,
              shape: BoxShape.circle,
            ),
          ),

          // Icon box
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(cardIcon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 14),

          // Message details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  n.title.contains('Overspeed') ? 'Over Speeding' : n.title,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  n.body,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.3),
                ),
                const SizedBox(height: 8),
                Text(
                  n.time,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
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
