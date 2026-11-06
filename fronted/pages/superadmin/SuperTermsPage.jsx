import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const SuperTermsPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-SUPER-ADMIN"
      titleFallback={t('ag.superadmin.supertermspage.super_administrator_governance_terms', 'Super Administrator Governance Terms')}
      subtitleFallback={t('ag.superadmin.supertermspage.sovereign_platform_control_root_acce', 'Sovereign platform control, root access responsibilities, and multi-tenant security architecture')}
      searchPlaceholder={t('ag.superadmin.supertermspage.search_master_governance_terms_micro', 'Search master governance terms, microservice SLAs, or root isolation...')}
    />
  );
};

export default SuperTermsPage;
