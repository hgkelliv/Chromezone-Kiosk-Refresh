import React from 'react';
import { Home } from 'lucide-react';
import { ViewState } from '../types';
import { SCHOOL_LOGO_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  onHome: () => void;
  currentView: ViewState;
}

export const Layout: React.FC<LayoutProps> = ({ children, onHome, currentView }) => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col mesh-gradient overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="fixed top-20 right-[-20%] w-[300px] h-[300px] rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-40 left-[-10%] w-[250px] h-[250px] rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="flex-1 z-10 overflow-y-auto overflow-x-hidden hide-scrollbar">
        
        {/* Global Navigation Header (Not shown on Home) */}
        {currentView !== 'HOME' && (
          <header className="px-6 py-4 flex items-center justify-between bg-white/10 backdrop-blur-md sticky top-0 z-50">
             <img 
              src={SCHOOL_LOGO_URL} 
              alt="Somerville Public Schools" 
              className="h-10 w-auto object-contain bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm" 
             />
             <button 
                onClick={onHome}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-primary font-bold shadow-sm hover:bg-slate-50 transition-colors active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
          </header>
        )}

        {children}
      </main>
    </div>
  );
};