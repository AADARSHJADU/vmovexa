import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../controllers/help_support_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class HelpSupportView extends GetView<HelpSupportController> {
  const HelpSupportView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<HelpSupportController>()
        ? Get.find<HelpSupportController>()
        : Get.put(HelpSupportController());

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  Expanded(
                    child: Center(
                      child: Text(
                        'Help & Support',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                    onPressed: c.loadHelpContent,
                    tooltip: 'Refresh Content',
                  ),
                ],
              ),
            ),

            Expanded(
              child: RefreshIndicator(
                onRefresh: c.loadHelpContent,
                color: const Color(0xFF6366F1),
                backgroundColor: const Color(0xFF1E293B),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Help Banner Card (from API / role defaults)
                      _buildHelpBannerCard(c),
                      const SizedBox(height: 20),

                      // Search Bar for FAQs & Guides
                      _buildSearchBar(c),
                      const SizedBox(height: 20),

                      // User Guides Section
                      const Text('User Guides & SOPs', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      _buildGuidesPanel(c),
                      const SizedBox(height: 24),

                      // Frequently Asked Questions Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Frequently Asked Questions', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                          Obx(
                            () => Text(
                              '${c.filteredFaqs.length} FAQs',
                              style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      _buildFaqsPanel(c),
                      const SizedBox(height: 24),

                      // Contact Support Section
                      const Text('Contact Support Channels', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      _buildContactSupportPanel(c),
                      const SizedBox(height: 24),

                      // Support History Section
                      const Text('Your Support History', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      _buildSupportHistoryPanel(c),
                      const SizedBox(height: 24),

                      // Commitment Footer card
                      _buildCommitmentCard(),
                      const SizedBox(height: 24),
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

  Widget _buildHelpBannerCard(HelpSupportController c) {
    return Obx(
      () => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SvgPicture.asset("assets/icons/fleet_operator_icons/helpSupportA.svg", width: 40, height: 40),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.bannerTitle.value,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    c.bannerDescription.value,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 10, height: 1.3),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0x1F3B82F6),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: const Color(0x4D3B82F6),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFF3B82F6),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            c.supportHours.value,
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar(HelpSupportController c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: TextField(
        onChanged: (val) => c.searchQuery.value = val,
        style: const TextStyle(color: Colors.white, fontSize: 12),
        decoration: InputDecoration(
          icon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
          hintText: 'Search FAQs, guide topics or dispatch rules...',
          hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
          suffixIcon: Obx(
            () => c.searchQuery.value.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear_rounded, color: Colors.white54, size: 16),
                    onPressed: () => c.searchQuery.value = '',
                  )
                : const SizedBox.shrink(),
          ),
        ),
      ),
    );
  }

  Widget _buildGuidesPanel(HelpSupportController c) {
    return Obx(
      () => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: c.guides.map((guide) {
            final isLast = c.guides.last == guide;
            return Column(
              children: [
                _buildItemRow(
                  guide.title,
                  guide.desc,
                  "assets/icons/fleet_operator_icons/userGuidesA.svg",
                  () => c.openGuide(guide),
                ),
                if (!isLast) const Divider(color: AppColors.cardBorder, height: 16),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildFaqsPanel(HelpSupportController c) {
    return Obx(() {
      final faqList = c.filteredFaqs;
      if (faqList.isEmpty) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: const Center(
            child: Text(
              'No FAQs match your search query.',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
          ),
        );
      }

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: faqList.asMap().entries.map((entry) {
            final idx = entry.key;
            final item = entry.value;
            final isExpanded = c.expandedFaqIndex.value == idx;
            final isLast = idx == faqList.length - 1;

            return Column(
              children: [
                InkWell(
                  onTap: () => c.toggleFaq(idx),
                  borderRadius: BorderRadius.circular(10),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.help_outline_rounded, color: Color(0xFF60A5FA), size: 16),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                item.question,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  height: 1.3,
                                ),
                              ),
                            ),
                            Icon(
                              isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                              color: AppColors.textMuted,
                              size: 18,
                            ),
                          ],
                        ),
                        if (isExpanded) ...[
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.only(left: 26, right: 6),
                            child: Text(
                              item.answer,
                              style: const TextStyle(
                                color: Color(0xFFCBD5E1),
                                fontSize: 11,
                                height: 1.45,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                if (!isLast) const Divider(color: AppColors.cardBorder, height: 16),
              ],
            );
          }).toList(),
        ),
      );
    });
  }

  Widget _buildContactSupportPanel(HelpSupportController c) {
    return Obx(
      () => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            _buildItemRow('Email Support Desk', c.supportEmail.value, "assets/icons/fleet_operator_icons/emailA.svg", c.openEmail),
            const Divider(color: AppColors.cardBorder, height: 16),
            _buildItemRow('24/7 Phone Hotline', c.supportPhone.value, "assets/icons/fleet_operator_icons/mobileNumberA.svg", c.openCall),
            const Divider(color: AppColors.cardBorder, height: 16),
            _buildItemRow('WhatsApp Support Desk', c.supportPhone.value, "assets/icons/fleet_operator_icons/whatsappA.svg", c.openWhatsapp),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportHistoryPanel(HelpSupportController c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: _buildItemRow('Your Support History', 'View your previous support requests and tickets', "assets/icons/fleet_operator_icons/supportHistoryA.svg", c.goToSupportHistory),
    );
  }

  Widget _buildCommitmentCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          SvgPicture.asset("assets/icons/fleet_operator_icons/securityA.svg"),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Your satisfaction is our priority.',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 4),
                Text(
                  'We are committed to providing you the best support experience across your fleet operations.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemRow(String label, String subtitle, String icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        color: Colors.transparent,
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            SvgPicture.asset(icon, width: 22, height: 22),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 3),
                  Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
          ],
        ),
      ),
    );
  }
}
