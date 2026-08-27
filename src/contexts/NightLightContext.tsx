import React, { createContext, useContext, useState, useEffect } from 'react';

interface NightLightContextType {
  isNightLight: boolean;
  intensity: number;
  toggleNightLight: () => void;
  setNightLight: (val: boolean) => void;
  setIntensity: (val: number) => void;
}

const NightLightContext = createContext<NightLightContextType | undefined>(undefined);

export const NightLightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNightLight, setIsNightLight] = useState<boolean>(() => {
    return localStorage.getItem('studysphere_nightlight') === 'true';
  });
  const [intensity, setIntensity] = useState<number>(() => {
    const saved = localStorage.getItem('studysphere_nightlight_intensity');
    return saved ? Number(saved) : 25;
  });

  useEffect(() => {
    localStorage.setItem('studysphere_nightlight', String(isNightLight));
    localStorage.setItem('studysphere_nightlight_intensity', String(intensity));
  }, [isNightLight, intensity]);

  const toggleNightLight = () => setIsNightLight((prev) => !prev);
  const setNightLight = (val: boolean) => setIsNightLight(val);

  return (
    <NightLightContext.Provider value={{ isNightLight, intensity, toggleNightLight, setNightLight, setIntensity }}>
      {children}
      {isNightLight && (
        <div
          className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-300"
          style={{
            backgroundColor: `rgba(255, 170, 50, ${intensity / 100 * 0.35})`,
            mixBlendMode: 'multiply',
          }}
        />
      )}
    </NightLightContext.Provider>
  );
};

export const useNightLight = () => {
  const context = useContext(NightLightContext);
  if (!context) throw new Error('useNightLight must be used within NightLightProvider');
  return context;
};
