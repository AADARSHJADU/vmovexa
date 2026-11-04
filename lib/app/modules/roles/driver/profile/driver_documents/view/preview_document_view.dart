import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
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
                  Obx(() {
                    final isExisting = controller.remoteUrl.value.isNotEmpty && controller.filePath.value.isEmpty;
                    if (isExisting) {
                      return const SizedBox.shrink();
                    }
                    return Column(
                      children: [
                        const SizedBox(height: 14),
                        UploadDocStepper(currentStep: controller.currentStep.value, stepLabels: controller.stepLabels),
                      ],
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  Obx(() {
                    final isExisting = controller.remoteUrl.value.isNotEmpty && controller.filePath.value.isEmpty;
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isExisting ? 'Document Details & Verification' : 'Preview Document',
                          style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          isExisting
                              ? 'Review attached document status and compliance clearance.'
                              : 'Please verify your document before submitting for approval.',
                          style: const TextStyle(color: Colors.white54, fontSize: 11.5),
                        ),
                      ],
                    );
                  }),
                  const SizedBox(height: 14),
                  _buildPreviewCard(context),
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
          child: const Padding(
            padding: EdgeInsets.all(4.0),
            child: Icon(Icons.arrow_back, color: Colors.white),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Obx(() {
            final isExisting = controller.remoteUrl.value.isNotEmpty && controller.filePath.value.isEmpty;
            return Text(
              isExisting ? 'Document Details' : 'Upload Document',
              style: const TextStyle(color: Colors.white, fontSize: 17.5, fontWeight: FontWeight.w700),
            );
          }),
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

  // ---------------- Document preview card ----------------
  Widget _buildPreviewCard(BuildContext context) {
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
                  decoration: BoxDecoration(color: kPurple.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(9)),
                  child: Icon(controller.documentIcon, color: kPurple, size: 16),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(controller.documentTitle, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                ),
                Obx(
                  () {
                    final isExisting = controller.remoteUrl.value.isNotEmpty && controller.filePath.value.isEmpty;
                    final stat = controller.documentStatus.value;
                    Color badgeColor = kGreen;
                    String badgeText = controller.previewQualityLabel.value;
                    IconData badgeIcon = Icons.check;

                    if (isExisting) {
                      final s = stat.toLowerCase();
                      if (controller.isReadOnly || s.contains('verified')) {
                        badgeColor = const Color(0xFF10B981);
                        badgeText = 'VERIFIED';
                        badgeIcon = Icons.verified;
                      } else if (s.contains('rejected')) {
                        badgeColor = const Color(0xFFEF4444);
                        badgeText = 'REJECTED';
                        badgeIcon = Icons.cancel;
                      } else {
                        badgeColor = const Color(0xFFF59E0B);
                        badgeText = 'UNDER REVIEW';
                        badgeIcon = Icons.access_time;
                      }
                    }

                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                      decoration: BoxDecoration(color: badgeColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(badgeText, style: TextStyle(color: badgeColor, fontSize: 10.5, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 4),
                          Icon(badgeIcon, color: badgeColor, size: 12),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          // Document image preview
          Obx(
            () {
              final isLocal = controller.filePath.value.isNotEmpty && File(controller.filePath.value).existsSync();
              final isRemote = controller.remoteUrl.value.isNotEmpty;
              final fullRemoteUrl = isRemote ? ApiConstants.resolveFileUrl(controller.remoteUrl.value) : '';
              final isPdf = (controller.fileType.value.toLowerCase() == 'pdf') ||
                  fullRemoteUrl.toLowerCase().endsWith('.pdf') ||
                  controller.fileName.value.toLowerCase().endsWith('.pdf');

              return Container(
                height: 200,
                margin: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.04),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                ),
                alignment: Alignment.center,
                child: isLocal
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.file(
                          File(controller.filePath.value),
                          width: double.infinity,
                          height: 200,
                          fit: BoxFit.contain,
                        ),
                      )
                    : isRemote
                        ? (isPdf
                            ? Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.picture_as_pdf_outlined, color: Color(0xFFEF4444), size: 36),
                                  ),
                                  const SizedBox(height: 8),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 20),
                                    child: Text(
                                      controller.fileName.value.isNotEmpty ? controller.fileName.value : 'PDF Document Attached',
                                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                      textAlign: TextAlign.center,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  const Text('PDF Document • Stored securely', style: TextStyle(color: Colors.white38, fontSize: 10)),
                                ],
                              )
                            : ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.network(
                                  fullRemoteUrl,
                                  width: double.infinity,
                                  height: 200,
                                  fit: BoxFit.contain,
                                  loadingBuilder: (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return const Center(child: CircularProgressIndicator(color: kPurple, strokeWidth: 2));
                                  },
                                  errorBuilder: (context, error, stackTrace) {
                                    return Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.insert_drive_file_outlined, color: Colors.white38, size: 38),
                                        const SizedBox(height: 6),
                                        Text(
                                          controller.fileName.value.isNotEmpty ? controller.fileName.value : 'Document Attached',
                                          style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 2),
                                        const Text(
                                            'File stored on server',
                                            style: TextStyle(
                                                color: Colors.white38,
                                                fontSize: 10,
                                            ),
                                        ),
                                      ],
                                    );
                                  },
                                ),
                              ))
                        : const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.image_outlined, color: Colors.white24, size: 38),
                              SizedBox(height: 6),
                              Text('No document image selected', style: TextStyle(color: Colors.white38, fontSize: 11)),
                            ],
                          ),
              );
            },
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: GestureDetector(
              onTap: () => _openFullscreen(context),
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
                    Icon(Icons.fullscreen, color: Colors.white70, size: 16),
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

  void _openFullscreen(BuildContext context) {
    final isLocal = controller.filePath.value.isNotEmpty && File(controller.filePath.value).existsSync();
    final isRemote = controller.remoteUrl.value.isNotEmpty;
    if (!isLocal && !isRemote) return;

    final fullRemoteUrl = isRemote ? ApiConstants.resolveFileUrl(controller.remoteUrl.value) : '';

    Get.dialog(
      Dialog(
        backgroundColor: Colors.black.withValues(alpha: 0.95),
        insetPadding: EdgeInsets.zero,
        child: Stack(
          children: [
            Center(
              child: InteractiveViewer(
                panEnabled: true,
                minScale: 0.8,
                maxScale: 4.0,
                child: isLocal
                    ? Image.file(File(controller.filePath.value))
                    : Image.network(
                        fullRemoteUrl,
                        errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image, color: Colors.white54, size: 60),
                      ),
              ),
            ),
            Positioned(
              top: 40,
              right: 16,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 28),
                onPressed: () => Get.back(),
              ),
            ),
          ],
        ),
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
        () {
          final isUploadedOnServer = controller.remoteUrl.value.isNotEmpty;
          return Column(
            children: [
              _infoRow(Icons.description_outlined, 'File Name', controller.fileName.value.isNotEmpty ? controller.fileName.value : '—'),
              _divider(),
              _infoRow(Icons.sd_storage_outlined, 'File Size', controller.fileSizeText.value.isNotEmpty ? controller.fileSizeText.value : '—'),
              _divider(),
              _infoRow(Icons.insert_drive_file_outlined, 'File Type', controller.fileType.value.isNotEmpty ? controller.fileType.value : 'IMAGE'),
              _divider(),
              _infoRow(
                Icons.verified_outlined,
                'Status',
                isUploadedOnServer ? controller.documentStatus.value : 'Ready to Submit',
                highlightStatus: true,
              ),
              _divider(),
              _infoRow(Icons.access_time, 'Uploaded On', controller.uploadedOnText, isLast: true),
            ],
          );
        },
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value, {bool isLast = false, bool highlightStatus = false}) {
    Color valColor = Colors.white;
    if (highlightStatus) {
      final v = value.toLowerCase();
      if (v.contains('verified')) {
        valColor = const Color(0xFF10B981);
      } else if (v.contains('rejected')) {
        valColor = const Color(0xFFEF4444);
      } else {
        valColor = const Color(0xFFF59E0B);
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
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
              style: TextStyle(color: valColor, fontSize: 12.5, fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withValues(alpha: 0.06), height: 1);

  Widget _buildTipsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kPurple.withValues(alpha: 0.25)),
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
                Text('• Ensure all details are clearly visible.', style: TextStyle(color: Colors.white54, fontSize: 11)),
                SizedBox(height: 3),
                Text('• Document should be original and valid.', style: TextStyle(color: Colors.white54, fontSize: 11)),
                SizedBox(height: 3),
                Text('• Avoid glare and blurry images.', style: TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Footer (Retake/Replace / Submit / Delete) ----------------
  Widget _buildFooterButtons() {
    return Obx(() {
      final isExistingOnServer = controller.remoteUrl.value.isNotEmpty && controller.filePath.value.isEmpty;
      final isLocked = controller.isReadOnly;

      if (isLocked) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
          decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06)))),
          child: GestureDetector(
            onTap: controller.onBackPressed,
            child: Container(
              height: 50,
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock_outline, color: Color(0xFF10B981), size: 16),
                  SizedBox(width: 6),
                  Text('Document Verified & Locked', style: TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        );
      }

      if (isExistingOnServer) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
          decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06)))),
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
                      border: Border.all(color: kPurple.withValues(alpha: 0.5)),
                    ),
                    alignment: Alignment.center,
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.edit_outlined, color: kPurple, size: 15),
                        SizedBox(width: 6),
                        Text('Replace Document', style: TextStyle(color: kPurple, fontSize: 12.5, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                ),
              ),
              if (controller.existingDocumentId != null && controller.existingDocumentId!.isNotEmpty) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: controller.onDeleteDocument,
                    child: Container(
                      height: 50,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
                      ),
                      alignment: Alignment.center,
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 15),
                          SizedBox(width: 6),
                          Text('Remove', style: TextStyle(color: Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      }

      // Case: Fresh document picked, ready to submit
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
        decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06)))),
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
                    border: Border.all(color: kPurple.withValues(alpha: 0.5)),
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
              child: GestureDetector(
                onTap: controller.isSubmitting.value ? null : controller.onSubmitDocument,
                child: Container(
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [kPurple, kBlue]),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: controller.isSubmitting.value
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Submit Document', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                            SizedBox(width: 6),
                            Icon(Icons.check_circle_outline, color: Colors.white, size: 16),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }
}
