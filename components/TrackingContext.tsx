import React, { createContext, useContext, useState } from 'react';

type TrackingState = 'idle' | 'tracking' | 'paused';

interface TrackingContextType {
  state: TrackingState;
  isTracking: boolean; // ✅ Add this line
  startTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
}


const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<TrackingState>('idle');

  const startTracking = () => setState('tracking');
  const pauseTracking = () => setState('paused');
  const resumeTracking = () => setState('tracking');

  const isTracking = state === 'tracking'; // ✅ Add this line

  return (
    <TrackingContext.Provider
      value={{ state, isTracking, startTracking, pauseTracking, resumeTracking }} // ✅ Add isTracking here
    >
      {children}
    </TrackingContext.Provider>
  );
};


export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) throw new Error('useTracking must be used within TrackingProvider');
  return context;
};
