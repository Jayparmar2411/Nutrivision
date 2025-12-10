import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { HistoryItem, UserProfile, Macros } from '../types';
import { TrendingUp, Flame, Utensils, Calculator, Activity, CalendarClock, Trash2, Clock, Pencil, Check, X, Droplets, Plus, Minus, Beef, Wheat, Cookie, Sparkles, HeartPulse, BrainCircuit, Leaf, Dumbbell, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNutritionAdvice } from '../services/geminiService';

interface DashboardProps {
  history: HistoryItem[];
  userProfile: UserProfile;
  onDeleteLogItem: (id: string) => void;
  onUpdateLogItem: (id: string, newCalories: number) => void;
  onManualAdd: (foodName: string, calories: number, macros: Macros) => void;
  isDarkMode: boolean;
}

// --- Spotlight Card Component ---
const Card = ({ children, className, color = "emerald", delay = 0 }: { children?: React.ReactNode, className?: string, color?: string, delay?: number }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    const colorMap: any = {
        emerald: "16, 185, 129",
        blue: "59, 130, 246",
        orange: "249, 115, 22",
        purple: "168, 85, 247",
        yellow: "234, 179, 8",
        red: "239, 68, 68",
        green: "34, 197, 94",
    };
    
    const rgb = colorMap[color] || "16, 185, 129";

    return (
        <motion.div 
            ref={divRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, scale: 1.01 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`glass-panel rounded-3xl border border-gray-200 dark:border-white/5 transition-all duration-300 shadow-xl relative overflow-hidden group flex flex-col ${className}`}
        >
            {/* Spotlight Gradient */}
            <div 
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(${rgb}, 0.15), transparent 40%)`
                }}
            />
            {/* Border Spotlight */}
            <div 
                 className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
                 style={{
                     opacity,
                     background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(${rgb}, 0.4), transparent 40%)`,
                     maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
                     maskComposite: 'exclude',
                     WebkitMaskComposite: 'xor',
                     padding: '1px'
                 }}
            />
            
            <div className="relative z-10 w-full flex-grow flex flex-col">{children}</div>
        </motion.div>
    );
};

// --- Water Tracker Component ---
const WaterTracker = ({ glasses, updateGlasses, goal, setGoal }: any) => {
    const progress = Math.min((glasses / goal) * 100, 100);
    const [isEditing, setIsEditing] = useState(false);
    const [editVal, setEditVal] = useState(goal.toString());

    const saveGoal = () => {
        const val = parseInt(editVal);
        if (val > 0) setGoal(val);
        setIsEditing(false);
    }

    return (
        <Card className="p-8 h-full min-h-[260px]" color="blue" delay={0.1}>
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-all duration-500" />
            
            <div className="flex justify-between items-start relative z-10">
                <div className="flex-1">
                    <p className="text-blue-500/80 dark:text-blue-400/80 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Droplets size={14} /> Hydration
                    </p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter">
                            {glasses}
                        </h3>
                        <div className="text-xl text-gray-400 dark:text-gray-500 font-medium flex items-center gap-2">
                            / 
                            {isEditing ? (
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="number" 
                                        value={editVal}
                                        onChange={(e) => setEditVal(e.target.value)}
                                        className="w-16 bg-white dark:bg-white/10 border border-blue-500 rounded px-2 py-0.5 text-base text-slate-900 dark:text-white outline-none"
                                        autoFocus
                                    />
                                    <button onClick={saveGoal} className="p-1 text-green-500 hover:text-green-400"><Check size={18}/></button>
                                </div>
                            ) : (
                                <span className="group/edit flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                                    {goal}
                                    <Pencil size={14} className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-gray-500" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10"
                >
                    <Droplets size={28} fill="currentColor" fillOpacity={0.5} />
                </motion.div>
            </div>

            <div className="relative z-10 mt-auto space-y-6 pt-4">
                 <div className="w-full bg-gray-100 dark:bg-[#020617] h-4 rounded-full overflow-hidden border border-gray-200 dark:border-white/5 relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] relative overflow-hidden" 
                    >
                         <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>
                
                <div className="flex gap-4">
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateGlasses(-1)}
                        className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-colors flex items-center justify-center border border-gray-200 dark:border-white/5"
                    >
                        <Minus size={24} />
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateGlasses(1)}
                        className="flex-1 h-14 rounded-xl bg-blue-500 hover:bg-blue-400 text-white transition-colors flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-blue-500/20 border border-blue-400"
                    >
                        <Plus size={24} /> Add Glass
                    </motion.button>
                </div>
            </div>
        </Card>
    );
};

