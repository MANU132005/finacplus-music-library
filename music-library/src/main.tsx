import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactModule from 'react';
import * as ReactDOMModule from 'react-dom';
import * as ReactQueryModule from '@tanstack/react-query';
import * as ReactRouterDomModule from 'react-router-dom';
import './index.css';

// Initialize Module Federation shared scope for standalone preview mode
// This prevents importShared('react') from returning undefined when running standalone without Host init()
const g = globalThis as any;
g.__federation_shared__ = g.__federation_shared__ || {};
g.__federation_shared__.default = g.__federation_shared__.default || {};

const sharedMods: Record<string, any> = {
  react: ReactModule,
  'react-dom': ReactDOMModule,
  '@tanstack/react-query': ReactQueryModule,
  'react-router-dom': ReactRouterDomModule,
};

Object.entries(sharedMods).forEach(([pkgName, pkgModule]) => {
  g.__federation_shared__.default[pkgName] = g.__federation_shared__.default[pkgName] || {
    '99.99.99': {
      get: () => Promise.resolve(() => pkgModule),
      loaded: true,
      scope: 'default',
    },
  };
});

async function enableMocking() {
  // Always enable MSW in both dev and production previews so the live deployed demo is interactive
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  // Dynamically import App so Module Federation shared scope is bootstrapped before App renders
  import('./App').then(({ default: App }) => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    }
  });
});
