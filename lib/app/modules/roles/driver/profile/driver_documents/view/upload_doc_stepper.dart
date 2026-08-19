import 'package:flutter/material.dart';

import '../../../../technician/hardware_configuration/views/shared_widgets.dart';

// const Color kBg = Color(0xFF0B0B14);
// const Color kCardBg = Color(0xFF15151F);
// const Color kFieldBg = Color(0xFF1B1B27);
// const Color kPurple = Color(0xFFB042FF);
// const Color kIndigo = Color(0xFF6A5CFF);
// const Color kBlue = Color(0xFF3F7BF5);
// const Color kBorder = Color(0x14FFFFFF);
// const Color kGreen = Color(0xFF2ECC71);

/// 4-step horizontal stepper: Upload -> Preview -> Submit -> Done.
class UploadDocStepper extends StatelessWidget {
  final int currentStep; // 1..4
  final List<String> stepLabels;

  const UploadDocStepper({super.key, required this.currentStep, required this.stepLabels});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(stepLabels.length, (index) {
        final stepNumber = index + 1;
        final isActive = stepNumber == currentStep;
        final isCompleted = stepNumber < currentStep;
        final isLast = stepNumber == stepLabels.length;

        return Expanded(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  children: [
                    Container(
                      width: 30,
                      height: 30,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: (isActive || isCompleted) ? kPurple : kFieldBg,
                        border: Border.all(
                          color: isActive ? kPurple : (isCompleted ? kPurple : Colors.white24),
                          width: isActive ? 2.5 : 1,
                        ),
                      ),
                      child: isCompleted
                          ? const Icon(Icons.check, color: Colors.white, size: 15)
                          : isActive
                              ? Icon(_iconForStep(stepNumber), color: Colors.white, size: 14)
                              : Text(
                                  '$stepNumber',
                                  style: TextStyle(color: Colors.white38, fontSize: 12, fontWeight: FontWeight.w700),
                                ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      stepLabels[index],
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: isActive ? kPurple : (isCompleted ? Colors.white54 : Colors.white38),
                        fontSize: 9.5,
                        fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              if (!isLast)
                Padding(
                  padding: const EdgeInsets.only(bottom: 18),
                  child: SizedBox(
                    width: 20,
                    child: Divider(color: isCompleted ? kPurple : Colors.white24, thickness: 1.5),
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  IconData _iconForStep(int step) {
    switch (step) {
      case 2:
        return Icons.remove_red_eye_outlined;
      default:
        return Icons.circle;
    }
  }
}
