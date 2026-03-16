import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import Calculator from '../pages/Calculator';

describe('Calculator Page Logic', () => {
  it('switches between tabs correctly', async () => {
    render(<Calculator />);
    
    expect(screen.getByRole('tab', { name: /EMI Calculator/i })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('tab', { name: /Eligibility Check/i }));
    expect(await screen.findByText(/Loan Eligibility Calculator/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('tab', { name: /FOIR \/ DSR/i }));
    expect(await screen.findByText(/FOIR \/ DSR Calculator/i)).toBeInTheDocument();
  });

  describe('EMI Tab', () => {
    it('calculates EMI correctly for default values', () => {
      render(<Calculator />);
      // Default: 25L, 8.5%, 20yr -> EMI is 21,696
      expect(screen.getAllByText(/21,696/i).length).toBeGreaterThan(0);
    });

    it('updates calculations when sliders change', async () => {
      const { container } = render(<Calculator />);
      const principalSlider = container.querySelector('#la');
      fireEvent.change(principalSlider, { target: { value: '5000000' } });
      
      // 50L, 8.5%, 20yr -> EMI should be 43,391
      const calcResult = container.querySelector('.calc-result');
      await waitFor(() => {
        expect(within(calcResult).getByText(/43,391/i)).toBeInTheDocument();
      });
    });
  });

  describe('Eligibility Tab', () => {
    it('calculates eligibility based on age boundary', async () => {
      render(<Calculator />);
      fireEvent.click(screen.getByRole('tab', { name: /Eligibility Check/i }));
      
      const incomeInput = screen.getByPlaceholderText(/75000/);
      const ageInput = screen.getByPlaceholderText(/35/);
      const cibilInput = screen.getByPlaceholderText(/720/);

      fireEvent.change(incomeInput, { target: { value: '100000' } });
      fireEvent.change(cibilInput, { target: { value: '750' } });

      // Test: Age 65 (Too old)
      fireEvent.change(ageInput, { target: { value: '65' } });
      expect(await screen.findByText(/NOT CURRENTLY ELIGIBLE/i)).toBeInTheDocument();
      
      // Test: Age 30 (Eligible)
      fireEvent.change(ageInput, { target: { value: '30' } });
      expect(await screen.findByText(/ELIGIBLE FOR LOAN/i)).toBeInTheDocument();
    });
  });

  describe('FOIR Tab', () => {
    it('calculates risk category correctly', async () => {
      const { container } = render(<Calculator />);
      fireEvent.click(screen.getByRole('tab', { name: /FOIR \/ DSR/i }));
      
      const incomeInput = screen.getByPlaceholderText(/80000/);
      const proposedInput = screen.getByPlaceholderText(/20000/);
      
      fireEvent.change(incomeInput, { target: { value: '100000' } });
      fireEvent.change(proposedInput, { target: { value: '30000' } });

      expect(await screen.findByText(/30\.0%/i)).toBeInTheDocument();
      
      // Check for 'Excellent' (handles icon + text)
      const foirResultContainer = container.querySelector('#foir-result');
      expect(within(foirResultContainer).getAllByText(/Excellent/i).length).toBeGreaterThan(0);

      fireEvent.change(proposedInput, { target: { value: '55000' } });
      expect(await screen.findByText(/55\.0%/i)).toBeInTheDocument();
      expect(within(foirResultContainer).getAllByText(/High Risk/i).length).toBeGreaterThan(0);
    });
  });
});
