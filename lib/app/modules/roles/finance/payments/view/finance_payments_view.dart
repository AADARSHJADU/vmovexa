import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';
import '../controller/finance_payments_controller.dart';

class FinancePaymentsView extends GetView<FinancePaymentsController> {
  const FinancePaymentsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6366F1);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kAmber = Color(0xFFF59E0B);
  static const Color kRed = Color(0xFFEF4444);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<FinancePaymentsController>()) {
      Get.put(FinancePaymentsController());
    }

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value &&
              controller.paymentsLedger.isEmpty &&
              controller.campaignPayments.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: kPurple));
          }

          return RefreshIndicator(
            color: kPurple,
            backgroundColor: kCardBg,
            onRefresh: controller.onRefresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              children: [
                _buildHeader(),
                const SizedBox(height: 16),
                _buildTabSelector(),
                const SizedBox(height: 16),
                _buildSearchBar(),
                const SizedBox(height: 16),
                controller.selectedTab.value == 0
                    ? _buildLedgerSection()
                    : _buildCampaignSection(),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- Header (Mirroring PaymentsListPage.jsx) ----------------
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Finance Portal  /  ',
              style: TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
            const Text(
              'Payment Settlements',
              style: TextStyle(
                color: Color(0xFF60A5FA),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            IconButton(
              onPressed: controller.onRefresh,
              icon: const Icon(Icons.refresh, color: Colors.white70, size: 18),
              tooltip: 'Refresh Settlements',
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          'Payment Settlements',
          style: GoogleFonts.raleway(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          'Audit inward collections, bank gateway settlements, and unpaid client receivables',
          style: GoogleFonts.raleway(
            color: Colors.white54,
            fontSize: 11.5,
          ),
        ),
      ],
    );
  }

  // ---------------- Tab Selector ----------------
  Widget _buildTabSelector() {
    return Obx(() {
      final tab = controller.selectedTab.value;
      return Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0x14FFFFFF)),
        ),
        child: Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => controller.selectedTab.value = 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    gradient: tab == 0 ? AppTheme.primaryGradient : null,
                    color: tab == 0 ? null : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: tab == 0
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientPink.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.account_balance_wallet_outlined, size: 16, color: Colors.white),
                      const SizedBox(width: 6),
                      Text(
                        'Payments Ledger',
                        style: TextStyle(
                          color: tab == 0 ? Colors.white : Colors.white60,
                          fontWeight: tab == 0 ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => controller.selectedTab.value = 1,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    gradient: tab == 1 ? AppTheme.primaryGradient : null,
                    color: tab == 1 ? null : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: tab == 1
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientPink.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.campaign_outlined, size: 16, color: Colors.white),
                      const SizedBox(width: 6),
                      Text(
                        'Campaign Payments',
                        style: TextStyle(
                          color: tab == 1 ? Colors.white : Colors.white60,
                          fontWeight: tab == 1 ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  // ---------------- Search ----------------
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B27),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0x14FFFFFF)),
      ),
      child: TextField(
        controller: controller.searchController,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          hintText: controller.selectedTab.value == 0
              ? 'Search by transaction ID or customer...'
              : 'Search by campaign or advertiser...',
          hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
          prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 18),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  // ---------------- Ledger List ----------------
  Widget _buildLedgerSection() {
    final list = controller.filteredLedger;
    if (list.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40),
        alignment: Alignment.center,
        child: const Text('No payment ledger entries found', style: TextStyle(color: Colors.white38)),
      );
    }

    return Column(
      children: list.map((item) {
        final txId = (item['transaction_id'] ?? item['id'] ?? 'TXN-001').toString();
        final customer = (item['customer_name'] ?? item['billing_name'] ?? 'Enterprise').toString();
        final date = (item['date'] ?? 'Recent').toString();
        final method = (item['payment_method'] ?? 'Bank Wire').toString();
        final amount = double.tryParse((item['amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        final status = (item['status'] ?? 'paid').toString().toLowerCase();

        Color statusColor = kGreen;
        String statusLabel = 'PAID';
        if (status == 'pending') {
          statusColor = kAmber;
          statusLabel = 'PENDING';
        } else if (status == 'overdue' || status == 'failed') {
          statusColor = kRed;
          statusLabel = 'OVERDUE';
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0x14FFFFFF)),
          ),
          child: InkWell(
            onTap: () => controller.openPaymentDetail(item),
            borderRadius: BorderRadius.circular(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      txId,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: statusColor.withOpacity(0.4)),
                      ),
                      child: Text(
                        statusLabel,
                        style: TextStyle(color: statusColor, fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(customer, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Icon(Icons.calendar_today_outlined, size: 12, color: Colors.white38),
                    const SizedBox(width: 4),
                    Text(date, style: const TextStyle(color: Colors.white38, fontSize: 11.5)),
                    const SizedBox(width: 12),
                    Icon(Icons.payment, size: 12, color: Colors.white38),
                    const SizedBox(width: 4),
                    Text(method, style: const TextStyle(color: Colors.white38, fontSize: 11.5)),
                    const Spacer(),
                    Text(
                      '\u20b9${amount.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
                if (status != 'paid') ...[
                  const SizedBox(height: 10),
                  const Divider(color: Color(0x14FFFFFF), height: 1),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton.icon(
                      onPressed: () => controller.sendReminder(txId, customer),
                      icon: const Icon(Icons.send, size: 14, color: kIndigo),
                      label: const Text('Send Reminder', style: TextStyle(color: kIndigo, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ---------------- Campaign Payments List ----------------
  Widget _buildCampaignSection() {
    final list = controller.filteredCampaigns;
    if (list.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40),
        alignment: Alignment.center,
        child: const Text('No campaign payment settlements found', style: TextStyle(color: Colors.white38)),
      );
    }

    return Column(
      children: list.map((item) {
        final id = (item['id'] ?? '').toString();
        final name = (item['campaign_name'] ?? item['name'] ?? 'Campaign').toString();
        final adv = (item['advertiser_name'] ?? 'Advertiser').toString();
        final budget = double.tryParse((item['budget'] ?? item['amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        final status = (item['status'] ?? 'pending').toString().toLowerCase();

        final isSettled = status == 'settled' || status == 'paid';

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0x14FFFFFF)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      name,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: (isSettled ? kGreen : kAmber).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: (isSettled ? kGreen : kAmber).withOpacity(0.4)),
                    ),
                    child: Text(
                      isSettled ? 'SETTLED' : 'PENDING WIRE',
                      style: TextStyle(
                        color: isSettled ? kGreen : kAmber,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text('Advertiser: $adv', style: const TextStyle(color: Colors.white70, fontSize: 12.5)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Campaign Budget:', style: TextStyle(color: Colors.white38, fontSize: 12)),
                  Text(
                    '\u20b9${budget.toStringAsFixed(2)}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ],
              ),
              if (!isSettled) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => controller.sharePaymentLink(id, name),
                        icon: const Icon(Icons.share, size: 14, color: kIndigo),
                        label: const Text('Share Link', style: TextStyle(color: kIndigo, fontSize: 12, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: kIndigo),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: CustomButton(
                        text: 'Record Pay',
                        prefixIcon: const Icon(Icons.check, size: 14, color: Colors.white),
                        onTap: () => controller.openManualPayDialog(item),
                        height: 38,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      }).toList(),
    );
  }
}
