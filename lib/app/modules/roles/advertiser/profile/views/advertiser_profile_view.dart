import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../controllers/advertiser_profile_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../routes/app_routes.dart';

class AdvertiserProfileView extends GetView<AdvertiserProfileController> {
  const AdvertiserProfileView({super.key});

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
                    'Profile',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 24),
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                physics: const BouncingScrollPhysics(),
                child: Column(
                  children: [
                    // Avatar and Title block
                    _buildAvatarBlock(),
                    const SizedBox(height: 20),

                    // Company Information Card
                    _buildCompanyInfoCard(),
                    const SizedBox(height: 18),

                    // Primary Contact Card
                    _buildPrimaryContactCard(),
                    const SizedBox(height: 18),

                    // Billing Information Card
                    _buildBillingInfoCard(),
                    const SizedBox(height: 18),

                    // Change Password row
                    _buildChangePasswordRow(),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarBlock() {
    return Column(
      children: [
        Stack(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)]),
              ),
              child: const Center(
                child: Text(
                  'VM',
                  style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle),
                child: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        const Text(
          'VMOVEXA Advertising Pvt. Ltd.',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.12),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: const [
                  Icon(Icons.verified_user_rounded, color: Color(0xFF10B981), size: 10),
                  SizedBox(width: 4),
                  Text('Verified Advertiser', style: TextStyle(color: Color(0xFF10B981), fontSize: 8.5, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text('contact@vmovexa.com  |  +91 98765 43210', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
        const SizedBox(height: 18),

        // Status bar cards row
        Row(
          children: [
            Expanded(child: _buildStatusMiniCell('Member Since', '12 May 2026', "assets/icons/fleet_operator_icons/fleetsManagedA.svg")),
            const SizedBox(width: 8),
            Expanded(child: _buildStatusMiniCell('Account ID', 'ADV-2026-000124', "assets/icons/fleet_operator_icons/fleetsManagedA.svg")),
            const SizedBox(width: 8),
            Expanded(child: _buildStatusMiniCell('Account Status', 'Active', "assets/icons/fleet_operator_icons/fleetsManagedA.svg", isSuccessColor: true)),
          ],
        ),
      ],
    );
  }

  Widget _buildStatusMiniCell(String label, String val, String icon, {bool isSuccessColor = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
       SvgPicture.asset(icon),
          const SizedBox(height: 6),
          Text(val, style: TextStyle(color: isSuccessColor ? const Color(0xFF10B981) : Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
        ],
      ),
    );
  }

  Widget _buildCompanyInfoCard() {
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
          const Text('Company Information', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildInfoRow('Company Name', controller.companyName.value),
          _buildInfoRow('Business Type', controller.businessType.value),
          _buildInfoRow('GST Number', controller.gstNumber.value),
          _buildInfoRow('PAN Number', controller.panNumber.value),
          _buildInfoRow('Registered Address', controller.registeredAddress.value),
          _buildInfoRow('Business Website', controller.website.value),
        ],
      ),
    );
  }

  Widget _buildPrimaryContactCard() {
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
          const Text('Primary Contact', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildInfoRow('Contact Person', controller.contactPerson.value),
          _buildInfoRow('Email Address', controller.contactEmail.value),
          _buildInfoRow('Phone Number', controller.contactPhone.value),
        ],
      ),
    );
  }

  Widget _buildBillingInfoCard() {
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
          const Text('Billing Information', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildInfoRow('Billing Email', controller.billingEmail.value),
          _buildInfoRow('Invoices Email', controller.invoicesEmail.value),
          _buildInfoRow('Payment Terms', controller.paymentTerms.value),
        ],
      ),
    );
  }

  Widget _buildChangePasswordRow() {
    return GestureDetector(
      onTap: () => Get.toNamed(Routes.CHANGE_PASSWORD),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          children: const [
            Icon(Icons.lock_outline_rounded, color: Color(0xFF8B5CF6), size: 18),
            SizedBox(width: 14),
            Expanded(child: Text('Change Password', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold))),
            Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
