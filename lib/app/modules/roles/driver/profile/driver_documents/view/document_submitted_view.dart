import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/upload_doc_stepper.dart' show UploadDocStepper;

import '../../../../technician/hardware_configuration/views/shared_widgets.dart';
import '../controller/upload_document_controller.dart';

class DocumentSubmittedView extends GetView<UploadDocumentController> {
  const DocumentSubmittedView({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        controller.onGoToDocumentsRoster();
      },
      child: Scaffold(
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
                    UploadDocStepper(currentStep: 4, stepLabels: controller.stepLabels),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                  children: [
                    _buildSuccessBadge(),
                    const SizedBox(height: 16),
                    Text(
                      'doc_uploaded_success'.tr,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'doc_received_queued'.tr,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
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
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: controller.onGoToDocumentsRoster,
          child: const Padding(
            padding: EdgeInsets.all(4.0),
            child: Icon(Icons.arrow_back, color: Colors.white),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text('document_status'.tr, style: const TextStyle(color: Colors.white, fontSize: 17.5, fontWeight: FontWeight.w700)),
        ),
        GestureDetector(
          onTap: controller.onInfoTap,
          child: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: kPurple.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.info_outline, color: kPurple, size: 18),
          ),
        ),
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
              boxShadow: [BoxShadow(color: kGreen.withValues(alpha: 0.25), blurRadius: 24, spreadRadius: 2)],
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
              decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle),
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
                  decoration: BoxDecoration(color: kPurple.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(9)),
                  child: Icon(controller.documentIcon, color: kPurple, size: 16),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(controller.documentTitle, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                ),
                Obx(
                  () => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(color: const Color(0xFFFFA726).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.access_time, color: Color(0xFFFFA726), size: 11),
                        const SizedBox(width: 4),
                        Text(controller.reviewStatusLabel.value, style: const TextStyle(color: Color(0xFFFFA726), fontSize: 10.5, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          _divider(),
          Obx(() => _detailRow(Icons.event_available_outlined, 'submitted_on'.tr, controller.submittedOnText)),
          _divider(),
          Obx(() => _detailRow(Icons.description_outlined, 'attached_file'.tr, controller.fileName.value.isNotEmpty ? controller.fileName.value : 'Document')),
          _divider(),
          Obx(() => _detailRow(Icons.sd_storage_outlined, 'file_size'.tr, controller.fileSizeText.value.isNotEmpty ? controller.fileSizeText.value : 'Attached')),
          _divider(),
          Obx(() => _detailRow(Icons.access_time, 'expected_review_time_label'.tr, controller.expectedReviewTime.value, isLast: true)),
        ],
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withValues(alpha: 0.06), height: 1);

  Widget _detailRow(IconData icon, String label, String value, {bool isLast = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: kPurple, size: 15),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
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
        color: kBlue.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBlue.withValues(alpha: 0.3)),
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
                Text('what_happens_next'.tr, style: const TextStyle(color: kBlue, fontSize: 12.5, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(
                  'compliance_verify_next_full'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
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
      decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06)))),
      child: Column(
        children: [
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: controller.onGoToDocumentsRoster,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [kPurple, kIndigo]),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.folder_shared_outlined, color: Colors.white, size: 17),
                  const SizedBox(width: 8),
                  Text('go_to_documents_roster'.tr, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: controller.onGoToDashboard,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
              ),
              alignment: Alignment.center,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.home_outlined, color: Colors.white70, size: 17),
                  const SizedBox(width: 8),
                  Text('go_to_dashboard'.tr, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
