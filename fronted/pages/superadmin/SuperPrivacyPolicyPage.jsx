import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const SuperPrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-SUPER-ADMIN"
      titleFallback={t('ag.superadmin.superprivacypolicypage.super_admin_infrastructure_root_priv', 'Super Admin Infrastructure & Root Privacy Policy')}
      subtitleFallback={t('ag.superadmin.superprivacypolicypage.root_security_enclaves_sovereign_enc', 'Root security enclaves, sovereign encryption key management, and global audit governance')}
      searchPlaceholder={t('ag.superadmin.superprivacypolicypage.search_root_encryption_vault_enclave', 'Search root encryption, vault enclaves, or cross-border policies...')}
    />
  );
};

export default SuperPrivacyPolicyPage;
