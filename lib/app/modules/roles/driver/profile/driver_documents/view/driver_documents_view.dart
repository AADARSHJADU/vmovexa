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
  static const Color kIndigo = Color(0xFF6366F1);
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
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 12),

                      // Driver KYC & DL Summary Metric Cards (matching website)
                      _buildSummaryMetrics(),

                      // Rejection Alert Banner if rejected
                      if (controller.isRejected.value) ...[
                        const SizedBox(height: 12),
                        _buildRejectionBanner(),
                      ],

                      const SizedBox(height: 18),
                      _buildDocumentsHeader(),
                      const SizedBox(height: 10),
                      _buildDocumentsList(),
                      const SizedBox(height: 14),
                      _buildFormatNote(),
                      const SizedBox(height: 24),
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
          child: const Padding(
            padding: EdgeInsets.all(4.0),
            child: Icon(Icons.arrow_back, color: Colors.white),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('Driver Documents', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                  const SizedBox(width: 8),
                  _buildStatusBadge(),
                ],
              ),
              const SizedBox(height: 2),
              const Text(
                'Commercial driving license & KYC compliance attachments',
                style: TextStyle(color: Colors.white54, fontSize: 11),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
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

  Widget _buildStatusBadge() {
    return Obx(() {
      if (controller.isRejected.value) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFFEF4444).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(5),
            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
          ),
          child: const Text('REJECTED', style: TextStyle(color: Color(0xFFEF4444), fontSize: 8.5, fontWeight: FontWeight.bold)),
        );
      }
      if (controller.isVerified.value) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(5),
            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
          ),
          child: const Text('VERIFIED', style: TextStyle(color: Color(0xFF10B981), fontSize: 8.5, fontWeight: FontWeight.bold)),
        );
      }
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
        ),
        child: const Text('PENDING REVIEW', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 8.5, fontWeight: FontWeight.bold)),
      );
    });
  }

  // ---------------- Summary Metric Cards (DL No, Bus, Shift, Validity) ----------------
  Widget _buildSummaryMetrics() {
    return Obx(() {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: _metricBox(
                    label: 'DL NUMBER',
                    value: controller.dlNumber.value,
                    subtext: 'Commercial heavy DL',
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _metricBox(
                    label: 'ASSIGNED BUS',
                    value: controller.assignedBus.value,
                    subtext: 'Active vehicle',
                    color: const Color(0xFF38BDF8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _metricBox(
                    label: 'ACTIVE SHIFT',
                    value: controller.activeShift.value,
                    subtext: 'Roster duty',
                    color: const Color(0xFF10B981),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _metricBox(
                    label: 'DL VALIDITY',
                    value: controller.dlStatus.value,
                    subtext: 'Exp: ${controller.dlExpiry.value}',
                    color: const Color(0xFFFBBF24),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _metricBox({
    required String label,
    required String value,
    required String subtext,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 12.5, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 1),
          Text(subtext, style: const TextStyle(color: Colors.white30, fontSize: 9.5), maxLines: 1),
        ],
      ),
    );
  }

  Widget _buildRejectionBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Documents Verification Rejected',
                  style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  controller.rejectionReason.value.isNotEmpty
                      ? controller.rejectionReason.value
                      : 'Please re-upload clear and legible document photos.',
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Compliance & Legal Attachments',
          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
        ),
        Obx(() {
          final uploadedCount = controller.documents.where((d) => d.status != DocumentReqStatus.notUploaded).length;
          final totalCount = controller.documents.length;
          return Text(
            '$uploadedCount / $totalCount Attached',
            style: const TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w600),
          );
        }),
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
                child: _DocumentCard(
                  document: doc,
                  onTap: () => controller.onDocumentTap(doc),
                  onDelete: doc.status != DocumentReqStatus.notUploaded && doc.status != DocumentReqStatus.uploaded
                      ? () => controller.deleteDocument(doc.id)
                      : null,
                ),
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
        border: Border.all(color: kPurple.withValues(alpha: 0.2)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle_outline, color: kPurple, size: 15),
          SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Supported formats: JPG, PNG, PDF', style: TextStyle(color: Colors.white70, fontSize: 11)),
                SizedBox(height: 1),
                Text('File size up to 10MB • Clear and readable photos required', style: TextStyle(color: Colors.white38, fontSize: 10.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Document card with live attachment information
// =====================================================================
class _DocumentCard extends StatelessWidget {
  final DocumentRequirement document;
  final VoidCallback onTap;
  final VoidCallback? onDelete;

  const _DocumentCard({
    required this.document,
    required this.onTap,
    this.onDelete,
  });

  static const Color kCardBg = DriverDocumentsView.kCardBg;
  static const Color kFieldBg = DriverDocumentsView.kFieldBg;
  static const Color kPurple = DriverDocumentsView.kPurple;
  static const Color kBorder = DriverDocumentsView.kBorder;

  @override
  Widget build(BuildContext context) {
    final isUploaded = document.status != DocumentReqStatus.notUploaded;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isUploaded
                ? document.status.color.withValues(alpha: 0.25)
                : kBorder,
            width: 1.2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Leading Icon Box
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: document.status.color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(document.icon, color: document.status.color, size: 18),
                ),
                const SizedBox(width: 10),

                // Title, Category, and Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: RichText(
                              text: TextSpan(
                                text: document.title,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                                children: document.isMandatory
                                    ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D), fontWeight: FontWeight.bold))]
                                    : [],
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              document.isMandatory ? 'Mandatory' : 'Optional',
                              style: const TextStyle(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        document.category,
                        style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                      ),
                    ],
                  ),
                ),

                // Right Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: document.status.color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: document.status.color.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(document.status.icon, color: document.status.color, size: 11),
                      const SizedBox(width: 4),
                      Text(
                        document.status.label,
                        style: TextStyle(
                          color: document.status.color,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // If Document is Uploaded, Show File Details Box (matches web)
            if (isUploaded) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.insert_drive_file_outlined, color: Colors.white54, size: 15),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            document.fileName?.isNotEmpty == true ? document.fileName! : 'Attached File',
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 1),
                          Text(
                            [
                              if (document.fileSize?.isNotEmpty == true) document.fileSize!,
                              if (document.validTillText != null) document.validTillText!,
                            ].join(' • '),
                            style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                          ),
                        ],
                      ),
                    ),
                    // Action: View Preview
                    InkWell(
                      onTap: onTap,
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF38BDF8).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.visibility_outlined, color: Color(0xFF38BDF8), size: 12),
                            SizedBox(width: 4),
                            Text('View', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                    if (onDelete != null) ...[
                      const SizedBox(width: 6),
                      InkWell(
                        onTap: onDelete,
                        borderRadius: BorderRadius.circular(6),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 14),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ] else ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: kPurple.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: kPurple.withValues(alpha: 0.4)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.file_upload_outlined, color: kPurple, size: 13),
                        SizedBox(width: 4),
                        Text('Upload Document', style: TextStyle(color: kPurple, fontSize: 10.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
