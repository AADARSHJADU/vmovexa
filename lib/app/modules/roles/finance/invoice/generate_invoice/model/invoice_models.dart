class InvoiceLineItem {
  final String id;
  final String description;
  final String hsnSac;
  final double quantity;
  final double rate;

  InvoiceLineItem({
    required this.id,
    required this.description,
    required this.hsnSac,
    required this.quantity,
    required this.rate,
  });

  double get amount => quantity * rate;
}

class InvoiceCustomer {
  final String id;
  final String name;
  final String gstin;
  final String billingAddress;
  final String placeOfSupply;

  InvoiceCustomer({
    required this.id,
    required this.name,
    required this.gstin,
    required this.billingAddress,
    required this.placeOfSupply,
  });
}
