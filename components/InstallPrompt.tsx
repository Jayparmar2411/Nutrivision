import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed/standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Android/Desktop Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS Detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone) {
       // Show iOS prompt after a small delay
       setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {/* Native Prompt (Android/Desktop) */}
      {deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-6 md:right-auto md:w-auto z-[100] p-4 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-sm mx-auto flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
            <Download size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">Install NutriVision</h4>
            <p className="text-xs text-gray-500 truncate">Add to home screen for quick access</p>
          </div>
          <button 
            onClick={handleInstallClick}
            className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shrink-0"
          >
            Install
          </button>
          <button onClick={() => setDeferredPrompt(null)} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* iOS Prompt */}
      {showIOSPrompt && (
         <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 mx-auto max-w-md z-[100] p-5 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10"
         >
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                     <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">N</div>
                     <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">Install NutriVision</h4>
                         <p className="text-xs text-gray-500">For the best experience</p>
                     </div>
                </div>
                <button onClick={() => setShowIOSPrompt(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300 border-t border-gray-200 dark:border-white/10 pt-3">
                <span>1. Tap</span>
                <Share size={16} className="text-blue-500" />
                <span>2. Select "Add to Home Screen"</span>
            </div>
         </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;