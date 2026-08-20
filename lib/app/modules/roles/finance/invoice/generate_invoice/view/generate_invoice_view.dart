import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/generate_invoice/controller/generate_invoice_controller.dart';
import 'package:vmovexa/app/theme/app_theme.dart';


class GenerateInvoiceView extends GetView<GenerateInvoiceController> {
  const GenerateInvoiceView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);

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
                children: [
                  _buildCustomerDetailsCard(),
                  const SizedBox(height: 16),
                  _buildInvoiceDetailsCard(context),
                  const SizedBox(height: 16),
                  _buildInvoiceItemsCard(context),
                  const SizedBox(height: 16),
                  _buildInvoiceSummaryCard(),
                  const SizedBox(height: 16),
                  _buildNotesCard(),
                ],
              ),
            ),
            _buildFooterButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(onTap: controller.onBackPressed, child: const Icon(Icons.arrow_back, color: Colors.white)),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Generate Invoice', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('Create a new invoice', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
            ],
          ),
        ),
        GestureDetector(onTap: controller.onInfoTap, child: const Icon(Icons.info_outline, color: kPurple, size: 20)),
      ],
    );
  }

  Widget _cardWrapper({required IconData icon, required String title, Widget? trailing, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: kPurple, size: 16),
                  const SizedBox(width: 8),
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
              if (trailing != null) trailing,
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  // ---------------- Customer Details ----------------
  Widget _buildCustomerDetailsCard() {
    return _cardWrapper(
      icon: Icons.person_outline,
      title: 'Customer Details',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => _LabeledDropdown<String>(
              label: 'Customer',
              required: true,
              hint: 'Select customer',
              value: controller.selectedCustomer.value?.id,
              items: controller.customerOptions.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
              onChanged: controller.setCustomer,
              errorText: controller.customerError.value,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Obx(
                  () => _LabeledDropdown<String>(
                    label: 'Billing Address',
                    required: true,
                    hint: 'Select billing address',
                    value: controller.billingAddress.value.isEmpty ? null : controller.billingAddress.value,
                    items: controller.selectedCustomer.value == null
                        ? []
                        : [DropdownMenuItem(value: controller.selectedCustomer.value!.billingAddress, child: Text(controller.selectedCustomer.value!.billingAddress, overflow: TextOverflow.ellipsis))],
                    onChanged: (v) => controller.billingAddress.value = v ?? '',
                    errorText: controller.billingAddressError.value,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _LabeledTextField(label: 'GSTIN (Optional)', controller: controller.gstinCtrl, hint: 'Enter GSTIN'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Invoice Details ----------------
  Widget _buildInvoiceDetailsCard(BuildContext context) {
    return _cardWrapper(
      icon: Icons.description_outlined,
      title: 'Invoice Details',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Obx(
                  () => _DatePickerField(label: 'Invoice Date', required: true, valueText: controller.invoiceDateText, onTap: () => controller.onPickInvoiceDate(context)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Obx(
                  () => _DatePickerField(label: 'Due Date', required: true, valueText: controller.dueDateText, onTap: () => controller.onPickDueDate(context)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _LabeledTextField(label: 'PO / Reference No.', controller: controller.poReferenceCtrl, hint: 'Enter reference no.'),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Obx(
                  () => _LabeledDropdown<String>(
                    label: 'Currency',
                    hint: 'Select currency',
                    value: controller.currency.value,
                    items: controller.currencyOptions.map((c) => DropdownMenuItem(value: c, child: Text(c, overflow: TextOverflow.ellipsis))).toList(),
                    onChanged: controller.setCurrency,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Obx(
                  () => _LabeledDropdown<String>(
                    label: 'Place of Supply',
                    hint: 'Select place of supply',
                    value: controller.placeOfSupply.value.isEmpty ? null : controller.placeOfSupply.value,
                    items: controller.placeOfSupplyOptions.map((p) => DropdownMenuItem(value: p, child: Text(p, overflow: TextOverflow.ellipsis))).toList(),
                    onChanged: controller.setPlaceOfSupply,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Invoice Items ----------------
  Widget _buildInvoiceItemsCard(BuildContext context) {
    return _cardWrapper(
      icon: Icons.inventory_2_outlined,
      title: 'Invoice Items',
      trailing: GestureDetector(
        onTap: () => controller.onAddItem(context),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.add_circle_outline, color: kPurple, size: 14),
            SizedBox(width: 4),
            Text('Add Item', style: TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
      child: Obx(() {
        if (controller.items.isEmpty) {
          return Column(
            children: [
              const Row(
                children: [
                  Expanded(flex: 3, child: Text('Item Description', style: TextStyle(color: Colors.white38, fontSize: 10))),
                  Expanded(flex: 2, child: Text('HSN/SAC', style: TextStyle(color: Colors.white38, fontSize: 10))),
                  Expanded(flex: 1, child: Text('Quantity', style: TextStyle(color: Colors.white38, fontSize: 10))),
                  Expanded(flex: 2, child: Text('Rate (\u20b9)', style: TextStyle(color: Colors.white38, fontSize: 10))),
                  Expanded(flex: 2, child: Text('Amount (\u20b9)', style: TextStyle(color: Colors.white38, fontSize: 10), textAlign: TextAlign.right)),
                ],
              ),
              const SizedBox(height: 30),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: kFieldBg, shape: BoxShape.circle),
                child: const Icon(Icons.description_outlined, color: Colors.white24, size: 24),
              ),
              const SizedBox(height: 10),
              const Text('No items added yet', style: TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              const Text('Add items to generate invoice', style: TextStyle(color: Colors.white38, fontSize: 11)),
              const SizedBox(height: 10),
            ],
          );
        }
        return Column(
          children: controller.items
              .map(
                (item) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                  decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(10)),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.description, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text('HSN: ${item.hsnSac}  \u2022  Qty: ${item.quantity.toStringAsFixed(0)}  \u2022  Rate: \u20b9${item.rate.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white38, fontSize: 9.5)),
                          ],
                        ),
                      ),
                      Text('\u20b9${item.amount.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => controller.onRemoveItem(item.id),
                        child: const Icon(Icons.close, color: Colors.white38, size: 16),
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        );
      }),
    );
  }

  // ---------------- Invoice Summary ----------------
  Widget _buildInvoiceSummaryCard() {
    return _cardWrapper(
      icon: Icons.calculate_outlined,
      title: 'Invoice Summary',
      child: Obx(
        () => Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _summaryLine('Subtotal', controller.subtotalText),
                  const SizedBox(height: 6),
                  _summaryLine('CGST (9%)', controller.cgstText),
                  const SizedBox(height: 6),
                  _summaryLine('SGST (9%)', controller.sgstText),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(gradient:AppTheme.primaryGradient, borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Amount', style: TextStyle(color: Colors.white, fontSize: 10)),
                  const SizedBox(height: 4),
                  Text(controller.totalAmountText, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryLine(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11.5)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }

  // ---------------- Notes ----------------
  Widget _buildNotesCard() {
    return _cardWrapper(
      icon: Icons.description_outlined,
      title: 'Notes (Optional)',
      child: Obx(
        () => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white.withOpacity(0.08))),
              child: TextField(
                controller: controller.notesCtrl,
                maxLines: 3,
                maxLength: GenerateInvoiceController.notesMaxLen,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  counterText: '',
                  isDense: true,
                  contentPadding: EdgeInsets.all(12),
                  hintText: 'Enter notes (optional)',
                  hintStyle: TextStyle(color: Colors.white30, fontSize: 12.5),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Align(
              alignment: Alignment.centerRight,
              child: Text('${controller.notesLen.value} / ${GenerateInvoiceController.notesMaxLen}', style: const TextStyle(color: Colors.white24, fontSize: 10)),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Footer ----------------
  Widget _buildFooterButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06)))),
      child: Obx(
        () => GestureDetector(
          onTap: controller.isGenerating.value ? null : controller.onGenerateInvoicePressed,
          child: Container(
            width: double.infinity,
            height: 50,
            decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.circular(12)),
            alignment: Alignment.center,
            child: controller.isGenerating.value
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4))
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.description_outlined, color: Colors.white, size: 17),
                      SizedBox(width: 8),
                      Text('Generate Invoice', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

// =====================================================================
// Labeled dropdown
// =====================================================================
class _LabeledDropdown<T> extends StatelessWidget {
  final String label;
  final bool required;
  final String hint;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final String? errorText;

  const _LabeledDropdown({
    required this.label,
    this.required = false,
    required this.hint,
    required this.value,
    required this.items,
    required this.onChanged,
    this.errorText,
  });

  static const Color kFieldBg = GenerateInvoiceView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            text: label,
            style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
            children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: errorText != null ? const Color(0xFFFF4D4D) : Colors.white.withOpacity(0.08)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<T>(
              value: value,
              isExpanded: true,
              dropdownColor: kFieldBg,
              icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 20),
              hint: Text(hint, style: const TextStyle(color: Colors.white30, fontSize: 12.5)),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              items: items,
              onChanged: onChanged,
            ),
          ),
        ),
        if (errorText != null) ...[
          const SizedBox(height: 4),
          Text(errorText!, style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5)),
        ],
      ],
    );
  }
}

// =====================================================================
// Labeled text field
// =====================================================================
class _LabeledTextField extends StatelessWidget {
  final String label;
  final bool required;
  final TextEditingController controller;
  final String hint;

  const _LabeledTextField({required this.label, this.required = false, required this.controller, required this.hint});

  static const Color kFieldBg = GenerateInvoiceView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            text: label,
            style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
            children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white.withOpacity(0.08))),
          child: TextField(
            controller: controller,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              border: InputBorder.none,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 13),
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 12.5),
            ),
          ),
        ),
      ],
    );
  }
}

// =====================================================================
// Date picker field (opens native calendar)
// =====================================================================
class _DatePickerField extends StatelessWidget {
  final String label;
  final bool required;
  final String valueText;
  final VoidCallback onTap;

  const _DatePickerField({required this.label, this.required = false, required this.valueText, required this.onTap});

  static const Color kFieldBg = GenerateInvoiceView.kFieldBg;
  static const Color kPurple = GenerateInvoiceView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            text: label,
            style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
            children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
          ),
        ),
        const SizedBox(height: 6),
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 13),
            decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white.withOpacity(0.08))),
            child: Row(
              children: [
                const Icon(Icons.calendar_today_outlined, color: kPurple, size: 14),
                const SizedBox(width: 8),
                Expanded(child: Text(valueText, style: const TextStyle(color: Colors.white, fontSize: 12.5))),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
