import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/generate_invoice/controller/generate_invoice_controller.dart';
import '../../../../../../theme/app_theme.dart';
import 'generate_invoice_view.dart' show GenerateInvoiceView;

class InvoicePreviewView extends GetView<GenerateInvoiceController> {
  const InvoicePreviewView({super.key});

  static const Color kBg = GenerateInvoiceView.kBg;
  static const Color kCardBg = GenerateInvoiceView.kCardBg;
  static const Color kFieldBg = GenerateInvoiceView.kFieldBg;
  static const Color kPurple = GenerateInvoiceView.kPurple;
  static const Color kIndigo = GenerateInvoiceView.kIndigo;
  static const Color kBorder = GenerateInvoiceView.kBorder;

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
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Invoice Preview',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Review your invoice before final download',
                style: TextStyle(color: Colors.white, fontSize: 11.5),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onEditInvoice,
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.edit_outlined, color: kPurple, size: 14),
              SizedBox(width: 4),
              Text(
                'Edit',
                style: TextStyle(
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
        final customer = controller.selectedCustomer.value;
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
                      const Text(
                        'Invoice #',
                        style: TextStyle(color: Colors.white, fontSize: 10),
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
                    const Text(
                      'Invoice Date',
                      style: TextStyle(color: Colors.white, fontSize: 10),
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
            _sectionHeader(Icons.person_outline, 'Customer Details'),
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('Customer Name'),
                      _miniValue(customer?.name ?? '—'),
                      const SizedBox(height: 8),
                      _miniLabel('Billing Address'),
                      _miniValue(
                        controller.billingAddress.value.isEmpty
                            ? '—'
                            : controller.billingAddress.value,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('GSTIN'),
                      _miniValue(
                        controller.gstinCtrl.text.trim().isEmpty
                            ? (customer?.gstin ?? '—')
                            : controller.gstinCtrl.text.trim(),
                      ),
                      const SizedBox(height: 8),
                      _miniLabel('Place of Supply'),
                      _miniValue(
                        controller.placeOfSupply.value.isEmpty
                            ? '—'
                            : controller.placeOfSupply.value,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: Colors.white.withOpacity(0.08), height: 1),
            const SizedBox(height: 16),
            _sectionHeader(Icons.description_outlined, 'Invoice Details'),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('Due Date'),
                      _miniValue(controller.dueDateText),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _miniLabel('PO / Reference No.'),
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
                      _miniLabel('Currency'),
                      _miniValue(controller.currency.value.split(' - ').first),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: Colors.white.withOpacity(0.08), height: 1),
            const SizedBox(height: 16),
            _sectionHeader(Icons.inventory_2_outlined, 'Invoice Items'),
            const SizedBox(height: 10),
            _buildItemsTable(),
            const SizedBox(height: 16),
            _buildTotalsBlock(),
            const SizedBox(height: 16),
            Divider(color: Colors.white.withOpacity(0.08), height: 1),
            const SizedBox(height: 16),
            _sectionHeader(Icons.notes_outlined, 'Notes (Optional)'),
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
                    ? 'No notes added'
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
          const Row(
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  'Item Description',
                  style: TextStyle(color: Colors.white, fontSize: 9.5),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'HSN/SAC',
                  style: TextStyle(color: Colors.white, fontSize: 9.5),
                ),
              ),
              Expanded(
                flex: 1,
                child: Text(
                  'Qty',
                  style: TextStyle(color: Colors.white, fontSize: 9.5),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'Rate (\u20b9)',
                  style: TextStyle(color: Colors.white, fontSize: 9.5),
                  textAlign: TextAlign.right,
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'Amount (\u20b9)',
                  style: TextStyle(color: Colors.white, fontSize: 9.5),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Divider(color: Colors.white.withOpacity(0.08), height: 1),
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
              _totalRow('Subtotal', controller.subtotalText),
              const SizedBox(height: 6),
              _totalRow('CGST (9%)', controller.cgstText),
              const SizedBox(height: 6),
              _totalRow('SGST (9%)', controller.sgstText),
              const SizedBox(height: 8),
              Divider(color: Colors.white.withOpacity(0.1), height: 1),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Amount',
                    style: TextStyle(
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
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
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
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.download_outlined,
                            color: Colors.white,
                            size: 18,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Download Invoice',
                            style: TextStyle(
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
                border: Border.all(color: kPurple.withOpacity(0.5)),
              ),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.edit_outlined, color: kPurple, size: 16),
                  SizedBox(width: 8),
                  Text(
                    'Edit Invoice',
                    style: TextStyle(
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
