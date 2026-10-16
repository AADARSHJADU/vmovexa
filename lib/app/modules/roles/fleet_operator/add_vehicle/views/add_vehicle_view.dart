import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controllers/add_vehicle_controller.dart';

class AddVehicleView extends GetView<AddVehicleController> {
  const AddVehicleView({super.key});

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
                    'Loading vehicle details & fleet options...',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // Top App Bar
              _buildTopBar(context),

              // Form Scrollable Body
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

                        // Section 1: Fleet & Base Information
                        _buildSection1FleetAndBase(context),
                        const SizedBox(height: 22),

                        // Section 2: Route & Crew Assignment
                        _buildSection2RouteAndCrew(context),
                        const SizedBox(height: 22),

                        // Section 3: Vehicle Compliance Documents
                        _buildSection3Documents(context),
                        const SizedBox(height: 22),

                        // Section 4: Display Screen Configuration (The exact Display feature!)
                        _buildSection4DisplayScreens(context),
                        const SizedBox(height: 22),

                        // Section 5: GPS Hardware & Operational Status
                        _buildSection5GpsAndStatus(context),
                        const SizedBox(height: 22),

                        // Section 6: Bus Photos Gallery
                        _buildSection6Photos(context),
                        const SizedBox(height: 28),

                        // Bottom Actions: Save / Register
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
  Widget _buildTopBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          CustomBackButton(onTap: () => Get.back()),
          Obx(
            () => Text(
              controller.isEditMode.value ? 'Edit Vehicle Profile' : 'Add Vehicle',
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

  // ---------------- Mode Notice Banner ----------------
  Widget _buildModeNoticeBanner() {
    return Obx(() {
      final isEdit = controller.isEditMode.value;
      final Color bgColor = isEdit ? const Color(0x1A3B82F6) : const Color(0x1A10B981);
      final Color borderColor = isEdit ? const Color(0x4D3B82F6) : const Color(0x4D10B981);
      final Color textColor = isEdit ? const Color(0xFF60A5FA) : const Color(0xFF34D399);

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Icon(isEdit ? Icons.edit_note_rounded : Icons.directions_bus_rounded, color: textColor, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isEdit
                    ? 'Editing Vehicle: ${controller.regNoController.text.isNotEmpty ? controller.regNoController.text : "Commercial Bus"}'
                    : 'Register new commercial transit vehicle and advertising display screen hardware.',
                style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildValidationErrorsBanner() {
    return Obx(() {
      final errors = controller.fieldErrors.values.toList();
      if (errors.isEmpty) return const SizedBox.shrink();

      return Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0x1AEF4444),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0x4DEF4444)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 16),
                SizedBox(width: 6),
                Text(
                  'Please correct the following fields:',
                  style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ...errors.map((err) => Padding(
                  padding: const EdgeInsets.only(left: 22, top: 2),
                  child: Text('• $err', style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 11)),
                )),
          ],
        ),
      );
    });
  }

