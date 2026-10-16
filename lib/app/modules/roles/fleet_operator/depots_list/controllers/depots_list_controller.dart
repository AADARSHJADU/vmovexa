import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class DepotsListController extends GetxController {
  final RxList<DepotItemModel> depots = <DepotItemModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();
  final RxString statusFilter = 'all'.obs;

  @override
  void onInit() {
    super.onInit();
    fetchDepots();
  }

  Future<void> fetchDepots() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getDepots(
        limit: 100,
        search: searchQuery.value.trim(),
        status: statusFilter.value,
      );
      if (res.success && res.data != null) {
        depots.assignAll(res.data!);
      } else {
        depots.clear();
      }
    } catch (e) {
      debugPrint('Error fetching depots: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
  }

  void setStatusFilter(String filter) {
    statusFilter.value = filter;
  }

  List<DepotItemModel> get filteredDepots {
    final q = searchQuery.value.trim().toLowerCase();
    return depots.where((d) {
      if (statusFilter.value != 'all' && d.status.toLowerCase() != statusFilter.value) {
        return false;
      }
      if (q.isEmpty) return true;
      return d.name.toLowerCase().contains(q) ||
          d.code.toLowerCase().contains(q) ||
          d.city.toLowerCase().contains(q) ||
          d.address.toLowerCase().contains(q);
    }).toList();
  }

  int get totalDepotsCount => depots.length;
  int get operationalCount => depots.where((d) => d.isOperational).length;
  int get totalEvChargers => depots.fold(0, (sum, d) => sum + d.evChargers);

  Future<void> toggleDepotStatus(DepotItemModel dep) async {
    final newStatus = dep.isOperational ? 'closed' : 'operational';
    final actionLabel = dep.isOperational ? 'Closing' : 'Reopening';

    Get.snackbar(
      '$actionLabel Depot',
      '$actionLabel ${dep.name}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1E293B),
      colorText: Colors.white,
    );

    try {
      final res = await FleetService.to.updateDepotStatus(dep.id.toString(), newStatus);
      if (res.success) {
        Get.snackbar(
          'Success',
          'Depot ${dep.name} is now ${newStatus.toUpperCase()}',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        fetchDepots();
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
    }
  }

  void confirmDeleteDepot(DepotItemModel dep) {
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
          'Are you sure you want to delete "${dep.name}" (${dep.displayCode})?\n\n'
          'Note: This action cannot be undone. If vehicles or buses are currently stationed here, relocation is required first.',
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
              _deleteDepot(dep);
            },
            child: const Text('Delete Facility', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteDepot(DepotItemModel dep) async {
    try {
      final res = await FleetService.to.deleteDepot(dep.id.toString());
      if (res.success) {
        Get.snackbar(
          'Depot Deleted',
          'Facility ${dep.name} has been removed.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        fetchDepots();
      } else {
        Get.snackbar(
          'Delete Failed',
          res.message ?? 'Unable to delete depot. Please verify no active vehicles are stationed.',
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

  void goToAddDepot() {
    Get.toNamed(Routes.ADD_DEPOT)?.then((res) {
      if (res == true) fetchDepots();
    });
  }

  void goToEditDepot(DepotItemModel dep) {
    Get.toNamed(Routes.ADD_DEPOT, arguments: dep)?.then((res) {
      if (res == true) fetchDepots();
    });
  }

  void goToDepotDetails(DepotItemModel dep) {
    Get.toNamed(Routes.DEPOT_DETAILS, arguments: dep)?.then((_) {
      fetchDepots();
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
