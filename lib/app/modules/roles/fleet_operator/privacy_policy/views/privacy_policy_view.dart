import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/privacy_policy_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class PrivacyPolicyView extends GetView<PrivacyPolicyController> {
  const PrivacyPolicyView({super.key});

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
                        'Privacy Policy',
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
                    // Top Privacy Matters Card
                    _buildPrivacyBannerCard(),
                    const SizedBox(height: 18),

                    // Intro Paragraph
                    const Text(
                      'This Privacy Policy explains how VMOVEXA collects, uses, shares and protects your information when you use our app and services.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                    ),
                    const SizedBox(height: 20),

                    // Accordion List of 8 items
                    _buildAccordionList(),
                    const SizedBox(height: 24),

                    // Questions Card Link
                    _buildQuestionsCard(),
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

  Widget _buildPrivacyBannerCard() {
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
            child: const Icon(Icons.lock_person_outlined, color: Color(0xFF6366F1), size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Your Privacy Matters',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'At VMOVEXA, we are committed to protecting your privacy and ensuring the security of your personal information.',
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
        'title': '1. Information We Collect',
        'subtitle': 'We collect information that you provide directly to us and information collected automatically when you use our services.',
        'icon': Icons.person_outline_rounded,
        'color': const Color(0xFF3B82F6),
      },
      {
        'title': '2. How We Use Your Information',
        'subtitle': 'We use the information we collect to provide, maintain and improve our services.',
        'icon': Icons.settings_outlined,
        'color': const Color(0xFF8B5CF6),
      },
      {
        'title': '3. Information Sharing & Disclosure',
        'subtitle': 'We do not sell your personal information. We may share your information in limited circumstances.',
        'icon': Icons.people_outline_rounded,
        'color': Colors.orangeAccent,
      },
      {
        'title': '4. Data Security',
        'subtitle': 'We use appropriate technical and organizational measures to protect your data.',
        'icon': Icons.verified_user_outlined,
        'color': const Color(0xFF10B981),
      },
      {
        'title': '5. Your Choices',
        'subtitle': 'You can update, review or delete your personal information anytime from your account settings.',
        'icon': Icons.tune_rounded,
        'color': Colors.redAccent,
      },
      {
        'title': '6. Data Retention',
        'subtitle': 'We retain your information only for as long as necessary for the purposes stated in this policy.',
        'icon': Icons.access_time_rounded,
        'color': Colors.teal,
      },
      {
        'title': '7. Children\'s Privacy',
        'subtitle': 'Our services are not intended for children under the age of 13.',
        'icon': Icons.face_unlock_outlined,
        'color': Colors.purpleAccent,
      },
      {
        'title': '8. Changes to This Policy',
        'subtitle': 'We may update this Privacy Policy from time to time. We will notify you of any significant changes.',
        'icon': Icons.description_outlined,
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

  Widget _buildQuestionsCard() {
    return GestureDetector(
      onTap: controller.openQuestionsMail,
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
              child: const Icon(Icons.mail_outline_rounded, color: Color(0xFF8B5CF6), size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Questions?',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'If you have any questions about this Privacy Policy, please contact us at support@vmovexa.com',
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
