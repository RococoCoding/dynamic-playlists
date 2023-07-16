import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../../components/Login';

// TODO: can we test anything for the Spotify login?

test('renders login button', () => {
  render(<Login />);
  const loginButton = screen.getByTestId('login');
  expect(loginButton).toBeInTheDocument();
});