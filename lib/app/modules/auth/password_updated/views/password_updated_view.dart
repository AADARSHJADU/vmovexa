import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../routes/app_routes.dart';
import '../../../../widgets/custom_back_button.dart';
import '../../../../widgets/custom_button.dart';
import '../../../../theme/app_colors.dart';

class PasswordUpdatedView extends StatelessWidget {
  const PasswordUpdatedView({super.key});

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
                        'Password Updated',
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
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 20),
                    // Neon Success Checkmark ring
                    Center(
                      child: Container(
                        width: 130,
                        height: 130,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF6366F1),
                            width: 3.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF6366F1).withOpacity(0.2),
                              blurRadius: 20,
                              spreadRadius: 2,
                            )
                          ],
                        ),
                        child: const Center(
                          child: Icon(Icons.check_rounded, color: Color(0xFF6366F1), size: 64),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Success Texts
                    const Text(
                      'Password Updated Successfully',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Your account password has been changed.\nYou can now continue with your work.',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        height: 1.4,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 36),

                    // What's Changed Card
                    _buildWhatsChangedCard(),
                    const SizedBox(height: 48),

                    // Redirect Button
                    ElevatedButton.icon(
                      onPressed: () {
                        // Return to Dashboard and navigate to Profile tab index (4)
                        Get.offAllNamed(Routes.FLEET_OP_DASHBOARD, arguments: {'tab': 4});
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF3B82F6),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 16),
                      label: const Text('Back to Profile', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWhatsChangedCard() {
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
              Icon(Icons.verified_user_outlined, color: Color(0xFF8B5CF6), size: 18),
              SizedBox(width: 10),
              Text(
                "What's Changed",
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Row 1: Password updated
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.lock_outline_rounded, color: Color(0xFF8B5CF6), size: 16),
                  SizedBox(width: 10),
                  Text('Password updated', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ],
              ),
              const Text('15 Jul 2026, 09:45 AM', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),

          // Row 2: Account stays secure
          Row(
            children: const [
              Icon(Icons.person_outline_rounded, color: Color(0xFF8B5CF6), size: 16),
              SizedBox(width: 10),
              Text('Account stays secure', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}
