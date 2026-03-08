import React from 'react';
import { Timer } from 'lucide-react';

const formatTime = (totalMs) => {
  const ms = Math.floor(totalMs % 1000);
  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (num, digits = 2) => String(num).padStart(digits, '0');

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    ms: pad(ms, 3)
  };
};

const TimerDisplay = ({ ms, mode, isRunning }) => {
  const time = formatTime(ms);
  
  return (
    <div className={`timer-display ${isRunning ? 'running' : ''}`}>
      <div className="time-parts">
        {parseInt(time.hours) > 0 && <span className="part">{time.hours}:</span>}
        <span className="part">{time.minutes}:</span>
        <span className="part">{time.seconds}</span>
        <span className="part ms">.{time.ms.substring(0,2)}</span>
      </div>
      <div className="mode-indicator">
        <Timer size={16} />
        {mode === 'UP' ? 'Count Up' : 'Count Down'}
      </div>
    </div>
  );
};

export default TimerDisplay;