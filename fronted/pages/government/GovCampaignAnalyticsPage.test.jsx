import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const captured = { props: null };
vi.mock('../advertiser/CampaignAnalyticsPage', () => ({
  CampaignAnalyticsPage: (props) => {
    captured.props = props;
    return <div data-testid="campaign-analytics-page" />;
  },
}));

import { GovCampaignAnalyticsPage } from './GovCampaignAnalyticsPage';

describe('GovCampaignAnalyticsPage', () => {
  it('renders the CampaignAnalyticsPage in government mode', () => {
    render(<GovCampaignAnalyticsPage />);
    expect(screen.getByTestId('campaign-analytics-page')).toBeInTheDocument();
    expect(captured.props.ownerType).toBe('government');
  });
});

