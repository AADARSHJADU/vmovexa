import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import '../../../../../theme/app_theme.dart';
import 'incident_details_view.dart' show IncidentDetailsView;

class ReviewIncidentView extends GetView<ReportIncidentController> {
  const ReviewIncidentView({super.key});

  static const Color kBg = IncidentDetailsView.kBg;
  static const Color kCardBg = IncidentDetailsView.kCardBg;
  static const Color kFieldBg = IncidentDetailsView.kFieldBg;
  static const Color kPurple = IncidentDetailsView.kPurple;
  static const Color kIndigo = IncidentDetailsView.kIndigo;
  static const Color kBlue = IncidentDetailsView.kBlue;
  static const Color kBorder = IncidentDetailsView.kBorder;

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
                  _buildStepper(),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  const Text('Review Your Report', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  const Text('Please review all the information below before submitting.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
                  const SizedBox(height: 16),
                  _buildReviewCard(),
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
          onTap: controller.onStep3BackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Report Incident', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('Review the details before submitting.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
            ],
          ),
        ),
        const Icon(Icons.assignment_outlined, color: kPurple, size: 20),
      ],
    );
  }

  Widget _buildStepper() {
    return Obx(
      () => Row(
        children: List.generate(controller.stepLabels.length, (index) {
          final stepNumber = index + 1;
          final isActive = stepNumber == controller.currentStep.value;
          final isCompleted = stepNumber < controller.currentStep.value;
          final isLast = stepNumber == controller.stepLabels.length;

          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: (isActive || isCompleted) ? const LinearGradient(colors: [kIndigo, kPurple]) : null,
                          color: (isActive || isCompleted) ? null : kFieldBg,
                          border: Border.all(color: isActive ? kPurple : (isCompleted ? Colors.transparent : Colors.white24), width: isActive ? 2 : 1),
                        ),
                        child: isCompleted
                            ? const Icon(Icons.check, color: Colors.white, size: 14)
                            : Text('$stepNumber', style: TextStyle(color: isActive ? Colors.white : Colors.white38, fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        controller.stepLabels[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(color: isActive ? kPurple : Colors.white38, fontSize: 9, fontWeight: isActive ? FontWeight.w700 : FontWeight.w500),
                      ),
                    ],
                  ),
                ),
                if (!isLast)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 18),
                    child: SizedBox(width: 14, child: Divider(color: isCompleted ? kPurple : Colors.white24, thickness: 1.5)),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- Single flat review card ----------------
  Widget _buildReviewCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
      child: Obx(
        () => Column(
          children: [
            _ReviewRow(
              icon: controller.selectedIncidentType.value?.icon ?? Icons.warning_amber_rounded,
              title: controller.selectedIncidentType.value?.label ?? '—',
              subtitle: controller.selectedIncidentType.value?.description ?? '',
              label: 'Incident Type',
            ),
            _divider(),
            _ReviewRow(
              icon: Icons.description_outlined,
              title: controller.descriptionCtrl.text.trim().isEmpty ? '—' : controller.descriptionCtrl.text.trim(),
              label: 'Incident Description',
            ),
            _divider(),
            _ReviewRow(
              icon: Icons.location_on_outlined,
              title: controller.locationCtrl.text,
              label: 'Location',
            ),
            _divider(),
            _ReviewRow(
              icon: Icons.calendar_today_outlined,
              title: '${controller.incidentDateText}  \u2022  ${controller.incidentDateText}',
              label: 'Date & Time',
            ),
            _divider(),
            _ReviewRow(
              icon: Icons.warning_amber_rounded,
              iconColor: controller.severity.value.color,
              title: controller.severity.value.label,
              subtitle: controller.severity.value.description,
              label: 'Severity',
            ),
            _divider(),
            _ReviewRow(
              icon: Icons.groups_outlined,
              title: controller.affectedPartiesText,
              label: 'Affected Parties',
            ),
            _divider(),
            _ReviewRow(
              icon: Icons.build_outlined,
              title: controller.immediateActionCtrl.text.trim().isEmpty ? '—' : controller.immediateActionCtrl.text.trim(),
              label: 'Immediate Action Taken',
            ),
            _divider(),
            _buildPhotosRow(),
            _divider(),
            _ReviewRow(
              icon: Icons.phone_outlined,
              title: controller.contactPreferenceText,
              subtitle: (controller.wantsContact.value == true && controller.contactNumberCtrl.text.trim().isNotEmpty)
                  ? controller.contactNumberCtrl.text.trim()
                  : null,
              label: 'Contact Preference',
              isLast: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotosRow() {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.photo_library_outlined, color: kPurple, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Photos', style: TextStyle(color: Colors.white38, fontSize: 10.5)),
                const SizedBox(height: 2),
                Obx(
                  () => Text(
                    controller.photoPaths.isEmpty ? 'No photos uploaded' : '${controller.photoPaths.length} Photos Uploaded',
                    style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
                  ),
                ),
                Obx(() {
                  if (controller.photoPaths.isEmpty) return const SizedBox();
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: SizedBox(
                      height: 46,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: controller.photoPaths.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 6),
                        itemBuilder: (context, index) => ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            width: 46,
                            height: 46,
                            color: Colors.white10,
                            child: const Icon(Icons.image_outlined, color: Colors.white24, size: 18),
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withOpacity(0.06), height: 1, indent: 14, endIndent: 14);

  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06)))),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: controller.onStep3BackPressed,
              child: Container(
                height: 50,
                decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.1))),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.arrow_back, color: Colors.white70, size: 16),
                    SizedBox(width: 6),
                    Text('Back', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Obx(
              () => GestureDetector(
                onTap: controller.isSubmitting.value ? null : controller.onSubmitIncident,
                child: Container(
                  height: 50,
                  decoration: BoxDecoration(  gradient:AppTheme.primaryGradient, borderRadius: BorderRadius.circular(12)),
                  alignment: Alignment.center,
                  child: controller.isSubmitting.value
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Submit Incident', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
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

// =====================================================================
// Review row (icon + label + title + optional subtitle)
// =====================================================================
class _ReviewRow extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final String label;
  final String title;
  final String? subtitle;
  final bool isLast;

  const _ReviewRow({
    required this.icon,
    this.iconColor,
    required this.label,
    required this.title,
    this.subtitle,
    this.isLast = false,
  });

  static const Color kPurple = ReviewIncidentView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: (iconColor ?? kPurple).withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor ?? kPurple, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                const SizedBox(height: 2),
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
                if (subtitle != null && subtitle!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(subtitle!, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
