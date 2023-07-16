import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('App loads', () => {
  let originFetch: any;
  beforeEach(() => {
    originFetch = (global as any).fetch;
  });
  afterEach(() => {
    (global as any).fetch = originFetch;
  });
  it('login page if no token', async () => {
    const fakeResponse = { access_token: '' };
    const mRes = { json: jest.fn().mockResolvedValueOnce(fakeResponse) };
    const mockedFetch = jest.fn().mockResolvedValueOnce(mRes as any);
    (global as any).fetch = mockedFetch;
    render(<App />);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(1))
    })

    const loginComponent = screen.getByTestId('login');
    await waitFor(() => expect(loginComponent).toBeInTheDocument());
  });
  it('web playback component if token exists', async () => {
    const fakeResponse = { access_token: 'test_token' };
    const mRes = { json: jest.fn().mockResolvedValueOnce(fakeResponse) };
    const mockedFetch = jest.fn().mockResolvedValueOnce(mRes as any);
    (global as any).fetch = mockedFetch;
    render(<App />);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(1))
    })

    const playbackComponent = screen.getByTestId('web-playback');
    await waitFor(() => expect(playbackComponent).toBeInTheDocument());
  });
});