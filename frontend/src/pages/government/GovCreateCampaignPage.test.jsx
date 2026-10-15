import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// The gov page is a thin wrapper that renders the advertiser wizard in government mode.
// We assert the wrapper passes ownerType="government" to CreateCampaignPage.
const captured = { props: null };
vi.mock('../advertiser/CreateCampaignPage', () => ({
  CreateCampaignPage: (props) => { captured.props = props; return <div data-testid="wizard" />; },
}));

import { render, screen } from '@testing-library/react';
import { GovCreateCampaignPage } from './GovCreateCampaignPage';

describe('GovCreateCampaignPage', () => {
  it('renders the shared campaign wizard in government mode', () => {
    render(<GovCreateCampaignPage />);
    expect(screen.getByTestId('wizard')).toBeInTheDocument();
    expect(captured.props.ownerType).toBe('government');
  });
});
