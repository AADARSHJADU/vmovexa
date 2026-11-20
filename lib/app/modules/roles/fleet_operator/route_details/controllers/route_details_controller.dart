import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_theme.dart';

class RouteDetailsController extends GetxController {
  final Rxn<RouteItemModel> route = Rxn<RouteItemModel>();
  final RxList<RouteAssignmentModel> routeVehicles = <RouteAssignmentModel>[].obs;
  final RxList<VehicleItemModel> availableVehicles = <VehicleItemModel>[].obs;

  final RxBool isLoading = false.obs;
  final RxBool actionLoading = false.obs;
  final RxBool assignLoading = false.obs;
  final RxInt activeTab = 0.obs; // 0: Stops Sequence, 1: Vehicle Deployments

  dynamic routeId;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args != null) {
      if (args is RouteItemModel) {
        route.value = args;
        routeId = args.id;
      } else if (args is Map) {
        routeId = args['id'];
        route.value = RouteItemModel.fromJson(Map<String, dynamic>.from(args));
      } else {
        routeId = args;
      }
    }
    loadData();
  }

  Future<void> loadData() async {
    if (routeId == null) return;
    isLoading.value = true;
    try {
      await Future.wait([
        _loadRouteDetails(),
        _loadRouteVehicles(),
        _loadAvailableVehicles(),
      ]);
    } catch (e) {
      debugPrint('Error loading route details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _loadRouteDetails() async {
    final res = await FleetService.to.getRoute(routeId.toString());
    if (res.success && res.data != null) {
      route.value = res.data!;
    }
  }

  Future<void> _loadRouteVehicles() async {
    final res = await FleetService.to.getRouteVehicles(routeId.toString());
    if (res.success && res.data != null) {
      routeVehicles.assignAll(res.data!);
    } else {
      routeVehicles.clear();
    }
  }

  Future<void> _loadAvailableVehicles() async {
    final res = await FleetService.to.getVehicles(limit: 100);
    if (res.success && res.data != null) {
      availableVehicles.assignAll(res.data!);
    }
  }

  void goToEdit() async {
    if (route.value == null) return;
    final result = await Get.toNamed(Routes.ADD_ROUTE, arguments: route.value);
    if (result == true) {
      loadData();
    }
  }

  Future<void> approveRoute() async {
    if (routeId == null) return;
    actionLoading.value = true;
    try {
      final res = await FleetService.to.approveRoute(routeId.toString());
      if (res.success) {
        Get.snackbar(
          'success'.tr,
          'Route is now active and operational.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        _loadRouteDetails();
      } else {
        Get.snackbar('error'.tr, res.message ?? 'failed_to_approve_route'.tr,
            snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('error'.tr, e.toString(),
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      actionLoading.value = false;
    }
  }

  void openRejectDialog() {
    final reasonController = TextEditingController();
    Get.defaultDialog(
      title: 'reject_btn'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: const Color(0xFF1E293B),
      radius: 12,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          children: [
            const Text(
              'Enter rejection feedback for this route corridor:',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'enter_reason_hint'.tr,
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF43F5E)),
        onPressed: () async {
          final r = reasonController.text.trim();
          if (r.isEmpty) return;
          Get.back();
          actionLoading.value = true;
          try {
            final res = await FleetService.to.rejectRoute(routeId.toString(), r);
            if (res.success) {
              Get.snackbar('success'.tr, 'route_marked_as_rejected'.tr,
                  snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFFF43F5E), colorText: Colors.white);
              _loadRouteDetails();
            }
          } catch (e) {
            Get.snackbar('error'.tr, e.toString(),
                snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
          } finally {
            actionLoading.value = false;
          }
        },
        child: Text('reject_btn'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      cancel: TextButton(
        onPressed: () => Get.back(),
        child: Text('cancel'.tr, style: const TextStyle(color: Color(0xFF94A3B8))),
      ),
    );
  }

  void confirmDelete() {
    Get.defaultDialog(
      title: 'delete'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: const Color(0xFF1E293B),
      radius: 12,
      content: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Text(
          'Are you sure you want to delete this route?\nAll waypoint stops and schedules will be permanently removed.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
          textAlign: TextAlign.center,
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
        onPressed: () async {
          Get.back();
          isLoading.value = true;
          try {
            final res = await FleetService.to.deleteRoute(routeId.toString());
            if (res.success) {
              Get.back(result: true);
              Get.snackbar(
                'success'.tr,
                'Route removed successfully',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: const Color(0xFF10B981),
                colorText: Colors.white,
              );
            }
          } catch (e) {
            Get.snackbar('error'.tr, e.toString(),
                snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
          } finally {
            isLoading.value = false;
          }
        },
        child: Text('delete'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      cancel: TextButton(
        onPressed: () => Get.back(),
        child: Text('cancel'.tr, style: const TextStyle(color: Color(0xFF94A3B8))),
      ),
    );
  }

  void openAssignVehicleModal() {
    String? selectedVehId;
    String selectedShift = 'Full Day';
    final notesCtrl = TextEditingController();

    Get.bottomSheet(
      StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF818CF8), size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'deploy_vehicle_to_route'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const Text(
                              'Allocate a bus onto this corridor schedule',
                              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
                        onPressed: () => Get.back(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Select Vehicle Dropdown
                  Text('select_bus_vehicle'.tr, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedVehId,
                        hint: Text('choose_bus_from_fleet'.tr, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                        isExpanded: true,
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        items: availableVehicles.map((v) {
                          return DropdownMenuItem<String>(
                            value: v.id.toString(),
                            child: Text('${v.registrationNumber} • ${v.make} ${v.model} (${v.fuelType})'),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setModalState(() {
                            selectedVehId = val;
                          });
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Select Shift Dropdown
                  Text('operational_shift'.tr, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedShift,
                        isExpanded: true,
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        items: [
                          DropdownMenuItem(value: 'Full Day', child: Text('shift_full_day'.tr)),
                          DropdownMenuItem(value: 'Morning', child: Text('shift_morning'.tr)),
                          DropdownMenuItem(value: 'Evening', child: Text('shift_evening'.tr)),
                          DropdownMenuItem(value: 'Night', child: Text('shift_night'.tr)),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            setModalState(() {
                              selectedShift = val;
                            });
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Shift Notes
                  Text('deployment_notes_optional'.tr, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: notesCtrl,
                    maxLines: 2,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'deployment_notes_hint'.tr,
                      hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF6366F1))),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Submit Button
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () async {
                          if (selectedVehId == null) {
                            Get.snackbar('error'.tr, 'please_select_vehicle'.tr,
                                snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.amber, colorText: Colors.black);
                            return;
                          }
                          Get.back();
                          assignLoading.value = true;
                          try {
                            final payload = {
                              'vehicle_id': selectedVehId,
                              'shift': selectedShift,
                              'notes': notesCtrl.text.trim(),
                            };
                            final res = await FleetService.to.assignVehicleToRoute(routeId.toString(), payload);
                            if (res.success) {
                              Get.snackbar(
                                'success'.tr,
                                'Bus has been deployed onto route schedule.',
                                snackPosition: SnackPosition.BOTTOM,
                                backgroundColor: const Color(0xFF10B981),
                                colorText: Colors.white,
                              );
                              _loadRouteVehicles();
                              _loadRouteDetails();
                            } else {
                              Get.snackbar('error'.tr, res.message ?? 'failed_to_assign_vehicle'.tr,
                                  snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
                            }
                          } catch (e) {
                            Get.snackbar('error'.tr, e.toString(),
                                snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
                          } finally {
                            assignLoading.value = false;
                          }
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          child: Center(
                            child: Text(
                              'confirm'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          );
        },
      ),
      isScrollControlled: true,
    );
  }

  Future<void> removeAssignment(RouteAssignmentModel assign) async {
    final confirmed = await Get.defaultDialog<bool>(
      title: 'remove_action'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
      backgroundColor: const Color(0xFF1E293B),
      radius: 12,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Text(
          'Remove vehicle "${assign.vehicleRegNo}" from this route corridor?',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
          textAlign: TextAlign.center,
        ),
      ),
      confirm: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
        onPressed: () => Get.back(result: true),
        child: Text('remove_action'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      cancel: TextButton(
        onPressed: () => Get.back(result: false),
        child: Text('cancel'.tr, style: const TextStyle(color: Color(0xFF94A3B8))),
      ),
    );

    if (confirmed == true) {
      assignLoading.value = true;
      try {
        final res = await FleetService.to.deleteRouteAssignment(assign.id.toString());
        if (res.success) {
          Get.snackbar('success'.tr, 'vehicle_removed_from_schedule'.tr,
              snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
          _loadRouteVehicles();
          _loadRouteDetails();
        } else {
          Get.snackbar('error'.tr, res.message ?? 'failed_to_remove_assignment'.tr,
              snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('error'.tr, e.toString(),
            snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      } finally {
        assignLoading.value = false;
      }
    }
  }
}
