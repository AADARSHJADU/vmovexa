import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/generate_invoice_controller.dart';

class GenerateInvoiceView extends GetView<GenerateInvoiceController> {
  const GenerateInvoiceView({super.key});

  static const Color kDarkBg = Color(0xFF0F172A);
  static const Color kCardBg = Color(0xFF1E293B);
  static const Color kBorder = Color(0xFF334155);
  static const Color kPrimaryBlue = Color(0xFF2563EB);
  static const Color kPrimaryIndigo = Color(0xFF6366F1);
  static const Color kGreen = Color(0xFF10B981);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<GenerateInvoiceController>()) {
      Get.put(GenerateInvoiceController());
    }

    return Scaffold(
      backgroundColor: kDarkBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: _buildHeader(),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildStepperBar(),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: Obx(() {
                switch (controller.currentStep.value) {
                  case 1:
                    return _buildStep1CustomerDetails();
                  case 2:
                    return _buildStep2LineItems();
                  case 3:
                    return _buildStep3TaxesAndTerms(context);
                  case 4:
                    return _buildStep4ReviewAndIssue();
                  default:
                    return _buildStep1CustomerDetails();
                }
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Top Header (Mirroring GenerateInvoicePage.jsx) ----------------
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            IconButton(
              onPressed: () => Get.back(),
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              visualDensity: VisualDensity.compact,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
            const SizedBox(width: 8),
            const Text(
              'Finance Portal/Tax Invoices\n/Generate Invoice',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
            const Spacer(),
            Obx(
              () => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: kPrimaryBlue.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: kPrimaryBlue.withValues(alpha: 0.3)),
                ),
                child: Text(
                  'Step ${controller.currentStep.value} of 4',
                  style: const TextStyle(
                    color: Color(0xFF93C5FD),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text(
          'Generate Tax Invoice',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 2),
        const Text(
          'Create GST compliant corporate tax billing with automated tax calculations',
          style: TextStyle(color: Colors.white54, fontSize: 11.5),
        ),
      ],
    );
  }

  // ---------------- Horizontal Stepper Bar (Mirroring GenerateInvoicePage.jsx) ----------------
  Widget _buildStepperBar() {
    final steps = [
      {'step': 1, 'title': 'Customer Details', 'desc': 'Party Info'},
      {'step': 2, 'title': 'Billed Line Items', 'desc': 'Itemization'},
      {'step': 3, 'title': 'Taxes & Terms', 'desc': 'GST & Due Date'},
      {'step': 4, 'title': 'Review & Issue', 'desc': 'Dispatch'},
    ];

    return Obx(
      () => Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: steps.map((s) {
            final int stepNum = s['step'] as int;
            final bool isActive = controller.currentStep.value == stepNum;
            final bool isCompleted = controller.currentStep.value > stepNum;

            return Expanded(
              child: InkWell(
                onTap: () => controller.goToStep(stepNum),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                  decoration: BoxDecoration(
                    gradient: isActive ? AppTheme.primaryGradient : null,
                    color: isActive
                        ? null
                        : isCompleted
                            ? kGreen.withValues(alpha: 0.1)
                            : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isActive
                          ? Colors.transparent
                          : isCompleted
                              ? kGreen.withValues(alpha: 0.3)
                              : Colors.transparent,
                    ),
                    boxShadow: isActive
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientPink.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 10,
                        backgroundColor: isCompleted
                            ? kGreen
                            : isActive
                                ? Colors.white.withOpacity(0.25)
                                : const Color(0xFF475569),
                        child: isCompleted
                            ? const Icon(Icons.check, size: 12, color: Colors.white)
                            : Text(
                                '$stepNum',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        s['title'] as String,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isActive ? Colors.white : const Color(0xFF94A3B8),
                          fontSize: 9.5,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ---------------- STEP 1: Customer Details ----------------
  Widget _buildStep1CustomerDetails() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '1. Customer & Billed Party Info',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Recipient advertiser corporate registration',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
              ),
              const Divider(color: kBorder, height: 24),
              _buildInputField(
                label: 'Customer / Company Name *',
                controller: controller.customerNameCtrl,
                hintText: 'e.g. Sharma Electronics Pvt Ltd',
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'Client GSTIN *',
                controller: controller.gstinCtrl,
                hintText: 'e.g. 27AAAAA0000A1Z5',
                isMono: true,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'PO / Work Order Ref',
                controller: controller.poReferenceCtrl,
                hintText: 'e.g. PO-2026-1042',
                isMono: true,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'Billing Address *',
                controller: controller.billingAddressCtrl,
                hintText: '45, M.G. Road, Pune, Maharashtra - 411001',
                maxLines: 2,
              ),
              const SizedBox(height: 20),
              CustomButton(
                text: 'Next: Add Line Items →',
                onTap: () => controller.goToStep(2),
                height: 48,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- STEP 2: Line Items ----------------
  Widget _buildStep2LineItems() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      children: [
        Container(
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '2. Billed Line Items',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Specify campaign services and rates',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: controller.addItem,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.gradientPink.withValues(alpha: 0.25),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add, size: 14, color: Colors.white),
                          SizedBox(width: 4),
                          Text(
                            'Add Item',
                            style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const Divider(color: kBorder, height: 24),
              Obx(
                () => Column(
                  children: controller.items.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final it = entry.value;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: kBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'ITEM #${idx + 1}',
                                style: const TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              if (controller.items.length > 1)
                                InkWell(
                                  onTap: () => controller.removeItem(it.id),
                                  child: const Row(
                                    children: [
                                      Icon(Icons.delete_outline, size: 14, color: Colors.redAccent),
                                      SizedBox(width: 2),
                                      Text('Remove', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          _buildInputField(
                            label: 'Description',
                            controller: it.descCtrl,
                            hintText: 'e.g. Transit Video Ad (15 Days - 25 Buses)',
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                flex: 2,
                                child: _buildInputField(
                                  label: 'Qty',
                                  controller: it.qtyCtrl,
                                  hintText: '1',
                                  keyboardType: TextInputType.number,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 3,
                                child: _buildInputField(
                                  label: 'Unit Rate (₹)',
                                  controller: it.rateCtrl,
                                  hintText: '85000',
                                  keyboardType: TextInputType.number,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 3,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Total', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF1E293B),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: kBorder),
                                      ),
                                      child: Text(
                                        '₹${it.total.toStringAsFixed(0)}',
                                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 6),
              // Taxable Subtotal Box
              Obx(
                () => Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Taxable Subtotal:',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '₹${controller.subtotal.value.toStringAsFixed(0)}',
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: controller.previousStep,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: kBorder),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('← Back', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: CustomButton(
                      text: 'Next: Taxes & Terms →',
                      onTap: () => controller.goToStep(3),
                      height: 44,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- STEP 3: Taxes & Terms ----------------
  Widget _buildStep3TaxesAndTerms(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '3. Tax Governance & Terms of Delivery',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'State tax jurisdiction and settlement conditions',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
              ),
              const Divider(color: kBorder, height: 24),
              // Place of Supply Dropdown
              const Text(
                'Place of Supply *',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Obx(
                () => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.placeOfSupply.value,
                      dropdownColor: const Color(0xFF1E293B),
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                      items: controller.placeOfSupplyOptions
                          .map(
                            (opt) => DropdownMenuItem(
                              value: opt['value'],
                              child: Text(opt['label']!),
                            ),
                          )
                          .toList(),
                      onChanged: (val) {
                        if (val != null) controller.placeOfSupply.value = val;
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Due Date Picker
              const Text(
                'Payment Terms & Due Date *',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              InkWell(
                onTap: () => controller.pickDueDate(context),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Obx(
                        () => Text(
                          controller.dueDateFormatted,
                          style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const Icon(Icons.calendar_today_outlined, color: Color(0xFF94A3B8), size: 16),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'Service Delivery / Provisioning Terms',
                controller: controller.deliveryTermsCtrl,
                hintText: 'e.g. Net 15 days upon spot verification completion',
              ),
              const SizedBox(height: 16),
              // Automated Tax Breakdown Card
              Obx(
                () => Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: kBorder),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Taxable Value:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                          Text('₹${controller.subtotal.value.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('CGST (9%):', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                          Text('₹${controller.cgst.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('SGST (9%):', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                          Text('₹${controller.sgst.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const Divider(color: kBorder, height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Grand Total:', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
                          Text(
                            '₹${controller.grandTotal.toStringAsFixed(0)}',
                            style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 17, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: controller.previousStep,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: kBorder),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('← Back', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: CustomButton(
                      text: 'Next: Review & Issue →',
                      onTap: () => controller.goToStep(4),
                      height: 44,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- STEP 4: Review & Issue ----------------
  Widget _buildStep4ReviewAndIssue() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Review Tax Invoice Before Dispatch',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Verify bill amounts and party information',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
              ),
              const Divider(color: kBorder, height: 24),
              // Review Details Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: kBorder),
                ),
                child: Column(
                  children: [
                    _buildReviewRow(
                      label: 'Recipient Party:',
                      value: controller.customerNameCtrl.text.trim(),
                    ),
                    const Divider(color: Color(0x1FFFFFFF), height: 16),
                    _buildReviewRow(
                      label: 'GSTIN:',
                      value: controller.gstinCtrl.text.trim().isNotEmpty
                          ? controller.gstinCtrl.text.trim()
                          : 'Not Provided',
                      isMono: true,
                    ),
                    const Divider(color: Color(0x1FFFFFFF), height: 16),
                    _buildReviewRow(
                      label: 'Place of Supply:',
                      value: controller.placeOfSupply.value,
                    ),
                    const Divider(color: Color(0x1FFFFFFF), height: 16),
                    _buildReviewRow(
                      label: 'Payment Due:',
                      value: controller.dueDateFormatted,
                    ),
                    const Divider(color: Color(0x1FFFFFFF), height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Final Invoice Total:',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12.5, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '₹${controller.grandTotal.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: Color(0xFF60A5FA),
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Obx(
                () => Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: controller.isSubmitting.value ? null : controller.previousStep,
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: kBorder),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('← Back', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 2,
                      child: CustomButton(
                        text: controller.isSubmitting.value ? 'Issuing…' : 'Issue & Dispatch Invoice',
                        onTap: controller.isSubmitting.value ? () {} : controller.submitInvoice,
                        isLoading: controller.isSubmitting.value,
                        prefixIcon: controller.isSubmitting.value
                            ? null
                            : const Icon(Icons.check_circle_outline, size: 16, color: Colors.white),
                        height: 44,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Reusable Helpers ----------------
  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required String hintText,
    bool isMono = false,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: TextStyle(
            color: Colors.white,
            fontSize: 12.5,
            fontFamily: isMono ? 'monospace' : null,
            fontWeight: FontWeight.w600,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
            filled: true,
            fillColor: const Color(0xFF0F172A),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: kBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: kBorder),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: kPrimaryBlue),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewRow({required String label, required String value, bool isMono = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              color: Colors.white,
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              fontFamily: isMono ? 'monospace' : null,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
