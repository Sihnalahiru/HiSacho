import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Safely detect if running in an iframe without throwing WebKit cross-origin SecurityError
function isRunningInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // Access denied means cross-origin iframe
  }
}

// Safely register PWA service worker only in standalone production non-iframe environments
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    const isIframe = isRunningInIframe();
    // Do not register SW inside preview iframe or dev mode
    if (!isIframe && import.meta.env.PROD) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({
          immediate: false,
          onOfflineReady() {
            console.log('Japanese SSW Agriculture App is ready to work offline.');
          },
        });
      }).catch(err => {
        console.warn('PWA service worker registration skipped:', err);
      });
    }
  } catch (err) {
    console.warn('PWA initialization error:', err);
  }
}

try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } else {
    console.error('Root element #root not found in DOM.');
  }
} catch (mountErr) {
  console.error('Fatal error during root mount:', mountErr);
}

