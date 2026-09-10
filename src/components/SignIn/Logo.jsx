import React from 'react';

const Logo=()=>{
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 shadow-md shadow-navy-900/20">
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 22C6 22 10 16 18 16C26 16 30 22 30 22" stroke="#0EA5A4" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M10 20V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M26 20V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="10" cy="12" r="3" fill="white"/>
          <circle cx="26" cy="12" r="3" fill="white"/>
          <path d="M14 18L18 14L22 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-navy-900">
          Skill <span className="text-teal-500">Setu</span>
        </span>
        <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
          Academia–Industry Bridge
        </span>
      </div>
    </div>
  );
}

export default Logo;