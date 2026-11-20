import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const FinanceTermsPage = () => {
  const { t } = useTranslation();
  const sections = [
    {
      id: 'term-fin-1',
      title: t('finance.terms.section1_title', '1. Revenue Reconciliation & Settlement Cycles'),
      content: t('finance.terms.section1_content', 'Finance officers manage automated reconciliation between online payment gateway disbursements, offline tenant subscriptions, and ad revenue disbursements.'),
    },
    {
      id: 'term-fin-2',
      title: t('finance.terms.section2_title', '2. Invoicing Accuracy & Automated Tax Invoicing'),
      content: t('finance.terms.section2_content', 'All platform-generated invoices must include valid GSTIN, HSN/SAC codes, and statutory tax breakdowns in compliance with prevailing national tax laws.'),
    },
    {
      id: 'term-fin-3',
      title: t('finance.terms.section3_title', '3. Payment Gateway Audit & Settlement Verification'),
      content: t('finance.terms.section3_content', 'Finance personnel must verify payout settlement files from Razorpay, Stripe, or Bank Wire before executing tenant subscription renewals or advertiser wallet credits.'),
    },
    {
      id: 'term-fin-4',
      title: t('finance.terms.section4_title', '4. Refund Processing & Chargeback Discretion'),
      content: t('finance.terms.section4_content', 'Disputed ad playback or subscription downtime credit adjustments must follow documented internal audit guidelines before balance reversal.'),
    },
    {
      id: 'term-fin-5',
      title: t('finance.terms.section5_title', '5. Financial Ledger Integrity & Annual Audits'),
      content: t('finance.terms.section5_content', 'All balance adjustments, manual credit grants, and invoice cancellations are permanently logged and made available for external statutory chartered accountant audits.'),
    },
  ];
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-FINANCE-OFFICER"
      titleFallback={t('finance.terms.title', 'Finance Officer Terms & Reconciliation Rules')}
      subtitleFallback={t('finance.terms.subtitle', 'Revenue ledger standards, payment gateway settlements, and statutory GST reconciliation')}
      searchPlaceholder={t('finance.terms.search_ph', 'Search billing terms, payment rules, GSTIN, or settlement clauses...')}
      fallbackSections={sections}
    />
  );
};

export default FinanceTermsPage;
