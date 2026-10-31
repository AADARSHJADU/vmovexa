import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/vehicle_slot_model.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';

class VehicleSlotsController extends GetxController {
  static VehicleSlotsController get to => Get.find<VehicleSlotsController>();

  FleetService get _fleetService => FleetService.to;

  final RxBool isLoading = false.obs;
  final RxBool isCheckingConflict = false.obs;
  final RxBool isSaving = false.obs;
  final RxString activeTab = 'All'.obs;
  final RxString viewMode = 'list'.obs; // 'list' or 'timetable'
  final RxString searchQuery = ''.obs;

  // Pagination
  final RxInt currentPage = 1.obs;
  final int pageSize = 6;
  final RxInt totalSlots = 0.obs;

  // Data lists
  final RxList<VehicleSlotModel> slots = <VehicleSlotModel>[].obs;
  final Rx<SlotConflictResult?> conflictWarning = Rx<SlotConflictResult?>(null);

  // Stats
  final RxInt totalCount = 0.obs;
  final RxInt activeCount = 0.obs;
  final RxInt morningPeakCount = 0.obs;
  final RxInt eveningPeakCount = 0.obs;

  // Auxiliary dropdown lists
  final RxList<Map<String, dynamic>> vehicles = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> routes = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> drivers = <Map<String, dynamic>>[].obs;

  Timer? _debounceTimer;

  final List<String> filterTabs = const [
    'All',
    'Active',
    'Morning Peak',
    'Regular Day',
    'Evening Peak',
    'Night Shuttle',
    'Paused',
  ];

  @override
  void onInit() {
    super.onInit();
    loadSlots();
    loadFormResources();
  }

