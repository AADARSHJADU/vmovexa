import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../controllers/gov_support_history_controller.dart';

class GovSupportHistoryView extends GetView<GovSupportHistoryController> {
  const GovSupportHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<GovSupportHistoryController>()
        ? Get.find<GovSupportHistoryController>()
        : Get.put(GovSupportHistoryController());

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(context, c),

            // Search Bar & Filter Tabs
            _buildFilterHeader(context, c),

            // Tickets List & Pagination Area
            Expanded(
              child: RefreshIndicator(
                onRefresh: c.loadTickets,
                color: const Color(0xFF3B82F6),
                backgroundColor: const Color(0xFF1E293B),
                child: Obx(() {
                  if (c.isLoading.value) {
                    return const Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6)));
                  }

                  final list = c.paginatedTickets;
                  if (c.filteredTickets.isEmpty) {
                    return ListView(
                      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                      children: [
                        const SizedBox(height: 80),
                        Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: const Color(0xFF334155)),
                                ),
                                child: const Icon(Icons.inbox_rounded, color: Color(0xFF64748B), size: 28),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'gov_help.no_tickets_found'.tr,
                                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'gov_help.no_tickets_desc'.tr,
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  }

                  return SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    child: Column(
                      children: [
                        // Tickets Card List
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: list.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 10),
                          itemBuilder: (ctx, idx) {
                            final ticket = list[idx];
                            return _buildTicketCard(context, c, ticket);
                          },
                        ),
                        const SizedBox(height: 16),

                        // Global Pagination Controls
                        _buildPaginationControls(context, c),
                        const SizedBox(height: 24),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopAppBar(BuildContext context, GovSupportHistoryController c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: Color(0xFF1E293B), width: 1)),
      ),
      child: Row(
        children: [
          const CustomBackButton(),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'gov_help.history_title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'gov_help.history_desc'.tr,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 10.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
            onPressed: c.loadTickets,
            tooltip: 'refresh_content'.tr,
          ),
          const SizedBox(width: 4),
          Container(
            height: 34,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: ElevatedButton.icon(
              onPressed: () => Get.toNamed(Routes.GOV_RAISE_TICKET),
              icon: const Icon(Icons.add_rounded, color: Colors.white, size: 15),
              label: Text(
                'gov_help.raise_ticket'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterHeader(BuildContext context, GovSupportHistoryController c) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Column(
        children: [
          // Search Input
          Container(
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: TextField(
              controller: c.searchController,
              onChanged: (val) => c.setSearch(val),
              style: const TextStyle(color: Colors.white, fontSize: 12.5),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
                hintText: 'gov_help.search_tickets_ph'.tr,
                hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 11.5),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                suffixIcon: Obx(
                  () => c.searchQuery.value.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, color: Colors.white54, size: 16),
                          onPressed: c.clearSearch,
                        )
                      : const SizedBox.shrink(),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Status Filter Tabs
          Obx(() {
            final active = c.activeTab.value;
            final tabs = [
              {'id': 'All', 'label': 'tab_all'.tr},
              {'id': 'Open', 'label': 'tab_open'.tr},
              {'id': 'Resolved', 'label': 'tab_resolved'.tr},
              {'id': 'Closed', 'label': 'tab_closed'.tr},
            ];

            return Row(
              children: tabs.map((tab) {
                final isSelected = active == tab['id'];
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: GestureDetector(
                      onTap: () => c.setTab(tab['id']!),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          gradient: isSelected ? AppTheme.primaryGradient : null,
                          color: isSelected ? null : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? Colors.transparent : const Color(0xFF334155),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          tab['label']!,
                          style: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTicketCard(BuildContext context, GovSupportHistoryController c, Map<String, dynamic> ticket) {
    final code = ticket['code'] ?? ticket['id'] ?? 'TICKET';
    final subject = ticket['subject'] ?? 'untitled_support_ticket'.tr;
    final category = ticket['category'] != null ? c.getCategoryLabel(ticket['category'].toString()) : 'category_general'.tr;
    final priority = (ticket['priority'] ?? 'medium').toString().toLowerCase();
    final status = (ticket['status'] ?? 'open').toString().toLowerCase();
    final createdAt = ticket['createdAt']?.toString() ?? ticket['created_at']?.toString() ?? '';

    // Status colors
    Color statusBg = const Color(0xFF1E293B);
    Color statusColor = const Color(0xFF94A3B8);
    Color statusBorder = const Color(0xFF334155);
    String statusText = status.toUpperCase();

    if (status == 'open' || status == 'in_progress') {
      statusBg = const Color(0x1F3B82F6);
      statusColor = const Color(0xFF60A5FA);
      statusBorder = const Color(0x4D3B82F6);
      statusText = 'tab_open'.tr.toUpperCase();
    } else if (status == 'resolved') {
      statusBg = const Color(0x1F10B981);
      statusColor = const Color(0xFF34D399);
      statusBorder = const Color(0x4D10B981);
      statusText = 'tab_resolved'.tr.toUpperCase();
    } else if (status == 'closed') {
      statusBg = const Color(0x1F6B7280);
      statusColor = const Color(0xFF9CA3AF);
      statusBorder = const Color(0x4D6B7280);
      statusText = 'tab_closed'.tr.toUpperCase();
    }

    // Priority colors
    Color priorityColor = const Color(0xFFF59E0B);
    if (priority == 'urgent') priorityColor = const Color(0xFFEF4444);
    if (priority == 'high') priorityColor = const Color(0xFFF97316);
    if (priority == 'low') priorityColor = const Color(0xFF10B981);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Code & Badges
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '#$code',
                style: const TextStyle(
                  color: Color(0xFF60A5FA),
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ),
              ),
              Row(
                children: [
                  // Priority Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: priorityColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: priorityColor.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      _getPriorityLabel(priority),
                      style: TextStyle(
                        color: priorityColor,
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Status Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusBg,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: statusBorder),
                    ),
                    child: Text(
                      statusText,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Subject
          Text(
            subject,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),

          // Category & Date Footer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.folder_outlined, color: Color(0xFF94A3B8), size: 13),
                  const SizedBox(width: 4),
                  Text(
                    category,
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                  ),
                ],
              ),
              if (createdAt.isNotEmpty)
                Text(
                  createdAt.length > 10 ? createdAt.substring(0, 10) : createdAt,
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaginationControls(BuildContext context, GovSupportHistoryController c) {
    return Obx(() {
      final total = c.totalPages;
      final current = c.currentPage.value;
      final totalItems = c.filteredTickets.length;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder, width: 1.1),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${c.paginationStartIndex}-${c.paginationEndIndex} ${'gov_reports.of'.tr} $totalItems',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left_rounded, color: Colors.white70, size: 20),
                  onPressed: current > 1 ? c.prevPage : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 12),
                Text(
                  '$current / $total',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                IconButton(
                  icon: const Icon(Icons.chevron_right_rounded, color: Colors.white70, size: 20),
                  onPressed: current < total ? c.nextPage : null,
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

  String _getPriorityLabel(String p) {
    switch (p.toLowerCase()) {
      case 'urgent':
        return 'urgent'.tr.toUpperCase();
      case 'critical':
        return 'critical'.tr.toUpperCase();
      case 'high':
        return 'high'.tr.toUpperCase();
      case 'medium':
        return 'medium'.tr.toUpperCase();
      case 'low':
        return 'low'.tr.toUpperCase();
      default:
        return p.toUpperCase();
    }
  }
}
