import React, { useState } from 'react';
import { Video } from 'lucide-react';
import VideoCall from './VideoCall';

const CandidatePipeline = ({ candidateName = "Aarav Sharma" }) => {
  const [activeCallRoom, setActiveCallRoom] = useState(null);

  const startInterview = () => {
    // Generate a unique room ID based on candidate or interview ID
    const generatedRoomID = `interview_${Date.now()}`;
    setActiveCallRoom(generatedRoomID);
  };

  if (activeCallRoom) {
    return (
      <div className="relative">
        <button
          onClick={() => setActiveCallRoom(null)}
          className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <VideoCall
          roomID={activeCallRoom}
          userID="recruiter_1"
          userName="Recruiter (You)"
          onLeave={() => setActiveCallRoom(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="font-bold text-slate-900">{candidateName}</h3>
        <p className="text-xs text-slate-500">Shortlisted for Frontend Developer Role</p>
      </div>

      <button
        onClick={startInterview}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
      >
        <Video size={16} />
        <span>Start Video Interview</span>
      </button>
    </div>
  );
};

export default CandidatePipeline;