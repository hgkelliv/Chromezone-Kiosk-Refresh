import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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

// ============================================
// LOCAL KNOWLEDGE BASE
// ============================================

interface KnowledgeEntry {
  keywords: string[];
  flowId?: string;
  directResponse?: string;
  reason?: string;
  priority?: number; // Higher = more specific match
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // KEYBOARD ISSUES - High Priority Specific Matches
  {
    keywords: ['key', 'typing', 'keyboard', 'type', 'keys not working', 'cant type', "can't type"],
    flowId: 'keyboard',
    reason: "I can help you fix keyboard issues with a quick reset!",
    priority: 10
  },
  {
    keywords: ['keys hard', 'sticky', 'stuck key', 'key stuck', 'hard to press'],
    flowId: 'keyboard',
    reason: "That sounds like a physical issue. Let me guide you through reporting it.",
    priority: 15
  },

  // WIFI ISSUES
  {
    keywords: ['wifi', 'wi-fi', 'internet', 'no internet', 'cant connect', "can't connect", 'network', 'offline', 'not connecting'],
    flowId: 'wifi',
    reason: "Let's get your Wi-Fi working again!",
    priority: 10
  },
  {
    keywords: ['slow internet', 'internet slow', 'loading slow'],
    flowId: 'wifi',
    reason: "Slow internet can often be fixed with a quick reset.",
    priority: 8
  },

  // SIGN IN ISSUES - High Priority
  {
    keywords: ["can't verify", 'cant verify', 'verify password', 'old password', 'wrong password'],
    flowId: 'signin',
    reason: "I know exactly how to fix this! Let me walk you through it.",
    priority: 15
  },
  {
    keywords: ['sign in', 'signin', 'login', 'log in', 'password', 'cant login', "can't login", 'account', 'locked out'],
    flowId: 'signin',
    reason: "Let's get you signed in!",
    priority: 10
  },
  {
    keywords: ['forgot password', 'reset password', 'password reset'],
    directResponse: "For password resets, please visit your teacher or the main office. They can help reset your school account password. If you're seeing 'can't verify password', I can help with that!",
    priority: 12
  },

  // SCREEN ISSUES
  {
    keywords: ['screen', 'display', 'monitor', 'black screen', 'blank screen', 'cracked', 'broken screen', 'lines on screen', 'flickering'],
    flowId: 'screen',
    reason: "Let's figure out what's going on with your screen.",
    priority: 10
  },
  {
    keywords: ['screen cracked', 'cracked screen', 'shattered', 'broken glass'],
    flowId: 'screen',
    reason: "A cracked screen needs to be reported for repair.",
    priority: 15
  },

  // POWER/CHARGING ISSUES
  {
    keywords: ['power', 'charge', 'charging', 'battery', 'wont turn on', "won't turn on", 'dead', 'not charging', 'charger'],
    flowId: 'power',
    reason: "Let's troubleshoot your power issue!",
    priority: 10
  },
  {
    keywords: ['no light', 'charger light', 'orange light', 'white light'],
    flowId: 'power',
    reason: "Let's check if your charger is working properly.",
    priority: 12
  },

  // TIPS & SHORTCUTS
  {
    keywords: ['screenshot', 'how to screenshot', 'take screenshot'],
    directResponse: "To take a screenshot: Press Ctrl + Shift + Switch Window (the rectangle with lines key). The screenshot will save to your Downloads folder!",
    priority: 15
  },
  {
    keywords: ['caps lock', 'capital letters', 'all caps'],
    directResponse: "To toggle Caps Lock on a Chromebook: Press Alt + Search (the magnifying glass key). There's no dedicated Caps Lock key!",
    priority: 15
  },
  {
    keywords: ['shortcut', 'shortcuts', 'tips', 'tricks', 'keyboard shortcuts'],
    flowId: 'tips',
    reason: "Here are some useful Chromebook tips and shortcuts!",
    priority: 8
  },
  {
    keywords: ['lock', 'lock screen', 'how to lock'],
    directResponse: "To lock your Chromebook screen: Press Search + L. This is great for when you step away!",
    priority: 15
  },

