import 'package:get/get.dart';
import '../controllers/tech_edge_setup_controller.dart';

class TechEdgeSetupBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TechEdgeSetupController>(() => TechEdgeSetupController());
  }
}