// --- Macro Progress Card ---
const MacroCard = ({ label, current, goal, color, icon: Icon, unit = 'g', delay }: any) => {
    const progress = Math.min((current / goal) * 100, 100);
    
    const colorMap: any = {
        blue: { text: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500/20', shadow: 'shadow-blue-500/20', gradient: 'from-blue-600 to-blue-400' },
        orange: { text: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/20', shadow: 'shadow-orange-500/20', gradient: 'from-orange-600 to-orange-400' },
        yellow: { text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/20', shadow: 'shadow-yellow-500/20', gradient: 'from-yellow-500 to-yellow-400' },
    };

    const theme = colorMap[color];

    return (
        <Card color={color} delay={delay} className="p-6 h-full min-h-[180px]">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <motion.div 
                    key={current}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.4 }}
                    className={`p-3 rounded-xl ${theme.bg}/10 ${theme.text} ${theme.border} border shadow-lg ${theme.shadow}`}
                >
                    <Icon size={24} />
                </motion.div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">{current}<span className="text-sm text-gray-500 ml-1">{unit}</span></div>
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Goal: {goal}{unit}</div>
                </div>
            </div>
            
            <div className="relative z-10 mt-auto">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{label}</span>
                    <span className={`${theme.text} font-bold`}>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#020617] h-3 rounded-full overflow-hidden border border-gray-200 dark:border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                            width: `${progress}%`,
                            filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                        }}
                        transition={{ 
                            width: { duration: 1, ease: "easeOut" },
                            filter: { duration: 0.6, ease: "easeInOut" }
                        }}
                        className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} shadow-[0_0_10px_rgba(0,0,0,0.3)] relative overflow-hidden`} 
                    >
                         <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>
            </div>
        </Card>
    );
};


// --- BMI Component with Improvement Plan ---
const BMICalculator = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [showPlan, setShowPlan] = useState(false);

    const calculateBMI = () => {
        const h = parseFloat(height) / 100; // cm to m
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            const val = w / (h * h);
            setBmi(parseFloat(val.toFixed(1)));
            setShowPlan(false);
        }
    };

    const getCategory = (val: number) => {
        if (val < 18.5) return { text: "Underweight", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", plan: "Focus on surplus calories & strength." };
        if (val < 25) return { text: "Healthy Weight", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", plan: "Maintain with balanced diet." };
        if (val < 30) return { text: "Overweight", color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", plan: "Calorie deficit & cardio." };
        return { text: "Obese", color: "text-red-500 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", plan: "High protein, strict deficit." };
    };

    const getPlanDetails = (val: number) => {
        if (val < 18.5) return {
            exercises: "Squats, Deadlifts, Bench Press",
            freq: "3-4x / week",
            protein: "1.5g - 2g per kg bodyweight",
            focus: "Build Muscle Mass"
        };
        if (val < 25) return {
            exercises: "Running, Swimming, Yoga",
            freq: "3x / week",
            protein: "1.2g per kg bodyweight",
            focus: "General Fitness"
        };
        if (val < 30) return {
            exercises: "HIIT, Brisk Walking, Cycling",
            freq: "4-5x / week",
            protein: "1.8g per kg bodyweight",
            focus: "Fat Loss"
        };
        return {
            exercises: "Low Impact Cardio, Strength",
            freq: "Daily light activity",
            protein: "2.0g per kg bodyweight",
            focus: "Metabolic Health"
        };
    };

    return (
        <Card className="p-6 h-auto min-h-[400px] flex flex-col" color="emerald" delay={0.3}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white relative z-10">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500"><Calculator size={18} /></div>
                BMI Calculator
            </h3>
            
            {!showPlan ? (
                <div className="space-y-4 flex-grow relative z-10 flex flex-col">
                    <div className="flex gap-4">
                        <div className="flex-1 group">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2 group-focus-within:text-brand-primary transition-colors">Height (cm)</label>
                            <input 
                                type="number" 
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#020617] rounded-xl p-3 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 focus:border-brand-primary outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] placeholder:text-gray-400 text-sm"
                                placeholder="175"
                            />
                        </div>
                        <div className="flex-1 group">
                             <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2 group-focus-within:text-brand-primary transition-colors">Weight (kg)</label>
                            <input 
                                type="number" 
                                 value={weight}
                                 onChange={(e) => setWeight(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#020617] rounded-xl p-3 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 focus:border-brand-primary outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] placeholder:text-gray-400 text-sm"
                                placeholder="70"
                            />
                        </div>
                    </div>
                    
                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={calculateBMI}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-2 border border-emerald-400/20 text-sm md:text-base shrink-0"
                    >
                        Calculate BMI
                    </motion.button>
                    
                    <AnimatePresence>
                    {bmi && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, scale: 0.9 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden flex-grow flex flex-col"
                        >
                            <div className={`p-5 rounded-2xl text-center border mt-4 ${getCategory(bmi).bg} ${getCategory(bmi).border} relative overflow-hidden flex-grow flex flex-col justify-center`}>
                                <div className="relative z-10">
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Your BMI</div>
                                    <div className="text-4xl font-display font-bold my-1 text-slate-900 dark:text-white tracking-tighter">{bmi}</div>
                                    <div className={`text-sm font-bold ${getCategory(bmi).color}`}>
                                        {getCategory(bmi).text}
                                    </div>
                                    <button 
                                        onClick={() => setShowPlan(true)}
                                        className="mt-4 text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-slate-900 dark:text-white transition-colors flex items-center gap-1 mx-auto"
                                    >
                                        Improve Health <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-grow relative z-10 flex flex-col h-full"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900 dark:text-white">3-Month Plan</h4>
                        <button onClick={() => setShowPlan(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
                    </div>
                    
                    {bmi && (
                        <div className="space-y-4 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 text-sm flex-grow">
                             <div className="flex gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg h-fit"><Dumbbell size={16} /></div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Exercise Focus</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{getPlanDetails(bmi).exercises}</div>
                                    <div className="text-brand-primary text-xs font-medium mt-1">{getPlanDetails(bmi).freq}</div>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg h-fit"><Beef size={16} /></div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Nutrition</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">Target: {getPlanDetails(bmi).focus}</div>
                                    <div className="text-orange-500 text-xs font-medium mt-1">{getPlanDetails(bmi).protein}</div>
                                </div>
                             </div>
                             <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
                                 <p className="text-xs text-gray-400 italic">"Consistency is the key. Stick to this plan for 12 weeks to see visible results."</p>
                             </div>
                        </div>
                    )}
                </motion.div>
            )}
        </Card>
    );
};

// --- Daily Wellness Tip ---
const DailyTip = () => {
    const tips = [
        "Hydrate! Drinking water before meals aids digestion.",
        "Eat the rainbow: colorful plates mean diverse vitamins.",
        "Protein at breakfast keeps you full longer.",
        "Chew slowly to help your brain register fullness.",
        "Add fiber-rich veggies to every meal for gut health."
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const tip = tips[dayOfYear % tips.length];

    return (
        <Card color="green" delay={0.2} className="p-6 relative overflow-hidden flex items-center gap-5 group h-full min-h-[160px]">
            <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all" />
            <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 dark:text-green-400 shrink-0 border border-green-500/20 shadow-lg shadow-green-500/5 relative z-10"
            >
                <Leaf size={28} />
            </motion.div>
            <div className="relative z-10">
                <div className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Sparkles size={10} /> Daily Insight
                </div>
                <p className="text-slate-700 dark:text-gray-200 font-medium leading-snug text-sm md:text-base">{tip}</p>
            </div>
        </Card>
    );
};

// --- AI Assistant ---
const AIAssistant = ({ history, userProfile }: { history: HistoryItem[], userProfile: UserProfile }) => {
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getAdvice = async () => {
        setLoading(true);
        const result = await getNutritionAdvice(history, userProfile);
        setAdvice(result);
        setLoading(false);
    };

    return (
        <Card color="purple" delay={0.25} className="p-6 relative overflow-hidden flex flex-col h-full group min-h-[220px]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/10 transition-all duration-500" />
             
             <div className="flex items-center gap-3 mb-6 relative z-10 shrink-0">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center text-purple-500 dark:text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                     <BrainCircuit size={20} />
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white text-lg">AI Nutrition Coach</h3>
             </div>

             <div className="flex-grow relative z-10 flex flex-col min-h-0">
                 {advice ? (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex-grow flex flex-col min-h-0"
                    >
                         <div className="prose prose-invert prose-sm text-slate-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-sm overflow-y-auto custom-scrollbar mb-4 flex-grow">
                             <p>{advice}</p>
                         </div>
                         <button onClick={() => setAdvice(null)} className="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-400 font-bold uppercase tracking-wider self-end mt-auto shrink-0">Ask again</button>
                     </motion.div>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-2">
                         <p className="text-sm text-gray-500 max-w-[200px]">Analyze today's logs for personalized meal suggestions.</p>
                         <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={getAdvice}
                            disabled={loading}
                            className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-full font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] text-sm group-hover:bg-purple-500 group-hover:text-white"
                         >
                             {loading ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                             {loading ? 'Analyzing...' : 'Analyze My Day'}
                         </motion.button>
                     </div>
                 )}
             </div>
        </Card>
    );
};

// --- Manual Entry Modal ---
const ManualEntryModal = ({ onClose, onAdd }: { onClose: () => void, onAdd: (name: string, cal: number, macros: Macros) => void }) => {
    const [name, setName] = useState('');
    const [cal, setCal] = useState('');
    const [prot, setProt] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(name, parseInt(cal)||0, { protein: parseInt(prot)||0, carbs: parseInt(carbs)||0, fat: parseInt(fat)||0 });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 md:p-8 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-blue-500" />
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary"><Plus size={18} /></div>
                    Add Food
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider ml-1 mb-1 block">Food Name</label>
                        <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-brand-primary outline-none transition-colors" placeholder="e.g. Oatmeal" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider ml-1 mb-1 block">Calories</label>
                            <input required type="number" value={cal} onChange={e => setCal(e.target.value)} className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-brand-primary outline-none transition-colors" placeholder="0" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider ml-1 mb-1 block">Protein (g)</label>
                            <input required type="number" value={prot} onChange={e => setProt(e.target.value)} className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-brand-primary outline-none transition-colors" placeholder="0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider ml-1 mb-1 block">Carbs (g)</label>
                            <input required type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-brand-primary outline-none transition-colors" placeholder="0" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider ml-1 mb-1 block">Fat (g)</label>
                            <input required type="number" value={fat} onChange={e => setFat(e.target.value)} className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-brand-primary outline-none transition-colors" placeholder="0" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-brand-primary to-emerald-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all mt-4 transform hover:scale-[1.02] active:scale-95">
                        Add Entry
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// --- Health Score Gauge ---
const HealthScore = ({ score }: { score: number }) => {
    let color = "text-red-500";
    let borderColor = "border-red-500/20";
    let bgColor = "bg-red-500";
    let shadow = "shadow-red-500/10";
    let themeColor = "red";
    
    if (score >= 80) {
        color = "text-emerald-500";
        borderColor = "border-emerald-500/20";
        bgColor = "bg-emerald-500";
        shadow = "shadow-emerald-500/10";
        themeColor = "emerald";
    } else if (score >= 60) {
        color = "text-yellow-500";
        borderColor = "border-yellow-500/20";
        bgColor = "bg-yellow-500";
        shadow = "shadow-yellow-500/10";
        themeColor = "yellow";
    }

    const radius = 56; // Increased radius
    const stroke = 10;
    const circumference = 2 * Math.PI * radius; 
    const offset = circumference - (score / 100) * circumference;

    return (
        <Card color={themeColor} delay={0.15} className="p-8 relative overflow-hidden flex flex-col items-center justify-center h-full min-h-[260px]">
            <div className={`absolute top-0 right-0 w-full h-full ${bgColor}/10 blur-[50px]`} />
            <div className="flex items-center gap-2 mb-6 relative z-10 mt-auto">
                 <HeartPulse size={16} className={color} />
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Health Score</h3>
            </div>
            
            <div className="relative w-36 h-36 flex items-center justify-center z-10 mb-auto">
                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-gray-200 dark:text-white/5" />
                    <circle 
                        cx="64" cy="64" r={radius} 
                        stroke="currentColor" strokeWidth={stroke} 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={offset} 
                        strokeLinecap="round"
                        className={`${color} transition-all duration-1000 ease-out`} 
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tighter leading-none`}>{score}</span>
                </div>
            </div>
            
            <div className={`mt-6 px-4 py-2 rounded-full bg-white dark:bg-[#020617] border ${borderColor} ${color} text-xs font-bold uppercase tracking-wider shadow-lg ${shadow} z-10 mb-2`}>
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
            </div>
        </Card>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ history, userProfile, onDeleteLogItem, onUpdateLogItem, onManualAdd, isDarkMode }) => {
  const [streak, setStreak] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [showManualModal, setShowManualModal] = useState(false);
  
  // Local Goal State for Edit Functionality
  const [calorieGoal, setCalorieGoal] = useState(userProfile.dailyCalorieGoal);
  const [waterGoal, setWaterGoal] = useState(8);
  const [isEditingCalorieGoal, setIsEditingCalorieGoal] = useState(false);
  const [tempCalorieGoal, setTempCalorieGoal] = useState(calorieGoal.toString());

  const saveCalorieGoal = () => {
      const val = parseInt(tempCalorieGoal);
      if (val > 0) setCalorieGoal(val);
      setIsEditingCalorieGoal(false);
  };

  useEffect(() => {
    // Load streak logic
    const storedStreak = parseInt(localStorage.getItem('user_streak') || '1');
    const lastLogin = localStorage.getItem('last_login_date');
    const today = new Date().toDateString();

    if (lastLogin && lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLogin === yesterday.toDateString()) {
            const newStreak = storedStreak + 1;
            setStreak(newStreak);
            localStorage.setItem('user_streak', newStreak.toString());
        } else {
             setStreak(1);
             localStorage.setItem('user_streak', '1');
        }
    } else {
        setStreak(storedStreak);
    }
    localStorage.setItem('last_login_date', today);

    // Load water
    const savedWater = localStorage.getItem(`water_${today}`);
    if (savedWater) setWaterGlasses(parseInt(savedWater));
  }, []);

  const updateGlasses = (change: number) => {
        const newVal = Math.max(0, waterGlasses + change);
        setWaterGlasses(newVal);
        const today = new Date().toDateString();
        localStorage.setItem(`water_${today}`, newVal.toString());
  };
  
  // Data calculations...
  const chartData = history.slice(-7).map((item, index) => ({
    name: new Date(item.timestamp).toLocaleDateString([], {weekday: 'short'}),
    calories: item.calories,
    protein: item.macros.protein
  }));

  const todayEntries = history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString());
  const totalCaloriesToday = todayEntries.reduce((acc, curr) => acc + curr.calories, 0);
  
  const todayMacros = todayEntries.reduce((acc, curr) => ({
      protein: acc.protein + curr.macros.protein,
      carbs: acc.carbs + curr.macros.carbs,
      fat: acc.fat + curr.macros.fat
  }), { protein: 0, carbs: 0, fat: 0 });

  const progress = Math.min((totalCaloriesToday / calorieGoal) * 100, 100);

  const macroGoals = {
      protein: userProfile.dailyProteinGoal,
      carbs: 275, 
      fat: 78     
  };

  // Advanced Health Score Calculation
  const calculateScore = () => {
      let score = 0;
      
      // 1. Calorie Adherence (Max 40)
      const calRatio = totalCaloriesToday / (calorieGoal || 2000);
      if (totalCaloriesToday > 0) {
          if (calRatio >= 0.85 && calRatio <= 1.15) score += 40;
          else if (calRatio >= 0.7 && calRatio <= 1.3) score += 20;
          else score += 10;
      }

      // 2. Protein Goal (Max 30)
      const protRatio = todayMacros.protein / (userProfile.dailyProteinGoal || 150);
      if (protRatio >= 1.0) score += 30;
      else if (protRatio >= 0.75) score += 20;
      else if (protRatio >= 0.5) score += 10;

      // 3. Hydration (Max 20)
      if (waterGlasses >= waterGoal) score += 20;
      else if (waterGlasses >= (waterGoal/2)) score += 15;
      else if (waterGlasses >= 2) score += 5;

      // 4. Logging Consistency (Max 10)
      if (todayEntries.length >= 3) score += 10;
      else if (todayEntries.length >= 1) score += 5;

      return Math.min(100, score);
  };
  const healthScore = calculateScore();

  const startEdit = (id: string, currentVal: number) => {
      setEditingId(id);
      setEditValue(currentVal.toString());
  };

  const saveEdit = (id: string) => {
      const val = parseInt(editValue);
      if (!isNaN(val) && val >= 0) {
          onUpdateLogItem(id, val);
      }
      setEditingId(null);
  };

  // Dynamic Chart Colors based on Theme
  const axisColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 : slate-500
  const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderRadius: '12px',
      color: isDarkMode ? '#fff' : '#0f172a',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(8px)'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
        {/* Calories Card */}
        <Card className="p-8 relative overflow-hidden col-span-1 lg:col-span-2 h-full min-h-[260px]" color="emerald" delay={0}>
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] group-hover:bg-brand-primary/20 transition-all duration-500" />
            <div className="flex justify-between items-start mb-8 relative z-10 shrink-0">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                        <p className="text-brand-primary/80 text-xs font-bold uppercase tracking-widest">Energy Intake</p>
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <h3 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tighter tabular-nums">
                            {totalCaloriesToday} 
                        </h3>
                        <div className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 font-normal tracking-normal flex items-center gap-2">
                            / 
                            {isEditingCalorieGoal ? (
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="number" 
                                        value={tempCalorieGoal}
                                        onChange={(e) => setTempCalorieGoal(e.target.value)}
                                        className="w-24 bg-white dark:bg-white/10 border border-brand-primary rounded px-2 py-0.5 text-base text-slate-900 dark:text-white outline-none"
                                        autoFocus
                                    />
                                    <button onClick={saveCalorieGoal} className="p-1 text-green-500 hover:text-green-400"><Check size={20}/></button>
                                </div>
                            ) : (
                                <span className="group/edit flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingCalorieGoal(true)}>
                                    {calorieGoal}
                                    <Pencil size={16} className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-gray-500" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                    <Flame size={28} className="md:w-7 md:h-7" fill="currentColor" fillOpacity={0.2} />
                </div>
            </div>
            <div className="space-y-4 relative z-10 mt-auto">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Daily Goal</span>
                    <span className="text-slate-900 dark:text-white">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#020617] h-4 rounded-full overflow-hidden border border-gray-200 dark:border-white/5 relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-brand-primary to-emerald-400 h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] relative overflow-hidden" 
                    >
                         <div className="absolute top-0 left-0 bottom-0 w-full bg-white/20 -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>
            </div>
        </Card>

        {/* Health Score */}
        <div className="h-full"><HealthScore score={healthScore} /></div>

        {/* Water Intake */}
        <div className="h-full"><WaterTracker glasses={waterGlasses} updateGlasses={updateGlasses} goal={waterGoal} setGoal={setWaterGoal} /></div>
      </div>

      {/* Row 2: Tip + Streak + AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          <div className="h-full"><DailyTip /></div>
          
          <Card color="orange" delay={0.2} className="p-6 relative overflow-hidden flex flex-col justify-center items-center text-center group h-full min-h-[220px]">
             <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors duration-500" />
             <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 border border-orange-500/20 shadow-lg shadow-orange-500/10 relative z-10">
                 <TrendingUp size={24} />
             </div>
             <div className="text-xs font-bold text-orange-500/80 uppercase tracking-widest mb-2 relative z-10">Active Streak</div>
             <div className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 relative z-10 tracking-tighter">{streak} <span className="text-lg font-sans text-gray-500 font-medium">days</span></div>
             <div className="flex gap-1.5 relative z-10">
                {[...Array(5)].map((_, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className={`w-2.5 h-2.5 rounded-full ${i < (streak % 5) || (streak >= 5 && i < 5) ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-gray-200 dark:bg-white/10'}`} 
                    />
                ))}
            </div>
          </Card>

          <div className="md:col-span-2 lg:col-span-1 h-full">
             <AIAssistant history={todayEntries} userProfile={userProfile} />
          </div>
      </div>

      {/* Row 3: Macros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
        <div className="h-full"><MacroCard label="Protein" current={todayMacros.protein} goal={macroGoals.protein} color="blue" icon={Beef} delay={0.3} /></div>
        <div className="h-full"><MacroCard label="Carbs" current={todayMacros.carbs} goal={macroGoals.carbs} color="orange" icon={Wheat} delay={0.35} /></div>
        <div className="h-full"><MacroCard label="Fats" current={todayMacros.fat} goal={macroGoals.fat} color="yellow" icon={Cookie} delay={0.4} /></div>
      </div>

      {/* Row 4: Charts & History - Flexible Height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Charts Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Calorie Analytics Chart */}
                <Card color="emerald" delay={0.4} className="p-6 flex flex-col h-[350px]">
                    <div className="flex flex-col gap-1 mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary border border-brand-primary/20 shadow-sm">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Calorie Analytics
                                </h3>
                                <p className="text-xs text-gray-500">Weekly consumption trends</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full relative z-10 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} vertical={false} />
                                <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} width={30} />
                                <Tooltip 
                                    contentStyle={tooltipStyle}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    cursor={{stroke: 'rgba(16,185,129,0.2)', strokeWidth: 2}}
                                />
                                <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" activeDot={{ r: 6, strokeWidth: 0, fill: isDarkMode ? '#fff' : '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Protein Analysis Chart */}
                <Card color="blue" delay={0.45} className="p-6 flex flex-col h-[350px]">
                     <div className="flex flex-col gap-1 mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20 shadow-sm">
                                <Beef size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Protein Analysis
                                </h3>
                                <p className="text-xs text-gray-500">Daily macro nutrient breakdown</p>
                            </div>
                        </div>
                    </div>
                   
                    <div className="flex-1 w-full relative z-10 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} vertical={false} />
                                <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} width={30} />
                                <Tooltip 
                                    cursor={{fill: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)', radius: 8}}
                                    contentStyle={tooltipStyle}
                                    itemStyle={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }}
                                />
                                <Bar dataKey="protein" radius={[6, 6, 0, 0]} barSize={24}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="url(#colorProtein)" />
                                    ))}
                                </Bar>
                                <defs>
                                    <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 flex flex-col">
              <BMICalculator />

              <Card color="purple" delay={0.5} className="p-6 flex-col min-h-[400px] h-auto">
                <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500 dark:text-purple-400"><Clock size={16} /></div>
                        Recent Log
                    </h3>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowManualModal(true)}
                        className="text-[10px] font-bold bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1 transition-all border border-purple-500/20"
                    >
                        <Plus size={12} /> Add
                    </motion.button>
                </div>
                
                <div className="space-y-3 relative z-10">
                    {history.length === 0 ? (
                        <div className="text-center py-16 text-gray-600 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/[0.02]">
                            <Activity className="mx-auto mb-3 opacity-30" size={32} />
                            <p className="text-sm">No meals logged yet.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-700 mt-1">Scan your first meal above</p>
                        </div>
                    ) : (
                        history.slice().reverse().slice(0, 20).map((item, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                key={item.id} 
                                className="group p-3 rounded-2xl bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 hover:border-brand-primary/30 transition-all flex gap-3 items-center relative shadow-sm min-w-0"
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0 border border-gray-200 dark:border-white/5 relative">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.foodName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-white/5"><Utensils size={16} className="text-gray-500" /></div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{item.foodName}</h4>
                                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                                        <CalendarClock size={10} />
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">{item.macros.protein}g P</span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20">{item.macros.carbs}g C</span>
                                    </div>
                                </div>

                                <div className="text-right pl-2 flex flex-col items-end gap-2 shrink-0">
                                    {editingId === item.id ? (
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="number" 
                                                value={editValue} 
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-16 bg-gray-100 dark:bg-white/10 text-slate-900 dark:text-white text-sm rounded px-2 py-1 outline-none border border-brand-primary"
                                                autoFocus
                                            />
                                            <button onClick={() => saveEdit(item.id)} className="p-1.5 hover:bg-brand-primary rounded-lg text-brand-primary hover:text-white transition-colors"><Check size={14} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-1.5 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-colors"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mr-1">
                                                <div className="text-brand-primary font-bold text-sm md:text-base tabular-nums">{item.calories}</div>
                                                <div className="text-[9px] text-gray-500 dark:text-gray-600 uppercase font-bold tracking-wide">kcal</div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 transition-opacity transform translate-x-0">
                                                <button 
                                                    onClick={() => startEdit(item.id, item.calories)}
                                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white text-gray-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteLogItem(item.id)}
                                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
              </Card>
          </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
          {showManualModal && (
              <ManualEntryModal onClose={() => setShowManualModal(false)} onAdd={onManualAdd} />
          )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;