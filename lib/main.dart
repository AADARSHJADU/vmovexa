import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'app/routes/app_pages.dart';
import 'app/theme/app_theme.dart';

import 'app/data/services/storage_service.dart';
import 'app/data/services/http_client_service.dart';
import 'app/data/services/auth_service.dart';
import 'app/data/services/fleet_service.dart';
import 'app/data/services/technician_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Get.putAsync(() => StorageService().init());
  Get.put(HttpClientService());
  Get.put(AuthService());
  Get.put(FleetService());
  Get.put(TechnicianService());
  runApp(const VMovexaApp());
}

class VMovexaApp extends StatelessWidget {
  const VMovexaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'VMOVEXA',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: AppPages.INITIAL,
      getPages: AppPages.routes,
    );
  }
}
