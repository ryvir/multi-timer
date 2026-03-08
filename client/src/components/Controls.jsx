import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Controls = ({ status, onStart, onPause, onReset }) => {
  return (
    <div className="controls">
      {status === 'PAUSED' ? (
        <button className="control-btn start" onClick={onStart}>
          <Play size={20} fill="currentColor" /> Start
        </button>
      ) : (
        <button className="control-btn pause" onClick={onPause}>
          <Pause size={20} fill="currentColor" /> Pause
        </button>
      )}
      <button className="control-btn reset" onClick={onReset}>
        <RotateCcw size={20} /> Reset
      </button>
    </div>
  );
};

export default Controls;