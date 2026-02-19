import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Troubleshooting } from './components/Troubleshooting';
import { LoanerSystem } from './components/LoanerSystem';
import { SuccessScreen } from './components/SuccessScreen';
import { AiAssistant } from './components/AiAssistant';
import { ViewState } from './types';
import { TROUBLESHOOTING_FLOWS, TICKET_URL } from './constants';
import { Ticket } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [initialAiQuery, setInitialAiQuery] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>("You're all set!");
  
  // Force Kiosk Fullscreen
  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          // Errors are expected if user hasn't interacted yet
          console.log(`Fullscreen attempt blocked: ${err.message}`);
        });
      }
    };

    // Attempt immediately (works if launched as PWA in some contexts)
    enterFullscreen();

    // Attach listeners to force fullscreen on first interaction
    const handleInteraction = () => {
      enterFullscreen();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Handlers
  const goHome = () => {
    setView('HOME');
    setActiveFlowId(null);
    setInitialAiQuery('');
    setSuccessMessage("You're all set!");
  };

  const handleFlowSelect = (flowId: string) => {
    setActiveFlowId(flowId);
    setView('TROUBLESHOOT');
  };

  const handleLoanerSelect = () => {
    setView('LOANER');
  };

  const handleAiSelect = (query: string = '') => {
    setInitialAiQuery(query);
    setView('AI_CHAT');
  }

  const handleTicketSelect = () => {
    window.open(TICKET_URL, '_blank');
  };

  const handleTicketRedirectFromFlow = () => {
    window.open(TICKET_URL, '_blank');
    setView('TICKET');
  };

  const handleFlowComplete = (success: boolean) => {
    if (success) {
      setSuccessMessage("Great! Glad we could fix it.");
      setView('SUCCESS');
    } else {
      handleTicketRedirectFromFlow();
    }
  };

  const handleLoanerComplete = (message?: string) => {
    if (message) setSuccessMessage(message);
    setView('SUCCESS');
  };

  // Render Logic
  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return (
          <Home 
            onFlowSelect={handleFlowSelect} 
            onLoanerSelect={handleLoanerSelect}
            onTicketSelect={handleTicketSelect}
            onAiSelect={handleAiSelect}
          />
        );
      
      case 'TROUBLESHOOT':
        const flow = TROUBLESHOOTING_FLOWS.find(f => f.id === activeFlowId);
        if (!flow) return <div>Flow not found</div>;
        return (
          <Troubleshooting 
            flow={flow} 
            onComplete={handleFlowComplete}
            onTicketRedirect={handleTicketRedirectFromFlow}
          />
        );

      case 'LOANER':
        return (
          <LoanerSystem 
            onBack={goHome}
            onComplete={handleLoanerComplete}
          />
        );

      case 'AI_CHAT':
        return (
          <AiAssistant 
            onBack={goHome}
            onTicketRedirect={handleTicketRedirectFromFlow}
            onFlowSelect={handleFlowSelect}
            initialQuery={initialAiQuery}
          />
        );

      case 'SUCCESS':
        return <SuccessScreen onHome={goHome} message={successMessage} />;

      case 'TICKET':
        return (
           <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Ticket size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Ticket Form Opened</h2>
              <p className="text-slate-500 mb-8 max-w-md">
                We've opened the support ticket form in a new tab. Please fill it out to get help.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                 <button 
                   onClick={() => window.open(TICKET_URL, '_blank')} 
                   className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md"
                 >
                   Open Form Again
                 </button>
                 <button onClick={goHome} className="text-slate-500 hover:text-slate-700 font-medium py-2">
                   Return Home
                 </button>
              </div>
           </div>
        );
        
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <Layout currentView={view} onHome={goHome}>
      {renderContent()}
    </Layout>
  );
}
