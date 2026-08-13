import 'package:flutter/material.dart';
import 'package:get/get.dart';

class GpsModel {
  final String id;
  final String model;
  final String simNo;
  final String battery;
  final String signal;
  final String status;

  GpsModel({
    required this.id,
    required this.model,
    required this.simNo,
    required this.battery,
    required this.signal,
    required this.status,
  });
}

class AddGpsController extends GetxController {
  final formKey = GlobalKey<FormState>();

  final imeiController = TextEditingController();
  final simNoController = TextEditingController();
  final batteryController = TextEditingController();
  final dateController = TextEditingController();
  final serialNoController = TextEditingController();

  final firmwareController = TextEditingController();
  final aliasController = TextEditingController();
  final notesController = TextEditingController();

  final RxString selectedModel = 'Teltonika FMB920'.obs;
  final RxString selectedProvider = 'Airtel IoT'.obs;
  final RxString selectedNetworkType = '4G LTE'.obs;
  final RxString status = 'Active'.obs;

  final List<String> models = ['Teltonika FMB920', 'Queclink GV57', 'Teltonika FMB125', 'Coban GPS303'];
  final List<String> providers = ['Airtel IoT', 'Vodafone Idea Business', 'Jio IoT', 'BSNL M2M'];
  final List<String> networkTypes = ['4G LTE', '3G WCDMA', '2G GSM', '5G NR'];

  // Character counter for Notes
  final RxInt notesCharCount = 0.obs;

  @override
  void onInit() {
    super.onInit();
    notesController.addListener(() {
      notesCharCount.value = notesController.text.length;
    });
  }

  void setStatus(String value) {
    status.value = value;
  }

  void selectDate(BuildContext context) async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );
    if (picked != null) {
      dateController.text = '${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}';
    }
  }

  void scanImeiCode() {
    // Simulating QR/Barcode IMEI scanning
    imeiController.text = 'GPS-TRK-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}';
    Get.snackbar(
      'Scan Successful',
      'GPS Device ID/IMEI scan completed successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void addGpsDevice() {
    if (imeiController.text.trim().isEmpty || simNoController.text.trim().isEmpty) {
      Get.snackbar(
        'Required Fields Missing',
        'Please enter GPS Device ID/IMEI and SIM Number.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    final newGps = GpsModel(
      id: imeiController.text.trim(),
      model: selectedModel.value,
      simNo: simNoController.text.trim(),
      battery: batteryController.text.isNotEmpty ? '${batteryController.text}%' : '85%',
      signal: 'Strong',
      status: status.value,
    );

    Get.back(result: newGps);
    Get.snackbar(
      'GPS Device Added',
      'GPS Device ${newGps.id} has been added successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  @override
  void onClose() {
    imeiController.dispose();
    simNoController.dispose();
    batteryController.dispose();
    dateController.dispose();
    serialNoController.dispose();
    firmwareController.dispose();
    aliasController.dispose();
    notesController.dispose();
    super.onClose();
  }
}
