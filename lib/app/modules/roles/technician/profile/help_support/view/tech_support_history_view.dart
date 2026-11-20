import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/tech_support_history_controller.dart';
import '../model/tech_help_support_models.dart';

class TechSupportHistoryView extends GetView<TechSupportHistoryController> {
  const TechSupportHistoryView({super.key});

  static const Color kBg = Color(0xFF0D0F18);
  static const Color kCardBg = Color(0xFF151824);
  static const Color kBorder = Color(0x24FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: controller.openRaiseTicketModal,
        elevation: 4,
        backgroundColor: Colors.transparent,
        label: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: AppTheme.gradientBlue.withOpacity(0.4),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.add_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 6),
              Text(
                'raise_ticket'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: _buildHeader(),
            ),

            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildSearchBar(),
            ),
            const SizedBox(height: 12),

            // Filter Tabs with AppTheme.primaryGradient for active tab
            _buildTabs(),
            const SizedBox(height: 12),

            // Tickets List
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppTheme.gradientBlue),
                  );
                }

                final tickets = controller.filteredTickets;

                if (tickets.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.confirmation_number_outlined,
                          size: 54,
                          color: Colors.white24,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'no_tickets_found'.tr,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'no_tickets_match_filter'.tr,
                          style: const TextStyle(color: Colors.white38, fontSize: 12),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  color: AppTheme.gradientBlue,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView.separated(
                    padding: const EdgeInsets.only(left: 16, right: 16, bottom: 80, top: 4),
                    itemCount: tickets.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final ticket = tickets[index];
                      return _buildTicketCard(ticket);
                    },
                  ),
                );
              }),
            ),
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
          onTap: () => Get.back(),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: kCardBg,
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
              Text(
                'ticket_history'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'track_support_requests'.tr,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Search Bar ----------------
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: TextField(
        onChanged: controller.onSearchChanged,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          border: InputBorder.none,
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
          hintText: 'search_tickets_hint'.tr,
          hintStyle: const TextStyle(color: Colors.white38, fontSize: 12.5),
          prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 20),
          prefixIconConstraints: const BoxConstraints(minWidth: 30, minHeight: 20),
        ),
      ),
    );
  }

  // ---------------- Filter Tabs with AppTheme.primaryGradient ----------------
  Widget _buildTabs() {
    return Obx(() {
      final tabs = [
        {'key': 'All', 'label': 'all'.tr, 'count': controller.countAll},
        {'key': 'Open', 'label': 'open'.tr, 'count': controller.countOpen},
        {'key': 'Resolved', 'label': 'resolved'.tr, 'count': controller.countResolved},
        {'key': 'Closed', 'label': 'closed'.tr, 'count': controller.countClosed},
      ];

      return Container(
        height: 38,
        margin: const EdgeInsets.symmetric(horizontal: 16),
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: tabs.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final t = tabs[index];
            final key = t['key'] as String;
            final label = t['label'] as String;
            final count = t['count'] as int;
            final isSelected = controller.activeTab.value == key;

            return GestureDetector(
              onTap: () => controller.setTab(key),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppTheme.primaryGradient : null,
                  color: isSelected ? null : kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? Colors.transparent : kBorder,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppTheme.gradientBlue.withOpacity(0.3),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white60,
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Colors.white.withOpacity(0.25)
                            : Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$count',
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.white54,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    });
  }

  // ---------------- Ticket Card ----------------
  Widget _buildTicketCard(TechSupportTicketModel ticket) {
    return GestureDetector(
      onTap: () => controller.openTicketDetails(ticket),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Code + Priority + Status
            Row(
              children: [
                Text(
                  ticket.code,
                  style: const TextStyle(
                    color: AppTheme.gradientBlue,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: ticket.priorityColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: ticket.priorityColor.withOpacity(0.4)),
                  ),
                  child: Text(
                    ticket.priority.toUpperCase(),
                    style: TextStyle(
                      color: ticket.priorityColor,
                      fontSize: 8.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: ticket.statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: ticket.statusColor.withOpacity(0.4)),
                  ),
                  child: Text(
                    ticket.status.toUpperCase(),
                    style: TextStyle(
                      color: ticket.statusColor,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Subject
            Text(
              ticket.subject,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13.5,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),

            // Description preview
            Text(
              ticket.description,
              style: const TextStyle(color: Colors.white54, fontSize: 11),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 10),

            Divider(color: Colors.white.withOpacity(0.06), height: 1),
            const SizedBox(height: 8),

            // Bottom metadata: category, replies count & date
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    ticket.category,
                    style: const TextStyle(color: Colors.white60, fontSize: 10),
                  ),
                ),
                const Spacer(),
                if (ticket.messages.isNotEmpty) ...[
                  const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white38, size: 12),
                  const SizedBox(width: 4),
                  Text(
                    '${ticket.messages.length}',
                    style: const TextStyle(color: Colors.white38, fontSize: 10),
                  ),
                  const SizedBox(width: 10),
                ],
                Row(
                  children: [
                    Text(
                      'view_thread'.tr,
                      style: const TextStyle(
                        color: AppTheme.gradientBlue,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward_ios, color: AppTheme.gradientBlue, size: 10),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
