import React, { createContext, useContext, useState, useEffect } from 'react';

interface NightLightContextType {
  isNightLight: boolean;
  intensity: number;
  toggleNightLight: () => void;
  setNightLight: (enabled: boolean) => void;
  setIntensity: (val: number) => void;
}

const NightLightContext = createContext<NightLightContextType | undefined>(undefined);

export const NightLightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNightLight, setIsNightLight] = useState<boolean>(() => {
    return localStorage.getItem('studysphere_nightlight') === 'true';
  });
  const [intensity, setIntensityState] = useState<number>(() => {
    const stored = localStorage.getItem('studysphere_nightlight_intensity');
    return stored ? parseInt(stored, 10) : 22;
  });

  useEffect(() => {
    localStorage.setItem('studysphere_nightlight', isNightLight ? 'true' : 'false');
  }, [isNightLight]);

  const toggleNightLight = () => {
    setIsNightLight(prev => !prev);
  };

  const setNightLight = (enabled: boolean) => {
    setIsNightLight(enabled);
  };

  const setIntensity = (val: number) => {
    setIntensityState(val);
    localStorage.setItem('studysphere_nightlight_intensity', val.toString());
  };

  return (
    <NightLightContext.Provider value={{ isNightLight, intensity, toggleNightLight, setNightLight, setIntensity }}>
      {children}
      {isNightLight && (
        <div
          className="fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300"
          style={{
            backgroundColor: 'rgb(255, 147, 41)',
            opacity: intensity / 100,
            mixBlendMode: 'multiply'
          }}
        />
      )}
    </NightLightContext.Provider>
  );
};

export const useNightLight = () => {
  const ctx = useContext(NightLightContext);
  if (!ctx) throw new Error('useNightLight must be used within NightLightProvider');
  return ctx;
};
