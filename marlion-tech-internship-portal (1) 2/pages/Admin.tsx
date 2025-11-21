import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, Student, ProposalStatus } from '../types';

const Admin: React.FC = () => {
  const { students, updateStudentStatus, banStudent, logout } = useApp();
  const [activeTab, setActiveTab] = useState('students');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.college.toLowerCase().includes(search.toLowerCase())
  );

  const handleReviewAction = (approved: boolean) => {
      if (!selectedStudent) return;
      updateStudentStatus(selectedStudent.id, approved ? ApplicationStatus.OFFER_RELEASED : ApplicationStatus.REJECTED);
      setSelectedStudent(null);
  };

  const handleProposalAction = (approved: boolean) => {
      if (!selectedStudent) return;
      updateStudentStatus(selectedStudent.id, selectedStudent.status, {
          proposalStatus: approved ? ProposalStatus.APPROVED : ProposalStatus.REJECTED
      });
      // Update local state instantly to reflect in modal
      setSelectedStudent(prev => prev ? ({...prev, proposalStatus: approved ? ProposalStatus.APPROVED : ProposalStatus.REJECTED}) : null);
  };

  return (
    <div className="min-h-screen bg-marlion-dark flex text-slate-200">
        {/* Modal for Student Review */}
        {selectedStudent && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Review Candidate: {selectedStudent.name}</h2>
                        <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800 p-4 rounded">
                                <div className="text-xs text-slate-500 uppercase">AI Score</div>
                                <div className={`text-3xl font-bold ${
                                    (selectedStudent.interviewScore || 0) > 70 ? 'text-green-400' : 'text-yellow-400'
                                }`}>{selectedStudent.interviewScore || 0}/100</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded">
                                <div className="text-xs text-slate-500 uppercase">Stream</div>
                                <div className="text-xl font-bold">{selectedStudent.stream}</div>
                            </div>
                        </div>
                        
                        <h3 className="font-bold mb-2 text-marlion-primary">AI Summary</h3>
                        <p className="bg-slate-800 p-4 rounded mb-6 text-slate-300 leading-relaxed">
                            {selectedStudent.interviewSummary || "No summary available."}
                        </p>

                        <h3 className="font-bold mb-2 text-slate-400">Interview Transcript</h3>
                        <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800 max-h-60 overflow-y-auto mb-6">
                            {selectedStudent.interviewTranscript?.map((msg, i) => (
                                <div key={i} className={`text-sm ${msg.role==='model' ? 'text-yellow-500' : 'text-white ml-4'}`}>
                                    <span className="font-bold text-xs uppercase opacity-50 mr-2">{msg.role}:</span>
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Proposal Review Section */}
                        {selectedStudent.proposalStatus !== ProposalStatus.NOT_SUBMITTED && (
                            <div className="mb-6 animate-fade-in">
                                <h3 className="font-bold mb-2 text-marlion-accent">Project Proposal</h3>
                                <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-2">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Status: {selectedStudent.proposalStatus}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{selectedStudent.proposalText}</p>
                                </div>
                                {selectedStudent.proposalStatus === ProposalStatus.PENDING && (
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleProposalAction(false)} className="px-4 py-1 text-xs rounded border border-red-500 text-red-500 hover:bg-red-900/20">Reject Proposal</button>
                                        <button onClick={() => handleProposalAction(true)} className="px-4 py-1 text-xs rounded bg-marlion-primary text-white hover:bg-blue-600">Approve Proposal</button>
                                    </div>
                                )}
                            </div>
                        )}

                        <h3 className="font-bold mb-2 text-slate-400">Activity Logs</h3>
                        <div className="space-y-2 bg-slate-950 p-4 rounded border border-slate-800 max-h-40 overflow-y-auto">
                             {selectedStudent.logs && selectedStudent.logs.length > 0 ? (
                                 selectedStudent.logs.map(log => (
                                     <div key={log.id} className="text-xs text-slate-300 border-b border-slate-800 pb-1 mb-1 last:border-0">
                                         <span className="text-marlion-primary mr-2">[{log.date}]</span> {log.content}
                                     </div>
                                 ))
                             ) : (
                                 <div className="text-xs text-slate-500">No activity logged.</div>
                             )}
                        </div>
                    </div>
                    
                    {/* Offer Release Actions (Only if Interview Pending Review) */}
                    {selectedStudent.status === ApplicationStatus.INTERVIEW_COMPLETED && (
                        <div className="p-6 border-t border-slate-700 flex gap-4 justify-end bg-slate-800 rounded-b-2xl">
                            <button onClick={() => handleReviewAction(false)} className="px-6 py-2 rounded text-red-400 hover:bg-red-900/30 font-bold border border-red-900/50">Reject</button>
                            <button onClick={() => handleReviewAction(true)} className="bg-marlion-primary px-6 py-2 rounded text-white font-bold hover:bg-blue-600">Approve & Release Offer</button>
                        </div>
                    )}
                </div>
            </div>
        )}

        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-800 font-bold text-marlion-primary">
                Marlion Admin
            </div>
            <nav className="p-4 space-y-2 flex-1">
                <button onClick={() => setActiveTab('students')} className={`w-full text-left px-4 py-2 rounded ${activeTab==='students' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>Students</button>
                <button onClick={() => setActiveTab('cms')} className={`w-full text-left px-4 py-2 rounded ${activeTab==='cms' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>CMS</button>
                <button onClick={() => setActiveTab('projects')} className={`w-full text-left px-4 py-2 rounded ${activeTab==='projects' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>Projects</button>
            </nav>
            <div className="p-4">
                <button onClick={logout} className="text-red-400 text-sm">Logout</button>
            </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'students' && (
                <>
                    <div className="flex justify-between mb-6">
                        <h1 className="text-2xl font-bold">Student Management</h1>
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            className="bg-slate-800 border border-slate-700 rounded px-4 py-2"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Stream</th>
                                    <th className="p-4">College</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-800/50">
                                        <td className="p-4 font-medium">{student.name}</td>
                                        <td className="p-4 text-sm text-slate-400">{student.stream}</td>
                                        <td className="p-4 text-sm text-slate-400">{student.college}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                student.status === ApplicationStatus.OFFER_ACCEPTED ? 'bg-green-900 text-green-300' :
                                                student.status === ApplicationStatus.OFFER_RELEASED ? 'bg-blue-900 text-blue-300' :
                                                student.status === ApplicationStatus.REJECTED ? 'bg-red-900 text-red-300' :
                                                'bg-yellow-900 text-yellow-300'
                                            }`}>
                                                {student.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button 
                                                onClick={() => setSelectedStudent(student)}
                                                className="bg-marlion-primary text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                                                Details / Review
                                            </button>
                                            <button 
                                                onClick={() => banStudent(student.id)}
                                                className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-600/40 border border-red-600/50">
                                                Ban
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            
            {activeTab === 'cms' && (
                <div className="text-center text-slate-500 mt-20">
                    <i className="fa-solid fa-tools text-4xl mb-4"></i>
                    <p>Course Management System Placeholder</p>
                    <p className="text-xs">Upload videos, generate AI summaries, manage curriculum.</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default Admin;