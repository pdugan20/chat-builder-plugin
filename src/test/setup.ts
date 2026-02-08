import '@testing-library/jest-dom';

// Extend global window interface
declare global {
  interface Window {
    __messageHandlers: Array<(event: MessageEvent) => void>;
  }
}

// Mock Figma API (figma is already declared in @figma/plugin-typings)
(globalThis as any).figma = {
  createFrame: jest.fn(),
  createComponent: jest.fn(),
  currentPage: {
    children: [],
  },
};

// Mock parent.postMessage
(globalThis as any).parent = {
  postMessage: jest.fn(),
};

// Track message event handlers
const originalAddEventListener = window.addEventListener;
window.addEventListener = jest.fn((event, handler) => {
  if (event === 'message') {
    (window as any).__messageHandlers = (window as any).__messageHandlers || [];
    (window as any).__messageHandlers.push(handler);
  }
  originalAddEventListener.call(window, event, handler);
});
