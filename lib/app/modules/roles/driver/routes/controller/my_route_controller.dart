import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../model/assigned_route_model.dart';

class MyRouteController extends GetxController {
  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Route state ----------------
  final Rxn<AssignedRoute> route = Rxn<AssignedRoute>();

  final RxBool isRouteStarted = false.obs;
  final RxBool isStarting = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchRoute();
  }

  Future<void> fetchRoute() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      route.value = _mockRoute();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    await fetchRoute();
  }

  // ---------------- Actions ----------------
  Future<void> onStartRoute() async {
    if (isRouteStarted.value) return;
    isStarting.value = true;
    try {
      // TODO: call API to mark route as started / begin live tracking
      await Future.delayed(const Duration(milliseconds: 800));
      isRouteStarted.value = true;
      Get.snackbar(
        'Route Started',
        'Live tracking has begun for ${route.value?.routeName ?? "this route"}.',
        backgroundColor: const Color(0xFF15151F),
        colorText: const Color(0xFFFFFFFF),
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isStarting.value = false;
    }
  }

  void onViewOnMap() {
    Get.toNamed('/route-map', arguments: {'routeName': route.value?.routeName});
  }

  void onOpenFilterSheet() {
    // TODO: hook up route-selection / date filter bottom sheet
  }

  void onBackPressed() => Get.back();

  // ---------------- Mock data ----------------
  AssignedRoute _mockRoute() {
    return AssignedRoute(
      routeName: 'Route MH12A',
      fromDepot: 'Andheri Depot',
      toDepot: 'Colaba Depot',
      busNumber: 'Bus MH12 AB 1234',
      isOnDuty: true,
      startTime: '06:30 AM',
      endTime: '08:15 PM',
      totalDistanceKm: 32.4,
      routeType: 'Regular Service',
      frequency: 'Every Day',
      passengersEstimate: '120 - 150',
      vehicleId: 'VMX-BUS-001',
      busType: 'AC Standard',
      stops: [
        RouteStop(name: 'Andheri Depot', time: '06:30 AM', distanceKm: 0, type: RouteStopType.start),
        RouteStop(name: 'S.V. Road', time: '06:45 AM', distanceKm: 4.2, type: RouteStopType.stop),
        RouteStop(name: 'Link Road', time: '07:05 AM', distanceKm: 8.7, type: RouteStopType.stop),
        RouteStop(name: 'Juhu Circle', time: '07:25 AM', distanceKm: 12.3, type: RouteStopType.stop),
        RouteStop(name: 'Dadar TT', time: '07:55 AM', distanceKm: 20.1, type: RouteStopType.stop),
        RouteStop(name: 'Hutatma Chowk', time: '08:05 AM', distanceKm: 27.6, type: RouteStopType.stop),
        RouteStop(name: 'Colaba Depot', time: '08:15 PM', distanceKm: 32.4, type: RouteStopType.end),
      ],
    );
  }
}
