import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/models/gps_device_model.dart';
import '../controllers/assign_gps_controller.dart';

class AssignGpsView extends GetView<AssignGpsController> {
  const AssignGpsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
          }

          if (controller.isVehicleOnboardingFlow) {
            return _buildOnboardingFlowView();
          }

          return _buildAdminAssignFlowView();
        }),
      ),
    );
  }

  // ==================== 1. ADMIN ASSIGN FLOW (Matching AssignGpsPage.jsx) ====================
  Widget _buildAdminAssignFlowView() {
    final d = controller.device.value;

    return Column(
      children: [
        // Top Bar
        _buildTopBar('Assign GPS Device to Vehicle'),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Target GPS Unit Card
                if (d != null) _buildGpsUnitBanner(d),
                const SizedBox(height: 16),

                // 2. Search Field
                _buildSearchField('Search vehicles by bus number, model, depot...'),
                const SizedBox(height: 14),

                // 3. Vehicle Selection Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Select Vehicle to Bind',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    Obx(() {
                      return Text(
                        '${controller.filteredVehicles.length} vehicles available',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                      );
                    }),
                  ],
                ),
                const SizedBox(height: 10),

                // 4. Vehicles List
                _buildVehiclesList(),
                const SizedBox(height: 24),

                // 5. Submit Button
                _buildAssignSubmitButton(),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTopBar(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          const CustomBackButton(),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGpsUnitBanner(GpsDeviceModel d) {
    return Container(
      padding: const EdgeInsets.all(14),
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
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.memory_rounded, color: Color(0xFF818CF8), size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      d.displayCode,
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${d.vendor} ${d.model} • IMEI: ${d.imei}',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),
              _buildStatusBadge(d.status),
            ],
          ),

          if (d.isAssigned) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.link_rounded, color: Color(0xFF60A5FA), size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'Currently: ${d.vehicle?.busNumber ?? 'Bus #' + d.vehicleId.toString()}',
                        style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: controller.handleUnassign,
                    child: const Text(
                      'Unassign',
                      style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSearchField(String hint) {
    return Container(
      height: 46,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.inputBorder, width: 1.2),
      ),
      child: TextField(
        controller: controller.searchController,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          icon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 18),
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          border: InputBorder.none,
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }

  Widget _buildVehiclesList() {
    return Obx(() {
      final list = controller.filteredVehicles;
      final selectedId = controller.selectedVehicleId.value;

      if (list.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: const Center(
            child: Text(
              'No vehicles found matching search criteria.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final v = list[index];
          final isSelected = selectedId == v.id.toString();

          return InkWell(
            onTap: () => controller.selectVehicle(v),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E293B) : AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                  width: isSelected ? 1.8 : 1.2,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF6366F1).withValues(alpha: 0.2)
                          : const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.directions_bus_rounded,
                      color: isSelected ? const Color(0xFF818CF8) : AppColors.textSecondary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          v.busNumber,
                          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${v.model} • Depot: ${v.depotName?.isNotEmpty == true ? v.depotName : 'Main'}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                        width: 2,
                      ),
                      color: isSelected ? const Color(0xFF6366F1) : Colors.transparent,
                    ),
                    child: isSelected
                        ? const Icon(Icons.check, size: 12, color: Colors.white)
                        : null,
                  ),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  Widget _buildAssignSubmitButton() {
    return Obx(() {
      final isSubmitting = controller.isSubmitting.value;

      return Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF9333EA).withValues(alpha: 0.3),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: isSubmitting ? null : controller.handleAssign,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          child: isSubmitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                )
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.link_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Assign GPS Tracker to Vehicle',
                      style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
        ),
      );
    });
  }

  // ==================== 2. VEHICLE ONBOARDING FLOW ====================
  Widget _buildOnboardingFlowView() {
    return Column(
      children: [
        _buildTopBar('Assign GPS Device'),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Vehicle context
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.cardBorder, width: 1.2),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.directions_bus_rounded, color: Color(0xFF60A5FA), size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              controller.vehicleName,
                              style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Fleet: ${controller.fleetName} • Driver: ${controller.driverName}',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                _buildSearchField('Search GPS Device ID, IMEI...'),
                const SizedBox(height: 14),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Available GPS Devices',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    TextButton.icon(
                      onPressed: controller.goToAddGps,
                      icon: const Icon(Icons.add, size: 14, color: Color(0xFF818CF8)),
                      label: const Text('Add New GPS', style: TextStyle(color: Color(0xFF818CF8), fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                _buildOnboardingGpsList(),
                const SizedBox(height: 24),

                // Confirm & Skip Buttons
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: controller.confirmAssignment,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Confirm Assignment', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: TextButton(
                    onPressed: controller.skipForNow,
                    child: const Text('Skip for Now', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOnboardingGpsList() {
    return Obx(() {
      final list = controller.filteredDevices;
      final selected = controller.selectedGps.value;

      if (list.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            children: [
              const Text('No available GPS units found in inventory.', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: controller.goToAddGps,
                icon: const Icon(Icons.add, size: 14),
                label: const Text('Register GPS Device'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final g = list[index];
          final isSelected = selected?.id == g.id;

          return InkWell(
            onTap: () => controller.selectGps(g),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E293B) : AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                  width: isSelected ? 1.8 : 1.2,
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.memory_rounded, color: Colors.amberAccent, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(g.displayCode, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                        Text('${g.vendor} ${g.model} • SIM: ${g.sim}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                      ],
                    ),
                  ),
                  _buildStatusBadge(g.status),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  Widget _buildStatusBadge(String status) {
    final s = status.toLowerCase();
    Color bg = const Color(0xFF1E293B);
    Color fg = const Color(0xFF94A3B8);

    if (s == 'available' || s == 'online') {
      bg = const Color(0xFF10B981).withValues(alpha: 0.15);
      fg = const Color(0xFF34D399);
    } else if (s == 'assigned') {
      bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
      fg = const Color(0xFF60A5FA);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: fg, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }
}