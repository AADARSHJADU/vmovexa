import React from 'react';
import { Card } from '../../components/Card';

export const AdvertiserDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Campaigns Overview</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card hover>
          <h3 className="text-lg font-semibold text-[var(--muted)]">Active Sessions</h3>
          <p className="text-4xl font-bold mt-2">1,234</p>
        </Card>
        <Card hover>
          <h3 className="text-lg font-semibold text-[var(--muted)]">Total Revenue</h3>
          <p className="text-4xl font-bold mt-2">$45,678</p>
        </Card>
        <Card hover>
          <h3 className="text-lg font-semibold text-[var(--muted)]">System Status</h3>
          <p className="text-4xl font-bold mt-2 text-green-500">Online</p>
        </Card>
      </div>
    </div>
  );
};