  // EC RESET - Direct instruction
  {
    keywords: ['ec reset', 'hard reset', 'reset chromebook'],
    directResponse: "Here's how to do an EC Reset:\n\n1. Press Esc + Refresh (↻) + Power all at the same time\n2. Screen goes black, then shows recovery message\n3. Press Power to turn off\n4. Press Power again to turn back on\n\nThis fixes most keyboard and connection issues!",
    priority: 20
  },

  // LOANER CHROMEBOOKS
  {
    keywords: ['loaner', 'borrow', 'temporary', 'need a chromebook', 'get a chromebook', 'replacement'],
    directResponse: "For loaner Chromebooks, please go back to the Home screen and tap the 'Loaner Chromebooks' button. I can't check availability, but that system will show you what's available!",
    priority: 15
  },

  // BROKEN/DAMAGED - Direct to ticket
  {
    keywords: ['broken', 'damaged', 'dropped', 'water', 'spill', 'liquid', 'physical damage'],
    directResponse: "For physical damage (drops, spills, cracks), you'll need to submit a repair ticket. Would you like me to help you with that?",
    priority: 12
  },

  // AUDIO ISSUES
  {
    keywords: ['sound', 'audio', 'speaker', 'no sound', 'volume', 'headphones', 'microphone', 'mic'],
    directResponse: "For audio issues, try these steps:\n\n1. Check that volume isn't muted (click the time, check volume slider)\n2. If using headphones, unplug and try the built-in speakers\n3. Restart your Chromebook\n\nIf it's still not working, you may need to submit a ticket for speaker repair.",
    priority: 10
  },

  // CAMERA ISSUES
  {
    keywords: ['camera', 'webcam', 'video', 'camera not working'],
    directResponse: "For camera issues:\n\n1. Make sure the app has permission (check in Chrome settings)\n2. Close all apps and try again\n3. Restart your Chromebook\n\nIf the camera still doesn't work, please submit a ticket.",
    priority: 10
  },

  // TOUCHPAD/MOUSE
  {
    keywords: ['touchpad', 'trackpad', 'mouse', 'cursor', 'pointer', 'click not working'],
    directResponse: "For touchpad issues, try an EC Reset:\n\n1. Press Esc + Refresh (↻) + Power all at once\n2. When you see the recovery screen, press Power\n3. Press Power again to restart\n\nIf it's still not working, submit a ticket for repair.",
    priority: 10
  },

  // GOOGLE CLASSROOM / APPS
  {
    keywords: ['classroom', 'google classroom', 'assignment', 'docs', 'drive', 'gmail'],
    directResponse: "For Google Classroom or app issues, try:\n\n1. Refresh the page (Ctrl + R)\n2. Sign out and sign back in\n3. Try a different browser or clear cache\n\nIf you're having account access issues, I can help with sign-in problems!",
    priority: 8
  },

  // PRINTING
  {
    keywords: ['print', 'printer', 'printing', 'cant print'],
    directResponse: "For printing issues, please ask your teacher which printer to use in your classroom. School printers are managed by your teacher's computer. If you need to print from home, you can use Google Cloud Print or download and print from a different device.",
    priority: 10
  }
];

// Greeting responses
const GREETINGS = ['hi', 'hello', 'hey', 'sup', 'whats up', "what's up", 'yo', 'hola', 'help', 'help me'];

const GREETING_RESPONSES = [
  "Hi there! 👋 I'm here to help with your Chromebook. What's going on?",
  "Hello! What Chromebook issue can I help you with today?",
  "Hey! Tell me what's happening with your Chromebook and I'll do my best to help!",
  "Hi! Describe your problem and I'll guide you to a solution."
];

