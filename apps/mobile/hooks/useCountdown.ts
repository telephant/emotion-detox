import { useState, useRef } from 'react';

/**
 * 
 * @param seconds - The number of seconds to countdown from
 * @returns The countdown value
 */
export const useCountdown = (seconds: number) => {
  const [countdown, setCountdown] = useState(seconds);

  const timer = useRef<number | undefined>(undefined);

  const startCountdown = () => {
    timer.current = setInterval(() => {
      setCountdown(prevCount => {
        const newCount = prevCount - 1;
        if (newCount <= 0) {
          clearInterval(timer.current);
        }
        return Math.max(0, newCount);
      });
    }, 1000);
  };  

  const resetCountdown = () => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    setCountdown(seconds);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    countdown,
    isFinished: countdown <= 0,
    countdownText: formatTime(countdown),
    startCountdown,
    resetCountdown,
  };
};
