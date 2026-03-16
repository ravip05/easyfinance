import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { ToastProvider, useToast } from '../context/ToastContext';

const TestComponent = () => {
  const { success, error } = useToast();
  return (
    <div>
      <button onClick={() => success('Good job!')}>Success</button>
      <button onClick={() => error('Bad job!')}>Error</button>
    </div>
  );
};

describe('ToastContext', () => {
  it('shows success toast on button click', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));
    expect(screen.getByText('Good job!')).toBeInTheDocument();
  });

  it('shows error toast on button click', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Error'));
    expect(screen.getByText('Bad job!')).toBeInTheDocument();
  });
});
