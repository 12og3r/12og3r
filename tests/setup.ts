import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Node 25 ships an experimental `localStorage` global (gated by
// `--localstorage-file`) that resolves to a stub object missing the
// Storage prototype methods. That stub shadows jsdom's real
// localStorage when vitest sets up the jsdom environment, so we
// install an in-memory polyfill to restore expected behaviour.
if (typeof localStorage === 'undefined' || typeof localStorage.clear !== 'function') {
  const store = new Map<string, string>();
  const polyfill: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: polyfill,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: polyfill,
    });
  }
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
