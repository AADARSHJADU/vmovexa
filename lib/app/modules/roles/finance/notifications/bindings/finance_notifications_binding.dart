import 'package:get/get.dart';
import '../controller/finance_notifications_controller.dart';

class FinanceNotificationsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FinanceNotificationsController>(
      () => FinanceNotificationsController(),
    );
  }
}
