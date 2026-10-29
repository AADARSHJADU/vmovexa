/**
 * breakdownKeys.js — Standard Taxonomy for Price Breakdowns & Taxes
 * Used across SuperAdmin Plans, Advertiser Campaigns, Government Campaigns, and Finance GST.
 */

export const BREAKDOWN_CATEGORIES = {
  FEE: 'fee',
  DISCOUNT: 'discount',
  TAX: 'tax',
};

export const STANDARD_BREAKDOWN_KEYS = [
  // Commercial Charges / Services (Taxable Value)
  {
    key: 'FEE_BASE_PLAN',
    label: 'Base Subscription / License Fee',
    category: BREAKDOWN_CATEGORIES.FEE,
    defaultType: 'charge',
    description: 'Core platform subscription access fee',
  },
  {
    key: 'FEE_AIRTIME_BROADCAST',
    label: 'Transit Screen Airtime Broadcast',
    category: BREAKDOWN_CATEGORIES.FEE,
    defaultType: 'charge',
    description: 'Digital transit screen slot broadcast charges',
  },
  {
    key: 'FEE_HARDWARE_RENTAL',
    label: 'GPS & Screen Hardware Rental',
    category: BREAKDOWN_CATEGORIES.FEE,
    defaultType: 'charge',
    description: 'Hardware equipment rental and maintenance',
  },
  {
    key: 'FEE_TELEMETRY_DATA',
    label: '4G IoT Telemetry & SIM Connectivity',
    category: BREAKDOWN_CATEGORIES.FEE,
    defaultType: 'charge',
    description: 'Data transmission & cellular network connectivity',
  },
  {
    key: 'FEE_ONBOARDING_SETUP',
    label: 'Onboarding & Depot Setup',
    category: BREAKDOWN_CATEGORIES.FEE,
    defaultType: 'charge',
    description: 'Initial hardware configuration and staff onboarding',
  },
  {
    key: 'FEE_CREATIVE_DESIGN',
    label: 'Creative Review & Transcoding',
    category: BREAKDOWN_CATEGORIES.FEE,
    defaultType: 'charge',
    description: 'Ad creative approval, encoding and verification',
  },

  // Discounts (Deductions from Taxable Base)
  {
    key: 'DISCOUNT_VOLUME',
    label: 'Volume / Fleet Discount',
    category: BREAKDOWN_CATEGORIES.DISCOUNT,
    defaultType: 'discount',
    description: 'Discount applied for multi-fleet or bulk booking',
  },
  {
    key: 'DISCOUNT_PROMO',
    label: 'Promotional Coupon Discount',
    category: BREAKDOWN_CATEGORIES.DISCOUNT,
    defaultType: 'discount',
    description: 'Special promo code or loyalty concession',
  },

  // Statutory Tax Heads (Govt GST Compliance)
  {
    key: 'GST_CGST',
    label: 'Central GST (CGST)',
    category: BREAKDOWN_CATEGORIES.TAX,
    defaultType: 'tax',
    defaultRate: 9,
    description: 'Central Government GST portion (Intra-state supply)',
  },
  {
    key: 'GST_SGST',
    label: 'State GST (SGST)',
    category: BREAKDOWN_CATEGORIES.TAX,
    defaultType: 'tax',
    defaultRate: 9,
    description: 'State / UT Government GST portion (Intra-state supply)',
  },
  {
    key: 'GST_IGST',
    label: 'Integrated GST (IGST)',
    category: BREAKDOWN_CATEGORIES.TAX,
    defaultType: 'tax',
    defaultRate: 18,
    description: 'Inter-state Integrated GST supply',
  },
  {
    key: 'GST_CESS',
    label: 'GST Compensation Cess',
    category: BREAKDOWN_CATEGORIES.TAX,
    defaultType: 'tax',
    defaultRate: 0,
    description: 'Additional statutory cess on designated goods/services',
  },

  // Custom fallback
  {
    key: 'CUSTOM',
    label: 'Custom Item / Charge',
    category: BREAKDOWN_CATEGORIES.FEE,
    defaultType: 'charge',
    description: 'User-specified commercial line item',
  },
];

/** Lookup map by key */
export const STANDARD_BREAKDOWN_KEY_MAP = STANDARD_BREAKDOWN_KEYS.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

/** Helper to identify if a key represents a statutory tax */
export const isTaxKey = (key = '') => {
  const normalized = String(key).trim().toUpperCase();
  return (
    normalized.startsWith('GST_') ||
    normalized.startsWith('TAX_') ||
    normalized === 'CGST' ||
    normalized === 'SGST' ||
    normalized === 'IGST' ||
    normalized === 'CESS'
  );
};
