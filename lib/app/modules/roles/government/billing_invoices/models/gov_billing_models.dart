// lib/app/modules/roles/government/billing_invoices/models/gov_billing_models.dart
import 'package:vmovexa/app/data/models/government_models.dart';

/// Consolidated Invoice item for Government Billing & Invoices
/// Matches BillingInvoiceItem in Admin panel GovBillingPaymentsPage
class GovBillingInvoiceItem {
  final String id;
  final dynamic numericId;
  final String date;
  final String? dueDate;
  final String campaign;
  final String campaignCode;
  final String clientBrand;
  final String? poReference;
  final String? campCode;
  final double amount;
  final double baseAmount;
  final double gstAmount;
  final String status; // 'Paid' | 'Pending'
  final bool isPaid;
  final String? paymentToken;
  final GovCampaignModel? matchedCamp;

  GovBillingInvoiceItem({
    required this.id,
    this.numericId,
    required this.date,
    this.dueDate,
    required this.campaign,
    required this.campaignCode,
    required this.clientBrand,
    this.poReference,
    this.campCode,
    required this.amount,
    this.baseAmount = 0.0,
    this.gstAmount = 0.0,
    required this.status,
    required this.isPaid,
    this.paymentToken,
    this.matchedCamp,
  });

  String get targetCampCode {
    if (campCode != null && campCode != '—' && campCode!.isNotEmpty) {
      return campCode!;
    }
    if (matchedCamp?.id != null && matchedCamp!.id!.isNotEmpty) {
      return matchedCamp!.id!;
    }
    if (poReference != null && poReference!.startsWith('CMP-')) {
      return poReference!;
    }
    if (campaignCode != '—' && campaignCode.isNotEmpty) {
      return campaignCode;
    }
    return id;
  }
}
