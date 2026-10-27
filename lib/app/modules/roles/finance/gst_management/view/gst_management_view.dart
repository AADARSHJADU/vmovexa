import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/gst_management_controller.dart';
import '../model/gst_model.dart';

class GSTManagementView extends GetView<GSTManagementController> {
  const GSTManagementView({super.key});

  static const Color kBg = Color(0xFF0D0D15);
  static const Color kCardBg = Color(0xFF151522);
  static const Color kBorderColor = Color(0xFF232336);
  static const Color kInputBg = Color(0xFF1B1B2C);

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(),
            _buildTabBar(),
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.gstSummary.value == null) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppTheme.gradientBlue),
                  );
                }

                final summary = controller.gstSummary.value ??
                    GstSummaryModel(
                      taxableValue: 10250000.0,
                      cgst: 922500.0,
                      sgst: 922500.0,
                      igst: 0.0,
                      totalGst: 1845000.0,
                      netPayable: 1845000.0,
                      legalName: 'VMOVEXA PRIVATE LIMITED',
                      gstin: '27M4BCY934D12S',
                      state: 'Maharashtra (State Code: 27)',
                      filingFrequency: 'Monthly (GSTR-1 & GSTR-3B)',
                      jurisdiction: 'Commissionerate: Mumbai East, Division: BKC',
                      gstinList: [],
                      breakup: [],
                    );

                return TabBarView(
                  controller: controller.tabController,
                  children: [
                    _buildOverviewAndGstinTab(summary, currencyFormatter),
                    _buildAmountsAndBreakupTab(summary, currencyFormatter),
                    _buildReturnsAndActionsTab(summary),
                  ],
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // TOP APP BAR
  // ==========================================
  Widget _buildAppBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF13131F),
        border: Border(bottom: BorderSide(color: Color(0xFF1F1F30), width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Get.back(),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'GST & Tax Returns',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                    ),
                    // const SizedBox(width: 8),
                    // Container(
                    //   padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    //   decoration: BoxDecoration(
                    //     color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                    //     borderRadius: BorderRadius.circular(6),
                    //     border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                    //   ),
                    //   child: const Text(
                    //     '● GST Verified',
                    //     style: TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                    //   ),
                    // ),
                  ],
                ),
                const SizedBox(height: 2),
                const Text(
                  'Manage enterprise GSTIN registrations & return filings',
                  style: TextStyle(color: Colors.white54, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: controller.loadGSTData,
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              minimumSize: const Size(36, 36),
            ),
            tooltip: 'Refresh',
          ),
          // const SizedBox(width: 6),
          // TextButton.icon(
          //   onPressed: controller.openOfficialGstPortal,
          //   icon: const Icon(Icons.language_rounded, color: Color(0xFF60A5FA), size: 14),
          //   label: const Text(
          //     'Portal ↗',
          //     style: TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
          //   ),
          //   style: TextButton.styleFrom(
          //     backgroundColor: const Color(0xFF1C1C2D),
          //     padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          //     minimumSize: Size.zero,
          //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          //   ),
          // ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB BAR WITH AppTheme.primaryGradient
  // ==========================================
  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderColor),
      ),
      child: TabBar(
        controller: controller.tabController,
        indicator: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: AppTheme.gradientPink.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white60,
        labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
        unselectedLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        tabs: const [
          Tab(text: 'GST Overview & GSTIN'),
          Tab(text: 'Amounts & Breakup'),
          Tab(text: 'Returns & Filings'),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: GST OVERVIEW & GSTIN (CORPORATE REGISTRATION)
  // ==========================================
  Widget _buildOverviewAndGstinTab(GstSummaryModel summary, NumberFormat currencyFormatter) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 4 Overview KPI Cards
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.4,
            children: [
              _buildMetricCard(
                title: 'TOTAL TAXABLE VALUE',
                value: currencyFormatter.format(summary.taxableValue),
                sub: 'Billed outward sales',
                valColor: Colors.white,
              ),
              _buildMetricCard(
                title: 'CGST ACCRUED',
                value: currencyFormatter.format(summary.cgst),
                sub: 'Central GST (9%)',
                valColor: const Color(0xFF34D399),
              ),
              _buildMetricCard(
                title: 'SGST ACCRUED',
                value: currencyFormatter.format(summary.sgst),
                sub: 'State GST (9%)',
                valColor: const Color(0xFF60A5FA),
              ),
              _buildMetricCard(
                title: 'TOTAL GST LIABILITY',
                value: currencyFormatter.format(summary.totalGst),
                sub: 'Aggregate liability',
                valColor: const Color(0xFFA78BFA),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Corporate GST Registration Card
          Container(
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CORPORATE GST REGISTRATION',
                          style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                        ),
                        Text(
                          'Verified Goods & Services Tax Identification',
                          style: TextStyle(color: Colors.white38, fontSize: 10),
                        ),
                      ],
                    ),
                    // Container(
                    //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    //   decoration: BoxDecoration(
                    //     color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                    //     borderRadius: BorderRadius.circular(12),
                    //     border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                    //   ),
                    //   child: const Text(
                    //     'Active Regular',
                    //     style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
                    //   ),
                    // ),
                  ],
                ),
                const SizedBox(height: 14),
                _buildRegField('LEGAL ENTITY NAME', summary.legalName),
                const SizedBox(height: 10),
                _buildRegField('GSTIN REGISTRATION', summary.gstin, isMono: true, highlightColor: const Color(0xFF60A5FA)),
                const SizedBox(height: 10),
                _buildRegField('PRINCIPAL PLACE OF BUSINESS', summary.state),
                const SizedBox(height: 10),
                _buildRegField('FILING CYCLE', summary.filingFrequency),
                const SizedBox(height: 10),
                _buildRegField('ADMINISTRATIVE JURISDICTION', summary.jurisdiction),
                const SizedBox(height: 16),
                CustomButton(
                  text: 'Download Form GST Certificate',
                  onTap: controller.downloadReg06Certificate,
                  isGradient: true,
                  height: 46,
                  // prefixIcon: const Icon(Icons.description_outlined, color: Colors.white, size: 16),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Multi-State GSTIN Roster
          Container(
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
                const Text(
                  'MULTI-STATE GSTIN ROSTER',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                ),
                const Text(
                  'State-wise transit licenses and GST registrations',
                  style: TextStyle(color: Colors.white38, fontSize: 10),
                ),
                const SizedBox(height: 14),
                if (summary.gstinList.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: kInputBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              summary.gstin,
                              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                            ),
                            const SizedBox(height: 2),
                            Text('State: ${summary.state} · Regular Taxpayer', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                          ],
                        ),
                        // Container(
                        //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        //   decoration: BoxDecoration(
                        //     color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                        //     borderRadius: BorderRadius.circular(6),
                        //     border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                        //   ),
                        //   child: const Text('● Verified', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold)),
                        // ),
                      ],
                    ),
                  )
                else
                  ...summary.gstinList.map((reg) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: kInputBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF28283E)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  reg.gstin,
                                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${reg.state} · Billed: ${reg.invoicesCount} · Tax: ${currencyFormatter.format(reg.totalTax)}',
                                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                              ),
                              child: Text(
                                '● ${reg.status}',
                                style: const TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      )),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String sub,
    required Color valColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            sub,
            style: const TextStyle(color: Colors.white54, fontSize: 10),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildRegField(String label, String value, {bool isMono = false, Color? highlightColor}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: kInputBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF28283E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
          const SizedBox(height: 3),
          Text(
            value,
            style: TextStyle(
              color: highlightColor ?? Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              fontFamily: isMono ? 'monospace' : null,
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 2: AMOUNTS & HEAD-WISE BREAKUP
  // ==========================================
  Widget _buildAmountsAndBreakupTab(GstSummaryModel summary, NumberFormat currencyFormatter) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 4 Metric cards
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.4,
            children: [
              _buildMetricCard(
                title: 'TAXABLE VALUE',
                value: currencyFormatter.format(summary.taxableValue),
                sub: 'Total outward sales',
                valColor: Colors.white,
              ),
              _buildMetricCard(
                title: 'TOTAL GST LIABILITY',
                value: currencyFormatter.format(summary.totalGst),
                sub: 'Gross output tax',
                valColor: Colors.white,
              ),
              _buildMetricCard(
                title: 'IGST ACCRUED',
                value: currencyFormatter.format(summary.igst),
                sub: 'Interstate tax',
                valColor: const Color(0xFF34D399),
              ),
              _buildMetricCard(
                title: 'NET CASH PAYABLE',
                value: currencyFormatter.format(summary.netPayable),
                sub: 'Post ITC deduction',
                valColor: const Color(0xFF60A5FA),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Head-wise Tax Breakup Table
          Container(
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
                const Text(
                  'GST HEAD-WISE TAX BREAKUP',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                ),
                const Text(
                  'Computed across CGST, SGST, IGST and Compensation Cess',
                  style: TextStyle(color: Colors.white38, fontSize: 10),
                ),
                const SizedBox(height: 14),
                ...summary.breakup.map((row) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: kInputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF28283E)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                row.taxHead,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E3A8A).withValues(alpha: 0.4),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  row.rate,
                                  style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildSubCell('Taxable Value', currencyFormatter.format(row.taxable)),
                              _buildSubCell('Output Tax', currencyFormatter.format(row.amount)),
                              _buildSubCell('ITC Available', currencyFormatter.format(row.itc), valColor: const Color(0xFF34D399)),
                              _buildSubCell('Net Payable', currencyFormatter.format(row.netPayable), valColor: const Color(0xFF60A5FA), isBold: true),
                            ],
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSubCell(String label, String value, {Color? valColor, bool isBold = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: valColor ?? Colors.white70,
            fontSize: 10.5,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.w600,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  // ==========================================
  // TAB 3: RETURNS & FILINGS (GSTR-1, GSTR-3B, GSTR-2B)
  // ==========================================
  Widget _buildReturnsAndActionsTab(GstSummaryModel summary) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card 1: GSTR-1 Return
          _buildReturnCard(
            tag: 'OUTWARD SUPPLIES',
            tagColor: const Color(0xFF60A5FA),
            tagBg: const Color(0xFF1E3A8A).withValues(alpha: 0.4),
            title: 'GSTR-1 Return',
            desc: 'Detailed outward supplies and B2B invoice schedules',
            buttonText: 'Download GSTR-1 JSON',
            onTap: controller.downloadGstr1Json,
            isLoading: controller.downloadingGstr1.value,
            icon: Icons.upload_file_rounded,
          ),
          const SizedBox(height: 14),

          // Card 2: GSTR-3B Return
          _buildReturnCard(
            tag: 'MONTHLY SUMMARY',
            tagColor: const Color(0xFF34D399),
            tagBg: const Color(0xFF064E3B).withValues(alpha: 0.4),
            title: 'GSTR-3B Return',
            desc: 'Tax liability and ITC monthly reconciliation computation',
            buttonText: 'Download Computation (CSV)',
            onTap: controller.downloadGstr3bCsv,
            isLoading: controller.downloadingGstr3b.value,
            icon: Icons.receipt_long_rounded,
          ),
          const SizedBox(height: 14),

          // Card 3: GSTR-2B Statement
          _buildReturnCard(
            tag: 'AUTO-DRAFTED ITC',
            tagColor: const Color(0xFFA78BFA),
            tagBg: const Color(0xFF4C1D95).withValues(alpha: 0.4),
            title: 'GSTR-2B Statement',
            desc: 'Vendor uploaded ITC auto-drafted matched records',
            buttonText: 'Download GSTR-2B (CSV)',
            onTap: controller.downloadGstr2bCsv,
            isLoading: controller.downloadingGstr2b.value,
            icon: Icons.fact_check_rounded,
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildReturnCard({
    required String tag,
    required Color tagColor,
    required Color tagBg,
    required String title,
    required String desc,
    required String buttonText,
    required VoidCallback onTap,
    required bool isLoading,
    required IconData icon,
  }) {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: tagBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  tag,
                  style: TextStyle(color: tagColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                ),
              ),
              Icon(icon, color: tagColor, size: 20),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            desc,
            style: const TextStyle(color: Colors.white54, fontSize: 11.5, height: 1.3),
          ),
          const SizedBox(height: 16),
          CustomButton(
            text: buttonText,
            onTap: onTap,
            isGradient: true,
            height: 46,
            isLoading: isLoading,
            prefixIcon: const Icon(Icons.download_rounded, color: Colors.white, size: 16),
          ),
        ],
      ),
    );
  }
}
