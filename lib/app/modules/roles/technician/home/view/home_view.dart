import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/home_controller.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  static const Color kBg = Color(0xFF0A0C14);
  static const Color kCardBg = Color(0xFF111827);
  static const Color kCardBorder = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value &&
              controller.todaysWorkOrders.isEmpty &&
              controller.totalDevicesCount.value == 0) {
            return const Center(
              child: CircularProgressIndicator(color: AppTheme.gradientBlue),
            );
          }

          return RefreshIndicator(
            color: AppTheme.gradientBlue,
            backgroundColor: const Color(0xFF1E293B),
            onRefresh: controller.onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                const SizedBox(height: 10),
                _buildTopBar(context),
                const SizedBox(height: 14),

                // 1. Technician Profile Banner with TOP Rating Pill
                _buildProfileBanner(),
                const SizedBox(height: 18),

                // 2. 5 Clean KPI Metrics Cards (Rating, Offline, Online, Faults, Total)
                _buildKpiMetricsGrid(),
                const SizedBox(height: 22),

                // 3. Today's Assigned Tasks (Urgent Work Orders)
                _buildTodaysWorkOrdersSection(context),
                const SizedBox(height: 22),

                // 4. Technician Rating & Client Reviews Section (Matching Admin Panel)
                _buildRatingAndReviewsSection(),
                const SizedBox(height: 22),

                // 5. Quick Actions Grid (6 Field Consoles)
                _buildQuickActionsHeader(),
                const SizedBox(height: 10),
                _buildQuickActionsGrid(),
                const SizedBox(height: 30),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- Top App Bar (Hamburger, Logo, Notification) ----------------
  Widget _buildTopBar(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        IconButton(
          onPressed: controller.openDrawer,
          icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/app_logo/newLogo.png', width: 140, height: 38),
          ],
        ),
        Obx(() {
          final count = controller.unreadNotificationCount.value;
          return Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                onPressed: controller.goToNotifications,
                icon: const Icon(Icons.notifications_none_rounded, color: Colors.white70, size: 24),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              if (count > 0)
                Positioned(
                  top: -6,
                  right: -6,
                  child: IgnorePointer(
                    child: Container(
                      constraints: const BoxConstraints(
                        minWidth: 18,
                        minHeight: 18,
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: const Color(0xFF0F172A),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.35),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          count > 99 ? '99+' : (count > 9 ? '9+' : '$count'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            height: 1.0,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          );
        }),
      ],
    );
  }

  // ---------------- 1. Technician Profile Banner with TOP Rating Pill ----------------
  Widget _buildProfileBanner() {
    return Obx(() {
      final name = controller.technicianName.value;
      final role = controller.technicianRole.value;
      final depot = controller.depotName.value;
      final badge = controller.badgeId.value;
      final avatar = controller.avatarUrl.value;
      final synced = controller.isSynced.value;
      final avgRating = controller.formattedRating;
      final totalRatings = controller.totalRatingsCount;
      final certLevel = controller.certLevel;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kCardBorder, width: 1.2),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF1E1B4B).withValues(alpha: 0.4),
              kCardBg,
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Avatar + Name/Role + Online Status
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar Photo
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppTheme.primaryGradient,
                    border: Border.all(color: AppTheme.gradientBlue, width: 1.8),
                    color: const Color(0xFF0F172A),
                  ),
                  child: ClipOval(
                    child: avatar.isNotEmpty
                        ? Image.network(
                            avatar,
                            width: 52,
                            height: 52,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => _buildAvatarInitial(name),
                          )
                        : _buildAvatarInitial(name),
                  ),
                ),
                const SizedBox(width: 14),

                // Name & Role & Clearance
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: synced ? const Color(0xFF10B981) : Colors.amber,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  synced ? 'online_status'.tr : 'offline_status'.tr,
                                  style: const TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              role,
                              style: const TextStyle(
                                color: Color(0xFF818CF8),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (certLevel.isNotEmpty) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(
                                color: AppTheme.gradientBlue.withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: AppTheme.gradientBlue.withValues(alpha: 0.35)),
                              ),
                              child: Text(
                                certLevel,
                                style: const TextStyle(
                                  color: AppTheme.gradientBlue,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_city_rounded, color: AppColors.textMuted, size: 12),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              depot,
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            'ID: $badge',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // LIVE TECHNICIAN RATING PILL ON TOP (As per Web Portal)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: const Color(0xFF261D12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
                  const SizedBox(width: 6),
                  Text(
                    avgRating,
                    style: const TextStyle(
                      color: Color(0xFFF59E0B),
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const Text(
                    ' / 5.0',
                    style: TextStyle(
                      color: Colors.white38,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    '•',
                    style: TextStyle(color: Color(0xFFF59E0B), fontSize: 12),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '$totalRatings ${totalRatings == 1 ? 'client_rating'.tr : 'client_ratings'.tr}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'verified_badge'.tr,
                      style: const TextStyle(
                        color: Color(0xFFF59E0B),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildAvatarInitial(String name) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'T';
    return Center(
      child: Text(
        initial,
        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }

  // ---------------- 2. 5 Clean KPI Metrics Cards ----------------
  Widget _buildKpiMetricsGrid() {
    return Obx(() {
      final avgRating = controller.formattedRating;
      final totalRatings = controller.totalRatingsCount;
      final online = controller.onlineDevicesCount.value;
      final offline = controller.offlineDevicesCount.value;
      final issues = controller.issuesDevicesCount.value;
      final total = controller.totalDevicesCount.value;

      return Column(
        children: [
          // Top Featured KPI: Technician Rating Card (Full width or prominent)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.35), width: 1.2),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'technician_rating_caps'.tr,
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          avgRating,
                          style: const TextStyle(
                            color: Color(0xFFF59E0B),
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Text(
                          '/ 5.0',
                          style: TextStyle(color: Colors.white38, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      totalRatings > 0
                          ? '$totalRatings ${'verified_client_ratings'.tr}'
                          : 'no_reviews_yet'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 10),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 28),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // 4 Grid KPI Cards (Offline, Online, Hardware Faults, Total Devices)
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.55,
            children: [
              _buildKpiCard(
                title: 'offline_devices'.tr,
                count: '$offline',
                subtitle: offline > 0
                    ? '$offline ${'require_inspection'.tr}'
                    : 'all_operational'.tr,
                color: const Color(0xFFEF4444),
                icon: Icons.error_rounded,
              ),
              _buildKpiCard(
                title: 'online_devices'.tr,
                count: '$online',
                subtitle: 'transmitting_live'.tr,
                color: const Color(0xFF10B981),
                icon: Icons.check_circle_rounded,
              ),
              _buildKpiCard(
                title: 'hardware_faults'.tr,
                count: '$issues',
                subtitle: issues > 0
                    ? '$issues ${'units_with_faults'.tr}'
                    : 'zero_faults'.tr,
                color: const Color(0xFFF59E0B),
                icon: Icons.build_circle_rounded,
              ),
              _buildKpiCard(
                title: 'total_devices'.tr,
                count: '$total',
                subtitle: 'installed_network'.tr,
                color: const Color(0xFF6366F1),
                icon: Icons.developer_board_rounded,
              ),
            ],
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String count,
    required String subtitle,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(icon, color: color, size: 18),
            ],
          ),
          Text(
            count,
            style: TextStyle(
              color: color,
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            subtitle,
            style: TextStyle(
              color: color.withValues(alpha: 0.8),
              fontSize: 9.5,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------- 3. Today's Assigned Tasks Section ----------------
  Widget _buildTodaysWorkOrdersSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                _buildSectionHeader('todays_assigned_tasks_caps'.tr),
                const SizedBox(width: 8),
                Obx(() => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.gradientBlue.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.gradientBlue.withValues(alpha: 0.35)),
                      ),
                      child: Text(
                        '${controller.todaysWorkOrders.length} ${'active_tasks'.tr}',
                        style: const TextStyle(
                          color: AppTheme.gradientBlue,
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    )),
              ],
            ),
            InkWell(
              onTap: controller.onViewAllTasks,
              child: Row(
                children: [
                  Text(
                    'view_all'.tr,
                    style: const TextStyle(
                      color: AppTheme.gradientBlue,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, color: AppTheme.gradientBlue, size: 16),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 3),
        Text(
          'tasks_desc'.tr,
          style: const TextStyle(color: Colors.white38, fontSize: 10.5),
        ),
        const SizedBox(height: 10),
        _buildTodaysWorkOrdersList(context),
      ],
    );
  }

  Widget _buildTodaysWorkOrdersList(BuildContext context) {
    return Obx(() {
      final orders = controller.todaysWorkOrders;

      if (orders.isEmpty) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kCardBorder),
          ),
          child: Center(
            child: Column(
              children: [
                const Icon(Icons.assignment_turned_in_outlined, color: AppColors.textMuted, size: 36),
                const SizedBox(height: 8),
                Text(
                  'no_assigned_tasks_today'.tr,
                  style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  'dispatch_queue_clear'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: orders.take(5).length,
        separatorBuilder: (_, _) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final order = orders[index];
          return _WorkOrderSummaryTile(
            order: order,
            onTap: () => controller.onTaskTap(context, order),
          );
        },
      );
    });
  }

  // ---------------- 4. Technician Rating & Client Reviews Section (Matching Admin Panel) ----------------
  Widget _buildRatingAndReviewsSection() {
    return Obx(() {
      final avgRating = controller.formattedRating;
      final totalRatings = controller.totalRatingsCount;
      final certLevel = controller.certLevel;
      final breakdown = controller.ratingBreakdown;
      final reviews = controller.recentRatings;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kCardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'client_ratings_and_reviews'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),

              ],
            ),
            const SizedBox(height: 4),
            Text(
              'client_ratings_reviews_sub'.tr,
              style: const TextStyle(color: Colors.white38, fontSize: 10.5),
            ),
            const SizedBox(height: 14),

            // Overall Satisfaction & Star Distribution
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      // Score block
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: kCardBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: kCardBorder),
                        ),
                        child: Column(
                          children: [
                            Text(
                              avgRating,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: List.generate(
                                5,
                                (i) => Icon(
                                  Icons.star_rounded,
                                  color: i < (double.tryParse(avgRating) ?? 5).round()
                                      ? const Color(0xFFF59E0B)
                                      : Colors.white24,
                                  size: 13,
                                ),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'out_of_5'.tr,
                              style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Satisfaction details & clearance
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'overall_satisfaction'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${'based_on'.tr} $totalRatings ${'verified_client_ratings'.tr} ${'from_completed_work_orders'.tr}',
                              style: const TextStyle(color: Colors.white60, fontSize: 11),
                            ),
                            if (certLevel.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Text(
                                    '${'clearance_level'.tr}: ',
                                    style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                                  ),
                                  Expanded(
                                    child: Text(
                                      certLevel,
                                      style: const TextStyle(
                                        color: AppTheme.gradientBlue,
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Color(0xFF1E293B), height: 1),
                  const SizedBox(height: 10),

                  // 5★ to 1★ Progress Bars
                  ...breakdown.map((item) {
                    final percent = totalRatings > 0 ? (item.count / totalRatings) : 0.0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2.5),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 32,
                            child: Row(
                              children: [
                                Text(
                                  '${item.stars}',
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 2),
                                const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 12),
                              ],
                            ),
                          ),
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: percent,
                                minHeight: 6,
                                backgroundColor: const Color(0xFF1E293B),
                                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          SizedBox(
                            width: 24,
                            child: Text(
                              '${item.count}',
                              textAlign: TextAlign.end,
                              style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Recent Client Feedback & Comments Subtitle
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'recent_client_feedback'.tr,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${reviews.length} ${'shown'.tr}',
                  style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Reviews List or Empty Placeholder
            if (reviews.isEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.rate_review_outlined, color: Colors.white24, size: 32),
                      const SizedBox(height: 6),
                      Text(
                        'no_client_reviews'.tr,
                        style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'no_client_reviews_desc'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: reviews.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, idx) {
                  final rev = reviews[idx];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E293B)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Reviewer Top Row
                        Row(
                          children: [
                            Container(
                              width: 30,
                              height: 30,
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  rev.clientName.isNotEmpty ? rev.clientName[0].toUpperCase() : 'C',
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          rev.clientName,
                                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (rev.organizationName != null) ...[
                                        const SizedBox(width: 4),
                                        Flexible(
                                          child: Text(
                                            '(${rev.organizationName})',
                                            style: const TextStyle(color: Colors.white38, fontSize: 10),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 1),
                                  Text(
                                    '${rev.code}${rev.busNumber != null ? ' • ${rev.busNumber}' : ''}',
                                    style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 13),
                                  const SizedBox(width: 2),
                                  Text(
                                    rev.rating.toStringAsFixed(1),
                                    style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 10.5, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (rev.comment.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            '"${rev.comment}"',
                            style: const TextStyle(color: Colors.white70, fontSize: 11, fontStyle: FontStyle.italic),
                          ),
                        ],
                        if (rev.tags.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            children: rev.tags.map((t) {
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.check, color: Color(0xFF10B981), size: 10),
                                    const SizedBox(width: 3),
                                    Text(
                                      t,
                                      style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      );
    });
  }

  // ---------------- 5. Quick Action Grid (6 Field Consoles) ----------------
  Widget _buildQuickActionsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'quick_actions_caps'.tr,
          style: const TextStyle(
            color: AppColors.textMuted,
            fontSize: 10.5,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.1,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppTheme.primaryGradient.colors.first.withValues(alpha: 0.2),
                AppTheme.primaryGradient.colors.last.withValues(alpha: 0.2),
              ],
            ),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: AppTheme.primaryGradient.colors.first.withValues(alpha: 0.4),
            ),
          ),
          child: Text(
            'field_console'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionsGrid() {
    return Obx(() {
      final assignedTasks = controller.todaysWorkOrders.length;
      final totalDevices = controller.totalDevicesCount.value;

      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.45,
        children: [
          _buildQuickActionTile(
            title: 'field_work_orders'.tr,
            subtitle: 'assigned_depot_tasks'.tr,
            badge: '$assignedTasks ${'assigned'.tr}',
            icon: 'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
            iconColor: const Color(0xFF38BDF8),
            onTap: controller.onViewAllTasks,
          ),
          _buildQuickActionTile(
            title: 'display_devices'.tr,
            subtitle: 'active_edge_units'.tr,
            badge: '$totalDevices ${'total'.tr}',
            icon: 'assets/icons/tv.svg',
            iconColor: const Color(0xFF818CF8),
            onTap: controller.goToEdgeDevicesTab,
          ),
          _buildQuickActionTile(
            title: 'hardware_config'.tr,
            subtitle: 'screen_network_setup'.tr,
            badge: 'configure_btn'.tr,
            icon: 'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
            iconColor: const Color(0xFFF59E0B),
            onTap: controller.goToHardwareConfigTab,
          ),
          _buildQuickActionTile(
            title: 'gps_installation'.tr,
            subtitle: 'telematics_wiring'.tr,
            badge: 'install_badge'.tr,
            icon: 'assets/icons/location.svg',
            iconColor: const Color(0xFF10B981),
            onTap: controller.goToGpsInstallation,
          ),
          _buildQuickActionTile(
            title: 'device_diagnostics'.tr,
            subtitle: 'run_subsystem_tests'.tr,
            badge: 'run_test_btn'.tr,
            icon: 'assets/icons/doctor.svg',
            iconColor: const Color(0xFFEC4899),
            onTap: controller.goToDiagnostics,
          ),
          _buildQuickActionTile(
            title: 'hardware_status'.tr,
            subtitle: 'telemetry_noc_health'.tr,
            badge: 'live_status_badge'.tr,
            icon: 'assets/icons/hotspot.svg',
            iconColor: const Color(0xFFA855F7),
            onTap: controller.goToHardwareStatus,
          ),
        ],
      );
    });
  }

  Widget _buildQuickActionTile({
    required String title,
    required String subtitle,
    required String badge,
    required String icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kCardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: iconColor.withValues(alpha: 0.25)),
                  ),
                  child: SvgPicture.asset(
                    icon,
                    width: 16,
                    height: 16,
                    colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0x1AFFFFFF)),
                  ),
                  child: Text(
                    badge,
                    style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: AppColors.textMuted,
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.1,
      ),
    );
  }
}

class _WorkOrderSummaryTile extends StatelessWidget {
  final WorkOrderModel order;
  final VoidCallback onTap;

  const _WorkOrderSummaryTile({required this.order, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: HomeView.kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: HomeView.kCardBorder, width: 1.1),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.build_rounded, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        order.code,
                        style: const TextStyle(color: AppTheme.gradientBlue, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 6),
                      _buildUrgencyPill(order.urgency),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    order.issueCategory,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${order.busNumber} • ${order.depotName}',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            _buildStatusBadge(order.status),
          ],
        ),
      ),
    );
  }

  Widget _buildUrgencyPill(String urgency) {
    Color color;
    String label = urgency.toUpperCase();
    switch (urgency.toLowerCase()) {
      case 'critical':
        color = const Color(0xFFEF4444);
        label = 'critical'.tr.toUpperCase();
        break;
      case 'high':
        color = const Color(0xFFF59E0B);
        label = 'high'.tr.toUpperCase();
        break;
      case 'medium':
        color = const Color(0xFF38BDF8);
        label = 'medium'.tr.toUpperCase();
        break;
      default:
        color = const Color(0xFF38BDF8);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 8.5, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label = status;
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
        color = const Color(0xFF10B981);
        label = 'resolved'.tr;
        break;
      case 'on_site':
      case 'in_progress':
        color = const Color(0xFFF59E0B);
        label = 'in_progress'.tr;
        break;
      default:
        color = const Color(0xFF6366F1);
        label = 'dispatched'.tr;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 9.5, fontWeight: FontWeight.bold),
      ),
    );
  }
}
