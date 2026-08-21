import 'package:flutter/material.dart';

/// GST Status enum
enum GSTStatus { active, inactive, suspended }

extension GSTStatusX on GSTStatus {
  String get label {
    switch (this) {
      case GSTStatus.active:
        return 'Active';
      case GSTStatus.inactive:
        return 'Inactive';
      case GSTStatus.suspended:
        return 'Suspended';
    }
  }

  Color get color {
    switch (this) {
      case GSTStatus.active:
        return const Color(0xFF10B981); // green
      case GSTStatus.inactive:
        return const Color(0xFF6B7280); // gray
      case GSTStatus.suspended:
        return const Color(0xFFEF4444); // red
    }
  }
}

/// Business Type enum
enum BusinessType { regular, composition }

extension BusinessTypeX on BusinessType {
  String get label {
    switch (this) {
      case BusinessType.regular:
        return 'Regular';
      case BusinessType.composition:
        return 'Composition';
    }
  }
}

/// Returns Filing Frequency
enum FilingFrequency { monthly, quarterly, annual }

extension FilingFrequencyX on FilingFrequency {
  String get label {
    switch (this) {
      case FilingFrequency.monthly:
        return 'Monthly';
      case FilingFrequency.quarterly:
        return 'Quarterly';
      case FilingFrequency.annual:
        return 'Annual';
    }
  }
}

/// GST Overview model
class GSTOverview {
  final double totalLiability;
  final double inputTaxCredit;
  final double netPayable;
  final int filedReturns;
  final int totalReturns;

  const GSTOverview({
    required this.totalLiability,
    required this.inputTaxCredit,
    required this.netPayable,
    required this.filedReturns,
    required this.totalReturns,
  });

  factory GSTOverview.fromJson(Map<String, dynamic> json) {
    return GSTOverview(
      totalLiability: (json['totalLiability'] as num).toDouble(),
      inputTaxCredit: (json['inputTaxCredit'] as num).toDouble(),
      netPayable: (json['netPayable'] as num).toDouble(),
      filedReturns: json['filedReturns'] as int,
      totalReturns: json['totalReturns'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'totalLiability': totalLiability,
        'inputTaxCredit': inputTaxCredit,
        'netPayable': netPayable,
        'filedReturns': filedReturns,
        'totalReturns': totalReturns,
      };
}

/// GST Details model
class GSTDetails {
  final String businessName;
  final String gstin;
  final String state;
  final BusinessType businessType;
  final DateTime registrationDate;
  final GSTStatus status;
  final FilingFrequency filingFrequency;
  final bool compositionScheme;
  final String primaryEmail;
  final String primaryContact;
  final bool isVerified;

  const GSTDetails({
    required this.businessName,
    required this.gstin,
    required this.state,
    required this.businessType,
    required this.registrationDate,
    required this.status,
    required this.filingFrequency,
    required this.compositionScheme,
    required this.primaryEmail,
    required this.primaryContact,
    required this.isVerified,
  });

  factory GSTDetails.fromJson(Map<String, dynamic> json) {
    return GSTDetails(
      businessName: json['businessName'] as String,
      gstin: json['gstin'] as String,
      state: json['state'] as String,
      businessType: BusinessType.values.firstWhere(
        (e) => e.name == json['businessType'],
        orElse: () => BusinessType.regular,
      ),
      registrationDate: DateTime.parse(json['registrationDate'] as String),
      status: GSTStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => GSTStatus.active,
      ),
      filingFrequency: FilingFrequency.values.firstWhere(
        (e) => e.name == json['filingFrequency'],
        orElse: () => FilingFrequency.monthly,
      ),
      compositionScheme: json['compositionScheme'] as bool,
      primaryEmail: json['primaryEmail'] as String,
      primaryContact: json['primaryContact'] as String,
      isVerified: json['isVerified'] as bool,
    );
  }

  Map<String, dynamic> toJson() => {
        'businessName': businessName,
        'gstin': gstin,
        'state': state,
        'businessType': businessType.name,
        'registrationDate': registrationDate.toIso8601String(),
        'status': status.name,
        'filingFrequency': filingFrequency.name,
        'compositionScheme': compositionScheme,
        'primaryEmail': primaryEmail,
        'primaryContact': primaryContact,
        'isVerified': isVerified,
      };
}

/// GSTIN Information model
class GSTINInformation {
  final String gstin;
  final String legalBusinessName;
  final String tradeName;
  final String principalPlace;
  final String state;
  final String gstJurisdiction;
  final String gstDivision;
  final bool compositionScheme;
  final DateTime effectiveFrom;
  final DateTime lastUpdated;
  final List<OtherRegistration> otherRegistrations;

