import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VideoCall = ({ roomID, userID, userName, onLeave }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const initCall = async () => {
      // 1. Get AppID and ServerSecret from ZEGOCLOUD Admin Console (free tier available)
      const appID = YOUR_APP_ID; // Replace with your numeric App ID
      const serverSecret = "YOUR_SERVER_SECRET"; // Replace with your Server Secret string

      // 2. Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID || `user_${Math.floor(Math.random() * 1000)}`,
        userName || "Recruiter"
      );

      // 3. Create Instance & Join Room
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 Interview mode
        },
        showPrejoinView: true,
        showScreenSharingButton: true, // Crucial for technical interviews / resume reviews
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
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800" />
    </div>
  );
};

export default VideoCall;