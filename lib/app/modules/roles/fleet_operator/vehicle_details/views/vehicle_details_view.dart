import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/constants/api_constants.dart';
import '../controllers/vehicle_details_controller.dart';

class VehicleDetailsView extends GetView<VehicleDetailsController> {
  const VehicleDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const CustomBackButton(),
                  const Text(
                    'Vehicle Details',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, color: Colors.white70, size: 22),
                        tooltip: 'Edit Vehicle',
                        onPressed: controller.goToEditVehicle,
                      ),
                      PopupMenuButton<String>(
                        icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 24),
                        color: const Color(0xFF1E293B),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        onSelected: (value) {
                          if (value == 'edit') {
                            controller.goToEditVehicle();
                          } else if (value == 'tracking') {
                            controller.startLiveTracking();
                          } else if (value == 'delete') {
                            controller.confirmDeleteVehicle();
                          }
                        },
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'edit',
                            child: Row(
                              children: [
                                Icon(Icons.edit_rounded, color: Color(0xFF60A5FA), size: 18),
                                SizedBox(width: 10),
                                Text('Edit Specs', style: TextStyle(color: Colors.white, fontSize: 13)),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'tracking',
                            child: Row(
                              children: [
                                Icon(Icons.radar_rounded, color: Color(0xFF10B981), size: 18),
                                SizedBox(width: 10),
                                Text('Live Radar Tracking', style: TextStyle(color: Colors.white, fontSize: 13)),
                              ],
                            ),
                          ),
                          const PopupMenuDivider(height: 1),
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                                SizedBox(width: 10),
                                Text('Delete Vehicle', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Main Content Area
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                  );
                }

                if (controller.vehicle.value == null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.directions_bus_filled_outlined, size: 56, color: Colors.white24),
                        const SizedBox(height: 12),
                        const Text('Vehicle information unavailable', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: controller.loadVehicleDetails,
                          icon: const Icon(Icons.refresh, size: 16),
                          label: const Text('Retry'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Bus Photo Banner Header Card
                      _buildBusBannerCard(),
                      const SizedBox(height: 18),

                      // Stats summary grid
                      _buildStatsSummaryRow(),
                      const SizedBox(height: 20),

                      // Current Location Card with interactive map representation
                      _buildCurrentLocationCard(),
                      const SizedBox(height: 20),

                      // Display Screen Configuration (IoT Matrix matching Admin Panel)
                      _buildDisplayScreenConfigCard(),
                      const SizedBox(height: 20),

                      // Vehicle Info details
                      _buildSectionHeader('Vehicle Specification Sheet'),
                      const SizedBox(height: 10),
                      _buildVehicleInfoGrid(),
                      const SizedBox(height: 20),

                      // Driver info details
                      _buildSectionHeader('Driver Information'),
                      const SizedBox(height: 10),
                      _buildDriverInfoCard(),
                      const SizedBox(height: 20),

                      // GPS device details
                      _buildSectionHeader('GPS Device Information'),
                      const SizedBox(height: 10),
                      _buildGpsDeviceCard(),
                      const SizedBox(height: 20),

                      // Compliance Documents Section
                      _buildSectionHeader('Compliance Documents (${controller.documents.length})'),
                      const SizedBox(height: 10),
                      _buildComplianceDocsList(),
                      const SizedBox(height: 20),

                      // Bus Photos Gallery (if any)
                      if (controller.photos.isNotEmpty) ...[
                        _buildSectionHeader('Bus Photos Gallery (${controller.photos.length})'),
                        const SizedBox(height: 10),
                        _buildPhotosGallery(),
                        const SizedBox(height: 20),
                      ],

                      // Quick Actions
                      const Text(
                        'Quick Actions',
                        style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 14),
                      _buildQuickActionsGrid(),
                      const SizedBox(height: 30),

                      // Bottom Action buttons
                      Row(
                        children: [
                          Expanded(
                            child: CustomButton(
                              text: 'Track Live',
                              onTap: controller.startLiveTracking,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: CustomButton(
                              text: 'Edit Vehicle',
                              isOutlined: true,
                              onTap: controller.goToEditVehicle,
                            ),
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            onPressed: controller.confirmDeleteVehicle,
                            icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent),
                            tooltip: 'Delete Vehicle',
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.redAccent.withValues(alpha: 0.15),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(color: Colors.redAccent.withValues(alpha: 0.4)),
                              ),
                              padding: const EdgeInsets.all(12),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildBusBannerCard() {
    final status = controller.status.toLowerCase();
    Color statusColor;
    String statusText;

    if (status == 'on_route' || status == 'active' || status == 'moving') {
      statusColor = const Color(0xFF10B981);
      statusText = 'Active / On Route';
    } else if (status == 'in_depot' || status == 'idle') {
      statusColor = const Color(0xFF38BDF8);
      statusText = 'In Depot';
    } else if (status == 'maintenance' || status == 'offline') {
      statusColor = const Color(0xFFF59E0B);
      statusText = 'Maintenance';
    } else if (status == 'pending_approval') {
      statusColor = Colors.amber;
      statusText = 'Pending Approval';
    } else {
      statusColor = const Color(0xFF94A3B8);
      statusText = status.toUpperCase();
    }

    final hasPhotos = controller.photos.isNotEmpty;
    final photoUrl = hasPhotos ? ApiConstants.resolveFileUrl(controller.photos.first) : '';

    return Container(
      height: 156,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Stack(
        children: [
          // Bus photo on left
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            width: 175,
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (hasPhotos && photoUrl.isNotEmpty)
                  Image.network(
                    photoUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Image.asset(
                      'assets/images/bus1.png',
                      fit: BoxFit.cover,
                    ),
                  )
                else
                  Image.asset(
                    'assets/images/bus1.png',
                    fit: BoxFit.cover,
                  ),
                Positioned(
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 45,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: [
                          AppColors.cardBg.withValues(alpha: 0.0),
                          AppColors.cardBg,
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Specs detail parameters on right
          Positioned(
            right: 16,
            top: 14,
            bottom: 14,
            left: 185,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        statusText,
                        style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                Text(
                  controller.registrationNumber,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.6,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  controller.fleetName,
                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Row(
                  children: [
                    SvgPicture.asset(
                      'assets/icons/bus.svg',
                      width: 12,
                      height: 12,
                      colorFilter: const ColorFilter.mode(AppColors.textMuted, BlendMode.srcIn),
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        controller.modelName,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // "Live Telemetry" badge - top right corner
          Positioned(
            top: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5), width: 1),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.wifi_rounded, color: Color(0xFF60A5FA), size: 11),
                  SizedBox(width: 4),
                  Text(
                    'Live',
                    style: TextStyle(color: Color(0xFF60A5FA), fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSummaryRow() {
    final speed = controller.speedKmh != null ? '${controller.speedKmh!.toStringAsFixed(1)} km/h' : '0.0 km/h';
    final isElectric = controller.fuelType.toLowerCase() == 'electric';
    final batteryOrFuel = isElectric && controller.batterySocPct != null
        ? '${controller.batterySocPct}%'
        : controller.fuelType.toUpperCase();

    return Row(
      children: [
        Expanded(child: _buildSummaryStatItem('Driver', controller.driverName, svgPath: 'assets/icons/profile.svg')),
        const SizedBox(width: 8),
        Expanded(child: _buildSummaryStatItem('GPS ID', controller.gpsDeviceId, svgPath: 'assets/icons/hotspot.svg')),
        const SizedBox(width: 8),
        Expanded(child: _buildSummaryStatItem('Speed', speed, svgPath: 'assets/icons/speed_m.svg')),
        const SizedBox(width: 8),
        Expanded(
          child: _buildSummaryStatItem(
            isElectric ? 'Battery' : 'Fuel',
            batteryOrFuel,
            icon: isElectric ? Icons.battery_charging_full_rounded : Icons.local_gas_station_rounded,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryStatItem(String label, String value, {IconData? icon, String? svgPath}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (svgPath != null)
            SvgPicture.asset(
              svgPath,
              width: 16,
              height: 16,
            )
          else if (icon != null)
            Icon(icon, color: const Color(0xFF6366F1), size: 16),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentLocationCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          SvgPicture.asset(
                            'assets/icons/location.svg',
                            width: 16,
                            height: 16,
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Assigned Route Corridor',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        controller.assignedRoute,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.circle, size: 8, color: Color(0xFF60A5FA)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'From: ${controller.source}',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 10, color: Color(0xFF10B981)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'To: ${controller.destination}',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: controller.startLiveTracking,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'Track Live',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            height: 60,
            width: double.infinity,
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16)),
              color: Color(0xFF0F172A),
            ),
            child: CustomPaint(painter: MiniMapPainter()),
          ),
        ],
      ),
    );
  }

  // Display Screen Configuration Card matching Admin Panel
  Widget _buildDisplayScreenConfigCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.3), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.tv_rounded, color: Color(0xFFA855F7), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Display Screen Config',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4)),
                ),
                child: Text(
                  '${controller.totalDisplays} Screens',
                  style: const TextStyle(
                    color: Color(0xFFC084FC),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 4 Matrix Screen Rows
          _buildScreenConfigRow(
            'Left Side Displays',
            '${controller.leftDisplays} Units',
            const Color(0xFF8B5CF6),
            const Color(0xFFC084FC),
          ),
          const SizedBox(height: 8),
          _buildScreenConfigRow(
            'Right Side Displays',
            '${controller.rightDisplays} Units',
            const Color(0xFF8B5CF6),
            const Color(0xFFC084FC),
          ),
          const SizedBox(height: 8),
          _buildScreenConfigRow(
            'Rear Display',
            '${controller.rearDisplays} Unit',
            const Color(0xFFEC4899),
            const Color(0xFFF472B6),
          ),
          const SizedBox(height: 8),
          _buildScreenConfigRow(
            'Emergency Exit Display',
            '${controller.emergencyDisplays} Unit',
            const Color(0xFF06B6D4),
            const Color(0xFF22D3EE),
          ),
        ],
      ),
    );
  }

  Widget _buildScreenConfigRow(String label, String value, Color dotColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: dotColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 10),
              Text(
                label,
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleInfoGrid() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 3.0,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        children: [
          _buildInfoParam('Vehicle Type', controller.vehicleType),
          _buildInfoParam('Capacity', '${controller.capacity} Seater'),
          _buildInfoParam('Registration No.', controller.registrationNumber),
          _buildInfoParam('Fuel Type', controller.fuelType.toUpperCase()),
          _buildInfoParam('Chassis / VIN', controller.vin),
          _buildInfoParam('Depot Location', controller.depotName),
          _buildInfoParam('Model', controller.modelName),
          _buildInfoParam('Status', controller.status.toUpperCase()),
        ],
      ),
    );
  }

  Widget _buildInfoParam(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildDriverInfoCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: SvgPicture.asset(
                  'assets/icons/profile.svg',
                  colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.driverName,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                const Text('Assigned Transit Pilot', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          OutlinedButton.icon(
            onPressed: controller.callDriver,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFF6366F1)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.call_outlined, color: Colors.white, size: 14),
            label: const Text('Call', style: TextStyle(color: Colors.white, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _buildGpsDeviceCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildGpsParam('Device ID', controller.gpsDeviceId),
              _buildGpsParam('Network Status', 'Active 4G LTE'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildGpsParam('Signal Strength', 'Strong (98%)'),
              _buildGpsParam('Live Ping', 'Real-time sync'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGpsParam(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildComplianceDocsList() {
    final docs = controller.documents;
    if (docs.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: const Center(
          child: Text(
            'No compliance documents uploaded yet.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
        ),
      );
    }

    return Column(
      children: docs.map((doc) {
        final docType = (doc.docType ?? doc.category).replaceAll('_', ' ').toUpperCase();
        Color statusColor;
        switch (doc.approvalStatus?.toLowerCase()) {
          case 'approved':
            statusColor = const Color(0xFF10B981);
            break;
          case 'rejected':
            statusColor = Colors.redAccent;
            break;
          default:
            statusColor = Colors.amber;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.description_outlined, color: Color(0xFF60A5FA), size: 20),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(docType, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      if (doc.uploadedAt.isNotEmpty)
                        Text(
                          'Uploaded: ${doc.uploadedAt.split('T').first}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                        ),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      (doc.approvalStatus ?? 'Pending').toUpperCase(),
                      style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  if (doc.url.isNotEmpty) ...[
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.remove_red_eye_outlined, size: 18, color: Color(0xFF60A5FA)),
                      onPressed: () => _showDocDialog(doc),
                      tooltip: 'View Document',
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  void _showDocDialog(FleetDocumentModel doc) {
    final fullUrl = ApiConstants.resolveFileUrl(doc.url);
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    (doc.docType ?? doc.category).replaceAll('_', ' ').toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  fullUrl,
                  height: 250,
                  width: double.infinity,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Icon(Icons.insert_drive_file_outlined, color: Colors.white38, size: 48),
                        SizedBox(height: 8),
                        Text('Document preview unavailable', style: TextStyle(color: Colors.white60, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhotosGallery() {
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: controller.photos.length,
        separatorBuilder: (context, index) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final resolved = ApiConstants.resolveFileUrl(controller.photos[index]);
          return GestureDetector(
            onTap: () {
              Get.dialog(
                Dialog(
                  backgroundColor: Colors.transparent,
                  child: Stack(
                    alignment: Alignment.topRight,
                    children: [
                      InteractiveViewer(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(resolved, fit: BoxFit.contain),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white, size: 28),
                        onPressed: () => Get.back(),
                      ),
                    ],
                  ),
                ),
              );
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                resolved,
                width: 90,
                height: 90,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 90,
                  height: 90,
                  color: AppColors.cardBg,
                  child: const Icon(Icons.broken_image_rounded, color: Colors.white38),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickActionsGrid() {
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 0.9,
      children: [
        _buildQuickActionItem(
          'Live Tracking',
          const Color(0xFF3B82F6),
          controller.startLiveTracking,
          svgPath: 'assets/icons/live_map.svg',
        ),
        _buildQuickActionItem(
          'Edit Specs',
          Colors.amber,
          controller.goToEditVehicle,
          svgPath: 'assets/icons/edit.svg',
        ),
        _buildQuickActionItem(
          'Call Driver',
          const Color(0xFF10B981),
          controller.callDriver,
          icon: Icons.phone_forwarded_rounded,
        ),
        _buildQuickActionItem(
          'Delete Bus',
          Colors.redAccent,
          controller.confirmDeleteVehicle,
          icon: Icons.delete_forever_rounded,
        ),
      ],
    );
  }

  Widget _buildQuickActionItem(
    String title,
    Color color,
    VoidCallback onTap, {
    IconData? icon,
    String? svgPath,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (svgPath != null)
              SvgPicture.asset(
                svgPath,
                width: 18,
                height: 18,
              )
            else if (icon != null)
              Icon(
                icon,
                color: color,
                size: 20,
              ),
            const SizedBox(height: 6),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class MiniMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    canvas.drawLine(Offset(0, size.height * 0.3), Offset(size.width, size.height * 0.35), linePaint);
    canvas.drawLine(Offset(0, size.height * 0.7), Offset(size.width, size.height * 0.65), linePaint);
    canvas.drawLine(Offset(size.width * 0.5, 0), Offset(size.width * 0.45, size.height), linePaint);

    final routePaint = Paint()
      ..color = const Color(0xFF8B5CF6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final routePath = Path()
      ..moveTo(size.width * 0.1, size.height * 0.8)
      ..quadraticBezierTo(size.width * 0.4, size.height * 0.7, size.width * 0.5, size.height * 0.4)
      ..lineTo(size.width * 0.9, size.height * 0.2);

    canvas.drawPath(routePath, routePaint);

    // Points
    canvas.drawCircle(Offset(size.width * 0.1, size.height * 0.8), 4, Paint()..color = const Color(0xFF8B5CF6));
    canvas.drawCircle(Offset(size.width * 0.9, size.height * 0.2), 5, Paint()..color = Colors.redAccent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}