import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ArrowLeft } from 'lucide-react';

const VideoCall = ({ roomID, userID, userName, onLeave }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const initCall = async () => {
      const appID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 0;
      const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || '';

      if (!appID || !serverSecret || serverSecret === 'your_server_secret_here') {
        console.warn('ZegoCloud credentials missing — set VITE_ZEGO_APP_ID and VITE_ZEGO_SERVER_SECRET in .env');
      }

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID || `user_${Math.floor(Math.random() * 1000)}`,
        userName || 'User'
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPrejoinView: true,
        showScreenSharingButton: true,
        onLeaveRoom: () => {
          if (onLeave) onLeave();
        },
      });
    };

    if (containerRef.current) {
      initCall();
    }
  }, [roomID, userID, userName, onLeave]);

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      {/* Back / Leave Button */}
      <button
        onClick={() => onLeave && onLeave()}
        className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-800/80 backdrop-blur text-white font-semibold rounded-xl text-xs hover:bg-slate-700 cursor-pointer flex items-center gap-2 transition-all active:scale-95 border border-slate-700"
      >
        <ArrowLeft size={14} />
        Leave Call
      </button>
      <div
        ref={containerRef}
        className="w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
      />
    </div>
  );
};

export default VideoCall;