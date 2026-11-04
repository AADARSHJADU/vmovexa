import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const FinancePrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-FINANCE-OFFICER"
      titleFallback={t('finance.privacy.title', 'Financial Data & Ledger Privacy Policy')}
      subtitleFallback={t('finance.privacy.subtitle', 'Banking credential security, PCI-DSS compliance, and statutory financial record retention')}
      searchPlaceholder={t('finance.privacy.search_ph', 'Search banking encryption, PCI-DSS data isolation, or audit retention...')}
    />
  );
};

export default FinancePrivacyPolicyPage;
