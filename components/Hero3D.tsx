import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Zap, MousePointer2 } from 'lucide-react';

interface Hero3DProps {
  onGetStarted: () => void;
}

const TiltCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
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

  const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      {children}
    </motion.div>
  );
};

const Hero3D: React.FC<Hero3DProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 perspective-1000"
    >
      {/* Main Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 text-center max-w-5xl mx-auto px-6"
      >
        <TiltCard className="inline-block">
            <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-sm text-brand-primary backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 transition-transform cursor-default">
                    <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                    </span>
                    <span className="font-bold tracking-wide">AI-Powered Nutrition 3.0</span>
                </div>
                
                <h1 className="text-7xl md:text-9xl font-display font-bold mb-8 leading-[0.9] tracking-tighter text-slate-900 dark:text-white drop-shadow-2xl">
                See Food.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-emerald-400 to-blue-500 animate-shimmer bg-[length:200%_auto]">
                    Know Data.
                </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Turn your camera into a nutritionist. Advanced computer vision analyzes your meals in real-time with medical-grade precision.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onGetStarted}
                        className="group relative px-10 py-5 bg-brand-primary text-white dark:text-brand-dark font-bold text-lg rounded-full overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center gap-3">
                            Start Scanning <Zap size={20} fill="currentColor" />
                        </span>
                    </motion.button>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-lg rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center gap-3 shadow-lg"
                    >
                        <MousePointer2 size={20} /> View Demo
                    </motion.button>
                </div>
            </motion.div>
        </TiltCard>
      </motion.div>
    </div>
  );
};

export default Hero3D;