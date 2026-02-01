import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WelcomeContextType {
  isWelcomeOpen: boolean;
  openWelcome: () => void;
  closeWelcome: () => void;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

export const WelcomeProvider = ({ children }: { children: ReactNode }) => {
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome screen before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    
    if (!hasSeenWelcome) {
      // Small delay before showing the drawer for better UX
      const timer = setTimeout(() => {
        setIsWelcomeOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const openWelcome = () => {
    setIsWelcomeOpen(true);
  };

  const closeWelcome = () => {
    setIsWelcomeOpen(false);
  };

  return (
    <WelcomeContext.Provider value={{ isWelcomeOpen, openWelcome, closeWelcome }}>
      {children}
    </WelcomeContext.Provider>
  );
};

export const useWelcome = () => {
  const context = useContext(WelcomeContext);
  if (context === undefined) {
    throw new Error('useWelcome must be used within a WelcomeProvider');
  }
  return context;
};
