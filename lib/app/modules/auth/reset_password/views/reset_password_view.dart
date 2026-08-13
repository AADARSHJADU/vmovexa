import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/reset_password_controller.dart';
import '../../../../widgets/custom_back_button.dart';
import '../../../../widgets/custom_text_field.dart';
import '../../../../widgets/custom_button.dart';
import '../../../../theme/app_colors.dart';

class ResetPasswordView extends GetView<ResetPasswordController> {
  const ResetPasswordView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar with Back Button
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: const [
                  CustomBackButton(),
                ],
              ),
              const SizedBox(height: 40),

              // Title & Subtitle
              const Text(
                'Reset Password?',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Enter your new password',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 36),

              // New Password Input Field
              Obx(
                () => CustomTextField(
                  hintText: 'New Password',
                  prefixIcon: Icons.lock_outline_rounded,
                  isPassword: true,
                  isObscured: controller.isPasswordObscured.value,
                  onToggleObscure: controller.togglePasswordVisibility,
                  controller: controller.passwordController,
                ),
              ),
              const SizedBox(height: 20),

              // Dynamic Password Requirements Checklist
              Obx(
                () => Column(
                  children: [
                    _buildCheckItem('At least 8 characters', controller.hasAtLeast8Chars.value),
                    const SizedBox(height: 10),
                    _buildCheckItem('One uppercase letter', controller.hasUppercase.value),
                    const SizedBox(height: 10),
                    _buildCheckItem('One number', controller.hasNumber.value),
                    const SizedBox(height: 10),
                    _buildCheckItem('One special character', controller.hasSpecialChar.value),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Confirm Password Input Field
              Obx(
                () => CustomTextField(
                  hintText: 'Confirm password',
                  prefixIcon: Icons.lock_outline_rounded,
                  isPassword: true,
                  isObscured: controller.isConfirmPasswordObscured.value,
                  onToggleObscure: controller.toggleConfirmPasswordVisibility,
                  controller: controller.confirmPasswordController,
                ),
              ),
              const SizedBox(height: 50),

              // Primary Button
              CustomButton(
                text: 'Update Password',
                onTap: controller.updatePassword,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCheckItem(String text, bool isChecked) {
    return Row(
      children: [
        Container(
          width: 18,
          height: 18,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isChecked ? AppColors.accentGreen : Colors.transparent,
            border: Border.all(
              color: isChecked ? AppColors.accentGreen : AppColors.indicatorInactive,
              width: 1.5,
            ),
          ),
          child: isChecked
              ? const Icon(
                  Icons.check,
                  size: 11,
                  color: Colors.black,
                )
              : null,
        ),
        const SizedBox(width: 10),
        Text(
          text,
          style: TextStyle(
            color: isChecked ? Colors.white : AppColors.textSecondary,
            fontSize: 13,
            fontWeight: isChecked ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
