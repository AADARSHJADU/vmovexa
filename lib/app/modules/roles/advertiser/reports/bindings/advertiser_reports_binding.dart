import 'package:get/get.dart';
import '../controllers/advertiser_reports_controller.dart';

class AdvertiserReportsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdvertiserReportsController>(() => AdvertiserReportsController());
  }
}

