import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import 'incident_details_view.dart' show IncidentDetailsView;

class AdditionalInformationView extends GetView<ReportIncidentController> {
  const AdditionalInformationView({super.key});

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
                  const Text('Additional Information', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  const Text('Provide more details to help us understand the incident better.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
                  const SizedBox(height: 18),
                  _buildSectionLabel('Incident Severity', required: true),
                  const SizedBox(height: 10),
                  _buildSeverityGrid(),
                  const SizedBox(height: 20),
                  _buildSectionLabel('Who was affected? (Select all that apply)', required: false),
                  const SizedBox(height: 10),
                  _buildAffectedPartiesGrid(),
                  const SizedBox(height: 20),
                  _buildSectionLabel('Any immediate action taken?', required: false),
                  const SizedBox(height: 10),
                  _buildImmediateActionField(),
                  const SizedBox(height: 20),
                  _buildSectionLabel('Would you like to be contacted for more details?', required: false),
                  const SizedBox(height: 10),
                  _buildContactPreferenceRow(),
                  Obx(() {
                    if (controller.wantsContact.value != true) return const SizedBox();
                    return Column(
                      children: [
                        const SizedBox(height: 14),
                        _buildSectionLabel('Contact Number (Optional)', required: false),
                        const SizedBox(height: 10),
                        _buildContactNumberField(),
                      ],
                    );
                  }),
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
          onTap: controller.onStep2BackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Report Incident', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('Help us keep operations safe and smooth.', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
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

  Widget _buildSectionLabel(String text, {required bool required}) {
    return RichText(
      text: TextSpan(
        text: text,
        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
        children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
      ),
    );
  }

  // ---------------- Severity 4-card grid ----------------
  Widget _buildSeverityGrid() {
    return Obx((){
      final selectedType = controller.severity.value;
      final error = controller.incidentTypeError.value;
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: IncidentSeverity.values.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.55,
        ),
        itemBuilder: (context, index) {
          final level = IncidentSeverity.values[index];
          final isSelected = selectedType == level;
          // final isSelected = controller.severity.value == level;
          return _SeverityCard(level: level, isSelected: isSelected,
              onTap: () => controller.setSeverity(level));
        },
      );
    });
  }

  // ---------------- Affected parties multi-select ----------------
  Widget _buildAffectedPartiesGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: AffectedParty.values.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 5,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 0.75,
      ),
      itemBuilder: (context, index) {
        final party = AffectedParty.values[index];

        return Obx((){
          final isSelected = controller.affectedParties.contains(party);
          return _AffectedPartyChip(
              party: party,
              isSelected: isSelected,
              onTap: () => controller.toggleAffectedParty(party));
        });
      },
    );
  }

  // ---------------- Immediate action textarea ----------------
  Widget _buildImmediateActionField() {
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: TextField(
              controller: controller.immediateActionCtrl,
              maxLines: 3,
              maxLength: ReportIncidentController.immediateActionMaxLen,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                border: InputBorder.none,
                counterText: '',
                isDense: true,
                contentPadding: EdgeInsets.all(12),
                hintText: 'Describe any actions you have taken so far...',
                hintStyle: TextStyle(color: Colors.white30, fontSize: 12.5),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              '${controller.immediateActionLen.value}/${ReportIncidentController.immediateActionMaxLen}',
              style: const TextStyle(color: Colors.white24, fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Yes / No contact preference ----------------
  Widget _buildContactPreferenceRow() {
    return Obx(
      () => Row(
        children: [
          Expanded(
            child: _ContactChoiceButton(
              icon: Icons.call_outlined,
              label: 'Yes',
              isSelected: controller.wantsContact.value == true,
              onTap: () => controller.setWantsContact(true),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _ContactChoiceButton(
              icon: Icons.phone_disabled_outlined,
              label: 'No',
              isSelected: controller.wantsContact.value == false,
              onTap: () => controller.setWantsContact(false),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactNumberField() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: TextField(
        controller: controller.contactNumberCtrl,
        keyboardType: TextInputType.phone,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: const InputDecoration(
          border: InputBorder.none,
          isDense: true,
          contentPadding: EdgeInsets.symmetric(vertical: 13),
          hintText: 'Enter contact number',
          hintStyle: TextStyle(color: Colors.white30, fontSize: 12.5),
          prefixIcon: Icon(Icons.phone_outlined, color: Colors.white24, size: 17),
        ),
      ),
    );
  }

  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(color: kBg, border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06)))),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: controller.onStep2BackPressed,
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
            child: GestureDetector(
              onTap: controller.onStep2NextPressed,
              child: Container(
                height: 50,
                decoration: BoxDecoration(gradient: const LinearGradient(colors: [kBlue, kPurple]), borderRadius: BorderRadius.circular(12)),
                alignment: Alignment.center,
                child: const Row(
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
        ],
      ),
    );
  }
}

// =====================================================================
// Severity card (Low / Medium / High / Critical)
// =====================================================================
class _SeverityCard extends StatelessWidget {
  final IncidentSeverity level;
  final bool isSelected;
  final VoidCallback onTap;

  const _SeverityCard({required this.level, required this.isSelected, required this.onTap});

  static const Color kFieldBg = AdditionalInformationView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isSelected ? level.color : Colors.white.withOpacity(0.08), width: isSelected ? 1.5 : 1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(level.icon, color: isSelected ? level.color : Colors.white54, size: 18),
                const SizedBox(height: 6),
                Text(level.label, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontSize: 12, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(level.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white30, fontSize: 8.5)),
              ],
            ),
          ),
          if (isSelected)
            Positioned(
              top: 6,
              right: 6,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(color: level.color, shape: BoxShape.circle),
                child: const Icon(Icons.check, color: Colors.white, size: 10),
              ),
            ),
        ],
      ),
    );
  }
}

// =====================================================================
// Affected party chip (Passengers / Driver / Vehicle / Infrastructure / Other)
// =====================================================================
class _AffectedPartyChip extends StatelessWidget {
  final AffectedParty party;
  final bool isSelected;
  final VoidCallback onTap;

  const _AffectedPartyChip({required this.party, required this.isSelected, required this.onTap});

  static const Color kPurple = AdditionalInformationView.kPurple;
  static const Color kFieldBg = AdditionalInformationView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        decoration: BoxDecoration(
          color: kFieldBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? kPurple : Colors.white.withOpacity(0.08), width: isSelected ? 1.5 : 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(party.icon, color: isSelected ? kPurple : Colors.white54, size: 16),
            const SizedBox(height: 3),
            Text(party.label, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: isSelected ? Colors.white : Colors.white54, fontSize: 8, fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: isSelected ? kPurple : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(color: isSelected ? kPurple : Colors.white24, width: 1.2),
              ),
              child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 9) : null,
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Contact preference choice button (Yes / No)
// =====================================================================
class _ContactChoiceButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ContactChoiceButton({required this.icon, required this.label, required this.isSelected, required this.onTap});

  static const Color kPurple = AdditionalInformationView.kPurple;
  static const Color kIndigo = AdditionalInformationView.kIndigo;
  static const Color kFieldBg = AdditionalInformationView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          gradient: isSelected ? const LinearGradient(colors: [kIndigo, kPurple]) : null,
          color: isSelected ? null : kFieldBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? Colors.transparent : Colors.white.withOpacity(0.08)),
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? Colors.white : Colors.white54, size: 15),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(color: isSelected ? Colors.white : Colors.white54, fontSize: 12.5, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}
