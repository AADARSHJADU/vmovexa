import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/splash_controller.dart';
import '../../../widgets/app_logo_header.dart';

class SplashView extends StatefulWidget {
  const SplashView({super.key});

  @override
  State<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends State<SplashView> with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;
  late final Animation<Offset> _busSlideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    // Slide in from right (Offset(1.2, 0)) to center (Offset(0, 0))
    _busSlideAnimation = Tween<Offset>(
      begin: const Offset(1.2, 0.0),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOutCubic,
      ),
    );

    // Start the animation
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Ensure controller is initialized
    Get.find<SplashController>();

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Bottom background (Skyline only at the bottom portion)
          Align(
            alignment: Alignment.bottomCenter,
            child: SizedBox(
              width: double.infinity,
              height: MediaQuery.of(context).size.height * 0.45,
              child: Image.asset(
                'assets/images/splash_bg.jpg',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const SizedBox(),
              ),
            ),
          ),

          // Centered VMOVEXA logo header in the upper black section
          Align(
            alignment: const Alignment(0, -0.32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: const [
                AppLogoHeader(height: 160), // Increased logo size
              ],
            ),
          ),

          // Bottom animated bus on top of the skyline background
          Align(
            alignment: Alignment.bottomCenter,
            child: SlideTransition(
              position: _busSlideAnimation,
              child: SizedBox(
                width: double.infinity,
                height: MediaQuery.of(context).size.height * 0.45,
                child: Image.asset(
                  'assets/images/splash_bus.png',
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const SizedBox(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
