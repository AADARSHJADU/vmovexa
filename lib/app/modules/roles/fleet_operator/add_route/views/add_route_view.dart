import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import 'package:vmovexa/app/widgets/location_autocomplete_field.dart';
import 'package:vmovexa/app/widgets/route_map_viewer_widget.dart';
import '../controllers/add_route_controller.dart';

class AddRouteView extends GetView<AddRouteController> {
  const AddRouteView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Get.back(),
        ),
        title: Obx(() {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                controller.isEditMode.value ? 'Edit Transit Route' : 'Add Transit Route',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Text(
                'Corridor lines, stops & waypoints',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
              ),
            ],
          );
        }),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section 1: Route Identity
            _buildSection1Identity(),
            const SizedBox(height: 16),

            // Live Corridor Map Preview (Google Static Map & Polyline)
            _buildLiveMapPreview(),
            const SizedBox(height: 16),

            // Section 2: Origin & Destination Corridor
            _buildSection2Corridor(),
            const SizedBox(height: 16),

            // Section 3: Corridor Distance & Schedule Duration
            _buildSection3Metrics(),
            const SizedBox(height: 16),

            // Section 4: Waypoint Stops Management
            _buildSection4Stops(),
            const SizedBox(height: 24),

            // Submit & Cancel Buttons
            _buildActionButtons(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildLiveMapPreview() {
    return Obx(() {
      final sLat = controller.startLat.value != 0.0
          ? controller.startLat.value
          : double.tryParse(controller.startLatController.text.trim());
      final sLng = controller.startLng.value != 0.0
          ? controller.startLng.value
          : double.tryParse(controller.startLngController.text.trim());
      final eLat = controller.endLat.value != 0.0
          ? controller.endLat.value
          : double.tryParse(controller.endLatController.text.trim());
      final eLng = controller.endLng.value != 0.0
          ? controller.endLng.value
          : double.tryParse(controller.endLngController.text.trim());
      final dist = double.tryParse(controller.distanceController.text.trim());
      final dur = int.tryParse(controller.durationController.text.trim());

      return RouteMapViewerWidget(
        startLat: sLat,
        startLng: sLng,
        endLat: eLat,
        endLng: eLng,
        stops: controller.currentStopsCoordinates,
        polyline: controller.polyline.value,
        distanceKm: dist,
        durationMinutes: dur,
        isComputing: controller.isComputingRoute.value,
        onRecalculate: () => controller.computeGoogleDrivingRoute(isManual: true),
      );
    });
  }

  Widget _buildSectionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required List<Widget> children,
    Widget? trailing,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 20),
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
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              ?trailing,
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    IconData? prefixIcon,
    int maxLines = 1,
    String? helperText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFFCBD5E1),
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            helperText: helperText,
            helperStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
            prefixIcon: prefixIcon != null ? Icon(prefixIcon, color: const Color(0xFF94A3B8), size: 18) : null,
            filled: true,
            fillColor: const Color(0xFF0F172A),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF334155)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF334155)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF6366F1)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSection1Identity() {
    return _buildSectionCard(
      title: '1. Route Identification',
      subtitle: 'Name, transit code and activation status',
      icon: Icons.alt_route_rounded,
      iconColor: const Color(0xFF3B82F6),
      children: [
        _buildTextField(
          controller: controller.nameController,
          label: 'Route Name *',
          hint: 'e.g. Route 7A: Rajwada to Vijay Nagar Square',
          prefixIcon: Icons.route_rounded,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: controller.codeController,
                label: 'Route Code *',
                hint: 'e.g. RTE-1042',
                prefixIcon: Icons.tag_rounded,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Operational Status',
                    style: TextStyle(
                      color: Color(0xFFCBD5E1),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Obx(() {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: controller.status.value,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF1E293B),
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          items: const [
                            DropdownMenuItem(value: 'active', child: Text('Active / Running')),
                            DropdownMenuItem(value: 'pending_approval', child: Text('Pending Approval')),
                          ],
                          onChanged: (val) {
                            if (val != null) controller.status.value = val;
                          },
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSection2Corridor() {
    return _buildSectionCard(
      title: '2. Origin & Destination Corridor',
      subtitle: 'Terminal stations and GPS coordinates',
      icon: Icons.multiple_stop_rounded,
      iconColor: const Color(0xFF10B981),
      children: [
        // Origin Station (Start Point)
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  Icon(Icons.trip_origin_rounded, color: Color(0xFF10B981), size: 16),
                  SizedBox(width: 8),
                  Text(
                    'ORIGIN (START TERMINAL)',
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              LocationAutocompleteField(
                label: 'Origin Station Name',
                hint: 'Search Google Places or type origin station...',
                controller: controller.startPointController,
                addressController: controller.startAddressController,
                latController: controller.startLatController,
                lngController: controller.startLngController,
                cityController: controller.startCityController,
                stateController: controller.startStateController,
                accentColor: const Color(0xFF10B981),
                onPlaceSelected: controller.onOriginPlaceSelected,
                required: true,
              ),
              const SizedBox(height: 10),
              _buildTextField(
                controller: controller.startAddressController,
                label: 'Origin Landmark / Street Address',
                hint: 'e.g. MG Road, Near Rajwada Garden',
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: controller.startLatController,
                      label: 'Latitude',
                      hint: 'e.g. 22.7188',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField(
                      controller: controller.startLngController,
                      label: 'Longitude',
                      hint: 'e.g. 75.8560',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: controller.startCityController,
                      label: 'City',
                      hint: 'e.g. Indore',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField(
                      controller: controller.startStateController,
                      label: 'State',
                      hint: 'e.g. Madhya Pradesh',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Destination Station (End Point)
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  Icon(Icons.pin_drop_rounded, color: Color(0xFFEF4444), size: 16),
                  SizedBox(width: 8),
                  Text(
                    'DESTINATION (END TERMINAL)',
                    style: TextStyle(
                      color: Color(0xFFEF4444),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              LocationAutocompleteField(
                label: 'Destination Station Name',
                hint: 'Search Google Places or type destination station...',
                controller: controller.endPointController,
                addressController: controller.endAddressController,
                latController: controller.endLatController,
                lngController: controller.endLngController,
                cityController: controller.endCityController,
                stateController: controller.endStateController,
                accentColor: const Color(0xFFEF4444),
                onPlaceSelected: controller.onDestinationPlaceSelected,
                required: true,
              ),
              const SizedBox(height: 10),
              _buildTextField(
                controller: controller.endAddressController,
                label: 'Destination Landmark / Street Address',
                hint: 'e.g. AB Road, Near C21 Mall',
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: controller.endLatController,
                      label: 'Latitude',
                      hint: 'e.g. 22.7533',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField(
                      controller: controller.endLngController,
                      label: 'Longitude',
                      hint: 'e.g. 75.8937',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: controller.endCityController,
                      label: 'City',
                      hint: 'e.g. Indore',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField(
                      controller: controller.endStateController,
                      label: 'State',
                      hint: 'e.g. Madhya Pradesh',
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

  Widget _buildSection3Metrics() {
    return _buildSectionCard(
      title: '3. Corridor Metrics & Road Geometry',
      subtitle: 'Distance in km and scheduled run time',
      icon: Icons.speed_rounded,
      iconColor: const Color(0xFFF59E0B),
      children: [
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: controller.distanceController,
                label: 'Total Distance (km)',
                hint: 'e.g. 12.8',
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                prefixIcon: Icons.straighten_rounded,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                controller: controller.durationController,
                label: 'Expected Duration (mins)',
                hint: 'e.g. 45',
                keyboardType: TextInputType.number,
                prefixIcon: Icons.timer_outlined,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Obx(() {
          return Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: controller.isComputingRoute.value
                    ? null
                    : () => controller.computeGoogleDrivingRoute(isManual: true),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      controller.isComputingRoute.value
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Icon(Icons.alt_route_rounded, color: Colors.white, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        controller.isComputingRoute.value
                            ? 'Calculating via Google Routes API...'
                            : 'Calculate via Google Routes API\n(Road Distance & Polyline)',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
        const SizedBox(height: 6),
        Center(
          child: TextButton.icon(
            onPressed: controller.autoEstimateMetrics,
            icon: const Icon(Icons.calculate_outlined, size: 14, color: AppColors.textSecondary),
            label: const Text(
              'Estimate via Direct Coordinates (Haversine Fallback)',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSection4Stops() {
    return Obx(() {
      final stopItems = controller.stops;
      return _buildSectionCard(
        title: '4. Waypoint Stops & Schedules',
        subtitle: 'Intermediate stations and halt intervals (${stopItems.length} stops)',
        icon: Icons.pin_drop_rounded,
        iconColor: const Color(0xFF818CF8),
        trailing: Container(
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: controller.addStop,
              borderRadius: BorderRadius.circular(10),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add_rounded, color: Colors.white, size: 16),
                    SizedBox(width: 4),
                    Text(
                      'Add Stop',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        children: [
          if (stopItems.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.alt_route_rounded, color: AppColors.textMuted, size: 28),
                  const SizedBox(height: 8),
                  const Text(
                    'No Intermediate Stops Added',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Tap "+ Add Stop" to specify transit boarding points between origin and destination.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                          blurRadius: 12,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: controller.addStop,
                        borderRadius: BorderRadius.circular(10),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          child: Text(
                            '+ Add Waypoint Stop',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: stopItems.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final stop = stopItems[index];
                return _buildSingleStopForm(stop, index);
              },
            ),
        ],
      );
    });
  }

  Widget _buildSingleStopForm(StopFormItem stop, int index) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stop Header (Index, Sequence badge, and Remove button)
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF6366F1)),
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(
                      color: Color(0xFF818CF8),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Waypoint Stop #${index + 1}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFF43F5E), size: 18),
                onPressed: () => controller.removeStop(index),
                tooltip: 'Remove stop',
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Stop Name (Google Places Search Autocomplete)
          LocationAutocompleteField(
            label: 'Stop / Station Name',
            hint: 'Search Google Places or enter station name...',
            controller: stop.nameController,
            addressController: stop.addressController,
            latController: stop.latController,
            lngController: stop.lngController,
            accentColor: const Color(0xFF818CF8),
            onPlaceSelected: (place) => controller.onStopPlaceSelected(index, place),
            required: true,
          ),
          const SizedBox(height: 8),
          _buildTextField(
            controller: stop.addressController,
            label: 'Landmark / Street Address',
            hint: 'e.g. Near 56 Dukan Road Crossing',
          ),
          const SizedBox(height: 8),

          // Lat & Lng
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: stop.latController,
                  label: 'Latitude',
                  hint: 'e.g. 22.7244',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildTextField(
                  controller: stop.lngController,
                  label: 'Longitude',
                  hint: 'e.g. 75.8839',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Distance, ETA & Geofence
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: stop.distanceController,
                  label: 'Dist. from Start (km)',
                  hint: 'e.g. 4.2',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildTextField(
                  controller: stop.etaController,
                  label: 'Expected ETA',
                  hint: 'e.g. +15 mins',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildTextField(
                  controller: stop.geofenceController,
                  label: 'Geofence (m)',
                  hint: '50',
                  keyboardType: TextInputType.number,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Halt Reason
          _buildTextField(
            controller: stop.haltReasonController,
            label: 'Halt Purpose / Reason',
            hint: 'e.g. Passenger interchange & ticket inspection',
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Obx(() {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Get.back(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF475569)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'Cancel',
                style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Container(
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: controller.isLoading.value ? null : controller.saveRoute,
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    child: Center(
                      child: controller.isLoading.value
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              controller.isEditMode.value ? 'Update Transit Route' : 'Save & Register Route',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      );
    });
  }
}
