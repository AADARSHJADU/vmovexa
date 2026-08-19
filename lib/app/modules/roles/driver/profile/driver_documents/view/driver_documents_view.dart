import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/model/document_requirement_model.dart';
import '../controller/driver_documents_controller.dart';

class DriverDocumentsView extends GetView<DriverDocumentsController> {
  const DriverDocumentsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.documents.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 4),
                      const Text(
                        'Upload clear and valid documents to keep your profile verified.',
                        style: TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                      const SizedBox(height: 18),
                      const Text('Required Documents', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      _buildDocumentsList(),
                      const SizedBox(height: 14),
                      _buildFormatNote(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
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
          child: Text('Driver Documents', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
        ),
        GestureDetector(
          onTap: controller.onInfoTap,
          child: const Icon(Icons.info_outline, color: kPurple, size: 20),
        ),
      ],
    );
  }

  Widget _buildDocumentsList() {
    return Obx(
      () => Column(
        children: controller.documents
            .map(
              (doc) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _DocumentCard(document: doc, onTap: () => controller.onDocumentTap(doc)),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _buildFormatNote() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kPurple.withOpacity(0.25)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: kPurple, size: 15),
          SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Accepted formats: PDF, JPG, PNG', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
                SizedBox(height: 2),
                Text('Max file size: 5MB', style: TextStyle(color: Colors.white38, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Document card
// =====================================================================
class _DocumentCard extends StatelessWidget {
  final DocumentRequirement document;
  final VoidCallback onTap;

  const _DocumentCard({required this.document, required this.onTap});

  static const Color kCardBg = DriverDocumentsView.kCardBg;
  static const Color kFieldBg = DriverDocumentsView.kFieldBg;
  static const Color kPurple = DriverDocumentsView.kPurple;
  static const Color kBorder = DriverDocumentsView.kBorder;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(document.icon, color: kPurple, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RichText(
                    text: TextSpan(
                      text: document.title,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                      children: document.isMandatory
                          ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))]
                          : [],
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    document.isMandatory ? 'Mandatory' : 'Optional',
                    style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600),
                  ),
                  if (document.validTillText != null) ...[
                    const SizedBox(height: 2),
                    Text(document.validTillText!, style: const TextStyle(color: Colors.white38, fontSize: 10)),
                  ],
                ],
              ),
            ),
            document.status == DocumentReqStatus.notUploaded
                ? Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: kPurple.withOpacity(0.6)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(document.status.icon, color: kPurple, size: 13),
                        const SizedBox(width: 4),
                        Text(document.status.label, style: const TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  )
                : Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: document.status.color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(document.status.label, style: TextStyle(color: document.status.color, fontSize: 10.5, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 4),
                        Icon(document.status.icon, color: document.status.color, size: 12),
                      ],
                    ),
                  ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}
