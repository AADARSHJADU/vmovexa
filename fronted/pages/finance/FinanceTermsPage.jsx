import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const FinanceTermsPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-FINANCE-OFFICER"
      titleFallback={t('finance.terms.title', 'Finance Officer Terms & Reconciliation Rules')}
      subtitleFallback={t('finance.terms.subtitle', 'Revenue ledger standards, payment gateway settlements, and statutory GST reconciliation')}
      searchPlaceholder={t('finance.terms.search_ph', 'Search billing terms, payment rules, GSTIN, or settlement clauses...')}
    />
  );
};

export default FinanceTermsPage;
