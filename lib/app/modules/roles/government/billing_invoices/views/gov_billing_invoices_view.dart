// lib/app/modules/roles/government/billing_invoices/views/gov_billing_invoices_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../controllers/gov_billing_invoices_controller.dart';
import '../models/gov_billing_models.dart';

class GovBillingInvoicesView extends GetView<GovBillingInvoicesController> {
  const GovBillingInvoicesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // 1. Top Bar
            _buildTopBar(context),

            // 2. Main Content
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                  );
                }

                return RefreshIndicator(
                  onRefresh: controller.refreshData,
                  color: const Color(0xFF6366F1),
                  backgroundColor: AppColors.cardBg,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 1. Plan & Sovereign Clearance Card
                        _buildSovereignPlanCard(context),
                        const SizedBox(height: 16),

                        // 2. 3 KPI Summary Cards
                        _buildSummaryKpiCards(),
                        const SizedBox(height: 18),

                        // 3. Segmented Navigation Bar
                        _buildSegmentedTabs(),
                        const SizedBox(height: 16),

                        // 4. Tab Content
                        if (controller.selectedTab.value == 0)
                          _buildInvoicesTab(context)
                        else if (controller.selectedTab.value == 1)
                          _buildTransactionsTab(context)
                        else
                          _buildQuotasTab(context),

                        const SizedBox(height: 24),
                        // 5. Help & Statutory Support Banner
                        _buildSupportCard(context),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ----------------------------------------------------
  // 1. TOP BAR
  // ----------------------------------------------------
  Widget _buildTopBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF090D16),
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 22),
            onPressed: () => Get.back(),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Billing & Invoices',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Official GST tax billing, sovereign allocation & receipts ledger',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Obx(() {
            final isRef = controller.isRefreshing.value;
            return IconButton(
              icon: isRef
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white70),
                    )
                  : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 22),
              onPressed: isRef ? null : controller.refreshData,
              tooltip: 'Refresh Billing',
            );
          }),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // 2. SOVEREIGN PLAN & CLEARANCE CARD
  // ----------------------------------------------------
  Widget _buildSovereignPlanCard(BuildContext context) {
    return Obx(() {
      final sub = controller.subscription.value;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        sub.organizationName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        sub.planName,
                        style: const TextStyle(
                          color: Color(0xFF818CF8),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF10B981), width: 1),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 13),
                      SizedBox(width: 4),
                      Text(
                        'Active Tier',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Statutory Sovereign Exemption Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.shield_rounded, color: Color(0xFF10B981), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Direct Ministry of Transport Exemption',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Public Welfare & Emergency Broadcast services are zero-rated under State Public Information Act.',
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 10.5,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quotas Micro Progress Bars Grid
            Row(
              children: [
                Expanded(
                  child: _buildQuotaMini(
                    label: 'Transit Buses',
                    used: sub.busesUsed,
                    limit: sub.busesLimit,
                    percent: sub.busesPercent,
                    color: const Color(0xFF3B82F6),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildQuotaMini(
                    label: 'Display Screens',
                    used: sub.displaysUsed,
                    limit: sub.displaysLimit,
                    percent: sub.displaysPercent,
                    color: const Color(0xFF8B5CF6),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _buildQuotaMini(
                    label: 'Depots / Corridors',
                    used: sub.depotsUsed,
                    limit: sub.depotsLimit,
                    percent: sub.depotsPercent,
                    color: const Color(0xFFF59E0B),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildQuotaMini(
                    label: 'Emergency Override',
                    used: 1,
                    limit: 1,
                    percent: 1.0,
                    color: const Color(0xFF10B981),
                    customValue: 'Unlimited',
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildQuotaMini({
    required String label,
    required int used,
    required int limit,
    required double percent,
    required Color color,
    String? customValue,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600),
              ),
              Text(
                customValue ?? '$used / $limit',
                style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: percent,
              backgroundColor: const Color(0xFF1E293B),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // 3. 3 KPI SUMMARY CARDS
  // ----------------------------------------------------
  Widget _buildSummaryKpiCards() {
    return Obx(() {
      final totalInvoices = controller.allInvoices.length;
      final paidTotal = controller.paidAmount.value;
      final pendingTotal = controller.pendingAmount.value;
      final pCount = controller.paidCount.value;
      final exCount = controller.exemptCount.value;
      final pendCount = controller.pendingCount.value;

      return Row(
        children: [
          // Total Bills
          Expanded(
            child: _buildKpiCard(
              title: 'TOTAL INVOICES',
              value: '$totalInvoices',
              subtext: '$pCount Paid · $exCount Exempt',
              icon: Icons.receipt_long_rounded,
              color: const Color(0xFF818CF8),
            ),
          ),
          const SizedBox(width: 8),

          // Pending Settlement
          Expanded(
            child: _buildKpiCard(
              title: 'PENDING BILLS',
              value: pendingTotal > 0 ? '₹${pendingTotal.toInt()}' : '₹0',
              subtext: '$pendCount Pending Clearance',
              icon: Icons.pending_actions_rounded,
              color: const Color(0xFFF59E0B),
            ),
          ),
          const SizedBox(width: 8),

          // Paid & Settled
          Expanded(
            child: _buildKpiCard(
              title: 'PAID & SETTLED',
              value: paidTotal > 0 ? '₹${(paidTotal / 1000).toStringAsFixed(1)}k' : '₹0',
              subtext: '$pCount Settled Bills',
              icon: Icons.verified_rounded,
              color: const Color(0xFF10B981),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtext,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 8.5,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
              Icon(icon, color: color, size: 14),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            subtext,
            style: TextStyle(
              color: color,
              fontSize: 8.5,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // 4. SEGMENTED TABS
  // ----------------------------------------------------
  Widget _buildSegmentedTabs() {
    return Obx(() {
      final tab = controller.selectedTab.value;
      final invCount = controller.allInvoices.length;
      final txCount = controller.allTransactions.length;

      return Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1),
        ),
        child: Row(
          children: [
            Expanded(
              child: _buildTabButton(
                title: 'Invoices ($invCount)',
                icon: Icons.description_outlined,
                isSelected: tab == 0,
                onTap: () => controller.setTab(0),
              ),
            ),
            Expanded(
              child: _buildTabButton(
                title: 'Transactions ($txCount)',
                icon: Icons.history_rounded,
                isSelected: tab == 1,
                onTap: () => controller.setTab(1),
              ),
            ),
            Expanded(
              child: _buildTabButton(
                title: 'Quotas',
                icon: Icons.pie_chart_outline_rounded,
                isSelected: tab == 2,
                onTap: () => controller.setTab(2),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildTabButton({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 9),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? Colors.white : AppColors.textMuted, size: 14),
            const SizedBox(width: 6),
            Text(
              title,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textMuted,
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ----------------------------------------------------
  // 5. INVOICES TAB
  // ----------------------------------------------------
  Widget _buildInvoicesTab(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search Input & Status Filter Chips
        _buildSearchAndFilters(),
        const SizedBox(height: 14),

        // Invoices List
        Obx(() {
          final list = controller.filteredInvoices;
          if (list.isEmpty) {
            return _buildEmptyState('No invoices found matching your criteria.');
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: list.length,
            separatorBuilder: (ctx, i) => const SizedBox(height: 12),
            itemBuilder: (ctx, i) => _buildInvoiceCard(ctx, list[i]),
          );
        }),
      ],
    );
  }

  Widget _buildSearchAndFilters() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search Box
        Container(
          height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1),
          ),
          child: TextField(
            controller: controller.searchController,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Search by Invoice #, particulars or GSTIN…',
              hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
              suffixIcon: Obx(() {
                if (controller.searchQuery.value.isNotEmpty) {
                  return IconButton(
                    icon: const Icon(Icons.clear_rounded, color: Colors.white70, size: 16),
                    onPressed: () => controller.searchController.clear(),
                  );
                }
                return const SizedBox();
              }),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Filter Chips
        Obx(() {
          final current = controller.invoiceFilter.value;
          final allCount = controller.allInvoices.length;
          final paidCount = controller.paidCount.value;
          final pendingCount = controller.pendingCount.value;
          final exemptCount = controller.exemptCount.value;

          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: [
                _buildFilterChip('All ($allCount)', 'all', current == 'all'),
                const SizedBox(width: 8),
                _buildFilterChip('Paid ($paidCount)', 'paid', current == 'paid'),
                const SizedBox(width: 8),
                _buildFilterChip('Pending ($pendingCount)', 'pending', current == 'pending'),
                const SizedBox(width: 8),
                _buildFilterChip('Zero-Rated ($exemptCount)', 'exempt', current == 'exempt'),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildFilterChip(String label, String value, bool isSelected) {
    return GestureDetector(
      onTap: () => controller.setInvoiceFilter(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1).withValues(alpha: 0.2) : const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? const Color(0xFF818CF8) : AppColors.textMuted,
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildInvoiceCard(BuildContext context, GovInvoiceModel inv) {
    final issueStr = inv.issueDate != null ? DateFormat('dd MMM yyyy').format(inv.issueDate!) : '—';
    final dueStr = inv.dueDate != null ? DateFormat('dd MMM yyyy').format(inv.dueDate!) : '—';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Code Badge + Status Pill
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF334155), width: 1),
                    ),
                    child: Text(
                      inv.code,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () => controller.copyToClipboard(inv.code, 'Invoice number'),
                    child: const Icon(Icons.copy_rounded, color: AppColors.textMuted, size: 14),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: inv.statusBgColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: inv.statusColor.withValues(alpha: 0.5), width: 0.8),
                ),
                child: Text(
                  inv.displayStatus,
                  style: TextStyle(
                    color: inv.statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Title / Particulars
          Text(
            inv.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),

          // PO / Reference number
          if (inv.poReference.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                'Reference: ${inv.poReference}',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
              ),
            ),

          // Date & Amount Strip
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Issued: $issueStr', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    const SizedBox(height: 2),
                    Text('Due: $dueStr', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      inv.isExempt ? '₹0.00 (Exempt)' : '₹${inv.totalAmount.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: inv.isExempt ? const Color(0xFF3B82F6) : Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      inv.isExempt ? 'Zero-Rated Statutory' : 'Incl. 18% GST',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _showInvoiceDetailsModal(context, inv),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF334155)),
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.remove_red_eye_outlined, color: Colors.white70, size: 14),
                  label: const Text('View Breakdown', style: TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: () => _showDownloadSheet(context, inv),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF6366F1), width: 1.2),
                  backgroundColor: const Color(0xFF6366F1).withValues(alpha: 0.1),
                  padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.download_rounded, color: Color(0xFF818CF8), size: 14),
                label: const Text('Download', style: TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // 6. TRANSACTIONS TAB
  // ----------------------------------------------------
  Widget _buildTransactionsTab(BuildContext context) {
    return Obx(() {
      final list = controller.filteredTransactions;
      if (list.isEmpty) {
        return _buildEmptyState('No treasury payment records found.');
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (ctx, i) => const SizedBox(height: 12),
        itemBuilder: (ctx, i) {
          final tx = list[i];
          final dateStr = tx.createdAt != null ? DateFormat('dd MMM yyyy, hh:mm a').format(tx.createdAt!) : '—';

          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          tx.transactionId,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11.5,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: () => controller.copyToClipboard(tx.transactionId, 'Transaction ID'),
                          child: const Icon(Icons.copy_rounded, color: AppColors.textMuted, size: 13),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        tx.status.toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  tx.description,
                  style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Rail: ${tx.paymentMethod}', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                        if (tx.utr.isNotEmpty)
                          Text('UTR: ${tx.utr}', style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10)),
                        Text(dateStr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                      ],
                    ),
                    Text(
                      '₹${tx.amount.toStringAsFixed(2)}',
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      );
    });
  }

  // ----------------------------------------------------
  // 7. QUOTAS TAB
  // ----------------------------------------------------
  Widget _buildQuotasTab(BuildContext context) {
    return Obx(() {
      final sub = controller.subscription.value;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Operational Quotas & Transit Capacity',
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Allocated capacity under Ministry Sovereign Agreement.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
            const SizedBox(height: 18),
            _buildQuotaFullBar(
              title: 'Active Monitored Buses',
              used: sub.busesUsed,
              limit: sub.busesLimit,
              percent: sub.busesPercent,
              color: const Color(0xFF3B82F6),
            ),
            const SizedBox(height: 16),
            _buildQuotaFullBar(
              title: 'Connected Display Screens',
              used: sub.displaysUsed,
              limit: sub.displaysLimit,
              percent: sub.displaysPercent,
              color: const Color(0xFF8B5CF6),
            ),
            const SizedBox(height: 16),
            _buildQuotaFullBar(
              title: 'Transit Depots & Secretarial Divisions',
              used: sub.depotsUsed,
              limit: sub.depotsLimit,
              percent: sub.depotsPercent,
              color: const Color(0xFFF59E0B),
            ),
            const SizedBox(height: 16),
            _buildQuotaFullBar(
              title: 'Authorized Officers & Operators',
              used: sub.operatorsUsed,
              limit: sub.operatorsLimit,
              percent: sub.operatorsPercent,
              color: const Color(0xFF10B981),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildQuotaFullBar({
    required String title,
    required int used,
    required int limit,
    required double percent,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
            Text('$used / $limit (${(percent * 100).toStringAsFixed(0)}%)',
                style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: percent,
            backgroundColor: const Color(0xFF0F172A),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
      ],
    );
  }

  // ----------------------------------------------------
  // 8. SUPPORT & STATUTORY FOOTER
  // ----------------------------------------------------
  Widget _buildSupportCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.help_outline_rounded, color: Color(0xFF818CF8), size: 20),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Need Ministry Exemption Documentation?',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Contact VMOVEXA Government Desk at billing@vmovexa.com',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        children: [
          const Icon(Icons.receipt_long_outlined, color: AppColors.textMuted, size: 36),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // 9. MODALS & BOTTOM SHEETS
  // ----------------------------------------------------
  void _showInvoiceDetailsModal(BuildContext context, GovInvoiceModel inv) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        inv.code,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        inv.displayStatus,
                        style: TextStyle(color: inv.statusColor, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const Divider(color: Color(0xFF334155), height: 20),

              // Customer / Agency Info
              const Text('RECIPIENT AGENCY', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(inv.customerName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              Text(inv.billingAddress, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
              Text('GSTIN: ${inv.gstin} · PAN: ${inv.pan}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontFamily: 'monospace')),
              const SizedBox(height: 14),

              // Line Items
              const Text('ITEMIZED BREAKDOWN', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  children: [
                    ...inv.items.map((it) => Padding(
                          padding: const EdgeInsets.all(10),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(it.description, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 2),
                                    Text('HSN: ${it.hsnCode} · Qty: ${it.quantity} @ ₹${it.unitRate}',
                                        style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                                  ],
                                ),
                              ),
                              Text(
                                it.total == 0 ? '₹0.00' : '₹${it.total.toStringAsFixed(2)}',
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Total Calculation Card
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    _buildCalcRow('Subtotal (Taxable Value)', '₹${inv.subtotal.toStringAsFixed(2)}'),
                    const SizedBox(height: 4),
                    _buildCalcRow('CGST (9%)', '₹${(inv.taxAmount / 2).toStringAsFixed(2)}'),
                    const SizedBox(height: 4),
                    _buildCalcRow('SGST (9%)', '₹${(inv.taxAmount / 2).toStringAsFixed(2)}'),
                    const Divider(color: Color(0xFF334155), height: 16),
                    _buildCalcRow(
                      'Grand Total',
                      inv.isExempt ? '₹0.00 (Zero-Rated)' : '₹${inv.totalAmount.toStringAsFixed(2)}',
                      isBold: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // UTR reference
              if (inv.utr.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Payment Reference: ${inv.utr}',
                          style: const TextStyle(color: Color(0xFF10B981), fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.back();
                    _showDownloadSheet(context, inv);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.download_rounded, color: Colors.white, size: 16),
                  label: const Text('Download Official Tax Invoice', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildCalcRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: isBold ? Colors.white : AppColors.textMuted,
            fontSize: isBold ? 13 : 11,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: isBold ? const Color(0xFF10B981) : Colors.white,
            fontSize: isBold ? 14 : 11.5,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.w600,
          ),
        ),
      ],
    );
  }

  void _showDownloadSheet(BuildContext context, GovInvoiceModel inv) {
    final downloadUrl = inv.htmlDownloadUrl;

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Download Tax Invoice',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Official receipt for ${inv.code} is available on the secure VMOVEXA Billing Gateway.',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
            const SizedBox(height: 18),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.link_rounded, color: Color(0xFF818CF8), size: 20),
              ),
              title: const Text('Copy Invoice Web URL', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              subtitle: const Text('Copy direct HTTPS link to view in browser', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              onTap: () {
                Get.back();
                controller.copyToClipboard(downloadUrl, 'Invoice URL');
              },
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.copy_all_rounded, color: Color(0xFF10B981), size: 20),
              ),
              title: const Text('Copy Invoice Reference Number', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              subtitle: Text(inv.code, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontFamily: 'monospace')),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              onTap: () {
                Get.back();
                controller.copyToClipboard(inv.code, 'Invoice reference');
              },
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }
}
