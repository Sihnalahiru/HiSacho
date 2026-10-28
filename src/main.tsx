import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Safely register PWA service worker in production / non-restricted environments
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    const isIframe = window.self !== window.top;
    if (!isIframe) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({
          immediate: true,
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

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
