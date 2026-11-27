import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/tech_help_support_controller.dart';
import '../model/tech_help_support_models.dart';

class TechHelpSupportView extends GetView<TechHelpSupportController> {
  const TechHelpSupportView({super.key});

  static const Color kBg = Color(0xFF0D0F18);
  static const Color kCardBg = Color(0xFF151824);
  static const Color kBorder = Color(0x24FFFFFF);

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
                // 1. Header with back button & titles
                _buildHeader(context),
                const SizedBox(height: 16),

                // 2. Search Field
                _buildSearchBar(),
                const SizedBox(height: 16),

                // // 3. Engineering Escalation NOC Card
                // _buildNocHotlineCard(content.contact),
                // const SizedBox(height: 18),

                // 4. Quick Action Tiles (FAQs, Guides, Video Academy)
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

                // 5. Standard Operating Procedures & Guides (4 Cards)
                Container(key: guidesKey),
                _buildSopGuidesSection(content.guides),
                const SizedBox(height: 20),

                // 6. Recent Tickets Section
                _buildRecentTicketsSection(),
                const SizedBox(height: 20),

                // 7. Frequently Asked Questions (FAQs) Accordion with Live Search
                Container(key: faqsKey),
                _buildFaqsSection(),
                const SizedBox(height: 30),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- 1. Header ----------------
  Widget _buildHeader(BuildContext context) {
    return Row(
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
                'technician_field_help'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                'technician_field_help_sub'.tr,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- 2. Search Bar ----------------
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: TextField(
        onChanged: controller.onSearchChanged,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          hintText: 'search_tech_faqs'.tr,
          hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
          prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 20),
          suffixIcon: Obx(() {
            if (controller.searchQuery.value.isNotEmpty) {
              return IconButton(
                icon: const Icon(Icons.close, color: Colors.white38, size: 18),
                onPressed: () => controller.onSearchChanged(''),
              );
            }
            return const SizedBox.shrink();
          }),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      ),
    );
  }

  // ---------------- 3. Engineering Escalation NOC Card ----------------
  Widget _buildNocHotlineCard(TechContactInfo contact) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF131B2E),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF3F7BF5).withOpacity(0.35)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF3F7BF5).withOpacity(0.12),
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
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.gradientBlue.withOpacity(0.4),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(Icons.build_circle_outlined, color: Colors.white, size: 24),
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
                        color: AppTheme.gradientBlue.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.gradientBlue.withOpacity(0.4)),
                      ),
                      child: Text(
                        contact.badge,
                        style: const TextStyle(
                          color: AppTheme.gradientBlue,
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      contact.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      contact.description,
                      style: const TextStyle(
                        color: Colors.white60,
                        fontSize: 11,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Action Buttons: Contact NOC button with AppTheme.primaryGradient
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: controller.contactEngineeringNOC,
                  child: Container(
                    height: 42,
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
                          const Icon(Icons.support_agent_rounded, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
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
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- 4. Quick Action Tiles ----------------
  Widget _buildQuickActionTiles({
    required VoidCallback onFaqsTap,
    required VoidCallback onGuidesTap,
    required VoidCallback onVideosTap,
    required int videoCount,
  }) {
    final tiles = [
      {
        'title': 'hardware_faqs'.tr,
        'subtitle': 'faqs_sub'.tr,
        'icon': Icons.help_outline_rounded,
        'color': AppTheme.gradientBlue,
        'onTap': onFaqsTap,
      },
      {
        'title': 'sop_and_guides'.tr,
        'subtitle': 'guides_sub'.tr,
        'icon': Icons.menu_book_outlined,
        'color': AppTheme.gradientPink,
        'onTap': onGuidesTap,
      },
      {
        'title': 'video_academy'.tr,
        'subtitle': '$videoCount ${'tutorials_count_label'.tr}',
        'icon': Icons.play_circle_outline_rounded,
        'color': const Color(0xFF2ECC71),
        'onTap': onVideosTap,
      },
    ];

    return Row(
      children: tiles.map((item) {
        final Color col = item['color'] as Color;
        return Expanded(
          child: GestureDetector(
            onTap: item['onTap'] as VoidCallback,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: col.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(item['icon'] as IconData, color: col, size: 18),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item['title'] as String,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item['subtitle'] as String,
                    style: const TextStyle(color: Colors.white38, fontSize: 9.5),
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

  // ---------------- 5. Standard Operating Procedures & Guides (4 Cards) ----------------

  Widget _buildSopGuidesSection(List<TechGuideItem> guides) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'sop_and_guides'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        Text(
          'tech_sop_guides_sub'.tr,
          style: const TextStyle(
            color: Colors.white38,
            fontSize: 11,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
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
                    // Icon and PDF badge
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: guide.iconColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            guide.iconData,
                            color: guide.iconColor,
                            size: 18,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2ECC71).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(
                              color: const Color(0xFF2ECC71).withOpacity(0.3),
                            ),
                          ),
                          child: const Text(
                            'PDF',
                            style: TextStyle(
                              color: Color(0xFF2ECC71),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Guide title
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

                    // Guide description
                    Text(
                      guide.desc,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 6),

                    // Download action
                    Row(
                      children: [
                        const Icon(
                          Icons.download_rounded,
                          color: Color(0xFF60A5FA),
                          size: 12,
                        ),
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
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.open_in_new_rounded,
                          color: Color(0xFF60A5FA),
                          size: 11,
                        ),
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


  // ---------------- 6. Recent Tickets Section ----------------
  Widget _buildRecentTicketsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'recent_tickets'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: controller.openSupportHistory,
              child: Text(
                'view_all'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppTheme.gradientBlue,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Quick action row: Raise Support Ticket + View Ticket History


        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: controller.openRaiseTicketModal,
                child: Container(
                  height: 40,
                  padding: const EdgeInsets.symmetric(horizontal: 6),
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
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.add_circle_outline_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          'raise_support_ticket'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(width: 8),

            Expanded(
              child: GestureDetector(
                onTap: controller.openSupportHistory,
                child: Container(
                  height: 40,
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.history_outlined,
                        color: Colors.white70,
                        size: 16,
                      ),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          'ticket_history'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 12),

        // Ticket List or Empty Box
        Obx(() {
          if (controller.isLoadingTickets.value) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: CircularProgressIndicator(color: AppTheme.gradientBlue),
              ),
            );
          }

          if (controller.recentTickets.isEmpty) {
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
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
                      'no_recent_tickets'.tr,
                      style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'no_recent_tickets_sub'.tr,
                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.recentTickets.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final ticket = controller.recentTickets[index];
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
                        width: 8,
                        height: 38,
                        decoration: BoxDecoration(
                          color: ticket.statusColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    ticket.code,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: AppTheme.gradientBlue,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: ticket.statusColor.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: ticket.statusColor.withOpacity(0.4)),
                                  ),
                                  child: Text(
                                    ticket.status.toUpperCase(),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: ticket.statusColor,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              ticket.subject,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12.5,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              ticket.category,
                              style: const TextStyle(color: Colors.white38, fontSize: 10),
                            ),
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

  // ---------------- 7. FAQs Accordion Section ----------------
  Widget _buildFaqsSection() {
    return Column(
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
            const SizedBox(width: 8),
            Text(
              'frequently_asked_questions'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'faqs_sub_detail'.tr,
          style: const TextStyle(color: Colors.white38, fontSize: 11),
        ),
        const SizedBox(height: 12),

        Obx(() {
          final faqs = controller.filteredFaqs;
          if (faqs.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kBorder),
              ),
              child: Center(
                child: Text(
                  'no_faqs_found'.tr,
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
              ),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: faqs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final faq = faqs[index];
              return Obx(() {
                final isOpen = controller.openFaqIndex.value == index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isOpen ? const Color(0xFF1B1E2D) : kCardBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isOpen ? AppTheme.gradientBlue.withOpacity(0.5) : kBorder,
                    ),
                  ),
                  child: InkWell(
                    onTap: () => controller.toggleFaq(index),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                faq.question,
                                style: TextStyle(
                                  color: isOpen ? Colors.white : Colors.white70,
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(
                              isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                              color: isOpen ? AppTheme.gradientBlue : Colors.white38,
                              size: 18,
                            ),
                          ],
                        ),
                        if (isOpen) ...[
                          const SizedBox(height: 8),
                          Divider(color: Colors.white.withOpacity(0.06), height: 1),
                          const SizedBox(height: 8),
                          Text(
                            faq.answer,
                            style: const TextStyle(
                              color: Colors.white60,
                              fontSize: 11.5,
                              height: 1.45,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              });
            },
          );
        }),
      ],
    );
  }
}
