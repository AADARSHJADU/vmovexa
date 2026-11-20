import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/driver_help_support_controller.dart';
import '../model/help_support_models.dart';

class DriverHelpSupportView extends GetView<DriverHelpSupportController> {
  const DriverHelpSupportView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x1AFFFFFF);

  @override
  Widget build(BuildContext context) {
    final ScrollController scrollController = ScrollController();
    final GlobalKey guidesKey = GlobalKey();
    final GlobalKey faqsKey = GlobalKey();

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: AppTheme.gradientBlue),
            );
          }

          final content = controller.helpContent.value;

          return RefreshIndicator(
            color: AppTheme.gradientBlue,
            backgroundColor: kCardBg,
            onRefresh: controller.onRefresh,
            child: ListView(
              controller: scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              children: [
                // 1. Header with Breadcrumb-style title & Action buttons
                _buildHeader(context),
                const SizedBox(height: 16),

                // 2. Red Transit Emergency SOS Hero Banner
                _buildEmergencySosBanner(content.contact),
                const SizedBox(height: 16),

                // 3. Quick Help 3-Tiles Grid
                _buildQuickActionTiles(
                  onFaqsTap: () {
                    Scrollable.ensureVisible(
                      faqsKey.currentContext!,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  },
                  onGuidesTap: () {
                    Scrollable.ensureVisible(
                      guidesKey.currentContext!,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  },
                  onVideosTap: controller.openVideoAcademy,
                  videoCount: content.videoAcademy?.videos.length ?? 4,
                ),
                const SizedBox(height: 20),

                // 4. Standard Operating Procedures & Guides (4 Cards)
                Container(key: guidesKey),
                _buildSopGuidesSection(content.guides),
                const SizedBox(height: 20),

                // 5. Frequently Asked Questions (FAQs) Accordion with Live Search
                Container(key: faqsKey),
                _buildFaqsSection(),
                const SizedBox(height: 20),

                // 6. Recent Support Tickets Preview
                _buildRecentTicketsSection(),
                const SizedBox(height: 32),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- 1. Header ----------------
  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: controller.onBackPressed,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'driver_help_title'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.3,
                    ),
                  ),
                  Text(
                    'driver_help_subtitle'.tr,
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Action CTA Buttons Row
        Row(
          children: [
            // Raise Support Ticket Button (AppTheme.primaryGradient)
            Expanded(
              flex: 3,
              child: GestureDetector(
                onTap: controller.openRaiseTicketModal,
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.gradientBlue.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add_circle_outline, color: Colors.white, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'raise_support_ticket'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // View Ticket History Button
            Expanded(
              flex: 2,
              child: GestureDetector(
                onTap: controller.openSupportHistory,
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: kBorder),
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.history_outlined, color: Colors.white70, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'ticket_history'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ---------------- 2. Emergency SOS Hero Banner ----------------
  Widget _buildEmergencySosBanner(DriverContactInfo contact) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A1015),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE53935).withOpacity(0.4)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFE53935).withOpacity(0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
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
                  color: const Color(0xFFE53935),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE53935).withOpacity(0.4),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(Icons.phone_in_talk_rounded, color: Colors.white, size: 24),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE53935).withOpacity(0.25),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        contact.badge.toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFFFF8A80),
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      contact.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      contact.description,
                      style: const TextStyle(color: Color(0xFFFFCDD2), fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Call Control Room Button
          GestureDetector(
            onTap: controller.callEmergencySOS,
            child: Container(
              width: double.infinity,
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFFE53935),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.call, color: Colors.white, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      contact.ctaText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- 3. Quick Action 3-Tiles ----------------
  Widget _buildQuickActionTiles({
    required VoidCallback onFaqsTap,
    required VoidCallback onGuidesTap,
    required VoidCallback onVideosTap,
    required int videoCount,
  }) {
    final tiles = [
      {
        'label': 'faqs'.tr,
        'sub': 'faqs_sub'.tr,
        'icon': Icons.help_outline_rounded,
        'color': AppTheme.gradientBlue,
        'onTap': onFaqsTap,
      },
      {
        'label': 'user_guides'.tr,
        'sub': 'user_guides_sub'.tr,
        'icon': Icons.menu_book_outlined,
        'color': AppTheme.gradientPink,
        'onTap': onGuidesTap,
      },
      {
        'label': 'video_tutorials'.tr,
        'sub': '$videoCount ${'videos'.tr}',
        'icon': Icons.play_circle_outline_rounded,
        'color': const Color(0xFF2ECC71),
        'onTap': onVideosTap,
      },
    ];

    return Row(
      children: tiles.map((t) {
        final label = t['label'] as String;
        final sub = t['sub'] as String;
        final icon = t['icon'] as IconData;
        final color = t['color'] as Color;
        final onTap = t['onTap'] as VoidCallback;

        return Expanded(
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kBorder),
              ),
              child: Column(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Icon(icon, color: color, size: 20),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    sub,
                    style: const TextStyle(color: Colors.white38, fontSize: 10),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // ---------------- 4. SOP Guides Section ----------------
  Widget _buildSopGuidesSection(List<DriverGuideItem> guides) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'sop_and_guides'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),

          ],
        ),
        Text(
          'sop_and_guides_sub'.tr,
          style: const TextStyle(color: Colors.white38, fontSize: 11),
        ),
        const SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.15,
          ),
          itemCount: guides.length,
          itemBuilder: (context, index) {
            final guide = guides[index];
            final hasPdf = guide.hasPdf;
            return GestureDetector(
              onTap: () => controller.openSopGuide(guide),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: guide.iconColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(guide.iconData, color: guide.iconColor, size: 18),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: hasPdf
                                ? const Color(0xFF2ECC71).withOpacity(0.15)
                                : Colors.white.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(
                              color: hasPdf
                                  ? const Color(0xFF2ECC71).withOpacity(0.3)
                                  : Colors.white.withOpacity(0.12),
                            ),
                          ),
                          child: Text(
                            hasPdf ? 'PDF' : 'SOP',
                            style: TextStyle(
                              color: hasPdf ? const Color(0xFF2ECC71) : Colors.white54,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(
                      guide.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      guide.desc,
                      style: const TextStyle(color: Colors.white38, fontSize: 10),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (hasPdf) ...[
                          const Icon(Icons.download_rounded, color: Color(0xFF60A5FA), size: 12),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              'download_read_sop'.tr,
                              style: const TextStyle(
                                color: Color(0xFF60A5FA),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Icon(Icons.open_in_new_rounded, color: Color(0xFF60A5FA), size: 11),
                        ] else ...[
                          Expanded(
                            child: Text(
                              'no_pdf_attached'.tr,
                              style: const TextStyle(
                                color: Colors.white38,
                                fontSize: 9.5,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Icon(Icons.chevron_right, color: Colors.white24, size: 14),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // ---------------- 5. FAQs Accordion Section ----------------
  Widget _buildFaqsSection() {
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
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.question_answer_outlined, color: Colors.white, size: 16),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'driver_faqs_title'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'driver_faqs_sub'.tr,
                      style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Search Box
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorder),
            ),
            child: TextField(
              onChanged: controller.onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 12.5),
              decoration: InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                hintText: 'search_help_topics'.tr,
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 18),
                prefixIconConstraints: const BoxConstraints(minWidth: 26, minHeight: 18),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // FAQs Accordion
          Obx(() {
            final faqs = controller.filteredFaqs;
            final openIdx = controller.openFaqIndex.value;

            if (faqs.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Text(
                    'no_faqs_match'.tr,
                    style: const TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ),
              );
            }

            return Column(
              children: faqs.asMap().entries.map((entry) {
                final idx = entry.key;
                final faq = entry.value;
                final isOpen = openIdx == idx;

                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: isOpen ? kFieldBg : const Color(0xFF13131C),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isOpen ? AppTheme.gradientBlue.withOpacity(0.5) : kBorder,
                    ),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () => controller.toggleFaq(idx),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  faq.question,
                                  style: TextStyle(
                                    color: isOpen ? Colors.white : Colors.white70,
                                    fontSize: 12.5,
                                    fontWeight: isOpen ? FontWeight.bold : FontWeight.w500,
                                  ),
                                ),
                              ),
                              Icon(
                                isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                color: isOpen ? AppTheme.gradientBlue : Colors.white38,
                                size: 18,
                              ),
                            ],
                          ),
                          if (isOpen) ...[
                            const SizedBox(height: 8),
                            const Divider(color: Colors.white12, height: 1),
                            const SizedBox(height: 8),
                            Text(
                              faq.answer,
                              style: const TextStyle(
                                color: Colors.white60,
                                fontSize: 11.5,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          }),
        ],
      ),
    );
  }

  // ---------------- 6. Recent Support Tickets Preview ----------------
  Widget _buildRecentTicketsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'my_support_tickets'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
            GestureDetector(
              onTap: controller.openSupportHistory,
              child: Text(
                'view_all'.tr,
                style: const TextStyle(
                  color: AppTheme.gradientBlue,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Obx(() {
          if (controller.isLoadingTickets.value) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: CircularProgressIndicator(color: AppTheme.gradientBlue),
              ),
            );
          }

          final tickets = controller.recentTickets;
          if (tickets.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kBorder),
              ),
              child: Center(
                child: Column(
                  children: [
                    const Icon(Icons.confirmation_number_outlined, color: Colors.white24, size: 36),
                    const SizedBox(height: 8),
                    Text(
                      'no_support_tickets_yet'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: tickets.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final ticket = tickets[index];
              return GestureDetector(
                onTap: () => controller.openTicketDetails(ticket),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: ticket.statusColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.confirmation_number_outlined, color: ticket.statusColor, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  ticket.code,
                                  style: const TextStyle(
                                    color: AppTheme.gradientBlue,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 6),

                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: ticket.statusColor.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    ticket.status.toUpperCase(),
                                    style: TextStyle(
                                      color: ticket.statusColor,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                ticket.category,
                                style: const TextStyle(color: Colors.white70, fontSize: 9.5),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              ticket.subject,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (ticket.createdAt != null) ...[
                              const SizedBox(height: 2),
                              Text(
                                ticket.createdAt!,
                                style: const TextStyle(color: Colors.white38, fontSize: 10),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.chevron_right, color: Colors.white38, size: 18),
                    ],
                  ),
                ),
              );
            },
          );
        }),
      ],
    );
  }
}