  // ---------------- Section 1: Fleet & Base Information ----------------
  Widget _buildSection1FleetAndBase(BuildContext context) {
    return _buildCardWrapper(
      title: '1. Fleet & Vehicle Identity',
      icon: Icons.directions_bus_outlined,
      children: [
        // Fleet Assignment Dropdown
        _buildLabel('Assigned Fleet Division *'),
        Obx(() {
          final items = controller.fleetsList;
          final currentVal = controller.selectedFleetId.value;
          final fallback = controller.initialFleetName.value.isNotEmpty
              ? controller.initialFleetName.value
              : (currentVal != null ? 'Fleet #$currentVal' : null);
          return _buildDropdownContainer(
            value: currentVal,
            hint: 'Select Fleet Division',
            fallbackLabel: fallback,
            items: items.map((f) => DropdownMenuItem(value: f.id.toString(), child: Text(f.name))).toList(),
            onChanged: (val) {
              controller.selectedFleetId.value = val?.toString();
              controller.fieldErrors.remove('fleetId');
            },
          );
        }),
        const SizedBox(height: 14),

        // Assigned Depot Dropdown
        _buildLabel('Assigned Home Depot Base *'),
        Obx(() {
          final items = controller.depotsList;
          final currentVal = controller.selectedDepotId.value;
          final fallback = controller.initialDepotName.value.isNotEmpty
              ? controller.initialDepotName.value
              : (currentVal != null ? 'Depot #$currentVal' : null);
          return _buildDropdownContainer(
            value: currentVal,
            hint: 'Select Home Depot',
            fallbackLabel: fallback,
            items: items.map((d) => DropdownMenuItem(value: d.id.toString(), child: Text('${d.name} (${d.city})'))).toList(),
            onChanged: (val) {
              controller.selectedDepotId.value = val?.toString();
              controller.fieldErrors.remove('depotId');
            },
          );
        }),
        const SizedBox(height: 14),

        // Registration Plate & Chassis/VIN
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Registration Plate *'),
                  _buildTextField(
                    controller: controller.regNoController,
                    hint: 'e.g. MP09-CV-9821',
                    errorKey: 'plate',
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Chassis / VIN *'),
                  _buildTextField(
                    controller: controller.chassisNoController,
                    hint: 'e.g. MB1AA4567890',
                    errorKey: 'vin',
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Model & Capacity
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Model Number *'),
                  _buildTextField(
                    controller: controller.modelNoController,
                    hint: 'e.g. Starbus Ultra EV',
                    errorKey: 'model',
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Capacity (Seats) *'),
                  _buildTextField(
                    controller: controller.capacityController,
                    hint: '42',
                    keyboardType: TextInputType.number,
                    errorKey: 'capacity',
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Vehicle Classification Pills
        _buildLabel('Vehicle Classification *'),
        SizedBox(
          height: 38,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: controller.vehicleTypes.length,
            itemBuilder: (ctx, idx) {
              final t = controller.vehicleTypes[idx];
              return Obx(() {
                final isSelected = controller.selectedVehicleType.value == t;
                return GestureDetector(
                  onTap: () => controller.selectedVehicleType.value = t,
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF6366F1).withValues(alpha: 0.15) : AppColors.cardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                        width: 1.2,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      t,
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ),
                );
              });
            },
          ),
        ),
        const SizedBox(height: 14),

        // Fuel Type Dropdown
        _buildLabel('Fuel / Power Propulsion *'),
        Obx(
          () => _buildDropdownContainer(
            value: controller.selectedFuelType.value,
            hint: 'Select Fuel Type',
            items: controller.fuelTypes.map((ft) {
              final label = ft == 'electric' ? 'Electric EV Battery' : ft.toUpperCase();
              return DropdownMenuItem(value: ft, child: Text(label));
            }).toList(),
            onChanged: (val) {
              if (val != null) controller.selectedFuelType.value = val;
            },
          ),
        ),
      ],
    );
  }

  // ---------------- Section 2: Route & Crew Assignment ----------------
  Widget _buildSection2RouteAndCrew(BuildContext context) {
    return _buildCardWrapper(
      title: '2. Route & Crew Assignment',
      icon: Icons.alt_route_rounded,
      children: [
        _buildLabel('Assigned Transit Route *'),
        Obx(() {
          final routes = controller.routesList;
          final currentVal = controller.selectedRouteId.value;
          final fallback = controller.initialRouteName.value.isNotEmpty
              ? controller.initialRouteName.value
              : (currentVal != null ? 'Route #$currentVal' : null);
          return _buildDropdownContainer(
            value: currentVal,
            hint: 'Select Transit Route',
            fallbackLabel: fallback,
            items: routes.map((r) {
              final distStr = r.totalDistanceKm > 0 ? ' (${r.totalDistanceKm} km)' : '';
              return DropdownMenuItem(value: r.id.toString(), child: Text('${r.name}$distStr'));
            }).toList(),
            onChanged: (val) => controller.onRouteChanged(val),
          );
        }),
        const SizedBox(height: 14),

        // Source & Destination
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Source Station *'),
                  _buildTextField(
                    controller: controller.sourceController,
                    hint: 'e.g. Indiranagar Central',
                    errorKey: 'source',
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Destination Terminal *'),
                  _buildTextField(
                    controller: controller.destController,
                    hint: 'e.g. Majestic Kempegowda',
                    errorKey: 'destination',
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Assigned Driver
        _buildLabel('Designated Primary Driver'),
        Obx(() {
          final drivers = controller.driversList;
          final currentVal = controller.selectedDriverId.value;
          final fallback = controller.initialDriverName.value.isNotEmpty
              ? controller.initialDriverName.value
              : (currentVal != null ? 'Driver #$currentVal' : null);
          return _buildDropdownContainer(
            value: currentVal,
            hint: 'Unassigned (Select Driver)',
            fallbackLabel: fallback,
            items: [
              const DropdownMenuItem(value: null, child: Text('Unassigned (Select Driver)')),
              ...drivers.map((d) => DropdownMenuItem(value: d.id.toString(), child: Text('${d.name} (${d.phone})'))),
            ],
            onChanged: (val) => controller.selectedDriverId.value = val?.toString(),
          );
        }),
      ],
    );
  }

  // ---------------- Section 3: Vehicle Compliance Documents ----------------
  Widget _buildSection3Documents(BuildContext context) {
    return _buildCardWrapper(
      title: '3. Compliance & Legal Documents',
      icon: Icons.verified_outlined,
      children: [
        const Text(
          'Attach vehicle registration, fitness certificate, and commercial permits:',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
        const SizedBox(height: 14),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.35,
          children: [
            _buildDocCard(context, 'rc', 'Registration (RC)'),
            _buildDocCard(context, 'fitness', 'Fitness Certificate'),
            _buildDocCard(context, 'transport_license', 'Transport License'),
            _buildDocCard(context, 'insurance', 'Insurance Policy'),
          ],
        ),
      ],
    );
  }

  Widget _buildDocCard(BuildContext context, String docType, String title) {
    return Obx(() {
      final doc = controller.documentsMap[docType];
      final isUploaded = doc != null && doc.url.isNotEmpty;

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isUploaded ? const Color(0x1A10B981) : AppColors.inputBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isUploaded ? const Color(0x4D10B981) : AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(
                  isUploaded ? Icons.check_circle_rounded : Icons.cloud_upload_outlined,
                  color: isUploaded ? const Color(0xFF10B981) : AppColors.textSecondary,
                  size: 20,
                ),
                if (isUploaded)
                  GestureDetector(
                    onTap: () => controller.removeDocument(docType),
                    child: const Icon(Icons.close_rounded, color: Colors.white54, size: 16),
                  ),
              ],
            ),
            Text(
              title,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            if (isUploaded)
              const Text(
                'Uploaded ✓',
                style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
              )
            else
              GestureDetector(
                onTap: () => _showMediaSourceSheet(
                  context: context,
                  onSourceSelected: (src) => controller.pickAndUploadDocument(docType, src),
                ),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryButtonBlue.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.primaryButtonBlue.withValues(alpha: 0.4)),
                  ),
                  child: const Text(
                    'Upload',
                    style: TextStyle(color: AppColors.textLink, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
          ],
        ),
      );
    });
  }

