import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/model/invoice_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/invoice_details_controller.dart';

class InvoiceDetailsView extends GetView<InvoiceDetailsController> {
  const InvoiceDetailsView({super.key});

  static const Color kDarkBg = Color(0xFF0F0F17);
  static const Color kCardBg = Color(0xFF161623);
  static const Color kBorder = Color(0x1FFFFFFF);
  static const Color kDocBg = Color(0xFF1E2235);

  String _formatDate(DateTime? d) {
    if (d == null) return '—';
    return DateFormat('dd MMM yyyy').format(d);
  }

  String _formatCurrency(double amount) {
    final format = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);
    return format.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kDarkBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.gradientBlue));
          }

          final inv = controller.invoice.value;
          if (inv == null) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.receipt_long_outlined, size: 48, color: AppColors.textMuted),
                  const SizedBox(height: 12),
                  Text(
                    'invoice_not_found'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text('return_to_invoices_list'.tr, style: const TextStyle(color: Color(0xFF60A5FA))),
                  ),
                ],
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
            children: [
              _buildTopBar(),
              const SizedBox(height: 14),
              _buildHeaderSection(inv),
              const SizedBox(height: 18),
              _buildTaxInvoiceDocument(inv),
            ],
          );
        }),
      ),
    );
  }

  // ---------------- Top Bar Navigation ----------------
  Widget _buildTopBar() {
    return Row(
      children: [
        IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
        const SizedBox(width: 10),
        Text(
          'tax_invoices'.tr,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
        ),
        const SizedBox(width: 4),
        const Text('›', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
        const SizedBox(width: 4),
        Obx(() => Text(
              controller.invoice.value?.code ?? 'invoice_details'.tr,
              style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w600),
            )),
      ],
    );
  }

  // ---------------- Header Section & Actions Bar ----------------
  Widget _buildHeaderSection(InvoiceModel inv) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          inv.code,
                          style: GoogleFonts.firaCode(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),

                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${'issued_to'.tr} ${inv.company} ${'on_date'.tr} ${_formatDate(inv.invoiceDate)}',
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: inv.status.bgColor,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: inv.status.borderColor),
                          ),
                          child: Text(
                            inv.status.label,
                            style: TextStyle(
                              color: inv.status.color,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0x263B82F6),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0x663B82F6)),
                          ),
                          child: Text(
                            inv.typeDisplay,
                            style: const TextStyle(
                              color: Color(0xFF93C5FD),
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Actions Row: Mark as Paid & Download PDF (primaryGradient)
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (inv.status != InvoiceStatus.paid)
                ElevatedButton.icon(
                  onPressed: controller.openMarkPaidDialog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                  icon: const Icon(Icons.check, color: Colors.white, size: 16),
                  label: Text(
                    'mark_as_paid'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),

              // Download PDF with primaryGradient
              Container(
                decoration: BoxDecoration(
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
                child: ElevatedButton.icon(
                  onPressed: controller.downloadInvoicePdf,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                  icon: const Icon(Icons.download_rounded, color: Colors.white, size: 16),
                  label: Text(
                    'download_pdf'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- High-Fidelity GST Tax Invoice Document ----------------
  Widget _buildTaxInvoiceDocument(InvoiceModel inv) {
    return Container(
      decoration: BoxDecoration(
        color: kDocBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x33FFFFFF)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33000000),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Doc Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0x22FFFFFF), width: 1.5)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'vmovexa_pvt_ltd'.tr,
                      style: GoogleFonts.raleway(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'vmovexa_corporate_sub'.tr,
                      style: const TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'tax_invoice_caps'.tr,
                          style: GoogleFonts.raleway(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'original_for_recipient'.tr,
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '#${inv.code}',
                          style: GoogleFonts.firaCode(
                            color: const Color(0xFF60A5FA),
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

              ],
            ),
          ),

          // 2 Cards: Billed By vs Billed To
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Billed By (Supplier)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0x1AFFFFFF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0x14FFFFFF)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'billed_by_supplier'.tr,
                        style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'vmovexa_pvt_ltd'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
                        style: TextStyle(color: Colors.white70, fontSize: 11.5),
                      ),
                      const SizedBox(height: 3),
                      const Text(
                        'GSTIN: 27M4BCY934D12S • PAN: AACCV1234F',
                        style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                      ),
                      const Text(
                        'State: Maharashtra (Code: 27)',
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Billed To (Recipient / Customer)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0x1AFFFFFF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0x14FFFFFF)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'billed_to_customer'.tr,
                        style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        inv.company,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                      if (inv.billingAddress.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          inv.billingAddress,
                          style: const TextStyle(color: Colors.white70, fontSize: 11.5),
                        ),
                      ],
                      const SizedBox(height: 3),
                      Text(
                        'GSTIN: ${inv.gstin.isNotEmpty ? inv.gstin : 'unregistered_b2c'.tr}',
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'State / UT: ${inv.placeOfSupply.isNotEmpty ? inv.placeOfSupply : 'Maharashtra'}',
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${'issue_date_label'.tr}: ${_formatDate(inv.invoiceDate)} • ${'due_date_label'.tr}: ${_formatDate(inv.dueDate)}',
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Line Items Table
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'services_description'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0x14FFFFFF),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0x1AFFFFFF)),
                  ),
                  child: Column(
                    children: [
                      // Table header
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: const BoxDecoration(
                          color: Color(0x22FFFFFF),
                          borderRadius: BorderRadius.vertical(top: Radius.circular(9)),
                        ),
                        child: Row(
                          children: [
                            Expanded(flex: 5, child: Text('description_col'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('sac_col'.tr, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold))),
                            Expanded(flex: 1, child: Text('qty_col'.tr, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold))),
                            Expanded(flex: 3, child: Text('rate_col'.tr, textAlign: TextAlign.right, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold))),
                          ],
                        ),
                      ),
                      // Rows
                      ...inv.items.map((item) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: const BoxDecoration(
                            border: Border(top: BorderSide(color: Color(0x14FFFFFF))),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 5,
                                child: Text(
                                  item.description,
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Text(
                                  item.hsn,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                                ),
                              ),
                              Expanded(
                                flex: 1,
                                child: Text(
                                  '${item.qty}',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: Colors.white, fontSize: 12),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  _formatCurrency(item.rate),
                                  textAlign: TextAlign.right,
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Amount in Words & Totals Box
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                // In Words Box
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0x14FFFFFF),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0x22FFFFFF)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'amount_in_words'.tr,
                        style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        amountInWords(inv.amount),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${'tax_classification'.tr}: ${inv.placeOfSupply.toLowerCase().contains('maharashtra') || inv.placeOfSupply.isEmpty ? 'Intra-State Supply (CGST 9% + SGST 9%)' : 'Inter-State Supply (IGST 18%)'}',
                        style: const TextStyle(color: Colors.white70, fontSize: 10.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Calculations Summary Table
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0x1AFFFFFF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('taxable_subtotal'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                          Text(_formatCurrency(inv.subtotal), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      if (inv.cgstAmount > 0 || inv.sgstAmount > 0) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('cgst_9'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            Text(_formatCurrency(inv.cgstAmount > 0 ? inv.cgstAmount : inv.taxAmount / 2), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('sgst_9'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            Text(_formatCurrency(inv.sgstAmount > 0 ? inv.sgstAmount : inv.taxAmount / 2), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ] else ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('gst_18'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            Text(_formatCurrency(inv.taxAmount), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ],
                      const Divider(color: Color(0x33FFFFFF), height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'total_amount_inc_gst'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                          ),
                          Text(
                            _formatCurrency(inv.amount),
                            style: GoogleFonts.raleway(
                              color: const Color(0xFF10B981),
                              fontSize: 17,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Bank Settlement & Signatory Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0x14FFFFFF),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0x1AFFFFFF)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'bank_settlement_remittance'.tr,
                    style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text('${'bank_name_label'.tr}: HDFC Bank Ltd', style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                  Text('${'account_name_label'.tr}: VMOVEXA PRIVATE LIMITED', style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                  Text('${'account_number_label'.tr}: 50200088219012', style: const TextStyle(color: Colors.white, fontSize: 11.5, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                  Text('${'ifsc_code_label'.tr}: HDFC0000123 • ${'branch_label'.tr}: BKC, Mumbai', style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                  Text('${'upi_vpa_label'.tr}: vmovexa@hdfcbank', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Computer generated notice
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0x1A000000),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(15)),
            ),
            child: Text(
              'computer_generated_invoice_note'.tr,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white38, fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }
}