  const GSTINInformation({
    required this.gstin,
    required this.legalBusinessName,
    required this.tradeName,
    required this.principalPlace,
    required this.state,
    required this.gstJurisdiction,
    required this.gstDivision,
    required this.compositionScheme,
    required this.effectiveFrom,
    required this.lastUpdated,
    required this.otherRegistrations,
  });

  factory GSTINInformation.fromJson(Map<String, dynamic> json) {
    return GSTINInformation(
      gstin: json['gstin'] as String,
      legalBusinessName: json['legalBusinessName'] as String,
      tradeName: json['tradeName'] as String,
      principalPlace: json['principalPlace'] as String,
      state: json['state'] as String,
      gstJurisdiction: json['gstJurisdiction'] as String,
      gstDivision: json['gstDivision'] as String,
      compositionScheme: json['compositionScheme'] as bool,
      effectiveFrom: DateTime.parse(json['effectiveFrom'] as String),
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
      otherRegistrations: (json['otherRegistrations'] as List?)
              ?.map((e) => OtherRegistration.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'gstin': gstin,
        'legalBusinessName': legalBusinessName,
        'tradeName': tradeName,
        'principalPlace': principalPlace,
        'state': state,
        'gstJurisdiction': gstJurisdiction,
        'gstDivision': gstDivision,
        'compositionScheme': compositionScheme,
        'effectiveFrom': effectiveFrom.toIso8601String(),
        'lastUpdated': lastUpdated.toIso8601String(),
        'otherRegistrations':
            otherRegistrations.map((e) => e.toJson()).toList(),
      };
}

/// Other Registration model
class OtherRegistration {
  final String type; // PAN, TAN, etc.
  final String number;

  const OtherRegistration({
    required this.type,
    required this.number,
  });

  factory OtherRegistration.fromJson(Map<String, dynamic> json) {
    return OtherRegistration(
      type: json['type'] as String,
      number: json['number'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type,
        'number': number,
      };
}

/// GST Amounts model
class GSTAmounts {
  final double taxableValue;
  final double totalGST;
  final double totalITC;
  final double netGSTPayable;
  final double igst;
  final double cgst;
  final double sgst;
  final double cess;

  const GSTAmounts({
    required this.taxableValue,
    required this.totalGST,
    required this.totalITC,
    required this.netGSTPayable,
    required this.igst,
    required this.cgst,
    required this.sgst,
    required this.cess,
  });

  factory GSTAmounts.fromJson(Map<String, dynamic> json) {
    return GSTAmounts(
      taxableValue: (json['taxableValue'] as num).toDouble(),
      totalGST: (json['totalGST'] as num).toDouble(),
      totalITC: (json['totalITC'] as num).toDouble(),
      netGSTPayable: (json['netGSTPayable'] as num).toDouble(),
      igst: (json['igst'] as num).toDouble(),
      cgst: (json['cgst'] as num).toDouble(),
      sgst: (json['sgst'] as num).toDouble(),
      cess: (json['cess'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'taxableValue': taxableValue,
        'totalGST': totalGST,
        'totalITC': totalITC,
        'netGSTPayable': netGSTPayable,
        'igst': igst,
        'cgst': cgst,
        'sgst': sgst,
        'cess': cess,
      };
}

/// GST Action Item model
class GSTActionItem {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const GSTActionItem({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    this.onTap,
  });
}
