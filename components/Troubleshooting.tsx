import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TroubleshootingFlow, FlowStep } from '../types';
import { ArrowRight, CheckCircle, XCircle, AlertCircle, PlayCircle } from 'lucide-react';

interface TroubleshootingProps {
  flow: TroubleshootingFlow;
  onComplete: (success: boolean) => void;
  onTicketRedirect: () => void;
}

export const Troubleshooting: React.FC<TroubleshootingProps> = ({ flow, onComplete, onTicketRedirect }) => {
  const [currentStepId, setCurrentStepId] = useState<string>(flow.startStepId);
  const [direction, setDirection] = useState<number>(1);

  const currentStep = flow.steps[currentStepId];

  const handleOptionSelect = (nextId: string | null) => {
    if (nextId === 'TICKET_REDIRECT') {
      onTicketRedirect();
      return;
    }
    
    if (nextId === null) {
      // Success!
      onComplete(true);
      return;
    }

    setDirection(1);
    setCurrentStepId(nextId);
  };

  // Animation variants for sliding steps
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  if (!currentStep) return <div>Error: Step not found</div>;

  return (
    <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-center items-center py-8">
      
      {/* Header Info */}
      <div className="mb-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-2">
          Troubleshooting
        </div>
        <h2 className="text-3xl font-bold text-slate-900">{flow.title}</h2>
      </div>

      <div className="relative w-full overflow-hidden min-h-[500px] bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStepId}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col p-8 md:p-12"
          >
            {/* Media Area (Video/Image) */}
            {currentStep.mediaUrl && (
              <div className="w-full h-64 bg-slate-100 rounded-xl mb-8 overflow-hidden relative group">
                <img 
                  src={currentStep.mediaUrl} 
                  alt={currentStep.title} 
                  className="w-full h-full object-cover"
                />
                {currentStep.mediaType === 'video' && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all cursor-pointer">
                      <PlayCircle className="text-white w-16 h-16 opacity-90 group-hover:scale-110 transition-transform" />
                   </div>
                )}
                {/* Simulated Video Badge */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded">
                   {currentStep.mediaType === 'video' ? 'VIDEO GUIDE' : 'VISUAL AID'}
                </div>
              </div>
            )}

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{currentStep.title}</h3>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 whitespace-pre-line">
                {currentStep.description}
              </p>
            </div>

            {/* Options / Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-100">
              {currentStep.options.map((option, idx) => {
                let btnClass = "py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-sm";
                let icon = <ArrowRight className="w-5 h-5" />;
                
                if (option.variant === 'primary') {
                  btnClass += " bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200";
                  if (option.nextStepId === null) icon = <CheckCircle className="w-5 h-5" />;
                } else if (option.variant === 'danger') {
                  btnClass += " bg-red-100 text-red-700 hover:bg-red-200";
                  icon = <XCircle className="w-5 h-5" />;
                } else {
                  btnClass += " bg-slate-100 text-slate-700 hover:bg-slate-200";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option.nextStepId)}
                    className={btnClass}
                  >
                    {option.label}
                    {icon}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};