  @override
  void onClose() {
    _debounceTimer?.cancel();
    super.onClose();
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      currentPage.value = 1;
      loadSlots();
    });
  }

  void setTab(String tab) {
    activeTab.value = tab;
    currentPage.value = 1;
    loadSlots();
  }

  void setViewMode(String mode) {
    viewMode.value = mode;
  }

  int get totalPages {
    final count = totalSlots.value > 0 ? totalSlots.value : filteredSlots.length;
    return (count / pageSize).ceil().clamp(1, 999);
  }

  List<VehicleSlotModel> get filteredSlots {
    var list = slots.toList();

    // Tab filter
    if (activeTab.value == 'Active') {
      list = list.where((s) => s.status == 'active').toList();
    } else if (activeTab.value == 'Paused') {
      list = list.where((s) => s.status == 'paused').toList();
    } else if (activeTab.value == 'Morning Peak') {
      list = list.where((s) => s.shiftType == 'morning_peak').toList();
    } else if (activeTab.value == 'Regular Day') {
      list = list.where((s) => s.shiftType == 'regular_day').toList();
    } else if (activeTab.value == 'Evening Peak') {
      list = list.where((s) => s.shiftType == 'evening_peak').toList();
    } else if (activeTab.value == 'Night Shuttle') {
      list = list.where((s) => s.shiftType == 'night_shuttle').toList();
    }

    // Search filter
    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((s) {
        return s.slotName.toLowerCase().contains(q) ||
            s.slotCode.toLowerCase().contains(q) ||
            (s.busNumber != null && s.busNumber!.toLowerCase().contains(q)) ||
            (s.routeName != null && s.routeName!.toLowerCase().contains(q)) ||
            (s.driverName != null && s.driverName!.toLowerCase().contains(q));
      }).toList();
    }

    return list;
  }

  List<VehicleSlotModel> get paginatedSlots {
    final all = filteredSlots;
    final start = (currentPage.value - 1) * pageSize;
    if (start >= all.length) return [];
    final end = (start + pageSize).clamp(0, all.length);
    return all.sublist(start, end);
  }

  void nextPage() {
    if (currentPage.value < totalPages) {
      currentPage.value++;
    }
  }

  void prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  /// Load Vehicle Slots from Backend
  Future<void> loadSlots() async {
    isLoading.value = true;
    try {
      String? statusParam;

      if (activeTab.value == 'Active') statusParam = 'active';
      if (activeTab.value == 'Paused') statusParam = 'paused';

      final res = await _fleetService.getVehicleSlots(
        page: currentPage.value,
        limit: 50,
        status: statusParam,
      );

      if (res.success && res.data != null) {
        List<VehicleSlotModel> loaded = [];
        final raw = res.data;
        if (raw is List) {
          loaded = raw.map((item) => VehicleSlotModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (raw is Map && raw['rows'] is List) {
          loaded = (raw['rows'] as List).map((item) => VehicleSlotModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (raw is Map && raw['items'] is List) {
          loaded = (raw['items'] as List).map((item) => VehicleSlotModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }

        if (loaded.isNotEmpty) {
          slots.assignAll(loaded);
          totalSlots.value = loaded.length;
        } else {
          _useFallbackSlots();
        }
      } else {
        _useFallbackSlots();
      }
    } catch (_) {
      _useFallbackSlots();
    } finally {
      _updateStats();
      isLoading.value = false;
    }
  }

  void _useFallbackSlots() {
    slots.assignAll([
      VehicleSlotModel(
        id: '1',
        slotCode: 'SLOT-101',
        slotName: 'Morning Peak Red Line',
        vehicleId: '1',
        busNumber: 'DL-01-AB-1234',
        routeId: '1',
        routeName: 'Central Depot - Airport Express',
        routeCode: 'R-101',
        driverId: '1',
        driverName: 'Ramesh Kumar',
        shiftType: 'morning_peak',
        startTime: '07:30',
        endTime: '11:00',
        operatingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
        headwayMinutes: 15,
        status: 'active',
      ),
      VehicleSlotModel(
        id: '2',
        slotCode: 'SLOT-102',
        slotName: 'Midday City Feeder',
        vehicleId: '2',
        busNumber: 'DL-01-CD-5678',
        routeId: '2',
        routeName: 'Sector 62 - Connaught Place',
        routeCode: 'R-202',
        driverId: '2',
        driverName: 'Suresh Sharma',
        shiftType: 'regular_day',
        startTime: '11:30',
        endTime: '16:00',
        operatingDays: 'Mon,Tue,Wed,Thu,Fri',
        headwayMinutes: 20,
        status: 'active',
      ),
      VehicleSlotModel(
        id: '3',
        slotCode: 'SLOT-103',
        slotName: 'Evening Commuter Express',
        vehicleId: '3',
        busNumber: 'DL-01-EF-9012',
        routeId: '1',
        routeName: 'Central Depot - Airport Express',
        routeCode: 'R-101',
        driverId: '3',
        driverName: 'Amit Verma',
        shiftType: 'evening_peak',
        startTime: '16:30',
        endTime: '20:30',
        operatingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
        headwayMinutes: 12,
        status: 'active',
      ),
      VehicleSlotModel(
        id: '4',
        slotCode: 'SLOT-104',
        slotName: 'Night Shift Depot Return',
        vehicleId: '4',
        busNumber: 'DL-01-GH-3456',
        routeId: '3',
        routeName: 'Interstate Hub - Tech Park',
        routeCode: 'R-303',
        driverId: '4',
        driverName: 'Rajesh Yadav',
        shiftType: 'night_shuttle',
        startTime: '20:45',
        endTime: '23:30',
        operatingDays: 'Daily',
        headwayMinutes: 30,
        status: 'active',
      ),
      VehicleSlotModel(
        id: '5',
        slotCode: 'SLOT-105',
        slotName: 'Weekend Special Route',
        vehicleId: '1',
        busNumber: 'DL-01-AB-1234',
        routeId: '2',
        routeName: 'Sector 62 - Connaught Place',
        routeCode: 'R-202',
        driverId: '1',
        driverName: 'Ramesh Kumar',
        shiftType: 'morning_peak',
        startTime: '08:00',
        endTime: '11:30',
        operatingDays: 'Sat,Sun',
        headwayMinutes: 20,
        status: 'paused',
      ),
    ]);
    totalSlots.value = slots.length;
  }

  void _updateStats() {
    totalCount.value = slots.length;
    activeCount.value = slots.where((s) => s.status == 'active').length;
    morningPeakCount.value = slots.where((s) => s.shiftType == 'morning_peak').length;
    eveningPeakCount.value = slots.where((s) => s.shiftType == 'evening_peak').length;
  }

  /// Load resources for schedule modal (Vehicles, Routes, Drivers)
  Future<void> loadFormResources() async {
    try {
      final vRes = await _fleetService.getVehicles(limit: 100);
      if (vRes.success && vRes.data != null) {
        vehicles.assignAll(vRes.data!.map((v) => {
          'id': v.id,
          'label': v.registrationNumber,
        }).toList());
      }
    } catch (_) {}

    try {
      final rRes = await _fleetService.getRoutes(limit: 100);
      if (rRes.success && rRes.data != null) {
        routes.assignAll(rRes.data!.map((r) => {
          'id': r.id.toString(),
          'label': r.code.isNotEmpty ? '[${r.code}] ${r.name}' : r.name,
        }).toList());
      }
    } catch (_) {}

    try {
      final dRes = await _fleetService.getDrivers(limit: 100);
      if (dRes.success && dRes.data != null) {
        drivers.assignAll(dRes.data!.map((d) => {
          'id': d.id,
          'label': d.name,
        }).toList());
      }
    } catch (_) {}
  }

  /// Real-time collision detection engine (POST /api/v1/vehicle-slots/check-conflict)
  Future<SlotConflictResult?> checkConflict({
    required String vehicleId,
    required String startTime,
    required String endTime,
    required String operatingDays,
    String? excludeId,
  }) async {
    isCheckingConflict.value = true;
    try {
      final payload = {
        'vehicle_id': vehicleId,
        'start_time': startTime,
        'end_time': endTime,
        'operating_days': operatingDays,
        if (excludeId != null && excludeId.isNotEmpty) 'exclude_id': excludeId,
      };

      final res = await _fleetService.checkVehicleSlotConflict(payload);
      if (res.success && res.data is Map) {
        final result = SlotConflictResult.fromJson(Map<String, dynamic>.from(res.data));
        conflictWarning.value = result.hasConflict ? result : null;
        return conflictWarning.value;
      }
      conflictWarning.value = null;
      return null;
    } catch (_) {
      conflictWarning.value = null;
      return null;
    } finally {
      isCheckingConflict.value = false;
    }
  }

  /// Create new slot schedule (POST /api/v1/vehicle-slots)
  Future<bool> createSlot(Map<String, dynamic> data) async {
    isSaving.value = true;
    try {
      final res = await _fleetService.createVehicleSlot(data);
      if (res.success) {
        Get.snackbar(
          'Slot Created',
          'Vehicle slot schedule registered successfully.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await loadSlots();
        return true;
      } else {
        Get.snackbar(
          'Error',
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
        'Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /// Toggle Active / Paused status
  Future<void> toggleStatus(VehicleSlotModel slot) async {
    final newStatus = slot.status == 'active' ? 'paused' : 'active';
    try {
      final res = await _fleetService.updateVehicleSlot(slot.id, {'status': newStatus});
      if (res.success) {
        Get.snackbar(
          'Status Updated',
          'Slot marked as $newStatus',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await loadSlots();
      }
    } catch (_) {}
  }

  /// Delete Slot (DELETE /api/v1/vehicle-slots/:id)
  Future<void> deleteSlot(String id) async {
    try {
      final res = await _fleetService.deleteVehicleSlot(id);
      if (res.success) {
        Get.snackbar(
          'Deleted',
          'Slot removed successfully',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await loadSlots();
      }
    } catch (_) {}
  }
}
