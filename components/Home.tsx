import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Ticket, Sparkles, Send, Bot } from 'lucide-react';
import { SCHOOL_LOGO_URL } from '../constants';

interface HomeProps {
  onFlowSelect: (flowId: string) => void;
  onLoanerSelect: () => void;
  onTicketSelect: () => void;
  onAiSelect: (query: string) => void;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const Home: React.FC<HomeProps> = ({ onFlowSelect, onLoanerSelect, onTicketSelect, onAiSelect }) => {
  const [aiInput, setAiInput] = useState('');

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiInput.trim()) {
      onAiSelect(aiInput);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto relative min-h-full flex flex-col">
      
      {/* Scrollable Content Area */}
      <div className="px-8 pt-6 pb-[160px] flex-1">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Somerville Public Schools" 
              className="h-12 md:h-16 w-auto object-contain bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm" 
            />
        </div>

        {/* Hero Section with AI Input */}
        <div className="mb-12 text-center max-w-2xl mx-auto relative z-10">
            
          {/* Animated AI Character */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <div className="relative cursor-pointer" onClick={() => onAiSelect("")}>
                {/* Glow effect */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-400 blur-3xl rounded-full"
                />
                
                {/* Robot Head SVG Container */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-24 h-24 flex items-center justify-center"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
                        <defs>
                            <radialGradient id="headGradient" cx="30%" cy="30%" r="80%">
                                <stop offset="0%" stopColor="#fbbf24" /> {/* Amber-400 */}
                                <stop offset="100%" stopColor="#d97706" /> {/* Amber-600 */}
                            </radialGradient>
                            <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#9ca3af" />
                                <stop offset="100%" stopColor="#4b5563" />
                            </linearGradient>
                        </defs>
                        
                        {/* Antenna */}
                        <path d="M50 20 L50 10" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="50" cy="8" r="5" fill="#fbbf24" stroke="#1f2937" strokeWidth="1.5" />

                        {/* Ears/Bolts */}
                        <rect x="12" y="45" width="8" height="12" rx="2" fill="url(#metalGradient)" />
                        <rect x="80" y="45" width="8" height="12" rx="2" fill="url(#metalGradient)" />

                        {/* Head Shape */}
                        <rect x="20" y="20" width="60" height="55" rx="16" fill="url(#headGradient)" stroke="#1f2937" strokeWidth="2" />
                        
                        {/* Face Screen Area */}
                        <rect x="28" y="35" width="44" height="28" rx="8" fill="#1f2937" />
                        
                        {/* Eyes */}
                        <circle cx="42" cy="46" r="4.5" fill="#38bdf8" className="animate-pulse" /> 
                        <circle cx="58" cy="46" r="4.5" fill="#38bdf8" className="animate-pulse" />
                        
                        {/* Smile */}
                        <path d="M 43 55 Q 50 60 57 55" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        
                        {/* Highlight */}
                        <path d="M 28 25 Q 50 25 72 29" stroke="white" strokeWidth="3" strokeOpacity="0.4" strokeLinecap="round" fill="none" />
                    </svg>
                    
                    {/* Status Dot */}
                    <div className="absolute top-0 right-1 w-4 h-4 bg-emerald-500 border-[2px] border-white rounded-full flex items-center justify-center shadow-md z-10">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    </div>
                </motion.div>

                {/* Floating sparkles */}
                <motion.div 
                    animate={{ x: [0, 8, 0], y: [0, -8, 0], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
                    className="absolute -right-4 top-0"
                >
                    <Sparkles className="w-6 h-6 text-yellow-400 drop-shadow-md" />
                </motion.div>
                
                 <motion.div 
                    animate={{ x: [0, -5, 0], y: [0, 5, 0], opacity: [0, 0.8, 0], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    className="absolute -left-2 bottom-4"
                >
                    <Sparkles className="w-4 h-4 text-orange-300 drop-shadow-md" />
                </motion.div>
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-col items-center"
          >
             <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-3">
                <Sparkles size={14} className="text-yellow-300"/> 
                <span>Chromezone AI Assistant Online</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-8 drop-shadow-md">
                How can we help today?
             </h1>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleAiSubmit}
            className="relative w-full shadow-2xl shadow-indigo-900/20"
          >
            <input 
              type="text" 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Describe your issue... (e.g., 'My internet isn't working')" 
              className="w-full h-16 pl-6 pr-16 rounded-full bg-white text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 shadow-lg transition-all"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
            >
              <Send size={20} className={aiInput.length > 0 ? "ml-0.5" : ""} />
            </button>
          </motion.form>
        </div>

        {/* Grid Tiles */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
        >
          {/* Tile 1: WiFi */}
          <motion.button 
            variants={item}
            onClick={() => onFlowSelect('wifi')}
            className="group bg-white/90 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between h-48 text-left transition-all hover:bg-white hover:scale-[1.02] shadow-sm hover:shadow-xl border border-white/40"
          >
            <img 
              src="https://img.icons8.com/fluency/96/wifi.png" 
              alt="WiFi"
              className="w-14 h-14 mb-2 group-hover:scale-110 transition-transform duration-300 object-contain"
            />
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight mb-0.5">WiFi Issues</h3>
              <p className="text-sm text-slate-500 font-medium">Connection help</p>
            </div>
          </motion.button>

          {/* Tile 2: Sign In */}
          <motion.button 
            variants={item}
            onClick={() => onFlowSelect('signin')}
            className="group bg-white/90 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between h-48 text-left transition-all hover:bg-white hover:scale-[1.02] shadow-sm hover:shadow-xl border border-white/40"
          >
            <img 
              src="https://img.icons8.com/fluency/96/lock.png" 
              alt="Sign In"
              className="w-14 h-14 mb-2 group-hover:scale-110 transition-transform duration-300 object-contain"
            />
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight mb-0.5">Sign In</h3>
              <p className="text-sm text-slate-500 font-medium">Can't login</p>
            </div>
          </motion.button>

          {/* Tile 3: Keyboard */}
          <motion.button 
            variants={item}
            onClick={() => onFlowSelect('keyboard')}
            className="group bg-white/90 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between h-48 text-left transition-all hover:bg-white hover:scale-[1.02] shadow-sm hover:shadow-xl border border-white/40"
          >
            <img 
              src="https://img.icons8.com/fluency/96/keyboard.png" 
              alt="Keyboard"
              className="w-14 h-14 mb-2 group-hover:scale-110 transition-transform duration-300 object-contain"
            />
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight mb-0.5">Keyboard Issues</h3>
              <p className="text-sm text-slate-500 font-medium">Typing problems</p>
            </div>
          </motion.button>

          {/* Tile 4: Screen Damage */}
          <motion.button 
            variants={item}
            onClick={() => onFlowSelect('screen')}
            className="group bg-white/90 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between h-48 text-left transition-all hover:bg-white hover:scale-[1.02] shadow-sm hover:shadow-xl border border-white/40"
          >
            <img 
              src="https://img.icons8.com/fluency/96/monitor.png" 
              alt="Screen"
              className="w-14 h-14 mb-2 group-hover:scale-110 transition-transform duration-300 object-contain"
            />
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight mb-0.5">Screen</h3>
              <p className="text-sm text-slate-500 font-medium">Cracked display</p>
            </div>
          </motion.button>
          
           {/* Tile 5: Power */}
           <motion.button 
            variants={item}
            onClick={() => onFlowSelect('power')}
            className="group bg-white/90 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between h-48 text-left transition-all hover:bg-white hover:scale-[1.02] shadow-sm hover:shadow-xl border border-white/40"
          >
            <img 
              src="https://img.icons8.com/fluency/96/low-battery.png" 
              alt="Power"
              className="w-14 h-14 mb-2 group-hover:scale-110 transition-transform duration-300 object-contain"
            />
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight mb-0.5">Power</h3>
              <p className="text-sm text-slate-500 font-medium">Battery & charge</p>
            </div>
          </motion.button>

           {/* Tile 6: Tips */}
           <motion.button 
            variants={item}
            onClick={() => onFlowSelect('tips')}
            className="group bg-white/90 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between h-48 text-left transition-all hover:bg-white hover:scale-[1.02] shadow-sm hover:shadow-xl border border-white/40"
          >
            <img 
              src="https://img.icons8.com/fluency/96/idea.png" 
              alt="Tips"
              className="w-14 h-14 mb-2 group-hover:scale-110 transition-transform duration-300 object-contain"
            />
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight mb-0.5">Quick Tips</h3>
              <p className="text-sm text-slate-500 font-medium">Self-help guides</p>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Fixed Footer Stack */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Gradient fade to integrate smoothly with content */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/95 to-transparent -top-20 pointer-events-none"></div>
        
        <div className="relative px-8 pb-8 pt-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-4">

            {/* Loaner Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onLoanerSelect}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-4 transition-all"
            >
              <img 
                  src="https://img.icons8.com/fluency/96/laptop.png" 
                  alt="Loaner Laptop" 
                  className="w-14 h-14 object-contain drop-shadow-md"
              />
              <div className="text-left">
                 <span className="block font-bold text-2xl leading-none mb-1">Loaner Chromebooks/Charger</span>
                 <span className="text-emerald-100 font-medium text-lg">Borrow a device or charger</span>
              </div>
            </motion.button>

            {/* Ticket Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onTicketSelect}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 p-6 rounded-2xl shadow-xl flex items-center justify-center gap-4 transition-all"
            >
              <img 
                  src="https://img.icons8.com/fluency/96/starred-ticket.png" 
                  alt="Submit Ticket" 
                  className="w-14 h-14 object-contain drop-shadow-md"
              />
              <div className="text-left">
                <span className="block font-bold text-2xl leading-none mb-1">Submit Ticket</span>
                <span className="text-slate-500 font-medium text-lg">Request Hardware Repair</span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
};