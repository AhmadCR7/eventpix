// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null;
    if (pass) {
      return {
        message: () => `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  redirect: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ 
    data: null, 
    status: 'unauthenticated',
  })),
}));

// Mocking localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
});

// Mocking document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Common global mocks
global.fetch = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn();
global.console.log = jest.fn(); 