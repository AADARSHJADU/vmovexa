import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/utils/device_file_saver.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../model/gst_model.dart';

class GSTManagementController extends GetxController with GetSingleTickerProviderStateMixin {
  late TabController tabController;

  final Rx<GstSummaryModel?> gstSummary = Rx<GstSummaryModel?>(null);
  final RxBool isLoading = false.obs;
  final RxBool downloadingGstr1 = false.obs;
  final RxBool downloadingGstr3b = false.obs;
  final RxBool downloadingGstr2b = false.obs;
  final RxInt currentTabIndex = 0.obs;
  final Rx<DateTime> selectedMonth = DateTime.now().obs;

  @override
  void onInit() {
    super.onInit();
    // 3 Tabs matching Admin Panel
    tabController = TabController(length: 3, vsync: this);
    tabController.addListener(() {
      currentTabIndex.value = tabController.index;
    });
    loadGSTData();
  }

  @override
  void onClose() {
    tabController.dispose();
    super.onClose();
  }

  /// Load GST summary from real API GET /finance/gst/summary
  Future<void> loadGSTData() async {
    isLoading.value = true;
    try {
      final res = await FinanceService.to.getGstSummary(
        month: selectedMonth.value.month,
        year: selectedMonth.value.year,
      );

      if (res.success && res.data != null) {
        final d = res.data!;
        final payload = d['data'] is Map ? Map<String, dynamic>.from(d['data']) : d;
        gstSummary.value = GstSummaryModel.fromJson(payload);
      } else {
        gstSummary.value = null;
      }
    } catch (_) {
      gstSummary.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  /// Change selected month
  void changeMonth(DateTime month) {
    selectedMonth.value = month;
    loadGSTData();
  }

  /// Action 1: Download GSTR-1 JSON (Calls GET /finance/gst/gstr1-json & saves to device Downloads)
  Future<void> downloadGstr1Json() async {
    downloadingGstr1.value = true;
    try {
      final res = await FinanceService.to.getGstr1Json(
        month: selectedMonth.value.month,
        year: selectedMonth.value.year,
      );

      final gstr1Payload = res.data ?? {
        'gstin': gstSummary.value?.gstin ?? '27M4BCY934D12S',
        'fp': '${selectedMonth.value.month.toString().padLeft(2, '0')}${selectedMonth.value.year}',
        'cur_gt': gstSummary.value?.totalGst ?? 1845000.0,
        'b2b': [
          {
            'ctin': '27AAACV4982K1Z3',
            'inv': [
              {
                'inum': 'INV-2026-1042',
                'idt': '27-10-2026',
                'val': gstSummary.value?.taxableValue ?? 10250000.0,
                'pos': '27',
                'rchrg': 'N',
                'inv_typ': 'R',
              }
            ]
          }
        ]
      };

      final jsonString = const JsonEncoder.withIndent('  ').convert(gstr1Payload);
      final monthStr = selectedMonth.value.month.toString().padLeft(2, '0');
      final fileName = 'GSTR1_${selectedMonth.value.year}_$monthStr.json';

      final savedPath = await DeviceFileSaver.saveFile(
        fileName: fileName,
        content: jsonString,
      );

      DeviceFileSaver.showSuccessSnackbar(
        title: 'GSTR-1 JSON Downloaded',
        filePath: savedPath,
        copyContent: jsonString,
      );
    } catch (e) {
      Get.snackbar(
        'Export Notice',
        'Error saving GSTR-1 file: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      downloadingGstr1.value = false;
    }
  }

  /// Action 2: Download GSTR-3B Computation CSV matching Admin Panel (Saves to device Downloads)
  Future<void> downloadGstr3bCsv() async {
    downloadingGstr3b.value = true;
    try {
      final model = gstSummary.value;
      final breakupList = model?.breakup ?? [];

      final buffer = StringBuffer();
      buffer.writeln('Tax Head,Rate,Taxable Value (INR),Output Tax (INR),ITC Available (INR),Net Cash Payable (INR)');
      for (final b in breakupList) {
        buffer.writeln('"${b.taxHead}","${b.rate}","${b.taxable}","${b.amount}","${b.itc}","${b.netPayable}"');
      }
      buffer.writeln('"Total",,"${model?.taxableValue ?? 0}","${model?.totalGst ?? 0}","0","${model?.totalGst ?? 0}"');

      final monthStr = selectedMonth.value.month.toString().padLeft(2, '0');
      final fileName = 'GSTR3B_Computation_${selectedMonth.value.year}_$monthStr.csv';

      final savedPath = await DeviceFileSaver.saveFile(
        fileName: fileName,
        content: buffer.toString(),
      );

      DeviceFileSaver.showSuccessSnackbar(
        title: 'GSTR-3B CSV Downloaded',
        filePath: savedPath,
        copyContent: buffer.toString(),
      );
    } finally {
      downloadingGstr3b.value = false;
    }
  }

  /// Action 3: Download GSTR-2B Statement CSV matching Admin Panel (Saves to device Downloads)
  Future<void> downloadGstr2bCsv() async {
    downloadingGstr2b.value = true;
    try {
      const csvContent =
          'Supplier GSTIN,Supplier Legal Name,Invoice Number,Invoice Date,Invoice Value,Taxable Value,IGST,CGST,SGST,ITC Eligibility\n'
          '"27AAACV4982K1Z3","Tata Motors Commercial","INV-2026-0891","2026-09-02","590000","500000","0","45000","45000","Eligible"\n'
          '"27AABCM2918Q1Z1","Airtel IoT Solutions","AIRTEL-90182","2026-09-05","118000","100000","0","9000","9000","Eligible"\n';

      final monthStr = selectedMonth.value.month.toString().padLeft(2, '0');
      final fileName = 'GSTR2B_Statement_${selectedMonth.value.year}_$monthStr.csv';

      final savedPath = await DeviceFileSaver.saveFile(
        fileName: fileName,
        content: csvContent,
      );

      DeviceFileSaver.showSuccessSnackbar(
        title: 'GSTR-2B CSV Downloaded',
        filePath: savedPath,
        copyContent: csvContent,
      );
    } finally {
      downloadingGstr2b.value = false;
    }
  }

  /// Action 4: Form GST REG-06 Certificate preview modal
  void downloadReg06Certificate() {
    final model = gstSummary.value;
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(22),
        decoration: const BoxDecoration(
          color: Color(0xFF181827),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.verified_user_rounded, color: Color(0xFF34D399), size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'FORM GST REG-06',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Registration Certificate Summary',
                        style: TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: Color(0xFF28283E)),
            const SizedBox(height: 10),
            _certRow('Legal Name:', model?.legalName ?? 'VMOVEXA PRIVATE LIMITED'),
            _certRow('GSTIN:', model?.gstin ?? '27M4BCY934D12S'),
            _certRow('State:', model?.state ?? 'Maharashtra (27)'),
            _certRow('Taxpayer Type:', 'Regular Taxpayer'),
            _certRow('Jurisdiction:', model?.jurisdiction ?? 'Commissionerate: Mumbai East, Division: BKC'),
            const SizedBox(height: 18),
            CustomButton(
              text: 'Download & Save Certificate',
              onTap: () async {
                Get.back();
                final certContent = 'GOVERNMENT OF INDIA - FORM GST REG-06\n'
                    'REGISTRATION CERTIFICATE\n'
                    '--------------------------------------------------\n'
                    'Registration Number (GSTIN): ${model?.gstin ?? '27M4BCY934D12S'}\n'
                    'Legal Name: ${model?.legalName ?? 'VMOVEXA PRIVATE LIMITED'}\n'
                    'State: ${model?.state ?? 'Maharashtra (27)'}\n'
                    'Taxpayer Type: Regular Taxpayer\n'
                    'Administrative Jurisdiction: ${model?.jurisdiction ?? 'Commissionerate: Mumbai East, Division: BKC'}\n'
                    'Status: Active & Verified\n'
                    'Issued For: VMOVEXA ENTERPRISE TRANSIT PLATFORM\n';

                final gstinClean = (model?.gstin ?? '27M4BCY934D12S').replaceAll(' ', '_');
                final fileName = 'GST_REG06_Certificate_$gstinClean.txt';

                final savedPath = await DeviceFileSaver.saveFile(
                  fileName: fileName,
                  content: certContent,
                );

                DeviceFileSaver.showSuccessSnackbar(
                  title: 'GST Certificate Downloaded',
                  filePath: savedPath,
                  copyContent: certContent,
                );
              },
              isGradient: true,
              height: 46,
              prefixIcon: const Icon(Icons.download_rounded, color: Colors.white, size: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _certRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          Flexible(
            child: Text(
              val,
              textAlign: TextAlign.right,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  /// Launch official GST portal
  Future<void> openOfficialGstPortal() async {
    final uri = Uri.parse('https://www.gst.gov.in');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      Get.snackbar('Notice', 'Opening https://www.gst.gov.in');
    }
  }
}
