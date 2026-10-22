import 'package:get/get.dart';
import '../controllers/activity_logs_controller.dart';

class ActivityLogsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ActivityLogsController>(() => ActivityLogsController());
  }
}
