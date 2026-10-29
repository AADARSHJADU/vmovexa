import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Assert the wrapper passes ownerType="government" to BillingPaymentsPage
const captured = { props: null };
vi.mock('../advertiser/BillingPaymentsPage', () => ({
  BillingPaymentsPage: (props) => {
    captured.props = props;
    return <div data-testid="billing-page" />;
  },
}));

import { GovBillingPaymentsPage } from './GovBillingPaymentsPage';

describe('GovBillingPaymentsPage', () => {
  it('renders the billing & invoices page in government mode', () => {
    render(<GovBillingPaymentsPage />);
    expect(screen.getByTestId('billing-page')).toBeInTheDocument();
    expect(captured.props.ownerType).toBe('government');
  });
});
