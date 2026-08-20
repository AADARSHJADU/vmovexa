import 'package:get/get.dart';

import '../controller/manage_subscription_controller.dart';
import '../model/subscription_model.dart';

/// NOTE: `ManageSubscriptionController` requires a `subscription` constructor
/// arg, so it's normally instantiated directly via
/// `Get.put(ManageSubscriptionController(subscription: sub))` from
/// `SubscriptionsController.onSubscriptionTap()` right before navigating here.
///
/// This binding covers opening `ManageSubscriptionView` as a standalone named
/// route (e.g. from a deep link) — it expects a `Subscription` object passed
/// via `Get.arguments`.
class ManageSubscriptionBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<ManageSubscriptionController>()) {
      final args = Get.arguments;
      if (args is Subscription) {
        Get.put(ManageSubscriptionController(subscription: args));
      }
    }
  }
}
