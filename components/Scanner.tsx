import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, Zap, Image as ImageIcon, Scan, Activity, ArrowRight } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodAnalysis } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface ScannerProps {
  onAnalyzeComplete: (data: FoodAnalysis, imageUrl: string) => void;
}

// 3D Tilt Wrapper for Interactive Tiles
const TiltButton = ({ children, onClick, className }: { children?: React.ReactNode, onClick: () => void, className?: string }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

    return (
        <motion.button
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ scale: 1, y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative transition-all duration-200 ease-out perspective-1000 ${className}`}
        >
            <div className="absolute inset-0 rounded-[2rem] transform translate-z-0" />
            {children}
        </motion.button>
    );
};

const Scanner: React.FC<ScannerProps> = ({ onAnalyzeComplete }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setError(null);
    setImagePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setIsCameraOpen(true);
      // Wait for React to render the video element
      setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
      }, 100);
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        stopCamera();
        setImagePreview(dataUrl);
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      // Clean up camera state first
      if (isCameraOpen) {
          stopCamera();
      }
      setIsCameraOpen(false); // Force state sync

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const processImage = async () => {
    if (!imagePreview) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeFoodImage(imagePreview);
      onAnalyzeComplete(analysis, imagePreview);
    } catch (err) {
      setError("Analysis failed. Please try a clearer photo.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setError(null);
    stopCamera();
    setIsCameraOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-slate-50 dark:bg-[#020617] transition-colors duration-500 overflow-hidden">
      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Main Viewfinder Area */}
      <div className="relative flex-grow w-full flex flex-col items-center justify-center bg-white dark:bg-black/40 backdrop-blur-sm overflow-hidden transition-colors duration-500">
        
        {/* Error Message */}
        <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-6 z-50 px-6 py-3 bg-red-500/90 backdrop-blur-md rounded-2xl text-white text-sm font-medium shadow-2xl border border-white/10 flex items-center gap-3"
                >
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError(null)} className="ml-2 hover:text-white/80"><X size={14}/></button>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- Content States --- */}
        
        {/* 1. Camera Active */}
        {isCameraOpen && (
            <div className="absolute inset-0 z-10 bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-[20px] border-black/30" />
                    {/* Camera Guides */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/30 rounded-3xl">
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand-primary rounded-tl-xl" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand-primary rounded-tr-xl" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand-primary rounded-bl-xl" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand-primary rounded-br-xl" />
                    </div>
                    <div className="absolute bottom-4 w-full text-center text-xs font-mono text-white/70 animate-pulse">
                        ALIGN FOOD IN FRAME
                    </div>
                </div>
            </div>
        )}

        {/* 2. Image Preview & Analysis */}
        {!isCameraOpen && imagePreview && (
            <div className="relative w-full h-full z-20 bg-black flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                
                {/* Overlay Scanning Effects */}
                <AnimatePresence>
                {isAnalyzing && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px]"
                    >
                        {/* Moving Laser */}
                        <motion.div 
                            initial={{ top: "0%" }}
                            animate={{ top: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-1 bg-brand-primary shadow-[0_0_50px_rgba(16,185,129,1)] z-40 opacity-80"
                        />
                        
                        {/* Tech UI */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-brand-primary/30 rounded-full animate-[spin_3s_linear_infinite]" />
                                    <div className="absolute inset-0 border-4 border-t-brand-primary rounded-full animate-spin" />
                                    <Zap className="absolute inset-0 m-auto text-brand-primary animate-pulse" size={32} fill="currentColor" />
                                </div>
                                <div className="text-center">
                                    <div className="text-white font-bold tracking-[0.3em] text-lg mb-2">ANALYZING</div>
                                    <div className="text-xs text-brand-primary font-mono bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                                        Identifying Macro-Nutrients...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        )}

        {/* 3. Idle State (No Camera, No Image) - Enhanced for Light/Dark */}
        {!isCameraOpen && !imagePreview && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 w-full overflow-hidden">
                {/* Cyber Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none">
                     <motion.div 
                        animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-[inherit]"
                     />
                </div>
                
                <div className="mb-10 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Scan size={14} /> Ready to Scan
                    </div>
                    <h3 className="text-5xl font-display font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Capture Meal</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm font-medium">Select input method to begin analysis</p>
                </div>
                
                {/* Interactive Tiles with 3D Tilt */}
                <div className="grid grid-cols-2 gap-6 w-full max-w-lg relative z-10">
                    <TiltButton 
                        onClick={startCamera}
                        className="group h-56 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center gap-5 shadow-xl hover:shadow-2xl transition-all"
                    >
                         {/* Transforming Inner Content */}
                         <div className="transform-style-3d translate-z-10 flex flex-col items-center gap-4 relative z-10">
                            <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-[#020617] flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-lg group-hover:border-brand-primary/50 group-hover:shadow-brand-primary/20 transition-all">
                                <Camera size={32} className="text-gray-400 dark:text-gray-300 group-hover:text-brand-primary transition-colors" />
                            </div>
                            <span className="font-bold text-lg text-slate-700 dark:text-gray-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Camera</span>
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </TiltButton>

                    <TiltButton 
                        onClick={triggerUpload}
                        className="group h-56 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center gap-5 shadow-xl hover:shadow-2xl transition-all"
                    >
                         <div className="transform-style-3d translate-z-10 flex flex-col items-center gap-4 relative z-10">
                            <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-[#020617] flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-lg group-hover:border-blue-500/50 group-hover:shadow-blue-500/20 transition-all">
                                <ImageIcon size={32} className="text-gray-400 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <span className="font-bold text-lg text-slate-700 dark:text-gray-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Upload</span>
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </TiltButton>
                </div>
             </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Deck (Bottom Bar) */}
      <div className="h-24 bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-white/10 flex items-center justify-center px-6 relative z-50 shrink-0 transition-colors duration-500">
        <AnimatePresence>
            
            {/* 1. Idle Controls */}
            {!imagePreview && !isCameraOpen && (
                <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                     <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 font-mono uppercase tracking-widest">
                        <Activity size={10} className="text-brand-primary" />
                        System Ready
                     </div>
                </motion.div>
            )}

            {/* 2. Camera Controls */}
            {isCameraOpen && (
                 <motion.div 
                    key="camera"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0 flex items-center justify-center gap-8 bg-black"
                 >
                    <button 
                        onClick={stopCamera}
                        className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
                        title="Cancel"
                    >
                        <X size={20} />
                    </button>
                    <button 
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center relative group shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                    >
                        <div className="w-14 h-14 bg-white rounded-full scale-90 group-active:scale-75 transition-transform duration-100" />
                    </button>
                    <div className="w-12 h-12" /> {/* Spacer */}
                 </motion.div>
            )}

            {/* 3. Preview Controls */}
            {imagePreview && !isAnalyzing && (
                 <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0 flex items-center justify-center gap-4 px-6 bg-[#0f172a]"
                 >
                    <button 
                        onClick={reset}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors font-medium text-sm"
                    >
                        Retake
                    </button>
                    
                    {/* Enhanced Analyze Button with Pulse and Shimmer */}
                    <motion.button 
                        onClick={processImage}
                        animate={{ boxShadow: ["0 0 20px rgba(16,185,129,0.4)", "0 0 35px rgba(16,185,129,0.8)", "0 0 20px rgba(16,185,129,0.4)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-emerald-400 text-[#020617] font-bold rounded-xl flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                         {/* Shimmer overlay */}
                        <motion.div 
                            className="absolute top-0 left-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                            initial={{ x: "-150%" }}
                            animate={{ x: "250%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                        />
                        <span className="relative flex items-center gap-2 z-10">
                             Analyze Now <ArrowRight size={18} />
                        </span>
                    </motion.button>
                 </motion.div>
            )}
             
            {/* 4. Analyzing State */}
            {isAnalyzing && (
                <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center gap-3 bg-[#0f172a]"
                >
                    <div className="flex gap-1">
                        <motion.div animate={{ height: [10, 20, 10] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-brand-primary rounded-full" />
                        <motion.div animate={{ height: [10, 25, 10] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-brand-primary rounded-full" />
                        <motion.div animate={{ height: [10, 15, 10] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-brand-primary rounded-full" />
                    </div>
                    <span className="text-brand-primary text-xs font-bold tracking-widest uppercase">Processing</span>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scanner;