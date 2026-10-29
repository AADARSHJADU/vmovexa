import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controllers/add_fleet_controller.dart';

class AddFleetView extends GetView<AddFleetController> {
  const AddFleetView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoadingData.value) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.primaryButtonBlue),
                  SizedBox(height: 16),
                  Text(
                    'Loading fleet details...',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // 1. Top Bar
              _buildTopBar(),

              // Scrollable Form Body
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  child: Form(
                    key: controller.formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Mode Notice Banner
                        _buildModeNoticeBanner(),
                        const SizedBox(height: 16),

                        // Validation Errors Summary Banner
                        _buildValidationErrorsBanner(),

                        // Section 1: Fleet Division & Enterprise Details
                        _buildSection1FleetDetails(),
                        const SizedBox(height: 20),

                        // Section 2: Operator & Contact Person Credentials
                        _buildSection2ContactCredentials(),
                        const SizedBox(height: 20),

                        // Section 3: Base Hub & Operational Schedule
                        _buildSection3BaseHubSchedule(context),
                        const SizedBox(height: 20),

                        // Section 4: Operational Targets & Quotas
                        _buildSection4Quotas(),
                        const SizedBox(height: 20),

                        // Section 5: Brand Logo / Media
                        _buildSection5BrandLogo(context),
                        const SizedBox(height: 20),

                        // Section 6: Enterprise Compliance & KYC Papers
                        _buildSection6KYCPapers(context),
                        const SizedBox(height: 28),

                        // Bottom Action Buttons
                        _buildBottomActions(),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ---------------- 1. Top Bar ----------------
  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Obx(
            () => Text(
              controller.isEditMode.value ? 'Edit Fleet Operator' : 'Add Fleet Operator',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.info_outline_rounded, color: Colors.white70, size: 22),
            onPressed: () => _showHelpBottomSheet(),
          ),
        ],
      ),
    );
  }

  // ---------------- Mode & Approval Banner ----------------
  Widget _buildModeNoticeBanner() {
    return Obx(() {
      final isAdmin = controller.isPlatformAdmin.value;
      final isEdit = controller.isEditMode.value;

      final Color bgColor = isAdmin
          ? const Color(0x1A10B981)
          : isEdit
              ? const Color(0x1A3B82F6)
              : const Color(0x1AF59E0B);
      final Color borderColor = isAdmin
          ? const Color(0x4D10B981)
          : isEdit
              ? const Color(0x4D3B82F6)
              : const Color(0x4DF59E0B);
      final Color textColor = isAdmin
          ? const Color(0xFF10B981)
          : isEdit
              ? const Color(0xFF60A5FA)
              : const Color(0xFFFBBF24);

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor, width: 1.2),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              isAdmin
                  ? Icons.bolt_rounded
                  : isEdit
                      ? Icons.edit_note_rounded
                      : Icons.hourglass_top_rounded,
              color: textColor,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAdmin
                        ? (isEdit ? 'Platform Admin Mode — Live Edit Access' : 'Platform Admin Mode — Auto Approval Active')
                        : (isEdit ? 'Fleet Manager Mode — Profile Edit' : 'Fleet Manager Mode — Submission Enters Admin Queue'),
                    style: TextStyle(
                      color: textColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    isAdmin
                        ? (isEdit
                            ? 'Changes immediately update database records across all transit operations.'
                            : 'Fleets created by Admin are auto-approved and immediately active across all systems.')
                        : (isEdit
                            ? 'Profile updates are saved. Operational quota changes will be synchronized.'
                            : 'Newly registered fleets enter "Pending Review" until verified by a Platform Administrator.'),
                    style: TextStyle(
                      color: textColor.withValues(alpha: 0.85),
                      fontSize: 11,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  // ---------------- Top Validation Errors Banner ----------------
  Widget _buildValidationErrorsBanner() {
    return Obx(() {
      if (controller.fieldErrors.isEmpty) return const SizedBox.shrink();

      return Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0x26EF4444),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0x80EF4444), width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: Color(0xFFF87171), size: 18),
                const SizedBox(width: 8),
                Text(
                  'Please fix the following ${controller.fieldErrors.length} error(s):',
                  style: const TextStyle(
                    color: Color(0xFFF87171),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ...controller.fieldErrors.values.map(
              (msg) => Padding(
                padding: const EdgeInsets.only(left: 26, top: 2),
                child: Text(
                  '• $msg',
                  style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 11),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  // ---------------- Section 1: Fleet Division & Enterprise Details ----------------
  Widget _buildSection1FleetDetails() {
    return _buildCardContainer(
      icon: Icons.apartment_rounded,
      iconColor: const Color(0xFF3B82F6),
      iconBg: const Color(0x263B82F6),
      title: '1. Fleet Division & Enterprise Details',
      subtitle: 'Core division naming, classification, and scope description.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Fleet Name *
          _buildFieldLabel('Fleet Operator / Company Name', isRequired: true),
          _buildInput(
            controller: controller.nameController,
            hintText: 'e.g. VMOVEXA Transit Services',
            prefixIcon: Icons.business_rounded,
            errorKey: 'name',
          ),
          const SizedBox(height: 14),

          // Code & Fleet Type Row
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Fleet Code (Optional)'),
                    _buildInput(
                      controller: controller.codeController,
                      hintText: 'e.g. FLT-BLR-01',
                      prefixIcon: Icons.tag_rounded,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Fleet Classification'),
                    Obx(
                      () => _buildDropdown(
                        value: controller.selectedFleetType.value,
                        items: controller.fleetTypes,
                        onChanged: (val) {
                          if (val != null) controller.selectedFleetType.value = val;
                        },
                        prefixIcon: Icons.directions_bus_rounded,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Operational Description
          _buildFieldLabel('Fleet Operational Description'),
          _buildInput(
            controller: controller.descController,
            hintText: 'Brief description of routes served, service level targets, and transit scope...',
            prefixIcon: Icons.notes_rounded,
            maxLines: 3,
          ),
        ],
      ),
    );
  }

  // ---------------- Section 2: Operator & Contact Person Credentials ----------------
  Widget _buildSection2ContactCredentials() {
    return _buildCardContainer(
      icon: Icons.person_rounded,
      iconColor: const Color(0xFFA855F7),
      iconBg: const Color(0x26A855F7),
      title: '2. Operator & Contact Person Credentials',
      subtitle: 'Fleet lead, primary email, mobile phone, and login access.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Contact Person Name
          _buildFieldLabel('Contact Person Name'),
          _buildInput(
            controller: controller.contactPersonController,
            hintText: 'Full Name (e.g. Ramesh Kumar)',
            prefixIcon: Icons.badge_outlined,
          ),
          const SizedBox(height: 14),

          // Email & Phone
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Email Address', isRequired: true),
                    _buildInput(
                      controller: controller.emailController,
                      hintText: 'operator@vmovexa.com',
                      prefixIcon: Icons.alternate_email_rounded,
                      keyboardType: TextInputType.emailAddress,
                      errorKey: 'email',
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Mobile Phone', isRequired: true),
                    _buildInput(
                      controller: controller.phoneController,
                      hintText: '+91 98765 43210',
                      prefixIcon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      errorKey: 'phone',
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Designation & Department
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Designation / Clearance'),
                    _buildInput(
                      controller: controller.designationController,
                      hintText: 'Fleet Operator Lead',
                      prefixIcon: Icons.work_outline_rounded,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Department'),
                    _buildInput(
                      controller: controller.departmentController,
                      hintText: 'Transit Operations',
                      prefixIcon: Icons.domain_rounded,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Password Field
          Obx(
            () => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFieldLabel(
                  controller.isEditMode.value
                      ? 'Security Access PIN / Password (Optional)'
                      : 'Initial Access Password',
                ),
                _buildInput(
                  controller: controller.passwordController,
                  hintText: controller.isEditMode.value
                      ? 'Leave blank to keep unchanged'
                      : 'Enter login password (min. 6 chars)',
                  prefixIcon: Icons.lock_outline_rounded,
                  obscureText: !controller.isPasswordVisible.value,
                  suffixIcon: IconButton(
                    icon: Icon(
                      controller.isPasswordVisible.value
                          ? Icons.visibility_off_rounded
                          : Icons.visibility_rounded,
                      color: Colors.white70,
                      size: 20,
                    ),
                    onPressed: controller.togglePasswordVisibility,
                  ),
                  errorKey: 'password',
                ),
                const SizedBox(height: 4),
                Text(
                  controller.isEditMode.value
                      ? 'Leave blank if you do not want to reset credentials.'
                      : 'Temporary access credentials assigned to operator.',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Section 3: Base Hub & Operational Schedule ----------------
  Widget _buildSection3BaseHubSchedule(BuildContext context) {
    return _buildCardContainer(
      icon: Icons.location_on_rounded,
      iconColor: const Color(0xFF10B981),
      iconBg: const Color(0x2610B981),
      title: '3. Base Hub & Operational Schedule',
      subtitle: 'Home depot facility, regional hub, timezone, and operating hours.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Home Depot Dropdown (From API)
          _buildFieldLabel('Assigned Home Depot Base', isRequired: true),
          Obx(() {
            if (controller.isLoadingDepots.value) {
              return Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: AppColors.inputBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.inputBorder),
                ),
                child: const Row(
                  children: [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.blueAccent),
                    ),
                    SizedBox(width: 12),
                    Text(
                      'Loading home depots...',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                  ],
                ),
              );
            }

            if (controller.depotsList.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.inputBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.inputBorder),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: Colors.amber, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'No depots found. Using Central Transit Hub base.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              );
            }

            final currentId = controller.selectedDepotId.value;
            return Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: controller.fieldErrors.containsKey('depotId')
                      ? const Color(0xFFEF4444)
                      : AppColors.inputBorder,
                  width: 1.2,
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<dynamic>(
                  value: currentId,
                  dropdownColor: const Color(0xFF161926),
                  icon: const Icon(Icons.arrow_drop_down_rounded, color: Colors.white70),
                  isExpanded: true,
                  hint: const Text('Select Depot Base', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                  items: controller.depotsList.map((DepotItemModel d) {
                    final label = d.code.isNotEmpty ? '${d.name} (${d.code})' : d.name;
                    return DropdownMenuItem<dynamic>(
                      value: d.id,
                      child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
                    );
                  }).toList(),
                  onChanged: (val) {
                    controller.selectedDepotId.value = val;
                    controller.fieldErrors.remove('depotId');
                  },
                ),
              ),
            );
          }),
          const SizedBox(height: 14),

          // Primary Hub Location & Timezone
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Primary Hub Location', isRequired: true),
                    _buildInput(
                      controller: controller.locationController,
                      hintText: 'e.g. Bangalore Central Hub',
                      prefixIcon: Icons.map_rounded,
                      errorKey: 'location',
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Time Zone'),
                    _buildInput(
                      controller: controller.timeZoneController,
                      hintText: 'Asia/Kolkata (IST)',
                      prefixIcon: Icons.access_time_rounded,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Shift Presets & Working Hours (Exact match to Admin Panel)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildFieldLabel('Working Shift Hours', isRequired: true),
              Obx(
                () => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0x1A3B82F6),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0x4D3B82F6)),
                  ),
                  child: Text(
                    controller.workingHours.value,
                    style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Shift Chips
          Obx(
            () => Wrap(
              spacing: 8,
              runSpacing: 8,
              children: controller.shiftPresets.map((preset) {
                final isSelected = controller.selectedShiftPreset.value == preset.label;
                return GestureDetector(
                  onTap: () => controller.selectShiftPreset(preset),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF2563EB) : AppColors.cardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                        width: 1.2,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(preset.icon, style: const TextStyle(fontSize: 12)),
                        const SizedBox(width: 6),
                        Text(
                          preset.label,
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.textSecondary,
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Custom Shift Time Picker Box
          Obx(() {
            if (controller.selectedShiftPreset.value != 'Custom Shift') {
              return const SizedBox.shrink();
            }

            return Container(
              margin: const EdgeInsets.only(top: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0x4D3B82F6)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildTimePickerButton(
                      context: context,
                      label: 'Start Time',
                      time: controller.customStartTime.value,
                      onTimeSelected: (t) => controller.updateCustomTime(start: t),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTimePickerButton(
                      context: context,
                      label: 'End Time',
                      time: controller.customEndTime.value,
                      onTimeSelected: (t) => controller.updateCustomTime(end: t),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // ---------------- Section 4: Operational Targets & Quotas ----------------
  Widget _buildSection4Quotas() {
    return _buildCardContainer(
      icon: Icons.track_changes_rounded,
      iconColor: const Color(0xFFF59E0B),
      iconBg: const Color(0x26F59E0B),
      title: '4. Operational Targets & Quotas',
      subtitle: 'Target bus fleet capacity and active driver headcount.',
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFieldLabel('Allowed Bus Capacity (Max Buses)', isRequired: true),
                _buildInput(
                  controller: controller.assignedBusesController,
                  hintText: '50',
                  prefixIcon: Icons.directions_bus_filled_rounded,
                  keyboardType: TextInputType.number,
                  errorKey: 'assignedBuses',
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFieldLabel('Allowed Driver Headcount', isRequired: true),
                _buildInput(
                  controller: controller.activeDriversController,
                  hintText: '65',
                  prefixIcon: Icons.groups_rounded,
                  keyboardType: TextInputType.number,
                  errorKey: 'activeDriversCount',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Section 5: Brand Logo / Media ----------------
  Widget _buildSection5BrandLogo(BuildContext context) {
    return _buildCardContainer(
      icon: Icons.photo_camera_rounded,
      iconColor: const Color(0xFF06B6D4),
      iconBg: const Color(0x2606B6D4),
      title: '5. Fleet Brand Logo & Media',
      subtitle: 'Upload fleet logo or operator profile picture (PNG/JPG up to 2MB).',
      child: Obx(
        () => Row(
          children: [
            // Logo Preview Box
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder, width: 1.5),
              ),
              child: controller.avatarUrl.value.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.network(
                        ApiConstants.resolveFileUrl(controller.avatarUrl.value),
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => const Center(
                          child: Icon(Icons.broken_image_rounded, color: Colors.white54, size: 28),
                        ),
                      ),
                    )
                  : const Center(
                      child: Icon(Icons.directions_bus_rounded, color: AppColors.textMuted, size: 36),
                    ),
            ),
            const SizedBox(width: 16),

            // Upload Action Button
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    side: const BorderSide(color: AppColors.cardBorder, width: 1.2),
                    backgroundColor: AppColors.inputBg,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ).copyWith(
                    foregroundColor: const WidgetStatePropertyAll(Colors.white),
                  ).let(
                    (style) => ElevatedButton(
                      style: style,
                      onPressed: controller.isUploadingLogo.value
                          ? null
                          : () => _showMediaSourceSheet(
                                context: context,
                                onSourceSelected: controller.pickAndUploadLogo,
                              ),
                      child: controller.isUploadingLogo.value
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.cloud_upload_outlined, size: 18, color: Color(0xFF38BDF8)),
                                SizedBox(width: 8),
                                Text(
                                  'Upload Logo / Photo',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Division insignia displayed on vehicle trackers & staff badges.',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Section 6: Enterprise Compliance & KYC Papers ----------------
  Widget _buildSection6KYCPapers(BuildContext context) {
    return _buildCardContainer(
      icon: Icons.assignment_outlined,
      iconColor: const Color(0xFF6366F1),
      iconBg: const Color(0x266366F1),
      title: '6. Enterprise Compliance & KYC Papers',
      subtitle: 'Upload registration papers, permits, and certificates.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 4 Category Cards Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.45,
            ),
            itemCount: controller.kycCategories.length,
            itemBuilder: (context, idx) {
              final category = controller.kycCategories[idx];
              return Obx(() {
                final isUploaded = controller.documentsList.any(
                  (FleetDocumentModel d) => d.category == category || d.purpose == category,
                );

                return GestureDetector(
                  onTap: () => _showMediaSourceSheet(
                    context: context,
                    onSourceSelected: (src) => controller.pickAndUploadDocument(category, src),
                  ),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUploaded ? const Color(0x1A10B981) : AppColors.inputBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isUploaded ? const Color(0xFF10B981) : AppColors.cardBorder,
                        width: 1.2,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: isUploaded ? const Color(0x3310B981) : const Color(0x1A3B82F6),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                isUploaded ? Icons.check_circle_rounded : Icons.description_outlined,
                                color: isUploaded ? const Color(0xFF10B981) : const Color(0xFF60A5FA),
                                size: 16,
                              ),
                            ),
                            Text(
                              isUploaded ? 'Uploaded' : 'Pending',
                              style: TextStyle(
                                color: isUploaded ? const Color(0xFF10B981) : AppColors.textMuted,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          category,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          isUploaded ? 'Tap to replace' : 'Tap to upload',
                          style: TextStyle(
                            color: isUploaded ? const Color(0xFF34D399) : const Color(0xFF60A5FA),
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              });
            },
          ),
          const SizedBox(height: 14),

          // Uploaded Documents List
          Obx(() {
            if (controller.documentsList.isEmpty) {
              return const SizedBox.shrink();
            }

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Uploaded Documents (${controller.documentsList.length})',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                ...controller.documentsList.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final doc = entry.value;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.inputBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.file_present_rounded, color: Color(0xFF60A5FA), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                doc.category,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                doc.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                          onPressed: () => controller.removeDocument(idx),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            );
          }),
        ],
      ),
    );
  }

  // ---------------- Bottom Action Buttons ----------------
  Widget _buildBottomActions() {
    return Obx(() {
      final isSubmitting = controller.isSubmitting.value;
      final isEdit = controller.isEditMode.value;
      final isAdmin = controller.isPlatformAdmin.value;

      final btnText = isSubmitting
          ? (isEdit ? 'Saving Changes...' : 'Creating Fleet...')
          : isEdit
              ? 'Save Fleet Changes'
              : isAdmin
                  ? 'Create Fleet (Auto-Approve)'
                  : 'Submit Fleet for Approval';

      return Column(
        children: [
          CustomButton(
            text: btnText,
            isLoading: isSubmitting,
            onTap: controller.submitFleet,
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () => Get.back(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder, width: 1.2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'Cancel',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      );
    });
  }

  // ---------------- UI Helpers ----------------
  Widget _buildCardContainer({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: AppColors.cardBorder, height: 1),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String label, {bool isRequired = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (isRequired)
            const Text(
              ' *',
              style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
            ),
        ],
      ),
    );
  }

  Widget _buildInput({
    required TextEditingController controller,
    required String hintText,
    IconData? prefixIcon,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    int maxLines = 1,
    String? errorKey,
  }) {
    // return Obx(() {
      final hasError = errorKey != null && this.controller.fieldErrors.containsKey(errorKey);
      final errorMsg = hasError ? this.controller.fieldErrors[errorKey] : null;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: maxLines > 1 ? 10 : 0),
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: hasError ? const Color(0xFFEF4444) : AppColors.inputBorder,
                width: 1.2,
              ),
            ),
            child: Row(
              crossAxisAlignment: maxLines > 1 ? CrossAxisAlignment.start : CrossAxisAlignment.center,
              children: [
                if (prefixIcon != null) ...[
                  Icon(prefixIcon, color: hasError ? const Color(0xFFEF4444) : AppColors.textMuted, size: 18),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: TextField(
                    controller: controller,
                    maxLines: maxLines,
                    obscureText: obscureText,
                    keyboardType: keyboardType,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
                    decoration: InputDecoration(
                      hintText: hintText,
                      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    onChanged: (val) {
                      if (errorKey != null && this.controller.fieldErrors.containsKey(errorKey)) {
                        this.controller.fieldErrors.remove(errorKey);
                      }
                    },
                  ),
                ),
                ?suffixIcon,
              ],


            ),
          ),
          if (errorMsg != null)
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 4),
              child: Text(
                '⚠️ $errorMsg',
                style: const TextStyle(color: Color(0xFFEF4444), fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      );
    // });
  }

  Widget _buildDropdown({
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    IconData? prefixIcon,
  }) {
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.inputBorder, width: 1.2),
      ),
      child: Row(
        children: [
          if (prefixIcon != null) ...[
            Icon(prefixIcon, color: AppColors.textMuted, size: 18),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value,
                dropdownColor: const Color(0xFF161926),
                icon: const Icon(Icons.arrow_drop_down_rounded, color: Colors.white70),
                isExpanded: true,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                items: items.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: onChanged,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimePickerButton({
    required BuildContext context,
    required String label,
    required TimeOfDay time,
    required ValueChanged<TimeOfDay> onTimeSelected,
  }) {
    return GestureDetector(
      onTap: () async {
        final picked = await showTimePicker(
          context: context,
          initialTime: time,
          builder: (ctx, child) {
            return Theme(
              data: ThemeData.dark().copyWith(
                colorScheme: const ColorScheme.dark(
                  primary: Color(0xFF2563EB),
                  surface: Color(0xFF161926),
                  onSurface: Colors.white,
                ),
              ),
              child: child!,
            );
          },
        );
        if (picked != null) onTimeSelected(picked);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.access_time_rounded, color: Color(0xFF60A5FA), size: 14),
                const SizedBox(width: 6),
                Text(
                  time.format(context),
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showMediaSourceSheet({
    required BuildContext context,
    required ValueChanged<ImageSource> onSourceSelected,
  }) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF161926),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Attachment Source',
              style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Choose camera capture or photo gallery from device:',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 18),
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: Color(0x263B82F6),
                child: Icon(Icons.camera_alt_rounded, color: Color(0xFF3B82F6), size: 20),
              ),
              title: const Text('Capture with Camera', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              onTap: () {
                Get.back();
                onSourceSelected(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: Color(0x2610B981),
                child: Icon(Icons.photo_library_rounded, color: Color(0xFF10B981), size: 20),
              ),
              title: const Text('Choose from Gallery', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              onTap: () {
                Get.back();
                onSourceSelected(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showHelpBottomSheet() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(22),
        decoration: const BoxDecoration(
          color: Color(0xFF161926),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.help_outline_rounded, color: Color(0xFF60A5FA), size: 20),
                SizedBox(width: 8),
                Text(
                  'Fleet Registration Guidelines',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              '• All fleets require an official name and assigned home depot for terminal dispatch.\n'
              '• Assigned buses and driver headcounts represent operational quotas allocated by platform administrators.\n'
              '• Uploading valid KYC documents (Registration & Transport License) speeds up verification and approval.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
            ),
            const SizedBox(height: 16),
            CustomButton(
              text: 'Got It',
              onTap: () => Get.back(),
              height: 46,
            ),
          ],
        ),
      ),
    );
  }
}

extension LetExtension<T> on T {
  R let<R>(R Function(T it) block) => block(this);
}
