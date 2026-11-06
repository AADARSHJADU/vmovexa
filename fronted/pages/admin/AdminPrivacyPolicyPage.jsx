import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminPrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-TENANT-ADMIN"
      titleFallback={t('ag.admin.adminprivacypolicypage.tenant_organization_privacy_policy', 'Tenant Organization Privacy Policy')}
      subtitleFallback={t('ag.admin.adminprivacypolicypage.enterprise_data_isolation_employee_k', 'Enterprise data isolation, employee KYC confidentiality, and multi-tenant security safeguards')}
      searchPlaceholder={t('ag.admin.adminprivacypolicypage.search_enterprise_privacy_data_vault', 'Search enterprise privacy, data vault or purge policies...')}
    />
  );
};

export default AdminPrivacyPolicyPage;
