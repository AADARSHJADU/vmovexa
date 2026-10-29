import React from 'react';
import { Card } from '../../components/Card';
import { useTranslation } from '../../hooks/useTranslation';

export const AdvertiserDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('advertiser.dashboard.overview_title')}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card hover>
          <h3 className="text-lg font-semibold text-[var(--muted)]">{t('advertiser.dashboard.active_sessions')}</h3>
          <p className="text-4xl font-bold mt-2">1,234</p>
        </Card>
        <Card hover>
          <h3 className="text-lg font-semibold text-[var(--muted)]">{t('advertiser.dashboard.total_revenue')}</h3>
          <p className="text-4xl font-bold mt-2">₹45,678</p>
        </Card>
        <Card hover>
          <h3 className="text-lg font-semibold text-[var(--muted)]">{t('advertiser.dashboard.system_status')}</h3>
          <p className="text-4xl font-bold mt-2 text-green-500">{t('advertiser.dashboard.online')}</p>
        </Card>
      </div>
    </div>
  );
};

export default AdvertiserDashboard;
