
import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, FileText, Cookie, Lock, Server, AlertCircle } from 'lucide-react';

interface LegalModalProps {
  page: string | null;
  onClose: () => void;
}

const content: any = {
  privacy: {
    title: "Privacy Policy",
    icon: Shield,
    color: "text-emerald-500",
    sections: [
      {
        heading: "1. Data Collection & Storage",
        text: "NutriVision AI operates on a 'Local-First' privacy model. We do not store your personal food logs, photos, or health data on our servers. All your historical data is stored locally on your device using browser LocalStorage. If you clear your browser cache, this data will be lost."
      },
      {
        heading: "2. AI Analysis & Third Parties",
        text: "To provide nutritional analysis, your image data is transiently transmitted to Google's Gemini AI API. This data is used solely for the purpose of analysis and is not retained by us to train models or for marketing purposes."
      },
      {
        heading: "3. User Accounts",
        text: "Currently, NutriVision AI functions without a centralized user account system. No email or password is required to use the core features, ensuring your anonymity."
      },
      {
        heading: "4. Contact Information",
        text: "When you use the contact form, your name and email are transmitted via FormSubmit for the sole purpose of replying to your inquiry."
      }
    ]
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    color: "text-blue-500",
    sections: [
      {
        heading: "1. Not Medical Advice",
        text: "NutriVision AI is an informational tool powered by Artificial Intelligence. The nutritional data (calories, macros) provided are estimates. This application is NOT a substitute for professional medical advice, diagnosis, or treatment."
      },
      {
        heading: "2. Accuracy of AI",
        text: "While we strive for high accuracy using advanced Gemini 2.5 Flash models, AI can make errors. Always verify critical nutritional information with product labels or professional databases, especially if you have medical dietary restrictions."
      },
      {
        heading: "3. User Responsibility",
        text: "You are responsible for the images you upload. You agree not to upload illegal, offensive, or harmful content."
      },
      {
        heading: "4. Intellectual Property",
        text: "The interface, design, and code of NutriVision AI are owned by the developers. You may not copy, reverse engineer, or redistribute the application without permission."
      }
    ]
  },
  cookie: {
    title: "Cookie Policy",
    icon: Cookie,
    color: "text-orange-500",
    sections: [
      {
        heading: "1. Use of Local Storage",
        text: "NutriVision AI does not use traditional tracking cookies for advertising. Instead, we use 'Local Storage' to save your preferences (Dark/Light mode), your daily streak, and your food logs."
      },
      {
        heading: "2. Essential Functionality",
        text: "These storage mechanisms are strictly necessary for the app to function (e.g., remembering your calorie goal). We do not use third-party analytics cookies."
      },
      {
        heading: "3. Managing Your Data",
        text: "You can clear your app data at any time by clearing your browser's cache or cookies for this site. Note that this will reset your history and streaks."
      }
    ]
  }
};

const LegalModal: React.FC<LegalModalProps> = ({ page, onClose }) => {
  if (!page || !content[page]) return null;

  const data = content[page];
  const Icon = data.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#0f172a] w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-white dark:bg-white/10 shadow-sm border border-gray-200 dark:border-white/5 ${data.color}`}>
                    <Icon size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{data.title}</h2>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex gap-3 items-start">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Last Updated: January 2026. Please review these terms carefully before using the application.
                </p>
            </div>

            {data.sections.map((section: any, idx: number) => (
                <div key={idx}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{section.heading}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                        {section.text}
                    </p>
                </div>
            ))}

            <div className="pt-8 border-t border-gray-200 dark:border-white/10">
                <p className="text-xs text-gray-400 text-center">
                    © 2026 NutriVision AI. All rights reserved.
                </p>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-primary hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-primary/20"
            >
                I Understand
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LegalModal;
