import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../SocketContext';

export const useSynchronizedTimer = (roomCode) => {
  const socket = useSocket();
  const [timerState, setTimerState] = useState(null);
  const [displayMs, setDisplayMs] = useState(0);
  const offsetRef = useRef(0);
  const requestRef = useRef(null);

  // Sync time with server
  useEffect(() => {
    const syncTime = () => {
      const startClientTime = Date.now();
      socket.emit('sync_time', startClientTime, (serverTime) => {
        const endClientTime = Date.now();
        const roundTrip = endClientTime - startClientTime;
        // Approximate server time when it processed the request
        const estimatedServerTimeAtRequest = serverTime + (roundTrip / 2);
        // Client-to-server offset
        offsetRef.current = serverTime - (endClientTime - roundTrip / 2);
        
        console.log(`Time synced. RoundTrip: ${roundTrip}ms, Offset: ${offsetRef.current}ms`);
      });
    };

    // Sync several times initially to get a good average, but for simplicity we'll do once
    syncTime();
    const intervalId = setInterval(syncTime, 30000); // Periodic resync
    
    return () => clearInterval(intervalId);
  }, [socket]);

  // Listen for socket events
  useEffect(() => {
    // Attempt to join/fetch current state on mount
    socket.emit('join_room', roomCode, (res) => {
      if (res.success) {
        setTimerState(res.state);
      }
    });

    socket.on('timer_state_update', (newState) => {
      setTimerState(newState);
    });

    return () => {
      socket.off('timer_state_update');
    };
  }, [socket, roomCode]);

  // The animation loop to calculate display time
  useEffect(() => {
    if (!timerState) return;

    const animate = () => {
      let currentDisplayMs = 0;

      if (timerState.status === 'RUNNING') {
        // Calculate exact time elapsed according to server timestamps
        const currentServerTime = Date.now() + offsetRef.current;
        const timeSinceStart = currentServerTime - timerState.serverStartTime;
        const totalElapsed = timerState.accumulatedTime + timeSinceStart;
        
        if (timerState.mode === 'UP') {
          currentDisplayMs = totalElapsed;
        } else {
          // Count down mode
          currentDisplayMs = Math.max(0, timerState.duration - totalElapsed);
          // If countdown hit zero, auto-stop (optional based on requirements)
          if (currentDisplayMs === 0) {
            // Might wanna emit zero hit event here, but visual stop is fine
          }
        }
      } else {
        // PAUSED
        if (timerState.mode === 'UP') {
          currentDisplayMs = timerState.accumulatedTime;
        } else {
          currentDisplayMs = Math.max(0, timerState.duration - timerState.accumulatedTime);
        }
      }

      setDisplayMs(currentDisplayMs);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [timerState]);

  // Control Actions
  const startTimer = () => socket.emit('start_timer', roomCode);
  const pauseTimer = () => socket.emit('pause_timer', roomCode);
  const stopTimer = () => socket.emit('stop_timer', roomCode);
  const setMode = (mode, duration) => socket.emit('set_mode', { code: roomCode, mode, duration });

  return { 
    displayMs, 
    timerState, 
    startTimer, 
    pauseTimer, 
    stopTimer, 
    setMode 
  };
};