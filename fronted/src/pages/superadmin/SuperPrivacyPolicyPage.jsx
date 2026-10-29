import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const SuperPrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-SUPER-ADMIN"
      titleFallback="Super Admin Infrastructure & Root Privacy Policy"
      subtitleFallback="Root security enclaves, sovereign encryption key management, and global audit governance"
      searchPlaceholder="Search root encryption, vault enclaves, or cross-border policies..."
    />
  );
};

export default SuperPrivacyPolicyPage;
