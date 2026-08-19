import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/help_support/controller/driver_help_support_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/help_support/model/help_support_models.dart';

class DriverHelpSupportView extends GetView<DriverHelpSupportController> {
  const DriverHelpSupportView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.quickHelpItems.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildSearchBar(),
                      const SizedBox(height: 20),
                      _buildSectionTitle('Quick Help'),
                      const SizedBox(height: 10),
                      _buildQuickHelpGrid(),
                      const SizedBox(height: 20),
                      _buildSectionTitle('Contact Support'),
                      const SizedBox(height: 10),
                      _buildContactChannelsRow(),
                      const SizedBox(height: 20),
                      _buildSectionHeaderWithViewAll('My Support Tickets', controller.onViewAllTickets),
                      const SizedBox(height: 10),
                      _buildTicketsList(),
                      const SizedBox(height: 20),
                      _buildSectionHeaderWithViewAll('Popular Articles', controller.onViewAllArticles),
                      const SizedBox(height: 10),
                      _buildArticlesList(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onBackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Text('Help & Support', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
        ),
        GestureDetector(
          onTap: controller.onHeadsetTap,
          child: const Icon(Icons.headset_mic_outlined, color: kPurple, size: 22),
        ),
      ],
    );
  }

  // ---------------- Search bar ----------------
  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: TextField(
        onChanged: controller.onSearchChanged,
        onSubmitted: (_) => controller.onSearchSubmit(),
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: const InputDecoration(
          border: InputBorder.none,
          isDense: true,
          contentPadding: EdgeInsets.symmetric(vertical: 14),
          hintText: 'Search for help articles, FAQs...',
          hintStyle: TextStyle(color: Colors.white38, fontSize: 12.5),
          prefixIcon: Icon(Icons.search, color: Colors.white38, size: 20),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700));
  }

  Widget _buildSectionHeaderWithViewAll(String title, VoidCallback onViewAll) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildSectionTitle(title),
        GestureDetector(
          onTap: onViewAll,
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('View All', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
              Icon(Icons.chevron_right, color: kPurple, size: 15),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Quick Help 2x2 grid ----------------
  Widget _buildQuickHelpGrid() {
    return Obx(
      () => GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.quickHelpItems.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.22,
        ),
        itemBuilder: (context, index) {
          final item = controller.quickHelpItems[index];
          return _QuickHelpCard(item: item, onTap: () => controller.onQuickHelpTap(item));
        },
      ),
    );
  }

  // ---------------- Contact Support 3-card row ----------------
  Widget _buildContactChannelsRow() {
    return Obx(
      () => Row(
        children: controller.contactChannels
            .map(
              (channel) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: _ContactChannelCard(
                    channel: channel,
                    onTap: () => controller.onContactChannelTap(channel),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  // ---------------- Tickets list ----------------
  Widget _buildTicketsList() {
    return Obx(
      () => Column(
        children: controller.supportTickets
            .map(
              (ticket) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _TicketCard(ticket: ticket, onTap: () => controller.onTicketTap(ticket)),
              ),
            )
            .toList(),
      ),
    );
  }

  // ---------------- Articles list ----------------
  Widget _buildArticlesList() {
    return Obx(
      () => Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          children: List.generate(controller.popularArticles.length, (index) {
            final article = controller.popularArticles[index];
            final isLast = index == controller.popularArticles.length - 1;
            return Column(
              children: [
                _ArticleRow(article: article, onTap: () => controller.onArticleTap(article)),
                if (!isLast) Divider(color: Colors.white.withOpacity(0.06), height: 1, indent: 14, endIndent: 14),
              ],
            );
          }),
        ),
      ),
    );
  }
}

// =====================================================================
// Quick help card
// =====================================================================
class _QuickHelpCard extends StatelessWidget {
  final QuickHelpItem item;
  final VoidCallback onTap;

  const _QuickHelpCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: DriverHelpSupportView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: DriverHelpSupportView.kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: item.color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(item.icon, color: item.color, size: 18),
            ),
            const Spacer(),
            Text(item.title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 3),
            Text(
              item.subtitle,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white38, fontSize: 9.5),
            ),
            const SizedBox(height: 4),
            Icon(Icons.chevron_right, color: item.color, size: 14),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Contact channel card (Live Chat / Call Support / Email Support)
// =====================================================================
class _ContactChannelCard extends StatelessWidget {
  final ContactChannel channel;
  final VoidCallback onTap;

  const _ContactChannelCard({required this.channel, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: DriverHelpSupportView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: DriverHelpSupportView.kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: channel.statusColor.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(channel.icon, color: channel.statusColor, size: 16),
            ),
            const SizedBox(height: 8),
            Text(channel.title, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 2),
            Text(
              channel.subtitle,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white38, fontSize: 9),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    channel.statusText,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: channel.statusColor, fontSize: 9.5, fontWeight: FontWeight.w600),
                  ),
                ),
                Icon(Icons.chevron_right, color: channel.statusColor, size: 13),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Support ticket card
// =====================================================================
class _TicketCard extends StatelessWidget {
  final SupportTicket ticket;
  final VoidCallback onTap;

  const _TicketCard({required this.ticket, required this.onTap});

  static const Color kPurple = DriverHelpSupportView.kPurple;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: DriverHelpSupportView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: DriverHelpSupportView.kBorder),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: ticket.status.color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(ticket.icon, color: ticket.status.color, size: 17),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(ticket.id, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(ticket.title, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  const SizedBox(height: 3),
                  Text(ticket.dateText, style: const TextStyle(color: Colors.white24, fontSize: 9.5)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(
                    color: ticket.status.color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    ticket.status.label,
                    style: TextStyle(color: ticket.status.color, fontSize: 10, fontWeight: FontWeight.w600),
                  ),
                ),
                const SizedBox(height: 10),
                const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Popular article row
// =====================================================================
class _ArticleRow extends StatelessWidget {
  final PopularArticle article;
  final VoidCallback onTap;

  const _ArticleRow({required this.article, required this.onTap});

  static const Color kPurple = DriverHelpSupportView.kPurple;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(13),
        child: Row(
          children: [
            const Icon(Icons.article_outlined, color: kPurple, size: 17),
            const SizedBox(width: 10),
            Expanded(
              child: Text(article.title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
            ),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}
