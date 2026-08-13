import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../controllers/otp_verify_controller.dart';
import '../../../../widgets/custom_back_button.dart';
import '../../../../widgets/custom_button.dart';
import '../../../../theme/app_colors.dart';

class OtpVerifyView extends GetView<OtpVerifyController> {
  const OtpVerifyView({super.key});

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
              const SizedBox(height: 40),

              // Hexagonal Shield Graphic
              Center(
                /*child: CustomPaint(
                  size: const Size(120, 130),
                  painter: HexShieldPainter(),
                ),*/
                child: Image.asset(
                    'assets/images/image2.png',
                  width: 130,
                  height: 130,
                ),

              ),
              const SizedBox(height: 32),

              // Title & Subtitle
              const Text(
                'Verify Your Number',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                      height: 1.4,
                    ),
                    children: [
                      const TextSpan(text: 'Enter the 6- digit OTP sent to \n'),
                      TextSpan(
                        text: controller.destination,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 36),

              // 6 OTP Input Boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(
                  6,
                  (index) => _buildOtpBox(context, index),
                ),
              ),
              const SizedBox(height: 28),

              // Resend OTP Section
              Obx(
                () => Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Resend OTP in ',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                    GestureDetector(
                      onTap: controller.canResend.value ? controller.resendOtp : null,
                      child: Text(
                        controller.canResend.value ? 'Resend' : controller.formattedTimer,
                        style: TextStyle(
                          color: controller.canResend.value
                              ? AppColors.textLink
                              : const Color(0xFF6366F1),
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 60),

              // Bottom Button
              CustomButton(
                text: 'Verify & Continue',
                onTap: controller.verifyOtp,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOtpBox(BuildContext context, int index) {
    return Container(
      width: 48,
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: AppColors.inputBorder,
          width: 1.2,
        ),
      ),
      child: TextField(
        controller: controller.controllers[index],
        focusNode: controller.focusNodes[index],
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        inputFormatters: [
          LengthLimitingTextInputFormatter(1),
          FilteringTextInputFormatter.digitsOnly,
        ],
        onChanged: (value) {
          if (value.isNotEmpty) {
            if (index < 5) {
              controller.focusNodes[index + 1].requestFocus();
            } else {
              controller.focusNodes[index].unfocus();
            }
          } else {
            if (index > 0) {
              controller.focusNodes[index - 1].requestFocus();
            }
          }
        },
        decoration: const InputDecoration(
          border: InputBorder.none,
          contentPadding: EdgeInsets.zero,
        ),
      ),
    );
  }
}

// Custom Painter for hexagonal shield icon with keyhole inside
class HexShieldPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Draw background glow
    final glowPaint = Paint()
      ..color = const Color(0xFF6366F1).withOpacity(0.15)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20);
    canvas.drawCircle(center, radius, glowPaint);

    // Draw Hexagon path
    final path = Path();
    final angle = 3.1415926535897932 / 3;
    for (int i = 0; i < 6; i++) {
      final x = center.dx + radius * 0.9 * cos(i * angle - 3.1415926535897932 / 2);
      final y = center.dy + radius * 0.9 * sin(i * angle - 3.1415926535897932 / 2);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();

    // Draw Gradient border
    final borderPaint = Paint()
      ..shader = const LinearGradient(
        colors: [
          Color(0xFFEC4899), // Pink
          Color(0xFF6366F1), // Purple/Blue
          Color(0xFF06B6D4), // Cyan
        ],
        begin: Alignment.topRight,
        end: Alignment.bottomLeft,
      ).createShader(Rect.fromLTRB(0, 0, size.width, size.height))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    canvas.drawPath(path, borderPaint);

    // Draw inner shield outline
    final shieldPath = Path();
    shieldPath.moveTo(center.dx - 18, center.dy - 18);
    shieldPath.lineTo(center.dx + 18, center.dy - 18);
    shieldPath.quadraticBezierTo(center.dx + 18, center.dy + 4, center.dx, center.dy + 22);
    shieldPath.quadraticBezierTo(center.dx - 18, center.dy + 4, center.dx - 18, center.dy - 18);
    shieldPath.close();

    final innerPaint = Paint()
      ..color = const Color(0xFF6366F1).withOpacity(0.08)
      ..style = PaintingStyle.fill;
    canvas.drawPath(shieldPath, innerPaint);

    final shieldStroke = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawPath(shieldPath, shieldStroke);

    // Draw keyhole inside shield
    final keyholeCirclePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(center.dx, center.dy - 4), 4, keyholeCirclePaint);

    final keyholeTrianglePath = Path();
    keyholeTrianglePath.moveTo(center.dx - 2, center.dy - 2);
    keyholeTrianglePath.lineTo(center.dx + 2, center.dy - 2);
    keyholeTrianglePath.lineTo(center.dx + 4, center.dy + 6);
    keyholeTrianglePath.lineTo(center.dx - 4, center.dy + 6);
    keyholeTrianglePath.close();

    canvas.drawPath(keyholeTrianglePath, keyholeCirclePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
