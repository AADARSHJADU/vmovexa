import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class DepotDetailsController extends GetxController {
  final Rxn<DepotItemModel> depot = Rxn<DepotItemModel>();
  final RxBool isLoading = true.obs;
  final RxBool isUpdatingStatus = false.obs;
  String? depotId;

  @override
  void onInit() {
    super.onInit();
    _handleArguments();
  }

  void _handleArguments() {
    final args = Get.arguments;
    if (args is DepotItemModel) {
      depot.value = args;
      depotId = args.id.toString();
      isLoading.value = false;
      loadDepotDetails();
    } else if (args is Map) {
      final mapArgs = Map<String, dynamic>.from(args);
      if (mapArgs['id'] != null || mapArgs['depotId'] != null) {
        depotId = (mapArgs['id'] ?? mapArgs['depotId']).toString();
        if (mapArgs['depot'] is DepotItemModel) {
          depot.value = mapArgs['depot'] as DepotItemModel;
        }
        loadDepotDetails();
      }
    } else if (args is String && args.isNotEmpty) {
      depotId = args;
      loadDepotDetails();
    }
  }

  Future<void> loadDepotDetails() async {
    if (depotId == null || depotId!.isEmpty) return;
    try {
      final res = await FleetService.to.getDepot(depotId!);
      if (res.success && res.data != null) {
        depot.value = res.data!;
      }
    } catch (e) {
      debugPrint('Error loading depot details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleStatus() async {
    final current = depot.value;
    if (current == null) return;

    final newStatus = current.isOperational ? 'closed' : 'operational';
    isUpdatingStatus.value = true;
    try {
      final res = await FleetService.to.updateDepotStatus(current.id.toString(), newStatus);
      if (res.success) {
        Get.snackbar(
          'Status Updated',
          'Facility is now ${newStatus.toUpperCase()}',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        loadDepotDetails();
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to update depot status',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isUpdatingStatus.value = false;
    }
  }

  void confirmDelete() {
    final current = depot.value;
    if (current == null) return;

    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 22),
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                'Delete Depot Facility',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Text(
          'Are you sure you want to delete "${current.name}" (${current.displayCode})?\n\n'
          'This action cannot be undone. Active buses must be relocated before deletion.',
          style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Get.back();
              _deleteDepot();
            },
            child: const Text('Delete Facility', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteDepot() async {
    final current = depot.value;
    if (current == null) return;

    try {
      final res = await FleetService.to.deleteDepot(current.id.toString());
      if (res.success) {
        Get.back(result: true);
        Get.snackbar(
          'Depot Deleted',
          'Facility ${current.name} was removed.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      } else {
        Get.snackbar(
          'Delete Failed',
          res.message ?? 'Unable to delete depot facility.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  void goToEdit() {
    final current = depot.value;
    if (current == null) return;
    Get.toNamed(Routes.ADD_DEPOT, arguments: current)?.then((res) {
      if (res == true) loadDepotDetails();
    });
  }
}
