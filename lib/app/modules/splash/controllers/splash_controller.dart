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
    await Future.delayed(const Duration(milliseconds: 1500));

    if (Get.isRegistered<StorageService>() && StorageService.to.isLoggedIn()) {
      final savedUser = StorageService.to.getUser();

      try {
        final meRes = await AuthService.to.getMe().timeout(const Duration(seconds: 4));
        if (meRes.success && meRes.data != null) {
          final user = meRes.data!;
          await StorageService.to.saveUser(user);
          LoginController.currentRole = user.displayRole;
          Get.offNamed(user.dashboardRoute);
          return;
        }
      } catch (_) {
        // If /auth/me timed out or temporary network issue, proceed with cached user session
      }

      // If user profile is already saved locally, don't kick them out to onboarding!
      if (savedUser != null) {
        LoginController.currentRole = savedUser.displayRole;
        Get.offNamed(savedUser.dashboardRoute);
        return;
      }
    }

    Get.offNamed(Routes.ONBOARDING);
  }
}
