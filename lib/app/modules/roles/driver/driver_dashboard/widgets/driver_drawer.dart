import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/widgets/language_selector_sheet.dart';
import '../../home/controller/driver_home_controller.dart';
import '../../profile/controller/driver_profile_controller.dart';
import '../controller/driver_dashboard_controller.dart';

class DriverDrawer extends StatelessWidget {
  const DriverDrawer({super.key});

  static const Color kDrawerBg = Color(0xFF0F101A);
  static const Color kSurfaceBg = Color(0xFF161726);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6366F1);
  static const Color kBorder = Color(0x1FFFFFFF);

  @override
  Widget build(BuildContext context) {
    // Retrieve dashboard controller if available
    final dashboardCtrl = Get.isRegistered<DriverDashboardController>()
        ? Get.find<DriverDashboardController>()
        : null;

    final homeCtrl = Get.isRegistered<DriverHomeController>()
        ? Get.find<DriverHomeController>()
        : null;

    final currentRoute = Get.currentRoute;

    return Drawer(
      backgroundColor: kDrawerBg,
      child: SafeArea(
        child: Column(
          children: [
            // --- HEADER ---
            _buildBrandHeader(context),

            // --- DRIVER PROFILE MINI CARD ---
            Obx(() {
              final profileCtrl = Get.isRegistered<DriverProfileController>()
                  ? Get.find<DriverProfileController>()
                  : null;
              final user = Get.isRegistered<StorageService>() ? StorageService.to.getUser() : null;

              final driverName = profileCtrl?.fullName.value.isNotEmpty == true && profileCtrl!.fullName.value != 'Driver'
                  ? profileCtrl.fullName.value
                  : (homeCtrl?.driverName.value.isNotEmpty == true && homeCtrl!.driverName.value != 'Driver'
                      ? homeCtrl.driverName.value
                      : (user?.name?.isNotEmpty == true ? user!.name! : 'Driver'));

              final avatarRaw = profileCtrl?.avatarUrl.value.isNotEmpty == true
                  ? profileCtrl!.avatarUrl.value
                  : (homeCtrl?.avatarUrl.value.isNotEmpty == true
                      ? homeCtrl!.avatarUrl.value
                      : (user?.avatarUrl ?? ''));

              final orgName = profileCtrl?.companyName.value.isNotEmpty == true
                  ? profileCtrl!.companyName.value
                  : (user?.organizationName?.isNotEmpty == true
                      ? user!.organizationName!
                      : 'VMOVEXA Transit');

              final badgeId = user?.id != null
                  ? 'DRV-${user!.id!.toUpperCase().replaceAll("USR_", "").takeIfValid(12)}'
                  : 'DRV-MVQBC9OE-EE26';

              final isVerified = homeCtrl?.isDocumentsVerified.value ?? true;

              return _buildDriverProfileCard(
                driverName: driverName,
                orgName: orgName,
                badgeId: badgeId,
                avatarUrl: ApiConstants.resolveFileUrl(avatarRaw),
                isVerified: isVerified,
                onTap: () {
                  Navigator.of(context).pop();
                  if (dashboardCtrl != null) {
                    dashboardCtrl.setNavIndex(4);
                  } else {
                    Get.toNamed(Routes.DRIVER_PROFILE);
                  }
                },
              );
            }),

            const Divider(color: kBorder, height: 1),

            // --- SCROLLABLE NAVIGATION LINKS ---
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                physics: const BouncingScrollPhysics(),
                children: [
                  // --- SECTION 1: OVERVIEW ---
                  _buildSectionHeader('overview_caps'.tr),
                  Obx(() {
                    final isSelected = currentRoute == Routes.DRIVER_DASHBOARD &&
                        ((dashboardCtrl?.selectedNavIndex.value ?? 0) == 0 || dashboardCtrl == null);
                    return _buildNavItem(
                      icon: Icons.dashboard_rounded,
                      title: 'overview_dashboard'.tr,
                      isSelected: isSelected,
                      iconColor: AppTheme.gradientBlue,
                      onTap: () {
                        Navigator.of(context).pop();
                        if (dashboardCtrl != null) {
                          dashboardCtrl.setNavIndex(0);
                        } else {
                          Get.offAllNamed(Routes.DRIVER_DASHBOARD);
                        }
                      },
                    );
                  }),

                  const SizedBox(height: 16),

                  // --- SECTION 2: DISPATCH & ROUTES ---
                  _buildSectionHeader('dispatch_routes_caps'.tr),

                  // 2.1 My Routes
                  Obx(() {
                    final isSelected = currentRoute == Routes.MY_ROUTE ||
                        (currentRoute == Routes.DRIVER_DASHBOARD &&
                            (dashboardCtrl?.selectedNavIndex.value ?? -1) == 1);
                    return _buildNavItem(
                      icon: Icons.alt_route_rounded,
                      title: 'my_routes'.tr,
                      iconColor: const Color(0xFF6366F1),
                      isSelected: isSelected,
                      onTap: () {
                        Navigator.of(context).pop();
                        if (dashboardCtrl != null) {
                          dashboardCtrl.setNavIndex(1);
                        } else {
                          Get.toNamed(Routes.MY_ROUTE);
                        }
                      },
                    );
                  }),

                  // 2.2 Completed Trips
                  _buildNavItem(
                    icon: Icons.fact_check_outlined,
                    title: 'completed_trips_drawer'.tr,
                    iconColor: const Color(0xFF10B981),
                    isSelected: currentRoute == Routes.DRIVER_COMPLETED_TRIPS,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.DRIVER_COMPLETED_TRIPS);
                    },
                  ),

                  // 2.3 Shift Schedules
                  Obx(() {
                    final isSelected = currentRoute == Routes.DRIVER_SCHEDULE ||
                        (currentRoute == Routes.DRIVER_DASHBOARD &&
                            (dashboardCtrl?.selectedNavIndex.value ?? -1) == 2);
                    return _buildNavItem(
                      icon: Icons.calendar_month_rounded,
                      title: 'shift_schedules'.tr,
                      iconColor: const Color(0xFF06B6D4),
                      isSelected: isSelected,
                      onTap: () {
                        Navigator.of(context).pop();
                        if (dashboardCtrl != null) {
                          dashboardCtrl.setNavIndex(2);
                        } else {
                          Get.toNamed(Routes.DRIVER_SCHEDULE);
                        }
                      },
                    );
                  }),

                  // 2.4 Fleet Work Orders
                  _buildNavItem(
                    icon: Icons.engineering_rounded,
                    title: 'fleet_work_orders'.tr,
                    iconColor: const Color(0xFFF59E0B),
                    isSelected: currentRoute == Routes.DRIVER_WORK_ORDERS ||
                        currentRoute == Routes.DRIVER_CREATE_WORK_ORDER ||
                        currentRoute == Routes.DRIVER_WORK_ORDER_DETAILS,
                    badgeWidget: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'tech_badge'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.DRIVER_WORK_ORDERS);
                    },
                  ),

                  // 2.5 Report Incident
                  _buildNavItem(
                    icon: Icons.warning_amber_rounded,
                    title: 'report_incident'.tr,
                    iconColor: const Color(0xFFF43F5E),
                    isSelected: currentRoute == Routes.DRIVER_REPORT_INCIDENT,
                    badgeWidget: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF43F5E).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        'sos_caps'.tr,
                        style: const TextStyle(
                          color: Color(0xFFF43F5E),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.DRIVER_REPORT_INCIDENT);
                    },
                  ),

                  // 2.6 Incidents Log
                  Obx(() {
                    final isSelected = currentRoute == Routes.DRIVER_INCIDENTS_LIST ||
                        currentRoute == Routes.DRIVER_INCIDENT_DETAILS ||
                        (currentRoute == Routes.DRIVER_DASHBOARD &&
                            (dashboardCtrl?.selectedNavIndex.value ?? -1) == 3);
                    return _buildNavItem(
                      icon: Icons.assignment_outlined,
                      title: 'incidents_log'.tr,
                      iconColor: AppTheme.gradientPink,
                      isSelected: isSelected,
                      onTap: () {
                        Navigator.of(context).pop();
                        if (dashboardCtrl != null) {
                          dashboardCtrl.setNavIndex(3);
                        } else {
                          Get.toNamed(Routes.DRIVER_INCIDENTS_LIST);
                        }
                      },
                    );
                  }),

                  // 2.7 Driver Documents
                  Obx(() {
                    final isDocVerified = homeCtrl?.isDocumentsVerified.value ?? true;
                    return _buildNavItem(
                      icon: Icons.folder_shared_outlined,
                      title: 'driver_documents'.tr,
                      iconColor: const Color(0xFF38BDF8),
                      isSelected: currentRoute == Routes.DRIVER_DOCUMENT,
                      badgeWidget: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isDocVerified
                              ? const Color(0xFF10B981).withValues(alpha: 0.15)
                              : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: isDocVerified
                                ? const Color(0xFF10B981).withValues(alpha: 0.3)
                                : const Color(0xFFF59E0B).withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          isDocVerified ? 'verified'.tr : 'pending'.tr,
                          style: TextStyle(
                            color: isDocVerified ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      onTap: () {
                        Navigator.of(context).pop();
                        Get.toNamed(Routes.DRIVER_DOCUMENT);
                      },
                    );
                  }),

                  const SizedBox(height: 16),

                  // --- SECTION 3: ALERTS & ACCOUNT ---
                  _buildSectionHeader('alerts_account_caps'.tr),

                  // 3.1 Alerts & Notifications
                  Obx(() {
                    final unread = homeCtrl?.notificationCount.value ?? 0;
                    final isSelected = currentRoute == Routes.DRIVER_NOTIFICATION;
                    return _buildNavItem(
                      icon: Icons.notifications_active_outlined,
                      title: 'alerts_notifications'.tr,
                      iconColor: const Color(0xFFFBBF24),
                      isSelected: isSelected,
                      badgeWidget: unread > 0
                          ? Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '$unread',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            )
                          : null,
                      onTap: () {
                        Navigator.of(context).pop();
                        Get.toNamed(Routes.DRIVER_NOTIFICATION);
                      },
                    );
                  }),

                  // 3.2 Driver Profile
                  Obx(() {
                    final isSelected = currentRoute == Routes.DRIVER_PROFILE ||
                        (currentRoute == Routes.DRIVER_DASHBOARD &&
                            (dashboardCtrl?.selectedNavIndex.value ?? -1) == 4);
                    return _buildNavItem(
                      icon: Icons.person_outline_rounded,
                      title: 'driver_profile'.tr,
                      iconColor: const Color(0xFF10B981),
                      isSelected: isSelected,
                      onTap: () {
                        Navigator.of(context).pop();
                        if (dashboardCtrl != null) {
                          dashboardCtrl.setNavIndex(4);
                        } else {
                          Get.toNamed(Routes.DRIVER_PROFILE);
                        }
                      },
                    );
                  }),

                  // 3.3 Account Settings
                  _buildNavItem(
                    icon: Icons.settings_outlined,
                    title: 'account_settings'.tr,
                    iconColor: Colors.white70,
                    isSelected: currentRoute == Routes.ACCOUNT_SETTINGS,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.ACCOUNT_SETTINGS);
                    },
                  ),

                  // 3.4 Change Language
                  _buildNavItem(
                    icon: Icons.language_rounded,
                    title: 'change_language'.tr,
                    iconColor: const Color(0xFF60A5FA),
                    isSelected: false,
                    onTap: () {
                      Navigator.of(context).pop();
                      LanguageSelectorSheet.show(context);
                    },
                  ),

                  // 3.5 Help & Documentation
                  _buildNavItem(
                    icon: Icons.help_outline_rounded,
                    title: 'help_documentation'.tr,
                    iconColor: Colors.white70,
                    isSelected: currentRoute == Routes.DRIVER_HELP_SUPPORT,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.DRIVER_HELP_SUPPORT);
                    },
                  ),

                  // 3.6 Privacy Policy
                  _buildNavItem(
                    icon: Icons.shield_outlined,
                    title: 'privacy_policy'.tr,
                    iconColor: Colors.white70,
                    isSelected: currentRoute == Routes.PRIVACY_POLICY,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.PRIVACY_POLICY);
                    },
                  ),

                  // 3.7 Terms & Conditions
                  _buildNavItem(
                    icon: Icons.article_outlined,
                    title: 'terms_conditions'.tr,
                    iconColor: Colors.white70,
                    isSelected: currentRoute == Routes.TERMS_CONDITIONS,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.TERMS_CONDITIONS);
                    },
                  ),
                ],
              ),
            ),

            // --- BOTTOM LOGOUT PORTAL ---
            const Divider(color: kBorder, height: 1),
            _buildLogoutTile(context),
          ],
        ),
      ),
    );
  }

  // --- Brand Header with Logo & Close Button ---
  Widget _buildBrandHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Image.asset(
                'assets/app_logo/newLogo.png',
                height: 30,
                errorBuilder: (context, error, stackTrace) => Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.bolt, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'VMOVEXA',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'driver'.tr,
                  style: const TextStyle(
                    color: AppTheme.gradientBlue,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          InkWell(
            onTap: () => Navigator.of(context).pop(),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: kBorder),
              ),
              child: const Icon(
                Icons.chevron_left_rounded,
                color: Colors.white70,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Driver Profile Summary Card ---
  Widget _buildDriverProfileCard({
    required String driverName,
    required String orgName,
    required String badgeId,
    required String avatarUrl,
    required bool isVerified,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kSurfaceBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: avatarUrl.isEmpty
                    ? AppTheme.primaryGradient
                    : null,
                border: Border.all(color: AppTheme.gradientBlue, width: 1.5),
              ),
              child: ClipOval(
                child: avatarUrl.isNotEmpty
                    ? Image.network(
                        avatarUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => _buildAvatarFallback(driverName),
                      )
                    : _buildAvatarFallback(driverName),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          driverName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Status Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isVerified
                              ? const Color(0xFF10B981).withValues(alpha: 0.15)
                              : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: isVerified
                                ? const Color(0xFF10B981).withValues(alpha: 0.3)
                                : const Color(0xFFF59E0B).withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 5,
                              height: 5,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isVerified
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFF59E0B),
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isVerified ? 'verified'.tr : 'doc_verification_pending'.tr,
                              style: TextStyle(
                                color: isVerified
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFF59E0B),
                                fontSize: 8.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    orgName,
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 10.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${'badge_label'.tr} $badgeId',
                    style: const TextStyle(
                      color: Color(0xFF818CF8),
                      fontSize: 9.5,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarFallback(String name) {
    final initials = name.trim().isNotEmpty
        ? name.trim().split(' ').map((p) => p.isNotEmpty ? p[0] : '').take(2).join().toUpperCase()
        : 'DR';
    return Center(
      child: Text(
        initials,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 15,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // --- Section Category Header ---
  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 10, top: 6, bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF71717A),
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  // --- Standard Nav Item Tile ---
  Widget _buildNavItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color iconColor = Colors.white70,
    bool isSelected = false,
    Widget? badgeWidget,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2.5),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: isSelected ? AppTheme.primaryGradient : null,
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ]
            : null,
      ),
      child: ListTile(
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        minLeadingWidth: 26,
        leading: Icon(
          icon,
          color: isSelected ? Colors.white : iconColor,
          size: 19,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFFE4E4E7),
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
        trailing: badgeWidget,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        onTap: onTap,
      ),
    );
  }

  // --- Bottom Logout Tile & Confirmation Dialog ---
  Widget _buildLogoutTile(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: InkWell(
        onTap: () => _showLogoutConfirmation(context),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFEF4444).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: const Color(0xFFEF4444).withValues(alpha: 0.25),
            ),
          ),
          child: Row(
            children: [
              const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 19),
              const SizedBox(width: 12),
              Text(
                'logout_portal'.tr,
                style: const TextStyle(
                  color: Color(0xFFEF4444),
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLogoutConfirmation(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(22),
        decoration: const BoxDecoration(
          color: Color(0xFF151522),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: kBorder, width: 1.2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 24),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'logout_from_portal'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'end_current_driving_session'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 18),
            Text(
              'logout_driver_confirm_msg'.tr,
              style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4),
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      side: const BorderSide(color: kBorder),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () => Get.back(),
                    child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      backgroundColor: const Color(0xFFEF4444),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () async {
                      Get.back(); // close bottomsheet
                      if (Get.isRegistered<AuthService>()) {
                        await AuthService.to.logout();
                      }
                      Get.offAllNamed(Routes.LOGIN);
                    },
                    child: Text(
                      'yes_logout'.tr,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }
}

extension StringExtension on String {
  String takeIfValid(int length) {
    if (this.length <= length) return this;
    return substring(0, length);
  }
}
