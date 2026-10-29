import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const SuperTermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-SUPER-ADMIN"
      titleFallback="Super Administrator Governance Terms"
      subtitleFallback="Sovereign platform control, root access responsibilities, and multi-tenant security architecture"
      searchPlaceholder="Search master governance terms, microservice SLAs, or root isolation..."
    />
  );
};

export default SuperTermsPage;
