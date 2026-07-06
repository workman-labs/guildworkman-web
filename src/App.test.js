import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders the home page hero content', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  const matches = screen.getAllByText(/skilled workers/i);
  expect(matches.length).toBeGreaterThan(0);
});
