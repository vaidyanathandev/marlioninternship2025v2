import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole, ApplicationStatus } from './types';
import Home from './pages/Home';
import Register from './pages/Register';
import AIInterview from './pages/AIInterview';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const AppContent: React.FC = () => {
  console.log('updated');
  const { role, currentUser, login, updateStudentStatus, logout } = useApp();
  const [currentPage, setCurrentPage] = useState('home');
  const [email, setEmail] = useState('');

  // Basic hash routing simulation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash === 'admin') {
        if(role !== UserRole.ADMIN) login('admin@marlion.com', UserRole.ADMIN); 
        setCurrentPage('admin');
      } else if (hash === 'dashboard') {
         setCurrentPage('dashboard');
      } else if (hash === 'status') {
         setCurrentPage('status');
      } else if (hash === '') {
          setCurrentPage('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [login, role]);

  // Check status for routing
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.location.hash = `/${page}`;
  };

  const handleAcceptOffer = () => {
      if (currentUser) {
          updateStudentStatus(currentUser.id, ApplicationStatus.OFFER_ACCEPTED);
          // In a real app, this would trigger a download.
          const link = document.createElement('a');
          link.href = 'data:text/plain;charset=utf-8,Marlion%20Offer%20Letter%20Content:%20Congratulations,%20you%20are%20hired!';
          link.download = 'Marlion_Offer_Letter.txt';
          link.click();
          
          setTimeout(() => {
             updateStudentStatus(currentUser.id, ApplicationStatus.IN_PROGRESS);
             handleNavigate('dashboard');
          }, 1500);
      }
  };

  const handleBackToHome = () => {
      logout();
      handleNavigate('home');
  };

  const StatusPage = () => (
      <div className="min-h-screen bg-marlion-dark flex items-center justify-center p-6">
          <div className="bg-slate-900 p-8 rounded-xl text-center border border-slate-800 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-white">Application Status</h2>
              <div className="text-xl mb-6 text-marlion-primary font-bold uppercase tracking-wide">
                  {currentUser?.status.replace('_', ' ')}
              </div>
              
              {currentUser?.status === ApplicationStatus.OFFER_RELEASED && (
                  <div className="animate-fade-in">
                      <p className="mb-6 text-slate-300">Congratulations! You have been selected for the Marlion Winter Internship 2025.</p>
                      <div className="bg-slate-800 p-5 rounded-xl mb-6 text-left text-sm border border-slate-700 max-h-48 overflow-y-auto">
                          <h4 className="font-bold mb-2 text-white">Rules & Best Practices:</h4>
                          <ul className="list-disc list-inside text-slate-400 space-y-2">
                             <li>Dedicate at least 30 hours per week.</li>
                             <li>Maintain professional conduct in community chats.</li>
                             <li>Adhere to the NDA regarding client projects.</li>
                             <li>Attend all scheduled sync-ups.</li>
                             <li>Submit daily progress logs via the dashboard.</li>
                          </ul>
                      </div>
                      <button onClick={handleAcceptOffer} className="w-full bg-marlion-primary text-white py-4 rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-transform hover:-translate-y-1">
                          <i className="fa-solid fa-file-signature mr-2"></i> I Agree & Download Offer
                      </button>
                  </div>
              )}

               {currentUser?.status === ApplicationStatus.REJECTED && (
                  <div className="animate-fade-in">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                          <i className="fa-regular fa-face-frown text-4xl text-slate-500"></i>
                      </div>
                      <p className="mb-6 text-slate-300 leading-relaxed">We appreciate your interest and passion. Unfortunately, we cannot move forward with your application at this time. We verify our selection criteria rigorously.</p>
                      <button onClick={handleBackToHome} className="text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">Back to Home</button>
                  </div>
              )}

              {(currentUser?.status === ApplicationStatus.INTERVIEW_PENDING || currentUser?.status === ApplicationStatus.INTERVIEW_COMPLETED) && (
                  <div className="animate-fade-in">
                       <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                           <i className="fa-solid fa-hourglass-half text-4xl text-yellow-500 animate-pulse"></i>
                       </div>
                       <p className="mb-2 text-slate-300 font-bold">Application Under Review</p>
                       <p className="mb-6 text-slate-400 text-sm leading-relaxed">Your AI interview responses have been submitted. Our team is reviewing your profile. Please check back in 24 hours.</p>
                       <button onClick={() => window.location.reload()} className="text-sm text-marlion-primary border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Refresh Status</button>
                  </div>
              )}
          </div>
      </div>
  );

  // Login view
  if (currentPage === 'login') {
      return (
          <div className="min-h-screen bg-marlion-dark flex items-center justify-center">
              <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-sm shadow-2xl">
                  <div className="text-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-marlion-primary to-marlion-accent rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                         <span className="font-mono font-bold text-white text-xl">M</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                  </div>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      if(email.trim() === 'admin@marlion.com') {
                          if(login(email, UserRole.ADMIN)) {
                              handleNavigate('admin');
                          }
                      } else {
                          if(login(email, UserRole.STUDENT)) {
                              handleNavigate('dashboard');
                          }
                      }
                  }}>
                      <div className="mb-6">
                          <label className="block text-sm text-slate-400 mb-2 font-bold uppercase tracking-wide">Email Address</label>
                          <input 
                              type="email" 
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none transition-all"
                              placeholder="Enter your registered email"
                              required
                          />
                      </div>
                      <button type="submit" className="w-full bg-marlion-primary text-white p-4 rounded-xl font-bold hover:bg-blue-600 mb-6 transition-all shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5">Login to Portal</button>
                  </form>
                  
                  <div className="text-xs text-slate-500 border-t border-slate-800 pt-6">
                       <p className="font-bold mb-2 text-slate-400">Click to Auto-fill Demo Credentials:</p>
                       <div className="space-y-1">
                           <button onClick={() => setEmail('admin@marlion.com')} className="block w-full text-left hover:text-white hover:bg-slate-800 p-1 rounded transition-colors">
                               Admin: <span className="text-marlion-primary">admin@marlion.com</span>
                           </button>
                           <button onClick={() => setEmail('alice@example.com')} className="block w-full text-left hover:text-white hover:bg-slate-800 p-1 rounded transition-colors">
                               Student (Dashboard): <span className="text-marlion-primary">alice@example.com</span>
                           </button>
                            <button onClick={() => setEmail('bob@example.com')} className="block w-full text-left hover:text-white hover:bg-slate-800 p-1 rounded transition-colors">
                               Student (Status): <span className="text-marlion-primary">bob@example.com</span>
                           </button>
                           <button onClick={() => setEmail('charlie@example.com')} className="block w-full text-left hover:text-white hover:bg-slate-800 p-1 rounded transition-colors">
                               Student (Interview): <span className="text-marlion-primary">charlie@example.com</span>
                           </button>
                       </div>
                  </div>
                  <button onClick={() => handleNavigate('home')} className="w-full text-slate-400 text-sm mt-6 hover:text-white transition-colors">Back to Home</button>
              </div>
          </div>
      )
  }

  if (role === UserRole.ADMIN || currentPage === 'admin') {
      return <Admin />;
  }

  if (currentPage === 'register') return <Register onNavigate={handleNavigate} />;
  
  if (role === UserRole.STUDENT) {
     if (currentUser?.banned) return <Dashboard onNavigate={handleNavigate} />;

     if (currentUser?.status === ApplicationStatus.INTERVIEW_PENDING) {
         return <AIInterview onNavigate={handleNavigate} />;
     }

     if (currentPage === 'status' || 
         currentUser?.status === ApplicationStatus.INTERVIEW_COMPLETED || 
         currentUser?.status === ApplicationStatus.REJECTED || 
         currentUser?.status === ApplicationStatus.OFFER_RELEASED) {
         return <StatusPage />;
     }

     if (currentUser?.status === ApplicationStatus.IN_PROGRESS || 
         currentUser?.status === ApplicationStatus.OFFER_ACCEPTED ||
         currentUser?.status === ApplicationStatus.COMPLETED) {
         return <Dashboard onNavigate={handleNavigate} />;
     }
  }

  return <Home onNavigate={handleNavigate} />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;