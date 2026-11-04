import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminTermsPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-TENANT-ADMIN"
      titleFallback={t('ag.admin.admintermspage.organization_admin_terms_slas', 'Organization Admin Terms & SLAs')}
      subtitleFallback={t('ag.admin.admintermspage.enterprise_tenant_governance_multi_d', 'Enterprise tenant governance, multi-depot fleet management, and platform resource allocation rules')}
      searchPlaceholder={t('ag.admin.admintermspage.search_tenant_terms_slas_or_fleet_qu', 'Search tenant terms, SLAs or fleet quota clauses...')}
    />
  );
};

export default AdminTermsPage;
