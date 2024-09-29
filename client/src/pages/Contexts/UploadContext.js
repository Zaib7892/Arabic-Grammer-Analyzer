// SessionContext.js
import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState({
    inputText: '',
    sentences: [],
    selectedSentence: '',
    translatedText: '',
    wordCount: 0,
    language: '',
    showFields: false,

    // Semantic Analysis Module related data
    arabicText: '',
    translatedTextSemantic: '',
    nodes: [],
    edges: [],
    showGraph: false,
  });

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
