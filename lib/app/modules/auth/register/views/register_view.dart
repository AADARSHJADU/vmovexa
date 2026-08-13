import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/register_controller.dart';
import '../../../../widgets/app_logo_header.dart';
import '../../../../widgets/custom_text_field.dart';
import '../../../../widgets/custom_checkbox.dart';
import '../../../../widgets/custom_button.dart';
import '../../../../widgets/social_button.dart';
import '../../../../theme/app_colors.dart';

class RegisterView extends GetView<RegisterController> {
  const RegisterView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 10),

              // Header Logo (Image 1)
              const AppLogoHeader(height: 70),
              const SizedBox(height: 24),

              // Title & Subtitle
              const Text(
                'Create Your Account',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Join VMOVEXA to manage your fleet with intelligent mobility.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                    height: 1.35,
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Form Input Fields (Image 1)
              CustomTextField(
                hintText: 'Full Name',
                prefixIcon: Icons.person_outline_rounded,
                controller: controller.fullNameController,
              ),
              const SizedBox(height: 14),

              CustomTextField(
                hintText: 'Organization Name',
                prefixIcon: Icons.apartment_outlined,
                controller: controller.orgNameController,
              ),
              const SizedBox(height: 14),

              Obx(
                () => CustomTextField(
                  hintText: 'Select Operator',
                  isDropdown: true,
                  dropdownValue: controller.selectedOperator.value,
                  dropdownItems: controller.operatorTypes,
                  onDropdownChanged: controller.setSelectedOperator,
                ),
              ),
              const SizedBox(height: 14),

              CustomTextField(
                hintText: 'Business Email',
                prefixIcon: Icons.mail_outline_rounded,
                keyboardType: TextInputType.emailAddress,
                controller: controller.emailController,
              ),
              const SizedBox(height: 14),

              CustomTextField(
                hintText: 'Mobile Number',
                prefixIcon: Icons.smartphone_outlined,
                keyboardType: TextInputType.phone,
                controller: controller.mobileController,
              ),
              const SizedBox(height: 14),

              Obx(
                () => CustomTextField(
                  hintText: 'Enter your password',
                  prefixIcon: Icons.lock_outline_rounded,
                  isPassword: true,
                  isObscured: controller.isPasswordObscured.value,
                  onToggleObscure: controller.togglePasswordVisibility,
                  controller: controller.passwordController,
                ),
              ),
              const SizedBox(height: 18),

              // Terms & Privacy Policy Checkbox
              Obx(
                () => CustomCheckbox(
                  value: controller.isTermsAgreed.value,
                  onChanged: controller.toggleTerms,
                  text: 'I agree to the ',
                  boldText: 'Terms & Privacy Policy',
                ),
              ),
              const SizedBox(height: 24),

              // Create Account Button
              CustomButton(
                text: 'Create Account',
                onTap: controller.registerAccount,
              ),
              const SizedBox(height: 28),

              // Divider "Or Continue With"
              Row(
                children: const [
                  Expanded(
                    child: Divider(color: Color(0xFF1E202F), thickness: 1.2),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 14),
                    child: Text(
                      'Or Continue With',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(color: Color(0xFF1E202F), thickness: 1.2),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Social Sign-in Buttons (Google, Apple, Zoho)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  SocialButton(
                    assetPath: 'assets/icons/google-ic.svg',
                    isSvg: true,
                    onTap: () {},
                  ),
                  SocialButton(
                    assetPath: 'assets/icons/apple-ic.svg',
                    isSvg: true,
                    onTap: () {},
                  ),
                  SocialButton(
                    assetPath: 'assets/icons/zoho.png',
                    isSvg: false,
                    onTap: () {},
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Footer Navigation Text
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Already have an account? ',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                  GestureDetector(
                    onTap: controller.goToLogin,
                    child: const Text(
                      'Log-In',
                      style: TextStyle(
                        color: AppColors.textLink,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
