import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/upload_doc_stepper.dart';

import '../../../../technician/hardware_configuration/views/shared_widgets.dart';
import '../controller/upload_document_controller.dart';

class PreviewDocumentView extends GetView<UploadDocumentController> {
  const PreviewDocumentView({super.key});

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
            const SizedBox(height: 14),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  const Text('Preview Document', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  const Text('Please verify your document before submitting.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
                  const SizedBox(height: 14),
                  _buildPreviewCard(),
                  const SizedBox(height: 18),
                  const Text('File Information', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  _buildFileInfoCard(),
                  const SizedBox(height: 16),
                  _buildTipsCard(),
                ],
              ),
            ),
            _buildFooterButtons(),
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

  // ---------------- Document preview mock card ----------------
  Widget _buildPreviewCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(9)),
                  child: Icon(controller.documentIcon, color: kPurple, size: 16),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(controller.documentTitle, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                ),
                Obx(
                  () => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(color: kGreen.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(controller.previewQualityLabel.value, style: const TextStyle(color: kGreen, fontSize: 10.5, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 4),
                        const Icon(Icons.check, color: kGreen, size: 12),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Mock document image placeholder
          Container(
            height: 200,
            margin: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white10,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.image_outlined, color: Colors.white24, size: 40),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: GestureDetector(
              onTap: () {},
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white24),
                ),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.fullscreen, color: Colors.white70, size: 15),
                    SizedBox(width: 6),
                    Text('View Fullscreen', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- File info card ----------------
  Widget _buildFileInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
      child: Obx(
        () => Column(
          children: [
            _infoRow(Icons.description_outlined, 'File Name', controller.fileName.value),
            _divider(),
            _infoRow(Icons.sd_storage_outlined, 'File Size', controller.fileSizeText.value),
            _divider(),
            _infoRow(Icons.insert_drive_file_outlined, 'File Type', controller.fileType.value),
            _divider(),
            _infoRow(Icons.access_time, 'Uploaded On', controller.uploadedOnText, isLast: true),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value, {bool isLast = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: kPurple, size: 15),
          const SizedBox(width: 8),
          Expanded(child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12))),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withOpacity(0.06), height: 1);

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

  // ---------------- Footer (Retake/Replace + Next) ----------------
  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06)))),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: controller.onRetakeReplace,
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: kPurple.withOpacity(0.5)),
                ),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.edit_outlined, color: kPurple, size: 15),
                    SizedBox(width: 6),
                    Text('Retake / Replace', style: TextStyle(color: kPurple, fontSize: 12.5, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(
              () => GestureDetector(
                onTap: controller.isSubmitting.value ? null : controller.onSubmitDocument,
                child: Container(
                  height: 50,
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: [kPurple, kBlue]), borderRadius: BorderRadius.circular(12)),
                  alignment: Alignment.center,
                  child: controller.isSubmitting.value
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Next', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                            SizedBox(width: 6),
                            Icon(Icons.arrow_forward, color: Colors.white, size: 16),
                          ],
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
