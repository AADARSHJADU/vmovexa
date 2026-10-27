import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../../../../../widgets/custom_button.dart';
import '../controller/revenue_reporting_controller.dart';
import '../model/report_models.dart';

class ReportGeneratedView extends GetView<RevenueReportingController> {
  const ReportGeneratedView({super.key});

  static const Color kBg = Color(0xFF0D0D15);
  static const Color kCardBg = Color(0xFF151522);
  static const Color kBorderColor = Color(0xFF232336);

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          final rep = controller.generatedReport.value ??
              RecentReport(
                id: 'REP-1042',
                title: 'Revenue & Collections Statement',
                period: '${controller.startDate.value} → ${controller.endDate.value}',
                dateText: DateFormat('dd MMM yyyy').format(DateTime.now()),
                format: ReportFormat.csv,
                fileSizeText: '26.4 KB',
                totalRevenue: controller.totalRevenue.value,
                subRevenue: controller.subRevenue.value,
                campaignRevenue: controller.campaignRevenue.value,
                taxTotal: controller.taxTotal.value,
                activeSubs: controller.activeSubs.value,
                activeCampaigns: controller.activeCampaigns.value,
              );

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Top close button
                Align(
                  alignment: Alignment.topLeft,
                  child: IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                    style: IconButton.styleFrom(
                      backgroundColor: const Color(0xFF1C1C2D),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.all(8),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Green Success Checkmark Badge matching Admin Panel
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: const Color(0xFF064E3B).withOpacity(0.4),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.5), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF10B981).withOpacity(0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.check_rounded, color: Color(0xFF10B981), size: 38),
                  ),
                ),
                const SizedBox(height: 18),

                const Text(
                  'Report Generated Successfully!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Your statement has been compiled and is ready for export and audit sharing.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white54, fontSize: 12, height: 1.4),
                ),
                const SizedBox(height: 24),

                // Detailed Summary Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: kBorderColor),
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
                                const Text(
                                  'STATEMENT TITLE',
                                  style: TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  rep.title,
                                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E3A8A).withOpacity(0.4),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4)),
                            ),
                            child: Text(
                              rep.id,
                              style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Color(0xFF28283E), height: 1),
                      const SizedBox(height: 16),
                      // 2x2 Details Grid
                      Row(
                        children: [
                          Expanded(
                            child: _buildDetailCell(
                              label: 'REPORTING PERIOD',
                              value: rep.period,
                              valueColor: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildDetailCell(
                              label: 'TOTAL REVENUE',
                              value: currencyFormatter.format(rep.totalRevenue),
                              valueColor: const Color(0xFF60A5FA),
                              isMono: true,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _buildDetailCell(
                              label: 'ACTIVE SUBSCRIPTIONS',
                              value: '${rep.activeSubs} Plans (${currencyFormatter.format(rep.subRevenue)})',
                              valueColor: const Color(0xFF818CF8),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildDetailCell(
                              label: 'CAMPAIGNS & TAX',
                              value: '${rep.activeCampaigns} Ads • Tax: ${currencyFormatter.format(rep.taxTotal)}',
                              valueColor: const Color(0xFF34D399),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Action Buttons matching Admin Panel
                CustomButton(
                  text:  'Download CSV Package',
                  onTap:(){
                    controller.downloadReportCsv(rep);
                  },
                ),
                // SizedBox(
                //   width: double.infinity,
                //   child: ElevatedButton.icon(
                //     onPressed: () => controller.downloadReportCsv(rep),
                //     icon: const Icon(Icons.download_rounded, color: Colors.white, size: 18),
                //     label: const Text(
                //       'Download CSV Package',
                //       style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                //     ),
                //     style: ElevatedButton.styleFrom(
                //       backgroundColor: const Color(0xFF3B82F6),
                //       padding: const EdgeInsets.symmetric(vertical: 14),
                //       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                //       elevation: 0,
                //     ),
                //   ),
                // ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF28283E)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text(
                      'Back to Reports Archive',
                      style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                GestureDetector(
                  onTap: () => Get.offAllNamed(Routes.FINANCE_DASHBOARD),
                  child: const Text(
                    'Go to Dashboard',
                    style: TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildDetailCell({
    required String label,
    required String value,
    required Color valueColor,
    bool isMono = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: valueColor,
            fontSize: 12.5,
            fontWeight: FontWeight.bold,
            fontFamily: isMono ? 'monospace' : null,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
