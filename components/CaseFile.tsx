import React from 'react';
import { CrimeCase, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { MapPin, Clock, Search, Users, FileText } from 'lucide-react';

interface CaseFileProps {
  caseData: CrimeCase;
  onInterrogate: (suspectId: string) => void;
  onSolve: () => void;
  lang: Language;
}

export const CaseFile: React.FC<CaseFileProps> = ({ caseData, onInterrogate, onSolve, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col h-full bg-[#171717] rounded-xl overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-[#0a0a0a] p-6 border-b border-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-serif tracking-wide">{caseData.title}</h2>
            <div className="flex items-center gap-4 text-slate-500 text-sm mt-2 font-mono">
              <span className="flex items-center gap-1"><MapPin size={14} /> {caseData.location}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {caseData.timeOfDeath}</span>
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-900/50 px-3 py-1 rounded text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            {t.activeCase}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Description */}
        <section>
          <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
            <FileText size={14} /> {t.incidentReport}
          </h3>
          <p className="text-slate-300 leading-relaxed font-serif text-lg border-l-2 border-slate-700 pl-4 italic">
            "{caseData.description}"
          </p>
        </section>

        {/* Clues */}
        <section>
          <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
            <Search size={14} /> {t.evidence}
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {caseData.clues.map((clue, idx) => (
              <li key={idx} className="bg-[#262626] p-3 rounded border border-slate-800 text-slate-300 text-sm flex items-start gap-2">
                <span className="text-slate-600 mt-1">•</span> {clue}
              </li>
            ))}
          </ul>
        </section>

        {/* Suspects */}
        <section>
          <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
            <Users size={14} /> {t.suspects}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {caseData.suspects.map((suspect) => (
              <div key={suspect.id} className="bg-[#262626] p-4 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-600 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                    {/* Simple avatar seed visual */}
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${suspect.avatarSeed}&backgroundColor=transparent`} 
                      alt="avatar" 
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">{suspect.name}</h4>
                    <p className="text-xs text-slate-500 uppercase">{suspect.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onInterrogate(suspect.id)}
                  className="bg-slate-100 hover:bg-white text-black px-4 py-2 rounded text-sm font-bold transition-transform active:scale-95"
                >
                  {t.interrogate}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer Action */}
      <div className="p-4 bg-[#0a0a0a] border-t border-slate-800 flex justify-center">
        <button 
          onClick={onSolve}
          className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg font-bold text-lg tracking-widest shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02]"
        >
          {t.solve}
        </button>
      </div>
    </div>
  );
};