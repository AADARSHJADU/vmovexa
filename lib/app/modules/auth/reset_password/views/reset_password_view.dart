import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
              const SizedBox(height: 32),

              // Title & Subtitle
              Text(
                'update_password'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              if (controller.email.isNotEmpty)
                RichText(
                  text: TextSpan(
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                      height: 1.4,
                    ),
                    children: [
                      TextSpan(text: '${'enter_six_digit_otp_sent_to'.tr} '),
                      TextSpan(
                        text: controller.email,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                )
              else
                Text(
                  'enter_password'.tr,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                  ),
                ),
              const SizedBox(height: 32),

              // 6-digit OTP Input Field
              CustomTextField(
                hintText: 'enter_six_digit_otp_hint'.tr,
                prefixIcon: Icons.pin_outlined,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                controller: controller.otpController,
              ),
              const SizedBox(height: 10),

              // Resend OTP Section
              Obx(
                () {
                  final cooldown = controller.resendCooldown.value;
                  final isResending = controller.isResending.value;
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        cooldown > 0
                            ? '${'resend_otp_in'.tr}${cooldown}s'
                            : '',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                      GestureDetector(
                        onTap: (cooldown == 0 && !isResending)
                            ? controller.resendOtp
                            : null,
                        child: Text(
                          isResending ? '...' : 'resend_code'.tr,
                          style: TextStyle(
                            color: (cooldown == 0 && !isResending)
                                ? AppColors.textLink
                                : AppColors.textSecondary,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),

              // New Password Input Field
              Obx(
                () => CustomTextField(
                  hintText: 'new_password'.tr,
                  prefixIcon: Icons.lock_outline_rounded,
                  isPassword: true,
                  isObscured: controller.isPasswordObscured.value,
                  onToggleObscure: controller.togglePasswordVisibility,
                  controller: controller.passwordController,
                ),
              ),
              const SizedBox(height: 16),

              // Dynamic Password Requirements Checklist
              Obx(
                () => Column(
                  children: [
                    _buildCheckItem('req_min_8_chars'.tr, controller.hasAtLeast8Chars.value),
                    const SizedBox(height: 10),
                    _buildCheckItem('req_one_uppercase'.tr, controller.hasUppercase.value),
                    const SizedBox(height: 10),
                    _buildCheckItem('req_one_number'.tr, controller.hasNumber.value),
                    const SizedBox(height: 10),
                    _buildCheckItem('req_one_special'.tr, controller.hasSpecialChar.value),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Confirm Password Input Field
              Obx(
                () => CustomTextField(
                  hintText: 'confirm_new_password'.tr,
                  prefixIcon: Icons.lock_outline_rounded,
                  isPassword: true,
                  isObscured: controller.isConfirmPasswordObscured.value,
                  onToggleObscure: controller.toggleConfirmPasswordVisibility,
                  controller: controller.confirmPasswordController,
                ),
              ),
              const SizedBox(height: 36),

              // Primary Button
              Obx(
                () => CustomButton(
                  text: 'update_password'.tr,
                  isLoading: controller.isLoading.value,
                  onTap: controller.updatePassword,
                ),
              ),
              const SizedBox(height: 24),
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
