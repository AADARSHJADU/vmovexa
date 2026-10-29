import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/driver_details_controller.dart';

class DriverDetailsView extends GetView<DriverDetailsController> {
  const DriverDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          final d = controller.driver.value;
          if (controller.isLoading.value && d == null) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
          }

          if (d == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.person_off_outlined, color: Colors.white24, size: 64),
                  const SizedBox(height: 16),
                  const Text('Driver profile not found', style: TextStyle(color: Colors.white70, fontSize: 16)),
                  const SizedBox(height: 20),
                  CustomButton(
                    text: 'Back to Drivers',
                    onTap: () => Get.back(),
                    width: 160,
                    height: 42,
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // Top Bar
              _buildTopBar(context, d),

              // Scrollable Content
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () => controller.loadDriverDetails(controller.driverId),
                  color: const Color(0xFF10B981),
                  backgroundColor: AppColors.cardBg,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Profile Banner Card
                        _buildProfileCard(d),
                        const SizedBox(height: 14),

                        // Stats Quick Strip
                        _buildStatsStrip(d),
                        const SizedBox(height: 14),

                        // Section 1: Commercial DL & Regulatory Compliance
                        _buildLicenseComplianceCard(d),
                        const SizedBox(height: 14),

                        // Section 2: Operations & Shift Assignment
                        _buildOperationsShiftCard(d),
                        const SizedBox(height: 14),

                        // Section 3: Residential & Emergency Contact
                        _buildContactAddressCard(d),
                        const SizedBox(height: 14),

                        // Section 4: Attached KYC Documents
                        _buildDocumentsCard(d),

                        if (d.notes.trim().isNotEmpty) ...[
                          const SizedBox(height: 14),
                          _buildNotesCard(d),
                        ],

                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
      bottomNavigationBar: Obx(() {
        final d = controller.driver.value;
        if (d == null) return const SizedBox.shrink();
        return _buildBottomActions(d);
      }),
    );
  }

  Widget _buildTopBar(BuildContext context, DriverItemModel d) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const CustomBackButton(),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    d.name,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Badge ID: ${d.displayBadgeId}',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace'),
                  ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.edit_outlined, color: Colors.white, size: 22),
                tooltip: 'Edit Driver',
                onPressed: controller.goToEditDriver,
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 24),
                color: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                onSelected: (val) {
                  if (val == 'edit') {
                    controller.goToEditDriver();
                  } else if (val == 'active') {
                    controller.toggleDutyStatus('available');
                  } else if (val == 'off_duty') {
                    controller.toggleDutyStatus('off_duty');
                  } else if (val == 'verify') {
                    controller.verifyDriverDocs();
                  } else if (val == 'delete') {
                    controller.confirmDeleteDriver();
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit_note_rounded, color: Color(0xFF38BDF8), size: 18),
                        SizedBox(width: 10),
                        Text('Edit Driver Details', style: TextStyle(color: Colors.white, fontSize: 13)),
                      ],
                    ),
                  ),
                  if (!d.isAvailable)
                    const PopupMenuItem(
                      value: 'active',
                      child: Row(
                        children: [
                          Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 18),
                          SizedBox(width: 10),
                          Text('Set Active (Available)', style: TextStyle(color: Color(0xFF10B981), fontSize: 13)),
                        ],
                      ),
                    ),
                  if (d.isAvailable || d.isOnDuty)
                    const PopupMenuItem(
                      value: 'off_duty',
                      child: Row(
                        children: [
                          Icon(Icons.pause_circle_outline_rounded, color: Color(0xFF94A3B8), size: 18),
                          SizedBox(width: 10),
                          Text('Set Off Duty (Deactivate)', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        ],
                      ),
                    ),
                  if (!d.isVerified)
                    const PopupMenuItem(
                      value: 'verify',
                      child: Row(
                        children: [
                          Icon(Icons.verified_outlined, color: Color(0xFF14B8A6), size: 18),
                          SizedBox(width: 10),
                          Text('Verify KYC Documents', style: TextStyle(color: Color(0xFF14B8A6), fontSize: 13)),
                        ],
                      ),
                    ),
                  const PopupMenuDivider(height: 8),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                        SizedBox(width: 10),
                        Text('Delete Driver', style: TextStyle(color: Color(0xFFEF4444), fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProfileCard(DriverItemModel d) {
    Color dutyColor = const Color(0xFF64748B);
    String dutyLabel = d.status.toUpperCase();
    if (d.isOnDuty) {
      dutyColor = const Color(0xFF3B82F6);
      dutyLabel = 'ON DUTY';
    } else if (d.isAvailable) {
      dutyColor = const Color(0xFF10B981);
      dutyLabel = 'AVAILABLE';
    } else if (d.isPendingApproval) {
      dutyColor = const Color(0xFFF59E0B);
      dutyLabel = 'PENDING APPROVAL';
    } else if (d.isComplianceBlocked) {
      dutyColor = const Color(0xFFEF4444);
      dutyLabel = 'COMPLIANCE BLOCKED';
    }

    final avatarUrl = ApiConstants.resolveFileUrl(d.avatarUrl);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar with fallback
              Stack(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5), width: 2),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: avatarUrl.isNotEmpty
                        ? Image.network(
                            avatarUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => _buildAvatarFallback(d),
                          )
                        : _buildAvatarFallback(d),
                  ),
                  Positioned(
                    bottom: 2,
                    right: 2,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: dutyColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.cardBg, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),

              // Name, Badge & Phone
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      d.name,
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            d.displayBadgeId,
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        if (d.bloodGroup.isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              'Blood: ${d.bloodGroup}',
                              style: const TextStyle(
                                color: Color(0xFFF87171),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.phone_rounded, size: 14, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text(d.phone.isNotEmpty ? d.phone : 'No phone', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                    if (d.email.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.email_outlined, size: 14, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              d.email,
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),

          const Divider(color: AppColors.cardBorder, height: 22),

          // Badge Status Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Duty status badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: dutyColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: dutyColor.withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    Container(width: 6, height: 6, decoration: BoxDecoration(color: dutyColor, shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    Text(dutyLabel, style: TextStyle(color: dutyColor, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),

              // KYC Status badge
              if (d.kycRejected)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.cancel_rounded, size: 12, color: Color(0xFFEF4444)),
                      SizedBox(width: 4),
                      Text('KYC REJECTED', style: TextStyle(color: Color(0xFFEF4444), fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                )
              else if (d.isVerified)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.verified_rounded, size: 12, color: Color(0xFF10B981)),
                      SizedBox(width: 4),
                      Text('DOCS VERIFIED', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.schedule_rounded, size: 12, color: Color(0xFFF59E0B)),
                      SizedBox(width: 4),
                      Text('DOCS PENDING', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarFallback(DriverItemModel d) {
    return Center(
      child: Text(
        d.name.isNotEmpty ? d.name[0].toUpperCase() : 'D',
        style: const TextStyle(color: Color(0xFF10B981), fontSize: 24, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildStatsStrip(DriverItemModel d) {
    return Row(
      children: [
        Expanded(
          child: _buildStatItem('RATING', '${d.rating.toStringAsFixed(1)} ★', const Color(0xFFFBBF24)),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildStatItem('EXPERIENCE', d.experienceYears.isNotEmpty ? d.experienceYears : '5 Yrs', const Color(0xFF60A5FA)),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildStatItem('TRANSIT BUS', d.displayBus, const Color(0xFF34D399)),
        ),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, Color accent) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(color: accent, fontSize: 12, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildLicenseComplianceCard(DriverItemModel d) {
    final dlValid = !d.dlStatus.toLowerCase().contains('expir');

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
              Icon(Icons.badge_outlined, color: Color(0xFF10B981), size: 18),
              SizedBox(width: 8),
              Text(
                'Commercial Driving License & KYC',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 20),

          _buildDetailRow('DL Number', d.licenseNumber.isNotEmpty ? d.licenseNumber : '—', isHighlight: true),
          _buildDetailRow('License Type', d.licenseType),
          _buildDetailRow(
            'DL Expiry Date',
            d.dlExpiry.isNotEmpty ? d.dlExpiry : '—',
            customValueColor: dlValid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
          ),
          if (d.issueDate.isNotEmpty)
            _buildDetailRow('Issue Date', d.issueDate),
          _buildDetailRow('RTO Issuing Authority', d.issuingAuthority.isNotEmpty ? d.issuingAuthority : '—'),
          _buildDetailRow(
            'Medical Certificate Validity',
            d.medicalFitnessValidUntil.isNotEmpty ? d.medicalFitnessValidUntil : '—',
          ),
          _buildDetailRow(
            'Aadhaar KYC',
            d.aadhaarVerified ? 'Verified' : 'Pending',
            customValueColor: d.aadhaarVerified ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
          ),
        ],
      ),
    );
  }

  Widget _buildOperationsShiftCard(DriverItemModel d) {
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
              Icon(Icons.schedule_rounded, color: Color(0xFF38BDF8), size: 18),
              SizedBox(width: 8),
              Text(
                'Operations & Shift Schedule',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 20),

          _buildDetailRow('Home Depot', d.displayDepot),
          _buildDetailRow('Designated Transit Bus', d.displayBus),
          _buildDetailRow('Active Shift Roster', d.displayShift, isHighlight: true),
          if (d.joiningDate.isNotEmpty)
            _buildDetailRow('Date of Joining', d.joiningDate),
          _buildDetailRow('Driving Experience', d.experienceYears),
        ],
      ),
    );
  }

  Widget _buildContactAddressCard(DriverItemModel d) {
    final fullAddress = [
      if (d.address.isNotEmpty) d.address,
      if (d.city.isNotEmpty) d.city,
      if (d.state.isNotEmpty) d.state,
      if (d.pincode.isNotEmpty) 'PIN: ${d.pincode}',
    ].join(', ');

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
              Icon(Icons.home_work_outlined, color: Color(0xFFA855F7), size: 18),
              SizedBox(width: 8),
              Text(
                'Residential & Emergency Contact',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 20),

          _buildDetailRow('Residential Address', fullAddress.isNotEmpty ? fullAddress : '—'),
          if (d.dob.isNotEmpty)
            _buildDetailRow('Date of Birth', d.dob),
          _buildDetailRow('Gender', d.gender),
          const Divider(color: AppColors.cardBorder, height: 16),
          const Text('Emergency Contact Details', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _buildDetailRow('Contact Person', d.emergencyContactName.isNotEmpty ? d.emergencyContactName : '—'),
          _buildDetailRow('Relationship', d.emergencyContactRelation),
          _buildDetailRow('Emergency Phone', d.emergencyContact.isNotEmpty ? d.emergencyContact : '—', isHighlight: true),
        ],
      ),
    );
  }

  Widget _buildDocumentsCard(DriverItemModel d) {
    final docs = d.documents;

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
                  Icon(Icons.folder_shared_outlined, color: Color(0xFF10B981), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'KYC & Compliance Documents',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Text(
                '${docs.length} Attached',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 20),

          if (docs.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: AppColors.textMuted, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    'No documents uploaded yet.',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
                  ),
                ],
              ),
            )
          else
            ...docs.map((doc) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.inputBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.description_outlined, color: Color(0xFF10B981), size: 16),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              doc.name,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              doc.category,
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('VERIFIED', style: TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )),
        ],
      ),
    );
  }

  Widget _buildNotesCard(DriverItemModel d) {
    return Container(
      width: double.infinity,
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
              Icon(Icons.sticky_note_2_outlined, color: Color(0xFFFBBF24), size: 18),
              SizedBox(width: 8),
              Text('Notes & Special Instructions', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          Text(d.notes, style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isHighlight = false, Color? customValueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 4,
            child: Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 5,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                color: customValueColor ?? (isHighlight ? const Color(0xFF38BDF8) : Colors.white),
                fontSize: 12,
                fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActions(DriverItemModel d) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: controller.goToEditDriver,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF38BDF8)),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.edit_outlined, size: 16, color: Color(0xFF38BDF8)),
              label: const Text('Edit Driver', style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 13)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                final newStatus = d.isAvailable ? 'off_duty' : 'available';
                controller.toggleDutyStatus(newStatus);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: d.isAvailable ? const Color(0xFF64748B) : const Color(0xFF10B981),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: Icon(d.isAvailable ? Icons.pause_circle_outline_rounded : Icons.play_circle_outline_rounded, size: 16, color: Colors.white),
              label: Text(
                d.isAvailable ? 'Set Off Duty' : 'Set Available',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
