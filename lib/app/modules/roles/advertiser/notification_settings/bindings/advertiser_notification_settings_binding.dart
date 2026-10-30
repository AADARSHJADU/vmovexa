import 'package:get/get.dart';
import '../controllers/advertiser_notification_settings_controller.dart';

class AdvertiserNotificationSettingsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdvertiserNotificationSettingsController>(() => AdvertiserNotificationSettingsController());
  }
}

