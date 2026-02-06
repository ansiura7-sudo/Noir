import React, { useState, useEffect } from 'react';
import { CrimeCase, GameView, Suspect, Language } from './types';
import { generateCase } from './services/geminiService';
import { CaseFile } from './components/CaseFile';
import { InterrogationRoom } from './components/InterrogationRoom';
import { MAX_ENERGY, TRANSLATIONS, CONFIG } from './constants';
import { Search, AlertCircle, Fingerprint, Coffee, Globe, Shield, ShoppingBag, Send, ArrowLeft, Star, Award, Heart } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<GameView>(GameView.OFFICE);
  const [currentCase, setCurrentCase] = useState<CrimeCase | null>(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'WIN' | 'LOSE' | null>(null);
  const [lang, setLang] = useState<Language>('ru');

  const t = TRANSLATIONS[lang];
  const detectiveLevel = Math.floor(xp / 50) + 1;

  const startNewCase = async () => {
    setLoading(true);
    try {
      const newCase = await generateCase(lang);
      setCurrentCase(newCase);
      setView(GameView.CASE_FILE);
      setResult(null);
    } catch (e) {
      console.error(e);
      alert("Archive connection lost. Retrying...");
    } finally {
      setLoading(false);
    }
  };

  const handleInterrogate = (suspectId: string) => {
    setSelectedSuspectId(suspectId);
    setView(GameView.INTERROGATION);
  };

  const handleConsumeEnergy = () => {
    setEnergy(prev => Math.max(0, prev - 1));
    setXp(prev => prev + 5);
  };

  const handleRestockEnergy = () => {
    setEnergy(MAX_ENERGY);
    setView(GameView.OFFICE);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ru' : 'en');
  };

  const handleSolveAttempt = (suspectId: string) => {
    if (!currentCase) return;
    const suspect = currentCase.suspects.find(s => s.id === suspectId);
    if (!suspect) return;

    if (suspect.isKiller) {
      setResult('WIN');
      setXp(prev => prev + 100);
    } else {
      setResult('LOSE');
      setXp(prev => Math.max(0, prev - 20));
    }
    setView(GameView.RESULT);
  };

  const handleTelegramClick = () => {
    window.open(CONFIG.TELEGRAM_URL, '_blank');
  };

  const handleKofiClick = () => {
    window.open(CONFIG.KOFI_URL, '_blank');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse">
          <Shield size={64} className="mb-4 text-slate-700" />
          <p className="font-mono text-sm uppercase tracking-widest">{t.loading}</p>
          <p className="text-[10px] mt-2 opacity-50">{t.connecting}</p>
        </div>
      );
    }

    switch (view) {
      case GameView.OFFICE:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6 animate-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-slate-100 blur-3xl opacity-5 rounded-full"></div>
              <Search size={80} className="text-slate-100 relative z-10" />
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-100 mb-2">{t.title}</h1>
              <p className="text-slate-500 tracking-[0.2em] text-sm uppercase">{t.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-mono">
              <Award size={14} className="text-yellow-500" />
              <span className="text-slate-400 uppercase tracking-tighter">{t.xp}:</span>
              <span className="text-white font-bold">{xp}</span>
              <span className="text-slate-600 ml-1">Lvl {detectiveLevel}</span>
            </div>

            <div className="max-w-md text-slate-400 text-sm leading-relaxed font-serif italic">
              "{t.introQuote}"
            </div>

            <div className="flex flex-col w-full gap-3 mt-4">
              <button 
                onClick={startNewCase}
                className="bg-slate-100 hover:bg-white text-black px-10 py-4 rounded-full font-bold text-lg tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 active:scale-95"
              >
                {t.newCase}
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => setView(GameView.SHOP)}
                  className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag size={16} /> {t.shop}
                </button>
                <button 
                  onClick={handleKofiClick}
                  className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Heart size={16} className="text-rose-500" /> {t.support}
                </button>
              </div>
            </div>

            <button onClick={toggleLanguage} className="absolute bottom-6 flex items-center gap-2 text-slate-600 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">
              <Globe size={14} /> {lang === 'en' ? 'English' : 'Русский'}
            </button>
          </div>
        );

      case GameView.SHOP:
        return (
          <div className="flex flex-col h-full bg-[#171717] rounded-xl overflow-hidden border border-slate-800 p-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setView(GameView.OFFICE)} className="text-slate-400 hover:text-white transition-transform active:scale-75"><ArrowLeft size={24} /></button>
              <h2 className="text-2xl font-serif text-white">{t.shop}</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0a0a0a] border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:border-slate-500 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-900/20 rounded-lg text-amber-500"><Coffee size={24} /></div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{t.buyCoffee}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{t.restockEnergy}</p>
                  </div>
                </div>
                <button onClick={handleRestockEnergy} className="bg-white text-black text-[9px] font-black px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-slate-200 uppercase">
                  {t.price}
                </button>
              </div>

              <div className="bg-[#0a0a0a] border border-slate-700 p-4 rounded-xl flex items-center justify-between opacity-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg text-slate-400"><Star size={24} /></div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Master Detective</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Unlocked at Level 5</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-600 px-3 py-2 border border-slate-800 rounded-lg uppercase font-mono">
                  Locked
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-800 text-center space-y-3">
              <button onClick={handleKofiClick} className="w-full bg-slate-100 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg active:scale-95">
                <Heart size={18} fill="black" /> {t.donate}
              </button>
              <button onClick={handleTelegramClick} className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sky-500 transition-all shadow-lg active:scale-95">
                <Send size={18} /> {t.joinCommunity}
              </button>
            </div>
          </div>
        );

      case GameView.CASE_FILE:
        return currentCase ? (
          <CaseFile 
            caseData={currentCase} 
            onInterrogate={handleInterrogate}
            onSolve={() => setView(GameView.ACCUSATION)}
            lang={lang}
          />
        ) : null;

      case GameView.INTERROGATION:
        const suspect = currentCase?.suspects.find(s => s.id === selectedSuspectId);
        return suspect ? (
          <InterrogationRoom 
            suspect={suspect} 
            energy={energy} 
            onConsumeEnergy={handleConsumeEnergy}
            onBack={() => setView(GameView.CASE_FILE)}
            lang={lang}
          />
        ) : null;

      case GameView.ACCUSATION:
        return currentCase ? (
          <div className="flex flex-col h-full bg-[#171717] rounded-xl overflow-hidden border border-slate-800 p-8 text-center animate-in fade-in">
            <h2 className="text-2xl text-white font-serif mb-6">{t.whoIsKiller}</h2>
            <div className="grid grid-cols-1 gap-4">
              {currentCase.suspects.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSolveAttempt(s.id)}
                  className="p-4 border border-slate-700 rounded-lg hover:bg-red-900/20 hover:border-red-500 transition-all text-left group"
                >
                  <div className="font-bold text-slate-200 group-hover:text-red-400">{s.name}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest">{s.role}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setView(GameView.CASE_FILE)} className="mt-8 text-slate-500 hover:text-white underline text-xs uppercase tracking-widest font-mono">
              {t.wait}
            </button>
          </div>
        ) : null;

      case GameView.RESULT:
        const killer = currentCase?.suspects.find(s => s.isKiller);
        return (
          <div className="flex flex-col h-full bg-[#171717] rounded-xl overflow-hidden border border-slate-800 p-8 text-center items-center justify-center animate-in zoom-in">
            {result === 'WIN' ? (
              <div className="text-green-500 mb-4 bg-green-900/20 p-4 rounded-full animate-bounce"><Fingerprint size={48} /></div>
            ) : (
              <div className="text-red-500 mb-4 bg-red-900/20 p-4 rounded-full"><AlertCircle size={48} /></div>
            )}
            
            <h2 className="text-3xl font-serif font-bold text-white mb-2">
              {result === 'WIN' ? t.caseClosed : t.caseCold}
            </h2>
            
            <p className="text-slate-400 mb-8 max-w-sm text-sm">
              {result === 'WIN' 
                ? t.successMsg(killer?.name || '') 
                : t.failMsg(killer?.name || '')}
            </p>

            <div className="bg-[#0a0a0a] border border-slate-800 p-4 rounded-lg mb-8 text-left w-full max-w-sm">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">XP Reward</p>
              <p className={`text-lg font-bold ${result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>
                {result === 'WIN' ? '+100 XP' : '-20 XP'}
              </p>
            </div>

            <button 
              onClick={() => setView(GameView.OFFICE)}
              className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-slate-200 uppercase text-xs tracking-widest transition-transform active:scale-95"
            >
              {t.backToOffice}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-slate-700 flex flex-col items-center justify-center p-4 selection:text-white overflow-hidden">
      
      {/* App Container */}
      <div className="w-full max-w-md h-[85vh] flex flex-col relative">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-2 text-slate-500 text-[9px] font-mono tracking-tighter uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            {t.liveDb}
          </div>
          
          <div 
            onClick={() => setView(GameView.SHOP)}
            className="flex items-center gap-2 bg-[#171717] border border-slate-800 rounded-full px-3 py-1 cursor-pointer hover:border-slate-500 transition-all group active:scale-95"
          >
             <Coffee size={14} className={energy > 0 ? "text-amber-500" : "text-slate-600"} />
             <span className={`font-mono text-xs font-bold ${energy > 0 ? "text-white" : "text-rose-500"}`}>{energy}/{MAX_ENERGY}</span>
          </div>
        </div>

        {/* Dynamic View Content */}
        <div className="flex-1 relative overflow-hidden">
           {renderContent()}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[9px] text-slate-700 font-mono tracking-[0.3em] uppercase opacity-50">
            {t.title} ARCHIVE SYSTEM • V.{CONFIG.VERSION}
          </p>
        </div>

      </div>
    </div>
  );
}