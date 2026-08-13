import 'package:flutter/material.dart';

class AppLogoHeader extends StatelessWidget {
  final double height;

  const AppLogoHeader({
    super.key,
    this.height = 70,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Image.asset(
        'assets/app_logo/app-logo.png',
        height: height,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          // Sleek visual fallback if asset path differs
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.electric_car,
                size: 40,
                color: Colors.white,
              ),
              const SizedBox(height: 4),
              RichText(
                text: const TextSpan(
                  children: [
                    TextSpan(
                      text: 'V M O V E ',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4,
                        color: Colors.white,
                      ),
                    ),
                    TextSpan(
                      text: 'X',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4,
                        color: Color(0xFF8B5CF6),
                      ),
                    ),
                    TextSpan(
                      text: ' A',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
