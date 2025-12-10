
import React from 'react';

interface FooterProps {
  onOpenLegal: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="w-full py-10 px-6 border-t border-gray-200 dark:border-white/10 mt-auto bg-white/80 dark:bg-black/40 backdrop-blur-lg transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
            <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">NutriVision AI</h4>
            <p className="text-sm text-gray-500 mt-1">Advanced Nutrition Analytics</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-brand-primary transition-colors">Privacy Policy</button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-brand-primary transition-colors">Terms of Service</button>
            <button onClick={() => onOpenLegal('cookie')} className="hover:text-brand-primary transition-colors">Cookie Policy</button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-500">
            © 2026 NutriVision AI. All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
