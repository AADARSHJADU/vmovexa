import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';

const Color kBgColor = Color(0xFF0C0C14);
const Color kCardBg = Color(0xFF13131F);
const Color kInputBg = Color(0xFF1B1B2A);
const Color kBorderColor = Color(0xFF232336);

class StartReconciliationView extends GetView<FinancialReconciliationController> {
  const StartReconciliationView({super.key});

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

    return Column(
      children: [
        // Top App Bar
        _buildAppBar(),

        // Scrollable Body
        Expanded(
          child: Obx(() {
            if (controller.isLoadingTxns.value && controller.transactions.isEmpty) {
              return const Center(child: CircularProgressIndicator(color: Color(0xFF1C68FD)));
            }

            final txns = controller.transactions;
            final matchedCount = txns.where((t) => t.status == 'Matched' || t.variance == 0.0).length;
            final unmatchedCount = txns.where((t) => t.status != 'Matched' && t.variance != 0.0).length;

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 3 Snapshot KPI Cards matching Admin Panel 1:1
                  _buildMiniKpiRow(txns.length, matchedCount, unmatchedCount),
                  const SizedBox(height: 16),
                  Obx(() {
                    final isMatching = controller.isAutoMatching.value;
                    return Center(
                      child: GestureDetector(
                        onTap: isMatching ? null : controller.runAutoMatch,
                        child: Container(
                          height: 36,
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            gradient: isMatching ? null : AppTheme.primaryGradient,
                            color: isMatching ? const Color(0xFF374151) : null,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              if (!isMatching)
                                BoxShadow(
                                  color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isMatching)
                                const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              else
                                const Icon(Icons.speed_rounded, color: Colors.white, size: 15),
                              const SizedBox(width: 6),
                              Text(
                                isMatching ? 'matching'.tr : 'auto_match_records'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                  const SizedBox(height: 16),

                  // Transaction Comparison Feed Container
                  _buildComparisonFeed(txns, currencyFormatter),
                  const SizedBox(height: 20),
                ],
              ),
            );
          }),
        ),

        // Bottom Completion Bar
        _buildBottomBar(),
      ],
    );
  }

  // ==========================================
  // TOP APP BAR
  // ==========================================
  Widget _buildAppBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(bottom: BorderSide(color: kBorderColor, width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: controller.backToRoster,
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.all(8),
              minimumSize: const Size(36, 36),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(() {
              final acc = controller.selectedAccount.value;
              final title = acc?.name ?? 'consolidated_corporate_accounts'.tr;
              final sub = '${acc?.accountNumber ?? "all_active_feeds".tr} · ${'real_time_ledger_tally'.tr}';

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'reconciliation_wizard'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$title ($sub)',
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              );
            }),
          ),
          IconButton(
            onPressed: () => controller.loadTransactions(),
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              minimumSize: const Size(36, 36),
            ),
            tooltip: 'refresh'.tr,
          ),

        ],
      ),
    );
  }

  // ==========================================
  // 3 SNAPSHOT MINI-KPI ROW
  // ==========================================
  Widget _buildMiniKpiRow(int total, int matched, int unmatched) {
    return Row(
      children: [
        Expanded(
          child: _buildMiniCard(
            label: 'total_compared'.tr.toUpperCase(),
            value: '$total',
            valColor: Colors.white,
            border: kBorderColor,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMiniCard(
            label: 'matched_zero_var'.tr.toUpperCase(),
            value: '$matched',
            valColor: const Color(0xFF34D399),
            border: const Color(0xFF064E3B),
            bg: const Color(0xFF064E3B).withValues(alpha: 0.15),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMiniCard(
            label: 'unmatched'.tr.toUpperCase(),
            value: '$unmatched',
            valColor: unmatched > 0 ? const Color(0xFFFBBF24) : Colors.white38,
            border: kBorderColor,
          ),
        ),
      ],
    );
  }

  Widget _buildMiniCard({
    required String label,
    required String value,
    required Color valColor,
    required Color border,
    Color? bg,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: bg ?? kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TRANSACTION COMPARISON FEED
  // ==========================================
  Widget _buildComparisonFeed(List<ReconciliationTransactionModel> txns, NumberFormat formatter) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title & Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'comparison_feed'.tr.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'comparison_feed_sub'.tr,
                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: Text(
                  '● ${'bank_live_connected'.tr}',
                  style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (txns.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 36),
              alignment: Alignment.center,
              child: Text(
                'no_recon_txns'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 12),
              ),
            )
          else
            ...txns.map((row) => _buildTxnComparisonRow(row, formatter)),
        ],
      ),
    );
  }

  Widget _buildTxnComparisonRow(ReconciliationTransactionModel row, NumberFormat formatter) {
    final isMatched = row.status == 'Matched' || row.variance == 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kInputBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF28283E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row Header: Date, Ref, Status & Verified Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    row.date,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    row.refNumber,
                    style: const TextStyle(color: Colors.white38, fontSize: 10.5, fontFamily: 'monospace'),
                  ),
                ],
              ),
              Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: isMatched
                          ? const Color(0xFF064E3B).withValues(alpha: 0.5)
                          : const Color(0xFF881337).withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isMatched
                            ? const Color(0xFF10B981).withValues(alpha: 0.4)
                            : const Color(0xFFFB7185).withValues(alpha: 0.4),
                      ),
                    ),
                    child: Text(
                      '● ${isMatched ? 'matched'.tr : 'discrepancy'.tr}',
                      style: TextStyle(
                        color: isMatched ? const Color(0xFF34D399) : const Color(0xFFFB7185),
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF064E3B).withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_rounded, color: Color(0xFF34D399), size: 11),
                        const SizedBox(width: 2),
                        Text(
                          'verified'.tr,
                          style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Description
          Text(
            row.description,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),

          // 3 Sub-amounts: Bank Statement, Book Ledger, Variance
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF131320),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildAmountCell('bank_statement'.tr.toUpperCase(), formatter.format(row.bankStatement), Colors.white),
                _buildAmountCell('book_ledger'.tr.toUpperCase(), formatter.format(row.bookLedger), Colors.white70),
                _buildAmountCell(
                  'variance'.tr.toUpperCase(),
                  row.variance == 0.0 ? '₹0.00' : formatter.format(row.variance),
                  row.variance == 0.0 ? const Color(0xFF34D399) : const Color(0xFFFB7185),
                  isBold: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmountCell(String label, String value, Color valColor, {bool isBold = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: valColor,
            fontSize: 11.5,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  // ==========================================
  // BOTTOM ACTION BAR
  // ==========================================
  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(top: BorderSide(color: kBorderColor, width: 1)),
      ),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: controller.backToRoster,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF374151)),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'cancel'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Obx(() {
            final isFinalizing = controller.isFinalizing.value;
            return GestureDetector(
              onTap: isFinalizing ? null : controller.finalizeReconciliation,
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  gradient: isFinalizing ? null : AppTheme.primaryGradient,
                  color: isFinalizing ? const Color(0xFF374151) : null,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    if (!isFinalizing)
                      BoxShadow(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                  ],
                ),
                child: Center(
                  child: isFinalizing
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'finalizing'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 16),
                            const SizedBox(width: 6),
                            Text(
                              'finalize_confirm_reconciliation'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
