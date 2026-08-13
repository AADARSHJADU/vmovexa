import 'package:get/get.dart';
import '../../../routes/app_routes.dart';

class HomeController extends GetxController {
  void logout() {
    Get.offAllNamed(Routes.LOGIN);
  }
}
