import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/advertiser_dashboard_controller.dart';

class CampaignLifecycleFlowWidget extends StatelessWidget {
  final AdvertiserDashboardController controller;

  const CampaignLifecycleFlowWidget({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Accent Line
          Container(
            height: 3,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
          ),

          // Header + Collapsible Toggle
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                            ),
                            child: const Text(
                              'VMOVEXA DOOH ENGINE',
                              style: TextStyle(
                                color: Color(0xFF818CF8),
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'End-to-End\nCampaign Flow',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Campaign Approval\nBroadcast Lifecycle',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Obx(() => GestureDetector(
                      onTap: controller.toggleDiagram,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Text(
                          controller.showDiagram.value ? 'Hide ▲' : 'Show ▼',
                          style: const TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    )),
              ],
            ),
          ),

          // 3 Engine Tabs (Visual Pipeline, Roles & Actions, Status Matrix)
          Obx(() {
            if (!controller.showDiagram.value) return const SizedBox.shrink();

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Tab Switcher Pills
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildTabButton('pipeline', 'Visual Pipeline', Icons.rocket_launch_outlined),
                        const SizedBox(width: 8),
                        _buildTabButton('roles', 'Roles & Actions', Icons.person_outline_rounded),
                        const SizedBox(width: 8),
                        _buildTabButton('matrix', 'Status Matrix', Icons.table_chart_outlined),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Tab Content Body
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                  child: _buildActiveTabContent(),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTabButton(String key, String label, IconData icon) {
    return Obx(() {
      final isSelected = controller.activeLifecycleTab.value == key;
      return GestureDetector(
        onTap: () => controller.setLifecycleTab(key),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            color: isSelected ? null : const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? Colors.transparent : AppColors.cardBorder,
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: isSelected ? Colors.white : AppColors.textMuted),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildActiveTabContent() {
    switch (controller.activeLifecycleTab.value) {
      case 'pipeline':
        return _buildVisualPipelineTab();
      case 'roles':
        return _buildRolesTab();
      case 'matrix':
        return _buildStatusMatrixTab();
      default:
        return _buildVisualPipelineTab();
    }
  }

  // ==========================================
  // TAB 1: VISUAL PIPELINE
  // ==========================================
  Widget _buildVisualPipelineTab() {
    final steps = [
      {
        'id': 1,
        'title': '1. Advertiser Creates Campaign',
        'role': 'Commercial Advertiser',
        'action': 'Configures Creative, Target Screens & Budget',
        'status': 'pending_approval',
        'paymentStatus': 'unpaid',
        'icon': Icons.campaign_rounded,
        'color': const Color(0xFF3B82F6),
        'api': 'POST /api/v1/campaigns',
        'notification': 'SuperAdmin: "New DOOH Ad Campaign Submitted for Review"',
        'details': [
          'Uploads 1080p/4K video creative (MP4/PNG) or live YouTube demo URL.',
          'Selects target transit fleets and cities.',
          'Defines broadcast schedule (active days, operating hours 08:00–22:00).',
          'Submits campaign to the DOOH network for compliance review.',
        ],
      },
      {
        'id': 2,
        'title': '2. Super Admin Verification',
        'role': 'Platform Super Admin',
        'action': 'Reviews Content Compliance & Approves',
        'status': 'approved',
        'paymentStatus': 'unpaid',
        'icon': Icons.verified_user_rounded,
        'color': const Color(0xFF8B5CF6),
        'api': 'POST /api/v1/campaigns/:id/verify',
        'notification': 'Advertiser: "Campaign Verified — Payment Required to Launch"',
        'details': [
          'SuperAdmin audits video content against safety & regulatory standards.',
          'Verifies campaign (status changes to "approved").',
          'Backend generates cryptographic payment_token.',
          'Automatic alert dispatched to advertiser with payment link.',
        ],
      },
      {
        'id': 3,
        'title': '3. Send Payment Link to Customer',
        'role': 'Customer / Client Payer',
        'action': 'Share Payment Checkout Link via SMS / Email / WhatsApp',
        'status': 'approved',
        'paymentStatus': 'unpaid → paid',
        'icon': Icons.share_rounded,
        'color': const Color(0xFF10B981),
        'api': 'POST /api/v1/campaigns/:id/share-payment-link',
        'notification': 'Customer: "Payment request for DOOH Campaign via SMS/Email"',
        'details': [
          'Advertiser dispatches payment checkout link directly to client/customer.',
          'Dispatched via SMS, Email tax invoice, or WhatsApp interactive pay button.',
          'Customer opens link in browser and completes payment checkout (18% GST).',
          'Payment gateway clears transaction and marks payment as paid.',
        ],
      },
      {
        'id': 4,
        'title': '4. Payment Approved & Ready',
        'role': 'Platform & Billing Gateway',
        'action': 'Payment Confirmed, QR Generated & Ready to Launch',
        'status': 'approved',
        'paymentStatus': 'paid',
        'icon': Icons.check_circle_rounded,
        'color': const Color(0xFFF59E0B),
        'api': 'POST /api/v1/campaigns/:id/confirm-payment',
        'notification': 'Advertiser: "Payment Confirmed! Your campaign is ready to Start."',
        'details': [
          'Razorpay callback confirms funds received; payment ledger updated.',
          'Dynamic Campaign QR code automatically generated for passenger scan tracking.',
          'Campaign moves to "Ready" state — Advertiser now has full control to Start.',
          'GST invoice automatically issued to payer.',
        ],
      },
      {
        'id': 5,
        'title': '5. Advertiser Controls Ad: Start & Stop',
        'role': 'Advertiser & IoT Fleet Screens',
        'action': 'Manual Start / Stop Control with Real-Time MQTT Sync',
        'status': 'live ⟷ paused',
        'paymentStatus': 'paid',
        'icon': Icons.play_arrow_rounded,
        'color': const Color(0xFF06B6D4),
        'api': 'POST /api/v1/campaigns/:id/start & /stop',
        'notification': 'Transit Displays: PLAY_CAMPAIGN / STOP_CAMPAIGN via MQTT',
        'details': [
          'Advertiser clicks "Start Ad" anytime to launch broadcast on targeted buses.',
          'MQTT broker dispatches PLAY_CAMPAIGN message to online Android display boxes.',
          'Advertiser can click "Stop / Pause Ad" anytime to immediately halt playback.',
          'Passengers scan on-screen QR code; real-time impressions update live.',
        ],
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 5 Horizontal Cards (Scrollable)
        SizedBox(
          height: 145,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: steps.length,
            separatorBuilder: (context, index) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final step = steps[index];
              final stepId = step['id'] as int;
              final color = step['color'] as Color;

              return Obx(() {
                final isSelected = controller.selectedPipelineStep.value == stepId;

                return GestureDetector(
                  onTap: () => controller.selectPipelineStep(stepId),
                  child: Container(
                    width: 180,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF8B5CF6) : AppColors.cardBorder,
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                                blurRadius: 10,
                                spreadRadius: 1,
                              )
                            ]
                          : null,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              width: 30,
                              height: 30,
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(step['icon'] as IconData, color: color, size: 16),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                isSelected ? '● Active' : 'Step $stepId',
                                style: TextStyle(
                                  color: isSelected ? Colors.white : AppColors.textMuted,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              step['title'] as String,
                              style: TextStyle(
                                color: isSelected ? Colors.white : const Color(0xFFE2E8F0),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 3),
                            Text(
                              step['action'] as String,
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 9.5,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                step['role'] as String,
                                style: TextStyle(
                                  color: color,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const Icon(Icons.arrow_forward_rounded, color: Color(0xFF818CF8), size: 12),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              });
            },
          ),
        ),

        const SizedBox(height: 12),

        // Expanded Step Details Card
        Obx(() {
          final selId = controller.selectedPipelineStep.value;
          final step = steps.firstWhere((s) => s['id'] == selId, orElse: () => steps[0]);
          final color = step['color'] as Color;
          final details = step['details'] as List<String>;

          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with status badges
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(step['icon'] as IconData, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Stage $selId: ${step['title']}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Primary Actor: ${step['role']}',
                            style: TextStyle(color: color, fontSize: 10.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Status & Payment badges row
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Text(
                        'Status: ${step['status']}'.toUpperCase(),
                        style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Text(
                        'Payment: ${step['paymentStatus']}'.toUpperCase(),
                        style: const TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Highlights Checklist
                const Text(
                  'SYSTEM WORKFLOW HIGHLIGHTS:',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Column(
                  children: details.map((item) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 14),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              item,
                              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 10),
                const Divider(color: AppColors.cardBorder, height: 1),
                const SizedBox(height: 10),

                // Triggered API Endpoint
                Row(
                  children: [
                    const Text('⚡ API Trigger: ', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF000000),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          step['api'] as String,
                          style: const TextStyle(
                            color: Color(0xFF34D399),
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                // Automated Dispatch
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.notifications_active_outlined, color: Color(0xFF818CF8), size: 14),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        step['notification'] as String,
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // ==========================================
  // TAB 2: ROLES & RESPONSIBILITIES
  // ==========================================
  Widget _buildRolesTab() {
    return Column(
      children: [
        _buildRoleCard(
          title: 'Commercial Advertiser',
          badge: 'Primary Creator & Manager',
          badgeColor: const Color(0xFF3B82F6),
          icon: Icons.campaign_rounded,
          accentGradient: const [Color(0xFF3B82F6), Color(0xFF6366F1)],
          items: [
            'Configures creative video (1080p/4K MP4) & live demo links.',
            'Chooses target transit bus operators, routes, and screen densities.',
            'Submits campaign for administrative compliance review.',
            'Payment Options: Pays directly OR sends payment checkout link to Client via SMS, Email, or WhatsApp.',
            'Full Broadcast Control: Clicks "Start Ad" to broadcast on bus screens or "Stop Ad" to pause playback anytime.',
            'Monitors passenger QR scans and live Proof-of-Play telemetry.',
          ],
        ),
        const SizedBox(height: 10),
        _buildRoleCard(
          title: 'Platform Super Admin',
          badge: 'Compliance Authority',
          badgeColor: const Color(0xFF8B5CF6),
          icon: Icons.shield_outlined,
          accentGradient: const [Color(0xFF8B5CF6), Color(0xFFEC4899)],
          items: [
            'Reviews pending queue in SuperAdmin Dashboard.',
            'Audits video creative against DOOH community guidelines.',
            'Approves campaign & triggers secure cryptographic payment token.',
            'Or rejects with custom feedback if guidelines are violated.',
            'Retains emergency authority to pause or revoke any active ad broadcast.',
          ],
        ),
        const SizedBox(height: 10),
        _buildRoleCard(
          title: 'Transit Screen & IoT Node',
          badge: 'Edge Display Player',
          badgeColor: const Color(0xFF10B981),
          icon: Icons.directions_bus_rounded,
          accentGradient: const [Color(0xFFF59E0B), Color(0xFF10B981)],
          items: [
            'Subscribes to MQTT topic: vehicle/{box_id}/campaign.',
            'Downloads creative file, verifies checksum & caches locally.',
            'Plays ad video upon PLAY_CAMPAIGN; pauses immediately upon STOP_CAMPAIGN.',
            'Renders dynamic QR code & streams real-time telemetry back to server.',
          ],
        ),
      ],
    );
  }

  Widget _buildRoleCard({
    required String title,
    required String badge,
    required Color badgeColor,
    required IconData icon,
    required List<Color> accentGradient,
    required List<String> items,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Accent line
          Container(
            height: 3,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: accentGradient),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: accentGradient),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: badgeColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              badge,
                              style: TextStyle(color: badgeColor, fontSize: 8.5, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Column(
                  children: items.map((it) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 5),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('•', style: TextStyle(color: badgeColor, fontSize: 14, height: 1.1)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(it, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10.5)),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 3: STATUS STATE MACHINE MATRIX
  // ==========================================
  Widget _buildStatusMatrixTab() {
    final rows = [
      {
        'stage': '1. Creation',
        'status': 'pending_approval',
        'statusColor': const Color(0xFFF59E0B),
        'payment': 'unpaid',
        'paymentColor': const Color(0xFFEF4444),
        'actor': 'Commercial Advertiser',
        'action': 'Submits 6-Step Form (POST /campaigns)',
      },
      {
        'stage': '2. Admin Approval',
        'status': 'approved',
        'statusColor': const Color(0xFF3B82F6),
        'payment': 'unpaid',
        'paymentColor': const Color(0xFFEF4444),
        'actor': 'Platform Super Admin',
        'action': 'Verifies Creative (POST /campaigns/:id/verify)',
      },
      {
        'stage': '3. Customer / Direct Payment',
        'status': 'approved',
        'statusColor': const Color(0xFF3B82F6),
        'payment': 'paid',
        'paymentColor': const Color(0xFF10B981),
        'actor': 'Advertiser or Client via SMS/Email',
        'action': 'Payment Cleared (POST /campaigns/:id/confirm-payment)',
      },
      {
        'stage': '4. Manual Start (Live)',
        'status': 'live',
        'statusColor': const Color(0xFF10B981),
        'payment': 'paid',
        'paymentColor': const Color(0xFF10B981),
        'actor': 'Commercial Advertiser',
        'action': 'Clicks "Start Ad" (POST /campaigns/:id/start)',
      },
      {
        'stage': '5. Manual Stop (Paused)',
        'status': 'paused',
        'statusColor': const Color(0xFFF97316),
        'payment': 'paid',
        'paymentColor': const Color(0xFF10B981),
        'actor': 'Commercial Advertiser',
        'action': 'Clicks "Stop Ad" (POST /campaigns/:id/stop)',
      },
      {
        'stage': '6. Schedule End',
        'status': 'completed',
        'statusColor': const Color(0xFF64748B),
        'payment': 'paid',
        'paymentColor': const Color(0xFF10B981),
        'actor': 'Automated Schedule',
        'action': 'End date reached; final proof-of-play generated',
      },
    ];

    return Column(
      children: rows.map((r) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(r['stage'] as String, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: (r['statusColor'] as Color).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      r['status'] as String,
                      style: TextStyle(color: r['statusColor'] as Color, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Text('Payment: ', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                  Text(
                    (r['payment'] as String).toUpperCase(),
                    style: TextStyle(color: r['paymentColor'] as Color, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  Text(r['actor'] as String, style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Action: ${r['action']}',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