// Fallback responses when no match is found
const FALLBACK_RESPONSES = [
  "I'm not quite sure about that one. Could you describe your problem differently? For example: 'My keyboard isn't working' or 'I can't connect to Wi-Fi'",
  "Hmm, I didn't catch that. Try telling me specifically what's wrong - is it your keyboard, Wi-Fi, screen, or something else?",
  "I want to help but I need more details. What exactly is happening with your Chromebook?"
];

// Clarifying questions for vague input
const VAGUE_INPUT_RESPONSES = [
  "I'd like to help! Can you tell me more about what's happening? Is it related to:\n• Wi-Fi or internet\n• Keyboard or typing\n• Signing in\n• Screen display\n• Power or charging",
  "Sure, I can help! What's the main issue?\n• Can't connect to internet?\n• Keys not working?\n• Can't sign in?\n• Screen problems?\n• Won't turn on?"
];

// ============================================
// MATCHING LOGIC
// ============================================

function findBestMatch(input: string): KnowledgeEntry | null {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for greetings first
  if (GREETINGS.some(g => normalizedInput === g || normalizedInput.startsWith(g + ' '))) {
    return null; // Will trigger greeting response
  }
  
  // Very short or vague input
  if (normalizedInput.length < 4 || ['help', 'issue', 'problem', 'broken', 'fix'].includes(normalizedInput)) {
    return { keywords: [], directResponse: VAGUE_INPUT_RESPONSES[Math.floor(Math.random() * VAGUE_INPUT_RESPONSES.length)] };
  }
  
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;
  
  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    const priority = entry.priority || 5;
    
    for (const keyword of entry.keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        // Longer keyword matches are more specific
        score += keyword.length + priority;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  
  // Require a minimum score to avoid false matches
  return bestScore >= 5 ? bestMatch : null;
}

function generateResponse(input: string): { text: string; suggestion?: { flowId: string; reason: string } } {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for greetings
  if (GREETINGS.some(g => normalizedInput === g || normalizedInput.startsWith(g + ' ') || normalizedInput.endsWith(' ' + g))) {
    return {
      text: GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)]
    };
  }
  
  // Check for thank you
  if (normalizedInput.includes('thank') || normalizedInput.includes('thanks') || normalizedInput === 'ty') {
    return {
      text: "You're welcome! Let me know if you need anything else. 😊"
    };
  }
  
  // Check for yes/no responses (conversation continuity)
  if (['yes', 'yeah', 'yep', 'sure', 'ok', 'okay'].includes(normalizedInput)) {
    return {
      text: "Great! What would you like help with?"
    };
  }
  
  if (['no', 'nope', 'nah'].includes(normalizedInput)) {
    return {
      text: "No problem! Let me know if something else comes up."
    };
  }
  
  // Find best knowledge base match
  const match = findBestMatch(input);
  
  if (match) {
    if (match.directResponse) {
      return { text: match.directResponse };
    }
    
    if (match.flowId) {
      return {
        text: match.reason || "I think I can help with that!",
        suggestion: {
          flowId: match.flowId,
          reason: match.reason || "Suggested guide"
        }
      };
    }
  }
  
  // No match - fallback
  return {
    text: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
  };
}

// ============================================
// COMPONENT
// ============================================

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

    // Simulate a brief "thinking" delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));

    // Generate response locally
    const response = generateResponse(textToSend);

    setMessages(prev => [...prev, { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      text: response.text,
      suggestion: response.suggestion
    }]);

    setIsTyping(false);
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
              <div className={`p-4 rounded-2xl text-base leading-relaxed shadow-sm whitespace-pre-line ${
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
               <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
               <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
             </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Wi-Fi not working", query: "wifi not working" },
              { label: "Can't sign in", query: "can't sign in" },
              { label: "Keyboard issues", query: "keyboard not typing" },
              { label: "Won't turn on", query: "chromebook won't turn on" }
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSend(chip.query)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm rounded-full transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
