import { vi } from 'vitest'

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  setPersistence: vi.fn(),
  browserSessionPersistence: {},
  onAuthStateChanged: vi.fn(),
  signInWithPhoneNumber: vi.fn(),
  signOut: vi.fn(),
  RecaptchaVerifier: vi.fn()
}))

// Mock environment variables
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-key')
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
vi.stubEnv('VITE_API_BASE_URL', 'https://api.test.com')
vi.stubEnv('VITE_GRAPHQL_ENDPOINT', 'https://graphql.test.com')
vi.stubEnv('VITE_APP_ENVIRONMENT', 'test')

// Mock localStorage and sessionStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
})

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
})