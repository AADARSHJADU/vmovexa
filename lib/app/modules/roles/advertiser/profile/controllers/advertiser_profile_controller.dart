import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class AdvertiserProfileController extends GetxController {
  final companyName = 'VMOVEXA Advertising Pvt. Ltd.'.obs;
  final businessType = 'Private Limited Company'.obs;
  final gstNumber = '27ABCDE1234F1Z5'.obs;
  final panNumber = 'ABCDE1234F'.obs;
  final registeredAddress = '101, Business Hub, Andheri East, Mumbai, Maharashtra - 400069'.obs;
  final website = 'www.vmovexa.com'.obs;

  final contactPerson = 'Vikram Mehta'.obs;
  final contactEmail = 'vikram.mehta@vmovexa.com'.obs;
  final contactPhone = '+91 98765 43210'.obs;

  final billingEmail = 'billing@vmovexa.com'.obs;
  final invoicesEmail = 'invoices@vmovexa.com'.obs;
  final paymentTerms = 'Net 15 Days'.obs;

  @override
  void onInit() {
    super.onInit();
    final user = StorageService.to.getUser();
    if (user != null) {
      if (user.companyName != null && user.companyName!.isNotEmpty) {
        companyName.value = user.companyName!;
      } else if (user.organizationName != null && user.organizationName!.isNotEmpty) {
        companyName.value = user.organizationName!;
      }
      if (user.name != null && user.name!.isNotEmpty) {
        contactPerson.value = user.name!;
      }
      if (user.email != null && user.email!.isNotEmpty) {
        contactEmail.value = user.email!;
        billingEmail.value = user.email!;
      }
      if (user.phone != null && user.phone!.isNotEmpty) {
        contactPhone.value = user.phone!;
      }
      if (user.officeAddress != null && user.officeAddress!.isNotEmpty) {
        registeredAddress.value = user.officeAddress!;
      }
    }
  }
}
