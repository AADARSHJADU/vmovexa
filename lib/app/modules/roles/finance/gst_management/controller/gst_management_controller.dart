import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../model/gst_model.dart';

class GSTManagementController extends GetxController with GetSingleTickerProviderStateMixin {
  // Tab controller
  late TabController tabController;

  // Observable data
  final Rx<GSTOverview?> gstOverview = Rx<GSTOverview?>(null);
  final Rx<GSTDetails?> gstDetails = Rx<GSTDetails?>(null);
  final Rx<GSTINInformation?> gstinInfo = Rx<GSTINInformation?>(null);
  final Rx<GSTAmounts?> gstAmounts = Rx<GSTAmounts?>(null);
  
  final RxBool isLoading = false.obs;
  final RxInt currentTabIndex = 0.obs;
  final Rx<DateTime> selectedMonth = DateTime.now().obs;

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(length: 4, vsync: this);
    tabController.addListener(() {
      currentTabIndex.value = tabController.index;
    });
    loadGSTData();
  }

  @override
  void onClose() {
    tabController.dispose();
    super.onClose();
  }

  /// Load all GST data
  void loadGSTData() {
    isLoading.value = true;
    
    // TODO: Replace with actual API calls
    Future.delayed(const Duration(milliseconds: 500), () {
      gstOverview.value = _getDummyOverview();
      gstDetails.value = _getDummyDetails();
      gstinInfo.value = _getDummyGSTINInfo();
      gstAmounts.value = _getDummyAmounts();
      isLoading.value = false;
    });
  }

  /// Change selected month
  void changeMonth(DateTime month) {
    selectedMonth.value = month;
    // Reload amounts data for the selected month
    loadGSTAmounts();
  }

  /// Load GST amounts for selected month
  void loadGSTAmounts() {
    // TODO: Replace with actual API call
    gstAmounts.value = _getDummyAmounts();
  }

  /// Navigate to GST Reports
  void navigateToReports() {
    Get.snackbar(
      'GST Reports',
      'Download GST returns and other reports',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// Navigate to Upload Documents
  void navigateToUploadDocuments() {
    Get.snackbar(
      'Upload Documents',
      'Upload purchase invoices, sales invoices and other documents',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// Navigate to GST History
  void navigateToHistory() {
    Get.snackbar(
      'GST History',
      'View previously filed GST returns and related activities',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// Contact Support
  void contactSupport() {
    Get.snackbar(
      'Contact Support',
      'For any GST related queries, contact support',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// Edit GST Details
  void editGSTDetails() {
    Get.snackbar(
      'Edit GST Details',
      'Edit your GST information',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// Edit GSTIN Information
  void editGSTINInfo() {
    Get.snackbar(
      'Edit GSTIN Information',
      'Edit your GSTIN information',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// View Details action
  void viewDetails(String type) {
    Get.snackbar(
      'View Details',
      'View $type details',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// View History action
  void viewHistory() {
    Get.snackbar(
      'View History',
      'View filed returns history',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  // Dummy data methods - Replace with actual API calls

  GSTOverview _getDummyOverview() {
    return const GSTOverview(
      totalLiability: 2445600,
      inputTaxCredit: 125300,
      netPayable: 120300,
      filedReturns: 6,
      totalReturns: 6,
    );
  }

  GSTDetails _getDummyDetails() {
    return GSTDetails(
      businessName: 'VMOVEXA Advertising Pvt. Ltd.',
      gstin: '27AABCV1234D1Z5',
      state: 'Maharashtra (27)',
      businessType: BusinessType.regular,
      registrationDate: DateTime(2024, 4, 1),
      status: GSTStatus.active,
      filingFrequency: FilingFrequency.monthly,
      compositionScheme: false,
      primaryEmail: 'finance@vmovexa.com',
      primaryContact: '+91 98765 43210',
      isVerified: true,
    );
  }

  GSTINInformation _getDummyGSTINInfo() {
    return GSTINInformation(
      gstin: '27AABCV1234D1Z5',
      legalBusinessName: 'VMOVEXA Advertising Pvt. Ltd.',
      tradeName: 'VMOVEXA Advertising',
      principalPlace:
          'Sai, 5th Floor, Pathum Tech Park, Sector 30, Vashi, Navi Mumbai - 400703, Maharashtra, India',
      state: 'Maharashtra (27)',
      gstJurisdiction: 'Maharashtra',
      gstDivision: 'Thane',
      compositionScheme: false,
      effectiveFrom: DateTime(2024, 4, 1),
      lastUpdated: DateTime(2026, 7, 25, 10, 30),
      otherRegistrations: const [
        OtherRegistration(type: 'PAN', number: 'AABCV1234D'),
        OtherRegistration(type: 'TAN', number: 'MUMN12345G'),
      ],
    );
  }

  GSTAmounts _getDummyAmounts() {
    return const GSTAmounts(
      taxableValue: 1845600,
      totalGST: 332208,
      totalITC: 125300,
      netGSTPayable: 206908,
      igst: 124500,
      cgst: 103854,
      sgst: 103854,
      cess: 0,
    );
  }

  /// Get GST Actions list
  List<GSTActionItem> getGSTActions() {
    return [
      GSTActionItem(
        title: 'GST Reports',
        description: 'Download GST returns and\nother GST reports',
        icon: Icons.description_outlined,
        color: const Color(0xFF6D28D9),
        onTap: navigateToReports,
      ),
      GSTActionItem(
        title: 'Upload Documents',
        description: 'Upload purchase invoices, sales invoices\nand other GST related documents',
        icon: Icons.upload_file_outlined,
        color: const Color(0xFF10B981),
        onTap: navigateToUploadDocuments,
      ),
      GSTActionItem(
        title: 'GST History',
        description: 'View previously filed GST returns\nand related activities',
        icon: Icons.history,
        color: const Color(0xFF3B82F6),
        onTap: navigateToHistory,
      ),
    ];
  }
}
