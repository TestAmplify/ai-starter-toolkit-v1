
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeyContextType {
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenaiApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  const updateApiKey = (key: string) => {
    setOpenaiApiKey(key);
    if (key) {
      localStorage.setItem('openai_api_key', key);
    } else {
      localStorage.removeItem('openai_api_key');
    }
  };

  return (
    <ApiKeyContext.Provider value={{ openaiApiKey, setOpenaiApiKey: updateApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
