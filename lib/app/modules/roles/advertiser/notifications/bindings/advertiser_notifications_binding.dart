import 'package:get/get.dart';
import '../controllers/advertiser_notifications_controller.dart';

class AdvertiserNotificationsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdvertiserNotificationsController>(() => AdvertiserNotificationsController());
  }
}

