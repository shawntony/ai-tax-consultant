/**
 * Jest Setup File
 * @version 1.0.0
 */

import '@testing-library/jest-dom';

// MSW setup (optional - only for integration tests)
// Uncomment when handlers are ready
// import { setupServer } from 'msw/node';
// import { handlers } from './mocks/handlers';
// export const server = setupServer(...handlers);
// beforeAll(() => {
//   server.listen({ onUnhandledRequest: 'warn' });
// });
// afterEach(() => {
//   server.resetHandlers();
// });
// afterAll(() => {
//   server.close();
// });

// Only setup browser mocks in jsdom environment
if (typeof window !== 'undefined') {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = localStorageMock;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
