import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../fleet_list/controllers/fleet_list_controller.dart';

class AddFleetController extends GetxController {
  final formKey = GlobalKey<FormState>();

  final nameController = TextEditingController();
  final descController = TextEditingController();
  final contactPersonController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();

  final RxString selectedOrg = 'VMOVEXA Transport'.obs;
  final RxString selectedType = 'City Bus Fleet'.obs;
  final RxString selectedLocation = 'Mumbai Central'.obs;
  final RxString selectedTimeZone = 'IST (UTC+05:30)'.obs;
  final RxString selectedHours = '09:00 AM - 06:00 PM'.obs;

  final RxString status = 'Active'.obs;

  final List<String> organizations = ['VMOVEXA Transport', 'Mumbai Smart Transit', 'Corporate Shuttle Corp'];
  final List<String> fleetTypes = ['City Bus Fleet', 'School Bus Fleet', 'Airport Shuttle Fleet', 'Intercity Coach Fleet'];
  final List<String> locations = ['Mumbai Central', 'Pune Sector 4', 'Delhi Airport T3', 'Bangalore Hub'];
  final List<String> timeZones = ['IST (UTC+05:30)', 'EST (UTC-05:00)', 'GMT (UTC+00:00)'];
  final List<String> workingHours = ['09:00 AM - 06:00 PM', '06:00 AM - 02:00 PM', '24 Hours Operational'];

  void setStatus(String value) {
    status.value = value;
  }

  void createFleet() {
    if (nameController.text.trim().isEmpty) {
      Get.snackbar(
        'Required Field Missing',
        'Please enter a valid Fleet Name.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    // Success and pass new Fleet object back to the list
    final newFleet = Fleet(
      id: 'FLT${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
      name: nameController.text.trim(),
      status: status.value,
      vehiclesCount: 0,
      driversCount: 0,
      gpsOnlineCount: 0,
      lastUpdated: 'Just Now',
    );

    Get.back(result: newFleet);

    Get.snackbar(
      'Fleet Created',
      '${newFleet.name} has been added successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  @override
  void onClose() {
    nameController.dispose();
    descController.dispose();
    contactPersonController.dispose();
    phoneController.dispose();
    emailController.dispose();
    super.onClose();
  }
}
