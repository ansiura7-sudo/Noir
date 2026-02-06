import React, { useState, useEffect, useRef } from 'react';
import { Suspect, ChatMessage, Language } from '../types';
import { interactWithSuspect } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { Send, ArrowLeft, MoreHorizontal, Loader2 } from 'lucide-react';

interface InterrogationRoomProps {
  suspect: Suspect;
  energy: number;
  onConsumeEnergy: () => void;
  onBack: () => void;
  lang: Language;
}

export const InterrogationRoom: React.FC<InterrogationRoomProps> = ({ suspect, energy, onConsumeEnergy, onBack, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        sender: 'Suspect',
        text: t.greeting(suspect.name),
        timestamp: Date.now()
      }]);
    }
  }, [suspect, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || energy <= 0) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Detective',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    onConsumeEnergy();

    try {
      const responseText = await interactWithSuspect(suspect, [], userMsg.text, lang);
      
      const suspectMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Suspect',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, suspectMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#171717] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* Header */}
      <div className="bg-[#0a0a0a] p-4 border-b border-slate-800 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${suspect.avatarSeed}&backgroundColor=transparent`} 
            alt="avatar" 
            className="w-10 h-10 rounded-full bg-slate-800"
          />
          <div>
            <h3 className="font-bold text-slate-100">{suspect.name}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{suspect.role}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'Detective' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'Detective' 
                ? 'bg-slate-100 text-slate-900 rounded-tr-none' 
                : 'bg-[#262626] text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-[#262626] p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2 text-slate-400 text-xs">
               <MoreHorizontal className="animate-pulse" size={16} /> {t.typing}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-[#0a0a0a] border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={energy > 0 ? t.askQuestion : t.outOfEnergy}
            disabled={energy <= 0 || loading}
            className="w-full bg-[#171717] text-white border border-slate-700 rounded-full py-3 px-5 pr-12 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || energy <= 0 || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-100 text-black rounded-full hover:bg-slate-300 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2 uppercase tracking-wider">
          {energy} {t.questionsRemaining}
        </p>
      </form>
    </div>
  );
};