# GST Management Module

This module implements the complete GST Management UI with proper GetX architecture, featuring 4 tabs for comprehensive GST information management.

## Structure

```
gst_management/
├── bindings/
│   └── gst_management_binding.dart        # GetX binding
├── controller/
│   └── gst_management_controller.dart     # Business logic & state management
├── model/
│   └── gst_model.dart                     # Data models
└── view/
    ├── gst_management_view.dart           # Main view with tab bar
    └── tabs/
        ├── gst_details_tab.dart           # Tab 1: GST Details & Overview
        ├── gstin_information_tab.dart     # Tab 2: GSTIN Information
        ├── gst_amounts_tab.dart           # Tab 3: GST Amounts & Breakup
        └── gst_actions_tab.dart           # Tab 4: GST Actions
```

## Features

### Tab 1: GST Details
- **GST Overview Section**:
  - Total Liability card with view details
  - Input Tax Credit card with view details
  - Net Payable card with view details
  - Filed Returns card with history view
  - Month selector dropdown
- **My GST Details Section**:
  - Business Name
  - GSTIN
  - State
  - Business Type
  - GST Registration Date
  - GST Status with color indicator
  - Returns Filing Frequency
  - Composition Scheme status
  - Primary Email
  - Primary Contact
  - Verified badge
  - Edit button

### Tab 2: GSTIN Information
- **GSTIN Summary Card** (Gradient):
  - GSTIN display with copy functionality
  - Registration Date
  - Active status badge
- **GSTIN Information Section**:
  - GSTIN
  - Legal Business Name
  - Trade Name
  - Principal Place of Business
  - State
  - GST Jurisdiction
  - GST Division
  - Composition Scheme
  - Effective From date
  - Last Updated timestamp
  - Edit button
- **Other Registrations**:
  - PAN card
  - TAN card
  - Expandable registration cards
- **Info Note**: Compliance reminder

### Tab 3: GST Amounts
- **Month Selector**: Change month to view different periods
- **Summary Cards**:
  - Taxable Value
  - Total GST
  - Total ITC
  - Net GST Payable
- **GST Breakup Section**:
  - IGST amount
  - CGST amount
  - SGST/UTGST amount
  - CESS amount (shows "-" if 0)
  - Total GST calculation
  - Input Tax Credit (ITC)
  - Net GST Payable
- **Info Note**: Explanation of Net GST Payable calculation

### Tab 4: GST Actions
- **Action Cards**:
  1. **GST Reports**
     - Icon: Document (Purple)
     - Download returns and reports
  2. **Upload Documents**
     - Icon: Upload (Green)
     - Upload invoices and GST documents
  3. **GST History**
     - Icon: History (Blue)
     - View filed returns and activities
- **Help Section**:
  - Need Help card
  - Contact Support button with gradient

## Usage

### Navigation

Navigate to GST Management screen:

```dart
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

// Navigate to GST Management
Get.toNamed(Routes.GST_MANAGEMENT);
```

### From Dashboard Button

```dart
ElevatedButton(
  onPressed: () => Get.toNamed(Routes.GST_MANAGEMENT),
  child: Text('GST Management'),
)
```

### From Card Widget

```dart
GestureDetector(
  onTap: () => Get.toNamed(Routes.GST_MANAGEMENT),
  child: GSTManagementCard(),
)
```

## Controller Methods

### Data Loading
- `loadGSTData()`: Loads all GST data
- `loadGSTAmounts()`: Loads amounts for selected month
- `changeMonth(DateTime month)`: Changes selected month

### Navigation Actions
- `navigateToReports()`: Navigate to GST Reports
- `navigateToUploadDocuments()`: Navigate to Upload Documents
- `navigateToHistory()`: Navigate to GST History
- `contactSupport()`: Open support dialog

### Edit Actions
- `editGSTDetails()`: Edit GST details
- `editGSTINInfo()`: Edit GSTIN information

### View Actions
- `viewDetails(String type)`: View specific detail type
- `viewHistory()`: View filed returns history

## Models

### GSTStatus
- `active`: Active status (green)
- `inactive`: Inactive status (gray)
- `suspended`: Suspended status (red)

### BusinessType
- `regular`: Regular business
- `composition`: Composition scheme

### FilingFrequency
- `monthly`: Monthly filing
- `quarterly`: Quarterly filing
- `annual`: Annual filing

### Main Models
1. **GSTOverview**: Overview statistics
2. **GSTDetails**: Company GST details
3. **GSTINInformation**: Detailed GSTIN info
4. **GSTAmounts**: GST amounts and breakup
5. **GSTActionItem**: Action card data

## Customization

### Change Dummy Data

In `gst_management_controller.dart`, modify these methods:

```dart
GSTOverview _getDummyOverview() {
  return const GSTOverview(
    totalLiability: 2445600,
    inputTaxCredit: 125300,
    netPayable: 120300,
    filedReturns: 6,
    totalReturns: 6,
  );
}

// Similarly for _getDummyDetails(), _getDummyGSTINInfo(), _getDummyAmounts()
```

### Add Real API Integration

Replace dummy methods with API calls:

```dart
Future<void> loadGSTData() async {
  isLoading.value = true;
  
  try {
    // API calls
    final overviewResponse = await gstApi.getOverview();
    final detailsResponse = await gstApi.getDetails();
    final gstinResponse = await gstApi.getGSTINInfo();
    final amountsResponse = await gstApi.getAmounts(selectedMonth.value);
    
    gstOverview.value = GSTOverview.fromJson(overviewResponse);
    gstDetails.value = GSTDetails.fromJson(detailsResponse);
    gstinInfo.value = GSTINInformation.fromJson(gstinResponse);
    gstAmounts.value = GSTAmounts.fromJson(amountsResponse);
  } catch (e) {
    Get.snackbar('Error', 'Failed to load GST data');
  } finally {
    isLoading.value = false;
  }
}
```

## Design Features

- **Gradient Cards**: Uses `AppTheme.primaryGradient` for featured cards
- **Tab Bar**: Custom styled tab bar with gradient indicator
- **Color Coding**: Status-based colors for easy identification
- **Icons**: Relevant icons for each section
- **Copy Functionality**: GSTIN copy to clipboard
- **Responsive Layout**: Proper spacing and alignment
- **Loading States**: Shows loading indicator while fetching data

## Dependencies

Required packages in `pubspec.yaml`:

```yaml
dependencies:
  get: ^4.7.3
  intl: ^0.19.0  # For date and number formatting
```

## Notes

- The controller currently uses dummy data for testing
- Replace `_getDummy*()` methods with actual API calls
- All navigation actions show snackbar messages (replace with actual navigation)
- Edit functionality is pending implementation
- Month selector is visual only (add date picker functionality)
- Copy GSTIN functionality is implemented
- Tab state is managed by TabController
