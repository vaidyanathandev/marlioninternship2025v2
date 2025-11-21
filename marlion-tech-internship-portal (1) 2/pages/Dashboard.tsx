
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KanbanTask, DailyLog, ProposalStatus } from '../types';
import { getCourseContextHelp } from '../services/gemini';

interface Props {
  onNavigate: (page: string) => void;
}

// Mock Course Data
const COURSE_CONTENT = [
    {
        title: "Section 1: Introduction",
        lessons: [
            { id: 'l1', title: "Welcome to the Course", duration: "2:30", type: 'video', completed: true },
            { id: 'l2', title: "Setting up Environment", duration: "15:00", type: 'video', completed: true },
            { id: 'l3', title: "React Ecosystem", duration: "10:45", type: 'video', completed: false },
        ]
    },
    {
        title: "Section 2: Core Concepts",
        lessons: [
            { id: 'l4', title: "JSX Deep Dive", duration: "12:20", type: 'video', completed: false, locked: true },
            { id: 'l5', title: "Props & State", duration: "20:10", type: 'video', completed: false, locked: true },
            { id: 'l6', title: "Handling Events", duration: "18:00", type: 'video', completed: false, locked: true },
        ]
    },
    {
        title: "Section 3: Advanced Hooks",
        lessons: [
            { id: 'l7', title: "useEffect Mastery", duration: "25:00", type: 'video', completed: false, locked: true },
            { id: 'l8', title: "useContext & Reducers", duration: "30:00", type: 'video', completed: false, locked: true },
        ]
    }
];

