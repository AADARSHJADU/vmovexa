import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/tech_work_orders_controller.dart';
import '../controller/tech_work_order_detail_controller.dart';

class WorkOrderResolutionSheet extends StatefulWidget {
  final WorkOrderModel order;
  final VoidCallback? onResolved;

  const WorkOrderResolutionSheet({
    super.key,
    required this.order,
    this.onResolved,
  });

  static Future<void> show(BuildContext context, WorkOrderModel order, {VoidCallback? onResolved}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => WorkOrderResolutionSheet(order: order, onResolved: onResolved),
    );
  }

  @override
  State<WorkOrderResolutionSheet> createState() => _WorkOrderResolutionSheetState();
}

class _WorkOrderResolutionSheetState extends State<WorkOrderResolutionSheet> {
  final _notesCtrl = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.order.resolutionNotes != null && widget.order.resolutionNotes!.isNotEmpty) {
      _notesCtrl.text = widget.order.resolutionNotes!;
    }
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleConfirmResolve() async {
    final notes = _notesCtrl.text.trim();
    if (notes.isEmpty) {
      Get.snackbar(
        'missing_notes'.tr,
        'missing_notes_msg'.tr,
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final res = await TechnicianService.to.updateMyWorkOrderStatus(
        widget.order.id,
        status: 'resolved',
        resolutionNotes: notes,
      );

      if (res.success) {
        Get.back(); // Close bottom sheet
        Get.snackbar(
          'resolved'.tr,
          'order_resolved_success'.tr,
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.25),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        widget.onResolved?.call();

        // Refresh list controller if active
        if (Get.isRegistered<TechWorkOrdersController>()) {
          TechWorkOrdersController.to.fetchWorkOrders();
        }
        // Refresh detail controller if active
        if (Get.isRegistered<TechWorkOrderDetailController>()) {
          TechWorkOrderDetailController.to.fetchDetail(widget.order.id);
        }
      } else {
        Get.snackbar(
          'error'.tr,
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isResolved = widget.order.status.toLowerCase() == 'resolved' ||
        widget.order.status.toLowerCase() == 'completed' ||
        widget.order.status.toLowerCase() == 'closed';

    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: Color(0xFF334155), width: 1.5),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          left: 20,
          right: 20,
          top: 14,
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Grab Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title Header (Matches Web Portal Modal)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.16),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: const Color(0xFF10B981).withValues(alpha: 0.35),
                            ),
                          ),
                          child: const Icon(
                            Icons.check_circle_rounded,
                            color: Color(0xFF10B981),
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'resolve_work_order_title'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${widget.order.code} · ${'vehicle'.tr} ${widget.order.busNumber.isNotEmpty ? widget.order.busNumber : 'N/A'}',
                                style: const TextStyle(
                                  color: Colors.white60,
                                  fontSize: 12,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.close_rounded, color: Colors.white60, size: 22),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Work Order Summary Context Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.order.busNumber.isNotEmpty ? widget.order.busNumber : widget.order.code,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${widget.order.issueCategory} · ${widget.order.depotName}',
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 11,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    _buildStatusPill(widget.order.status),
                  ],
                ),
              ),

              if (widget.order.description.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  'reported_problem'.tr.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF151D2F),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Text(
                    widget.order.description,
                    style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                  ),
                ),
              ],

              const SizedBox(height: 16),
              const Divider(color: Color(0xFF334155), height: 1),
              const SizedBox(height: 16),

              if (isResolved) ...[
                // Already Resolved View
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF065F46).withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'work_order_resolved'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            if (widget.order.resolvedAt != null) ...[
                              const SizedBox(height: 2),
                              Text(
                                '${'completed_on'.tr} ${widget.order.resolvedAt}',
                                style: const TextStyle(color: Colors.white70, fontSize: 11),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (widget.order.resolutionNotes != null && widget.order.resolutionNotes!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    'resolution_notes_and_fix'.tr.toUpperCase(),
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF151D2F),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF1E293B)),
                    ),
                    child: Text(
                      widget.order.resolutionNotes!,
                      style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF334155)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      'cancel'.tr,
                      style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ] else ...[
                // Resolution Notes & Fix Applied * (Required)
                Row(
                  children: [
                    Text(
                      'resolution_notes_and_fix'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      '*',
                      style: TextStyle(
                        color: Color(0xFFEF4444),
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                TextField(
                  controller: _notesCtrl,
                  minLines: 4,
                  maxLines: 6,
                  style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                  decoration: InputDecoration(
                    hintText: 'describe_diagnosis_ph'.tr,
                    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11, height: 1.4),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    contentPadding: const EdgeInsets.all(14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF10B981), width: 1.5),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Action Buttons: Cancel + Confirm Resolution (with AppTheme.primaryGradient)
                Row(
                  children: [
                    // Cancel Button
                    Expanded(
                      flex: 1,
                      child: OutlinedButton(
                        onPressed: _isLoading ? null : () => Get.back(),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF334155)),
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'cancel'.tr,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Confirm Resolution Button (AppTheme.primaryGradient)
                    Expanded(
                      flex: 2,
                      child: InkWell(
                        onTap: _isLoading ? null : _handleConfirmResolve,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          height: 46,
                          decoration: BoxDecoration(
                            gradient: _isLoading ? null : AppTheme.primaryGradient,
                            color: _isLoading ? const Color(0xFF334155) : null,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.gradientPink.withValues(alpha: 0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Center(
                            child: _isLoading
                                ? Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        'submitting_resolution'.tr,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  )
                                : Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.check_circle_outline_rounded,
                                        size: 18,
                                        color: Colors.white,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        'confirm_resolution'.tr,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusPill(String status) {
    Color bg;
    Color text;
    String label = status;
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
        bg = const Color(0xFF10B981).withValues(alpha: 0.2);
        text = const Color(0xFF34D399);
        label = 'resolved'.tr;
        break;
      case 'on_site':
      case 'in_progress':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.2);
        text = const Color(0xFFFBBF24);
        label = 'on_site'.tr;
        break;
      default:
        bg = const Color(0xFF6366F1).withValues(alpha: 0.2);
        text = const Color(0xFF818CF8);
        label = 'dispatched'.tr;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(color: text, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
