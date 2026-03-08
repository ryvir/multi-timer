import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';
import { Plus, LogIn } from 'lucide-react';

const Home = () => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const socket = useSocket();

  const handleCreateRoom = () => {
    socket.emit('create_room', (res) => {
      if (res.code) {
        navigate(`/room/${res.code}`);
      }
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    socket.emit('join_room', joinCode.trim(), (res) => {
      if (res.success) {
        navigate(`/room/${joinCode.trim().toUpperCase()}`);
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="home-container">
      <h1>SyncTimer</h1>
      <p className="subtitle">Real-time synchronized countdown and up counter for multiple devices.</p>
      
      <div className="card">
        <button className="primary-btn" onClick={handleCreateRoom}>
          <Plus size={20} /> Create New Timer
        </button>
        
        <div className="divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleJoinRoom} className="join-form">
          <input 
            type="text" 
            placeholder="Enter Code (e.g. A7XT)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
            required
          />
          <button type="submit" className="secondary-btn">
            <LogIn size={20} /> Join
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default Home;