  // ---------------- Section 4: Display Screen Configuration (The exact Display feature!) ----------------
  Widget _buildSection4DisplayScreens(BuildContext context) {
    return _buildCardWrapper(
      title: '4. Display Screen Configuration',
      icon: Icons.tv_rounded,
      children: [
        const Text(
          'Configure advertising LED & LCD display screens installed across transit bus compartments:',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
        const SizedBox(height: 14),

        // Schematic Graphic of bus
        Container(
          height: 140,
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.inputBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Image.asset(
            'assets/images/bus-image1.png',
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => const Center(
              child: Icon(Icons.directions_bus_filled_rounded, color: Color(0xFF60A5FA), size: 48),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Total Displays Header Row
        Obx(
          () => Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0x1A2563EB),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0x332563EB)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Display Screens',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${controller.totalDisplays} ',
                    //Screens Installed
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),

        // 4 Display Screen Placement Counters (+ / -)
        Obx(
          () => Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: _buildCounterItem(
                      'Left Side Displays',
                      controller.leftDisplay.value,
                      controller.incrementLeft,
                      controller.decrementLeft,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildCounterItem(
                      'Right Side Displays',
                      controller.rightDisplay.value,
                      controller.incrementRight,
                      controller.decrementRight,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildCounterItem(
                      'Rear Window Display',
                      controller.rearDisplay.value,
                      controller.incrementRear,
                      controller.decrementRear,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildCounterItem(
                      'Emergency Exit Display',
                      controller.emergencyDisplay.value,
                      controller.incrementEmergency,
                      controller.decrementEmergency,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCounterItem(String label, int count, VoidCallback onInc, VoidCallback onDec) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Row(
            children: [
              GestureDetector(
                onTap: onDec,
                child: Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: const Icon(Icons.remove, color: Colors.white, size: 14),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  '$count',
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
              GestureDetector(
                onTap: onInc,
                child: Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: AppColors.primaryButtonBlue,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.add, color: Colors.white, size: 14),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Section 5: GPS Hardware & Operational Status ----------------
  Widget _buildSection5GpsAndStatus(BuildContext context) {
    return _buildCardWrapper(
      title: '5. Telematics Hardware & Status',
      icon: Icons.sensors_rounded,
      children: [
        _buildLabel('IoT GPS Telematics Hardware'),
        Obx(() {
          final gpsList = controller.gpsList;
          final currentVal = controller.selectedGpsDeviceId.value;
          final fallback = currentVal != null && currentVal.isNotEmpty ? 'GPS Device ($currentVal)' : null;
          return _buildDropdownContainer(
            value: currentVal,
            hint: 'Select GPS Hardware Unit',
            fallbackLabel: fallback,
            items: [
              const DropdownMenuItem(value: null, child: Text('Unassigned (Select GPS Unit)')),
              ...gpsList.map((g) {
                final serial = g.serialNumber.isNotEmpty ? g.serialNumber : (g.deviceName.isNotEmpty ? g.deviceName : g.id.toString());
                return DropdownMenuItem(value: serial, child: Text('$serial (${g.status.toUpperCase()})'));
              }),
            ],
            onChanged: (val) => controller.selectedGpsDeviceId.value = val?.toString(),
          );
        }),
        const SizedBox(height: 14),

        _buildLabel('Operational Duty Status *'),
        Obx(
          () => Row(
            children: [
              _buildStatusPill('active', 'Active Live', const Color(0xFF10B981)),
              const SizedBox(width: 8),
              _buildStatusPill('in_depot', 'In Depot', const Color(0xFF38BDF8)),
              const SizedBox(width: 8),
              _buildStatusPill('maintenance', 'Maintenance', const Color(0xFFF59E0B)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusPill(String statusKey, String label, Color color) {
    final isSelected = controller.status.value.toLowerCase() == statusKey.toLowerCase();
    return Expanded(
      child: GestureDetector(
        onTap: () => controller.status.value = statusKey,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: isSelected ? color.withValues(alpha: 0.15) : AppColors.inputBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? color : AppColors.cardBorder,
              width: 1.2,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? color : AppColors.textSecondary,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  // ---------------- Section 6: Bus Photos Gallery ----------------
  Widget _buildSection6Photos(BuildContext context) {
    return _buildCardWrapper(
      title: '6. Bus Photos & Media',
      icon: Icons.photo_library_outlined,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Attach exterior & interior\nphotographs of the vehicle:',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
            GestureDetector(
              onTap: () => _showMediaSourceSheet(
                context: context,
                onSourceSelected: controller.pickAndUploadBusPhoto,
              ),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.primaryButtonBlue,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.add_a_photo_rounded, color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text('Add Photo', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        Obx(() {
          final photos = controller.busPhotos;
          if (photos.isEmpty) {
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: const Text(
                'No photographs added yet. Tap "Add Photo" to attach bus images.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            );
          }

          return SizedBox(
            height: 90,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: photos.length,
              separatorBuilder: (context, index) => const SizedBox(width: 10),
              itemBuilder: (ctx, idx) {
                final photoUrl = photos[idx];
                final resolved = ApiConstants.resolveFileUrl(photoUrl);

                return Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: Colors.black26,
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Image.network(
                          resolved,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(
                            child: Icon(Icons.broken_image_rounded, color: Colors.white38),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => controller.removeBusPhoto(idx),
                        child: Container(
                          padding: const EdgeInsets.all(3),
                          decoration: const BoxDecoration(
                            color: Colors.black87,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close, color: Colors.white, size: 12),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          );
        }),
      ],
    );
  }

  // ---------------- Bottom Actions ----------------
  Widget _buildBottomActions() {
    return Obx(() {
      final isSubmitting = controller.isSubmitting.value;
      final isEdit = controller.isEditMode.value;

      final btnText = isSubmitting
          ? (isEdit ? 'Saving Changes...' : 'Registering Vehicle...')
          : isEdit
              ? 'Save Vehicle Changes'
              : 'Register Vehicle';

      return Column(
        children: [
          CustomButton(
            text: btnText,
            isLoading: isSubmitting,
            onTap: controller.submitVehicle,
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

  // ---------------- UI Helper Builders ----------------
  Widget _buildCardWrapper({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF60A5FA), size: 18),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required String errorKey,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Obx(() {
      final hasError = this.controller.fieldErrors.containsKey(errorKey);
      return Container(
        height: 46,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: AppColors.inputBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: hasError ? const Color(0xFFEF4444) : AppColors.inputBorder,
            width: 1.2,
          ),
        ),
        alignment: Alignment.center,
        child: TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            border: InputBorder.none,
            isDense: true,
          ),
          onChanged: (_) => this.controller.fieldErrors.remove(errorKey),
        ),
      );
    });
  }

  Widget _buildDropdownContainer({
    required dynamic value,
    required String hint,
    required List<DropdownMenuItem<dynamic>> items,
    required ValueChanged<dynamic> onChanged,
    String? fallbackLabel,
  }) {
    final String? valStr = value?.toString();

    // 1. Deduplicate items by string value to prevent duplicate item assertions
    final seen = <String?>{};
    final uniqueItems = <DropdownMenuItem<dynamic>>[];
    for (final item in items) {
      final key = item.value?.toString();
      if (!seen.contains(key)) {
        seen.add(key);
        uniqueItems.add(item);
      }
    }

    // 2. Resolve matched value
    dynamic matchedValue;
    if (valStr != null && valStr.isNotEmpty && valStr != 'null') {
      for (final item in uniqueItems) {
        if (item.value != null && item.value.toString() == valStr) {
          matchedValue = item.value;
          break;
        }
      }
      // If the value is present but not in items (e.g. data still loading or custom ID),
      // synthesize a fallback item so Flutter never asserts
      if (matchedValue == null) {
        final label = fallbackLabel ?? 'Selected ($valStr)';
        final fallbackItem = DropdownMenuItem<dynamic>(
          value: value,
          child: Text(label, style: const TextStyle(color: Colors.white70)),
        );
        uniqueItems.insert(0, fallbackItem);
        matchedValue = value;
      }
    } else {
      // value is null
      final hasNullItem = uniqueItems.any((i) => i.value == null);
      if (hasNullItem) {
        matchedValue = null;
      }
    }

    return Container(
      height: 46,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.inputBorder, width: 1.2),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<dynamic>(
          value: matchedValue,
          hint: Text(hint, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          dropdownColor: const Color(0xFF161926),
          icon: const Icon(Icons.arrow_drop_down_rounded, color: Colors.white70),
          isExpanded: true,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          items: uniqueItems,
          onChanged: onChanged,
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
              leading: const Icon(Icons.camera_alt_rounded, color: Color(0xFF60A5FA)),
              title: const Text('Capture with Camera', style: TextStyle(color: Colors.white, fontSize: 13)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              tileColor: AppColors.cardBg,
              onTap: () {
                Get.back();
                onSourceSelected(ImageSource.camera);
              },
            ),
            const SizedBox(height: 10),
            ListTile(
              leading: const Icon(Icons.photo_library_rounded, color: Color(0xFF34D399)),
              title: const Text('Choose from Gallery', style: TextStyle(color: Colors.white, fontSize: 13)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              tileColor: AppColors.cardBg,
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
                  'Vehicle Registration Guide',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              '• Enter the official registration plate and chassis / VIN number matching the RC.\n'
              '• Select the assigned home depot and transit route for dispatching and passenger tracking.\n'
              '• Configure the advertising display screens count installed on the left, right, rear, and emergency exit.\n'
              '• Upload legal compliance documents (RC, Fitness, Insurance) to pass platform inspection.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.45),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Get.back(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryButtonBlue,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Got It', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
