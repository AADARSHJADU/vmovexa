import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/upload_doc_stepper.dart' hide kGreen, kPurple, kCardBg;

import '../../../../technician/hardware_configuration/views/shared_widgets.dart';
import '../controller/upload_document_controller.dart';

class DocumentSubmittedView extends GetView<UploadDocumentController> {
  const DocumentSubmittedView({super.key});

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
                  const UploadDocStepper(currentStep: 4, stepLabels: ['Upload', 'Preview', 'Submit', 'Done']),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                children: [
                  _buildSuccessBadge(),
                  const SizedBox(height: 16),
                  const Text(
                    'Document Submitted',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'Successfully!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: kGreen, fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Your document has been submitted for verification. You will be notified once it\'s reviewed.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  const SizedBox(height: 18),
                  _buildDetailsCard(),
                  const SizedBox(height: 16),
                  _buildWhatsNextBanner(),
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
          onTap: controller.onGoToDashboard,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Text('Upload Document', style: TextStyle(color: Colors.white, fontSize: 17.5, fontWeight: FontWeight.w700)),
        ),
        const Icon(Icons.info_outline, color: kPurple, size: 20),
      ],
    );
  }

  // ---------------- Success badge (green ring + check + decorative dots) ----------------
  Widget _buildSuccessBadge() {
    return SizedBox(
      width: 130,
      height: 130,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ..._buildDots(),
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: kGreen, width: 2.5),
              boxShadow: [BoxShadow(color: kGreen.withOpacity(0.25), blurRadius: 24, spreadRadius: 2)],
            ),
            child: const Icon(Icons.check, color: kGreen, size: 40),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDots() {
    const positions = [
      Alignment(-0.8, -0.7),
      Alignment(0.9, -0.5),
      Alignment(-0.95, 0.2),
      Alignment(0.8, 0.75),
      Alignment(-0.3, 0.95),
      Alignment(0.25, -0.98),
    ];
    return positions
        .map(
          (a) => Align(
            alignment: a,
            child: Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(color: kPurple, shape: BoxShape.circle),
            ),
          ),
        )
        .toList();
  }

  // ---------------- Details card ----------------
  Widget _buildDetailsCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
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
                    decoration: BoxDecoration(color: const Color(0xFFFFA726).withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                    child: Text(controller.reviewStatusLabel.value, style: const TextStyle(color: Color(0xFFFFA726), fontSize: 10.5, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
          _divider(),
          Obx(() => _detailRow(Icons.event_available_outlined, 'Submitted On', controller.submittedOnText)),
          _divider(),
          Obx(() => _detailRow(Icons.description_outlined, 'File Name', controller.fileName.value)),
          _divider(),
          Obx(() => _detailRow(Icons.sd_storage_outlined, 'File Size', controller.fileSizeText.value)),
          _divider(),
          Obx(() => _detailRow(Icons.access_time, 'Expected Review Time', controller.expectedReviewTime.value, isLast: true)),
        ],
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withOpacity(0.06), height: 1);

  Widget _detailRow(IconData icon, String label, String value, {bool isLast = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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

  // ---------------- What happens next banner ----------------
  Widget _buildWhatsNextBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kBlue.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBlue.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, color: kBlue, size: 16),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('What happens next?', style: TextStyle(color: kBlue, fontSize: 12.5, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                const Text(
                  'Our team will verify your document. You\'ll receive a notification once the status is updated.',
                  style: TextStyle(color: Colors.white54, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Footer buttons ----------------
  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06)))),
      child: Column(
        children: [
          GestureDetector(
            onTap: controller.onGoToDashboard,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(gradient: const LinearGradient(colors: [kPurple, kIndigo]), borderRadius: BorderRadius.circular(12)),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.home_outlined, color: Colors.white, size: 17),
                  SizedBox(width: 8),
                  Text('Go to Dashboard', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: controller.onUploadAnotherDocument,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kPurple.withOpacity(0.5)),
              ),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.upload_file_outlined, color: kPurple, size: 16),
                  SizedBox(width: 8),
                  Text('Upload Another Document', style: TextStyle(color: kPurple, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
