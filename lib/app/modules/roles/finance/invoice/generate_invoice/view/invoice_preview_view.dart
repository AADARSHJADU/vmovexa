import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/generate_invoice/controller/generate_invoice_controller.dart';
import '../../../../../../theme/app_theme.dart';

class InvoicePreviewView extends GetView<GenerateInvoiceController> {
  const InvoicePreviewView({super.key});

  static const Color kBg = Color(0xFF0F172A);
  static const Color kCardBg = Color(0xFF1E293B);
  static const Color kBorder = Color(0xFF334155);
  static const Color kFieldBg = Color(0xFF0F172A);
  static const Color kDarkBg = Color(0xFF0F172A);

  static const Color kPrimaryBlue = Color(0xFF2563EB);
  static const Color kPrimaryIndigo = Color(0xFF6366F1);
  static const Color kPurple = Color(0xFF6366F1);
  static const Color kGreen = Color(0xFF10B981);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: _buildHeader(),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [_buildInvoiceCard()],
              ),
            ),
            _buildFooterButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onBackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'invoice_preview'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'review_invoice_sub'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 11.5),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onEditInvoice,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.edit_outlined, color: kPurple, size: 14),
              const SizedBox(width: 4),
              Text(
                'edit_invoice'.tr,
                style: const TextStyle(
                  color: kPurple,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Single invoice document card ----------------
  Widget _buildInvoiceCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Obx(() {
        final customerName = controller.customerNameCtrl.text.trim().isEmpty
            ? 'customer_company'.tr
            : controller.customerNameCtrl.text.trim();
        final billingAddr = controller.billingAddressCtrl.text.trim().isEmpty
            ? '—'
            : controller.billingAddressCtrl.text.trim();
        final gstin = controller.gstinCtrl.text.trim().isEmpty
            ? '—'
            : controller.gstinCtrl.text.trim();
        final placeOfSupply = controller.placeOfSupply.value.isEmpty
            ? '—'
            : controller.placeOfSupply.value;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Invoice # + date
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'invoice_num_label'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 10),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        controller.invoiceNumber.value,
                        style: const TextStyle(
                          color: kPurple,
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'invoice_date'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 10),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Text(
                          controller.invoiceDateText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.calendar_today_outlined,
                          color: Colors.white,
                          size: 13,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            _sectionHeader(Icons.person_outline, 'customer_details'.tr),
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('customer_name'.tr),
                      _miniValue(customerName),
                      const SizedBox(height: 8),
                      _miniLabel('billing_address'.tr),
                      _miniValue(billingAddr),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('gstin_label'.tr),
                      _miniValue(gstin),
                      const SizedBox(height: 8),
                      _miniLabel('place_of_supply'.tr),
                      _miniValue(placeOfSupply),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: Colors.white.withValues(alpha: 0.08), height: 1),
            const SizedBox(height: 16),
            _sectionHeader(Icons.description_outlined, 'invoice_details'.tr),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('due_date'.tr),
                      _miniValue(controller.dueDateText),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('po_reference_no'.tr),
                      _miniValue(
                        controller.poReferenceCtrl.text.trim().isEmpty
                            ? '—'
                            : controller.poReferenceCtrl.text.trim(),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('currency'.tr),
                      _miniValue(controller.currency.value.split(' - ').first),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: Colors.white.withValues(alpha: 0.08), height: 1),
            const SizedBox(height: 16),
            _sectionHeader(Icons.inventory_2_outlined, 'invoice_items'.tr),
            const SizedBox(height: 10),
            _buildItemsTable(),
            const SizedBox(height: 16),
            _buildTotalsBlock(),
            const SizedBox(height: 16),
            Divider(color: Colors.white.withValues(alpha: 0.08), height: 1),
            const SizedBox(height: 16),
            _sectionHeader(Icons.notes_outlined, 'notes_terms'.tr),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                controller.notesCtrl.text.trim().isEmpty
                    ? 'payment_within_15_days'.tr
                    : controller.notesCtrl.text.trim(),
                style: const TextStyle(color: Colors.white70, fontSize: 11.5),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _sectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, color: kPurple, size: 14),
        const SizedBox(width: 7),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _miniLabel(String text) =>
      Text(text, style: const TextStyle(color: Colors.white, fontSize: 9.5));
  Widget _miniValue(String text) => Padding(
    padding: const EdgeInsets.only(top: 2),
    child: Text(
      text,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 11.5,
        fontWeight: FontWeight.w600,
      ),
    ),
  );

  // ---------------- Items table ----------------
  Widget _buildItemsTable() {
    return Obx(
      () => Column(
        children: [
          Row(
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  'item_description'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 9.5),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'hsn_sac'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 9.5),
                ),
              ),
              Expanded(
                flex: 1,
                child: Text(
                  'qty_col'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 9.5),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'rate_inr'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 9.5),
                  textAlign: TextAlign.right,
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'amount_inr'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 9.5),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Divider(color: Colors.white.withValues(alpha: 0.08), height: 1),
          ...controller.items.map(
            (item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 9),
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Text(
                      item.description,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      item.hsnSac,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10.5,
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 1,
                    child: Text(
                      item.quantity.toStringAsFixed(0),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10.5,
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      item.rate.toStringAsFixed(2),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10.5,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      item.amount.toStringAsFixed(2),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Totals block ----------------
  Widget _buildTotalsBlock() {
    return Obx(
      () => Align(
        alignment: Alignment.centerRight,
        child: SizedBox(
          width: 200,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _totalRow('subtotal'.tr, controller.subtotalText),
              const SizedBox(height: 6),
              _totalRow('cgst_9'.tr, controller.cgstText),
              const SizedBox(height: 6),
              _totalRow('sgst_9'.tr, controller.sgstText),
              const SizedBox(height: 8),
              Divider(color: Colors.white.withValues(alpha: 0.1), height: 1),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'total_amount'.tr,
                    style: const TextStyle(
                      color: kPurple,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    controller.totalAmountText,
                    style: const TextStyle(
                      color: kPurple,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _totalRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 11)),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  // ---------------- Footer (Download + Edit) ----------------
  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06))),
      ),
      child: Column(
        children: [
          Obx(
            () => GestureDetector(
              onTap: controller.isDownloading.value
                  ? null
                  : controller.onDownloadInvoice,
              child: Container(
                width: double.infinity,
                height: 50,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: controller.isDownloading.value
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.4,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.download_outlined,
                            color: Colors.white,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'download_invoice'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: controller.onEditInvoice,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kPurple.withValues(alpha: 0.5)),
              ),
              alignment: Alignment.center,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.edit_outlined, color: kPurple, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    'edit_invoice'.tr,
                    style: const TextStyle(
                      color: kPurple,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
