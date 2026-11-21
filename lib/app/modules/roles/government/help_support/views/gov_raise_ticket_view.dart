import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import '../controllers/gov_raise_ticket_controller.dart';

class GovRaiseTicketView extends GetView<GovRaiseTicketController> {
  const GovRaiseTicketView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<GovRaiseTicketController>()
        ? Get.find<GovRaiseTicketController>()
        : Get.put(GovRaiseTicketController());

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(context),

            // Form Content
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Subtitle Banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0x1F3B82F6),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0x4D3B82F6)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline_rounded, color: Color(0xFF60A5FA), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'gov_help.raise_ticket_desc'.tr,
                              style: const TextStyle(
                                color: Color(0xFF93C5FD),
                                fontSize: 11,
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Card Form Container
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 1. Ticket Subject
                          Row(
                            children: [
                              Text(
                                'gov_help.ticket_subject'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Text('*', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF334155)),
                            ),
                            child: TextField(
                              controller: c.subjectController,
                              style: const TextStyle(color: Colors.white, fontSize: 12.5),
                              decoration: InputDecoration(
                                hintText: 'gov_help.ticket_subject_hint'.tr,
                                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // 2. Category & Priority Row
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Category
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'gov_help.category'.tr,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Obx(() => Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF1E293B),
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(color: const Color(0xFF334155)),
                                          ),
                                          child: DropdownButtonHideUnderline(
                                            child: DropdownButton<String>(
                                              value: c.selectedCategory.value,
                                              isExpanded: true,
                                              dropdownColor: const Color(0xFF1E293B),
                                              style: const TextStyle(color: Colors.white, fontSize: 11.5),
                                              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                                              items: c.categories.map((cat) {
                                                return DropdownMenuItem<String>(
                                                  value: cat,
                                                  child: Text(
                                                    c.getCategoryLabel(cat),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                );
                                              }).toList(),
                                              onChanged: (val) {
                                                if (val != null) c.selectedCategory.value = val;
                                              },
                                            ),
                                          ),
                                        )),
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
                                      'gov_help.priority'.tr,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Obx(() => Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF1E293B),
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(color: const Color(0xFF334155)),
                                          ),
                                          child: DropdownButtonHideUnderline(
                                            child: DropdownButton<String>(
                                              value: c.selectedPriority.value,
                                              isExpanded: true,
                                              dropdownColor: const Color(0xFF1E293B),
                                              style: const TextStyle(color: Colors.white, fontSize: 11.5),
                                              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                                              items: c.priorities.map((item) {
                                                final val = item['value']!;
                                                final key = item['key']!;
                                                return DropdownMenuItem<String>(
                                                  value: val,
                                                  child: Text(
                                                    key.tr,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                );
                                              }).toList(),
                                              onChanged: (val) {
                                                if (val != null) c.selectedPriority.value = val;
                                              },
                                            ),
                                          ),
                                        )),
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
                                'gov_help.description'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Text('*', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF334155)),
                            ),
                            child: TextField(
                              controller: c.descriptionController,
                              maxLines: 5,
                              style: const TextStyle(color: Colors.white, fontSize: 12.5),
                              decoration: InputDecoration(
                                hintText: 'gov_help.description_hint'.tr,
                                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.all(14),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // 4. Attach Evidence Files / Documents Section
                          Text(
                            'gov_help.attachments'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),

                          Row(
                            children: [
                              Obx(
                                () => OutlinedButton.icon(
                                  onPressed: c.isUploadingFile.value ? null : c.pickAttachment,
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Color(0xFF3B82F6)),
                                    backgroundColor: const Color(0xFF1E293B),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  icon: c.isUploadingFile.value
                                      ? const SizedBox(
                                          width: 14,
                                          height: 14,
                                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF60A5FA)),
                                        )
                                      : const Icon(Icons.add_photo_alternate_outlined, color: Color(0xFF60A5FA), size: 16),
                                  label: Text(
                                    c.isUploadingFile.value ? 'gov_help.submitting'.tr : 'gov_help.attach_file'.tr,
                                    style: const TextStyle(
                                      color: Color(0xFF60A5FA),
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),

                          // Attached Files List
                          Obx(() {
                            if (c.attachments.isEmpty) return const SizedBox.shrink();

                            return Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: List.generate(c.attachments.length, (idx) {
                                final att = c.attachments[idx];
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1E293B),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.attachment_rounded, color: Color(0xFF60A5FA), size: 14),
                                      const SizedBox(width: 6),
                                      ConstrainedBox(
                                        constraints: const BoxConstraints(maxWidth: 160),
                                        child: Text(
                                          att['fileName']?.toString() ?? 'attachment',
                                          style: const TextStyle(color: Colors.white, fontSize: 11),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      GestureDetector(
                                        onTap: () => c.removeAttachment(idx),
                                        child: const Icon(Icons.close_rounded, color: Colors.white60, size: 14),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            );
                          }),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Actions Footer: Cancel & Submit Support Ticket with primaryGradient
                    Row(
                      children: [
                        Expanded(
                          flex: 4,
                          child: OutlinedButton(
                            onPressed: () => Get.back(),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF475569)),
                              backgroundColor: const Color(0xFF1E293B),
                              padding: const EdgeInsets.symmetric(vertical: 13),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: Text(
                              'cancel'.tr,
                              style: const TextStyle(
                                color: Color(0xFFCBD5E1),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 7,
                          child: Obx(() {
                            final loading = c.isSubmitting.value;
                            return Container(
                              height: 48,
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                onPressed: loading ? null : c.submitTicket,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: loading
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                      )
                                    : Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 17),
                                          const SizedBox(width: 6),
                                          Flexible(
                                            child: Text(
                                              'gov_help.submit_ticket'.tr,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 12.5,
                                                fontWeight: FontWeight.bold,
                                                letterSpacing: 0.2,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                              ),
                            );
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: Color(0xFF1E293B), width: 1)),
      ),
      child: Row(
        children: [
          const CustomBackButton(),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'gov_help.raise_ticket_title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'gov_help.breadcrumb'.tr,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                  ),
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
}
