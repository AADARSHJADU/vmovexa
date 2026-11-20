import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/change_password_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class ChangePasswordView extends StatelessWidget {
  const ChangePasswordView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<ChangePasswordController>()
        ? Get.find<ChangePasswordController>()
        : Get.put(ChangePasswordController());

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
                        'change_password'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 48), // Spacer to balance back button
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
                    _buildInputsCard(controller),
                    const SizedBox(height: 24),

                    // Requirements Card
                    _buildRequirementsCard(controller),
                    const SizedBox(height: 36),

                    // Actions
                    Obx(
                      () => Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: ElevatedButton(
                          onPressed: controller.isLoading.value ? null : controller.updatePassword,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: controller.isLoading.value
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    SvgPicture.asset(
                                      "assets/icons/fleet_operator_icons/changePasswordA.svg",
                                      width: 18,
                                      height: 18,
                                      colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'update_password'.tr,
                                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    OutlinedButton.icon(
                      onPressed: controller.cancel,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF1E293B)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        backgroundColor: Colors.transparent,
                      ),
                      icon: SvgPicture.asset("assets/icons/fleet_operator_icons/cancelA.svg", colorFilter: const ColorFilter.mode(Color(0xFF3B82F6), BlendMode.srcIn), width: 18, height: 18),
                      label: Text('cancel'.tr, style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 13, fontWeight: FontWeight.bold)),
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
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SvgPicture.asset("assets/icons/fleet_operator_icons/accountSecureA.svg", width: 45, height: 45),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'keep_account_secure'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  'keep_account_secure_desc'.tr,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputsCard(ChangePasswordController controller) {
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
          Text('current_password_label'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Obx(
            () => _buildPasswordField(
              controller: controller.currentPasswordController,
              obscure: controller.currentObscure.value,
              onToggle: () => controller.currentObscure.value = !controller.currentObscure.value,
              hint: 'enter_current_password_hint'.tr,
            ),
          ),
          const SizedBox(height: 20),

          // New password field
          Text('new_password'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Obx(
            () => _buildPasswordField(
              controller: controller.newPasswordController,
              obscure: controller.newObscure.value,
              onToggle: () => controller.newObscure.value = !controller.newObscure.value,
              hint: 'enter_new_password_hint'.tr,
            ),
          ),
          const SizedBox(height: 12),

          // Strength Bars Indicators
          _buildStrengthRow(controller),
          const SizedBox(height: 20),

          // Confirm password field
          Text('confirm_new_password'.tr, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Obx(
            () => _buildPasswordField(
              controller: controller.confirmPasswordController,
              obscure: controller.confirmObscure.value,
              onToggle: () => controller.confirmObscure.value = !controller.confirmObscure.value,
              hint: 'confirm_new_password_hint'.tr,
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
          prefixIcon: Padding(
            padding: const EdgeInsets.all(10.0),
            child: SvgPicture.asset("assets/icons/fleet_operator_icons/changePasswordA.svg", width: 10, height: 10),
          ),
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

  Widget _buildStrengthRow(ChangePasswordController controller) {
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
              'password_strength_label'.tr,
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

  Widget _buildRequirementsCard(ChangePasswordController controller) {
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
            children: [
              SvgPicture.asset("assets/icons/fleet_operator_icons/securityA.svg", width: 18, height: 18),
              const SizedBox(width: 8),
              Text(
                'password_requirements_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Obx(() => _buildRequirementItem('req_min_8_chars'.tr, controller.hasMinLength.value)),
          const SizedBox(height: 10),
          Obx(() => _buildRequirementItem('req_one_uppercase'.tr, controller.hasUppercase.value)),
          const SizedBox(height: 10),
          Obx(() => _buildRequirementItem('req_one_number'.tr, controller.hasNumber.value)),
          const SizedBox(height: 10),
          Obx(() => _buildRequirementItem('req_one_special'.tr, controller.hasSpecialChar.value)),
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
