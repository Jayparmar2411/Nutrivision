
import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import InstallPrompt from './components/InstallPrompt';
import LegalModal from './components/LegalModal';
import { FoodAnalysis, HistoryItem, UserProfile, Macros } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, CheckCircle, X as XIcon, RefreshCw, ChefHat, Sparkles } from 'lucide-react';
import { updateNutritionFromIngredients } from './services/geminiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{data: FoodAnalysis, img: string} | null>(null);
  
  // Local state for editing in modal
  const [editedIngredients, setEditedIngredients] = useState<string[]>([]);
  const [editedCalories, setEditedCalories] = useState(0);
  const [editedMacros, setEditedMacros] = useState<Macros>({ protein: 0, carbs: 0, fat: 0 });
  const [newIngredientInput, setNewIngredientInput] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Legal Modal State
  const [activeLegalPage, setActiveLegalPage] = useState<string | null>(null);

  // Theme Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Default User Profile (No Login required)
  const [userProfile] = useState<UserProfile>({
    name: "Guest User",
    dailyCalorieGoal: 2200,
    dailyProteinGoal: 150
  });

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('nutrivision_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('nutrivision_history', JSON.stringify(history));
  }, [history]);

  const handleAnalysisComplete = (data: FoodAnalysis, imageUrl: string) => {
    setCurrentAnalysis({ data, img: imageUrl });
    // Initialize editable state
    setEditedIngredients(data.ingredients || []);
    setEditedCalories(data.calories);
    setEditedMacros(data.macros);
    setShowResultModal(true);
  };

  const handleManualAdd = (foodName: string, calories: number, macros: Macros) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      foodName,
      calories,
      macros,
      ingredients: [],
      healthTip: "Manually logged entry",
      confidenceScore: 100,
      imageUrl: undefined 
    };
    setHistory(prev => [...prev, newItem]);
    
    // Scroll to dashboard
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
      dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const saveToLog = () => {
    if (currentAnalysis) {
      const newItem: HistoryItem = {
        ...currentAnalysis.data,
        calories: editedCalories,
        macros: editedMacros,
        ingredients: editedIngredients,
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: currentAnalysis.img
      };
      setHistory(prev => [...prev, newItem]);
      setShowResultModal(false);
      setCurrentAnalysis(null);
      
      // Scroll to dashboard smoothly
      const dashboardSection = document.getElementById('dashboard');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const deleteLogItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const updateLogItem = (id: string, newCalories: number) => {
    setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, calories: newCalories } : item
    ));
  };

  // Ingredient Logic
  const addIngredient = () => {
    if (newIngredientInput.trim()) {
        setEditedIngredients([...editedIngredients, newIngredientInput.trim()]);
        setNewIngredientInput("");
    }
  };

  const removeIngredient = (index: number) => {
      setEditedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleRecalculate = async () => {
      if (!currentAnalysis) return;
      setIsRecalculating(true);
      try {
          // Pass the image URL along with ingredients for consistent analysis
          const updated = await updateNutritionFromIngredients(
              currentAnalysis.data.foodName, 
              editedIngredients,
              currentAnalysis.img 
          );
          
          if (updated.calories) setEditedCalories(updated.calories);
          if (updated.macros) setEditedMacros(updated.macros);
          // Optional: Update health tip if new one provided
          if (updated.healthTip && currentAnalysis) {
              setCurrentAnalysis({
                  ...currentAnalysis,
                  data: { ...currentAnalysis.data, healthTip: updated.healthTip }
              });
          }
      } catch (err) {
          console.error("Failed to recalculate");
      } finally {
          setIsRecalculating(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white selection:bg-brand-primary selection:text-white overflow-x-hidden">
      <NavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <InstallPrompt />

      <main className="flex-grow relative">
        <LandingPage 
            history={history}
            userProfile={userProfile}
            onAnalyzeComplete={handleAnalysisComplete}
            onDeleteLogItem={deleteLogItem}
            onUpdateLogItem={updateLogItem}
            onManualAdd={handleManualAdd}
            isDarkMode={isDarkMode}
        />
      </main>

      {/* Result Modal Overlay */}
      <AnimatePresence>
      {showResultModal && currentAnalysis && (
        // Changed layout to support scrolling on mobile for tall content
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-xl">
            <div className="min-h-full flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative ring-1 ring-white/10 my-8"
                >
                    {/* Image Header with parallax-like feel */}
                    <div className="h-64 relative group overflow-hidden">
                        <img src={currentAnalysis.img} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt="Analyzed Food" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f172a] via-transparent to-black/30" />
                        <button 
                            onClick={() => setShowResultModal(false)}
                            className="absolute top-4 left-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors border border-white/10 hover:scale-105 z-20"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        {/* Confidence Score Badge */}
                        <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-lg z-20">
                            {currentAnalysis.data.confidenceScore}% Confidence
                        </div>
                    </div>

                    {/* Content - Redesigned Header for Full Name Visibility */}
                    <div className="p-6 md:p-8 relative">
                        {/* Unified Title & Calorie Card */}
                        <div className="relative -mt-16 mb-6 px-1 z-10">
                            <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl p-5 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl flex justify-between items-start gap-4">
                                <div>
                                     <span className="text-brand-primary text-[10px] font-bold uppercase tracking-wider block mb-1">Detected</span>
                                     <h2 className="text-2xl font-display font-bold leading-tight text-slate-900 dark:text-white break-words">
                                        {currentAnalysis.data.foodName}
                                     </h2>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-4xl font-display font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
                                        {isRecalculating ? <span className="animate-pulse opacity-50">...</span> : editedCalories}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">kcal</div>
                                </div>
                            </div>
                        </div>

                        {/* Macros Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-center border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                                {isRecalculating && <div className="absolute inset-0 bg-white/10 animate-pulse z-10"/>}
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold group-hover:text-blue-400 transition-colors">Protein</div>
                                <div className="text-xl font-bold text-blue-500 dark:text-blue-400">{editedMacros.protein}g</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-center border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                                {isRecalculating && <div className="absolute inset-0 bg-white/10 animate-pulse z-10"/>}
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold group-hover:text-orange-400 transition-colors">Carbs</div>
                                <div className="text-xl font-bold text-orange-500 dark:text-orange-400">{editedMacros.carbs}g</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-center border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                                {isRecalculating && <div className="absolute inset-0 bg-white/10 animate-pulse z-10"/>}
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold group-hover:text-yellow-400 transition-colors">Fats</div>
                                <div className="text-xl font-bold text-yellow-500 dark:text-yellow-400">{editedMacros.fat}g</div>
                            </div>
                        </div>

                        {/* Ingredient Editor */}
                        <div className="mb-6 bg-gray-50 dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-200 dark:border-white/5 shadow-inner">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ChefHat size={16} className="text-brand-primary" /> Ingredients
                                </h4>
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRecalculate}
                                    disabled={isRecalculating}
                                    className="text-[10px] bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg border border-brand-primary/20 flex items-center gap-1 hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw size={12} className={isRecalculating ? "animate-spin" : ""} />
                                    {isRecalculating ? "Calculating..." : "Recalculate"}
                                </motion.button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {editedIngredients.map((ing, idx) => (
                                    <motion.span 
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        key={idx} 
                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-gray-300 flex items-center gap-2 group hover:border-red-500/30 transition-colors"
                                    >
                                        {ing}
                                        <button onClick={() => removeIngredient(idx)} className="text-gray-400 group-hover:text-red-500 transition-colors"><XIcon size={12} /></button>
                                    </motion.span>
                                ))}
                                {editedIngredients.length === 0 && <span className="text-xs text-gray-400 italic">No ingredients detected. Add some below.</span>}
                            </div>

                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newIngredientInput}
                                    onChange={(e) => setNewIngredientInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                                    placeholder="Add item (e.g. 'Extra Cheese')"
                                    className="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary transition-colors text-slate-900 dark:text-white"
                                />
                                <button 
                                    onClick={addIngredient}
                                    className="p-2.5 bg-gray-200 dark:bg-white/10 rounded-xl hover:bg-gray-300 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Health Tip */}
                        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 p-5 rounded-2xl mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
                            <p className="text-sm text-brand-primary/90 flex gap-3 leading-relaxed font-medium relative z-10">
                                <Sparkles size={18} className="mt-0.5 shrink-0 animate-pulse" />
                                {currentAnalysis.data.healthTip}
                            </p>
                        </div>

                        <button 
                            onClick={saveToLog}
                            className="w-full py-4 bg-brand-primary hover:bg-emerald-500 text-white dark:text-brand-dark font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] group"
                        >
                            <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> Save to Log
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
      )}
      </AnimatePresence>
      
      {/* Legal Pages Modal */}
      <AnimatePresence>
          {activeLegalPage && (
              <LegalModal page={activeLegalPage} onClose={() => setActiveLegalPage(null)} />
          )}
      </AnimatePresence>

      <Footer onOpenLegal={setActiveLegalPage} />
    </div>
  );
};

export default App;
