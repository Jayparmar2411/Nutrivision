import React, { useState } from 'react';
import { Utensils, Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavBarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
            const navHeight = 80; // Approximate height of the fixed navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;
        
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, 100); // Small delay to allow menu close animation to start/finish smoothly
  };

  const navLinks = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'dashboard', label: 'Your Dashboard' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass-panel border-b border-gray-300 dark:border-white/10 px-6 py-4 backdrop-blur-xl transition-colors duration-500 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer group relative z-50"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
            NutriVision <span className="text-brand-primary">AI</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
           <div className="flex items-center gap-6">
                {navLinks.map((link) => (
                    <button 
                        key={link.id}
                        onClick={() => scrollToSection(link.id)} 
                        className="text-sm font-medium text-slate-700 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors relative group"
                    >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full"></span>
                    </button>
                ))}
           </div>
           
           <div className="h-6 w-px bg-gray-300 dark:bg-white/10"></div>

           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-slate-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-transparent"
             aria-label="Toggle Theme"
           >
             {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>
        </div>

        {/* Mobile Toggle & Theme */}
        <div className="flex items-center gap-4 md:hidden relative z-50">
            <button 
             onClick={toggleTheme}
             className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-slate-700 dark:text-gray-400 border border-gray-200 dark:border-transparent"
            >
             {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>
           
           <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-900 dark:text-white hover:text-brand-primary transition-colors"
           >
               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
           </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#020617] border-b border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl z-40"
            >
                <div className="flex flex-col p-6 space-y-2">
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => scrollToSection(link.id)}
                            className="text-lg font-bold text-slate-900 dark:text-white py-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left px-2 rounded-lg"
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;