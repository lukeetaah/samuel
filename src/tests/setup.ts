/**
 * Vitest Setup File
 */
import '@testing-library/jest-dom';

// Polyfill sendBeacon in jsdom if missing
if (typeof navigator !== 'undefined' && !navigator.sendBeacon) {
  navigator.sendBeacon = () => true;
}

// Polyfill fetch in jsdom if missing
if (typeof window !== 'undefined' && !window.fetch) {
  window.fetch = async () => new Response();
}
