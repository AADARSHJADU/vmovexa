import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/finance_help_support_controller.dart';

class FinanceHelpSupportView extends GetView<FinanceHelpSupportController> {
  const FinanceHelpSupportView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kBorder = Color(0xFF262638);
  static const Color kPurple = Color(0xFFB042FF);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<FinanceHelpSupportController>()) {
      Get.put(FinanceHelpSupportController());
    }

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            _buildTopTabs(),
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.allFaqs.isEmpty) {
                  return const Center(child: CircularProgressIndicator(color: kPurple));
                }

                return RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: controller.activeTabIndex.value == 0
                      ? _buildFaqAndGuidesTab(context)
                      : _buildMyTicketsTab(context),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // 1. Header with Breadcrumb and "Raise Ticket" button
  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(bottom: BorderSide(color: kBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: controller.onBackPressed,
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
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Finance Portal  /  ',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                        Text(
                          'Help & Support',
                          style: TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Helpdesk & Documentation',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
              ),
              // GestureDetector(
              //   onTap: () => _openCreateTicketModal(context),
              //   child: Container(
              //     padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              //     decoration: BoxDecoration(
              //       gradient: AppTheme.primaryGradient,
              //       borderRadius: BorderRadius.circular(10),
              //     ),
              //     child: const Row(
              //       mainAxisSize: MainAxisSize.min,
              //       children: [
              //         Icon(Icons.add_circle_outline, color: Colors.white, size: 14),
              //         SizedBox(width: 5),
              //         Text(
              //           'Raise Ticket',
              //           style: TextStyle(
              //             color: Colors.white,
              //             fontSize: 11.5,
              //             fontWeight: FontWeight.bold,
              //           ),
              //         ),
              //       ],
              //     ),
              //   ),
              // ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'GST filing guides, bank auto-reconciliation FAQs, and finance dispute desk',
            style: TextStyle(color: Colors.white54, fontSize: 11),
          ),
        ],
      ),
    );
  }

  // 2. Top Tabs (FAQs & Guides vs My Tickets) with AppTheme.primaryGradient for active tab
  Widget _buildTopTabs() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Obx(
        () => Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => controller.activeTabIndex.value = 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    gradient: controller.activeTabIndex.value == 0 ? AppTheme.primaryGradient : null,
                    color: controller.activeTabIndex.value == 0 ? null : kCardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: controller.activeTabIndex.value == 0 ? Colors.transparent : kBorder,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      'FAQs & Runbooks',
                      style: TextStyle(
                        color: controller.activeTabIndex.value == 0 ? Colors.white : const Color(0xFF94A3B8),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: GestureDetector(
                onTap: () => controller.activeTabIndex.value = 1,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    gradient: controller.activeTabIndex.value == 1 ? AppTheme.primaryGradient : null,
                    color: controller.activeTabIndex.value == 1 ? null : kCardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: controller.activeTabIndex.value == 1 ? Colors.transparent : kBorder,
                    ),
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'My Tickets',
                          style: TextStyle(
                            color: controller.activeTabIndex.value == 1 ? Colors.white : const Color(0xFF94A3B8),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (controller.myTickets.isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: controller.activeTabIndex.value == 1
                                  ? Colors.white.withValues(alpha: 0.25)
                                  : const Color(0xFF262638),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${controller.myTickets.length}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 3. Tab 1: FAQs & Runbooks
  Widget _buildFaqAndGuidesTab(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      children: [
        // Contact desk card
        _buildContactDeskCard(context),
        const SizedBox(height: 16),

        // Search bar
        Container(
          height: 42,
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: kBorder),
          ),
          child: TextField(
            onChanged: controller.onSearchChanged,
            style: const TextStyle(color: Colors.white, fontSize: 12.5),
            decoration: const InputDecoration(
              hintText: 'Search GST, invoices, reconciliation or gateway FAQs...',
              hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
              prefixIcon: Icon(Icons.search, color: Color(0xFF64748B), size: 16),
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.symmetric(vertical: 11),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // FAQ Section Header
        const Text(
          'FREQUENTLY ASKED QUESTIONS',
          style: TextStyle(
            color: Colors.white,
            fontSize: 11.5,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 10),

        // FAQ List
        Obx(() {
          if (controller.filteredFaqs.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kBorder),
              ),
              child: const Center(
                child: Text(
                  'No FAQs found matching your query.',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                ),
              ),
            );
          }

          return Column(
            children: List.generate(controller.filteredFaqs.length, (index) {
              final faq = controller.filteredFaqs[index];
              final isExpanded = controller.expandedFaqIndex.value == index;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: isExpanded ? const Color(0xFF6366F1).withValues(alpha: 0.5) : kBorder),
                ),
                child: Column(
                  children: [
                    InkWell(
                      onTap: () => controller.toggleFaq(index),
                      borderRadius: BorderRadius.circular(14),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF6366F1).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.help_outline, color: Color(0xFF818CF8), size: 16),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                faq.question,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            Icon(
                              isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                              color: const Color(0xFF94A3B8),
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (isExpanded) ...[
                      const Divider(color: kBorder, height: 1),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Text(
                          faq.answer,
                          style: const TextStyle(
                            color: Color(0xFFCBD5E1),
                            fontSize: 12,
                            height: 1.45,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }),
          );
        }),
        const SizedBox(height: 24),
      ],
    );
  }

  // Contact Desk Banner
  Widget _buildContactDeskCard(BuildContext context) {
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
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.headset_mic, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Finance Helpdesk & Support Desk',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  // SizedBox(height: 2),
                  // Text(
                  //   'billing@vmovexa.com  •  Mon - Sat, 09:00 - 18:00 IST',
                  //   style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                  // ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Need urgent assistance with bank auto-reconciliation, failed payment refunds, or statutory tax returns?',
            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: CustomButton(
              text: 'Raise a Support Ticket',
              height: 42,
              isGradient: true,
              onTap: () => _openCreateTicketModal(context),
              prefixIcon: const Icon(Icons.confirmation_number_outlined, color: Colors.white, size: 16),
            ),
          ),
        ],
      ),
    );
  }

  // 4. Tab 2: My Tickets
  Widget _buildMyTicketsTab(BuildContext context) {
    return Obx(() {
      if (controller.myTickets.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: kCardBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: kBorder),
                ),
                child: const Icon(Icons.inbox_outlined, color: Color(0xFF64748B), size: 36),
              ),
              const SizedBox(height: 14),
              const Text(
                'No Tickets Raised Yet',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'You have not filed any finance desk tickets.',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
              ),
              const SizedBox(height: 16),
              CustomButton(
                text: 'Create New Ticket',
                width: 180,
                height: 40,
                isGradient: true,
                onTap: () => _openCreateTicketModal(context),
              ),
            ],
          ),
        );
      }

      return ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        itemCount: controller.myTickets.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, index) {
          final ticket = controller.myTickets[index];
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: kBorder),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.confirmation_number_outlined, color: Color(0xFF818CF8), size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            ticket.id,
                            style: const TextStyle(
                              color: Color(0xFF818CF8),
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          _buildStatusBadge(ticket.status),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        ticket.subject,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            ticket.category,
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                          ),
                          const Text('  •  ', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                          Text(
                            ticket.date,
                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      );
    });
  }

  Widget _buildStatusBadge(String status) {
    Color bg = const Color(0xFF262638);
    Color fg = Colors.white70;

    switch (status.toLowerCase()) {
      case 'open':
        bg = const Color(0xFF60A5FA).withValues(alpha: 0.15);
        fg = const Color(0xFF60A5FA);
        break;
      case 'in_progress':
        bg = const Color(0xFFFBBF24).withValues(alpha: 0.15);
        fg = const Color(0xFFFBBF24);
        break;
      case 'resolved':
      case 'closed':
        bg = const Color(0xFF34D399).withValues(alpha: 0.15);
        fg = const Color(0xFF34D399);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: fg, fontSize: 9.5, fontWeight: FontWeight.bold),
      ),
    );
  }

  // 5. Raise Support Ticket BottomSheet Modal
  void _openCreateTicketModal(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
          border: Border(top: BorderSide(color: Color(0x33B042FF), width: 1.5)),
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
                    'Raise Finance Support Ticket',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                'Submit an issue directly to the Corporate Treasury & Finance Desk',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
              ),
              const SizedBox(height: 16),

              // Category dropdown
              const Text('Category', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Obx(
                () => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F0F1A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: controller.selectedCategory.value,
                      dropdownColor: const Color(0xFF15151F),
                      icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                      items: controller.categories.map((c) {
                        return DropdownMenuItem<String>(
                          value: c['code'],
                          child: Text(c['name'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 12.5)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) controller.selectedCategory.value = val;
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Priority
              const Text('Priority', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Obx(
                () => Row(
                  children: controller.priorities.map((p) {
                    final isSel = controller.selectedPriority.value == p;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => controller.selectedPriority.value = p,
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            gradient: isSel ? AppTheme.primaryGradient : null,
                            color: isSel ? null : const Color(0xFF0F0F1A),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: isSel ? Colors.transparent : kBorder),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            p,
                            style: TextStyle(
                              color: isSel ? Colors.white : const Color(0xFF94A3B8),
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 12),

              // Subject
              const Text('Subject *', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0F0F1A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                child: TextField(
                  controller: controller.subjectController,
                  style: const TextStyle(color: Colors.white, fontSize: 12.5),
                  decoration: const InputDecoration(
                    hintText: 'e.g. UTR-20261028 unmatched in auto-reconciliation',
                    hintStyle: TextStyle(color: Color(0xFF475569), fontSize: 11.5),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Description
              const Text('Description *', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0F0F1A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                child: TextField(
                  controller: controller.descriptionController,
                  maxLines: 3,
                  style: const TextStyle(color: Colors.white, fontSize: 12.5),
                  decoration: const InputDecoration(
                    hintText: 'Provide complete transaction details, invoice ID, or error message...',
                    hintStyle: TextStyle(color: Color(0xFF475569), fontSize: 11.5),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Submit Button with Gradient
              Obx(
                () => CustomButton(
                  text: 'Submit Support Ticket',
                  isGradient: true,
                  isLoading: controller.isSubmittingTicket.value,
                  onTap: controller.submitNewTicket,
                  prefixIcon: const Icon(Icons.send_outlined, color: Colors.white, size: 16),
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }
}
