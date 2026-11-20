import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/record_offline_payment_controller.dart';

class RecordOfflinePaymentView extends GetView<RecordOfflinePaymentController> {
  const RecordOfflinePaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoadingCampaign.value) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)));
          }

          final c = controller.campaign.value;
          if (c == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.campaign_outlined, size: 64, color: AppColors.textMuted),
                  const SizedBox(height: 16),
                  Text('campaign_not_found'.tr, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Get.back(),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                    child: Text('cancel_return_btn'.tr),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // Header & Breadcrumb
              _buildTopBar(c),

              // Scrollable Form Body
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Section 1: Summary Financial Banner
                      _buildFinancialSummaryBanner(),
                      const SizedBox(height: 16),

                      // Section 2: Payment Method Selection
                      _buildPaymentMethodSection(),
                      const SizedBox(height: 16),

                      // Section 3: Dynamic Instrument Fields
                      _buildDynamicInstrumentFields(),
                      const SizedBox(height: 16),

                      // Section 4: Audit & Verification Documentation
                      _buildAuditDocumentationSection(),
                      const SizedBox(height: 20),

                      // Section 5: Submit Action Buttons
                      _buildActionButtons(),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ==========================================================
  // TOP BAR & HEADER
  // ==========================================================
  Widget _buildTopBar(dynamic c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
            onPressed: () => Get.back(),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        'record_offline_payment_title'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5)),
                      ),
                      child: Text(
                        'offline_clearance_badge'.tr,
                        style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '${c.displayTitle} · ${c.clientCompany ?? c.clientName ?? ''}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // SECTION 1: FINANCIAL SUMMARY BANNER
  // ==========================================================
  Widget _buildFinancialSummaryBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.35)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.payments_rounded, color: Color(0xFFFBBF24), size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'total_campaign_sanction_budget'.tr,
                      style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '₹${controller.totalAmount.toStringAsFixed(0)}',
                      style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '(${'base_amount_label'.tr} ₹${controller.baseBudget.toStringAsFixed(0)} ${'gst_label'.tr} ₹${controller.gstAmount.toStringAsFixed(0)})',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFF334155), height: 1),
          const SizedBox(height: 12),

          // Locked Amount Received Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.25)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('amount_received_label'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.lock_outline_rounded, size: 10, color: Color(0xFFFBBF24)),
                              const SizedBox(width: 3),
                              Text('locked_badge'.tr, style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 9, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text('sanctioned_budget_fixed_note'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  ],
                ),
                Text(
                  '₹${controller.totalAmount.toStringAsFixed(0)}',
                  style: const TextStyle(color: Color(0xFF34D399), fontSize: 18, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // SECTION 2: PAYMENT METHOD SELECTION (9 INSTRUMENTS)
  // ==========================================================
  Widget _buildPaymentMethodSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.credit_card_rounded, color: Color(0xFFF59E0B), size: 16),
                  const SizedBox(width: 8),
                  Text('select_offline_method'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              SizedBox(height: 5,),
              Text(
                '${controller.paymentMethods.length} ${'instruments_supported'.tr}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Grid of 9 Methods
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.paymentMethods.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 2.2,
            ),
            itemBuilder: (context, index) {
              final m = controller.paymentMethods[index];
              return Obx(() {
                final isSelected = controller.selectedMethod.value == m.id;
                return InkWell(
                  onTap: () => controller.selectMethod(m.id),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFFF59E0B).withValues(alpha: 0.12) : const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? const Color(0xFFF59E0B) : AppColors.cardBorder,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFF59E0B) : const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(m.icon, color: isSelected ? Colors.white : m.color, size: 16),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                m.label,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.white70,
                                  fontSize: 11,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                m.desc,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              });
            },
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // SECTION 3: DYNAMIC INSTRUMENT FIELDS
  // ==========================================================
  Widget _buildDynamicInstrumentFields() {
    return Obx(() {
      final method = controller.selectedMethod.value;

      String sectionTitle;
      if (controller.isSanction) {
        sectionTitle = 'sanction_details'.tr;
      } else if (controller.isChequeOrDD) {
        sectionTitle = 'cheque_dd_details'.tr;
      } else if (controller.isBankTransfer) {
        sectionTitle = 'eft_details'.tr;
      } else if (controller.isUpi) {
        sectionTitle = 'upi_qr_details'.tr;
      } else {
        sectionTitle = 'cash_details'.tr;
      }

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(sectionTitle, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),

              ],
            ),
            const SizedBox(height: 5),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                method.toUpperCase(),
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5, fontFamily: 'monospace', fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 14),

            // Form inputs based on method
            if (controller.isChequeOrDD) ...[
              _buildInputField(
                label: 'cheque_dd_no_label'.tr,
                controller: controller.chequeNumberController,
                placeholder: 'cheque_no_ph'.tr,
                isRequired: true,
                isMonospace: true,
              ),
              const SizedBox(height: 12),
              _buildDatePickerField(
                label: 'instrument_issue_date'.tr,
                date: controller.chequeDate,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'bank_name_label'.tr,
                controller: controller.bankNameController,
                placeholder: 'e.g. State Bank of India, HDFC',
                isRequired: true,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'branch_ifsc_label'.tr,
                controller: controller.branchNameController,
                placeholder: 'e.g. Connaught Place / SBIN0001234',
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'drawer_holder_label'.tr,
                controller: controller.accountHolderController,
                placeholder: 'e.g. Acme Commercial Retail Ltd',
              ),
            ] else if (controller.isBankTransfer) ...[
              _buildInputField(
                label: 'utr_ref_label'.tr,
                controller: controller.utrNumberController,
                placeholder: 'utr_ref_ph'.tr,
                isRequired: true,
                isMonospace: true,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'remitter_bank_label'.tr,
                controller: controller.bankNameController,
                placeholder: 'e.g. ICICI Bank, Axis Bank',
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'remitter_branch_label'.tr,
                controller: controller.branchNameController,
                placeholder: 'e.g. Mumbai Corporate / ICIC0000004',
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'remitter_entity_label'.tr,
                controller: controller.accountHolderController,
                placeholder: 'e.g. Enterprise Client Ltd',
              ),
            ] else if (controller.isUpi) ...[
              _buildInputField(
                label: 'upi_ref_label'.tr,
                controller: controller.transactionIdController,
                placeholder: 'upi_ref_ph'.tr,
                isRequired: true,
                isMonospace: true,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'payer_vpa_label'.tr,
                controller: controller.accountHolderController,
                placeholder: 'e.g. merchant@okhdfcbank',
              ),
            ] else if (controller.isSanction) ...[
              _buildInputField(
                label: 'sanction_no_label'.tr,
                controller: controller.referenceNumberController,
                placeholder: 'sanction_no_ph'.tr,
                isRequired: true,
                isMonospace: true,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'sanctioning_dept_label'.tr,
                controller: controller.bankNameController,
                placeholder: 'e.g. Department of Transport / DIPR',
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'treasury_budget_label'.tr,
                controller: controller.branchNameController,
                placeholder: 'e.g. State Treasury / Head 2026-ADV',
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'nodal_officer_label'.tr,
                controller: controller.accountHolderController,
                placeholder: 'e.g. Dr. Rajesh Sharma, Joint Director',
              ),
            ] else ...[
              // Cash
              _buildInputField(
                label: 'cash_voucher_label'.tr,
                controller: controller.referenceNumberController,
                placeholder: 'cash_receipt_ph'.tr,
                isRequired: true,
                isMonospace: true,
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'collection_counter_label'.tr,
                controller: controller.branchNameController,
                placeholder: 'e.g. Central Depot Cash Counter, Counter 2',
              ),
              const SizedBox(height: 12),
              _buildInputField(
                label: 'depositor_name_label'.tr,
                controller: controller.accountHolderController,
                placeholder: 'e.g. Client representative name',
              ),
            ],
          ],
        ),
      );
    });
  }

  // ==========================================================
  // SECTION 4: AUDIT & VERIFICATION DOCUMENTATION
  // ==========================================================
  Widget _buildAuditDocumentationSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('audit_documentation_header'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('compliance_ledger_badge'.tr, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5)),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Collection Date
          _buildDatePickerField(
            label: 'clearance_date_label'.tr,
            date: controller.collectedAt,
            isRequired: true,
          ),
          const SizedBox(height: 12),

          // Verified By
          _buildInputField(
            label: 'verified_by_label'.tr,
            controller: controller.verifiedByNameController,
            placeholder: 'Staff / Officer name',
            isRequired: true,
          ),
          const SizedBox(height: 12),

          // Audit Remarks / Sanction Notes
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('audit_remarks_label'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextField(
                controller: controller.remarksController,
                maxLines: 3,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'settlement_notes_hint'.tr,
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorder)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorder)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFF59E0B))),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Proof Document Upload
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('proof_attachment_label'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Obx(() {
                    return ElevatedButton.icon(
                      onPressed: controller.isUploadingFile.value ? null : controller.pickAndUploadProof,
                      icon: controller.isUploadingFile.value
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.file_upload_outlined, size: 16, color: Colors.white),
                      label: Text(
                        controller.isUploadingFile.value ? 'uploading_status'.tr : 'choose_file_btn'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF334155),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    );
                  }),
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                controller: controller.proofUrlController,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace'),
                decoration: InputDecoration(
                  hintText: 'payment_proof_url_ph'.tr,
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.cardBorder)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFF59E0B))),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              ),

              // Uploaded / Attached Proof Preview Card
              Obx(() {
                final localPath = controller.uploadedProofLocalPath.value;
                final url = controller.proofUrl.value;
                final fileName = controller.uploadedProofFileName.value;

                final hasLocal = localPath != null && localPath.isNotEmpty;
                final hasUrl = url.isNotEmpty;

                if (!hasLocal && !hasUrl) {
                  return const SizedBox.shrink();
                }

                final displayTitle = fileName ?? (hasUrl ? (url.split('/').last) : 'Attached Instrument');
                final isLocalImage = hasLocal && (localPath.endsWith('.jpg') || localPath.endsWith('.jpeg') || localPath.endsWith('.png') || localPath.endsWith('.webp'));
                final isNetworkImage = hasUrl && (url.toLowerCase().contains('.jpg') || url.toLowerCase().contains('.jpeg') || url.toLowerCase().contains('.png') || url.toLowerCase().contains('.webp'));

                return Container(
                  margin: const EdgeInsets.only(top: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFF10B981).withValues(alpha: 0.5),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      // Thumbnail preview
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          width: 52,
                          height: 52,
                          color: const Color(0xFF1E293B),
                          child: hasLocal && isLocalImage
                              ? Image.file(
                                  File(localPath),
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => const Icon(Icons.image_outlined, color: Color(0xFF10B981), size: 26),
                                )
                              : (hasUrl && isNetworkImage
                                  ? Image.network(
                                      url,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, _, _) => const Icon(Icons.receipt_long_rounded, color: Color(0xFF10B981), size: 26),
                                    )
                                  : const Icon(Icons.receipt_long_rounded, color: Color(0xFF10B981), size: 26)),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Title & URL / Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  'attached_prefix'.tr,
                                  style: const TextStyle(
                                    color: Color(0xFF10B981),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              displayTitle,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (hasUrl) ...[
                              const SizedBox(height: 2),
                              Text(
                                url,
                                style: const TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 9.5,
                                  fontFamily: 'monospace',
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ],
                        ),
                      ),

                      // View & Delete Buttons
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if ((hasLocal && isLocalImage) || (hasUrl && isNetworkImage))
                            IconButton(
                              onPressed: () => _showAttachmentPreviewDialog(Get.context!, localPath, url),
                              icon: const Icon(Icons.visibility_outlined, color: Color(0xFF60A5FA), size: 20),
                              tooltip: 'view_attachment'.tr,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          const SizedBox(width: 12),
                          IconButton(
                            onPressed: controller.clearProofAttachment,
                            icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                            tooltip: 'remove_attachment'.tr,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  void _showAttachmentPreviewDialog(BuildContext context, String? localPath, String url) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'view_attachment'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  constraints: const BoxConstraints(maxHeight: 380),
                  child: (localPath != null && localPath.isNotEmpty)
                      ? Image.file(
                          File(localPath),
                          fit: BoxFit.contain,
                          errorBuilder: (_, _, _) => const Center(
                            child: Icon(Icons.broken_image, size: 48, color: Colors.white54),
                          ),
                        )
                      : Image.network(
                          url,
                          fit: BoxFit.contain,
                          errorBuilder: (_, _, _) => const Center(
                            child: Icon(Icons.broken_image, size: 48, color: Colors.white54),
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==========================================================
  // SECTION 5: ACTION BUTTONS (WITH PRIMARY GRADIENT)
  // ==========================================================
  Widget _buildActionButtons() {
    return Column(
      children: [
        // Confirm & Record Button with Primary Gradient
        Container(
          width: double.infinity,
          height: 48,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1).withValues(alpha: 0.35),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: Obx(() {
              final isBusy = controller.isSubmitting.value;
              return InkWell(
                onTap: isBusy ? null : controller.submitOfflinePayment,
                borderRadius: BorderRadius.circular(14),
                child: Center(
                  child: isBusy
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                            const SizedBox(width: 10),
                            Text('recording_payment_status'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 18),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                'confirm_record_payment_btn'.tr,
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: 10),

        // Cancel & Return Button
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton(
            onPressed: () => Get.back(),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.cardBorder),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('cancel_return_btn'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // HELPER FORM FIELDS
  // ==========================================================
  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required String placeholder,
    bool isRequired = false,
    bool isMonospace = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
            if (isRequired) const Text(' *', style: TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          style: TextStyle(color: Colors.white, fontSize: 12, fontFamily: isMonospace ? 'monospace' : null),
          decoration: InputDecoration(
            hintText: placeholder,
            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            filled: true,
            fillColor: const Color(0xFF0F172A),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFF59E0B))),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }

  Widget _buildDatePickerField({
    required String label,
    required Rx<DateTime> date,
    bool isRequired = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
            if (isRequired) const Text(' *', style: TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 6),
        Obx(() {
          return InkWell(
            onTap: () async {
              final picked = await showDatePicker(
                context: Get.context!,
                initialDate: date.value,
                firstDate: DateTime(2020),
                lastDate: DateTime(2035),
                builder: (context, child) {
                  return Theme(
                    data: ThemeData.dark().copyWith(
                      colorScheme: const ColorScheme.dark(
                        primary: Color(0xFFF59E0B),
                        surface: Color(0xFF1E293B),
                      ),
                    ),
                    child: child!,
                  );
                },
              );
              if (picked != null) {
                date.value = picked;
              }
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    DateFormat('dd MMM yyyy').format(date.value),
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const Icon(Icons.calendar_today_rounded, size: 16, color: Color(0xFFF59E0B)),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
