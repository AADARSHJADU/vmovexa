import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const AdvertiserHelpPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-ADVERTISER"
      defaultHistoryPath="/advertiser/help/history"
      showContactCta={false}
    />
  );
};

export default AdvertiserHelpPage;
