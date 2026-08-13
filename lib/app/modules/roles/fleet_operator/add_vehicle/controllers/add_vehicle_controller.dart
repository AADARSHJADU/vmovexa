import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AddVehicleController extends GetxController {
  final formKey = GlobalKey<FormState>();

  final regNoController = TextEditingController();
  final chassisNoController = TextEditingController();
  final modelNoController = TextEditingController();
  final capacityController = TextEditingController();

  final sourceController = TextEditingController();
  final destController = TextEditingController();

  final RxString selectedFleet = 'City Bus Fleet'.obs;
  final RxString selectedVehicleType = 'Coach Bus'.obs;
  final RxString selectedRoute = 'Route 101: Mumbai Central - Pune'.obs;
  final RxString selectedGps = 'GPS Device 1'.obs;

  final RxString selectedCapacityPill = 'Non-Sleeper'.obs;
  final RxString status = 'Active'.obs;

  final List<String> fleets = ['City Bus Fleet', 'School Bus Fleet', 'Airport Shuttle Fleet', 'Intercity Coach Fleet'];
  final List<String> vehicleTypes = ['Coach Bus', 'Double Decker Bus', 'Transit Bus', 'Mini Bus'];
  final List<String> routes = ['Route 101: Mumbai Central - Pune', 'Route 202: Dadar - Thane', 'Route 303: Airport Link'];
  final List<String> gpsDevices = ['GPS Device 1', 'GPS Device 2', 'GPS Device 3'];
  final List<String> capacityPills = ['Sleeper', 'Non-Sleeper', 'Mini Bus', 'AC Bus', 'Electric Bus'];

  // Display counters
  final RxInt leftDisplay = 2.obs;
  final RxInt rightDisplay = 2.obs;
  final RxInt rearDisplay = 1.obs;
  final RxInt emergencyDisplay = 1.obs;

  int get totalDisplays => leftDisplay.value + rightDisplay.value + rearDisplay.value + emergencyDisplay.value;

  void setStatus(String value) {
    status.value = value;
  }

  void incrementLeft() => leftDisplay.value++;
  void decrementLeft() { if (leftDisplay.value > 0) leftDisplay.value--; }

  void incrementRight() => rightDisplay.value++;
  void decrementRight() { if (rightDisplay.value > 0) rightDisplay.value--; }

  void incrementRear() => rearDisplay.value++;
  void decrementRear() { if (rearDisplay.value > 0) rearDisplay.value--; }

  void incrementEmergency() => emergencyDisplay.value++;
  void decrementEmergency() { if (emergencyDisplay.value > 0) emergencyDisplay.value--; }

  void addVehicle() {
    if (regNoController.text.trim().isEmpty) {
      Get.snackbar(
        'Required Field Missing',
        'Please enter a valid Registration Number.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    Get.back();
    Get.snackbar(
      'Vehicle Added',
      'Vehicle ${regNoController.text.trim()} has been successfully added.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  @override
  void onClose() {
    regNoController.dispose();
    chassisNoController.dispose();
    modelNoController.dispose();
    capacityController.dispose();
    sourceController.dispose();
    destController.dispose();
    super.onClose();
  }
}
