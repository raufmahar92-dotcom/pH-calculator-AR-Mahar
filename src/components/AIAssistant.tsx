import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Sparkles, Send, Bot, User, Copy, Check, Trash2, AlertCircle, BookOpen } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your **Chemistry AI Tutor** (by Sir AR Mahar). I can help you understand pH, pOH, acid-base equilibria, molarity, buffers, periodic trends, chemical equations, and lab safety. How can I help with your chemistry studies today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Explain the pH and pOH scale relationship with formulas',
    'What is a buffer solution and how does it maintain pH?',
    'Show step-by-step calculation for pH of 0.005 M H₂SO₄',
    'What is the difference between Molarity and Molality?',
    'List common acid-base indicators and their color changes',
    'Important laboratory safety rules for strong acids and bases',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          `Server returned non-JSON response (${response.status}). Please verify that GEMINI_API_KEY environment variable is configured in Vercel / environment settings.`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reach Chemistry AI Tutor.');
      }

      const aiMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        text: data.text || "I am a Chemistry AI Assistant and can only answer chemistry-related questions.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        text: `⚠️ Error: ${err.message || 'Unable to connect to Gemini AI backend. Please verify GEMINI_API_KEY in Secrets.'}`,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        text: "Chat cleared! Ask me any chemistry question about pH, pOH, molarity, stoichiometry, or lab safety.",
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Chemistry AI Tutor</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-900 rounded-full uppercase">Powered by Gemini</span>
            </h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Ask questions on pH, pOH, Buffers, Indicators, Molarity, Reaction Kinetics & Lab Safety
            </p>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors border border-white/10 self-end sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-300" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          Quick Chemistry Prompts:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-xs font-medium whitespace-nowrap shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Box */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs p-4 sm:p-6 min-h-[400px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[78%] p-4 rounded-2xl text-xs sm:text-sm space-y-2 relative group ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : msg.isError
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-none'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed font-sans">
                {msg.text}
              </div>

              {/* Copy message button */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.text)}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy response"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              <div
                className={`text-[10px] ${
                  msg.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-indigo-600 dark:text-indigo-400 p-2 font-semibold animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>Chemistry AI Tutor is deriving step-by-step answer...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Chemistry AI Tutor about pH, pOH, acids, bases, molarity, or formulas..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
