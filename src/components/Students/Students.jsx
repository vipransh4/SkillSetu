import React, { useState } from 'react';
import { Check, Filter, UserCheck, X } from 'lucide-react';
import Navbar from '../Navbar/Navbar';

const initialStudents = [
  {
    id: 'std-1',
    name: 'Aarav Sharma',
    avatar: 'AS',
    avatarBg: 'bg-teal-600',
    verified: true,
    college: 'NIT Trichy',
    skills: ['React', 'Node.js', 'SQL'],
    assessmentScore: 88,
    matchScore: 94,
    shortlisted: false,
  },
  {
    id: 'std-2',
    name: 'Diya Patel',
    avatar: 'DP',
    avatarBg: 'bg-purple-600',
    verified: true,
    college: 'IIT Madras',
    skills: ['Python', 'AWS', 'SQL'],
    assessmentScore: 91,
    matchScore: 91,
    shortlisted: false,
  },
  {
    id: 'std-3',
    name: 'Rohan Iyer',
    avatar: 'RI',
    avatarBg: 'bg-amber-600',
    verified: false,
    college: 'Anna University',
    skills: ['Java', 'Spring', 'Docker'],
    assessmentScore: 82,
    matchScore: 87,
    shortlisted: false,
  },
  {
    id: 'std-4',
    name: 'Sneha Kulkarni',
    avatar: 'SK',
    avatarBg: 'bg-emerald-600',
    verified: true,
    college: 'BITS Pilani',
    skills: ['React', 'TypeScript', 'Figma'],
    assessmentScore: 86,
    matchScore: 85,
    shortlisted: false,
  },
  {
    id: 'std-5',
    name: 'Arjun Mehta',
    avatar: 'AM',
    avatarBg: 'bg-red-600',
    verified: false,
    college: 'VIT Vellore',
    skills: ['Node.js', 'MongoDB', 'Redis'],
    assessmentScore: 79,
    matchScore: 81,
    shortlisted: false,
  },
];

const Students = ({onRouteChange}) => {
  const [students, setStudents] = useState(initialStudents);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('bestMatch');

  const toggleShortlist = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, shortlisted: !student.shortlisted }
          : student
      )
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 mt-20 min-h-screen">
      <Navbar onRouteChange={onRouteChange}/>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Find Skilled Students</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Ranked by skill-profile match to your open roles
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('bestMatch')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'bestMatch'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Best match
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'filters'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Filter size={14} /> Filters
            </button>
          </div>
        </div>

        {/* Table Container - Horizontally Scrollable on Mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-175">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4">Key Skills</th>
                <th className="py-3.5 px-4">Assessment</th>
                <th className="py-3.5 px-4">Match</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Candidate */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${student.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                        {student.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-snug">{student.name}</p>
                        <p className="text-xs font-medium mt-0.5 flex items-center gap-1">
                          {student.verified ? (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Check size={12} className="text-emerald-500 stroke-3" /> Skill-verified
                            </span>
                          ) : (
                            <span className="text-slate-400">Unverified</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* College */}
                  <td className="py-4 px-4 font-medium text-slate-700">
                    {student.college}
                  </td>

                  {/* Key Skills */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Assessment */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900">{student.assessmentScore}</span>
                    <span className="text-slate-400 text-xs font-semibold">/100</span>
                  </td>

                  {/* Match Score */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      student.matchScore >= 90
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {student.matchScore}% match
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleShortlist(student.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          student.shortlisted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        {student.shortlisted ? 'Shortlisted' : 'Shortlist'}
                      </button>
                      
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Details Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${selectedStudent.avatarBg} text-white font-bold text-base flex items-center justify-center`}>
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.college}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Assessment Score</p>
                <p className="text-lg font-bold text-slate-800">{selectedStudent.assessmentScore}/100</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Job Match</p>
                <p className="text-lg font-bold text-emerald-600">{selectedStudent.matchScore}%</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;