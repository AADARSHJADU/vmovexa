import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/login_controller.dart';
import '../../../../widgets/custom_text_field.dart';
import '../../../../widgets/custom_button.dart';
import '../../../../widgets/social_button.dart';
import '../../../../widgets/language_selector_sheet.dart';
import '../../../../translations/services/localization_service.dart';
import '../../../../theme/app_colors.dart';

class LoginView extends GetView<LoginController> {
  const LoginView({super.key});

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
              // Top Bar with Language Selector
              Align(
                alignment: Alignment.centerRight,
                child: InkWell(
                  onTap: () => LanguageSelectorSheet.show(context),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1B1B2A),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.language_rounded, size: 16, color: Color(0xFF60A5FA)),
                        const SizedBox(width: 6),
                        Obx(() {
                          final currentLang = Get.find<LocalizationService>().currentLanguage.value;
                          return Text(
                            currentLang.nativeName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          );
                        }),
                        const SizedBox(width: 4),
                        const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: Colors.white54),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 10),
              Image.asset(
                'assets/app_logo/logo_transparent.png',
                height: 150,
                width: 150,
              ),

              Text(
                'welcome_back'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'sign_in_sub'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 36),

              CustomTextField(
                hintText: 'business_email'.tr,
                prefixIcon: Icons.mail_outline_rounded,
                keyboardType: TextInputType.emailAddress,
                controller: controller.emailController,
              ),
              const SizedBox(height: 16),

              Obx(
                () => CustomTextField(
                  hintText: 'password'.tr,
                  prefixIcon: Icons.lock_outline_rounded,
                  isPassword: true,
                  isObscured: controller.isPasswordObscured.value,
                  onToggleObscure: controller.togglePasswordVisibility,
                  controller: controller.passwordController,
                ),
              ),
              const SizedBox(height: 12),

              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: controller.goToForgotPassword,
                  child: Text(
                    'forgot_password'.tr,
                    style: const TextStyle(
                      color: AppColors.textLink,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              Obx(
                () => CustomButton(
                  text: 'log_in'.tr,
                  isLoading: controller.isLoading.value,
                  onTap: controller.login,
                ),
              ),
              const SizedBox(height: 32),

              Row(
                children: [
                  const Expanded(
                    child: Divider(color: Color(0xFF1E202F), thickness: 1.2),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Text(
                      'or_continue_with'.tr,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const Expanded(
                    child: Divider(color: Color(0xFF1E202F), thickness: 1.2),
                  ),
                ],
              ),
              const SizedBox(height: 24),

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
              // const SizedBox(height: 36),
              //
              // Row(
              //   mainAxisAlignment: MainAxisAlignment.center,
              //   children: [
              //     const Text(
              //       "Don't have an account? ",
              //       style: TextStyle(
              //         color: AppColors.textSecondary,
              //         fontSize: 14,
              //       ),
              //     ),
              //     GestureDetector(
              //       onTap: controller.goToRegister,
              //       child: const Text(
              //         'Create Account',
              //         style: TextStyle(
              //           color: AppColors.textLink,
              //           fontSize: 14,
              //           fontWeight: FontWeight.bold,
              //         ),
              //       ),
              //     ),
              //   ],
              // ),
            ],
          ),
        ),
      ),
    );
  }
}
