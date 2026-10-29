import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
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

    final isVerified = homeCtrl?.isDocumentsVerified.value ?? true;

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
                  _buildSectionHeader('OVERVIEW'),
                  Obx(() {
                    final isSelected = (dashboardCtrl?.selectedNavIndex.value ?? 0) == 0;
                    return _buildNavItem(
                      icon: Icons.dashboard_rounded,
                      title: 'Dashboard',
                      isSelected: isSelected,
                      iconColor: const Color(0xFF8B5CF6),
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
                  _buildSectionHeader('DISPATCH & ROUTES'),
                  _buildNavItem(
                    icon: Icons.folder_shared_outlined,
                    title: 'Documents',
                    iconColor: const Color(0xFF38BDF8),
                    badgeWidget: Container(
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
                      child: Text(
                        isVerified ? 'Verified' : 'Pending',
                        style: TextStyle(
                          color: isVerified ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.DRIVER_DOCUMENT);
                    },
                  ),
                  Obx(() {
                    final isSelected = (dashboardCtrl?.selectedNavIndex.value ?? -1) == 1;
                    return _buildNavItem(
                      icon: Icons.directions_bus_rounded,
                      title: 'My Routes',
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
                  Obx(() {
                    final isSelected = (dashboardCtrl?.selectedNavIndex.value ?? -1) == 2;
                    return _buildNavItem(
                      icon: Icons.calendar_month_rounded,
                      title: 'Shift Schedules',
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
                  _buildNavItem(
                    icon: Icons.warning_amber_rounded,
                    title: 'Report Incident',
                    iconColor: const Color(0xFFF43F5E),
                    badgeWidget: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF43F5E).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.4)),
                      ),
                      child: const Text(
                        'SOS',
                        style: TextStyle(
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
                  Obx(() {
                    final isSelected = (dashboardCtrl?.selectedNavIndex.value ?? -1) == 3;
                    return _buildNavItem(
                      icon: Icons.assignment_outlined,
                      title: 'Incidents Log',
                      iconColor: const Color(0xFFA855F7),
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

                  const SizedBox(height: 16),

                  // --- SECTION 3: ALERTS & ACCOUNT ---
                  _buildSectionHeader('ALERTS & ACCOUNT'),
                  Obx(() {
                    final unread = homeCtrl?.notificationCount.value ?? 0;
                    return _buildNavItem(
                      icon: Icons.notifications_active_outlined,
                      title: 'Alerts & Messages',
                      iconColor: const Color(0xFFFBBF24),
                      badgeWidget: unread > 0
                          ? Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: kPurple,
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
                  Obx(() {
                    final isSelected = (dashboardCtrl?.selectedNavIndex.value ?? -1) == 4;
                    return _buildNavItem(
                      icon: Icons.person_outline_rounded,
                      title: 'Profile',
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
                  _buildNavItem(
                    icon: Icons.settings_outlined,
                    title: 'Account Settings',
                    iconColor: Colors.white70,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.ACCOUNT_SETTINGS);
                    },
                  ),
                  _buildNavItem(
                    icon: Icons.help_outline_rounded,
                    title: 'Help & Documentation',
                    iconColor: Colors.white70,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.DRIVER_HELP_SUPPORT);
                    },
                  ),
                  _buildNavItem(
                    icon: Icons.shield_outlined,
                    title: 'Privacy Policy',
                    iconColor: Colors.white70,
                    onTap: () {
                      Navigator.of(context).pop();
                      Get.toNamed(Routes.PRIVACY_POLICY);
                    },
                  ),
                  _buildNavItem(
                    icon: Icons.article_outlined,
                    title: 'Terms of Service',
                    iconColor: Colors.white70,
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
                        gradient: const LinearGradient(
                          colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
                        ),
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
                child: const Text(
                  'Driver',
                  style: TextStyle(
                    color: Color(0xFFB042FF),
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
                    ? const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)])
                    : null,
                border: Border.all(color: const Color(0xFF8B5CF6), width: 1.5),
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
                              isVerified ? 'Verified' : 'Verification Pending',
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
                    'Badge: $badgeId',
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
        gradient: isSelected
            ? const LinearGradient(
                colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              )
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
          child: const Row(
            children: [
              Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 19),
              SizedBox(width: 12),
              Text(
                'Logout Portal',
                style: TextStyle(
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
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Logout from Portal',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'End current driving session',
                      style: TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 18),
            const Text(
              'Are you sure you want to log out of your driver account? Active route dispatch and telematics updates will be paused.',
              style: TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4),
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
                    child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
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
                    child: const Text(
                      'Yes, Logout',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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
