import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

// Simple component for testing the setup
const TestComponent = () => <div>Testing EasyFinanceCRM</div>;

describe('Vitest Setup Verification', () => {
  it('should render the test component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Testing EasyFinanceCRM')).toBeInTheDocument();
  });

  it('should have access to Capacitor mocks', async () => {
    const { Capacitor } = await import('@capacitor/core');
    expect(Capacitor.isNativePlatform()).toBe(false);
  });
});
