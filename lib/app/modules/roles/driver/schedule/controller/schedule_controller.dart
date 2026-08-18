import 'package:get/get.dart';

import '../model/schedule_trip_model.dart';

class ScheduleController extends GetxController {
  // ---------------- Tabs ----------------
  final RxInt selectedTabIndex = 0.obs; // 0 = Today, 1 = Upcoming
  void selectTab(int index) => selectedTabIndex.value = index;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Today ----------------
  final RxString todayDateLabel = 'May 14, 2025'.obs;
  final RxString todayGroupLabel = 'Today, May 14'.obs;
  final RxList<ScheduleTrip> todayTrips = <ScheduleTrip>[].obs;

  int get todayTripCount => todayTrips.length;
  double get todayTotalDistanceKm => todayTrips.fold(0.0, (sum, t) => sum + t.distanceKm);

  // Fixed here as static mock text; compute-from-times is straightforward to
  // wire up once real start/end DateTimes are available from the API.
  final RxString todayTotalDuration = '4h 30m'.obs;

  // ---------------- Upcoming ----------------
  final RxList<ScheduleTrip> upcomingTrips = <ScheduleTrip>[].obs;
  int get upcomingTripCount => upcomingTrips.length;

  @override
  void onInit() {
    super.onInit();
    fetchSchedule();
  }

  Future<void> fetchSchedule() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      todayTrips.assignAll(_mockTodayTrips());
      upcomingTrips.assignAll(_mockUpcomingTrips());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    await fetchSchedule();
  }

  // ---------------- Actions ----------------
  void onCalendarTap() {
    // TODO: open a date picker / full calendar view
  }

  void onTripTap(ScheduleTrip trip) {
    Get.toNamed('/my-route', arguments: {'routeName': trip.routeName});
  }

  void onBackPressed() => Get.back();

  // ---------------- Mock data ----------------
  List<ScheduleTrip> _mockTodayTrips() {
    return [
      ScheduleTrip(
        id: 'today_1',
        routeName: 'Route MH12A',
        tripLabel: 'Trip 1',
        fromDepot: 'Andheri Depot',
        toDepot: 'Colaba Depot',
        startTime: '06:30 AM',
        endTime: '08:15 PM',
        startPoint: 'Andheri Depot',
        endPoint: 'Colaba Depot',
        distanceKm: 32.4,
        status: ScheduleTripStatus.onDuty,
        date: DateTime(2025, 5, 14),
        dayLabel: 'Wednesday',
      ),
      ScheduleTrip(
        id: 'today_2',
        routeName: 'Route MH12A (Return)',
        tripLabel: 'Trip 2',
        fromDepot: 'Colaba Depot',
        toDepot: 'Andheri Depot',
        startTime: '09:00 PM',
        endTime: '11:00 PM',
        startPoint: 'Colaba Depot',
        endPoint: 'Andheri Depot',
        distanceKm: 32.4,
        status: ScheduleTripStatus.pending,
        date: DateTime(2025, 5, 14),
        dayLabel: 'Wednesday',
      ),
    ];
  }

  List<ScheduleTrip> _mockUpcomingTrips() {
    return [
      ScheduleTrip(
        id: 'upcoming_1',
        routeName: 'Route MH12A',
        tripLabel: 'Trip 1',
        fromDepot: 'Andheri Depot',
        toDepot: 'Colaba Depot',
        startTime: '06:30 AM',
        endTime: '08:15 PM',
        startPoint: 'Andheri Depot',
        endPoint: 'Colaba Depot',
        distanceKm: 32.4,
        status: ScheduleTripStatus.scheduled,
        date: DateTime(2025, 5, 15),
        dayLabel: 'Thursday',
      ),
      ScheduleTrip(
        id: 'upcoming_2',
        routeName: 'Route MH12A (Return)',
        tripLabel: 'Trip 2',
        fromDepot: 'Colaba Depot',
        toDepot: 'Andheri Depot',
        startTime: '09:00 PM',
        endTime: '11:00 PM',
        startPoint: 'Colaba Depot',
        endPoint: 'Andheri Depot',
        distanceKm: 32.4,
        status: ScheduleTripStatus.scheduled,
        date: DateTime(2025, 5, 15),
        dayLabel: 'Thursday',
      ),
      ScheduleTrip(
        id: 'upcoming_3',
        routeName: 'Route MH15B',
        tripLabel: 'Trip 1',
        fromDepot: 'Andheri Depot',
        toDepot: 'Borivali Depot',
        startTime: '07:00 AM',
        endTime: '09:15 AM',
        startPoint: 'Andheri Depot',
        endPoint: 'Borivali Depot',
        distanceKm: 28.7,
        status: ScheduleTripStatus.scheduled,
        date: DateTime(2025, 5, 16),
        dayLabel: 'Friday',
      ),
    ];
  }
}
