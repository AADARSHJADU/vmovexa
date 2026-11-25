import 'dart:convert';

/// Enterprise Finance Settings Model matching Admin Panel FinanceAccountSettingsPage.jsx 1:1
class FinanceSettingsModel {
  // Tab 1: Corporate Info
  final String companyName;
  final String tradeName;
  final String gstin;
  final String pan;
  final String email;
  final String phone;
  final String website;
  final String address;

  // Tab 2: Banking Details
  final String bankName;
  final String accountName;
  final String accountNumber;
  final String ifscCode;
  final String branch;
  final String upiId;

  // Tab 3: Terms & Logo
  final String logoUrl;
  final String termsAndConditions;
  final String footerNote;

  // Tab 4: Signatory Profile
  final String signatoryName;
  final String signatoryDesignation;
  final String signatoryEmpId;
  final String signatoryEmail;
  final String signatoryPhone;
  final String signatorySignatureUrl;
  final String signatorySealUrl;

  FinanceSettingsModel({
    required this.companyName,
    required this.tradeName,
    required this.gstin,
    required this.pan,
    required this.email,
    required this.phone,
    required this.website,
    required this.address,
    required this.bankName,
    required this.accountName,
    required this.accountNumber,
    required this.ifscCode,
    required this.branch,
    required this.upiId,
    required this.logoUrl,
    required this.termsAndConditions,
    required this.footerNote,
    required this.signatoryName,
    required this.signatoryDesignation,
    required this.signatoryEmpId,
    required this.signatoryEmail,
    required this.signatoryPhone,
    required this.signatorySignatureUrl,
    required this.signatorySealUrl,
  });

  factory FinanceSettingsModel.defaults() {
    return FinanceSettingsModel(
      companyName: 'VMOVEXA PRIVATE LIMITED',
      tradeName: 'VMOVEXA',
      gstin: '27M4BCY934D12S',
      pan: 'AACCV1234F',
      email: 'billing@vmovexa.com',
      phone: '+91 98765 88990',
      website: 'https://vmovexa.com',
      address: '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
      bankName: 'HDFC Bank Ltd',
      accountName: 'VMOVEXA PRIVATE LIMITED',
      accountNumber: '50200088219012',
      ifscCode: 'HDFC0000123',
      branch: 'BKC Corporate Branch, Mumbai',
      upiId: 'vmovexa@hdfcbank',
      logoUrl: '/logo/logo_clinet.png',
      termsAndConditions: '1. Payment is due within 15 days of invoice issue date.\n'
          '2. Overdue payments incur interest at 18% p.a.\n'
          '3. Subject to Mumbai Jurisdiction only.\n'
          '4. Computer generated invoice under GST rules, signature not required.',
      footerNote: 'This is a computer-generated tax invoice under GST rules and requires no physical signature.',
      signatoryName: 'Rahul Sharma',
      signatoryDesignation: 'Finance Officer',
      signatoryEmpId: 'FIN-101',
      signatoryEmail: 'rahul@vmovexa.com',
      signatoryPhone: '+91 98765 88990',
      signatorySignatureUrl: '',
      signatorySealUrl: '',
    );
  }

  factory FinanceSettingsModel.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> design = {};
    final rawDesign = json['invoice_design'] ?? json['invoiceDesign'];
    if (rawDesign is Map) {
      design = Map<String, dynamic>.from(rawDesign);
    } else if (rawDesign is String && rawDesign.trim().isNotEmpty) {
      try {
        final parsed = jsonDecode(rawDesign);
        if (parsed is Map) {
          design = Map<String, dynamic>.from(parsed);
        }
      } catch (_) {}
    }

    return FinanceSettingsModel(
      companyName: (json['company_name'] ?? json['companyName'] ?? 'VMOVEXA PRIVATE LIMITED').toString(),
      tradeName: (json['trade_name'] ?? json['tradeName'] ?? 'VMOVEXA').toString(),
      gstin: (json['gstin'] ?? '27M4BCY934D12S').toString(),
      pan: (json['pan'] ?? 'AACCV1234F').toString(),
      email: (json['billing_email'] ?? json['email'] ?? 'billing@vmovexa.com').toString(),
      phone: (json['billing_phone'] ?? json['phone'] ?? '+91 98765 88990').toString(),
      website: (json['website'] ?? 'https://vmovexa.com').toString(),
      address: (json['address'] ?? '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051').toString(),
      bankName: (json['bank_name'] ?? json['bankName'] ?? 'HDFC Bank Ltd').toString(),
      accountName: (json['account_name'] ?? json['accountName'] ?? 'VMOVEXA PRIVATE LIMITED').toString(),
      accountNumber: (json['account_number'] ?? json['accountNumber'] ?? '50200088219012').toString(),
      ifscCode: (json['ifsc_code'] ?? json['ifscCode'] ?? 'HDFC0000123').toString(),
      branch: (json['branch'] ?? 'BKC Corporate Branch, Mumbai').toString(),
      upiId: (json['upi_id'] ?? json['upiId'] ?? design['upiId'] ?? design['upi_id'] ?? 'vmovexa@hdfcbank').toString(),
      logoUrl: (json['logo_url'] ?? json['logoUrl'] ?? '/logo/logo_clinet.png').toString(),
      termsAndConditions: (json['terms_and_conditions'] ?? json['termsAndConditions'] ?? '1. Payment is due within 15 days of invoice issue date.\n2. Overdue payments incur interest at 18% p.a.\n3. Subject to Mumbai Jurisdiction only.\n4. Computer generated invoice under GST rules, signature not required.').toString(),
      footerNote: (json['footer_note'] ?? json['footerNote'] ?? design['footerNote'] ?? 'This is a computer-generated tax invoice under GST rules and requires no physical signature.').toString(),
      signatoryName: (json['signatory_name'] ?? json['signatoryName'] ?? 'Rahul Sharma').toString(),
      signatoryDesignation: (json['signatory_designation'] ?? json['signatoryDesignation'] ?? 'Finance Officer').toString(),
      signatoryEmpId: (json['signatory_emp_id'] ?? json['signatoryEmpId'] ?? 'FIN-101').toString(),
      signatoryEmail: (json['signatory_email'] ?? json['signatoryEmail'] ?? 'rahul@vmovexa.com').toString(),
      signatoryPhone: (json['signatory_phone'] ?? json['signatoryPhone'] ?? '+91 98765 88990').toString(),
      signatorySignatureUrl: (json['signatory_signature_url'] ?? json['signatorySignatureUrl'] ?? design['signatureUrl'] ?? design['signatory_signature_url'] ?? '').toString(),
      signatorySealUrl: (json['signatory_seal_url'] ?? json['signatorySealUrl'] ?? design['sealUrl'] ?? design['signatory_seal_url'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'companyName': companyName,
      'tradeName': tradeName,
      'gstin': gstin,
      'pan': pan,
      'email': email,
      'phone': phone,
      'website': website,
      'address': address,
      'bankName': bankName,
      'accountName': accountName,
      'accountNumber': accountNumber,
      'ifscCode': ifscCode,
      'branch': branch,
      'upiId': upiId,
      'logoUrl': logoUrl,
      'termsAndConditions': termsAndConditions,
      'footerNote': footerNote,
      'signatoryName': signatoryName,
      'signatoryDesignation': signatoryDesignation,
      'signatoryEmpId': signatoryEmpId,
      'signatoryEmail': signatoryEmail,
      'signatoryPhone': signatoryPhone,
      'signatorySignatureUrl': signatorySignatureUrl,
      'signatorySealUrl': signatorySealUrl,
    };
  }
}
