import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateAIResponse, evaluateInterview } from '../services/gemini';
import { ApplicationStatus, ChatMessage } from '../types';

interface Props {
  onNavigate: (page: string) => void;
}

const AIInterview: React.FC<Props> = ({ onNavigate }) => {
  const { currentUser, updateStudentStatus, banStudent } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0 && currentUser) {
        const greeting = `Welcome ${currentUser.name}. I am the AI evaluator for the ${currentUser.stream} stream. I'm not here to quiz you. I want to understand your vision. To begin, please describe the project idea or problem statement you wish to solve during this internship.`;
        setMessages([{ role: 'model', text: greeting, timestamp: Date.now() }]);
        speak(greeting);
    }
  }, [currentUser, messages.length]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
        setIsRecording(true);
        // Simulate listening interaction for demo
        setTimeout(() => {
            setIsRecording(false);
            setInputText("I want to build an AR app for teaching geometry to kids.");
        }, 2000);
    } else {
        setIsRecording(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (currentUser) {
        banStudent(currentUser.id);
        alert("Copying and pasting is strictly prohibited. Your account has been banned.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);
    
    const newProgress = progress + 20;
    
    // Early exit if completed
    if (newProgress >= 100) {
       finishInterview([...messages, userMsg]);
       return;
    }
    
    setProgress(newProgress);

    const history = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    
    const systemInstruction = `
        You are an empathetic but strict interviewer for Marlion Technologies. 
        Stream: ${currentUser?.stream}.
        
        YOUR GOAL: Extract the student's project idea, vision, inspiration, and assess their passion and past attempts (technical or non-technical).
        
        STRICT RULES:
        1. DO NOT ask technical quiz questions. Instead ask: "How did you try to solve this?", "What technologies do you plan to use?".
        2. DO NOT give suggestions or improve their idea.
        3. IF the student copies/pastes, goes completely off-topic, or redirects the question to you, START response with "BAN_USER".
        4. IF the student says nothing relevant or gibberish, START response with "END_SESSION".
        5. Compliment good ideas briefly. Tell them to "try harder" if the idea is weak.
        6. Maintain balanced expectations for a college student.
        7. DO NOT decide the outcome. End with "We will get back to you" ONLY when the interview is over.
        8. Keep responses short.
    `;

    const context = `
        Conversation History:
        ${history}
        
        User just said: "${userMsg.text}"
        
        Respond as the interviewer.
    `;

    const responseText = await generateAIResponse(context, systemInstruction);
    
    if (responseText.includes("BAN_USER")) {
        if(currentUser) banStudent(currentUser.id);
        alert("Interview terminated due to policy violation.");
        return;
    }

    if (responseText.includes("END_SESSION")) {
        finishInterview([...messages, userMsg]);
        return;
    }

    setIsProcessing(false);
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    speak(responseText);
  };

  const finishInterview = async (fullTranscript: ChatMessage[]) => {
    setIsProcessing(true);
    // Explicit requirement: Tell students to check back in 24 hours
    const finalText = "Your responses have been submitted. Please check back in 24 hours to download your offer letter if selected.";
    setMessages(prev => [...prev, { role: 'model', text: finalText, timestamp: Date.now() }]);
    speak(finalText);

    // Calculate internal score but do not show it to user yet.
    const transcriptText = fullTranscript.map(m => `${m.role}: ${m.text}`).join('\n');
    const evaluation = await evaluateInterview(transcriptText);

    setTimeout(() => {
        if (currentUser) {
            updateStudentStatus(currentUser.id, ApplicationStatus.INTERVIEW_COMPLETED, {
                interviewScore: evaluation.score,
                interviewSummary: evaluation.summary,
                interviewTranscript: fullTranscript
            });
        }
        setIsProcessing(false);
        onNavigate('status');
    }, 5000);
  };

  // --- DEV HELPERS ---
  const handleDevSelect = () => {
      if(currentUser) {
          updateStudentStatus(currentUser.id, ApplicationStatus.OFFER_RELEASED);
          onNavigate('status');
      }
  };

  const handleDevReject = () => {
      if(currentUser) {
          updateStudentStatus(currentUser.id, ApplicationStatus.REJECTED);
          onNavigate('status');
      }
  };

  return (
    <div className="min-h-screen bg-marlion-bg flex flex-col font-sans relative">
      {/* DEV CONTROLS */}
      <div className="fixed top-24 right-4 flex flex-col gap-3 z-50 group opacity-40 hover:opacity-100 transition-opacity">
          <div className="text-[10px] text-slate-500 font-bold uppercase text-right bg-black/50 p-1 rounded backdrop-blur-sm">Dev Mode</div>
          <button 
            onClick={handleDevSelect} 
            className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center border border-white/20 transition-all transform hover:scale-110 active:scale-95" 
            title="Force Select Candidate">
              <i className="fa-solid fa-check"></i>
          </button>
          <button 
            onClick={handleDevReject} 
            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center border border-white/20 transition-all transform hover:scale-110 active:scale-95" 
            title="Force Reject Candidate">
              <i className="fa-solid fa-xmark"></i>
          </button>
      </div>

      <div className="glass border-b border-marlion-border/50 p-4 flex justify-between items-center z-10 backdrop-blur-md">
         <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-gradient-to-br from-marlion-primary to-marlion-accent rounded-xl flex items-center justify-center shadow-lg">
                 <i className="fa-solid fa-robot text-white text-sm"></i>
             </div>
             <div>
                 <h3 className="font-bold text-white text-sm tracking-wide">AI Interviewer</h3>
                 <p className="text-xs text-slate-400">Assessing vision for <span className="text-marlion-primary font-bold">{currentUser?.stream}</span></p>
             </div>
         </div>
         <div className="flex flex-col items-end gap-1.5">
             <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Session Progress</span>
             <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                 <div className="h-full bg-gradient-to-r from-marlion-primary to-marlion-accent transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{width: `${progress}%`}}></div>
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-3xl shadow-xl backdrop-blur-md border ${
                    msg.role === 'user' 
                    ? 'bg-marlion-primary text-white rounded-tr-none border-blue-400/30' 
                    : 'bg-slate-900/90 text-slate-100 rounded-tl-none border-slate-700/50'
                }`}>
                    <p className="leading-relaxed text-md">{msg.text}</p>
                </div>
            </div>
        ))}
        {isProcessing && (
            <div className="flex justify-start animate-fade-in">
                <div className="bg-slate-900/90 p-6 rounded-3xl rounded-tl-none border border-slate-700/50 flex gap-3 items-center shadow-xl">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Evaluating Vision</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-marlion-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-marlion-primary rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-marlion-primary rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="glass border-t border-marlion-border/50 p-6 pb-8">
        <div className="max-w-4xl mx-auto flex gap-4 items-end">
            <button 
                onClick={toggleRecording}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all shadow-lg ${
                    isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/40' 
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}>
                <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
            <div className="flex-1 relative">
                <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    onPaste={handlePaste}
                    placeholder="Type your answer here..."
                    rows={1}
                    className="w-full min-h-[3.5rem] max-h-32 bg-slate-950/80 border border-slate-700 rounded-2xl py-4 px-6 text-white placeholder-slate-500 focus:outline-none focus:border-marlion-primary focus:ring-1 focus:ring-marlion-primary transition-all shadow-inner resize-none"
                />
            </div>
            <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isProcessing}
                className="bg-gradient-to-r from-marlion-primary to-marlion-accent text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-marlion-primary/20 transition-all transform active:scale-95">
                <i className="fa-solid fa-paper-plane"></i>
            </button>
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-4 opacity-60 flex justify-center items-center gap-2">
            <i className="fa-solid fa-shield-halved text-marlion-primary"></i> 
            <span>Anti-cheat System Active. Copy-paste is disabled.</span>
        </p>
      </div>
    </div>
  );
};

export default AIInterview;