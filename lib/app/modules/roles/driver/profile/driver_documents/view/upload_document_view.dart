import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/upload_doc_stepper.dart' show UploadDocStepper;
import '../../../../technician/hardware_configuration/views/shared_widgets.dart';
import '../controller/upload_document_controller.dart';

class UploadDocumentView extends GetView<UploadDocumentController> {
  const UploadDocumentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                children: [
                  _buildHeader(),
                  const SizedBox(height: 18),
                  Obx(() => UploadDocStepper(currentStep: controller.currentStep.value, stepLabels: controller.stepLabels)),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                        child: Icon(controller.documentIcon, color: kPurple, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(controller.documentTitle, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 2),
                            const Text('Take a photo or choose a file to upload.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  Row(
                    children: [
                      Expanded(
                        child: _PickOptionCard(
                          icon: Icons.camera_alt_outlined,
                          label: 'Take Photo',
                          onTap: controller.onPickFromCamera,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _PickOptionCard(
                          icon: Icons.photo_library_outlined,
                          label: 'Choose from Gallery',
                          onTap: controller.onPickFromGallery,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  _buildTipsCard(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onBackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Text('Upload Document', style: TextStyle(color: Colors.white, fontSize: 17.5, fontWeight: FontWeight.w700)),
        ),
        GestureDetector(
          onTap: controller.onInfoTap,
          child: const Icon(Icons.info_outline, color: kPurple, size: 20),
        ),
      ],
    );
  }

  Widget _buildTipsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kPurple.withOpacity(0.25)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: kPurple, size: 16),
          SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Tips', style: TextStyle(color: kPurple, fontSize: 12.5, fontWeight: FontWeight.w700)),
                SizedBox(height: 6),
                Text('\u2022 Ensure all details are clearly visible.', style: TextStyle(color: Colors.white54, fontSize: 11)),
                SizedBox(height: 3),
                Text('\u2022 Document should be original and valid.', style: TextStyle(color: Colors.white54, fontSize: 11)),
                SizedBox(height: 3),
                Text('\u2022 Avoid glare and blurry images.', style: TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Pick option card (Take Photo / Choose from Gallery)
// =====================================================================
class _PickOptionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _PickOptionCard({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 12),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kPurple.withOpacity(0.35)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: kPurple.withOpacity(0.15), shape: BoxShape.circle),
              child: Icon(icon, color: kPurple, size: 24),
            ),
            const SizedBox(height: 10),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
