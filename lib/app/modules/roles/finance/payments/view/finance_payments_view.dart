import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/finance_payments_controller.dart';

class FinancePaymentsView extends GetView<FinancePaymentsController> {
  const FinancePaymentsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF13131F);
  static const Color kCardInnerBg = Color(0xFF1B1B2A);
  static const Color kBorderColor = Color(0xFF222235);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kAmber = Color(0xFFF59E0B);
  static const Color kRed = Color(0xFFEF4444);
  static const Color kBlue = Color(0xFF3B82F6);
  static const Color kPurple = Color(0xFF8B5CF6);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<FinancePaymentsController>()) {
      Get.put(FinancePaymentsController());
    }

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: RefreshIndicator(
          color: kPurple,
          backgroundColor: kCardBg,
          onRefresh: controller.onRefresh,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 14),
                      _buildStatusTabs(),
                      const SizedBox(height: 14),
                      _buildSearchAndFilterBar(context),
                      const SizedBox(height: 12),
                      _buildActiveFilterChips(),
                    ],
                  ),
                ),
              ),
              Obx(() {
                if (controller.isLoading.value && controller.payments.isEmpty) {
                  return const SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(color: kPurple),
                    ),
                  );
                }

                if (controller.payments.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: _buildEmptyState(),
                  );
                }

                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        if (index < controller.payments.length) {
                          final item = controller.payments[index];
                          return _buildPaymentCard(context, item);
                        } else {
                          return _buildPaginationControls();
                        }
                      },
                      childCount: controller.payments.length + 1,
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------- HEADER ----------------
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Row(
        //   children: [
        //     Text(
        //       'finance_portal_breadcrumb'.tr,
        //       style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
        //     ),
        //     const SizedBox(width: 4),
        //     Text(
        //       'payment_settlements'.tr,
        //       style: const TextStyle(
        //         color: Color(0xFF60A5FA),
        //         fontSize: 11,
        //         fontWeight: FontWeight.w600,
        //       ),
        //     ),
        //     const Spacer(),
        //     Obx(
        //       () => IconButton(
        //         onPressed: controller.onRefresh,
        //         icon: controller.isRefreshing.value
        //             ? const SizedBox(
        //                 width: 16,
        //                 height: 16,
        //                 child: CircularProgressIndicator(
        //                   strokeWidth: 2,
        //                   color: Colors.white70,
        //                 ),
        //               )
        //             : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
        //         tooltip: 'refresh_settlements'.tr,
        //       ),
        //     ),
        //   ],
        // ),
        // const SizedBox(height: 2),
        Row(
          children: [
            Text(
              'payment_settlements'.tr,
              style: GoogleFonts.raleway(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
              ),
            ),
            const Spacer(),
            Obx(
                  () => IconButton(
                onPressed: controller.onRefresh,
                icon: controller.isRefreshing.value
                    ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white70,
                  ),
                )
                    : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                tooltip: 'refresh_settlements'.tr,
              ),
            ),
          ],
        ),
        const SizedBox(height: 3),
        Text(
          'audit_inward_sub'.tr,
          style: GoogleFonts.raleway(
            color: Colors.white54,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  // ---------------- 4 STATUS TABS ----------------
  Widget _buildStatusTabs() {
    return Obx(() {
      final currentTab = controller.selectedTab.value;
      final tabs = [
        {'id': 0, 'label': 'common_all'.tr, 'count': controller.allCount.value},
        {'id': 1, 'label': 'common_paid'.tr, 'count': controller.paidCount.value},
        {'id': 2, 'label': 'common_pending'.tr, 'count': controller.pendingCount.value},
        {'id': 3, 'label': 'common_failed'.tr, 'count': controller.failedCount.value},
      ];

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: tabs.map((tab) {
            final int id = tab['id'] as int;
            final String label = tab['label'] as String;
            final int count = tab['count'] as int;
            final bool isSelected = currentTab == id;

            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: InkWell(
                onTap: () => controller.switchTab(id),
                borderRadius: BorderRadius.circular(12),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : kBorderColor,
                      width: 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: const Color(0xFF6366F1).withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
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
                          color: isSelected ? Colors.white : Colors.white70,
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                        ),
                      ),
                      if (count > 0 || isSelected) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Colors.white.withValues(alpha: 0.25)
                                : const Color(0xFF202030),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '$count',
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.white60,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  // ---------------- SEARCH AND FILTER BAR ----------------
  Widget _buildSearchAndFilterBar(BuildContext context) {
    return Row(
      children: [
        // Search Input
        Expanded(
          child: Container(
            height: 44,
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorderColor),
            ),
            child: TextField(
              controller: controller.searchController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'search_payments_hint'.tr,
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                prefixIcon: const Icon(Icons.search_rounded, color: Colors.white38, size: 18),
                suffixIcon: Obx(
                  () => controller.searchQuery.value.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, color: Colors.white54, size: 16),
                          onPressed: () {
                            controller.searchController.clear();
                          },
                        )
                      : const SizedBox.shrink(),
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),

        // Filter Button
        Obx(() {
          final filterCount = controller.activeFilterCount;
          final bool hasActiveFilters = filterCount > 0;

          return InkWell(
            onTap: () => _openFilterBottomSheet(context),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              height: 44,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                gradient: hasActiveFilters ? AppTheme.primaryGradient : null,
                color: hasActiveFilters ? null : kCardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: hasActiveFilters ? Colors.transparent : kBorderColor,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.filter_list_rounded,
                    color: hasActiveFilters ? Colors.white : Colors.white70,
                    size: 18,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'filter_label'.tr,
                    style: TextStyle(
                      color: hasActiveFilters ? Colors.white : Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (hasActiveFilters) ...[
                    const SizedBox(width: 5),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '$filterCount',
                        style: const TextStyle(
                          color: Color(0xFF6366F1),
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // ---------------- ACTIVE FILTER CHIPS ----------------
  Widget _buildActiveFilterChips() {
    return Obx(() {
      final chips = <Widget>[];

      if (controller.selectedPayerType.value.isNotEmpty) {
        chips.add(_buildFilterChip(
          '${'filter_payer_type'.tr}: ${formatPayerLabel(controller.selectedPayerType.value)}',
          () => controller.applyFilters(payerType: ''),
        ));
      }
      if (controller.selectedPurpose.value.isNotEmpty) {
        chips.add(_buildFilterChip(
          '${'filter_purpose'.tr}: ${formatPurposeLabel(controller.selectedPurpose.value)}',
          () => controller.applyFilters(purpose: ''),
        ));
      }
      if (controller.selectedMethod.value.isNotEmpty) {
        chips.add(_buildFilterChip(
          '${'filter_method'.tr}: ${formatMethodLabel(controller.selectedMethod.value)}',
          () => controller.applyFilters(method: ''),
        ));
      }
      if (controller.selectedPaymentMode.value.isNotEmpty) {
        chips.add(_buildFilterChip(
          '${'filter_channel'.tr}: ${formatChannelLabel(controller.selectedPaymentMode.value)}',
          () => controller.applyFilters(paymentMode: ''),
        ));
      }
      if (controller.startDate.value.isNotEmpty || controller.endDate.value.isNotEmpty) {
        final startStr = controller.startDate.value.isNotEmpty ? controller.startDate.value : '';
        final endStr = controller.endDate.value.isNotEmpty ? controller.endDate.value : '';
        chips.add(_buildFilterChip(
          '$startStr - $endStr',
          () => controller.applyFilters(fromDate: '', toDate: ''),
        ));
      }
      if (controller.minAmount.value.isNotEmpty || controller.maxAmount.value.isNotEmpty) {
        final minStr = controller.minAmount.value.isNotEmpty ? '₹${controller.minAmount.value}' : '₹0';
        final maxStr = controller.maxAmount.value.isNotEmpty ? '₹${controller.maxAmount.value}' : 'any_amount'.tr;
        chips.add(_buildFilterChip(
          '$minStr - $maxStr',
          () => controller.applyFilters(minAmt: '', maxAmt: ''),
        ));
      }

      if (chips.isEmpty) return const SizedBox.shrink();

      return Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              ...chips,
              TextButton(
                onPressed: controller.resetFilters,
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'clear_all'.tr,
                  style: const TextStyle(
                    color: Color(0xFFF87171),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildFilterChip(String text, VoidCallback onRemove) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E2E),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF33334A)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            text,
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
          ),
          const SizedBox(width: 4),
          InkWell(
            onTap: onRemove,
            child: const Icon(Icons.close_rounded, color: Colors.white54, size: 13),
          ),
        ],
      ),
    );
  }

  // ---------------- PAYMENT CARD (MATCHING ADMIN PANEL) ----------------
  Widget _buildPaymentCard(BuildContext context, Map<String, dynamic> pay) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );

    // Resolve real persisted fields matching Admin Panel logic
    final id = (pay['id'] ?? '').toString();
    final code = (pay['code'] ?? pay['utr_number'] ?? pay['reference_number'] ?? pay['gateway_ref'] ?? id).toString();
    final rawStatus = (pay['status'] ?? '').toString().toLowerCase();

    // Client Name resolution matching PaymentsListPage.jsx
    final invoice = pay['invoice'] is Map ? Map<String, dynamic>.from(pay['invoice']) : null;
    final campaign = pay['campaign'] is Map ? Map<String, dynamic>.from(pay['campaign']) : null;
    final org = pay['organization'] is Map ? Map<String, dynamic>.from(pay['organization']) : null;

    final clientName = (invoice?['customer_name'] ??
            campaign?['client_name'] ??
            campaign?['client_company'] ??
            org?['name'] ??
            pay['customer_name'] ??
            pay['billing_name'] ??
            '—')
        .toString();

    final payerType = (pay['payer_type'] ?? '').toString().replaceAll('_', ' ');
    final purpose = (pay['purpose'] ?? '').toString().replaceAll('_', ' ');

    final amountNum = double.tryParse((pay['amount'] ?? invoice?['total'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final formattedAmount = currencyFormatter.format(amountNum);

    final paymentMode = (pay['payment_mode'] ?? '').toString().toLowerCase();
    final isOffline = paymentMode == 'offline';
    final rawMethod = isOffline ? (pay['offline_method'] ?? pay['method']) : (pay['method'] ?? pay['offline_method']);
    final methodLabel = rawMethod != null ? rawMethod.toString().replaceAll('_', ' ') : '—';

    // Dates
    final paidAtStr = pay['paid_at'] != null ? _formatDate(pay['paid_at'].toString()) : null;
    final createdAtStr = pay['created_at'] != null ? _formatDate(pay['created_at'].toString()) : '—';
    final settlementDate = paidAtStr ?? createdAtStr;

    // UTR / Reference
    final utrRef = (pay['utr_number'] ?? pay['reference_number'] ?? pay['gateway_ref'] ?? '').toString();

    // Status Styling
    final isPaid = rawStatus == 'success' || rawStatus == 'paid';
    final isPending = rawStatus == 'pending' || rawStatus == 'created';
    final isFailed = rawStatus == 'failed' || rawStatus == 'overdue';

    final Color statusColor = isPaid
        ? kGreen
        : isPending
            ? kAmber
            : isFailed
                ? kRed
                : Colors.white70;

    final Color statusBg = statusColor.withValues(alpha: 0.12);
    final Color statusBorder = statusColor.withValues(alpha: 0.3);
    final String statusLabel = isPaid
        ? 'common_paid'.tr
        : isPending
            ? 'common_pending'.tr
            : isFailed
                ? 'common_failed'.tr
                : rawStatus.toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card Header: Code + Status Badge + Mode Tag
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Flexible(
                        child: Text(
                          code,
                          style: GoogleFonts.firaCode(
                            color: const Color(0xFF60A5FA),
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (utrRef.isNotEmpty && utrRef != code) ...[
                        const SizedBox(width: 6),
                        GestureDetector(
                          onTap: () {
                            Clipboard.setData(ClipboardData(text: utrRef));
                            Get.snackbar(
                              'copied_label'.tr,
                              'utr_copied_success'.tr,
                              snackPosition: SnackPosition.BOTTOM,
                              backgroundColor: const Color(0xFF1E293B),
                              colorText: Colors.white,
                              duration: const Duration(seconds: 2),
                            );
                          },
                          child: const Icon(
                            Icons.copy_rounded,
                            size: 13,
                            color: Colors.white38,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (paymentMode.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: isOffline ? kAmber.withValues(alpha: 0.15) : kBlue.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isOffline ? kAmber.withValues(alpha: 0.35) : kBlue.withValues(alpha: 0.35),
                      ),
                    ),
                    child: Text(
                      paymentMode.toUpperCase(),
                      style: TextStyle(
                        color: isOffline ? kAmber : const Color(0xFF93C5FD),
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                ],
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: statusBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFF1C1C2C)),

          // Card Body: Client Name, Meta Tags, Financial Row
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Client Name
                Text(
                  clientName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),

                // Meta Line: Payer Type · Purpose
                if (payerType.isNotEmpty || purpose.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (payerType.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1C1C2E),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            payerType.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      if (payerType.isNotEmpty && purpose.isNotEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 4),
                          child: Text('·', style: TextStyle(color: Colors.white38)),
                        ),
                      if (purpose.isNotEmpty)
                        Flexible(
                          child: Text(
                            purpose.capitalizeFirst ?? purpose,
                            style: const TextStyle(
                              color: Colors.white60,
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                    ],
                  ),
                ],

                const SizedBox(height: 12),

                // Financial Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: kCardInnerBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF262638)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Amount
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'settlement_amount_caps'.tr,
                            style: const TextStyle(
                              color: Colors.white38,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            formattedAmount,
                            style: GoogleFonts.firaCode(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),

                      // Method & Date
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            methodLabel.toUpperCase(),
                            style: const TextStyle(
                              color: Color(0xFF93C5FD),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              const Icon(
                                Icons.calendar_today_rounded,
                                size: 10,
                                color: Colors.white38,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                settlementDate,
                                style: const TextStyle(
                                  color: Colors.white54,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Linked Invoice / Campaign Badge
                if (invoice?['code'] != null || campaign?['code'] != null) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(
                        Icons.link_rounded,
                        size: 13,
                        color: Colors.white38,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'linked_ref'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 10),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        (invoice?['code'] ?? campaign?['code']).toString(),
                        style: GoogleFonts.firaCode(
                          color: const Color(0xFF60A5FA),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          // Action Button: View Details
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
            child: SizedBox(
              width: double.infinity,
              height: 40,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: ElevatedButton.icon(
                  onPressed: () => controller.navigateToDetails(pay),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  icon: const Icon(Icons.visibility_rounded, size: 15, color: Colors.white),
                  label: Text(
                    'view_details'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- PAGINATION CONTROLS ----------------
  Widget _buildPaginationControls() {
    return Obx(() {
      final current = controller.currentPage.value;
      final totalP = controller.totalPages.value;
      final totalI = controller.totalItems.value;

      if (totalI == 0) return const SizedBox.shrink();

      return Container(
        margin: const EdgeInsets.only(top: 8, bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorderColor),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${'page_indicator'.tr} $current / $totalP ($totalI)',
              style: const TextStyle(
                color: Colors.white60,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            Row(
              children: [
                IconButton(
                  onPressed: current > 1 ? () => controller.goToPage(current - 1) : null,
                  icon: const Icon(Icons.chevron_left_rounded),
                  color: Colors.white70,
                  disabledColor: Colors.white24,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: current < totalP ? () => controller.goToPage(current + 1) : null,
                  icon: const Icon(Icons.chevron_right_rounded),
                  color: Colors.white70,
                  disabledColor: Colors.white24,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  // ---------------- EMPTY STATE ----------------
  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A2A),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF28283C)),
              ),
              child: const Icon(
                Icons.account_balance_wallet_outlined,
                size: 44,
                color: Colors.white38,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'no_settlements'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 17,
                fontWeight: FontWeight.w800,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              'no_settlements_desc'.tr,
              style: const TextStyle(
                color: Colors.white54,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
            if (controller.activeFilterCount > 0 || controller.searchQuery.value.isNotEmpty) ...[
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: controller.resetFilters,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF6366F1)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                icon: const Icon(Icons.refresh_rounded, size: 14, color: Color(0xFF818CF8)),
                label: Text(
                  'reset_filters'.tr,
                  style: const TextStyle(color: Color(0xFF818CF8), fontSize: 12),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ---------------- ADVANCED FILTER BOTTOM SHEET ----------------
  void _openFilterBottomSheet(BuildContext context) {
    final tempPayer = controller.selectedPayerType.value.obs;
    final tempPurpose = controller.selectedPurpose.value.obs;
    final tempMethod = controller.selectedMethod.value.obs;
    final tempMode = controller.selectedPaymentMode.value.obs;
    final tempStart = controller.startDate.value.obs;
    final tempEnd = controller.endDate.value.obs;
    final minCtrl = TextEditingController(text: controller.minAmount.value);
    final maxCtrl = TextEditingController(text: controller.maxAmount.value);

    // Exact 8 Filters matching Admin Panel PaymentsListPage.jsx
    final payerOptions = [
      {'value': '', 'label': 'common_all'.tr},
      {'value': 'tenant', 'label': 'payer_tenant_admin'.tr},
      // {'value': 'advertiser', 'label': 'payer_advertiser'.tr},
      {'value': 'government', 'label': 'payer_government'.tr},
      // {'value': 'platform', 'label': 'payer_platform'.tr},
    ];

    final purposeOptions = [
      {'value': '', 'label': 'common_all'.tr},
      {'value': 'saas_subscription', 'label': 'purpose_saas_subscription'.tr},
      // {'value': 'ad_spend', 'label': 'purpose_ad_spend'.tr},
      {'value': 'psa_spend', 'label': 'purpose_psa_spend'.tr},
      // {'value': 'payout', 'label': 'purpose_payout'.tr},
      // {'value': 'wallet_topup', 'label': 'purpose_wallet_topup'.tr},
      // {'value': 'refund', 'label': 'purpose_refund'.tr},
    ];

    final methodOptions = [
      {'value': '', 'label': 'common_all'.tr},
      {'value': 'razorpay', 'label': 'Razorpay'},
      // {'value': 'upi', 'label': 'UPI'},
      // {'value': 'upi_manual', 'label': 'UPI (Manual)'},
      // {'value': 'card', 'label': 'Card'},
      // {'value': 'netbanking', 'label': 'Net banking'},
      // {'value': 'bank_wire', 'label': 'Bank wire'},
      {'value': 'bank_transfer', 'label': 'bank_transfer'.tr},
      // {'value': 'neft', 'label': 'NEFT'},
      // {'value': 'rtgs', 'label': 'RTGS'},
      // {'value': 'imps', 'label': 'IMPS'},
      // {'value': 'cheque', 'label': 'Cheque'},
      // {'value': 'demand_draft', 'label': 'Demand draft'},
      // {'value': 'cash', 'label': 'Cash'},
    ];

    final channelOptions = [
      {'value': '', 'label': 'common_all'.tr},
      {'value': 'online', 'label': 'channel_online'.tr},
      {'value': 'offline', 'label': 'channel_offline'.tr},
    ];

    Get.bottomSheet(
      Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        decoration: const BoxDecoration(
          color: Color(0xFF11111C),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(
            top: BorderSide(color: Color(0xFF26263B), width: 1.5),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Sheet Title & Reset
            Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'filter_settlements'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    tempPayer.value = '';
                    tempPurpose.value = '';
                    tempMethod.value = '';
                    tempMode.value = '';
                    tempStart.value = '';
                    tempEnd.value = '';
                    minCtrl.clear();
                    maxCtrl.clear();
                  },
                  child: Text(
                    'reset_filters'.tr,
                    style: const TextStyle(color: Color(0xFFF87171), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Scrollable Filter Inputs in exact Admin Panel Order
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Payer Type (FilterSelect 1)
                    Obx(
                      () => _buildFilterSelectField(
                        context: context,
                        label: 'filter_payer_type'.tr,
                        currentValue: tempPayer.value,
                        options: payerOptions,
                        onSelected: (val) => tempPayer.value = val,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 2. Purpose (FilterSelect 2)
                    Obx(
                      () => _buildFilterSelectField(
                        context: context,
                        label: 'filter_purpose'.tr,
                        currentValue: tempPurpose.value,
                        options: purposeOptions,
                        onSelected: (val) => tempPurpose.value = val,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 3. Payment Method (FilterSelect 3)
                    Obx(
                      () => _buildFilterSelectField(
                        context: context,
                        label: 'filter_method'.tr,
                        currentValue: tempMethod.value,
                        options: methodOptions,
                        onSelected: (val) => tempMethod.value = val,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 4. Channel (FilterSelect 4)
                    Obx(
                      () => _buildFilterSelectField(
                        context: context,
                        label: 'filter_channel'.tr,
                        currentValue: tempMode.value,
                        options: channelOptions,
                        onSelected: (val) => tempMode.value = val,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 5 & 6. From Date & To Date (FilterInput 5 & 6)
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildSectionTitle('filter_from_date'.tr),
                              Obx(
                                () => _buildDatePickerField(
                                  context,
                                  'filter_from_date'.tr,
                                  tempStart.value,
                                  (selected) => tempStart.value = selected,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildSectionTitle('filter_to_date'.tr),
                              Obx(
                                () => _buildDatePickerField(
                                  context,
                                  'filter_to_date'.tr,
                                  tempEnd.value,
                                  (selected) => tempEnd.value = selected,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // 7 & 8. Minimum Amount & Maximum Amount (FilterInput 7 & 8)
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildSectionTitle('filter_min_amount'.tr),
                              _buildTextField(minCtrl, '₹0'),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildSectionTitle('filter_max_amount'.tr),
                              _buildTextField(maxCtrl, 'any_amount'.tr),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Apply Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ElevatedButton(
                  onPressed: () {
                    Get.back();
                    controller.applyFilters(
                      payerType: tempPayer.value,
                      purpose: tempPurpose.value,
                      method: tempMethod.value,
                      paymentMode: tempMode.value,
                      fromDate: tempStart.value,
                      toDate: tempEnd.value,
                      minAmt: minCtrl.text.trim(),
                      maxAmt: maxCtrl.text.trim(),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'apply_filters'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  // Helper formatting methods matching Admin Panel PaymentsListPage.jsx
  static String formatPayerLabel(String val) {
    final key = val.toLowerCase();
    if (key == 'tenant') return 'payer_tenant_admin'.tr;
    if (key == 'advertiser') return 'payer_advertiser'.tr;
    if (key == 'government') return 'payer_government'.tr;
    if (key == 'platform') return 'payer_platform'.tr;
    return val.isEmpty ? 'common_all'.tr : val;
  }

  static String formatPurposeLabel(String val) {
    final key = val.toLowerCase();
    if (key == 'saas_subscription') return 'purpose_saas_subscription'.tr;
    if (key == 'ad_spend') return 'purpose_ad_spend'.tr;
    if (key == 'psa_spend') return 'purpose_psa_spend'.tr;
    if (key == 'payout') return 'purpose_payout'.tr;
    if (key == 'wallet_topup') return 'purpose_wallet_topup'.tr;
    if (key == 'refund') return 'purpose_refund'.tr;
    return val.isEmpty ? 'common_all'.tr : val;
  }

  static String formatMethodLabel(String val) {
    const map = {
      'razorpay': 'Razorpay',
      'upi': 'UPI',
      'upi_manual': 'UPI (Manual)',
      'card': 'Card',
      'netbanking': 'Net banking',
      'bank_wire': 'Bank wire',
      'bank_transfer': 'Bank transfer',
      'neft': 'NEFT',
      'rtgs': 'RTGS',
      'imps': 'IMPS',
      'cheque': 'Cheque',
      'demand_draft': 'Demand draft',
      'cash': 'Cash',
    };
    return map[val.toLowerCase()] ?? (val.isEmpty ? 'common_all'.tr : val);
  }

  static String formatChannelLabel(String val) {
    final key = val.toLowerCase();
    if (key == 'online') return 'channel_online'.tr;
    if (key == 'offline') return 'channel_offline'.tr;
    return val.isEmpty ? 'common_all'.tr : val;
  }

  Widget _buildFilterSelectField({
    required BuildContext context,
    required String label,
    required String currentValue,
    required List<Map<String, String>> options,
    required Function(String) onSelected,
  }) {
    final selectedOption = options.firstWhere(
      (opt) => opt['value'] == currentValue,
      orElse: () => options.first,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(label),
        InkWell(
          onTap: () {
            _showOptionsSelectorDialog(
              context: context,
              title: label,
              currentValue: currentValue,
              options: options,
              onSelected: onSelected,
            );
          },
          borderRadius: BorderRadius.circular(10),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF1C1C2C),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: currentValue.isNotEmpty ? const Color(0xFF6366F1) : const Color(0xFF2A2A3E),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    selectedOption['label'] ?? 'common_all'.tr,
                    style: TextStyle(
                      color: currentValue.isNotEmpty ? Colors.white : Colors.white70,
                      fontSize: 13,
                      fontWeight: currentValue.isNotEmpty ? FontWeight.w700 : FontWeight.w500,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 20,
                  color: Colors.white54,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showOptionsSelectorDialog({
    required BuildContext context,
    required String title,
    required String currentValue,
    required List<Map<String, String>> options,
    required Function(String) onSelected,
  }) {
    Get.bottomSheet(
      Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.65,
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        decoration: const BoxDecoration(
          color: Color(0xFF13131F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: Color(0xFF2B2B3E), width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.separated(
                physics: const BouncingScrollPhysics(),
                itemCount: options.length,
                separatorBuilder: (_, _) => const Divider(height: 1, color: Color(0xFF1F1F32)),
                itemBuilder: (context, index) {
                  final opt = options[index];
                  final val = opt['value'] ?? '';
                  final lbl = opt['label'] ?? '';
                  final isSelected = val == currentValue;

                  return InkWell(
                    onTap: () {
                      Get.back();
                      onSelected(val);
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              lbl,
                              style: TextStyle(
                                color: isSelected ? const Color(0xFF818CF8) : Colors.white,
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              Icons.check_rounded,
                              size: 18,
                              color: Color(0xFF818CF8),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildDatePickerField(
    BuildContext context,
    String label,
    String currentValue,
    Function(String) onDateSelected,
  ) {
    return InkWell(
      onTap: () async {
        final now = DateTime.now();
        final picked = await showDatePicker(
          context: context,
          initialDate: now,
          firstDate: DateTime(2020),
          lastDate: DateTime(2030),
          builder: (context, child) {
            return Theme(
              data: ThemeData.dark().copyWith(
                colorScheme: const ColorScheme.dark(
                  primary: Color(0xFF6366F1),
                  onPrimary: Colors.white,
                  surface: Color(0xFF151522),
                  onSurface: Colors.white,
                ),
              ),
              child: child!,
            );
          },
        );
        if (picked != null) {
          final formatted = DateFormat('yyyy-MM-dd').format(picked);
          onDateSelected(formatted);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF1C1C2C),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF2A2A3E)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              currentValue.isNotEmpty ? currentValue : label,
              style: TextStyle(
                color: currentValue.isNotEmpty ? Colors.white : Colors.white38,
                fontSize: 11,
              ),
            ),
            const Icon(Icons.calendar_today_rounded, size: 14, color: Colors.white38),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String hint) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1C1C2C),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF2A2A3E)),
      ),
      child: TextField(
        controller: ctrl,
        keyboardType: TextInputType.number,
        style: const TextStyle(color: Colors.white, fontSize: 12),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
      ),
    );
  }

  String _formatDate(String isoDate) {
    try {
      final dt = DateTime.parse(isoDate);
      return DateFormat('dd MMM yyyy').format(dt);
    } catch (_) {
      return isoDate;
    }
  }
}
