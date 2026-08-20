import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/subscriptions_controller.dart';

class SubscriptionsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SubscriptionsController>(() => SubscriptionsController());
  }
}
