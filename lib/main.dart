import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'app/data/services/advertiser_service.dart';
import 'app/data/services/driver_service.dart';
import 'app/data/services/finance_service.dart';
import 'app/data/services/government_service.dart';
import 'app/data/services/technician_service.dart';
import 'app/routes/app_pages.dart';
import 'app/theme/app_theme.dart';

import 'app/data/services/storage_service.dart';
import 'app/data/services/http_client_service.dart';
import 'app/data/services/auth_service.dart';
import 'app/data/services/fleet_service.dart';
import 'app/translations/app_translations.dart';
import 'app/translations/services/localization_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Get.putAsync(() => StorageService().init());
  Get.put(LocalizationService());
  Get.put(HttpClientService());
  Get.put(AuthService());
  Get.put(FleetService());
  Get.put(TechnicianService());
  Get.put(FinanceService());
  Get.put(AdvertiserService());
  Get.put(DriverService());
  Get.put(GovernmentService());
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
      translations: AppTranslations(),
      locale: LocalizationService.currentLocale,
      fallbackLocale: LocalizationService.fallbackLocale,
      initialRoute: AppPages.INITIAL,
      getPages: AppPages.routes,
    );
  }
}