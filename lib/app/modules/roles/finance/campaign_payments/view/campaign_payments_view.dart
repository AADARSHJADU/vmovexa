import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/campaign_payments_controller.dart';
import 'campaign_payment_card.dart';

class CampaignPaymentsView extends GetView<CampaignPaymentsController> {
  const CampaignPaymentsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildAppBar(context),

            // Scrollable Content
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primaryButtonBlue,
                backgroundColor: const Color(0xFF1E293B),
                onRefresh: controller.fetchCampaignPayments,
                child: Obx(() {
                  if (controller.isLoading.value) {
                    return const Center(
                      child: CircularProgressIndicator(color: AppColors.primaryButtonBlue),
                    );
                  }

                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    children: [
                      // Top 4 KPI Stat Cards
                      _buildKpiGrid(),
                      const SizedBox(height: 16),

                      // 4 Status Tabs (All, Pending, Paid, Live)
                      _buildStatusTabs(),
                      const SizedBox(height: 14),

                      // Search & Filters Row
                      _buildSearchAndFilters(context),
                      const SizedBox(height: 16),

                      // Campaign Cards List or Empty State
                      if (controller.filteredCampaigns.isEmpty)
                        _buildEmptyState()
                      else ...[
                        ...controller.pagedCampaigns.map((camp) => CampaignPaymentCard(
                              campaign: camp,
                              controller: controller,
                            )),
                        const SizedBox(height: 8),

                        // Pagination Controls
                        _buildPaginationControls(),
                        const SizedBox(height: 24),
                      ],
                    ],
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF1E293B),
        border: Border(bottom: BorderSide(color: Color(0xFF334155), width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Get.back(),
            icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
            splashRadius: 22,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'campaign_payments'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'campaign_payments_subtitle'.tr,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: controller.refreshData,
            icon: const Icon(Icons.refresh, color: Colors.white, size: 20),
            splashRadius: 22,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            tooltip: 'refresh'.tr,
          ),
        ],
      ),
    );
  }

  Widget _buildKpiGrid() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                title: 'pending_payments'.tr,
                value: controller.pendingCount.value.toString(),
                subtitle: 'unsettled_campaigns'.tr,
                icon: Icons.pending_actions,
                color: const Color(0xFFF59E0B),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildKpiCard(
                title: 'pending_amount'.tr,
                value: '₹${controller.totalPendingAmt.value.toStringAsFixed(0)}',
                subtitle: 'receivable_balance'.tr,
                icon: Icons.account_balance_wallet_outlined,
                color: const Color(0xFFF59E0B),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                title: 'paid_campaigns'.tr,
                value: controller.paidCount.value.toString(),
                subtitle: 'settled_cleared'.tr,
                icon: Icons.task_alt,
                color: const Color(0xFF10B981),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildKpiCard(
                title: 'total_received'.tr,
                value: '₹${controller.totalCollectedAmt.value.toStringAsFixed(0)}',
                subtitle: 'realized_inflow'.tr,
                icon: Icons.payments_outlined,
                color: const Color(0xFF10B981),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  title.toUpperCase(),
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 16, color: color),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTabs() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildTabItem(id: 'all', label: 'all'.tr, count: controller.allCount.value),
          const SizedBox(width: 8),
          _buildTabItem(id: 'pending', label: 'pending'.tr, count: controller.pendingCount.value),
          const SizedBox(width: 8),
          _buildTabItem(id: 'paid', label: 'paid'.tr, count: controller.paidCount.value),
          const SizedBox(width: 8),
          _buildTabItem(id: 'live', label: 'live'.tr, count: controller.liveCount.value),
        ],
      ),
    );
  }

  Widget _buildTabItem({required String id, required String label, required int count}) {
    final isSelected = controller.activeTab.value == id;
    return GestureDetector(
      onTap: () => controller.onTabChanged(id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          gradient: isSelected ? AppTheme.primaryGradient : null,
          color: isSelected ? null : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? Colors.transparent : const Color(0xFF334155),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppTheme.gradientBlue.withValues(alpha: 0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isSelected ? Colors.white.withValues(alpha: 0.25) : const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                count.toString(),
                style: TextStyle(
                  color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchAndFilters(BuildContext context) {
    return Column(
      children: [
        // Search Input
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: TextField(
            controller: controller.searchController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'search_campaigns_hint'.tr,
              hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
              prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 18),
              suffixIcon: controller.searchQuery.value.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, color: Color(0xFF94A3B8), size: 16),
                      onPressed: () => controller.searchController.clear(),
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Dropdowns Row (Status Filter & Sort)
        Row(
          children: [
            // Status Dropdown
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: controller.statusFilter.value,
                    dropdownColor: const Color(0xFF1E293B),
                    icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF94A3B8), size: 18),
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                    isExpanded: true,
                    items: [
                      DropdownMenuItem(value: 'all', child: Text('${'status'.tr}: ${'all'.tr}')),
                      DropdownMenuItem(value: 'approved', child: Text('${'status'.tr}: ${'approved'.tr}')),
                      DropdownMenuItem(value: 'live', child: Text('${'status'.tr}: ${'live'.tr}')),
                      DropdownMenuItem(value: 'completed', child: Text('${'status'.tr}: ${'completed'.tr}')),
                      DropdownMenuItem(value: 'paused', child: Text('${'status'.tr}: ${'paused'.tr}')),
                    ],
                    onChanged: controller.onStatusFilterChanged,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),

            // Sort Dropdown
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: controller.sortBy.value,
                    dropdownColor: const Color(0xFF1E293B),
                    icon: const Icon(Icons.sort, color: Color(0xFF94A3B8), size: 18),
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                    isExpanded: true,
                    items: [
                      DropdownMenuItem(value: 'newest', child: Text('sort_newest'.tr)),
                      DropdownMenuItem(value: 'oldest', child: Text('sort_oldest'.tr)),
                      DropdownMenuItem(value: 'amount_high', child: Text('amount_high_low'.tr)),
                      DropdownMenuItem(value: 'amount_low', child: Text('amount_low_high'.tr)),
                      DropdownMenuItem(value: 'title', child: Text('title_az'.tr)),
                    ],
                    onChanged: controller.onSortChanged,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: const Icon(Icons.campaign_outlined, size: 40, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),
          Text(
            'no_campaigns_found'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'no_campaigns_match_filters'.tr,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
          if (controller.searchQuery.value.isNotEmpty ||
              controller.statusFilter.value != 'all' ||
              controller.activeTab.value != 'all') ...[
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () {
                controller.searchController.clear();
                controller.statusFilter.value = 'all';
                controller.activeTab.value = 'all';
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF4F46E5)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Text(
                'clear_filters'.tr,
                style: const TextStyle(color: Color(0xFF818CF8), fontSize: 12),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaginationControls() {
    final start = ((controller.currentPage.value - 1) * controller.pageSize) + 1;
    final end = (controller.currentPage.value * controller.pageSize)
        .clamp(0, controller.filteredCampaigns.length);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '${'showing'.tr} $start - $end ${'of'.tr} ${controller.filteredCampaigns.length}',
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
          Row(
            children: [
              IconButton(
                onPressed: controller.currentPage.value > 1 ? controller.previousPage : null,
                icon: const Icon(Icons.chevron_left, size: 20),
                color: controller.currentPage.value > 1 ? Colors.white : const Color(0xFF475569),
                splashRadius: 18,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${controller.currentPage.value} / ${controller.totalPages.value}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              IconButton(
                onPressed: controller.currentPage.value < controller.totalPages.value
                    ? controller.nextPage
                    : null,
                icon: const Icon(Icons.chevron_right, size: 20),
                color: controller.currentPage.value < controller.totalPages.value
                    ? Colors.white
                    : const Color(0xFF475569),
                splashRadius: 18,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
