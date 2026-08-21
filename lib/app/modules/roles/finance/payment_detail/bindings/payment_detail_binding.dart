import 'package:get/get.dart';
import '../controller/payment_detail_controller.dart';

class PaymentDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PaymentDetailController>(
      () => PaymentDetailController(),
    );
  }
}
