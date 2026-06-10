import React, { useState, useEffect } from 'react';
import './App.css';

//Placeholder for audio path
const meowSound = "https://www.soundjay.com/misc/sounds/cat-meow-1.mp3";

function App() {
  // Variables
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false); // Is the countdown active?
  const [isBreak, setIsBreak] = useState<boolean>(false); // Work mode (false) or break mode (true)
  
  // The timer countdown effect
  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (isRunning && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000); // Subtract 1 second every 1000 milliseconds
      }
      // Cleanup: Stops the timer from multiplying or running in the background when not needed
      return() => clearInterval(timer);
    }, [isRunning, timeLeft]); // Re-run this block whenever these two values change
  
    // The alarm effect
    useEffect(() => {
      if (timeLeft === 0 && isRunning) {
        const audio = new Audio(meowSound);
        audio.play().catch(err => console.error("Audio play blocked until user interaction:", err));
        setIsRunning(false); // Stop the timer
        alert(isBreak ? "Break's over! Time to work!" : "Time's up! Take a break!"); // Alert the user
      }
    }, [timeLeft, isRunning, isBreak]); // Re-run this block whenever these three values change
  
    // Helper function to format time in MM:SS
    const formatTime = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handles clicking the main Start/Stop button
    const handleStartStop = () => {
      setIsRunning(!isRunning);
    };

    // Swaps between 25-minute work sessions and 5-minute breaks
    const switchMode = (toBreakMode: boolean) => {
      setIsRunning(false); // Stop the timer when switching modes
      setIsBreak(toBreakMode);
      setTimeLeft(toBreakMode ? 5 * 60 : 25 * 60); // Set time for break or work
    };

    // Instruct Electron to shut down the frame window completely
    const handleCloseApp = () => {
      if((window as any).electronAPI) {
        (window as any).electronAPI.closeApp();
      } else {
        console.log("Not running in Electron environment, closeApp function is not available.");
      }
    };

    // Visual Layout
    return (
    <div className={`container ${isRunning ? 'running' : 'idle'}`}>
      {/* Top Border Close Button */}
      <button className="close-button" onClick={handleCloseApp}>X</button>

      {/* Mode Selection Tabs */}
      <div className="mode-selection">
        <button 
          className={`mode-btn ${!isBreak ? 'active' : ''}`} 
          onClick={() => switchMode(false)}
        >
          Work
        </button>
        <button 
          className={`mode-btn ${isBreak ? 'active' : ''}`} 
          onClick={() => switchMode(true)}
        >
          Break
        </button>
      </div>

      {/* Main App Core Components */}
      <div className="timer-display">
        <h1>{formatTime(timeLeft)}</h1>
        <p>{isBreak ? "☕ Rest up!" : "💻 Stay focused!"}</p>
      </div>

      {/* Playback Control Actions */}
      <button className="control-btn" onClick={handleStartStop}>
        {isRunning ? 'RESET' : 'START'}
      </button>
    </div>
  );
}

export default App;