const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  const { currentUser, banStudent, updateStudentStatus, addLog, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'bootcamp' | 'problem' | 'tracker' | 'help'>('bootcamp');
  const [tasks, setTasks] = useState<KanbanTask[]>([
      { id: '1', title: 'Setup Environment', status: 'DONE', description: 'Install Node.js, VS Code' },
      { id: '2', title: 'Complete Module 1', status: 'IN_PROGRESS', description: 'Watch React Basics' },
      { id: '3', title: 'Submit Proposal', status: 'TODO', description: 'Draft problem statement' },
  ]);
  
  const [newLog, setNewLog] = useState('');
  const [aiContextChat, setAiContextChat] = useState<{role:string, text:string}[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [bootcampAnswer, setBootcampAnswer] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sidebar Accordion State
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleAskContextAI = async () => {
      if(!aiChatInput) return;
      const newMsgs = [...aiContextChat, {role:'user', text: aiChatInput}];
      setAiContextChat(newMsgs);
      setAiChatInput('');
      const response = await getCourseContextHelp("React Hooks and State Management", aiChatInput);
      setAiContextChat([...newMsgs, {role: 'model', text: response}]);
  };

  const handleDrop = (e: React.DragEvent, status: KanbanTask['status']) => {
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      if (currentUser) {
          banStudent(currentUser.id);
          alert("We would rather work with the AI directly than collaborating with a human who would mindlessly copy paste AI generated responses. You have been banned.");
      }
  };

  const handleSubmitProposal = () => {
      if (currentUser && proposalText.trim()) {
          updateStudentStatus(currentUser.id, currentUser.status, {
              proposalStatus: ProposalStatus.PENDING,
              proposalText: proposalText
          });
          alert("Proposal submitted. Please check back in 24 hours for approval.");
      }
  };

  const handleAddLog = () => {
      if (currentUser && newLog.trim()) {
          const log: DailyLog = {
              id: Date.now().toString(),
              date: new Date().toLocaleDateString(),
              content: newLog
          };
          addLog(currentUser.id, log);
          setNewLog('');
      }
  }

  if (currentUser?.banned) {
      return (
          <div className="min-h-screen bg-red-950/20 flex items-center justify-center p-6 font-sans">
              <div className="bg-slate-900 p-10 rounded-3xl border border-red-500/50 text-center max-w-md shadow-2xl shadow-red-900/30">
                  <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                     <i className="fa-solid fa-ban text-5xl text-red-500"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Account Suspended</h2>
                  <p className="text-slate-400 mb-8">Your account has been flagged for violating our academic integrity policy (Copy/Paste or Malfeasance detected).</p>
                  <button className="text-sm text-red-400 underline hover:text-white transition-colors">Submit an Appeal</button>
              </div>
          </div>
      )
  }

  return (
    <div className="h-screen flex bg-marlion-bg text-slate-200 font-sans overflow-hidden">
      
      {/* MOBILE HEADER (Sticky) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-marlion-primary rounded flex items-center justify-center"><span className="font-mono font-bold text-white text-xs">M</span></div>
             <span className="font-bold text-lg text-white">Marlion LMS</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
             <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
         </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR (Fixed/Sticky logic via Flexbox + Overflow) */}
      <aside className={`
            fixed md:relative inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            md:flex h-full pt-16 md:pt-0 shadow-2xl md:shadow-none
      `}>
        <div className="p-8 border-b border-slate-800 hidden md:block">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-marlion-primary rounded flex items-center justify-center"><span className="font-mono font-bold text-white text-xs">M</span></div>
                <h2 className="font-bold text-xl text-white tracking-tight">Marlion LMS</h2>
            </div>
            <p className="text-xs text-slate-500 truncate pl-8">{currentUser?.name}</p>
        </div>
        
        {/* Mobile User Info in Sidebar */}
        <div className="p-6 border-b border-slate-800 md:hidden bg-slate-950/30">
             <p className="text-sm font-bold text-white">{currentUser?.name}</p>
             <p className="text-xs text-slate-500">{currentUser?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {[
                { id: 'bootcamp', icon: 'fa-graduation-cap', label: 'Bootcamp Kit' },
                { id: 'problem', icon: 'fa-file-code', label: 'Problem Statement' },
                { id: 'tracker', icon: 'fa-list-check', label: 'Project Tracker' },
                { id: 'help', icon: 'fa-headset', label: 'AI Help Desk' },
            ].map(item => (
                <div key={item.id}>
                    <button 
                        onClick={() => { 
                            setActiveTab(item.id as any);
                            if(window.innerWidth < 768) setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-marlion-primary text-white shadow-lg shadow-marlion-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                        <span className="font-medium">{item.label}</span>
                    </button>

                    {/* Sub-menu for Bootcamp Kit */}
                    {item.id === 'bootcamp' && activeTab === 'bootcamp' && (
                        <div className="mt-2 ml-4 pl-4 border-l border-slate-800 space-y-1 animate-fade-in">
                            {COURSE_CONTENT.map((section, idx) => (
                                <div key={idx} className="mb-2">
                                    <button 
                                        onClick={() => toggleSection(idx)}
                                        className="w-full flex justify-between items-center text-xs font-bold text-slate-500 hover:text-white py-2 pr-2 group transition-colors"
                                    >
                                        <span className="truncate">{section.title.split(':')[1] || section.title}</span>
                                        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${expandedSections.includes(idx) ? 'rotate-180 text-marlion-primary' : ''}`}></i>
                                    </button>
                                    {expandedSections.includes(idx) && (
                                        <div className="space-y-1 ml-1">
                                            {section.lessons.map(lesson => (
                                                <div key={lesson.id} className={`text-[11px] py-1.5 px-2 rounded cursor-pointer flex items-center gap-2 hover:bg-slate-800/50 transition-colors ${lesson.completed ? 'text-slate-400' : 'text-slate-300'}`}>
                                                    {lesson.completed ? <i className="fa-solid fa-check text-green-500 text-[10px]"></i> : 
                                                     lesson.locked ? <i className="fa-solid fa-lock text-slate-600 text-[10px]"></i> :
                                                     <i className="fa-regular fa-circle-play text-marlion-primary text-[10px]"></i>}
                                                    <span className="truncate">{lesson.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
        <div className="p-6 border-t border-slate-800 bg-slate-950/30">
            <div className="flex justify-between text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">
                <span>Certificate Progress</span>
                <span className="text-marlion-primary">{currentUser?.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-gradient-to-r from-marlion-primary to-marlion-success h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{width: `${currentUser?.progress}%`}}></div>
            </div>
            {currentUser?.progress === 100 && (
                 <button className="w-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 py-2.5 rounded-xl text-sm font-bold animate-pulse hover:bg-yellow-500/20 transition-colors shadow-lg shadow-yellow-500/10">Download Certificate</button>
            )}
             <button onClick={() => { logout(); onNavigate('login'); }} className="w-full text-left text-red-400 text-sm hover:text-red-300 mt-4 transition-colors flex items-center gap-2 pl-1">
                <i className="fa-solid fa-sign-out-alt"></i> Logout
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA - Scrolls Independently */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full mt-16 md:mt-0">
        
        {activeTab === 'bootcamp' && (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Module 1: React Fundamentals</h2>
                    <span className="w-fit text-xs bg-marlion-primary/10 text-marlion-primary border border-marlion-primary/30 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Required</span>
                </div>
                
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center z-10 shadow-xl group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-play text-2xl md:text-4xl text-white ml-1"></i>
                    </div>
                    <span className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white font-bold text-sm md:text-lg z-10">Introduction to Hooks</span>
                </div>

                {/* Ask AI Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-marlion-primary/20 rounded-lg flex items-center justify-center text-marlion-primary border border-marlion-primary/30">
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">AI Course Tutor</h3>
                            <p className="text-xs text-slate-400">Ask specific questions about the current video lecture.</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-950/50 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto custom-scrollbar border border-slate-800/50">
                        {aiContextChat.length === 0 && (
                            <div className="text-slate-600 text-sm italic text-center py-4">
                                No questions yet. Ask something like "Why use useEffect?"
                            </div>
                        )}
                        {aiContextChat.map((m, i) => (
                            <div key={i} className={`text-sm mb-2 p-3 rounded-xl leading-relaxed ${m.role==='user' ? 'bg-marlion-primary/20 text-white ml-8 border border-marlion-primary/20' : 'bg-slate-800/50 text-slate-300 mr-8 border border-slate-700/50'}`}>
                                <span className="font-bold text-xs opacity-50 block mb-1 uppercase">{m.role === 'user' ? 'You' : 'AI'}</span>
                                {m.text}
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex gap-3 flex-col md:flex-row">
                        <input 
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-marlion-primary transition-all" 
                            value={aiChatInput} 
                            onChange={e=>setAiChatInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleAskContextAI()}
                            placeholder="Ask a context-aware question..." 
                        />
                        <button onClick={handleAskContextAI} className="bg-marlion-primary hover:bg-blue-600 text-white px-5 py-3 rounded-xl transition-colors font-bold text-sm shadow-lg shadow-blue-500/20">
                            <i className="fa-solid fa-paper-plane mr-2"></i> Ask
                        </button>
                    </div>
                </div>

                {/* Knowledge Check */}
                <div className="glass-card p-6 md:p-8 rounded-2xl">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-3 text-lg"><i className="fa-solid fa-clipboard-question text-marlion-accent"></i> Knowledge Check</h3>
                    <p className="text-slate-400 mb-4 leading-relaxed text-sm">Explain 'useEffect' in your own words. <span className="text-red-400 text-[10px] font-bold ml-2 border border-red-400/30 px-2 py-0.5 rounded inline-block mt-1 md:mt-0">NO COPY PASTE</span></p>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-5 mb-4 text-white focus:border-marlion-primary focus:ring-1 focus:ring-marlion-primary outline-none transition-all shadow-inner" 
                        placeholder="Type your answer here..."
                        rows={3}
                        value={bootcampAnswer}
                        onChange={e => setBootcampAnswer(e.target.value)}
                        onPaste={handlePaste}
                    ></textarea>
                    <button className="w-full md:w-auto bg-slate-800 text-white border border-slate-700 px-8 py-3 rounded-xl text-sm font-bold hover:bg-marlion-primary hover:border-marlion-primary transition-all">Submit Answer</button>
                </div>
            </div>
        )}

        {activeTab === 'tracker' && (
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Project Tracker</h2>
                <div className="flex flex-col md:grid md:grid-cols-4 gap-6 h-auto md:h-[650px]">
                    {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(status => (
                        <div 
                            key={status} 
                            className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex flex-col gap-4"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, status as any)}
                        >
                            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between px-2">
                                {status.replace('_', ' ')}
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{tasks.filter(t => t.status === status).length}</span>
                            </h3>
                            {tasks.filter(t => t.status === status).map(task => (
                                <div 
                                    key={task.id} 
                                    draggable 
                                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                                    className="bg-slate-900 p-5 rounded-xl border border-slate-800 cursor-grab active:cursor-grabbing hover:border-marlion-primary/50 hover:shadow-lg hover:shadow-marlion-primary/10 transition-all group"
                                >
                                    <div className="font-bold text-sm text-white group-hover:text-marlion-primary transition-colors">{task.title}</div>
                                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">{task.description}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                
                <div className="mt-12">
                    <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2"><i className="fa-solid fa-book-journal-whills text-marlion-accent"></i> Daily Journal</h3>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-6 shadow-xl">
                         <textarea 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 text-white focus:border-marlion-primary focus:outline-none"
                            placeholder="What did you achieve today? Include GitHub links."
                            value={newLog}
                            onChange={e => setNewLog(e.target.value)}
                         />
                         <button 
                            onClick={handleAddLog}
                            className="bg-marlion-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 w-full md:w-auto">Log Entry</button>
                    </div>
                    <div className="space-y-3">
                        {currentUser?.logs?.map(log => (
                            <div key={log.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-sm flex flex-col md:flex-row gap-2 md:gap-4 items-start hover:border-slate-700 transition-colors">
                                <span className="text-marlion-primary font-mono text-xs font-bold py-1.5 px-2.5 bg-marlion-primary/10 rounded-lg border border-marlion-primary/20 h-fit whitespace-nowrap">{log.date}</span>
                                <span className="text-slate-300 leading-relaxed pt-1">{log.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'problem' && (
            <div className="glass-card p-6 md:p-10 rounded-3xl max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Problem Statement</h2>
                {currentUser?.proposalStatus === ProposalStatus.NOT_SUBMITTED && (
                    <>
                        <p className="text-slate-400 mb-10 text-base md:text-lg">You can choose the default project curated for your stream or submit your own innovative proposal.</p>
                        <div className="border border-slate-700 bg-slate-900/50 p-6 md:p-8 rounded-2xl mb-10 hover:border-marlion-primary transition-all cursor-pointer group shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2">
                                <h3 className="font-bold text-lg md:text-xl text-white group-hover:text-marlion-primary transition-colors">Default Project: Emotion Recognition for Autism</h3>
                                <span className="text-xs bg-marlion-primary/10 text-marlion-primary px-3 py-1 rounded-full border border-marlion-primary/20 font-bold uppercase tracking-wide">Recommended</span>
                            </div>
                            <p className="text-slate-400 mb-6 text-sm leading-loose">Create an AI-agent that helps autistic children identify emotions from facial expressions using Tensorflow.js and WebCam. The app should be gamified and provide real-time feedback.</p>
                            <button className="w-full md:w-auto bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-marlion-primary hover:text-white transition-all">Select This Project</button>
                        </div>
                        
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                            <div className="relative flex justify-center"><span className="px-6 bg-marlion-surface text-slate-500 text-sm font-bold uppercase tracking-widest">OR</span></div>
                        </div>

                        <div className="mt-10">
                            <h3 className="font-bold text-xl mb-6 text-white">Submit Your Own Proposal</h3>
                            <textarea 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-6 text-white focus:border-marlion-primary focus:outline-none transition-all shadow-inner" 
                                rows={5}
                                placeholder="Describe your idea in a nutshell..."
                                value={proposalText}
                                onChange={e => setProposalText(e.target.value)}
                            ></textarea>
                            <div className="flex flex-col md:flex-row gap-5">
                                <button className="border border-dashed border-slate-700 flex-1 h-14 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:border-slate-500 text-slate-500 hover:text-white transition-all font-bold">
                                    <i className="fa-solid fa-upload mr-2"></i> Upload PDF
                                </button>
                                <button onClick={handleSubmitProposal} className="bg-marlion-primary px-10 py-4 md:py-0 rounded-xl text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all">Submit Proposal</button>
                            </div>
                        </div>
                    </>
                )}
                {currentUser?.proposalStatus === ProposalStatus.PENDING && (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
                            <i className="fa-solid fa-clock text-5xl text-yellow-500 animate-pulse-slow"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Proposal Under Review</h3>
                        <p className="text-slate-400 text-lg">Our mentors are reviewing your submission. Please check back in 24 hours.</p>
                    </div>
                )}
                 {currentUser?.proposalStatus === ProposalStatus.APPROVED && (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                            <i className="fa-solid fa-check-circle text-5xl text-green-500"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Proposal Approved!</h3>
                        <p className="text-slate-400 text-lg">You may now proceed to the Project Tracker and start building.</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'help' && (
             <div className="glass-card p-8 md:p-16 rounded-3xl text-center max-w-3xl mx-auto mt-8">
                 <div className="w-20 h-20 bg-marlion-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-marlion-primary/20">
                    <i className="fa-solid fa-headset text-4xl text-marlion-primary"></i>
                 </div>
                 <h2 className="text-3xl font-bold mb-4 text-white">AI Help Desk</h2>
                 <p className="text-slate-400 mb-10 text-lg leading-relaxed">Describe your technical blocker, bug, or general feedback. Our AI agents will try to assist immediately, or escalate to a human mentor.</p>
                 <textarea className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 text-white focus:border-marlion-primary focus:outline-none shadow-inner" rows={6} placeholder="I am stuck with..."></textarea>
                 <button className="w-full md:w-auto bg-marlion-primary px-10 py-4 rounded-xl text-white font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-1">Submit Ticket</button>
             </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
