import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

const SettingsPanel = ({ currentMode, currentDuration, onSave }) => {
  const [mode, setMode] = useState(currentMode);
  const [minutes, setMinutes] = useState(Math.floor(currentDuration / 60000));
  const [seconds, setSeconds] = useState(Math.floor((currentDuration % 60000) / 1000));

  const handleSave = () => {
    const durationMs = (minutes * 60 + seconds) * 1000;
    onSave(mode, durationMs);
  };

  return (
    <div className="settings-panel">
      <h3><SlidersHorizontal size={20} /> Settings</h3>
      <div className="form-group">
        <label>Mode</label>
        <div className="radio-group">
          <label>
            <input 
              type="radio" 
              name="mode" 
              value="UP" 
              checked={mode === 'UP'}
              onChange={() => setMode('UP')} 
            />
            Count Up
          </label>
          <label>
            <input 
              type="radio" 
              name="mode" 
              value="DOWN" 
              checked={mode === 'DOWN'}
              onChange={() => setMode('DOWN')} 
            />
            Count Down
          </label>
        </div>
      </div>

      {mode === 'DOWN' && (
        <div className="form-group row">
          <div>
            <label>Minutes</label>
            <input 
              type="number" 
              min="0" 
              value={minutes} 
              onChange={(e) => setMinutes(parseInt(e.target.value) || 0)} 
            />
          </div>
          <div>
            <label>Seconds</label>
            <input 
              type="number" 
              min="0" 
              max="59" 
              value={seconds} 
              onChange={(e) => setSeconds(parseInt(e.target.value) || 0)} 
            />
          </div>
        </div>
      )}

      <button className="primary-btn mt-2" onClick={handleSave}>
        Save & Reset
      </button>
    </div>
  );
};

export default SettingsPanel;