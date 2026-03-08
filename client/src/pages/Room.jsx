import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSynchronizedTimer } from '../hooks/useSynchronizedTimer';
import TimerDisplay from '../components/TimerDisplay';
import Controls from '../components/Controls';
import SettingsPanel from '../components/SettingsPanel';
import { ChevronLeft, Settings } from 'lucide-react';

const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { 
    displayMs, 
    timerState, 
    startTimer, 
    pauseTimer, 
    stopTimer, 
    setMode 
  } = useSynchronizedTimer(code);

  const [showSettings, setShowSettings] = useState(false);

  if (!timerState) {
    return <div className="loading">Connecting to timer {code}...</div>;
  }

  return (
    <div className="room-container">
      <header className="room-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ChevronLeft size={20} /> Leave
        </button>
        <div className="room-code">
          Code: <strong>{code}</strong>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn" title="Settings">
          <Settings size={24} color={showSettings ? "#6366f1" : "currentColor"} />
        </button>
      </header>

      {showSettings && (
        <SettingsPanel 
          currentMode={timerState.mode} 
          currentDuration={timerState.duration}
          onSave={(mode, durationMs) => {
            setMode(mode, durationMs);
            setShowSettings(false);
          }} 
        />
      )}

      <main className="timer-main">
        <TimerDisplay 
          ms={displayMs} 
          mode={timerState.mode} 
          isRunning={timerState.status === 'RUNNING'} 
        />
        <Controls 
          status={timerState.status}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={stopTimer}
        />
      </main>
    </div>
  );
};

export default Room;