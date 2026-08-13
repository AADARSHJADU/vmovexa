import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/terms_conditions_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class TermsConditionsView extends GetView<TermsConditionsController> {
  const TermsConditionsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: const [
                  CustomBackButton(),
                  Expanded(
                    child: Center(
                      child: Text(
                        'Terms & Conditions',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 48), // Spacer to balance back button
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Terms Aligned banner Card
                    _buildTermsBannerCard(),
                    const SizedBox(height: 18),

                    // Intro Paragraph
                    const Text(
                      'These Terms & Conditions govern your access to and use of the VMOVEXA mobile application and related services.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                    ),
                    const SizedBox(height: 20),

                    // Accordion list of 8 items
                    _buildAccordionList(),
                    const SizedBox(height: 24),

                    // Need Help Card Link
                    _buildHelpCard(),
                    const SizedBox(height: 36),

                    // I Agree Button
                    CustomButton(
                      text: 'I Agree',
                      onTap: controller.agreeTerms,
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTermsBannerCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.article_outlined, color: Color(0xFF6366F1), size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Terms That Keep Us Aligned',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Please read these terms and conditions carefully before using VMOVEXA app and services.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                ),
                const SizedBox(height: 12),
                Row(
                  children: const [
                    Icon(Icons.calendar_today_outlined, color: AppColors.textMuted, size: 12),
                    SizedBox(width: 6),
                    Text(
                      'Last updated: 20 May 2026',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccordionList() {
    final List<Map<String, dynamic>> items = [
      {
        'title': '1. Acceptance of Terms',
        'subtitle': 'By using VMOVEXA, you agree to these Terms & Conditions and our policies.',
        'icon': Icons.person_outline_rounded,
        'color': const Color(0xFF3B82F6),
      },
      {
        'title': '2. Use of Services',
        'subtitle': 'You agree to use our services only for lawful purposes and in accordance with these terms.',
        'icon': Icons.verified_user_outlined,
        'color': const Color(0xFF8B5CF6),
      },
      {
        'title': '3. User Responsibilities',
        'subtitle': 'You are responsible for maintaining the confidentiality of your account and data.',
        'icon': Icons.block_flipped,
        'color': Colors.orangeAccent,
      },
      {
        'title': '4. Intellectual Property',
        'subtitle': 'All content, trademarks and data in the app are the property of VMOVEXA or its licensors.',
        'icon': Icons.description_outlined,
        'color': const Color(0xFF10B981),
      },
      {
        'title': '5. Limitation of Liability',
        'subtitle': 'VMOVEXA is not liable for any indirect, incidental or consequential damages.',
        'icon': Icons.credit_card_outlined,
        'color': Colors.redAccent,
      },
      {
        'title': '6. Termination',
        'subtitle': 'We may suspend or terminate your access if you violate these terms.',
        'icon': Icons.gavel_rounded,
        'color': Colors.teal,
      },
      {
        'title': '7. Changes to Terms',
        'subtitle': 'We may update these terms from time to time. Continued use means you accept the changes.',
        'icon': Icons.edit_outlined,
        'color': Colors.purpleAccent,
      },
      {
        'title': '8. Governing Law',
        'subtitle': 'These terms are governed by the laws of India, and any disputes shall be subject to its jurisdiction.',
        'icon': Icons.language_rounded,
        'color': Colors.pinkAccent,
      },
    ];

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (context, index) => const Divider(color: AppColors.cardBorder, height: 1),
        itemBuilder: (context, index) {
          final item = items[index];
          return Obx(
            () {
              bool isExpanded = controller.expandedIndex.value == index;
              return Column(
                children: [
                  GestureDetector(
                    onTap: () => controller.toggleIndex(index),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      color: Colors.transparent,
                      child: Row(
                        children: [
                          Icon(item['icon'], color: item['color'], size: 16),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              item['title'],
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Icon(
                            isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                            color: AppColors.textMuted,
                            size: 18,
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (isExpanded)
                    Container(
                      padding: const EdgeInsets.only(left: 46, right: 16, bottom: 14),
                      alignment: Alignment.topLeft,
                      child: Text(
                        item['subtitle'],
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                      ),
                    ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildHelpCard() {
    return GestureDetector(
      onTap: controller.openHelpMail,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF8B5CF6).withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.headset_mic_outlined, color: Color(0xFF8B5CF6), size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Need Help?',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'If you have any questions, please contact us at support@vmovexa.com',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 10, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            const Icon(Icons.arrow_forward_rounded, color: Color(0xFF8B5CF6), size: 18),
          ],
        ),
      ),
    );
  }
}
