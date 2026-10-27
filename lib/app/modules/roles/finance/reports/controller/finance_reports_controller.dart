import 'package:get/get.dart';

class FinanceReportsController extends GetxController {
  final RxInt selectedSubTab = 0.obs; // 0: Revenue, 1: GST, 2: Reconciliation, 3: Subscriptions

  void setSubTab(int index) {
    selectedSubTab.value = index;
  }
}
