import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/change_password_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class ChangePasswordView extends GetView<ChangePasswordController> {
  const ChangePasswordView({super.key});

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
                        'Change Password',
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
                    // Top Info Shield banner card
                    _buildInfoBannerCard(),
                    const SizedBox(height: 24),

                    // Inputs Card
                    _buildInputsCard(),
                    const SizedBox(height: 24),

                    // Requirements Card
                    _buildRequirementsCard(),
                    const SizedBox(height: 36),

                    // Actions
                    CustomButton(
                      text: 'Update Password',
                      onTap: controller.updatePassword,
                    ),
                    const SizedBox(height: 14),
                    CustomButton(
                      text: 'Cancel',
                      isOutlined: true,
                      onTap: controller.cancel,
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

  Widget _buildInfoBannerCard() {
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
              children: const [
                Text(
                  'Keep Your Account Secure',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 6),
                Text(
                  'Use a strong password to protect your account and fleet data from unauthorized access.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Current password field
          const Text('Current Password', style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Obx(
            () => _buildPasswordField(
              controller: controller.currentPasswordController,
              obscure: controller.currentObscure.value,
              onToggle: () => controller.currentObscure.value = !controller.currentObscure.value,
              hint: 'Enter current password',
            ),
          ),
          const SizedBox(height: 20),

          // New password field
          const Text('New Password', style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Obx(
            () => _buildPasswordField(
              controller: controller.newPasswordController,
              obscure: controller.newObscure.value,
              onToggle: () => controller.newObscure.value = !controller.newObscure.value,
              hint: 'Enter new password',
            ),
          ),
          const SizedBox(height: 12),

          // Strength Bars Indicators
          _buildStrengthRow(),
          const SizedBox(height: 20),

          // Confirm password field
          const Text('Confirm New Password', style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Obx(
            () => _buildPasswordField(
              controller: controller.confirmPasswordController,
              obscure: controller.confirmObscure.value,
              onToggle: () => controller.confirmObscure.value = !controller.confirmObscure.value,
              hint: 'Confirm new password',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required bool obscure,
    required VoidCallback onToggle,
    required String hint,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF6366F1), size: 18),
          suffixIcon: IconButton(
            icon: Icon(
              obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: AppColors.textMuted,
              size: 18,
            ),
            onPressed: onToggle,
          ),
        ),
      ),
    );
  }

  Widget _buildStrengthRow() {
    return Obx(
      () {
        int score = controller.passwordStrength.value;
        String text = controller.strengthText.value;
        Color strengthColor = score <= 1
            ? Colors.redAccent
            : (score == 2 ? Colors.orangeAccent : (score == 3 ? Colors.blueAccent : const Color(0xFF10B981)));

        return Row(
          children: [
            Text(
              'Password Strength:',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
            ),
            const SizedBox(width: 6),
            Text(
              text,
              style: TextStyle(color: strengthColor, fontSize: 10, fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Row(
                children: List.generate(
                  4,
                  (index) => Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: index < score ? strengthColor : const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildRequirementsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.verified_user_outlined, color: Color(0xFF6366F1), size: 16),
              SizedBox(width: 8),
              Text(
                'Password Requirements',
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Obx(() => _buildRequirementItem('Minimum 8 characters', controller.hasMinLength.value)),
          const SizedBox(height: 10),
          Obx(() => _buildRequirementItem('One uppercase letter (A-Z)', controller.hasUppercase.value)),
          const SizedBox(height: 10),
          Obx(() => _buildRequirementItem('One number (0-9)', controller.hasNumber.value)),
          const SizedBox(height: 10),
          Obx(() => _buildRequirementItem('One special character (!@#\$%^&*)', controller.hasSpecialChar.value)),
        ],
      ),
    );
  }

  Widget _buildRequirementItem(String label, bool isMet) {
    return Row(
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isMet ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
          ),
          child: Center(
            child: Icon(
              Icons.check,
              color: isMet ? Colors.white : Colors.transparent,
              size: 10,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          label,
          style: TextStyle(
            color: isMet ? Colors.white : AppColors.textMuted,
            fontSize: 11,
            fontWeight: isMet ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
