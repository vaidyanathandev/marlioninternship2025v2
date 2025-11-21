import React, { useState, useEffect } from 'react';

const Countdown: React.FC = () => {
  // Target: Nov 30, 2025 23:59:59
  const targetDate = new Date('2025-11-30T23:59:59').getTime();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate - new Date().getTime();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-12 py-6">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center group">
          <div className="relative">
             <span className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 font-mono tracking-tighter group-hover:to-marlion-primary transition-all duration-300">
              {value.toString().padStart(2, '0')}
            </span>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-marlion-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-marlion-muted uppercase tracking-[0.3em] mt-2 border-t border-transparent group-hover:border-marlion-primary/50 pt-2 transition-all">{unit}</span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;