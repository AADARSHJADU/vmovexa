import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/modules/auth/login/controllers/login_controller.dart';

class SplashController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    _handleNavigation();
  }

  Future<void> _handleNavigation() async {
    await Future.delayed(const Duration(milliseconds: 2000));

    if (Get.isRegistered<StorageService>() && StorageService.to.isLoggedIn()) {
      try {
        final meRes = await AuthService.to.getMe();
        if (meRes.success && meRes.data != null) {
          final user = meRes.data!;
          LoginController.currentRole = user.displayRole;
          Get.offNamed(user.dashboardRoute);
          return;
        }
      } catch (_) {
        // Fallback to onboarding if session verification fails
      }
    }

    Get.offNamed(Routes.ONBOARDING);
  }
}
