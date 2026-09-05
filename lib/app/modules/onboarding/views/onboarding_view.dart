import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/onboarding_controller.dart';
import '../../../widgets/custom_button.dart';

import '../../../theme/app_colors.dart';
import 'widgets/step2_map_widget.dart';
import 'widgets/step3_analytics_widget.dart';

class OnboardingView extends GetView<OnboardingController> {
  const OnboardingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar with Skip Button (Image 2, 3, 4)
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: controller.skipToAuth,
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),

            // Header Logo
            //const AppLogoHeader(height: 65),
            Image.asset(
              'assets/app_logo/logo_transparent.png',
              height: 150,
              width: 150,
            ),
            // Image.asset(
            //   'assets/app_logo/app-logo.png',
            //   height: 150,
            //   width: 150,
            // ),
            //const SizedBox(height: 20),

            // Main PageView content
            Expanded(
              child: PageView(
                controller: controller.pageController,
                onPageChanged: controller.onPageChanged,
                children: [
                  _buildStep1(context),
                  _buildStep2(context),
                  _buildStep3(context),
                ],
              ),
            ),

            // Bottom Section: Indicators & Action Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
              child: Column(
                children: [
                  // 3 Indicator Dots (Obx reactive)
                  Obx(
                    () => Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        3,
                        (index) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: controller.currentPage.value == index ? 12 : 10,
                          height: controller.currentPage.value == index ? 12 : 10,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: controller.currentPage.value == index
                                ? const Color(0xFF6366F1)
                                : AppColors.indicatorInactive,
                            boxShadow: controller.currentPage.value == index
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFF6366F1)
                                          .withOpacity(0.6),
                                      blurRadius: 8,
                                    ),
                                  ]
                                : null,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Dynamic Bottom Navigation Buttons (Obx reactive)
                  Obx(
                    () {
                      if (controller.currentPage.value == 0) {
                        return CustomButton(
                          text: 'Next',
                          onTap: controller.nextPage,
                        );
                      }
                      return Row(
                        children: [
                          Expanded(
                            child: CustomButton(
                              text: 'Back',
                              isOutlined: true,
                              onTap: controller.previousPage,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: CustomButton(
                              text: controller.currentPage.value == 2
                                  ? 'Get Started'
                                  : 'Next',
                              onTap: controller.nextPage,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Onboarding Step 1 (Image 2)
  Widget _buildStep1(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: MediaQuery.of(context).size.height * 0.4,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // SizedBox(
            //   width: double.infinity,
            //   height: 220,
            //   child: Image.asset(
            //     'assets/images/onboarding-bus1.png',
            //     fit: BoxFit.cover,
            //     errorBuilder: (context, error, stackTrace) =>
            //     const Icon(Icons.directions_bus, size: 140, color: Colors.white38),
            //   ),
            // ),
            SizedBox(
              width: double.infinity,
              height: 200,
              child: Image.asset(
                'assets/app_logo/newBus3.png',
                // fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                const Icon(Icons.directions_bus, size: 140, color: Colors.white38),
              ),
            ),
            // SizedBox(
            //   width: double.infinity,
            //   height: 300,
            //   child: Image.asset(
            //     'assets/app_logo/newBus.png',
            //     // fit: BoxFit.fill,
            //     fit: BoxFit.cover,
            //     errorBuilder: (context, error, stackTrace) =>
            //     const Icon(Icons.directions_bus, size: 140, color: Colors.white38),
            //   ),
            // ),
            const SizedBox(height: 10),
            const Text(
              'Smart Mobility\nSimplified',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.bold,
                height: 1.25,
              ),
            ),
            const SizedBox(height: 12),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Manage your fleets, vehicles and drivers in one intelligent platform.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ),
            //const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // Onboarding Step 2 (Image 3)
  Widget _buildStep2(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: MediaQuery.of(context).size.height * 0.4,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children:  [
            // Step2MapWidget(),
            Image.asset('assets/app_logo/onBoardingSecond.png'),
            SizedBox(height: 15),
            Text(
              'Interactive Media Everywhere',
              // 'Real-Time Tracking\nAlways',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.bold,
                height: 1.25,
              ),
            ),
            SizedBox(height: 10),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Deliver engaging content across vehicle displays and reach people on the move.',
                // 'Track your vehicles live, optimize routes, and stay updated every second.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

// Onboarding Step 3 (Image 4)
  Widget _buildStep3(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: MediaQuery.of(context).size.height * 0.4,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children:  [
            Image.asset('assets/app_logo/onBoardingThird.png'),
            // Step3AnalyticsWidget(),
            SizedBox(height: 10),
            Text(
              'Safety First\nFor Smarter Cities',
              // 'Data-Driven\nDecisions',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.bold,
                height: 1.25,
              ),
            ),
            SizedBox(height: 8),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: Text(
                'Broadcast emergency alerts and important information to keep communities safe and connected',
                // 'Get powerful insights and reports to improve efficiency and drive growth.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  // height: 1.8,
                ),
              ),
            ),
            SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
