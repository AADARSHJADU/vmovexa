# Payment Detail Module

This module implements the payment detail screen for the Finance role with proper GetX architecture.

## Structure

```
payment_detail/
├── bindings/
│   └── payment_detail_binding.dart      # GetX binding
├── controller/
│   └── payment_detail_controller.dart   # Business logic
├── model/
│   └── payment_detail_model.dart        # Data models
└── view/
    └── payment_detail_view.dart         # UI implementation
```

## Features

- **Three Status Types**: Pending, Paid, and Overdue with different UI variations
- **Dynamic Content**: UI changes based on payment status
- **Gradient Button**: Uses `AppTheme.primaryGradient` for the action button
- **Timeline View**: Shows payment/invoice timeline events
- **Customer Details**: Displays customer information with navigation
- **Payment Information**: Shows all payment-related details

## Usage

### Navigation

Navigate to the payment detail screen from anywhere:

```dart
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

// Navigate to payment detail
Get.toNamed(Routes.PAYMENT_DETAIL);
```

### With Arguments

Pass payment data as arguments:

```dart
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/modules/roles/finance/payment_detail/model/payment_detail_model.dart';

// Create payment detail object
final paymentDetail = PaymentDetailModel(
  invoiceId: 'INV-2026-000154',
  dueDate: DateTime(2026, 8, 21),
  amount: 50000,
  status: PaymentStatus.pending,
  customerName: 'Urban Adz Media',
  customerEmail: 'urbanadz@example.com',
  customerPhone: '+91 98765 43210',
  invoiceAmount: 50000,
  paidAmount: 0,
  balanceAmount: 50000,
  timeline: [
    TimelineEvent(
      title: 'Invoice Generated',
      date: '06 Aug 2026',
      isCompleted: true,
    ),
    TimelineEvent(
      title: 'Payment Due',
      date: '21 Aug 2026',
      isCompleted: false,
    ),
    TimelineEvent(
      title: 'Payment Received',
      date: '-',
      isCompleted: false,
    ),
  ],
);

// Navigate with arguments
Get.toNamed(Routes.PAYMENT_DETAIL, arguments: paymentDetail);
```

## Testing Different Status

To test different payment statuses, modify the controller:

```dart
// In payment_detail_controller.dart
PaymentDetailModel _getDummyPaymentDetail() {
  // Change status here to test different UI states
  const status = PaymentStatus.pending; // Change to: pending, paid, or overdue
  
  switch (status) {
    case PaymentStatus.pending:
      // Returns pending payment data
      
    case PaymentStatus.paid:
      // Returns paid payment data
      
    case PaymentStatus.overdue:
      // Returns overdue payment data
  }
}
```

## UI Variations by Status

### Pending Payment
- Title: "Payment Details"
- Amount Label: "Pending Payment"
- Orange/amber color indicators
- Button: "Remind Customer"

### Paid
- Title: "Payment Details"
- Amount Label: "Amount"
- Green color indicators
- Shows payment method, transaction ID, payment date
- Button: "Send Payment Receipt"

### Overdue
- Title: "Invoice Details"
- Amount Label: "Amount Due"
- Red color indicators
- Shows days overdue with warning badge
- Button: "Send Reminder"

## Key Components

### Model
- `PaymentDetailModel`: Main data model with all payment information
- `PaymentStatus`: Enum for payment status (pending, paid, overdue)
- `TimelineEvent`: Timeline event model

### Controller
- `loadPaymentDetail()`: Loads payment data from arguments or API
- `remindCustomer()`: Handles remind customer action
- `sendPaymentReceipt()`: Sends payment receipt
- `sendReminder()`: Sends overdue reminder
- `viewCustomerDetails()`: Navigates to customer details

### View
- Responsive UI with status-based variations
- Gradient card for amount display
- Customer details section
- Payment information section
- Timeline visualization
- Gradient action button

## Dependencies

Make sure to add these dependencies in `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  intl: ^0.18.0  # For date formatting
```

## Notes

- The controller currently uses dummy data. Replace `_getDummyPaymentDetail()` with actual API call.
- Customer details navigation is pending implementation.
- Download functionality in app bar is pending implementation.
