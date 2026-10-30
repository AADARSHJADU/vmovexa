import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/advertiser_change_password_controller.dart';

class AdvertiserChangePasswordView extends GetView<AdvertiserChangePasswordController> {
  const AdvertiserChangePasswordView({super.key});

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
                          'Security & Password',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Update your advertiser credentials',
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => Get.back(),
                    child: const Text('Cancel', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  ),
                ],
              ),
            ),
            const Divider(color: Color(0xFF1E293B), height: 1),

            // Form Body
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Main Form Card
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Card Header
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF3B82F6),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'CHANGE ACCOUNT PASSWORD',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),

                          // 1. Current Password
                          const Text(
                            'Current Password',
                            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Obx(() => _buildPasswordField(
                                controller: controller.currentPasswordController,
                                obscure: controller.currentObscure.value,
                                onToggleObscure: () => controller.currentObscure.toggle(),
                                hintText: 'Enter your current account password',
                                prefixIcon: Icons.lock_outline_rounded,
                              )),
                          const SizedBox(height: 18),

                          // 2. New Password
                          const Text(
                            'New Password',
                            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Obx(() => _buildPasswordField(
                                controller: controller.newPasswordController,
                                obscure: controller.newObscure.value,
                                onToggleObscure: () => controller.newObscure.toggle(),
                                hintText: 'Enter new secure password',
                                prefixIcon: Icons.key_rounded,
                              )),
                          const SizedBox(height: 12),

                          // Strength Meter
                          Obx(() {
                            final score = controller.passedCount.value;
                            final strength = controller.strengthText.value;
                            final color = controller.strengthColor.value;

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Password Strength', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                    Text(
                                      strength,
                                      style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: List.generate(4, (index) {
                                    final isActive = index < score;
                                    return Expanded(
                                      child: Container(
                                        height: 4,
                                        margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                                        decoration: BoxDecoration(
                                          color: isActive ? color : const Color(0xFF334155),
                                          borderRadius: BorderRadius.circular(2),
                                        ),
                                      ),
                                    );
                                  }),
                                ),
                              ],
                            );
                          }),
                          const SizedBox(height: 16),

                          // Security Criteria Checklist
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF334155)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'PASSWORD REQUIREMENTS',
                                  style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                                ),
                                const SizedBox(height: 8),
                                Obx(() => _buildCriteriaItem('At least 8 characters', controller.hasMinLength.value)),
                                const SizedBox(height: 4),
                                Obx(() => _buildCriteriaItem('One uppercase letter (A-Z)', controller.hasUppercase.value)),
                                const SizedBox(height: 4),
                                Obx(() => _buildCriteriaItem('One numerical digit (0-9)', controller.hasNumber.value)),
                                const SizedBox(height: 4),
                                Obx(() => _buildCriteriaItem('One special character (!@#\$%^&*)', controller.hasSpecial.value)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 18),

                          // 3. Confirm New Password
                          const Text(
                            'Confirm New Password',
                            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Obx(() => _buildPasswordField(
                                controller: controller.confirmPasswordController,
                                obscure: controller.confirmObscure.value,
                                onToggleObscure: () => controller.confirmObscure.toggle(),
                                hintText: 'Re-enter your new password',
                                prefixIcon: Icons.lock_clock_outlined,
                              )),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Update Password Button
                    Obx(() {
                      final loading = controller.isLoading.value;
                      return Container(
                        width: double.infinity,
                        height: 50,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: loading ? null : () => controller.updatePassword(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: loading
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                                )
                              : const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.shield_rounded, color: Colors.white, size: 18),
                                    SizedBox(width: 8),
                                    Text(
                                      'Save New Password',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required bool obscure,
    required VoidCallback onToggleObscure,
    required String hintText,
    required IconData prefixIcon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          prefixIcon: Icon(prefixIcon, color: const Color(0xFF64748B), size: 18),
          suffixIcon: IconButton(
            icon: Icon(
              obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: const Color(0xFF64748B),
              size: 18,
            ),
            onPressed: onToggleObscure,
          ),
          hintText: hintText,
          hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 12),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildCriteriaItem(String title, bool isSatisfied) {
    return Row(
      children: [
        Icon(
          isSatisfied ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
          color: isSatisfied ? const Color(0xFF10B981) : const Color(0xFF64748B),
          size: 14,
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            color: isSatisfied ? const Color(0xFFE2E8F0) : const Color(0xFF64748B),
            fontSize: 11,
            fontWeight: isSatisfied ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}

