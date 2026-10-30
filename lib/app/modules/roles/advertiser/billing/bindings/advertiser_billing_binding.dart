import 'package:get/get.dart';
import '../controllers/advertiser_billing_controller.dart';

class AdvertiserBillingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdvertiserBillingController>(() => AdvertiserBillingController());
  }
}

