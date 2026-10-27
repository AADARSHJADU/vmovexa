/// Multi-State GSTIN Registration Item
class MultiStateGstin {
  final String gstin;
  final String state;
  final int invoicesCount;
  final double taxableAmount;
  final double totalTax;
  final String status;

  MultiStateGstin({
    required this.gstin,
    required this.state,
    required this.invoicesCount,
    required this.taxableAmount,
    required this.totalTax,
    required this.status,
  });

  factory MultiStateGstin.fromJson(Map<String, dynamic> json) {
    return MultiStateGstin(
      gstin: (json['gstin'] ?? '27M4BCY934D12S').toString(),
      state: (json['state'] ?? 'Maharashtra (27)').toString(),
      invoicesCount: int.tryParse((json['invoicesCount'] ?? json['invoices_count'] ?? 0).toString()) ?? 0,
      taxableAmount: double.tryParse((json['taxableAmount'] ?? json['taxable_amount'] ?? 0).toString().replaceAll(',', '')) ?? 0.0,
      totalTax: double.tryParse((json['totalTax'] ?? json['total_tax'] ?? 0).toString().replaceAll(',', '')) ?? 0.0,
      status: (json['status'] ?? 'Active').toString(),
    );
  }
}

/// Head-wise Tax Breakup Item
class GstBreakupItem {
  final String taxHead;
  final String rate;
  final double taxable;
  final double amount;
  final double itc;
  final double netPayable;

  GstBreakupItem({
    required this.taxHead,
    required this.rate,
    required this.taxable,
    required this.amount,
    required this.itc,
    required this.netPayable,
  });

  factory GstBreakupItem.fromJson(Map<String, dynamic> json) {
    return GstBreakupItem(
      taxHead: (json['taxHead'] ?? json['tax_head'] ?? 'CGST').toString(),
      rate: (json['rate'] ?? '9%').toString(),
      taxable: double.tryParse((json['taxable'] ?? json['taxable_value'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      amount: double.tryParse((json['amount'] ?? json['output_tax'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      itc: double.tryParse((json['itc'] ?? json['itc_available'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
      netPayable: double.tryParse((json['netPayable'] ?? json['net_payable'] ?? json['amount'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0,
    );
  }
}

/// Enterprise GST Summary Model matching Admin Panel 1:1
class GstSummaryModel {
  final double taxableValue;
  final double cgst;
  final double sgst;
  final double igst;
  final double totalGst;
  final double netPayable;

  // Corporate Registration
  final String legalName;
  final String gstin;
  final String state;
  final String filingFrequency;
  final String jurisdiction;

  // Multi-state roster
  final List<MultiStateGstin> gstinList;

  // Head-wise Tax Breakup
  final List<GstBreakupItem> breakup;

  GstSummaryModel({
    required this.taxableValue,
    required this.cgst,
    required this.sgst,
    required this.igst,
    required this.totalGst,
    required this.netPayable,
    required this.legalName,
    required this.gstin,
    required this.state,
    required this.filingFrequency,
    required this.jurisdiction,
    required this.gstinList,
    required this.breakup,
  });

  factory GstSummaryModel.fromJson(Map<String, dynamic> json) {
    final taxableValue = double.tryParse((json['taxableValue'] ?? json['taxable_value'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final cgst = double.tryParse((json['cgst'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final sgst = double.tryParse((json['sgst'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final igst = double.tryParse((json['igst'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final totalGst = double.tryParse((json['totalGst'] ?? json['total_gst'] ?? json['total_gst_collected'] ?? (cgst + sgst + igst)).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
    final netPayable = double.tryParse((json['netPayable'] ?? json['net_payable'] ?? totalGst).toString().replaceAll(',', '').replaceAll('₹', '')) ?? totalGst;

    final legalName = (json['legalName'] ?? json['legal_name'] ?? 'VMOVEXA PRIVATE LIMITED').toString();
    final gstin = (json['gstin'] ?? '27M4BCY934D12S').toString();
    final state = (json['state'] ?? 'Maharashtra (State Code: 27)').toString();
    final filingFrequency = (json['filingFrequency'] ?? json['filing_frequency'] ?? 'Monthly (GSTR-1 & GSTR-3B)').toString();
    final jurisdiction = (json['jurisdiction'] ?? 'Commissionerate: Mumbai East, Division: BKC').toString();

    // Roster
    final rawGstinList = json['gstinList'] is List ? json['gstinList'] as List : (json['gstin_list'] is List ? json['gstin_list'] as List : []);
    final gstinList = rawGstinList.map((e) => MultiStateGstin.fromJson(Map<String, dynamic>.from(e))).toList();

    // Breakup
    final rawBreakup = json['breakup'] is List ? json['breakup'] as List : [];
    final breakup = rawBreakup.map((e) => GstBreakupItem.fromJson(Map<String, dynamic>.from(e))).toList();

    return GstSummaryModel(
      taxableValue: taxableValue,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      totalGst: totalGst,
      netPayable: netPayable,
      legalName: legalName,
      gstin: gstin,
      state: state,
      filingFrequency: filingFrequency,
      jurisdiction: jurisdiction,
      gstinList: gstinList,
      breakup: breakup,
    );
  }
}
