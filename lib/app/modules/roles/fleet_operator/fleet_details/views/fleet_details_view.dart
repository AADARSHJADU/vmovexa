import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controllers/fleet_details_controller.dart';

class FleetDetailsView extends GetView<FleetDetailsController> {
  const FleetDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        controller.backToFleetList();
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Obx(() {
            final isLoading = controller.isLoading.value;
            final fleet = controller.fleet.value;

            if (isLoading && fleet == null) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: AppColors.primaryButtonBlue),
                    SizedBox(height: 16),
                    Text(
                      'Loading complete fleet profile & asset records...',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ],
                ),
              );
            }

            if (fleet == null) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline_rounded, color: Colors.white54, size: 48),
                      const SizedBox(height: 16),
                      const Text(
                        'Fleet operation record not found.',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: controller.backToFleetList,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryButtonBlue,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Back to Fleets List', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                ),
              );
            }

            return Column(
              children: [
                // Top Bar
                _buildTopBar(context, fleet),

                // Main Scrollable Content
                Expanded(
                  child: RefreshIndicator(
                    color: AppColors.primaryButtonBlue,
                    backgroundColor: AppColors.cardBg,
                    onRefresh: () async {
                      await controller.loadFleetDetails();
                      await controller.loadAssignedVehicles();
                    },
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 1. Profile Banner Card
                          _buildProfileBanner(context, fleet),
                          const SizedBox(height: 16),

                          // 2. Tab Navigation Bar
                          _buildTabBar(),
                          const SizedBox(height: 18),

                          // 3. Tab Contents
                          Obx(() {
                            final tab = controller.activeTab.value;
                            if (tab == 'vehicles') {
                              return _buildVehiclesTab(context, fleet);
                            } else if (tab == 'activity') {
                              return _buildActivityTab(fleet);
                            }
                            return _buildOverviewTab(context, fleet);
                          }),

                          const SizedBox(height: 28),

                          // 4. Back to Fleet List Link
                          Center(
                            child: GestureDetector(
                              onTap: controller.backToFleetList,
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.arrow_back, color: AppColors.textLink, size: 16),
                                  SizedBox(width: 6),
                                  Text(
                                    'Back to Fleet List',
                                    style: TextStyle(
                                      color: AppColors.textLink,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  // ---------------- 1. Top Bar ----------------
  Widget _buildTopBar(BuildContext context, FleetDetailModel fleet) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          CustomBackButton(onTap: controller.backToFleetList),
          const Text(
            'Fleet Details',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: Colors.white, size: 22),
            tooltip: 'Edit Fleet Profile',
            onPressed: controller.goToEditFleet,
          ),
        ],
      ),
    );
  }

  // ---------------- 2. Profile Banner Card ----------------
  Widget _buildProfileBanner(BuildContext context, FleetDetailModel fleet) {
    final status = fleet.status.toLowerCase();
    final isPending = status == 'pending_approval';
    final isActive = status == 'active';

    Color statusBg = const Color(0x1A10B981);
    Color statusBorder = const Color(0x4D10B981);
    Color statusColor = const Color(0xFF10B981);

    if (isPending) {
      statusBg = const Color(0x1AF59E0B);
      statusBorder = const Color(0x4DF59E0B);
      statusColor = const Color(0xFFF59E0B);
    } else if (!isActive) {
      statusBg = const Color(0x1AEF4444);
      statusBorder = const Color(0x4DEF4444);
      statusColor = const Color(0xFFEF4444);
    }

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
          // Logo & Main Info Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo Box
              _buildAvatarBox(fleet),
              const SizedBox(width: 14),

              // Title & Status
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fleet.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${fleet.designation} · ${fleet.department}',
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: statusBg,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: statusBorder),
                          ),
                          child: Text(
                            status.replaceAll('_', ' ').toUpperCase(),
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          fleet.code,
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 11,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(color: AppColors.cardBorder, height: 1),
          const SizedBox(height: 14),

          // Action Buttons Bar (Matching Admin Panel)
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              // Edit Fleet Profile Button
              ElevatedButton.icon(
                onPressed: controller.goToEditFleet,
                icon: const Icon(Icons.edit, size: 14, color: Colors.white),
                label: const Text('Edit Fleet', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(0, 40),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  backgroundColor: AppColors.primaryButtonBlue,
                  foregroundColor: Colors.white,
                  // padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),

              // Admin Approve / Reject actions
              if (isPending && controller.isPlatformAdmin.value) ...[
                ElevatedButton.icon(
                  onPressed: controller.approveFleet,
                  icon: const Icon(Icons.check_circle_outline, size: 14, color: Colors.white),
                  label: const Text('Approve', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(0, 40),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    // padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: () => controller.showRejectDialog(context),
                  icon: const Icon(Icons.cancel_outlined, size: 14, color: Color(0xFFEF4444)),
                  label: const Text('Reject', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFEF4444))),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 40),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    side: const BorderSide(color: Color(0xFFEF4444)),
                    // padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],

              // Pending review notice for non-platform admin
              if (isPending && !controller.isPlatformAdmin.value)
                Container(
                  height: 40,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0x1AF59E0B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0x4DF59E0B)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.access_time_rounded, color: Color(0xFFF59E0B), size: 14),
                      SizedBox(width: 6),
                      Text(
                        'Pending Review',
                        style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),

              // Status Toggle (Activate / Suspend)
              if (!isPending)
                OutlinedButton.icon(
                  onPressed: () => controller.toggleStatus(isActive ? 'suspended' : 'active'),
                  icon: Icon(
                    isActive ? Icons.pause_circle_outline : Icons.play_circle_outline,
                    size: 14,
                    color: isActive ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                  ),
                  label: Text(
                    isActive ? 'Suspend Fleet' : 'Activate Fleet',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isActive ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 40),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    side: BorderSide(
                      color: isActive ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                    ),
                    // padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarBox(FleetDetailModel fleet) {
    final avatarUrl = fleet.logoUrl.trim();
    if (avatarUrl.isNotEmpty) {
      final resolved = ApiConstants.resolveFileUrl(avatarUrl);
      return ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Container(
          width: 58,
          height: 58,
          decoration: BoxDecoration(
            color: const Color(0xFF1E2235),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Image.network(
            resolved,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => _buildFallbackAvatar(fleet),
          ),
        ),
      );
    }
    return _buildFallbackAvatar(fleet);
  }

  Widget _buildFallbackAvatar(FleetDetailModel fleet) {
    final letter = fleet.name.isNotEmpty ? fleet.name.substring(0, 1).toUpperCase() : 'F';
    return Container(
      width: 58,
      height: 58,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Center(
        child: Text(
          letter,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  // ---------------- 3. Tab Bar ----------------
  Widget _buildTabBar() {
    return Obx(() {
      final currentTab = controller.activeTab.value;
      return Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: const Color(0xFF0F111A),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            Expanded(
              child: _buildTabItem(
                label: 'Overview',
                icon: Icons.dashboard_outlined,
                isSelected: currentTab == 'overview',
                onTap: () => controller.switchTab('overview'),
              ),
            ),
            Expanded(
              child: _buildTabItem(
                label: 'Vehicles',
                icon: Icons.directions_bus_outlined,
                badgeCount: controller.assignedVehicles.length,
                isSelected: currentTab == 'vehicles',
                onTap: () => controller.switchTab('vehicles'),
              ),
            ),
            Expanded(
              child: _buildTabItem(
                label: 'Activity',
                icon: Icons.history_rounded,
                isSelected: currentTab == 'activity',
                onTap: () => controller.switchTab('activity'),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildTabItem({
    required String label,
    required IconData icon,
    int? badgeCount,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryButtonBlue : Colors.transparent,
          borderRadius: BorderRadius.circular(9),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 15, color: isSelected ? Colors.white : AppColors.textSecondary),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textSecondary,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            if (badgeCount != null && badgeCount > 0) ...[
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white24 : const Color(0xFF1E2235),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badgeCount.toString(),
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ---------------- 4. Tab 1: Overview ----------------
  Widget _buildOverviewTab(BuildContext context, FleetDetailModel fleet) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4 Stat Metric Cards (Admin Panel Grid)
        _buildStatCardsGrid(fleet),
        const SizedBox(height: 18),

        // Quick Actions Row
        _buildQuickActionsRow(),
        const SizedBox(height: 18),

        // Fleet Operational Scope & Description Card
        _buildDescriptionCard(fleet),
        const SizedBox(height: 18),

        // Contact Person & Lead Operator Grid
        _buildContactGrid(fleet),
        const SizedBox(height: 18),

        // Depot & Operational Scope Grid
        _buildOperationsGrid(fleet),
        const SizedBox(height: 18),

        // Verification & Legal KYC Documents Section
        _buildKycDocumentsSection(context, fleet),
      ],
    );
  }

  Widget _buildStatCardsGrid(FleetDetailModel fleet) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.5,
      children: [
        _buildKpiCard(
          title: 'ASSIGNED DEPOT',
          value: fleet.depotName,
          subtitle: fleet.location,
          iconColor: const Color(0xFF60A5FA),
        ),
        _buildKpiCard(
          title: 'BUS FLEET QUOTA',
          value: '${fleet.assignedBuses} Buses',
          subtitle: 'Allocated assets',
          iconColor: const Color(0xFF34D399),
        ),
        _buildKpiCard(
          title: 'DRIVER SHIFT TEAM',
          value: '${fleet.activeDriversCount} Drivers',
          subtitle: 'Managed crew',
          iconColor: const Color(0xFFA78BFA),
        ),
        _buildKpiCard(
          title: 'KYC VERIFICATION',
          value: '${fleet.documents.length} Docs',
          subtitle: 'Legal compliance',
          iconColor: const Color(0xFFFBBF24),
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            subtitle,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsRow() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Quick Operations',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildQuickActionCircle(
                title: 'Add Vehicle',
                icon: Icons.directions_bus_filled_rounded,
                onTap: controller.goToAddVehicle,
              ),
              _buildQuickActionCircle(
                title: 'Add Driver',
                icon: Icons.person_add_alt_1_rounded,
                onTap: controller.goToAddDriver,
              ),
              _buildQuickActionCircle(
                title: 'Assign GPS',
                icon: Icons.sensors_rounded,
                onTap: controller.goToAssignGps,
              ),
              _buildQuickActionCircle(
                title: 'Edit Fleet',
                icon: Icons.edit_note_rounded,
                onTap: controller.goToEditFleet,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCircle({
    required String title,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryButtonBlue.withValues(alpha: 0.25),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildDescriptionCard(FleetDetailModel fleet) {
    final desc = fleet.description.trim().isNotEmpty
        ? fleet.description
        : 'City bus operations for all designated public corridors and transport routes.';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0x1A2563EB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x332563EB), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.description_outlined, color: Color(0xFF60A5FA), size: 16),
              SizedBox(width: 8),
              Text(
                'FLEET OPERATIONAL SCOPE & DESCRIPTION',
                style: TextStyle(
                  color: Color(0xFF93C5FD),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            desc,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactGrid(FleetDetailModel fleet) {
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
          const Row(
            children: [
              Icon(Icons.account_circle_outlined, color: AppColors.textSecondary, size: 18),
              SizedBox(width: 8),
              Text(
                'CONTACT PERSON & LEAD OPERATOR',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildInfoRow('Contact Person', fleet.contactPerson.isNotEmpty ? fleet.contactPerson : fleet.name),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Email Address', fleet.email.isNotEmpty ? fleet.email : '—'),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Phone Number', fleet.phone.isNotEmpty ? fleet.phone : '—'),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Classification', fleet.fleetType),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Designation', fleet.designation),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Department', fleet.department),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Timezone', fleet.timeZone),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Primary Hub', fleet.location),
        ],
      ),
    );
  }

  Widget _buildOperationsGrid(FleetDetailModel fleet) {
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
          const Row(
            children: [
              Icon(Icons.alt_route_rounded, color: Color(0xFF60A5FA), size: 18),
              SizedBox(width: 8),
              Text(
                'DEPOT & VEHICLE OPERATIONS SCOPE',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildInfoRow('Assigned Depot', fleet.depotName),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Fleet Category', fleet.fleetType),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Assigned Buses', '${fleet.assignedBuses} Buses'),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Active Drivers', '${fleet.activeDriversCount} Drivers'),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Working Shifts', fleet.workingHours),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildInfoRow('Account Status', fleet.status.replaceAll('_', ' ').toUpperCase()),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildKycDocumentsSection(BuildContext context, FleetDetailModel fleet) {
    final docs = fleet.documents;
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.verified_outlined, color: Color(0xFFA78BFA), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'VERIFICATION & LEGAL KYC PAPERS',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Text(
                '${docs.length} attached',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (docs.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0D0F18),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: const Text(
                'No legal compliance or KYC documents uploaded for this fleet yet.\nYou can edit the fleet profile to attach verification papers.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted, fontSize: 11, height: 1.4),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: docs.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (ctx, idx) {
                final d = docs[idx];
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D0F18),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0x1AA78BFA),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.file_present_rounded, color: Color(0xFFA78BFA), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              d.category,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'KYC Attached • Verified',
                              style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      if (d.url.isNotEmpty)
                        TextButton(
                          onPressed: () => _showDocumentDialog(context, d),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text('View File ↗', style: TextStyle(color: AppColors.textLink, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  void _showDocumentDialog(BuildContext context, FleetDocumentModel doc) {
    final fullUrl = ApiConstants.resolveFileUrl(doc.url);
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF161926),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      doc.category,
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  constraints: const BoxConstraints(maxHeight: 280),
                  color: Colors.black26,
                  child: Image.network(
                    fullUrl,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(30.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.insert_drive_file_outlined, color: Colors.white38, size: 40),
                            SizedBox(height: 8),
                            Text('Compliance Document Preview', style: TextStyle(color: Colors.white60, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'Uploaded: ${doc.uploadedAt}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontFamily: 'monospace'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------- 5. Tab 2: Assigned Vehicles ----------------
  Widget _buildVehiclesTab(BuildContext context, FleetDetailModel fleet) {
    return Obx(() {
      final isLoading = controller.isLoadingVehicles.value;
      final vehicles = controller.assignedVehicles;

      if (isLoading && vehicles.isEmpty) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(32.0),
            child: CircularProgressIndicator(color: AppColors.primaryButtonBlue),
          ),
        );
      }

      if (vehicles.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: const Color(0x1A2563EB),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF60A5FA), size: 30),
              ),
              const SizedBox(height: 16),
              const Text(
                'No Vehicles Bound to this Fleet Yet',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Allocate and bind transit bus units to complete this fleet division deployment.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
              ),
              const SizedBox(height: 20),
              CustomButton(
                text: 'Allocate Vehicle Unit',
                onTap: controller.goToAddVehicle,
                width: 200,
                height: 44,
              ),
            ],
          ),
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Assigned Transit Units (${vehicles.length})',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                onPressed: controller.goToAddVehicle,
                icon: const Icon(Icons.add, size: 14, color: Colors.white),
                label: const Text('Add Vehicle', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryButtonBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: vehicles.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (ctx, idx) {
              final v = vehicles[idx];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          v.registrationNumber,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0x1A10B981),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            v.status.toUpperCase(),
                            style: const TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${v.make} ${v.model}'.trim().isNotEmpty ? '${v.make} ${v.model}' : 'Commercial Transit Bus',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    ),
                    const SizedBox(height: 10),
                    const Divider(color: AppColors.cardBorder, height: 1),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Driver: ${v.assignedDriverName ?? 'Unassigned'}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        ),
                        Text(
                          'Fuel: ${v.fuelType.toUpperCase()}',
                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      );
    });
  }

  // ---------------- 6. Tab 3: Activity Logs ----------------
  Widget _buildActivityTab(FleetDetailModel fleet) {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'OPERATIONAL AUDIT TRAIL',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              Text(
                'ID: ${fleet.id}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontFamily: 'monospace'),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Log entry 1: Initialized
          _buildActivityItem(
            title: 'Fleet Operation Initialized',
            description: 'Registered under code ${fleet.code} at ${fleet.depotName} with target quota of ${fleet.assignedBuses} buses.',
            timestamp: fleet.createdAt.isNotEmpty ? fleet.createdAt : 'Initial setup',
            icon: Icons.app_registration_rounded,
            iconColor: const Color(0xFF60A5FA),
          ),
          const SizedBox(height: 14),

          // Log entry 2: Status
          _buildActivityItem(
            title: fleet.status.toLowerCase() == 'active'
                ? 'Fleet Operation Active'
                : 'Status: ${fleet.status.toUpperCase()}',
            description: fleet.status.toLowerCase() == 'active'
                ? 'Approved and active across transit dispatching network.'
                : 'Fleet record currently in ${fleet.status.replaceAll('_', ' ')} state.',
            timestamp: 'Current State',
            icon: fleet.status.toLowerCase() == 'active' ? Icons.check_circle_rounded : Icons.info_outline_rounded,
            iconColor: fleet.status.toLowerCase() == 'active' ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem({
    required String title,
    required String description,
    required String timestamp,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0F18),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 3),
                Text(description, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.3)),
                const SizedBox(height: 4),
                Text(timestamp, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontFamily: 'monospace')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
