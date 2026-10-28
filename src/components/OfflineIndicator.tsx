import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall.ts';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-xs font-sinhala leading-normal">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span>ඔබ දැන් Offline සිටී — ප්‍රශ්නාවලිය සහ Native කටහඬ නොකඩවා ක්‍රියාත්මකයි.</span>
    </div>
  );
};
