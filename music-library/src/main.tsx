import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

async function enableMocking() {
  // Always enable MSW in both dev and production previews so the live deployed demo is interactive
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  // Dynamically import App to ensure Module Federation shared scope is bootstrapped before App renders
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
