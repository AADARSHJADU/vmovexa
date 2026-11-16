import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'tech_work_orders_controller.dart';

class TechWorkOrderDetailController extends GetxController {
  static TechWorkOrderDetailController get to => Get.find<TechWorkOrderDetailController>();

  final Rx<WorkOrderModel?> order = Rx<WorkOrderModel?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isSubmitting = false.obs;

  String? _orderId;

  @override
  void onInit() {
    super.onInit();
    _initFromArgs();
  }

  void _initFromArgs() {
    final args = Get.arguments;
    if (args is WorkOrderModel) {
      order.value = args;
      _orderId = args.id;
      // Fetch fresh details in background
      fetchDetail(_orderId);
    } else if (args is String && args.isNotEmpty) {
      _orderId = args;
      fetchDetail(_orderId);
    } else if (Get.parameters['id'] != null && Get.parameters['id']!.isNotEmpty) {
      _orderId = Get.parameters['id'];
      fetchDetail(_orderId);
    }
  }

  Future<void> fetchDetail([String? id]) async {
    final targetId = id ?? _orderId ?? order.value?.id;
    if (targetId == null || targetId.isEmpty) return;

    if (order.value == null) {
      isLoading.value = true;
    }

    try {
      final res = await TechnicianService.to.getMyWorkOrder(targetId);
      if (res.success && res.data != null) {
        order.value = res.data;
      }
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  void copyCode() {
    final code = order.value?.code;
    if (code != null && code.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: code));
      Get.snackbar(
        'copied_to_clipboard'.tr,
        code,
        backgroundColor: const Color(0xFF1E293B),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2),
        margin: const EdgeInsets.all(12),
      );
    }
  }

  /// Format SLA status and countdown matching Web formatSlaCountdown
  Map<String, dynamic> get slaInfo {
    final ord = order.value;
    if (ord == null) {
      return {'type': 'none', 'text': '—', 'color': Colors.white38, 'bg': Colors.transparent, 'icon': null};
    }

    final st = ord.status.toLowerCase();
    if (st == 'resolved' || st == 'completed' || st == 'closed') {
      return {
        'type': 'resolved',
        'text': 'sla_resolved'.tr,
        'color': const Color(0xFF10B981),
        'bg': const Color(0xFF10B981).withValues(alpha: 0.15),
        'icon': Icons.check_circle_rounded,
      };
    }

    if (ord.slaDueAt == null || ord.slaDueAt!.isEmpty) {
      return {'type': 'none', 'text': '—', 'color': Colors.white38, 'bg': Colors.transparent, 'icon': null};
    }

    final due = DateTime.tryParse(ord.slaDueAt!);
    if (due == null) {
      return {'type': 'none', 'text': '—', 'color': Colors.white38, 'bg': Colors.transparent, 'icon': null};
    }

    final now = DateTime.now();
    final diff = due.difference(now);
    if (diff.isNegative) {
      final overdueMins = diff.inMinutes.abs();
      final h = overdueMins ~/ 60;
      final m = overdueMins % 60;
      final timeStr = h > 0 ? '${h}h ${m}m' : '${m}m';
      return {
        'type': 'overdue',
        'text': '${'sla_overdue_by'.tr} $timeStr',
        'color': const Color(0xFFEF4444),
        'bg': const Color(0xFFEF4444).withValues(alpha: 0.16),
        'icon': Icons.warning_amber_rounded,
      };
    } else {
      final remMins = diff.inMinutes;
      final h = remMins ~/ 60;
      final m = remMins % 60;
      final timeStr = h > 0 ? '${h}h ${m}m' : '${m}m';
      final isUrgent = diff.inHours < 1;
      return {
        'type': 'pending',
        'text': '$timeStr ${'sla_left'.tr}',
        'color': isUrgent ? const Color(0xFFF59E0B) : const Color(0xFF38BDF8),
        'bg': (isUrgent ? const Color(0xFFF59E0B) : const Color(0xFF38BDF8)).withValues(alpha: 0.15),
        'icon': Icons.access_time_rounded,
      };
    }
  }

  /// Mark Work Order as Arrived On-Site
  Future<bool> markOnSite() async {
    final ord = order.value;
    if (ord == null) return false;

    isSubmitting.value = true;
    try {
      final res = await TechnicianService.to.updateMyWorkOrderStatus(
        ord.id,
        status: 'on_site',
        resolutionNotes: 'Technician arrived on-site and initiated diagnostics',
      );
      if (res.success) {
        Get.snackbar(
          'status_updated'.tr,
          '${ord.code} ${'order_marked_on_site'.tr}',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchDetail(ord.id);
        if (Get.isRegistered<TechWorkOrdersController>()) {
          TechWorkOrdersController.to.fetchWorkOrders();
        }
        return true;
      } else {
        Get.snackbar(
          'error'.tr,
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /// Submit Resolution (Mark resolved/completed)
  Future<bool> resolveOrder({
    required String notes,
    List<String> parts = const [],
    List<String> checklist = const [],
  }) async {
    final ord = order.value;
    if (ord == null) return false;

    isSubmitting.value = true;
    try {
      final res = await TechnicianService.to.updateMyWorkOrderStatus(
        ord.id,
        status: 'resolved',
        resolutionNotes: notes.trim(),
        partsReplaced: parts,
      );

      if (res.success) {
        Get.snackbar(
          'resolved'.tr,
          'order_resolved_success'.tr,
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchDetail(ord.id);
        if (Get.isRegistered<TechWorkOrdersController>()) {
          TechWorkOrdersController.to.fetchWorkOrders();
        }
        return true;
      } else {
        Get.snackbar(
          'error'.tr,
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }
}
