import 'package:get/get.dart';
import '../controllers/advertiser_change_password_controller.dart';

class AdvertiserChangePasswordBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdvertiserChangePasswordController>(() => AdvertiserChangePasswordController());
  }
}

