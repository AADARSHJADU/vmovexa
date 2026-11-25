import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/finance_help_support_controller.dart';

class FinanceHelpSupportView extends StatefulWidget {
  const FinanceHelpSupportView({super.key});

  @override
  State<FinanceHelpSupportView> createState() => _FinanceHelpSupportViewState();
}

class _FinanceHelpSupportViewState extends State<FinanceHelpSupportView> {
  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kBorder = Color(0xFF262638);
  static const Color kMuted = Color(0xFF94A3B8);

  final GlobalKey _guidesSectionKey = GlobalKey();
  final GlobalKey _faqsSectionKey = GlobalKey();

  void _scrollTo(GlobalKey key) {
    final context = key.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<FinanceHelpSupportController>()
        ? Get.find<FinanceHelpSupportController>()
        : Get.put(FinanceHelpSupportController());

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context, controller),
            _buildTopTabs(controller),
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.allFaqs.isEmpty) {
                  return const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF818CF8)),
                    ),
                  );
                }

                return RefreshIndicator(
                  color: const Color(0xFF818CF8),
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: controller.activeTabIndex.value == 0
                      ? _buildHelpAndGuidesTab(context, controller)
                      : _buildTicketHistoryTab(context, controller),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // 1. Header with Breadcrumbs and Action Buttons
  Widget _buildHeader(BuildContext context, FinanceHelpSupportController controller) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                        const Text(
                          '  /  ',
                          style: TextStyle(color: kMuted, fontSize: 11),
                        ),
                        Text(
                          'finance_help.help_breadcrumb'.tr,
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
                      'finance_help.title'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'finance_help.summary'.tr,
            style: const TextStyle(color: Colors.white60, fontSize: 11, height: 1.3),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: controller.goToRaiseTicket,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF818CF8).withValues(alpha: 0.25),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add_circle_outline, color: Colors.white, size: 15),
                        const SizedBox(width: 6),
                        Text(
                          'finance_help.raise_ticket'.tr,
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
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: () => controller.activeTabIndex.value = 1,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: kBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: kBorder),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.confirmation_number_outlined, color: kMuted, size: 15),
                        const SizedBox(width: 6),
                        Text(
                          'finance_help.ticket_history'.tr,
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
            ],
          ),
        ],
      ),
    );
  }

  // 2. Top Tabs (FAQs & Guides vs My Tickets) with primaryGradient
  Widget _buildTopTabs(FinanceHelpSupportController controller) {
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
                      '${'finance_help.faqs'.tr} & ${'finance_help.user_guides'.tr}',
                      style: TextStyle(
                        color: controller.activeTabIndex.value == 0 ? Colors.white : kMuted,
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
                          'finance_help.ticket_history'.tr,
                          style: TextStyle(
                            color: controller.activeTabIndex.value == 1 ? Colors.white : kMuted,
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

  // 3. Tab 1: FAQs & Runbooks / Guides
  Widget _buildHelpAndGuidesTab(BuildContext context, FinanceHelpSupportController controller) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Corporate Financial Desk Hero Banner Box
          _buildHeroBanner(context, controller),
          const SizedBox(height: 16),

          // 2. 3 Quick Help Tiles Grid
          _buildQuickHelpTiles(context, controller),
          const SizedBox(height: 20),

          // 3. Standard Operating Procedures & Guides (4 cards)
          Container(key: _guidesSectionKey),
          _buildGuidesSection(context, controller),
          const SizedBox(height: 24),

          // 4. Frequently Asked Questions (FAQs) Accordion & Search
          Container(key: _faqsSectionKey),
          _buildFaqsSection(context, controller),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  // Top Hero Banner Box (Corporate Financial Desk Hotline Banner)
  Widget _buildHeroBanner(BuildContext context, FinanceHelpSupportController controller) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF818CF8).withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF818CF8).withValues(alpha: 0.08),
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
                      color: const Color(0xFF818CF8).withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(Icons.headset_mic_rounded, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF818CF8).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: const Color(0xFF818CF8).withValues(alpha: 0.3),
                          width: 0.8,
                        ),
                      ),
                      child: Text(
                        controller.bannerBadge.value.tr,
                        style: const TextStyle(
                          color: Color(0xFF818CF8),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      controller.bannerTitle.value.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      controller.bannerDesc.value.tr,
                      style: const TextStyle(
                        color: Color(0xFFCBD5E1),
                        fontSize: 11,
                        height: 1.35,
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
  }

  // 3 Quick Help Tiles Grid
  Widget _buildQuickHelpTiles(BuildContext context, FinanceHelpSupportController controller) {
    final tiles = [
      {
        'title': 'finance_help.faqs'.tr,
        'sub': 'finance_help.faqs_sub'.tr,
        'icon': Icons.help_outline_rounded,
        'onTap': () => _scrollTo(_faqsSectionKey),
      },
      {
        'title': 'finance_help.user_guides'.tr,
        'sub': 'finance_help.user_guides_sub'.tr,
        'icon': Icons.menu_book_outlined,
        'onTap': () => _scrollTo(_guidesSectionKey),
      },
      {
        'title': 'finance_help.video_tutorials'.tr,
        'sub': 'finance_help.video_tutorials_sub'.tr,
        'icon': Icons.play_circle_outline_rounded,
        'onTap': () => _openVideoTutorialsModal(context),
      },
    ];

    return Row(
      children: tiles.map((t) {
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: GestureDetector(
              onTap: t['onTap'] as VoidCallback,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kBorder),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFF818CF8).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        t['icon'] as IconData,
                        color: const Color(0xFF818CF8),
                        size: 20,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      t['title'] as String,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      t['sub'] as String,
                      style: const TextStyle(
                        color: kMuted,
                        fontSize: 9.5,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // Standard Operating Procedures & Guides (4 cards)
  Widget _buildGuidesSection(BuildContext context, FinanceHelpSupportController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'finance_help.sops_and_guides'.tr.toUpperCase(),
              style: const TextStyle(
                color: kMuted,
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            Obx(
              () => Text(
                '${controller.guides.length} SOPs',
                style: const TextStyle(
                  color: Color(0xFF818CF8),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Obx(
          () => Column(
            children: controller.guides.map((guide) {
              IconData guideIcon = Icons.description_outlined;
              if (guide.icon == 'Clock') {
                guideIcon = Icons.schedule_rounded;
              } else if (guide.icon == 'Shield') {
                guideIcon = Icons.shield_outlined;
              } else if (guide.icon == 'Car') {
                guideIcon = Icons.receipt_long_outlined;
              }

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kBorder),
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () => controller.openGuide(guide),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF818CF8).withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(guideIcon, color: const Color(0xFF818CF8), size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            guide.title,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        if (guide.hasPdf) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                              borderRadius: BorderRadius.circular(4),
                                              border: Border.all(
                                                color: const Color(0xFF10B981).withValues(alpha: 0.3),
                                                width: 0.8,
                                              ),
                                            ),
                                            child: Text(
                                              'finance_help.pdf_badge'.tr,
                                              style: const TextStyle(
                                                color: Color(0xFF10B981),
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      guide.desc,
                                      style: const TextStyle(
                                        color: kMuted,
                                        fontSize: 11,
                                        height: 1.3,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          const Divider(color: kBorder, height: 1),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    guide.hasPdf ? Icons.download_rounded : Icons.info_outline_rounded,
                                    color: guide.hasPdf ? const Color(0xFF818CF8) : kMuted,
                                    size: 14,
                                  ),
                                  const SizedBox(width: 5),
                                  Text(
                                    guide.hasPdf
                                        ? 'finance_help.download_read_sop'.tr
                                        : 'finance_help.no_pdf_attached'.tr,
                                    style: TextStyle(
                                      color: guide.hasPdf ? const Color(0xFF818CF8) : kMuted,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              Icon(
                                Icons.chevron_right_rounded,
                                color: guide.hasPdf ? const Color(0xFF818CF8) : kMuted,
                                size: 16,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  // Support FAQs Accordion with Live Search
  Widget _buildFaqsSection(BuildContext context, FinanceHelpSupportController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'finance_help.faqs_title'.tr,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          'finance_help.faqs_subtitle'.tr,
          style: const TextStyle(color: kMuted, fontSize: 11),
        ),
        const SizedBox(height: 12),

        // Search Bar
        Container(
          height: 42,
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: kBorder),
          ),
          child: TextField(
            onChanged: controller.onSearchChanged,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'finance_help.faqs_search_ph'.tr,
              hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
              prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B), size: 16),
              suffixIcon: Obx(
                () => controller.searchQuery.value.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white54, size: 16),
                        onPressed: () => controller.onSearchChanged(''),
                      )
                    : const SizedBox.shrink(),
              ),
              border: InputBorder.none,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 11),
            ),
          ),
        ),
        const SizedBox(height: 14),

        // FAQ Accordion List
        Obx(() {
          final faqs = controller.filteredFaqs;
          if (faqs.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kBorder),
              ),
              child: Center(
                child: Text(
                  'finance_help.no_faqs_found'.tr,
                  style: const TextStyle(color: kMuted, fontSize: 12),
                ),
              ),
            );
          }

          return Column(
            children: List.generate(faqs.length, (index) {
              final faq = faqs[index];
              final isExpanded = controller.expandedFaqIndex.value == index;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isExpanded ? const Color(0xFF818CF8).withValues(alpha: 0.5) : kBorder,
                  ),
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
                                color: const Color(0xFF818CF8).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.help_outline_rounded, color: Color(0xFF818CF8), size: 16),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                faq.question,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            Icon(
                              isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                              color: kMuted,
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
                            fontSize: 11.5,
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
      ],
    );
  }

  // 4. Tab 2: My Tickets History with 4 Filter Tabs matching Admin Panel
  Widget _buildTicketHistoryTab(BuildContext context, FinanceHelpSupportController controller) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      children: [
        // Header Row: Title & Raise Ticket Button
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'finance_help.history_title'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'support_history_desc'.tr,
                    style: const TextStyle(color: kMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: controller.goToRaiseTicket,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF818CF8).withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add_rounded, color: Colors.white, size: 15),
                    const SizedBox(width: 4),
                    Text(
                      'finance_help.raise_ticket'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Search Box for Tickets
        Container(
          height: 40,
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: kBorder),
          ),
          child: TextField(
            controller: controller.historySearchController,
            onChanged: controller.setHistorySearch,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Search tickets by code, subject, or category...',
              hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
              prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B), size: 16),
              suffixIcon: Obx(
                () => controller.historySearchQuery.value.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white54, size: 15),
                        onPressed: controller.clearHistorySearch,
                      )
                    : const SizedBox.shrink(),
              ),
              border: InputBorder.none,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // 4 Status Filter Tabs matching Admin Panel: All, Open, Resolved, Closed
        Obx(() {
          final tabs = controller.historyFilterTabs;
          final activeTab = controller.activeHistoryTab.value;

          return Row(
            children: tabs.map((tab) {
              final isSelected = activeTab == tab['id'];
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.5),
                  child: GestureDetector(
                    onTap: () => controller.setHistoryTab(tab['id'] as String),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        gradient: isSelected ? AppTheme.primaryGradient : null,
                        color: isSelected ? null : kCardBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? Colors.transparent : kBorder,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              tab['label'] as String,
                              style: TextStyle(
                                color: isSelected ? Colors.white : kMuted,
                                fontSize: 11,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? Colors.white.withValues(alpha: 0.25)
                                  : const Color(0xFF262638),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${tab['count']}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 14),

        // Filtered Tickets List
        Obx(() {
          final tickets = controller.filteredHistoryTickets;

          if (tickets.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: kBorder),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: kBg,
                      shape: BoxShape.circle,
                      border: Border.all(color: kBorder),
                    ),
                    child: const Icon(
                      Icons.confirmation_number_outlined,
                      color: kMuted,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'finance_help.no_tickets'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'finance_help.no_tickets_desc'.tr,
                    style: const TextStyle(color: kMuted, fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: controller.goToRaiseTicket,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'finance_help.raise_ticket'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: tickets.map((t) {
              Color statusColor = const Color(0xFF3B82F6);
              String statusText = 'ticket_status_open'.tr;

              if (t.status.toLowerCase() == 'in_progress') {
                statusColor = const Color(0xFFF59E0B);
                statusText = 'ticket_status_in_progress'.tr;
              } else if (t.status.toLowerCase() == 'resolved') {
                statusColor = const Color(0xFF10B981);
                statusText = 'ticket_status_resolved'.tr;
              } else if (t.status.toLowerCase() == 'closed') {
                statusColor = kMuted;
                statusText = 'ticket_status_closed'.tr;
              }

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
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
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF818CF8).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            t.id,
                            style: const TextStyle(
                              color: Color(0xFF818CF8),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: statusColor.withValues(alpha: 0.4), width: 0.8),
                          ),
                          child: Text(
                            statusText,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      t.subject,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          controller.getCategoryLabel(t.category),
                          style: const TextStyle(color: kMuted, fontSize: 10.5),
                        ),
                        Text(
                          t.date,
                          style: const TextStyle(color: kMuted, fontSize: 10.5),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
          );
        }),
      ],
    );
  }

  // Video Tutorials Information Modal
  void _openVideoTutorialsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(top: BorderSide(color: kBorder)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: kBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF818CF8).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.play_circle_outline_rounded,
                  color: Color(0xFF818CF8),
                  size: 32,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'finance_help.video_tutorials_modal_title'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'finance_help.video_tutorials_modal_desc'.tr,
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5, height: 1.4),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: GestureDetector(
                  onTap: () => Navigator.pop(ctx),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(
                        'finance_help.close'.tr,
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
        );
      },
    );
  }
}
