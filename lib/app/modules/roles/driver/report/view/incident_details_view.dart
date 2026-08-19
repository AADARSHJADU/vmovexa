import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../model/incident_type_model.dart';

class IncidentDetailsView extends GetView<ReportIncidentController> {
  const IncidentDetailsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);

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
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  _buildSectionLabel('1. Select Incident Type', required: true),
                  const SizedBox(height: 10),
                  _buildIncidentTypeGrid(),
                  const SizedBox(height: 20),
                  _buildSectionLabel('2. Incident Description', required: true),
                  const SizedBox(height: 10),
                  _buildDescriptionField(),
                  const SizedBox(height: 20),
                  _buildSectionLabel('3. Incident Location', required: true),
                  const SizedBox(height: 10),
                  _buildLocationRow(),
                  const SizedBox(height: 20),
                  _buildSectionLabel('4. Date & Time', required: true),
                  const SizedBox(height: 10),
                  _buildDateTimeRow(context),
                  const SizedBox(height: 20),
                  _buildSectionLabel('5. Add Photos (Optional)', required: false),
                  const SizedBox(height: 10),
                  _buildPhotosRow(),
                  const SizedBox(height: 8),
                  const Text('You can upload up to 5 photos', style: TextStyle(color: Colors.white38, fontSize: 11)),
                ],
              ),
            ),
            _buildFooterButtons(),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onCancel,
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

  // ---------------- Stepper (4 steps: Location removed) ----------------
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
                            : Text(
                                '$stepNumber',
                                style: TextStyle(color: isActive ? Colors.white : Colors.white38, fontSize: 12, fontWeight: FontWeight.w700),
                              ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        controller.stepLabels[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isActive ? kPurple : Colors.white38,
                          fontSize: 9,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isLast)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 18),
                    child: SizedBox(
                      width: 14,
                      child: Divider(color: isCompleted ? kPurple : Colors.white24, thickness: 1.5),
                    ),
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
        style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700),
        children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
      ),
    );
  }

  // ---------------- Incident type grid ----------------
  Widget _buildIncidentTypeGrid() {
    return Obx(() {
      final selectedType = controller.selectedIncidentType.value;
      final error = controller.incidentTypeError.value;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: IncidentType.values.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (context, index) {
              final type = IncidentType.values[index];

              final isSelected = selectedType == type;

              return _IncidentTypeCard(
                // key: ValueKey(type),
                type: type,
                isSelected: isSelected,
                onTap: () {
                  controller.selectIncidentType(type);
                },
              );
            },
          ),

          if (error != null && error.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              error,
              style: const TextStyle(
                color: Color(0xFFFF4D4D),
                fontSize: 10.5,
              ),
            ),
          ],
        ],
      );
    });
  }
  /*Widget _buildIncidentTypeGrid() {
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: IncidentType.values.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (context, index) {
              final type = IncidentType.values[index];
              final isSelected = controller.selectedIncidentType.value == type;
              return _IncidentTypeCard(
                type: type,
                isSelected: isSelected,
                onTap: () => controller.selectIncidentType(type),
              );
            },
          ),
          if (controller.incidentTypeError.value != null) ...[
            const SizedBox(height: 6),
            Text(controller.incidentTypeError.value!, style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5)),
          ],
        ],
      ),
    );
  }*/

  // ---------------- Description field ----------------
  Widget _buildDescriptionField() {
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: controller.descriptionError.value != null ? const Color(0xFFFF4D4D) : Colors.white.withOpacity(0.08),
              ),
            ),
            child: TextField(
              controller: controller.descriptionCtrl,
              maxLines: 3,
              maxLength: ReportIncidentController.descriptionMaxLen,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                border: InputBorder.none,
                counterText: '',
                isDense: true,
                contentPadding: EdgeInsets.all(12),
                hintText: 'Provide a brief description of the incident...',
                hintStyle: TextStyle(color: Colors.white30, fontSize: 12.5),
                prefixIcon: Padding(
                  padding: EdgeInsets.only(bottom: 40),
                  child: Icon(Icons.description_outlined, color: Colors.white24, size: 16),
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (controller.descriptionError.value != null)
                Expanded(
                  child: Text(controller.descriptionError.value!, style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5)),
                )
              else
                const SizedBox(),
              Text('${controller.descriptionLen.value}/${ReportIncidentController.descriptionMaxLen}', style: const TextStyle(color: Colors.white24, fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Location field (editable) ----------------
  Widget _buildLocationRow() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: TextField(
        controller: controller.locationCtrl,
        style: const TextStyle(color: Colors.white, fontSize: 12.5),
        decoration: const InputDecoration(
          border: InputBorder.none,
          isDense: true,
          contentPadding: EdgeInsets.symmetric(vertical: 13),
          hintText: 'Enter incident location',
          hintStyle: TextStyle(color: Colors.white30, fontSize: 12.5),
          prefixIcon: Icon(Icons.location_on_outlined, color: kPurple, size: 17),
        ),
      ),
    );
  }

  // ---------------- Date & Time row (tap date -> calendar, tap time -> clock) ----------------
  Widget _buildDateTimeRow(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Obx(
        () => Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => controller.onPickDate(context),
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, color: kPurple, size: 15),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        controller.incidentDateText,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 12.5),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: GestureDetector(
                onTap: () => controller.onPickTime(context),
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    const Icon(Icons.access_time, color: kPurple, size: 15),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        controller.incidentTimeText,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 12.5),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Photos row ----------------
  Widget _buildPhotosRow() {
    return Obx(
      () => SizedBox(
        height: 78,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: [
            GestureDetector(
              onTap: controller.onUploadPhoto,
              child: Container(
                width: 78,
                height: 78,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: kPurple.withOpacity(0.5), style: BorderStyle.solid),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.cloud_upload_outlined, color: kPurple, size: 20),
                    SizedBox(height: 4),
                    Text('Upload\nPhoto', textAlign: TextAlign.center, style: TextStyle(color: kPurple, fontSize: 9, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
            ...controller.photoPaths.map(
              (path) => Padding(
                padding: const EdgeInsets.only(left: 10),
                child: Stack(
                  children: [
                    Container(
                      width: 78,
                      height: 78,
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.image_outlined, color: Colors.white24, size: 24),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => controller.onRemovePhoto(path),
                        child: Container(
                          padding: const EdgeInsets.all(3),
                          decoration: const BoxDecoration(color: Colors.black87, shape: BoxShape.circle),
                          child: const Icon(Icons.close, color: Colors.white, size: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Footer (Cancel + Next) ----------------
  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: controller.onCancel,
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.arrow_back, color: Colors.white70, size: 16),
                    SizedBox(width: 6),
                    Text('Cancel', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: GestureDetector(
              onTap: controller.onStep1NextPressed,
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  gradient:AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
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
// Incident type selection card
// =====================================================================
class _IncidentTypeCard extends StatelessWidget {
  final IncidentType type;
  final bool isSelected;
  final VoidCallback onTap;

  const _IncidentTypeCard({required this.type, required this.isSelected, required this.onTap});

  static const Color kPurple = IncidentDetailsView.kPurple;
  static const Color kFieldBg = IncidentDetailsView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isSelected ? kPurple : Colors.white.withOpacity(0.08), width: isSelected ? 1.5 : 1),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(type.icon, color: isSelected ? kPurple : Colors.white54, size: 22),
                const SizedBox(height: 6),
                Text(
                  type.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontSize: 10, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  type.description,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white30, fontSize: 8),
                ),
              ],
            ),
          ),
          if (isSelected)
            Positioned(
              top: 6,
              right: 6,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle),
                child: const Icon(Icons.check, color: Colors.white, size: 10),
              ),
            ),
        ],
      ),
    );
  }
}
