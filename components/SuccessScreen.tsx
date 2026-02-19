import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

interface SuccessScreenProps {
  onHome: () => void;
  message?: string;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onHome, message = "You're all set!" }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onHome]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200 mb-8 relative"
      >
        <Check className="text-white w-16 h-16 stroke-[4]" />
        
        {/* Simple particle effects */}
        <motion.div animate={{ scale: [1, 1.5, 0], opacity: [1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="absolute -top-4 -right-4 text-yellow-400"><Star fill="currentColor" size={24}/></motion.div>
        <motion.div animate={{ scale: [1, 1.5, 0], opacity: [1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }} className="absolute -bottom-2 -left-4 text-blue-400"><Star fill="currentColor" size={20}/></motion.div>
        <motion.div animate={{ scale: [1, 1.5, 0], opacity: [1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.8 }} className="absolute top-0 -left-6 text-purple-400"><Star fill="currentColor" size={16}/></motion.div>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-slate-800 mb-4"
      >
        Awesome!
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-slate-600 max-w-md mx-auto mb-12"
      >
        {message}
      </motion.p>

      <button 
        onClick={onHome}
        className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors"
      >
        Return Home Now ({countdown})
      </button>
    </div>
  );
};
