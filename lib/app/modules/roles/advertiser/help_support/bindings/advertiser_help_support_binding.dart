import 'package:get/get.dart';
import '../controllers/advertiser_help_support_controller.dart';

class AdvertiserHelpSupportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdvertiserHelpSupportController>(() => AdvertiserHelpSupportController());
  }
}

