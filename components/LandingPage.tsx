
import React, { useRef, useEffect, useState, useMemo } from 'react';
import Hero3D from './Hero3D';
import Scanner from './Scanner';
import Dashboard from './Dashboard';
import { HistoryItem, UserProfile, FoodAnalysis, Macros } from '../types';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Camera, Zap, Activity, Scan, ArrowRight, CheckCircle2, Send, ChevronRight, BarChart3, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';

interface LandingPageProps {
  history: HistoryItem[];
  userProfile: UserProfile;
  onAnalyzeComplete: (data: FoodAnalysis, imageUrl: string) => void;
  onDeleteLogItem: (id: string) => void;
  onUpdateLogItem: (id: string, newCalories: number) => void;
  onManualAdd: (foodName: string, calories: number, macros: Macros) => void;
  isDarkMode: boolean;
}

// --- Shared 3D Tilt Card Component ---
const TiltCard = ({ children, className, style, ...props }: { children?: React.ReactNode, className?: string, style?: any } & React.ComponentProps<typeof motion.div>) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });
  const scale = useSpring(useTransform(x, [-0.5, 0.5], [1, 1.02]), { stiffness: 150, damping: 20 });

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d", ...style }}
      className={`relative transition-all duration-200 ease-out perspective-1000 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- Spotlight Card (Simpler version for Landing Page) ---
const SpotlightCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
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

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-3xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-white/5 overflow-hidden ${className}`}
        >
            <div 
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(16,185,129,0.1), transparent 40%)`
                }}
            />
             <div 
                 className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
                 style={{
                     opacity,
                     background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(16,185,129,0.2), transparent 40%)`,
                     maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
                     maskComposite: 'exclude',
                     WebkitMaskComposite: 'xor',
                     padding: '1px'
                 }}
            />
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );
}

// --- Global 3D Background Component with Grid-Based Non-Overlapping Layout ---
const GlobalBackground = () => {
  const { scrollY } = useScroll();
  
  // Apply spring physics for smooth tracking
  const smoothScrollY = useSpring(scrollY, { stiffness: 40, damping: 20, mass: 0.8 });

  // Parallax movement ranges. Extended to cover long scroll distances.
  const yUp = useTransform(smoothScrollY, [0, 5000], [0, -1200]);
  const yDown = useTransform(smoothScrollY, [0, 5000], [0, 1200]);
  const rotate = useTransform(smoothScrollY, [0, 5000], [0, 720]); 

  const foodItems = useMemo(() => {
    // Massive curated list of 120+ unique food emojis
    const allIcons = [
        // Fruits
        "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝", "🍅", "🫒", "🥥", 
        // Vegetables
        "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🫘", "🌰", "🫚", "🫛",
        // Breads & Grains
        "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", 
        // Meat & Protein
        "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", 
        // Prepared Meals & Asian
        "🥘", "🍲", "🫕", "🥣", "🥗", "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", 
        "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", 
        // Seafood
        "🦀", "🦞", "🦐", "🦑", "🦪", 
        // Sweets & Desserts
        "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", 
        // Drinks
        "🍼", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋", "🧃", "🧉", "🧊"
    ];

    // Shuffle icons to ensure uniqueness in the visible set
    const shuffled = [...allIcons].sort(() => 0.5 - Math.random());
    
    // Grid Generation to prevent overlap
    const items = [];
    const columns = 10;  // Increased columns for density (was 8)
    const rows = 35;    // Increased rows for long scroll coverage (was 25)
    
    // Vertical span covers from top (-50%) to way below fold (250%)
    const verticalSpan = 350; 
    const startTop = -50;
    
    const cellWidth = 100 / columns;
    const cellHeight = verticalSpan / rows;

    let iconIndex = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            // 60% chance to populate a cell (resulting in ~200+ items)
            if (Math.random() > 0.6) {
                 continue;
            }

            // Pick next unique icon
            const icon = shuffled[iconIndex % shuffled.length];
            iconIndex++;
            
            // Add randomness within the cell (Jitter)
            // STRICT LIMIT: Max jitter is 30% of cell size to prevent crossing into neighbor
            const leftJitter = Math.random() * (cellWidth * 0.3);
            const topJitter = Math.random() * (cellHeight * 0.3);

            items.push({
                icon: icon,
                left: `${(c * cellWidth) + leftJitter + (cellWidth * 0.1)}%`, // Add base padding
                top: `${startTop + (r * cellHeight) + topJitter + (cellHeight * 0.1)}%`,
                size: `${2 + Math.random() * 2}rem`, // Size variation
                layer: Math.floor(Math.random() * 3), // 0: Up, 1: Down, 2: Static/Slow
                duration: 40 + Math.random() * 50, // MUCH Slower float duration (40s - 90s)
                delay: Math.random() * -40, // Start animation at random offsets
                rotationDir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }
    return items;
  }, []);

  const getLayerY = (layer: number) => {
      if (layer === 0) return yUp;
      if (layer === 1) return yDown;
      return undefined; 
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] dark:opacity-100 opacity-60" />
        
        {/* Floating Glowing Orbs */}
        <motion.div 
            animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1], x: [0, 30, 0] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-brand-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
            animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.2, 1], x: [0, -30, 0] }} 
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[120px]" 
        />

        {/* Massive Food Universe */}
        {foodItems.map((item, i) => (
            <motion.div
                key={i}
                style={{ 
                    y: getLayerY(item.layer), 
                    rotate: item.layer === 0 ? rotate : 0,
                    left: item.left,
                    top: item.top
                }}
                className="absolute select-none opacity-20 dark:opacity-10 blur-[0.5px] transition-opacity duration-500 will-change-transform"
                initial={{ scale: 0 }}
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 15 * item.rotationDir, 0]
                }}
                transition={{ 
                    scale: { duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: 0 },
                    rotate: { duration: item.duration * 0.8, repeat: Infinity, ease: "easeInOut", delay: 0 }
                }}
            >
                <span style={{ fontSize: item.size }} className="drop-shadow-sm filter grayscale-[20%] dark:grayscale-0">{item.icon}</span>
            </motion.div>
        ))}
    </div>
  );
};

