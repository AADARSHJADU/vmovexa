import 'package:get/get.dart';
import '../controllers/record_offline_payment_controller.dart';

class RecordOfflinePaymentBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RecordOfflinePaymentController>(
      () => RecordOfflinePaymentController(),
    );
  }
}
