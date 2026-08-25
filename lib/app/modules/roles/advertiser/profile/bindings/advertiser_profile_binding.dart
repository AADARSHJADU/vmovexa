import 'package:get/get.dart';
import '../controllers/advertiser_profile_controller.dart';

class AdvertiserProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AdvertiserProfileController>(AdvertiserProfileController());
  }
}
