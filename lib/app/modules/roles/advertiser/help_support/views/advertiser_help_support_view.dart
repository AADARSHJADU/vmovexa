import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/advertiser_help_support_controller.dart';

class AdvertiserHelpSupportView extends GetView<AdvertiserHelpSupportController> {
  const AdvertiserHelpSupportView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Help & Support',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Campaign guides & growth desk',
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () => _showMyTicketsSheet(context),
                    icon: const Icon(Icons.confirmation_number_outlined, size: 14, color: Color(0xFF60A5FA)),
                    label: const Text('My Tickets', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF3B82F6), width: 1),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(color: Color(0xFF1E293B), height: 1),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Search Bar
                    _buildSearchBar(),
                    const SizedBox(height: 16),

                    // Growth Desk Banner Card
                    _buildGrowthDeskCard(context),
                    const SizedBox(height: 20),

                    // Quick Action Guides
                    const Text(
                      'ADVERTISER RUNBOOKS & GUIDES',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildGuidesGrid(context),
                    const SizedBox(height: 24),

                    // FAQs Accordion
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'FREQUENTLY ASKED QUESTIONS',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Obx(() => Text(
                              '${controller.filteredFaqs.length} Articles',
                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 10, fontFamily: 'monospace'),
                            )),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _buildFaqsList(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: TextField(
        onChanged: (val) => controller.filterFaqs(val),
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: const InputDecoration(
          prefixIcon: Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
          hintText: 'Search campaign setups, creative specs, or SLAs...',
          hintStyle: TextStyle(color: Color(0xFF475569), fontSize: 12),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildGrowthDeskCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF2563EB).withValues(alpha: 0.3), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E40AF).withValues(alpha: 0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                ),
                child: Obx(() => Text(
                      controller.deskBadge.value,
                      style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold),
                    )),
              ),
              const Row(
                children: [
                  Icon(Icons.bolt_rounded, color: Color(0xFFF59E0B), size: 14),
                  SizedBox(width: 4),
                  Text('4-Hour SLA', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Obx(() => Text(
                controller.contactPhone.value,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 0.3),
              )),
          const SizedBox(height: 2),
          Obx(() => Text(
                controller.contactEmail.value,
                style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w500),
              )),
          const SizedBox(height: 6),
          Obx(() => Text(
                controller.deskDesc.value,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.35),
              )),
          const SizedBox(height: 14),
          const Divider(color: Color(0xFF334155), height: 1),
          const SizedBox(height: 12),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => controller.callGrowthDesk(),
                  icon: const Icon(Icons.phone_outlined, size: 14, color: Colors.white),
                  label: const Text('Call Desk', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF334155)),
                    backgroundColor: const Color(0xFF0F172A),
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => controller.emailGrowthDesk(),
                  icon: const Icon(Icons.mail_outline_rounded, size: 14, color: Colors.white),
                  label: const Text('Email Desk', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF334155)),
                    backgroundColor: const Color(0xFF0F172A),
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: ElevatedButton.icon(
                    onPressed: () => _showCreateTicketSheet(context),
                    icon: const Icon(Icons.add_rounded, size: 14, color: Colors.white),
                    label: const Text('New Ticket', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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

  Widget _buildGuidesGrid(BuildContext context) {
    return Obx(() {
      final items = controller.guides;
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 1.5,
        ),
        itemCount: items.length,
        itemBuilder: (ctx, i) {
          final g = items[i];
          return InkWell(
            onTap: () => _showGuideDetailDialog(context, g),
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(g.icon, color: const Color(0xFF60A5FA), size: 16),
                      ),
                      const Spacer(),
                      const Icon(Icons.arrow_forward_ios_rounded, color: Color(0xFF475569), size: 11),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    g.title,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    g.desc,
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  Widget _buildFaqsList() {
    return Obx(() {
      final items = controller.filteredFaqs;
      if (items.isEmpty) {
        return Container(
          padding: const EdgeInsets.all(24),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Text('No matching FAQ articles found', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (context, index) => const SizedBox(height: 8),
        itemBuilder: (ctx, i) {
          final f = items[i];
          final isExpanded = controller.expandedFaqIndex.value == i;

          return Container(
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isExpanded ? const Color(0xFF3B82F6).withValues(alpha: 0.5) : AppColors.cardBorder,
                width: 1.2,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: ExpansionTile(
                initiallyExpanded: isExpanded,
                key: Key('faq_${i}_$isExpanded'),
                tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                onExpansionChanged: (exp) {
                  controller.toggleFaq(exp ? i : -1);
                },
                leading: Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text('Q', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
                title: Text(
                  f.q,
                  style: TextStyle(
                    color: isExpanded ? const Color(0xFF60A5FA) : Colors.white,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                trailing: Icon(
                  isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                  color: isExpanded ? const Color(0xFF60A5FA) : const Color(0xFF64748B),
                ),
                children: [
                  const Divider(color: Color(0xFF334155), height: 1),
                  const SizedBox(height: 10),
                  Text(
                    f.a,
                    style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, height: 1.45),
                  ),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  void _showGuideDetailDialog(BuildContext context, AdvertiserHelpGuideItem g) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(g.icon, color: const Color(0xFF60A5FA), size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(g.title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold))),
          ],
        ),
        content: Text(
          '${g.desc}\n\nFor detailed SLA walkthroughs or immediate creative onboarding support, please contact the dedicated Advertiser Growth Desk at +91 98765 43210.',
          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Color(0xFF60A5FA), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showCreateTicketSheet(BuildContext context) {
    final subjectCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String category = 'Campaign Verification';
    String priority = 'medium';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 18,
                right: 18,
                top: 18,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 18,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Raise Support Ticket',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, color: Colors.white70),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Subject
                    const Text('Subject', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    _buildModalTextField(controller: subjectCtrl, hint: 'Brief issue summary'),
                    const SizedBox(height: 12),

                    // Category & Priority
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Category', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFF334155)),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: category,
                                    dropdownColor: const Color(0xFF1E293B),
                                    isExpanded: true,
                                    style: const TextStyle(color: Colors.white, fontSize: 11),
                                    items: ['Campaign Verification', 'Slot Booking', 'Billing & Tax', 'Creative Playback', 'General']
                                        .map((c) => DropdownMenuItem(value: c, child: Text(c, maxLines: 1, overflow: TextOverflow.ellipsis)))
                                        .toList(),
                                    onChanged: (val) {
                                      if (val != null) setModalState(() => category = val);
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Priority', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFF334155)),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: priority,
                                    dropdownColor: const Color(0xFF1E293B),
                                    isExpanded: true,
                                    style: const TextStyle(color: Colors.white, fontSize: 11),
                                    items: ['low', 'medium', 'high', 'urgent']
                                        .map((p) => DropdownMenuItem(value: p, child: Text(p.toUpperCase())))
                                        .toList(),
                                    onChanged: (val) {
                                      if (val != null) setModalState(() => priority = val);
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Description
                    const Text('Detailed Description', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    _buildModalTextField(controller: descCtrl, hint: 'Describe the issue or assistance needed', maxLines: 3),
                    const SizedBox(height: 18),

                    // Submit
                    Obx(() {
                      final loading = controller.isSubmittingTicket.value;
                      return Container(
                        width: double.infinity,
                        height: 46,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ElevatedButton(
                          onPressed: loading
                              ? null
                              : () async {
                                  if (subjectCtrl.text.trim().isEmpty || descCtrl.text.trim().isEmpty) {
                                    Get.snackbar('Required', 'Please fill subject and description',
                                        backgroundColor: Colors.orangeAccent, colorText: Colors.white);
                                    return;
                                  }
                                  final ok = await controller.createSupportTicket(
                                    subject: subjectCtrl.text,
                                    category: category,
                                    priority: priority,
                                    description: descCtrl.text,
                                  );
                                  if (ok && ctx.mounted) {
                                    Navigator.pop(ctx);
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: loading
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Submit Ticket', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showMyTicketsSheet(BuildContext context) {
    controller.loadMyTickets();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.75),
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Support Tickets History', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.close_rounded, color: Colors.white70), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Divider(color: Color(0xFF1E293B)),
              const SizedBox(height: 8),

              Expanded(
                child: Obx(() {
                  if (controller.isLoadingTickets.value) {
                    return const Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6)));
                  }
                  final list = controller.myTickets;
                  if (list.isEmpty) {
                    return const Center(
                      child: Text('No active support tickets found', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                    );
                  }

                  return ListView.separated(
                    itemCount: list.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (c, idx) {
                      final t = list[idx];
                      final status = (t['status'] ?? 'open').toString().toLowerCase();
                      final color = status == 'resolved'
                          ? const Color(0xFF10B981)
                          : (status == 'closed' ? const Color(0xFF64748B) : const Color(0xFF3B82F6));

                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  t['code'] ?? t['id'] ?? 'TICKET',
                                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: color.withValues(alpha: 0.3)),
                                  ),
                                  child: Text(
                                    status.toUpperCase(),
                                    style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              t['subject'] ?? 'No Subject',
                              style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              t['description'] ?? '',
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildModalTextField({required TextEditingController controller, required String hint, int maxLines = 1}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        style: const TextStyle(color: Colors.white, fontSize: 12),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 11),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
      ),
    );
  }
}
