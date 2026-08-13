import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/forgot_password_controller.dart';
import '../../../../widgets/custom_back_button.dart';
import '../../../../widgets/custom_text_field.dart';
import '../../../../widgets/custom_button.dart';
import '../../../../theme/app_colors.dart';

class ForgotPasswordView extends GetView<ForgotPasswordController> {
  const ForgotPasswordView({super.key});

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
              // Top Bar with Back Button
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: const [
                  CustomBackButton(),
                ],
              ),
              const SizedBox(height: 50),

              // Neon Lock & Letter Graphic
              Center(
                /*child: CustomPaint(
                  size: const Size(120, 120),
                  painter: ForgotPasswordIconPainter(),
                ),*/
                child: Image.asset(
                  'assets/images/image3.png',
                  width: 130,
                  height: 130,
                ),
              ),
              const SizedBox(height: 36),

              // Title & Subtitle
              const Text(
                'Forgot Password?',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Enter your registered email address and we will send you a link to reset your password.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // Email Input Field
              CustomTextField(
                hintText: 'Enter your email address',
                prefixIcon: Icons.mail_outline_rounded,
                keyboardType: TextInputType.emailAddress,
                controller: controller.emailController,
              ),
              const SizedBox(height: 50),

              // Primary Button
              CustomButton(
                text: 'Send Reset Link',
                onTap: controller.sendResetLink,
              ),
              const SizedBox(height: 24),

              // Back to Login link
              GestureDetector(
                onTap: controller.backToLogin,
                child: const Text(
                  'Back to Login',
                  style: TextStyle(
                    color: AppColors.textLink,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Custom Painter for circular lock & envelope icon with purple/cyan gradient
class ForgotPasswordIconPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Draw background glow
    final glowPaint = Paint()
      ..color = const Color(0xFF8B5CF6).withOpacity(0.15)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20);
    canvas.drawCircle(center, radius, glowPaint);

    // Draw Outer Circle border with gradient
    final circlePaint = Paint()
      ..shader = const LinearGradient(
        colors: [
          Color(0xFFEC4899),
          Color(0xFF8B5CF6),
          Color(0xFF3B82F6),
        ],
        begin: Alignment.topRight,
        end: Alignment.bottomLeft,
      ).createShader(Rect.fromLTRB(0, 0, size.width, size.height))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    canvas.drawCircle(center, radius * 0.85, circlePaint);

    // Draw lock & letter inside
    // Lock base
    final lockPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final lockRect = Rect.fromCenter(
      center: Offset(center.dx - 8, center.dy),
      width: 22,
      height: 18,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(lockRect, const Radius.circular(4)),
      lockPaint,
    );

    // Lock arch/shackle
    final shacklePath = Path()
      ..moveTo(center.dx - 15, center.dy - 9)
      ..lineTo(center.dx - 15, center.dy - 17)
      ..quadraticBezierTo(center.dx - 8, center.dy - 24, center.dx - 1, center.dy - 17)
      ..lineTo(center.dx - 1, center.dy - 9);
    canvas.drawPath(shacklePath, lockPaint);

    // Envelope/Mail shape overlaid on bottom-right
    final envelopePaint = Paint()
      ..color = const Color(0xFF06B6D4) // Cyan
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final envelopeRect = Rect.fromCenter(
      center: Offset(center.dx + 12, center.dy + 8),
      width: 26,
      height: 18,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(envelopeRect, const Radius.circular(3)),
      envelopePaint,
    );

    // Envelope fold
    final foldPath = Path()
      ..moveTo(center.dx - 1, center.dy - 1)
      ..lineTo(center.dx + 12, center.dy + 8)
      ..lineTo(center.dx + 25, center.dy - 1);
    canvas.drawPath(foldPath, envelopePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
