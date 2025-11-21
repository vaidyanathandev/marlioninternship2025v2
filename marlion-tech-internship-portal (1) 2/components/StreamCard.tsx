import React from 'react';
import { StreamType } from '../types';

interface Props {
  stream: StreamType;
  description: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
}

const StreamCard: React.FC<Props> = ({ stream, description, icon, isOpen, onToggle }) => {
  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 group 
      ${isOpen ? 'border-marlion-primary shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'hover:border-marlion-primary/50'}`}>
      
      <div 
        className="p-6 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 
              ${isOpen ? 'bg-gradient-to-br from-marlion-primary to-marlion-accent text-white shadow-lg' : 'bg-marlion-bg border border-marlion-border text-marlion-muted group-hover:text-white group-hover:border-marlion-primary/30'}`}>
                <i className={`fa-solid ${icon} text-2xl`}></i>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white group-hover:text-marlion-primary transition-colors">{stream}</h3>
                <p className="text-xs text-marlion-muted mt-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-marlion-success"></span> Open for Registration
                </p>
            </div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-marlion-primary/20 text-marlion-primary rotate-180' : 'text-marlion-muted bg-marlion-bg border border-marlion-border group-hover:border-marlion-primary/50'}`}>
            <i className="fa-solid fa-chevron-down text-sm"></i>
        </div>
      </div>
      
      {/* Content: Controlled by isOpen prop */}
      <div className={`${isOpen ? 'block' : 'hidden'} px-6 pb-8 pt-0 animate-fade-in`}>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-marlion-border to-transparent mb-6"></div>
        <p className="text-slate-300 leading-relaxed mb-8 text-sm">{description}</p>
        
        {/* Explicit Video Placeholder */}
        <div className="aspect-video bg-black/60 rounded-xl border border-marlion-border flex flex-col items-center justify-center group-hover:border-marlion-primary/30 transition-colors relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 cursor-pointer">
              <i className="fa-solid fa-play text-3xl text-white ml-2 opacity-80"></i>
          </div>
          <span className="font-mono text-xs tracking-widest text-marlion-primary uppercase font-bold bg-marlion-primary/10 px-3 py-1 rounded border border-marlion-primary/20">
              Watch Stream Explainer
          </span>
        </div>
      </div>
    </div>
  );
};

export default StreamCard;