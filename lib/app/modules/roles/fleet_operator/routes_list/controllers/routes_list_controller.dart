import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class RoutesListController extends GetxController {
  final RxList<RouteItemModel> routes = <RouteItemModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool actionLoading = false.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();
  final RxString statusFilter = 'ALL'.obs; // 'ALL', 'active', 'pending_approval', 'rejected'

  @override
  void onInit() {
    super.onInit();
    fetchRoutes();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  Future<void> fetchRoutes() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getRoutes(
        limit: 100,
        search: searchQuery.value.trim(),
        status: statusFilter.value != 'ALL' ? statusFilter.value : '',
      );
      if (res.success && res.data != null) {
        routes.assignAll(res.data!);
      } else {
        routes.clear();
      }
    } catch (e) {
      debugPrint('Error fetching transit routes: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
  }

  void setStatusFilter(String filter) {
    statusFilter.value = filter;
    fetchRoutes();
  }

  List<RouteItemModel> get filteredRoutes {
    final q = searchQuery.value.trim().toLowerCase();
    return routes.where((r) {
      if (statusFilter.value != 'ALL' && r.status.toLowerCase() != statusFilter.value) {
        return false;
      }
      if (q.isEmpty) return true;
      final matchName = r.name.toLowerCase().contains(q);
      final matchCode = r.code.toLowerCase().contains(q);
      final matchStart = r.startPoint.toLowerCase().contains(q);
      final matchEnd = r.endPoint.toLowerCase().contains(q);
      final matchStops = r.stops.any((s) => s.name.toLowerCase().contains(q) || s.address.toLowerCase().contains(q));
      return matchName || matchCode || matchStart || matchEnd || matchStops;
    }).toList();
  }

  int get totalRoutesCount => routes.length;
  int get activeCorridorsCount => routes.where((r) => r.isActive).length;
  int get pendingReviewCount => routes.where((r) => r.isPending).length;
  int get totalWaypointsCount => routes.fold(0, (sum, r) => sum + r.stopsCount);

  void goToAddRoute() async {
    final result = await Get.toNamed(Routes.ADD_ROUTE);
    if (result == true) {
      fetchRoutes();
    }
  }

  void goToRouteDetails(RouteItemModel route) async {
    final result = await Get.toNamed(Routes.ROUTE_DETAILS, arguments: route);
    if (result == true) {
      fetchRoutes();
    }
  }

  void goToEditRoute(RouteItemModel route) async {
    final result = await Get.toNamed(Routes.ADD_ROUTE, arguments: route);
    if (result == true) {
      fetchRoutes();
    }
  }

  Future<void> approveRoute(RouteItemModel route) async {
    actionLoading.value = true;
    try {
      final res = await FleetService.to.approveRoute(route.id.toString());
      if (res.success) {
        Get.snackbar(
          'Route Approved',
          'Route "${route.name}" is now active and operational.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        fetchRoutes();
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to approve route',
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
      actionLoading.value = false;
    }
  }

  void openRejectDialog(RouteItemModel route) {
    final reasonController = TextEditingController();
    Get.defaultDialog(
      title: 'Reject Transit Route',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: const Color(0xFF1E293B),
      radius: 12,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Specify reason for rejecting "${route.name}":',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'e.g. Incomplete waypoint coordinates or overlap...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF6366F1)),
                ),
              ),
            ),
          ],
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFF43F5E),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onPressed: () async {
          final reason = reasonController.text.trim();
          if (reason.isEmpty) {
            Get.snackbar('Required', 'Please enter a rejection reason',
                snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.amber, colorText: Colors.black);
            return;
          }
          Get.back();
          actionLoading.value = true;
          try {
            final res = await FleetService.to.rejectRoute(route.id.toString(), reason);
            if (res.success) {
              Get.snackbar(
                'Route Rejected',
                'Route "${route.name}" has been marked as rejected.',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: const Color(0xFFF43F5E),
                colorText: Colors.white,
              );
              fetchRoutes();
            } else {
              Get.snackbar('Error', res.message ?? 'Failed to reject route',
                  snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
            }
          } catch (e) {
            Get.snackbar('Error', e.toString(),
                snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
          } finally {
            actionLoading.value = false;
          }
        },
        child: const Text('Reject Route', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      cancel: TextButton(
        onPressed: () => Get.back(),
        child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
      ),
    );
  }

  void confirmDeleteRoute(RouteItemModel route) {
    Get.defaultDialog(
      title: 'Delete Transit Route',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: const Color(0xFF1E293B),
      radius: 12,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Text(
          'Are you sure you want to delete route "${route.name}" (${route.displayCode})?\nThis action cannot be undone.',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
          textAlign: TextAlign.center,
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFEF4444),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onPressed: () async {
          Get.back();
          isLoading.value = true;
          try {
            final res = await FleetService.to.deleteRoute(route.id.toString());
            if (res.success) {
              Get.snackbar(
                'Route Deleted',
                'Route "${route.name}" was permanently removed.',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: const Color(0xFF10B981),
                colorText: Colors.white,
              );
              fetchRoutes();
            } else {
              Get.snackbar(
                'Delete Failed',
                res.message ?? 'Failed to delete route',
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
            isLoading.value = false;
          }
        },
        child: const Text('Delete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      cancel: TextButton(
        onPressed: () => Get.back(),
        child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
      ),
    );
  }
}
