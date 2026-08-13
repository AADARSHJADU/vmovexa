import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DriverModel {
  final String name;
  final String empId;
  final String dlNo;
  final String dlExpiry;
  final String status;

  DriverModel({
    required this.name,
    required this.empId,
    required this.dlNo,
    required this.dlExpiry,
    required this.status,
  });
}

class AddDriverController extends GetxController {
  final formKey = GlobalKey<FormState>();

  final nameController = TextEditingController();
  final empIdController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();
  final dobController = TextEditingController();
  final addressController = TextEditingController();

  final licenseNoController = TextEditingController();
  final issueDateController = TextEditingController();
  final expiryDateController = TextEditingController();
  final authorityController = TextEditingController();

  final emergencyContactController = TextEditingController();
  final notesController = TextEditingController();

  final RxString selectedGender = 'Male'.obs;
  final RxString selectedLicenseType = 'Heavy Motor Vehicle (HMV)'.obs;
  final RxString selectedBloodGroup = 'O+'.obs;
  final RxString status = 'Active'.obs;

  final List<String> genders = ['Male', 'Female', 'Other'];
  final List<String> licenseTypes = ['Heavy Motor Vehicle (HMV)', 'Light Motor Vehicle (LMV)', 'Commercial Driver License (CDL)'];
  final List<String> bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  void setStatus(String value) {
    status.value = value;
  }

  void selectDate(BuildContext context, TextEditingController controller) async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1960),
      lastDate: DateTime(2040),
    );
    if (picked != null) {
      controller.text = '${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}';
    }
  }

  void addDriver() {
    if (nameController.text.trim().isEmpty || empIdController.text.trim().isEmpty || licenseNoController.text.trim().isEmpty) {
      Get.snackbar(
        'Required Fields Missing',
        'Please enter Name, Employee ID and License Number.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    final newDriver = DriverModel(
      name: nameController.text.trim(),
      empId: empIdController.text.trim(),
      dlNo: licenseNoController.text.trim(),
      dlExpiry: expiryDateController.text.isNotEmpty ? expiryDateController.text : '15 Dec 2025',
      status: status.value,
    );

    Get.back(result: newDriver);
    Get.snackbar(
      'Driver Added',
      'Driver ${newDriver.name} has been added successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  @override
  void onClose() {
    nameController.dispose();
    empIdController.dispose();
    phoneController.dispose();
    emailController.dispose();
    dobController.dispose();
    addressController.dispose();
    licenseNoController.dispose();
    issueDateController.dispose();
    expiryDateController.dispose();
    authorityController.dispose();
    emergencyContactController.dispose();
    notesController.dispose();
    super.onClose();
  }
}