// Interactive Demo Component with Enhanced Laser Effect
const InteractiveDemo = () => {
    // Style to fix border-radius clipping in Safari/Chrome during 3D transforms
    const maskStyle = { WebkitMaskImage: "-webkit-radial-gradient(white, black)" };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Capture */}
            <TiltCard 
                style={maskStyle}
                className="group h-[420px] rounded-[2.5rem] relative overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-xl flex flex-col justify-end transition-all duration-300 z-0 hover:shadow-blue-500/20"
            >
                {/* Pulse Glow Border - Subtly Animated */}
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-50 group-hover:animate-pulse" />

                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1516824711718-9c1e683412ac?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 transform-gpu group-hover:scale-110" alt="Capture" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f172a] via-white/50 dark:via-[#0f172a]/50 to-transparent" />
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-1000 rotate-45 pointer-events-none" />
                </div>
                {/* Transform container for 3D depth of text */}
                <div className="p-8 relative z-10 transform-style-3d translate-z-20">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 backdrop-blur-md border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform shadow-lg">
                        <Camera size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">1. Snap Photo</h3>
                    <p className="text-gray-600 dark:text-gray-400">Use your camera or upload a food image. Our system accepts any angle.</p>
                </div>
            </TiltCard>

            {/* Card 2: Analyze (The Cool Laser One) */}
            <TiltCard 
                style={maskStyle}
                className="group h-[420px] rounded-[2.5rem] relative overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-xl flex flex-col justify-end transition-all duration-300 z-0 hover:shadow-emerald-500/20"
            >
                {/* Pulse Glow Border */}
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-50 group-hover:animate-pulse" />

                {/* Image & Laser Effect */}
                <div className="absolute inset-0 overflow-hidden bg-black z-0">
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 transform-gpu group-hover:scale-110" alt="Scan" />
                    
                    {/* Scanning Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Laser Line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_20px_rgba(16,185,129,1)] top-[-10%] group-hover:animate-[scan_2s_linear_infinite] z-20" />
                    
                    {/* Floating Data Points on Hover */}
                    <div className="absolute top-8 left-8 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 z-30 pointer-events-none">
                         <motion.div 
                            initial={{ x: -20, opacity: 0 }} 
                            whileInView={{ x: 0, opacity: 1 }} 
                            className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border-l-2 border-brand-primary text-brand-primary text-xs font-mono flex items-center gap-2"
                        >
                            <Database size={10} /> Identifying...
                         </motion.div>
                         <motion.div 
                            initial={{ x: -20, opacity: 0 }} 
                            whileInView={{ x: 0, opacity: 1 }} 
                            transition={{ delay: 0.5 }}
                            className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border-l-2 border-blue-500 text-blue-400 text-xs font-mono flex items-center gap-2"
                        >
                            <Activity size={10} /> 380 kcal
                         </motion.div>
                         <motion.div 
                            initial={{ x: -20, opacity: 0 }} 
                            whileInView={{ x: 0, opacity: 1 }} 
                            transition={{ delay: 0.8 }}
                            className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border-l-2 border-orange-500 text-orange-400 text-xs font-mono flex items-center gap-2"
                        >
                            <BarChart3 size={10} /> 12g Protein
                         </motion.div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f172a] via-transparent to-transparent z-10" />
                </div>

                <div className="p-8 relative z-20 transform-style-3d translate-z-20">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 backdrop-blur-md border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform shadow-lg">
                        <Scan size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">2. AI Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-400">Gemini 2.5 Flash engine breaks down ingredients and calculates macros instantly.</p>
                </div>
            </TiltCard>

             {/* Card 3: Track - Updated Photo */}
             <TiltCard 
                style={maskStyle}
                className="group h-[420px] rounded-[2.5rem] relative overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-xl flex flex-col justify-end transition-all duration-300 z-0 hover:shadow-purple-500/20"
            >
                {/* Pulse Glow Border */}
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-50 group-hover:animate-pulse" />

                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 transform-gpu group-hover:scale-110" alt="Track" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f172a] via-white/50 dark:via-[#0f172a]/50 to-transparent" />
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-1000 rotate-45 pointer-events-none" />
                </div>
                <div className="p-8 relative z-10 transform-style-3d translate-z-20">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 backdrop-blur-md border border-purple-500/20 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform shadow-lg">
                        <Activity size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">3. Track & Improve</h3>
                    <p className="text-gray-600 dark:text-gray-400">Log your meals to dashboard, monitor streaks, and get health scores.</p>
                </div>
            </TiltCard>
        </div>
    );
};

