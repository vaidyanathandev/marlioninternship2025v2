import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StreamType } from '../types';

interface Props {
  onNavigate: (page: string) => void;
}

const COLLEGES = [
  'Thiagarajar college of engineering',
  'Kamaraj college of engineering',
  'SRM Madurai college of engineering and technology',
  'Anna university regional campus (Ramanathapuram)',
  'Other'
];

const Register: React.FC<Props> = ({ onNavigate }) => {
  const { registerStudent } = useApp();
  const [step, setStep] = useState(1);
  const [dateError, setDateError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: '',
    college: '',
    otherCollege: '',
    year: '1',
    department: '',
    registerNumber: '',
    idProofLink: '',
    stream: StreamType.FULL_STACK,
    startDate: '',
    endDate: '',
    requests: ''
  });

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`OTP sent to ${formData.email}`);
    setStep(2);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept any 4 chars for demo
    if (formData.otp.length >= 4) {
      setStep(3);
    } else {
      alert("Please enter the 4-digit OTP.");
    }
  };

  const validateDates = (start: string, end: string) => {
      if(!start || !end) {
          setDateError(null);
          return true; 
      }
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Normalize to midnight for accurate day calculation
      startDate.setHours(0,0,0,0);
      endDate.setHours(0,0,0,0);

      // Range Check (Dec 2025 - Feb 2026)
      const minDate = new Date('2025-12-01');
      minDate.setHours(0,0,0,0);
      
      const maxDate = new Date('2026-02-28');
      maxDate.setHours(0,0,0,0);
      
      if (startDate < minDate || startDate > maxDate) {
          setDateError("Start date must be between Dec 1, 2025 and Feb 28, 2026.");
          return false;
      }
      if (endDate < minDate || endDate > maxDate) {
          setDateError("End date must be between Dec 1, 2025 and Feb 28, 2026.");
          return false;
      }

      // Start strictly before End check
      if (startDate.getTime() >= endDate.getTime()) {
          setDateError("Start date must be strictly before the end date.");
          return false;
      }

      // Duration Check (14 days)
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays < 14) {
          setDateError(`Selected duration is ${diffDays} days. Internship duration must be at least 2 weeks (14 days).`);
          return false;
      }
      
      setDateError(null);
      return true;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      validateDates(newData.startDate, newData.endDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates(formData.startDate, formData.endDate)) {
        return; // Stop submission if invalid
    }

    const finalCollege = formData.college === 'Other' ? formData.otherCollege : formData.college;
    registerStudent({
        ...formData,
        college: finalCollege
    });
    onNavigate('interview');
  };

  return (
    <div className="min-h-screen bg-marlion-bg flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-marlion-primary/10 via-marlion-bg to-marlion-bg pointer-events-none"></div>
      
      <div className="max-w-2xl w-full glass-card rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 animate-fade-in border border-white/5">
        <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Student Registration</h2>
            <div className="flex items-center gap-4 text-sm">
                <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-marlion-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}></div>
                <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-marlion-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}></div>
                <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-marlion-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}></div>
            </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-5">
                <button type="button" className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">
                    <i className="fa-brands fa-google text-red-500"></i> Sign up with Google
                </button>
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-bold tracking-widest">Or continue with email</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>
                <div>
                    <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Full Name</label>
                    <input required type="text" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary focus:ring-1 focus:ring-marlion-primary outline-none transition-all" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Email Address</label>
                    <input required type="email" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary focus:ring-1 focus:ring-marlion-primary outline-none transition-all" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-marlion-primary to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">Next Step &rarr;</button>
          </form>
        )}

        {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-8 text-center">
                <div className="animate-fade-in">
                    <div className="w-20 h-20 bg-marlion-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <i className="fa-solid fa-envelope-open-text text-3xl text-marlion-primary"></i>
                    </div>
                    <label className="block text-sm font-medium mb-6 text-slate-400">Enter the 4-digit code sent to <br/><span className="text-white font-bold text-lg">{formData.email}</span></label>
                    <input type="text" className="w-full max-w-[240px] bg-slate-950 border border-slate-700 rounded-2xl p-5 text-center text-4xl tracking-[0.5em] text-white focus:border-marlion-primary focus:ring-1 focus:ring-marlion-primary outline-none font-mono shadow-inner" 
                        maxLength={4}
                        autoFocus
                        placeholder="0000"
                        value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-marlion-success to-green-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5">Verify OTP</button>
            </form>
        )}

        {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">College</label>
                        <select required className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                            value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})}>
                            <option value="">Select College</option>
                            {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    {formData.college === 'Other' && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Enter College Name</label>
                            <input required type="text" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                                value={formData.otherCollege} onChange={e => setFormData({...formData, otherCollege: e.target.value})} />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Year of Study</label>
                        <select required className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                            value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Department</label>
                        <input required type="text" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                            value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Register Number</label>
                        <input required type="text" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                            value={formData.registerNumber} 
                            onChange={e => {
                                // Only allow alphabets and numbers, convert to uppercase
                                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                setFormData({...formData, registerNumber: val});
                            }} 
                            placeholder="e.g., 917719C045"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">College ID Proof</label>
                        <div className="relative">
                             <input 
                                required 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-slate-300 focus:border-marlion-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-marlion-primary file:text-white hover:file:bg-blue-600 transition-all cursor-pointer"
                                onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const fileType = file.name.split('.').pop()?.toLowerCase();
                                        if(['pdf', 'doc', 'docx'].includes(fileType || '')) {
                                            setFormData({...formData, idProofLink: file.name});
                                        } else {
                                            alert("Only PDF and DOC files are allowed.");
                                            e.target.value = ''; // Reset input
                                            setFormData({...formData, idProofLink: ''});
                                        }
                                    }
                                }} 
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5 ml-1 flex items-center gap-1">
                            <i className="fa-solid fa-file-arrow-up"></i> Allowed: PDF, DOC
                        </p>
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Internship Stream</label>
                    <select required className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                        value={formData.stream} onChange={e => setFormData({...formData, stream: e.target.value as StreamType})}>
                        {Object.values(StreamType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Start Date</label>
                        <input required type="date" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                            style={{ colorScheme: 'dark' }}
                            min="2025-12-01"
                            max="2026-02-28"
                            value={formData.startDate} 
                            onChange={e => handleDateChange('startDate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">End Date</label>
                        <input required type="date" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none"
                            style={{ colorScheme: 'dark' }}
                            min="2025-12-01"
                            max="2026-02-28"
                            value={formData.endDate} 
                            onChange={e => handleDateChange('endDate', e.target.value)} />
                    </div>
                </div>

                {dateError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                        <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                        <div>
                            <p className="text-sm text-red-400 font-bold">Date Validation Error</p>
                            <p className="text-xs text-red-300/80 mt-1">{dateError}</p>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold mb-2 text-slate-400 uppercase tracking-wide">Special Requests</label>
                    <textarea className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-marlion-primary outline-none" rows={2}
                        value={formData.requests} onChange={e => setFormData({...formData, requests: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-marlion-primary to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 mt-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!dateError}>
                    Complete Registration
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default Register;