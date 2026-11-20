import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../routes/app_routes.dart';
import '../controllers/advertiser_help_support_controller.dart';

class AdvertiserHelpSupportView extends StatefulWidget {
  const AdvertiserHelpSupportView({super.key});

  @override
  State<AdvertiserHelpSupportView> createState() => _AdvertiserHelpSupportViewState();
}

class _AdvertiserHelpSupportViewState extends State<AdvertiserHelpSupportView> {
  final AdvertiserHelpSupportController controller = Get.isRegistered<AdvertiserHelpSupportController>()
      ? Get.find<AdvertiserHelpSupportController>()
      : Get.put(AdvertiserHelpSupportController());

  final ScrollController _scrollController = ScrollController();
  final GlobalKey _guidesKey = GlobalKey();
  final GlobalKey _faqsKey = GlobalKey();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToKey(GlobalKey key) {
    final ctx = key.currentContext;
    if (ctx != null) {
      Scrollable.ensureVisible(
        ctx,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(context),

            // Main Scrollable Area
            Expanded(
              child: RefreshIndicator(
                onRefresh: controller.loadHelpContent,
                color: const Color(0xFF3B82F6),
                backgroundColor: const Color(0xFF1E293B),
                child: SingleChildScrollView(
                  controller: _scrollController,
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Action Buttons: Raise Support Ticket & View Ticket History
                      _buildTopActionButtons(context),
                      const SizedBox(height: 16),

                      // Blue Design Hero Banner ("Advertiser Growth Desk")
                      _buildHeroContactBanner(context),
                      const SizedBox(height: 18),

                      // 3 Quick Help Boxes: FAQs, User Guides, Video Tutorials
                      _buildQuickHelpBoxes(context),
                      const SizedBox(height: 24),

                      // Standard Operating Procedures & Guides Section
                      Container(
                        key: _guidesKey,
                        child: _buildSopAndGuidesSection(context),
                      ),
                      const SizedBox(height: 24),

                      // Frequently Asked Questions (FAQs) Section
                      Container(
                        key: _faqsKey,
                        child: _buildFaqsSection(context),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Top App Bar with back button, page title, subtitle, and refresh button
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
                  'help_support'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'campaign_guides_sub'.tr,
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
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
            onPressed: controller.loadHelpContent,
            tooltip: 'refresh_content'.tr,
          ),
        ],
      ),
    );
  }

  /// Top Action Buttons: Raise Support Ticket (gradient) & View Ticket History (bordered)
  Widget _buildTopActionButtons(BuildContext context) {
    return Row(
      children: [
        // Raise Support Ticket Button with primaryGradient
        Expanded(
          flex: 6,
          child: Container(
            height: 42,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => Get.toNamed(Routes.ADVERTISER_RAISE_TICKET),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.add_circle_outline_rounded, color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          'raise_support_ticket'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11.5,
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
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),

        // View Ticket History Button
        Expanded(
          flex: 5,
          child: Container(
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF3B82F6), width: 1.2),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => Get.toNamed(Routes.ADVERTISER_SUPPORT_HISTORY),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.confirmation_number_outlined, color: Color(0xFF60A5FA), size: 15),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          'view_ticket_history'.tr,
                          style: const TextStyle(
                            color: Color(0xFF60A5FA),
                            fontSize: 11.5,
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
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Blue Design Hero Banner ("Advertiser Growth Desk")
  Widget _buildHeroContactBanner(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2563EB), Color(0xFF4338CA)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2563EB).withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Badges Row: Growth Desk Badge & 4-Hour SLA Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF93C5FD),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Obx(
                      () => Text(
                        controller.deskBadge.value.isNotEmpty
                            ? controller.deskBadge.value
                            : 'advertiser_growth_desk'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.5)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.bolt_rounded, color: Color(0xFFFBBF24), size: 13),
                    const SizedBox(width: 3),
                    Text(
                      'four_hour_sla_badge'.tr,
                      style: const TextStyle(
                        color: Color(0xFFFEF3C7),
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Center: Phone & Email with Frosted Headset/Agent Icon
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                ),
                child: const Icon(Icons.support_agent_rounded, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Obx(
                      () => Text(
                        controller.contactPhone.value.isNotEmpty
                            ? controller.contactPhone.value
                            : '+91 98765 43210',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Obx(
                      () => Text(
                        controller.contactEmail.value.isNotEmpty
                            ? controller.contactEmail.value
                            : 'support@vmovexa.com',
                        style: const TextStyle(
                          color: Color(0xFFDBEAFE),
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Description
          Obx(
            () => Text(
              controller.deskDesc.value.isNotEmpty
                  ? controller.deskDesc.value
                  : 'four_hour_sla_desk_desc'.tr,
              style: const TextStyle(
                color: Color(0xFFE0E7FF),
                fontSize: 11,
                height: 1.35,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Divider
          Container(
            height: 1,
            color: Colors.white.withValues(alpha: 0.2),
          ),
          const SizedBox(height: 12),

          // Banner Actions: Call Desk & Email Desk
          Row(
            children: [
              Expanded(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: controller.callGrowthDesk,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.phone_rounded, color: Colors.white, size: 14),
                          const SizedBox(width: 6),
                          Text(
                            'call_desk_btn'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: controller.emailGrowthDesk,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.email_outlined, color: Colors.white, size: 14),
                          const SizedBox(width: 6),
                          Text(
                            'email_desk_btn'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
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

  /// 3 Quick Help Boxes: FAQs, User Guides, Video Tutorials
  Widget _buildQuickHelpBoxes(BuildContext context) {
    return Row(
      children: [
        // 1. FAQs Tile
        Expanded(
          child: _buildQuickTile(
            icon: Icons.help_outline_rounded,
            iconColor: const Color(0xFF60A5FA),
            iconBg: const Color(0xFF1E293B),
            title: 'common_faqs'.tr,
            subtitle: 'faqs_sub'.tr,
            onTap: () => _scrollToKey(_faqsKey),
          ),
        ),
        const SizedBox(width: 8),

        // 2. User Guides Tile
        Expanded(
          child: _buildQuickTile(
            icon: Icons.menu_book_rounded,
            iconColor: const Color(0xFF34D399),
            iconBg: const Color(0xFF1E293B),
            title: 'user_guides'.tr,
            subtitle: 'user_guides_sub'.tr,
            onTap: () => _scrollToKey(_guidesKey),
          ),
        ),
        const SizedBox(width: 8),

        // 3. Video Tutorials Tile
        Expanded(
          child: _buildQuickTile(
            icon: Icons.play_circle_outline_rounded,
            iconColor: const Color(0xFFA78BFA),
            iconBg: const Color(0xFF1E293B),
            title: 'video_tutorials'.tr,
            subtitle: 'video_tutorials_sub'.tr,
            onTap: () => _showVideoTutorialsModal(context),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickTile({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      height: 98,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: iconColor.withValues(alpha: 0.3)),
                  ),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
                const SizedBox(height: 6),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 9,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Standard Operating Procedures & Guides Section
  Widget _buildSopAndGuidesSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'standard_operating_procedures_and_guides'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
            Obx(
              () => Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0x1F3B82F6),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0x4D3B82F6)),
                ),
                child: Text(
                  '${controller.guides.length}',
                  style: const TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        Obx(() {
          final items = controller.guides;
          if (items.isEmpty) {
            return const SizedBox.shrink();
          }

          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.15,
            ),
            itemCount: items.length,
            itemBuilder: (ctx, idx) {
              final guide = items[idx];
              return _buildGuideCard(context, guide);
            },
          );
        }),
      ],
    );
  }

  Widget _buildGuideCard(BuildContext context, AdvertiserHelpGuideItem guide) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => controller.openGuide(guide),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Icon and PDF Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(guide.icon, color: const Color(0xFF60A5FA), size: 18),
                    ),
                    if (guide.hasPdf)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0x1F10B981),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0x4D10B981)),
                        ),
                        child: Text(
                          'pdf'.tr,
                          style: const TextStyle(
                            color: Color(0xFF34D399),
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 6),

                // Title & Description
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      guide.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      guide.desc,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 9.5,
                        height: 1.25,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                const SizedBox(height: 4),

                // Footer: Download / Read SOP or No PDF attached
                Row(
                  children: [
                    if (guide.hasPdf) ...[
                      const Icon(Icons.download_rounded, color: Color(0xFF60A5FA), size: 12),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          'download_read_sop'.tr,
                          style: const TextStyle(
                            color: Color(0xFF60A5FA),
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded, color: Color(0xFF60A5FA), size: 14),
                    ] else ...[
                      Expanded(
                        child: Text(
                          'no_pdf_attached'.tr,
                          style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 9,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Frequently Asked Questions (FAQs) Section
  Widget _buildFaqsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'frequently_asked_questions'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
            Obx(
              () => Text(
                'faqs_count'.trParams({'count': controller.filteredFaqs.length.toString()}),
                style: const TextStyle(
                  color: Color(0xFF60A5FA),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Live Search Bar
        _buildSearchBar(),
        const SizedBox(height: 12),

        // Expandable FAQs List
        _buildFaqsList(),
      ],
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
        style: const TextStyle(color: Colors.white, fontSize: 12.5),
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
          hintText: 'search_help_topics_hint'.tr,
          hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 11.5),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          suffixIcon: Obx(
            () => controller.searchQuery.value.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear_rounded, color: Colors.white54, size: 16),
                    onPressed: () => controller.filterFaqs(''),
                  )
                : const SizedBox.shrink(),
          ),
        ),
      ),
    );
  }

  Widget _buildFaqsList() {
    return Obx(() {
      final items = controller.filteredFaqs;
      if (items.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Text(
            'no_matching_faqs_found'.tr,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (context, index) => const SizedBox(height: 8),
        itemBuilder: (ctx, idx) {
          final faq = items[idx];
          final isExpanded = controller.expandedFaqIndex.value == idx;

          return Container(
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isExpanded ? const Color(0xFF3B82F6).withValues(alpha: 0.6) : AppColors.cardBorder,
                width: 1.2,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: ExpansionTile(
                initiallyExpanded: isExpanded,
                key: Key('faq_${idx}_$isExpanded'),
                tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                onExpansionChanged: (exp) {
                  controller.toggleFaq(exp ? idx : -1);
                },
                leading: Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      'Q',
                      style: TextStyle(
                        color: Color(0xFF60A5FA),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                title: Text(
                  faq.q,
                  style: TextStyle(
                    color: isExpanded ? const Color(0xFF60A5FA) : Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                trailing: Icon(
                  isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                  color: isExpanded ? const Color(0xFF60A5FA) : const Color(0xFF64748B),
                ),
                children: [
                  const Divider(color: Color(0xFF1E293B), height: 1),
                  const SizedBox(height: 10),
                  Text(
                    faq.a,
                    style: const TextStyle(
                      color: Color(0xFFCBD5E1),
                      fontSize: 11.5,
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  /// Video Tutorials Bottom Sheet
  void _showVideoTutorialsModal(BuildContext context) {
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
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFA78BFA).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.play_circle_outline_rounded, color: Color(0xFFA78BFA), size: 18),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'video_tutorials'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              Text(
                'video_tutorials_sub'.tr,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
              ),
              const Divider(color: Color(0xFF1E293B), height: 20),

              Expanded(
                child: Obx(() {
                  final videos = controller.videoTutorials;
                  if (videos.isEmpty) {
                    return const Center(
                      child: Text('No video tutorials available.', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                    );
                  }

                  return ListView.separated(
                    itemCount: videos.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (c, idx) {
                      final item = videos[idx];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Row(
                          children: [
                            // Video Thumbnail Icon
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFF475569)),
                              ),
                              child: const Center(
                                child: Icon(Icons.play_arrow_rounded, color: Color(0xFF60A5FA), size: 28),
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Video Info
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.title,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          item.category,
                                          style: const TextStyle(
                                            color: Color(0xFF93C5FD),
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        item.duration,
                                        style: const TextStyle(
                                          color: Color(0xFF94A3B8),
                                          fontSize: 9.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Watch Button with primaryGradient
                            Container(
                              height: 32,
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  controller.openVideoTutorial(item);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: Text(
                                  'watch_tutorial_btn'.tr,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
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
}
