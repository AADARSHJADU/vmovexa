import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/finance_raise_ticket_controller.dart';

class FinanceRaiseTicketView extends GetView<FinanceRaiseTicketController> {
  const FinanceRaiseTicketView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kBorder = Color(0xFF262638);
  static const Color kMuted = Color(0xFF94A3B8);

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<FinanceRaiseTicketController>()
        ? Get.find<FinanceRaiseTicketController>()
        : Get.put(FinanceRaiseTicketController());

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            _buildTopAppBar(context),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Subtitle Banner
                    _buildSubtitleBanner(),
                    const SizedBox(height: 16),

                    // Main Form Card Container
                    _buildFormCard(context, controller),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Top App Bar with Breadcrumbs & Back Button
  Widget _buildTopAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(bottom: BorderSide(color: kBorder)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: kBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kBorder),
              ),
              child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'finance_help.portal_breadcrumb'.tr,
                      style: const TextStyle(color: kMuted, fontSize: 11),
                    ),
                    const Text('  /  ', style: TextStyle(color: kMuted, fontSize: 11)),
                    Text(
                      'finance_help.help_breadcrumb'.tr,
                      style: const TextStyle(color: kMuted, fontSize: 11),
                    ),
                    const Text('  /  ', style: TextStyle(color: kMuted, fontSize: 11)),
                    Text(
                      'finance_help.raise_ticket'.tr,
                      style: const TextStyle(
                        color: Color(0xFF818CF8),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'finance_help.raise_ticket_title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: kBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: kBorder),
              ),
              child: Text(
                'back_to_ticket_history'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Subtitle Banner matching Admin Panel
  Widget _buildSubtitleBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF818CF8).withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF818CF8).withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, color: Color(0xFF818CF8), size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'submit_formal_query_desc'.tr,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                fontSize: 11,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Main Form Card Container
  Widget _buildFormCard(BuildContext context, FinanceRaiseTicketController controller) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Ticket Subject
          Row(
            children: [
              Text(
                'ticket_subject'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 4),
              const Text('*', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(
              color: kBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorder),
            ),
            child: TextField(
              controller: controller.subjectController,
              style: const TextStyle(color: Colors.white, fontSize: 12.5),
              decoration: InputDecoration(
                hintText: 'finance_help.ticket_subject_hint'.tr,
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 2. Category & Priority Row (2-Column Grid)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'category'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Obx(
                      () => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: kBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: kBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: controller.selectedCategory.value,
                            isExpanded: true,
                            dropdownColor: kCardBg,
                            style: const TextStyle(color: Colors.white, fontSize: 11.5),
                            icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                            items: controller.categories.map((cat) {
                              return DropdownMenuItem<String>(
                                value: cat,
                                child: Text(
                                  controller.getCategoryLabel(cat),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) controller.selectedCategory.value = val;
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Priority
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'priority_level'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Obx(
                      () => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: kBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: kBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: controller.selectedPriority.value,
                            isExpanded: true,
                            dropdownColor: kCardBg,
                            style: const TextStyle(color: Colors.white, fontSize: 11.5),
                            icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                            items: controller.priorities.map((item) {
                              final val = item['value']!;
                              final labelKey = item['labelKey']!;
                              return DropdownMenuItem<String>(
                                value: val,
                                child: Text(
                                  labelKey.tr,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) controller.selectedPriority.value = val;
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 3. Issue Description
          Row(
            children: [
              Text(
                'issue_description'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 4),
              const Text('*', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(
              color: kBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorder),
            ),
            child: TextField(
              controller: controller.descriptionController,
              maxLines: 5,
              style: const TextStyle(color: Colors.white, fontSize: 12.5),
              decoration: InputDecoration(
                hintText: 'finance_help.description_hint'.tr,
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.all(14),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 4. Attach Evidence Files / Documents Section
          Text(
            'attach_evidence_files_documents'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),

          // Pick Files Row
          Row(
            children: [
              GestureDetector(
                onTap: () => _showAttachmentPicker(context, controller),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: kBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF818CF8).withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.attach_file_rounded, color: Color(0xFF818CF8), size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'choose_file_photo'.tr,
                        style: const TextStyle(
                          color: Color(0xFF818CF8),
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Obx(
                () => controller.isUploadingFile.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF818CF8)),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Attached Files List Chips
          Obx(() {
            if (controller.attachments.isEmpty) {
              return const SizedBox.shrink();
            }

            return Wrap(
              spacing: 8,
              runSpacing: 8,
              children: List.generate(controller.attachments.length, (idx) {
                final att = controller.attachments[idx];
                final fileName = att['fileName']?.toString() ?? 'Attachment #${idx + 1}';
                final fileSize = att['fileSize'] != null ? '${((att['fileSize'] as num) / 1024).round()} KB' : '';

                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF818CF8).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF818CF8).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.insert_drive_file_outlined, color: Color(0xFF818CF8), size: 14),
                      const SizedBox(width: 6),
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 160),
                        child: Text(
                          fileSize.isNotEmpty ? '$fileName ($fileSize)' : fileName,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () => controller.removeAttachment(idx),
                        child: const Icon(Icons.close_rounded, color: Colors.white60, size: 14),
                      ),
                    ],
                  ),
                );
              }),
            );
          }),
          const SizedBox(height: 24),

          // 5. Submit Actions Footer
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: () => Get.back(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  decoration: BoxDecoration(
                    color: kBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kBorder),
                  ),
                  child: Text(
                    'cancel'.tr,
                    style: const TextStyle(color: kMuted, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Obx(
                () => GestureDetector(
                  onTap: controller.isSubmitting.value ? null : controller.submitTicket,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF818CF8).withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Center(
                      child: controller.isSubmitting.value
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Text(
                              'submit_support_ticket'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Image / Attachment Source Picker Dialog
  void _showAttachmentPicker(BuildContext context, FinanceRaiseTicketController controller) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            border: Border(top: BorderSide(color: kBorder)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(color: kBorder, borderRadius: BorderRadius.circular(2)),
              ),
              const SizedBox(height: 16),
              Text(
                'attach_evidence_files_documents'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF818CF8).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.camera_alt_outlined, color: Color(0xFF818CF8), size: 18),
                ),
                title: const Text('Camera', style: TextStyle(color: Colors.white, fontSize: 12.5)),
                onTap: () {
                  Navigator.pop(ctx);
                  controller.pickAttachment(source: ImageSource.camera);
                },
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF818CF8).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.photo_library_outlined, color: Color(0xFF818CF8), size: 18),
                ),
                title: const Text('Gallery / Photo Library', style: TextStyle(color: Colors.white, fontSize: 12.5)),
                onTap: () {
                  Navigator.pop(ctx);
                  controller.pickAttachment(source: ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
