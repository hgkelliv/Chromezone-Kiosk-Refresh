import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Sparkles, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { TROUBLESHOOTING_FLOWS, TICKET_URL } from '../constants';

interface AiAssistantProps {
  onBack: () => void;
  onTicketRedirect: () => void;
  onFlowSelect: (flowId: string) => void;
  initialQuery?: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  suggestion?: {
    flowId: string;
    reason: string;
  };
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onBack, onTicketRedirect, onFlowSelect, initialQuery }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'intro', 
      role: 'model', 
      text: "Hi! I'm the Chromezone Assistant. Describe your problem, and I'll try to help you fix it!" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize GenAI
  // Note: In a production kiosk, ensure the key is restricted or proxied.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Construct history for the model
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      history.push({ role: 'user', parts: [{ text: userMsg.text }] });

      // Define the tool for suggesting flows
      const suggestFlowTool: FunctionDeclaration = {
        name: 'suggestFlow',
        description: 'Suggests a specific interactive troubleshooting guide (flow) within the app if the user problem matches a known category.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            flowId: {
              type: Type.STRING,
              description: 'The ID of the flow. Options: "wifi" (internet issues), "signin" (password/account), "keyboard" (typing/key issues), "screen" (display damage), "power" (charging/battery), "tips" (shortcuts).',
            },
            reason: {
              type: Type.STRING,
              description: 'A short, friendly explanation of why this guide is recommended.',
            }
          },
          required: ['flowId', 'reason']
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: {
          systemInstruction: `You are a friendly, helpful school IT technician for K-12 students. 
          
          Your goal is to direct students to the correct troubleshooting tool in the app.
          
          1. Analyze the student's problem.
          2. If the problem matches one of these flows: [WiFi, Sign In, Keyboard, Screen, Power, Tips], you MUST call the 'suggestFlow' function.
          
          SPECIFIC KNOWLEDGE BASE:
          - KEYBOARD ISSUES: If keys are not typing correctly or missing, instruct the student to perform an EC Reset: "Press 'Esc' + 'Refresh' + Power all at once. When screen goes black/recovery screen appears, press power to turn off, then press power to turn on."
          - WIFI ISSUES: Students cannot forget networks managed by the school. If restarting doesn't work, instruct the student to perform an EC Reset (same steps as keyboard issues).
          - SIGN IN ISSUES ("can't verify password", "old password"): Instruct to remove the account (click down arrow on login screen -> Remove Account) and then Shutdown completely. If that fails, perform an EC Reset.
          - If keys are hard to press, it is physical damage -> Suggest Ticket.
          
          RESOURCE LINKS:
          - Ticket Form: ${TICKET_URL}
          
          3. If the problem is vague, ask a clarifying question.
          4. If it's physically broken (cracked screen, keys missing), call 'suggestFlow' with 'screen', 'keyboard' or 'power' OR suggest a ticket in text if no flow fits perfectly. If you suggest a ticket textually, provide the Ticket Form link from resources.
          5. If the user asks about Loaner Chromebooks, direct them to the "Loaner Chromebooks" button on the Home Screen. You cannot check stock yourself.
          6. Keep text responses under 3 sentences.`,
          tools: [{ functionDeclarations: [suggestFlowTool] }],
        }
      });

      const functionCalls = response.functionCalls;
      let text = response.text || "";
      let suggestion = undefined;

      // Handle Function Call
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'suggestFlow') {
          const args = call.args as any;
          suggestion = {
            flowId: args.flowId,
            reason: args.reason
          };
          // If the model didn't return text (only a tool call), use the reason as text
          if (!text) {
            text = `I think our ${args.flowId} guide can help with that.`;
          }
        }
      }

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: text || "I'm having trouble connecting. Please try again.",
        suggestion: suggestion
      }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "Sorry, I lost my connection. Please check your internet or submit a ticket." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (initialQuery && !hasInitialized.current) {
        hasInitialized.current = true;
        handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex items-center justify-between shadow-md z-10">
        <button onClick={onBack} className="text-white/80 hover:text-white transition-colors">
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span>Chromezone Assistant</span>
        </div>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
            </div>
            
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl text-base leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white text-slate-800 rounded-br-none border border-slate-100' 
                  : 'bg-indigo-600 text-white rounded-bl-none'
              }`}>
                {msg.text}
              </div>

              {/* Suggestion Card */}
              {msg.suggestion && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => onFlowSelect(msg.suggestion!.flowId)}
                  className="mt-2 group flex items-center gap-3 bg-white p-3 pr-5 rounded-xl border-2 border-indigo-100 hover:border-indigo-400 transition-all shadow-sm text-left w-full sm:w-auto"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                     <Zap className="text-indigo-600 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Suggested</div>
                    <div className="font-bold text-slate-800">
                      {TROUBLESHOOTING_FLOWS.find(f => f.id === msg.suggestion!.flowId)?.title || "Troubleshoot Issue"}
                    </div>
                  </div>
                  <div className="ml-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                    <ArrowRight size={14} />
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-end gap-3"
          >
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
               <Bot size={18} />
             </div>
             <div className="bg-indigo-600 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
               <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></span>
             </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your problem here..."
            className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full transition-all shadow-md active:scale-95"
          >
            <Send size={20} className={isTyping ? 'opacity-0' : 'opacity-100'} />
            {isTyping && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/></div>}
          </button>
        </div>
        
        {/* Helper quick actions */}
        <div className="mt-3 flex justify-center gap-4 text-sm text-slate-400">
           <button onClick={onTicketRedirect} className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
              <AlertCircle size={14} /> Report broken hardware
           </button>
        </div>
      </div>
    </div>
  );
};