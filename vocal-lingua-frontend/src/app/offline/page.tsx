import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-subtle dark:bg-surface-dark px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center mb-6">
        <WifiOff size={32} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        You're offline
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
        Your cached lessons are still available. Connect to the internet to sync your progress.
      </p>
      <a
        href="/lessons"
        className="bg-brand-blue text-white font-bold py-3 px-8 rounded-2xl hover:bg-blue-700 transition-colors"
      >
        View cached lessons
      </a>
    </div>
  );
}
