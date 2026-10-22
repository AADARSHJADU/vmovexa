import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import '../controllers/notifications_controller.dart';

class NotificationsView extends GetView<NotificationsController> {
  const NotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<NotificationsController>()
        ? Get.find<NotificationsController>()
        : Get.put(NotificationsController());

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar with Title, Subtitle, Unread Badge & Mark All Read
            _buildTopAppBar(c),

            // Scrollable Content
            Expanded(
              child: RefreshIndicator(
                color: const Color(0xFF06B6D4),
                backgroundColor: AppColors.cardBg,
                onRefresh: () => c.loadNotifications(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Filter Tabs Bar with Live Dynamic Counts
                      _buildTabsBar(c),

                      const SizedBox(height: 12),

                      // 2. Search Alerts Bar
                      _buildSearchBar(c),

                      const SizedBox(height: 14),

                      // 3. Alerts & Notifications List Content
                      Obx(() {
                        if (c.isLoading.value) {
                          return _buildLoadingState();
                        }
                        if (c.paginatedNotifications.isEmpty) {
                          return _buildEmptyState(c);
                        }
                        return _buildNotificationsList(c);
                      }),

                      const SizedBox(height: 14),

                      // 4. Global Pagination Strip ("list hai or page count bhi show krna hai")
                      _buildPaginationStrip(c),

                      const SizedBox(height: 16),

                      // 5. Clear All Notifications Action
                      _buildClearAllFooter(c),

                      const SizedBox(height: 24),
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

  // --- Top App Bar ---
  Widget _buildTopAppBar(NotificationsController c) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
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
                          'ALERTS & EVENTS',
                          style: TextStyle(
                            color: Color(0xFF06B6D4),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.1,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Obx(() {
                          final unread = c.unreadCount;
                          if (unread <= 0) return const SizedBox.shrink();
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDC2626).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              '$unread new',
                              style: const TextStyle(
                                color: Color(0xFFF87171),
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Operational Alerts & Notifications',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
              ),

              // Mark All Read Button
              Obx(() {
                if (c.unreadCount <= 0) return const SizedBox.shrink();
                return ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.08),
                    foregroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: BorderSide(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                    ),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.done_all_rounded, size: 14, color: Color(0xFF10B981)),
                  label: const Text(
                    'Mark all read',
                    style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold),
                  ),
                  onPressed: c.markAllAsRead,
                );
              }),
            ],
          ),
          const Padding(
            padding: EdgeInsets.only(left: 48, top: 2),
            child: Text(
              'Real-time fleet telematics exceptions, driver emergency alerts, and dispatch updates',
              style: TextStyle(color: Colors.white54, fontSize: 10.5),
            ),
          ),
        ],
      ),
    );
  }

  // --- 1. Filter Tabs Bar with Live Dynamic Counts ---
  Widget _buildTabsBar(NotificationsController c) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Obx(() {
          final curTab = c.activeTab.value;
          final tabs = [
            {'id': 'All', 'label': 'All (${c.allCount})'},
            {'id': 'Unread', 'label': 'Unread (${c.unreadCount})'},
            {'id': 'Critical', 'label': 'Critical (${c.criticalCount})'},
            {'id': 'Warning', 'label': 'Warning (${c.warningCount})'},
            {'id': 'Info', 'label': 'Info (${c.infoCount})'},
          ];

          return Row(
            children: tabs.map((tab) {
              final isSelected = curTab == tab['id'];
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: InkWell(
                  onTap: () => c.setTab(tab['id']!),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF06B6D4) : Colors.white.withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF06B6D4) : Colors.white12,
                      ),
                    ),
                    child: Text(
                      tab['label']!,
                      style: TextStyle(
                        color: isSelected ? Colors.black : Colors.white70,
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }),
      ),
    );
  }

  // --- 2. Search Alerts Bar ---
  Widget _buildSearchBar(NotificationsController c) {
    return Container(
      height: 42,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: Icon(Icons.search_rounded, color: Colors.white38, size: 18),
          ),
          Expanded(
            child: TextField(
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: const InputDecoration(
                hintText: 'Search alerts by keyword, fault, or vehicle...',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 11),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
              onChanged: c.onSearchChanged,
            ),
          ),
          Obx(() {
            if (c.searchQuery.value.isEmpty) return const SizedBox.shrink();
            return IconButton(
              icon: const Icon(Icons.close_rounded, color: Colors.white54, size: 16),
              onPressed: c.clearSearch,
            );
          }),
        ],
      ),
    );
  }

  // --- 3. Notifications List Content ---
  Widget _buildNotificationsList(NotificationsController c) {
    final list = c.paginatedNotifications;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (_, _) => const Divider(height: 1, color: Colors.white10),
        itemBuilder: (context, index) {
          final item = list[index];
          return Obx(() {
            final isUnread = !item.isRead.value;

            return InkWell(
              onTap: () {
                if (isUnread) c.markAsRead(item.id);
              },
              child: Container(
                padding: const EdgeInsets.all(14),
                color: isUnread
                    ? const Color(0xFF0284C7).withValues(alpha: 0.08)
                    : Colors.transparent,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Alert Icon Box
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: isUnread
                            ? const Color(0xFF0284C7).withValues(alpha: 0.2)
                            : Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isUnread
                              ? const Color(0xFF0284C7).withValues(alpha: 0.4)
                              : Colors.white12,
                        ),
                      ),
                      child: Icon(
                        isUnread ? Icons.notifications_active_rounded : Icons.notifications_none_rounded,
                        size: 18,
                        color: isUnread ? const Color(0xFF38BDF8) : Colors.white38,
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Title, Severity, Unread dot, Message, Time
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  item.title,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12.5,
                                    fontWeight: isUnread ? FontWeight.w900 : FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              _buildSeverityBadge(item.severity),
                              if (isUnread) ...[
                                const SizedBox(width: 6),
                                Container(
                                  width: 7,
                                  height: 7,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF06B6D4),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.body,
                            style: TextStyle(
                              color: isUnread ? Colors.white70 : Colors.white54,
                              fontSize: 11,
                              height: 1.35,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Text(
                                item.formattedTime,
                                style: const TextStyle(
                                  color: Colors.white38,
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.05),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  item.type.toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white38,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 8),

                    // Right Quick Actions: Mark Read & Delete
                    Column(
                      children: [
                        if (isUnread)
                          IconButton(
                            icon: const Icon(Icons.check_circle_outline_rounded, size: 18, color: Color(0xFF10B981)),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            tooltip: 'Mark as read',
                            onPressed: () => c.markAsRead(item.id),
                          ),
                        if (isUnread) const SizedBox(height: 8),
                        IconButton(
                          icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Colors.white24),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          tooltip: 'Delete notification',
                          onPressed: () => c.deleteNotification(item.id),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          });
        },
      ),
    );
  }

  // --- Severity Badge Helper ---
  Widget _buildSeverityBadge(String severity) {
    Color bg;
    Color border;
    Color text;
    String label;

    final s = severity.toUpperCase();
    if (s == 'CRITICAL' || s == 'ERROR' || s == 'DANGER' || s == 'EMERGENCY') {
      bg = const Color(0xFFDC2626).withValues(alpha: 0.15);
      border = const Color(0xFFDC2626).withValues(alpha: 0.4);
      text = const Color(0xFFF87171);
      label = 'Critical';
    } else if (s == 'WARNING' || s == 'WARN') {
      bg = const Color(0xFFD97706).withValues(alpha: 0.15);
      border = const Color(0xFFD97706).withValues(alpha: 0.4);
      text = const Color(0xFFFBBF24);
      label = 'Warning';
    } else {
      bg = const Color(0xFF0284C7).withValues(alpha: 0.15);
      border = const Color(0xFF0284C7).withValues(alpha: 0.4);
      text = const Color(0xFF38BDF8);
      label = 'Info';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border),
      ),
      child: Text(
        label,
        style: TextStyle(color: text, fontSize: 9.5, fontWeight: FontWeight.w900),
      ),
    );
  }

  // --- 4. Global Pagination Strip ("list hai or page count bhi show krna hai") ---
  Widget _buildPaginationStrip(NotificationsController c) {
    return Obx(() {
      final curPage = c.currentPage.value;
      final tPages = c.totalPages;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          children: [
            // Top Row: Showing count & Rows per page
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // "Showing 1 - 6 of 24 entries"
                Text(
                  c.paginationRangeText,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                // Rows per page selector
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Per Page: ',
                      style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    DropdownButton<int>(
                      value: c.pageSize.value,
                      underline: const SizedBox.shrink(),
                      isDense: true,
                      dropdownColor: const Color(0xFF161922),
                      style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                      icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF06B6D4), size: 16),
                      items: c.pageSizeOptions.map((sz) {
                        return DropdownMenuItem<int>(
                          value: sz,
                          child: Text('$sz'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) c.changePageSize(val);
                      },
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Bottom Row: Navigation Buttons + Page Number Pills
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Previous Button
                IconButton(
                  icon: const Icon(Icons.chevron_left_rounded, size: 20),
                  color: c.canPrev ? const Color(0xFF06B6D4) : Colors.white24,
                  onPressed: c.canPrev ? c.prevPage : null,
                  tooltip: 'Previous Page',
                ),

                const SizedBox(width: 4),

                // Page Pills: Up to 5 visible page numbers
                ...List.generate(tPages, (index) {
                  final p = index + 1;
                  if (tPages > 5 && (p < curPage - 2 || p > curPage + 2)) {
                    if (p == 1 || p == tPages) {
                      return const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 2),
                        child: Text('.', style: TextStyle(color: Colors.white38)),
                      );
                    }
                    return const SizedBox.shrink();
                  }

                  final isSelected = p == curPage;
                  return GestureDetector(
                    onTap: () => c.goToPage(p),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF06B6D4) : Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF06B6D4) : Colors.white12,
                        ),
                      ),
                      child: Text(
                        '$p',
                        style: TextStyle(
                          color: isSelected ? Colors.black : Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  );
                }),

                const SizedBox(width: 4),

                // Next Button
                IconButton(
                  icon: const Icon(Icons.chevron_right_rounded, size: 20),
                  color: c.canNext ? const Color(0xFF06B6D4) : Colors.white24,
                  onPressed: c.canNext ? c.nextPage : null,
                  tooltip: 'Next Page',
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  // --- 5. Clear All Notifications Action ---
  Widget _buildClearAllFooter(NotificationsController c) {
    return Center(
      child: TextButton(
        onPressed: c.clearAllNotifications,
        child: const Text(
          'Clear All Notifications',
          style: TextStyle(
            color: Color(0xFFF87171),
            fontSize: 11.5,
            fontWeight: FontWeight.bold,
            decoration: TextDecoration.underline,
          ),
        ),
      ),
    );
  }

  // --- Empty & Loading States ---
  Widget _buildEmptyState(NotificationsController c) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(36),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.notifications_off_rounded, size: 48, color: Colors.white24),
          const SizedBox(height: 12),
          const Text(
            'No Notifications Found',
            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            c.searchQuery.value.isNotEmpty
                ? 'No alerts matched "${c.searchQuery.value}"'
                : 'Your notifications inbox is completely clean.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white38, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      height: 180,
      alignment: Alignment.center,
      child: const CircularProgressIndicator(color: Color(0xFF06B6D4)),
    );
  }
}
