/// Customer GSTIN Filing Summary Item matching Admin Panel 1:1
class CustomerGstinItem {
  final String gstin;
  final int invoicesCount;
  final double taxableAmount;
  final double totalTax;
  final String status;

  CustomerGstinItem({
    required this.gstin,
    required this.invoicesCount,
    required this.taxableAmount,
    required this.totalTax,
    required this.status,
  });

  factory CustomerGstinItem.fromJson(Map<String, dynamic> json) {
    return CustomerGstinItem(
      gstin: (json['gstin'] ?? '—').toString(),
      invoicesCount: int.tryParse((json['invoicesCount'] ?? json['invoices_count'] ?? 0).toString()) ?? 0,
      taxableAmount: double.tryParse((json['taxableAmount'] ?? json['taxable_amount'] ?? json['taxable'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      totalTax: double.tryParse((json['totalTax'] ?? json['total_tax'] ?? json['amount'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      status: (json['status'] ?? 'Recorded').toString(),
    );
  }
}

/// Head-wise Tax Breakup Item matching Admin Panel 1:1
class GstBreakupItem {
  final String taxHead;
  final String rate;
  final double taxable;
  final double amount;

  GstBreakupItem({
    required this.taxHead,
    required this.rate,
    required this.taxable,
    required this.amount,
  });

  factory GstBreakupItem.fromJson(Map<String, dynamic> json) {
    return GstBreakupItem(
      taxHead: (json['taxHead'] ?? json['tax_head'] ?? json['head'] ?? '—').toString(),
      rate: (json['rate'] ?? '—').toString(),
      taxable: double.tryParse((json['taxable'] ?? json['taxable_value'] ?? json['taxableAmount'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      amount: double.tryParse((json['amount'] ?? json['outputTax'] ?? json['output_tax'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
    );
  }
}

/// Enterprise GST Summary Model matching Admin Panel GstManagementPage.jsx 1:1
class GstSummaryModel {
  // Tab 1 & Tab 3 Metrics
  final double taxableValue;
  final double cgst;
  final double sgst;
  final double igst;
  final double totalGst;
  final double compensationCess;
  final double otherStatutoryTax;

  // Verification & Status
  final String verificationStatus; // 'configured' | 'not_configured'
  final int repairedRecords;

  // Corporate Registration (Configuration Record)
  final String legalName;
  final String gstin;
  final String state;
  final String stateCode;
  final String filingFrequency;
  final String jurisdiction;

  // Tab 2: Customer GSTIN Filing Summary
  final List<CustomerGstinItem> customerGstinSummary;

  // Tab 3: Detailed Head-wise Tax Breakup
  final List<GstBreakupItem> breakup;

  GstSummaryModel({
    required this.taxableValue,
    required this.cgst,
    required this.sgst,
    required this.igst,
    required this.totalGst,
    required this.compensationCess,
    required this.otherStatutoryTax,
    required this.verificationStatus,
    required this.repairedRecords,
    required this.legalName,
    required this.gstin,
    required this.state,
    required this.stateCode,
    required this.filingFrequency,
    required this.jurisdiction,
    required this.customerGstinSummary,
    required this.breakup,
  });

  factory GstSummaryModel.empty() {
    return GstSummaryModel(
      taxableValue: 0.0,
      cgst: 0.0,
      sgst: 0.0,
      igst: 0.0,
      totalGst: 0.0,
      compensationCess: 0.0,
      otherStatutoryTax: 0.0,
      verificationStatus: '',
      repairedRecords: 0,
      legalName: '—',
      gstin: '—',
      state: '—',
      stateCode: '',
      filingFrequency: 'Monthly (GSTR-1 & GSTR-3B)',
      jurisdiction: '—',
      customerGstinSummary: [],
      breakup: [],
    );
  }

  factory GstSummaryModel.fromJson(Map<String, dynamic> json) {
    final taxableValue = double.tryParse((json['taxableValue'] ?? json['taxable_value'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final cgst = double.tryParse((json['cgst'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final sgst = double.tryParse((json['sgst'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final igst = double.tryParse((json['igst'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final totalGst = double.tryParse((json['totalGst'] ?? json['total_gst'] ?? json['total_gst_collected'] ?? (cgst + sgst + igst)).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;

    final verificationStatus = (json['verificationStatus'] ?? json['verification_status'] ?? (json['gstin'] != null && json['gstin'] != '—' ? 'configured' : '')).toString();
    final repairedRecords = int.tryParse((json['repairedRecords'] ?? json['repaired_records'] ?? 0).toString()) ?? 0;

    // Corporate Registration fields
    final legalName = (json['legalName'] ?? json['legal_name'] ?? '—').toString();
    final gstin = (json['gstin'] ?? json['gstin_number'] ?? '—').toString();
    final state = (json['state'] ?? '—').toString();
    final stateCode = (json['stateCode'] ?? json['state_code'] ?? '').toString();
    final filingFrequency = (json['filingFrequency'] ?? json['filing_frequency'] ?? 'Monthly (GSTR-1 & GSTR-3B)').toString();
    final jurisdiction = (json['jurisdiction'] ?? '—').toString();

    // Tab 2: Customer GSTIN Filing Summary
    List<CustomerGstinItem> customerGstins = [];
    final rawCustomerList = json['customerGstinSummary'] is List
        ? json['customerGstinSummary'] as List
        : (json['customer_gstin_summary'] is List
            ? json['customer_gstin_summary'] as List
            : (json['gstinList'] is List ? json['gstinList'] as List : []));

    customerGstins = rawCustomerList
        .whereType<Map>()
        .map((e) => CustomerGstinItem.fromJson(Map<String, dynamic>.from(e)))
        .toList();

    // Tab 3: Detailed Head-wise Tax Breakup
    List<GstBreakupItem> breakupList = [];
    final rawBreakup = json['breakup'] is List ? json['breakup'] as List : [];
    breakupList = rawBreakup
        .whereType<Map>()
        .map((e) => GstBreakupItem.fromJson(Map<String, dynamic>.from(e)))
        .toList();

    // Derive GST Compensation Cess from JSON or breakup rows
    double parsedCess = double.tryParse((json['compensationCess'] ?? json['cess'] ?? json['gst_compensation_cess'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    if (parsedCess == 0.0) {
      for (final b in breakupList) {
        final th = b.taxHead.toLowerCase();
        if (th.contains('cess') || th.contains('compensation')) {
          parsedCess += b.amount;
        }
      }
    }

    // Derive Other Statutory Tax from JSON or breakup rows
    double parsedOther = double.tryParse((json['otherStatutoryTax'] ?? json['otherTax'] ?? json['other_statutory_tax'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    if (parsedOther == 0.0) {
      for (final b in breakupList) {
        final th = b.taxHead.toLowerCase();
        if (!th.contains('cgst') && !th.contains('sgst') && !th.contains('igst') && !th.contains('cess') && !th.contains('compensation')) {
          parsedOther += b.amount;
        }
      }
    }

    return GstSummaryModel(
      taxableValue: taxableValue,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      totalGst: totalGst,
      compensationCess: parsedCess,
      otherStatutoryTax: parsedOther,
      verificationStatus: verificationStatus,
      repairedRecords: repairedRecords,
      legalName: legalName,
      gstin: gstin,
      state: state,
      stateCode: stateCode,
      filingFrequency: filingFrequency,
      jurisdiction: jurisdiction,
      customerGstinSummary: customerGstins,
      breakup: breakupList,
    );
  }
}
