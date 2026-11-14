import 'package:get/get.dart';
import '../controller/notifications_driver_controller.dart';

class NotificationsDriverBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<NotificationsDriverController>(() => NotificationsDriverController());
  }
}
