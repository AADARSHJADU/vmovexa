import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/advertiser_support_history_controller.dart';

class AdvertiserSupportHistoryView extends GetView<AdvertiserSupportHistoryController> {
  const AdvertiserSupportHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<AdvertiserSupportHistoryController>()
        ? Get.find<AdvertiserSupportHistoryController>()
        : Get.put(AdvertiserSupportHistoryController());

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
                                'no_tickets_match_filter'.tr,
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
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

  Widget _buildTopAppBar(BuildContext context, AdvertiserSupportHistoryController c) {
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
                  'support_tickets_history_title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'support_history_desc'.tr,
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
          // const SizedBox(width: 6),
          // // Raise Ticket Action Button with primaryGradient
          // Container(
          //   height: 36,
          //   decoration: BoxDecoration(
          //     gradient: AppTheme.primaryGradient,
          //     borderRadius: BorderRadius.circular(10),
          //   ),
          //   child: ElevatedButton.icon(
          //     onPressed: () => Get.toNamed(Routes.ADVERTISER_RAISE_TICKET),
          //     icon: const Icon(Icons.add_rounded, color: Colors.white, size: 15),
          //     label: Text(
          //       'raise_ticket_btn'.tr,
          //       style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
          //     ),
          //     style: ElevatedButton.styleFrom(
          //       backgroundColor: Colors.transparent,
          //       shadowColor: Colors.transparent,
          //       padding: const EdgeInsets.symmetric(horizontal: 10),
          //       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          //     ),
          //   ),
          // ),
        ],
      ),
    );
  }

  Widget _buildFilterHeader(BuildContext context, AdvertiserSupportHistoryController c) {
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
                hintText: 'search_support_tickets_hint'.tr,
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

  Widget _buildTicketCard(BuildContext context, AdvertiserSupportHistoryController c, Map<String, dynamic> ticket) {
    final rawStatus = (ticket['status'] ?? 'open').toString();
    final statusColor = c.getStatusColor(rawStatus);
    final statusLabel = c.getStatusLabel(rawStatus);

    final code = ticket['code'] ?? ticket['id'] ?? 'TICKET';
    final subject = ticket['subject'] ?? 'No Subject';
    final category = ticket['category'] ?? 'General';
    final desc = ticket['description'] ?? '';
    final createdAt = ticket['createdAt'] ?? ticket['created_at'] ?? '';

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showTicketDetailsDialog(context, c, ticket),
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Code, Category, Status Badge
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: const Icon(Icons.support_agent_rounded, color: Color(0xFF60A5FA), size: 16),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      code.toString(),
                      style: const TextStyle(
                        color: Color(0xFF60A5FA),
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(width: 8),
                   Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 5,
                            height: 5,
                            decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Subject Title
                Text(
                  subject.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

                // Description
                if (desc.toString().isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    desc.toString(),
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 10),

                // Date & View Details Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      createdAt.toString().isNotEmpty ? createdAt.toString().split('T').first : '',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Text(
                        category.toString(),
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Global Pagination Controls matching Admin panel AdvertiserSupportHistoryPage
  Widget _buildPaginationControls(BuildContext context, AdvertiserSupportHistoryController c) {
    return Obx(() {
      final total = c.filteredTickets.length;
      if (total == 0) return const SizedBox.shrink();

      final current = c.currentPage.value;
      final totalPages = c.totalPages;
      final start = c.paginationStartIndex;
      final end = c.paginationEndIndex;

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          children: [
            // Row 1: Showing X - Y of Z tickets and Per-Page Dropdown
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'showing_tickets_pagination'.trParams({
                    'start': start.toString(),
                    'end': end.toString(),
                    'total': total.toString(),
                  }),
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: c.pageSize.value,
                          dropdownColor: const Color(0xFF1E293B),
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          items: c.pageSizeOptions.map((size) {
                            return DropdownMenuItem<int>(
                              value: size,
                              child: Text('$size ${'per_page'.tr}'),
                            );
                          }).toList(),
                          onChanged: (newSize) {
                            if (newSize != null) c.setPageSize(newSize);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Divider(color: Color(0xFF1E293B), height: 1),
            const SizedBox(height: 10),

            // Row 2: Page Navigation Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Previous Button
                IconButton(
                  onPressed: current > 1 ? c.prevPage : null,
                  icon: const Icon(Icons.chevron_left_rounded, size: 20),
                  color: const Color(0xFF60A5FA),
                  disabledColor: const Color(0xFF475569),
                  tooltip: 'previous'.tr,
                ),

                // Page Number Chips
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(totalPages, (i) {
                    final p = i + 1;
                    // Show up to 5 page chips around current
                    if (totalPages > 5 && (p < current - 2 || p > current + 2)) {
                      if (p == 1 || p == totalPages) {
                        // show edge
                      } else {
                        return const SizedBox.shrink();
                      }
                    }

                    final isCurrent = p == current;
                    return GestureDetector(
                      onTap: () => c.setPage(p),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          gradient: isCurrent ? AppTheme.primaryGradient : null,
                          color: isCurrent ? null : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isCurrent ? Colors.transparent : const Color(0xFF334155),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '$p',
                          style: TextStyle(
                            color: isCurrent ? Colors.white : const Color(0xFF94A3B8),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    );
                  }),
                ),

                // Next Button
                IconButton(
                  onPressed: current < totalPages ? c.nextPage : null,
                  icon: const Icon(Icons.chevron_right_rounded, size: 20),
                  color: const Color(0xFF60A5FA),
                  disabledColor: const Color(0xFF475569),
                  tooltip: 'next'.tr,
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  void _showTicketDetailsDialog(
    BuildContext context,
    AdvertiserSupportHistoryController c,
    Map<String, dynamic> ticket,
  ) {
    final rawStatus = (ticket['status'] ?? 'open').toString();
    final statusColor = c.getStatusColor(rawStatus);
    final statusLabel = c.getStatusLabel(rawStatus);

    final code = ticket['code'] ?? ticket['id'] ?? 'TICKET';
    final subject = ticket['subject'] ?? 'No Subject';
    final category = ticket['category'] ?? 'General';
    final priority = (ticket['priority'] ?? 'medium').toString().toUpperCase();
    final desc = ticket['description'] ?? 'No description provided.';
    final attachments = ticket['attachments'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.8),
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header with Code and Close
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      code.toString(),
                      style: const TextStyle(
                        color: Color(0xFF60A5FA),
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white70),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                // Subject
                Text(
                  subject.toString(),
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                // Badges Row
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                      ),
                      child: Text(statusLabel, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Text('${'category'.tr}: $category', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Text('${'priority'.tr}: $priority', style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(color: Color(0xFF1E293B)),
                const SizedBox(height: 10),

                // Description
                Text(
                  'issue_description'.tr,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  desc.toString(),
                  style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12.5, height: 1.4),
                ),
                const SizedBox(height: 16),

                // Attachments if any
                if (attachments is List && attachments.isNotEmpty) ...[
                  Text(
                    'attach_evidence_files_documents'.tr,
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: attachments.map((att) {
                      final fn = att is Map ? (att['fileName'] ?? 'Document') : att.toString();
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF3B82F6)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.attach_file_rounded, color: Color(0xFF60A5FA), size: 14),
                            const SizedBox(width: 4),
                            Text(
                              fn.toString(),
                              style: const TextStyle(color: Color(0xFFDBEAFE), fontSize: 11),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                ],

                // Close Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF334155)),
                      backgroundColor: const Color(0xFF1E293B),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('close'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
