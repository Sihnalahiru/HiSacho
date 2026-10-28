import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('Japanese SSW Agriculture App is ready to work offline.');
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
