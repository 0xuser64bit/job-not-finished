// Function to generate a motivational roast based on last activity
export const getMotivationalRoast = (days: number, progress: number) => {
  if (days > 90 && progress < 30) {
    return "This project is collecting more dust than your gym membership card.";
  } else if (days > 60 && progress < 50) {
    return "Your project is aging like milk, not wine. Time to revive it!";
  } else if (days > 30 && progress < 70) {
    return "Another day, another excuse not to finish this project.";
  } else if (days > 14) {
    return "Coffee's getting cold. Time to wake up and code!";
  } else {
    return "You're on a roll! Don't stop now!";
  }
};
// Determine status color based on last activity and progress
export const getStatusColor = (lastActivity: number, progress: number) => {
  if (lastActivity && lastActivity > 60) return "destructive";
  if (lastActivity && lastActivity > 30) return "warning";
  if (lastActivity && lastActivity > 14) return "info";
  return "success";
};
// Function to play sound when project is completed
export const playCompletionSound = () => {
  // Only play sound if it's a browser environment
  if (typeof window !== "undefined") {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create oscillator for the sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set sound properties (a happy sound)
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5

      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.3,
        audioContext.currentTime + 0.05,
      );
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);

      // Play sound
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1);

      // Play second tone for a happy sound
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        oscillator2.connect(gainNode);
        oscillator2.type = "sine";
        oscillator2.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.3,
          audioContext.currentTime + 0.05,
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + 0.8,
        );

        oscillator2.start();
        oscillator2.stop(audioContext.currentTime + 0.8);
      }, 150);
    } catch (error) {
      console.error("Error playing completion sound:", error);
    }
  }
};