// Contact Form Component
const ContactForm = () => {
    const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch("https://formsubmit.co/ajax/jayparmar2411@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("Network response was not ok");
            
            setStatus('success');
            form.reset();
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <SpotlightCard className="max-w-2xl mx-auto p-8 md:p-10 shadow-2xl">
            {status === 'success' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-500">We'll get back to you shortly.</p>
                    <button onClick={() => setStatus('idle')} className="mt-6 text-brand-primary font-bold hover:underline">Send another</button>
                    <p className="text-xs text-orange-400 mt-4 bg-orange-500/10 p-2 rounded-lg">Important: If this is your first time, check your email to Activate the form.</p>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {/* Configuration fields for FormSubmit */}
                    <input type="hidden" name="_subject" value="New Inquiry - NutriVision AI" />
                    <input type="hidden" name="_template" value="table" />
                    <input type="hidden" name="_captcha" value="false" />
                    {/* Honey pot to prevent spam */}
                    <input type="text" name="_honey" style={{ display: 'none' }} />

                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Get in Touch</h3>
                        <p className="text-gray-500">Have questions? Send us a message.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Name</label>
                            <input required name="name" type="text" placeholder="John Doe" className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-colors text-slate-900 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Email</label>
                            <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-colors text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Message</label>
                        <textarea required name="message" rows={4} placeholder="How can we help you?" className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-colors text-slate-900 dark:text-white resize-none" />
                    </div>

                    <button 
                        disabled={status === 'submitting'}
                        type="submit" 
                        className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg ${
                            status === 'error' 
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-brand-primary hover:bg-emerald-600 text-white shadow-brand-primary/20'
                        }`}
                    >
                        {status === 'submitting' ? 'Sending...' : status === 'error' ? 'Failed - Try Again' : <><Send size={18} /> Send Message</>}
                    </button>
                    {status === 'error' && <p className="text-xs text-red-500 text-center">Failed to send message. Please check your connection.</p>}
                    <p className="text-xs text-center text-gray-400 mt-4">By sending a message, you agree to our Terms of Service.</p>
                </form>
            )}
        </SpotlightCard>
    )
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  history, 
  userProfile, 
  onAnalyzeComplete, 
  onDeleteLogItem, 
  onUpdateLogItem, 
  onManualAdd,
  isDarkMode
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-32 pb-20 relative">
      <GlobalBackground />
      
      {/* Hero Section */}
      <section id="home">
        <Hero3D onGetStarted={scrollToScanner} />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 w-full relative z-10">
         <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-slate-900 dark:text-white">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Advanced AI analysis in three simple steps. No complex forms, just point and shoot.
            </p>
         </div>
         <InteractiveDemo />
      </section>

      {/* Scanner Section */}
      <section id="scanner" ref={scannerRef} className="max-w-6xl mx-auto w-full px-6 py-12 relative z-10">
        <div className="bg-white dark:bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-gray-200 dark:border-white/10 h-[650px] relative transform transition-all duration-500 hover:shadow-brand-primary/5">
            <Scanner onAnalyzeComplete={onAnalyzeComplete} />
        </div>
      </section>

      {/* Dashboard Section - Made transparent to show food background */}
      <section id="dashboard" className="max-w-7xl mx-auto w-full px-6 py-20 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-2xl relative z-20">
        <div className="mb-12 text-center">
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Your Dashboard</h2>
            <p className="text-gray-500">Real-time metrics and historical data</p>
        </div>
        <Dashboard 
            history={history} 
            userProfile={userProfile} 
            onDeleteLogItem={onDeleteLogItem}
            onUpdateLogItem={onUpdateLogItem}
            onManualAdd={onManualAdd}
            isDarkMode={isDarkMode}
        />
      </section>

       {/* FAQ Section */}
       <section id="faqs" className="max-w-4xl mx-auto w-full px-6 py-12 relative z-10">
           <h2 className="text-4xl font-display font-bold text-center mb-12 text-slate-900 dark:text-white">Common Questions</h2>
           <div className="grid gap-4">
               {[
                   { q: "How accurate is the calorie estimation?", a: "Our AI uses the latest Gemini 2.5 Flash model to identify food items and estimate portions with high accuracy, typically within 10-15% of actual values." },
                   { q: "Do I need to sign up?", a: "No! NutriVision AI is designed for friction-less usage. Your data is stored locally on your device." },
                   { q: "Can I edit the results?", a: "Yes, you can manually adjust calories and macros in the dashboard if needed." },
                   { q: "Is my data private?", a: "Absolutely. We do not store your photos on our servers. Analysis happens in the cloud securely, but personal logs stay on your browser." },
                   { q: "Does it work offline?", a: "You can view your dashboard offline, but analyzing new food items requires an active internet connection." },
                   { q: "Can I export my nutrition data?", a: "Currently, you can manually copy data, but we are working on a CSV export feature for the next update." },
                   { q: "Does it support vegetarian/vegan diets?", a: "Yes! The AI recognizes all food types including vegan and vegetarian dishes seamlessly." },
                   { q: "Is there a mobile app?", a: "NutriVision is a Progressive Web App (PWA). You can install it on your home screen directly from your browser for an app-like experience." },
                   { q: "How do I calculate my daily goals?", a: "We provide standard defaults (2200 kcal), but we recommend consulting a healthcare provider for personalized goals." },
                   { q: "What if the AI makes a mistake?", a: "AI isn't perfect. You can always use the 'Edit' button in your Recent Log to correct any miscalculations." },
               ].map((item, i) => (
                   <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                   >
                       <SpotlightCard className="p-8 backdrop-blur-md">
                           <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex justify-between items-center cursor-pointer">
                               {item.q}
                               <ChevronRight className="text-gray-400 hover:text-brand-primary transition-colors" size={20} />
                           </h4>
                           <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
                       </SpotlightCard>
                   </motion.div>
               ))}
           </div>
       </section>

        {/* Contact Section */}
        <section id="contact" className="w-full px-6 py-20 relative z-10">
             <ContactForm />
        </section>
    </div>
  );
};

export default LandingPage;
