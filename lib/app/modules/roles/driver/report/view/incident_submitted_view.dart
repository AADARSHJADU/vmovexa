import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import '../../../../../theme/app_theme.dart';
import 'incident_details_view.dart' show IncidentDetailsView;

class IncidentSubmittedView extends GetView<ReportIncidentController> {
  const IncidentSubmittedView({super.key});

  static const Color kBg = IncidentDetailsView.kBg;
  static const Color kCardBg = IncidentDetailsView.kCardBg;
  static const Color kFieldBg = IncidentDetailsView.kFieldBg;
  static const Color kPurple = IncidentDetailsView.kPurple;
  static const Color kIndigo = IncidentDetailsView.kIndigo;
  static const Color kBlue = IncidentDetailsView.kBlue;
  static const Color kBorder = IncidentDetailsView.kBorder;
  static const Color kGreen = Color(0xFF2ECC71);

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
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                children: [
                  _buildSuccessBadge(),
                  const SizedBox(height: 16),
                  const Text(
                    'Incident Reported Successfully!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Thank you for helping us keep operations safe and improve the system.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  const SizedBox(height: 18),
                  _buildDetailsCard(),
                  const SizedBox(height: 16),
                  _buildWhatsNextCard(),
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
          onTap: controller.onGoToHome,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Report Incident', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('Your incident has been submitted successfully.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
            ],
          ),
        ),
        const Icon(Icons.assignment_outlined, color: kPurple, size: 20),
      ],
    );
  }

  // ---------------- Stepper (all steps completed) ----------------
  Widget _buildStepper() {
    return Row(
      children: List.generate(controller.stepLabels.length, (index) {
        final isLast = index == controller.stepLabels.length - 1;
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
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(colors: [kIndigo, kPurple]),
                      ),
                      child: const Icon(Icons.check, color: Colors.white, size: 14),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      controller.stepLabels[index],
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: kPurple, fontSize: 9, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              if (!isLast)
                Padding(
                  padding: const EdgeInsets.only(bottom: 18),
                  child: SizedBox(width: 14, child: Divider(color: kPurple, thickness: 1.5)),
                ),
            ],
          ),
        );
      }),
    );
  }

  // ---------------- Success badge (report icon + ring + decorative dots) ----------------
  Widget _buildSuccessBadge() {
    return SizedBox(
      width: 120,
      height: 120,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ..._buildDots(),
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: kPurple.withOpacity(0.5), width: 2),
            ),
            child: const Icon(Icons.assignment_turned_in_outlined, color: kPurple, size: 34),
          ),
          Positioned(
            bottom: 4,
            right: 4,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(color: kGreen, shape: BoxShape.circle, border: Border.all(color: kBg, width: 2)),
              child: const Icon(Icons.check, color: Colors.white, size: 12),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDots() {
    const positions = [
      Alignment(-0.85, -0.65),
      Alignment(0.9, -0.5),
      Alignment(-0.95, 0.25),
      Alignment(0.8, 0.7),
      Alignment(-0.3, 0.95),
    ];
    return positions
        .map(
          (a) => Align(
            alignment: a,
            child: Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(color: kBlue.withOpacity(0.8), shape: BoxShape.circle),
            ),
          ),
        )
        .toList();
  }

  // ---------------- Details card ----------------
  Widget _buildDetailsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
      child: Obx(
        () => Column(
          children: [
            _detailRow(
              icon: Icons.confirmation_number_outlined,
              label: 'Incident ID',
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(controller.incidentId.value, style: const TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w700)),
                  const SizedBox(width: 4),
                  const Icon(Icons.copy_outlined, color: kPurple, size: 13),
                ],
              ),
            ),
            _divider(),
            _detailRow(icon: Icons.calendar_today_outlined, label: 'Date & Time', value: controller.submittedOnText),
            _divider(),
            _detailRow(icon: Icons.location_on_outlined, label: 'Location',
                value: controller.locationCtrl.text),
            _divider(),
            _detailRow(
              icon: Icons.warning_amber_rounded,
              label: 'Incident Type',
              value: controller.selectedIncidentType.value?.label ?? '—',
            ),
            _divider(),
            _detailRow(
              icon: Icons.speed_outlined,
              label: 'Severity',
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(color: controller.severity.value.color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 6, height: 6, decoration: BoxDecoration(color: controller.severity.value.color, shape: BoxShape.circle)),
                    const SizedBox(width: 5),
                    Text(controller.severity.value.label, style: TextStyle(color: controller.severity.value.color, fontSize: 10.5, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              isLast: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withOpacity(0.06), height: 1);

  Widget _detailRow({
    required IconData icon,
    required String label,
    String? value,
    Widget? trailing,
    bool isLast = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: kPurple, size: 15),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12))),
          trailing ?? Text(value ?? '—', style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  // ---------------- "What happens next?" card ----------------
  Widget _buildWhatsNextCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('What happens next?', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          _nextStepRow(icon: Icons.visibility_outlined, title: 'Review', description: 'Our team will review the incident.'),
          const SizedBox(height: 12),
          _nextStepRow(icon: Icons.bolt_outlined, title: 'Action', description: 'Appropriate action will be taken.'),
          const SizedBox(height: 12),
          _nextStepRow(icon: Icons.notifications_none_rounded, title: 'Update', description: 'You\'ll be notified of any important updates.'),
        ],
      ),
    );
  }

  Widget _nextStepRow({required IconData icon, required String title, required String description}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(9)),
          child: Icon(icon, color: kPurple, size: 16),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(description, style: const TextStyle(color: Colors.white54, fontSize: 11)),
            ],
          ),
        ),
      ],
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
            onTap: controller.onGoToHome,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(gradient:AppTheme.primaryGradient, borderRadius: BorderRadius.circular(12)),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.home_outlined, color: Colors.white, size: 17),
                  SizedBox(width: 8),
                  Text('Go to Home', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: controller.onShareReport,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kPurple),
              ),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.share_outlined, color: kPurple, size: 16),
                  SizedBox(width: 8),
                  Text('Share Report', style: TextStyle(color: kPurple, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
