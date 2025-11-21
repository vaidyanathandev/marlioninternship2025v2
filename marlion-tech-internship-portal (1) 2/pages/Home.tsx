import React, { useState } from 'react';
import Countdown from '../components/Countdown';
import StreamCard from '../components/StreamCard';
import { StreamType } from '../types';
import { generateAIResponse } from '../services/gemini';

interface Props {
  onNavigate: (page: string) => void;
}

const Home: React.FC<Props> = ({ onNavigate }) => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Track expansion state for cards by index (0-3)
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsThinking(true);
    const context = "You are a helpful assistant for Marlion Technologies Winter Internship 2025. We offer internship in AR/VR, Full stack, Agentic AI and Data science. It is free. Deadline 30 Nov 2025. Starts Dec 2. Location: Madurai. Keep answers concise.";
    const response = await generateAIResponse(aiQuery, context);
    setAiResponse(response || "I couldn't fetch an answer at the moment.");
    setIsThinking(false);
  };

  const scrollToStreams = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('streams');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleCard = (index: number) => {
    const isDesktop = window.innerWidth >= 768; // Matches Tailwind 'md' breakpoint

    setExpandedCards(prev => {
      const isCurrentlyOpen = !!prev[index];
      const newState = !isCurrentlyOpen;
      const newExpanded = { ...prev };

      if (isDesktop) {
        // Desktop: Dependent behavior (Rows: 0-1, 2-3)
        const partnerIndex = index % 2 === 0 ? index + 1 : index - 1;
        
        newExpanded[index] = newState;
        newExpanded[partnerIndex] = newState;
      } else {
        // Mobile: Independent behavior
        newExpanded[index] = newState;
      }
      return newExpanded;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-marlion-bg selection:bg-marlion-primary selection:text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-marlion-border/50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
                <div className="w-9 h-9 bg-gradient-to-br from-marlion-primary to-marlion-accent rounded-lg flex items-center justify-center shadow-lg shadow-marlion-primary/20">
                    <span className="font-mono font-bold text-white">M</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">MARLION</span>
            </div>
            <div className="flex gap-6 items-center">
                <button onClick={() => onNavigate('login')} className="text-slate-400 hover:text-white font-medium text-sm transition-colors px-2">Login</button>
                <button onClick={() => onNavigate('register')} className="bg-white text-slate-950 hover:bg-slate-200 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-white/10 transform hover:-translate-y-0.5">
                    Register Now
                </button>
            </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-marlion-primary/10 blur-[150px] rounded-full -z-10 pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-marlion-accent/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        <div className="container mx-auto text-center max-w-6xl relative z-10">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-marlion-surface/80 border border-marlion-border/50 mb-8 animate-fade-in backdrop-blur-md hover:border-marlion-primary/30 transition-colors cursor-default">
                <span className="w-2 h-2 rounded-full bg-marlion-success animate-pulse"></span>
                <span className="text-slate-300 text-xs font-bold tracking-wider uppercase">Winter Internship 2025</span>
                <span className="w-px h-3 bg-slate-700 mx-1"></span>
                <span className="text-marlion-primary text-xs font-bold">Deadline: 30 Nov</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight text-white">
                Build the Future with <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-marlion-primary via-purple-400 to-marlion-accent drop-shadow-sm">
                  Marlion Tech
                </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                A hands-on immersive experience in Madurai focused on <span className="text-white font-semibold">Assistive Tech & IEP</span> for Neurodiverse Children. 
                Master AI, XR, and Full Stack development.
            </p>
            
            <div className="flex flex-col items-center gap-12">
                <Countdown />
                
                <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
                    <button onClick={() => onNavigate('register')} className="bg-gradient-to-r from-marlion-primary to-blue-600 hover:to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 ring-1 ring-white/20">
                        Apply Now
                    </button>
                    <a href="#streams" onClick={scrollToStreams} className="glass-button text-white px-10 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 group hover:bg-white/5">
                        Explore Streams <i className="fa-solid fa-arrow-down group-hover:translate-y-1 transition-transform text-sm"></i>
                    </a>
                </div>
            </div>

            {/* CEO Message Video */}
            <div className="mt-24 max-w-5xl mx-auto relative group cursor-pointer" onClick={() => alert("Playing CEO Message...")}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-marlion-primary to-marlion-accent rounded-2xl opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative aspect-[21/9] bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 to-slate-950/80"></div>
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-500 z-10 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <i className="fa-solid fa-play text-4xl text-white ml-1 drop-shadow-lg"></i>
                    </div>
                    <p className="mt-6 text-slate-400 font-medium tracking-widest text-sm uppercase z-10">Message from the CEO</p>
                </div>
            </div>
        </div>
      </header>

      {/* Streams */}
      <section id="streams" className="py-32 px-6 container mx-auto relative">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-marlion-accent/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Choose Your Path</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Select a specialized stream to view the curriculum and prerequisites.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
            <StreamCard 
                stream={StreamType.AR_VR} 
                description="Master Unity, Unreal Engine, and WebXR to build immersive, therapeutic learning environments for children with special needs."
                icon="fa-vr-cardboard"
                isOpen={!!expandedCards[0]}
                onToggle={() => handleToggleCard(0)}
            />
            <StreamCard 
                stream={StreamType.FULL_STACK} 
                description="Build scalable, accessible Progressive Web Apps (PWAs) using React, Node.js, and cloud-native architectures."
                icon="fa-layer-group"
                isOpen={!!expandedCards[1]}
                onToggle={() => handleToggleCard(1)}
            />
            <StreamCard 
                stream={StreamType.AGENTIC_AI} 
                description="Design and deploy autonomous AI agents capable of creating personalized education plans (IEP) and adapting in real-time."
                icon="fa-robot"
                isOpen={!!expandedCards[2]}
                onToggle={() => handleToggleCard(2)}
            />
            <StreamCard 
                stream={StreamType.DATA_SCIENCE} 
                description="Leverage Machine Learning to analyze behavioral patterns and create adaptive learning models for neurodiverse interventions."
                icon="fa-brain"
                isOpen={!!expandedCards[3]}
                onToggle={() => handleToggleCard(3)}
            />
        </div>
      </section>

      {/* Ask AI */}
      <section className="py-32 bg-marlion-surface/30 border-y border-marlion-border/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-8 shadow-lg">
                <i className="fa-solid fa-wand-magic-sparkles text-3xl text-marlion-primary"></i>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Have questions? Just ask.</h2>
            <p className="text-slate-400 mb-12 text-lg">No FAQs here. Our AI agent is trained on all internship details.</p>
            
            <form onSubmit={handleAskAI} className="relative mb-10 group max-w-2xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-marlion-primary via-marlion-accent to-marlion-primary rounded-full opacity-20 group-hover:opacity-50 blur-lg transition duration-500 animate-pulse-slow"></div>
                <input 
                    type="text" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g., What is the selection criteria for Agentic AI?"
                    className="relative w-full bg-slate-950 border border-slate-700/50 rounded-full py-5 px-8 pr-20 text-white placeholder-slate-500 focus:outline-none focus:border-marlion-primary/50 focus:ring-1 focus:ring-marlion-primary/50 shadow-2xl transition-all text-lg"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 w-14 bg-marlion-primary text-white rounded-full flex items-center justify-center hover:bg-marlion-primaryHover transition-all z-10 shadow-lg hover:scale-105 active:scale-95">
                    {isThinking ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-arrow-right"></i>}
                </button>
            </form>

            {aiResponse && (
                <div className="glass-card p-8 rounded-3xl text-left animate-fade-in max-w-3xl mx-auto border border-slate-700/50">
                    <div className="flex gap-4 mb-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-marlion-primary/20 flex items-center justify-center border border-marlion-primary/30">
                            <i className="fa-solid fa-robot text-marlion-primary"></i>
                        </div>
                        <span className="font-bold text-white text-lg">AI Assistant</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-lg">{aiResponse}</p>
                </div>
            )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-20 px-6 border-t border-slate-900">
        <div className="container mx-auto grid md:grid-cols-2 gap-20 max-w-6xl">
            <div>
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-marlion-primary to-marlion-accent rounded flex items-center justify-center">
                        <span className="font-mono font-bold text-white text-xs">M</span>
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">Marlion</span>
                </div>
                <div className="space-y-6">
                    <p className="text-slate-400 flex items-center gap-4 group cursor-pointer transition-colors hover:text-white">
                        <span className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-marlion-primary group-hover:bg-marlion-primary group-hover:text-white transition-all"><i className="fa-solid fa-envelope"></i></span>
                        social@marliontech.com
                    </p>
                    <p className="text-slate-400 flex items-center gap-4 group cursor-pointer transition-colors hover:text-white">
                        <span className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-marlion-primary group-hover:bg-marlion-primary group-hover:text-white transition-all"><i className="fa-solid fa-phone"></i></span>
                        +91 94867 34438
                    </p>
                    <a href="https://www.marliontech.com/" target="_blank" rel="noreferrer" className="text-marlion-primary hover:text-white transition-colors inline-flex items-center gap-2 mt-4 font-bold group">
                        Visit Corporate Site <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </a>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-marlion-accent"></i> Office Location
                </h3>
                <p className="text-slate-400 leading-loose mb-8 text-lg">
                    A-34, Kumarasamy Street,<br/>
                    (Opp to Anusha Vidhyalaya matriculation school),<br/>
                    Thirunagar 7th Stop, Madurai 625006.
                </p>
                <a href="https://maps.app.goo.gl/hKZZX8qByEnqpQqF9" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl border border-slate-800 transition-colors font-bold group">
                    <i className="fa-solid fa-map-location-dot text-marlion-primary group-hover:text-white transition-colors"></i> Open in Google Maps
                </a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;