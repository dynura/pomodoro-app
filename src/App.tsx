import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Audio path
const meowSound = "../public/cat-alarm.mp3";

function App() {
  // Variables
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false); // Is the countdown active?
  const [isBreak, setIsBreak] = useState<boolean>(false); // Work mode (false) or break mode (true)
  const [statusMessage, setStatusMessage] = useState<string>(""); // Status message to display
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to manage the audio element

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
        // Play the audio immediately when the timer hits zero
        audioRef.current = new Audio(meowSound);
        audioRef.current.play().catch(err => console.error("Error playing sound:", err));

        // Turn off the active countdown motor
        setIsRunning(false);

        // Set dynamic time-up text display
        if (isBreak) {
          setStatusMessage("Break's over! Time to get back to work!");

          // Wait 8 seconds before resetting the timer for the next work session
          setTimeout(() => {
            // Stop the audio explicitly before resetting the timer
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0; // Reset audio to the beginning
            }

            setTimeLeft(25 * 60); // Reset to 25 minutes for work
            setIsBreak(false); // Switch back to work mode
            setStatusMessage(""); // Clear the status message
          }, 8000);
        } else {
            setStatusMessage("Time's up! Take a break!");

            // Wait 8 seconds before resetting the timer for the next break session
            setTimeout(() => {
              // Stop the audio explicitly before resetting the timer
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0; // Reset audio to the beginning
              }

              setTimeLeft(5 * 60); // Reset to 5 minutes for break
              setIsBreak(true); // Switch to break mode
              setStatusMessage(""); // Clear the status message
            }, 8000);
        }
      }
    }, [timeLeft, isRunning, isBreak, meowSound]); // Re-run this block whenever these three values change
  
    // Helper function to format time in MM:SS
    const formatTime = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handles clicking the main Start/Stop button
    const handleStartStop = () => {
      if (isRunning) {
        // If it's already running, STOP it and RESET the time
        setIsRunning(false);
        setTimeLeft(isBreak ? 5 * 60 : 25 * 60); 
      } else {
        // Kill any ringing audio immediateky if someone presses play during a milestone text
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0; // Reset audio to the beginning
        }
        setStatusMessage(""); // Clear any milestone text if present
        // If it's idle, START the countdown
        setIsRunning(true);
      }
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
      <div className="container">
        <div className="header-bar">
          <span>WORK FASTER ♡</span>
          <button className="close-button" onClick={handleCloseApp}>X</button>
        </div>

        <div className="main-board">
          <div className="mode-selection">
            <button 
              className={`mode-btn ${!isBreak ? 'active' : ''}`} 
              onClick={() => switchMode(false)}
            >
              WORK
            </button>
            <button 
              className={`mode-btn ${isBreak ? 'active' : ''}`} 
              onClick={() => switchMode(true)}
            >
              BREAK
            </button>
          </div>

          <div className="timer-display">
            <h1>{formatTime(timeLeft)}</h1>
            <p>
              {statusMessage ? (
                // If a milestone is happening, display it in a highlighted style!
                <span className="milestone-text">🌟 {statusMessage}</span>
              ) : (
                // Otherwise, show the regular status message based on the current mode
                <span>{isBreak ? "☕ Rest up!" : "💻 Stay focused!"}</span>
              )}
            </p>
          </div>

          <div className="character-display">
            {/* Timer is IDLE */}
            {!isRunning && (
              <>
                <img src={`${process.env.PUBLIC_URL}/cat-idle.gif`} alt="siamese" />
                <img src={`${process.env.PUBLIC_URL}/dog-idle.gif`} alt="golden" />
              </>
            )}

            {/* Timer is RUNNING & WORK mode (Notice the fix to !isBreak) */}
            {isRunning && !isBreak && (
              <img src={`${process.env.PUBLIC_URL}/cat.gif`} alt="cat working" />
            )}

            {/* Timer is RUNNING & BREAK mode (Notice the fix to isBreak) */}
            {isRunning && isBreak && (
              <img src={`${process.env.PUBLIC_URL}/dog.gif`} alt="dog resting" />
            )}
          </div>

          <button className="control-btn" onClick={handleStartStop}>
            <img src={isRunning ? "repeat-button.png" : "play-button.png"} alt="control" />
          </button>
        </div>
      </div>
  );
}

export default App;
