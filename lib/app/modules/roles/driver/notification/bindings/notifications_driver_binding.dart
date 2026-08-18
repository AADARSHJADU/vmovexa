import 'package:get/get.dart';
import '../../../fleet_operator/notifications/controllers/notifications_controller.dart';
import '../controller/notifications_driver_controller.dart';

class NotificationsDriverBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<NotificationsDriverController>(() => NotificationsDriverController());
  }
}
