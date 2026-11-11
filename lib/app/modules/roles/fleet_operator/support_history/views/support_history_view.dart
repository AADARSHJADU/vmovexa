import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../controllers/support_history_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class SupportHistoryView extends GetView<SupportHistoryController> {
  const SupportHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  Expanded(
                    child: Center(
                      child: Text(
                        'your_support_history'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 48), // Spacer to balance back button
                ],
              ),
            ),

            // Search Bar & Filter Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.inputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: TextField(
                        controller: controller.searchController,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'search_support_tickets_hint'.tr,
                          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.cardBorder),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.filter_list_rounded, color: Color(0xFF3B82F6), size: 16),
                    label: Text('filter'.tr, style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Tabs capsule filter row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Obx(
                () => Row(
                  children: [
                    _buildTabItem('All'),
                    _buildTabItem('Open'),
                    _buildTabItem('Resolved'),
                    _buildTabItem('Closed'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Ticket Cards List
            Expanded(
              child: Obx(
                () {
                  if (controller.filteredTickets.isEmpty) {
                    return Center(
                      child: Text('no_support_tickets_found'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                    );
                  }
                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    physics: const BouncingScrollPhysics(),
                    children: [
                      ...controller.filteredTickets.map((t) => _buildTicketCard(t)),
                      const SizedBox(height: 20),

                      // Still need help footer card
                      _buildStillNeedHelpCard(),
                      const SizedBox(height: 16),

                      // Secure Footer text line
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.lock_outline_rounded, color: AppColors.textMuted, size: 12),
                          const SizedBox(width: 6),
                          Text(
                            'conversations_secure_confidential'.tr,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
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

  Widget _buildTabItem(String label) {
    bool isSelected = controller.activeFilter.value == label;
    String displayLabel;
    switch (label) {
      case 'All':
        displayLabel = 'all'.tr;
        break;
      case 'Open':
        displayLabel = 'ticket_open'.tr;
        break;
      case 'Resolved':
        displayLabel = 'ticket_resolved'.tr;
        break;
      case 'Closed':
        displayLabel = 'ticket_closed'.tr;
        break;
      default:
        displayLabel = label;
    }
    return Expanded(
      child: GestureDetector(
        onTap: () => controller.filterTicketsByStatus(label),
        child: Container(
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.gradientPink.withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            displayLabel,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textSecondary,
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTicketCard(SupportTicket t) {
    Color badgeColor;
    Color badgeTextColor;
    String statusDisplay;
    switch (t.status) {
      case 'Open':
        badgeColor = const Color(0xFF3B82F6).withValues(alpha: 0.12);
        badgeTextColor = const Color(0xFF3B82F6);
        statusDisplay = 'ticket_open'.tr;
        break;
      case 'Resolved':
        badgeColor = const Color(0xFF10B981).withValues(alpha: 0.12);
        badgeTextColor = const Color(0xFF10B981);
        statusDisplay = 'ticket_resolved'.tr;
        break;
      case 'Closed':
        badgeColor = AppColors.cardBorder;
        badgeTextColor = AppColors.textMuted;
        statusDisplay = 'ticket_closed'.tr;
        break;
      default:
        badgeColor = AppColors.cardBorder;
        badgeTextColor = AppColors.textMuted;
        statusDisplay = t.status;
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
          SvgPicture.asset(t.icon),
          const SizedBox(width: 14),

          // Message details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      t.id,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: badgeColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        statusDisplay,
                        style: TextStyle(color: badgeTextColor, fontSize: 8, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  t.title.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  t.subtitle,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, color: AppColors.textMuted, size: 10),
                    const SizedBox(width: 6),
                    Text(
                      t.date,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                    ),
                  ],
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

  Widget _buildStillNeedHelpCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          SvgPicture.asset("assets/icons/fleet_operator_icons/helpSupportA.svg"),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'still_need_help'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  'cant_find_answer_desc'.tr,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
