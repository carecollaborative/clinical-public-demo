"use client";

import { useState, useEffect } from 'react';

// Define TypeScript interfaces for our data structures
export interface Message {
  id: string;
  text: string;
  isAgent: boolean;
  timestamp: number;
}

export interface SessionHistory {
  id: string;
  title: string;
  date: number;
  duration: number;
  messageCount: number;
  patientType: string;
  messages: Message[];
  presetId?: string;
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sessions from localStorage on hook initialization
  useEffect(() => {
    const loadSessions = () => {
      try {
        const savedSessions = localStorage.getItem('sessionHistory');
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions) as SessionHistory[];
          setSessions(parsedSessions);
        }
      } catch (error) {
        console.error('Error loading sessions from localStorage:', error);
      }
      setIsLoaded(true);
    };

    loadSessions();
  }, []);

  // Save a new session to history
  const saveSession = (session: SessionHistory) => {
    console.log("Saving session to history:", session);
    
    try {
      const updatedSessions = [session, ...sessions];
      setSessions(updatedSessions);
      
      // Save to localStorage
      const serializedSessions = JSON.stringify(updatedSessions);
      localStorage.setItem('sessionHistory', serializedSessions);
      
      console.log("Successfully saved sessions to localStorage");
      
      return updatedSessions;
    } catch (error) {
      console.error("Error saving session to localStorage:", error);
      return sessions;
    }
  };

  // Delete a session from history
  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('sessionHistory', JSON.stringify(updatedSessions));
    return updatedSessions;
  };

  // Clear all sessions
  const clearAllSessions = () => {
    setSessions([]);
    localStorage.removeItem('sessionHistory');
  };

  // Generate a unique ID for a new session
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  // Create a new session
  const createSession = (
    title: string, 
    patientType: string, 
    presetId?: string
  ): SessionHistory => {
    return {
      id: generateSessionId(),
      title,
      date: Date.now(),
      duration: 0,
      messageCount: 0,
      patientType,
      messages: [],
      presetId
    };
  };

  // Add a message to a session
  const addMessageToSession = (
    sessionId: string,
    message: Omit<Message, 'id'>
  ) => {
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return sessions;

    const session = sessions[sessionIndex];
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    const updatedSession = {
      ...session,
      messageCount: session.messageCount + 1,
      messages: [...session.messages, newMessage]
    };

    const updatedSessions = [
      ...sessions.slice(0, sessionIndex),
      updatedSession,
      ...sessions.slice(sessionIndex + 1)
    ];

    setSessions(updatedSessions);
    localStorage.setItem('sessionHistory', JSON.stringify(updatedSessions));
    return updatedSessions;
  };

  // Update session duration
  const updateSessionDuration = (sessionId: string, durationMs: number) => {
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return sessions;

    const session = sessions[sessionIndex];
    const updatedSession = {
      ...session,
      duration: durationMs
    };

    const updatedSessions = [
      ...sessions.slice(0, sessionIndex),
      updatedSession,
      ...sessions.slice(sessionIndex + 1)
    ];

    setSessions(updatedSessions);
    localStorage.setItem('sessionHistory', JSON.stringify(updatedSessions));
    return updatedSessions;
  };

  return {
    sessions,
    isLoaded,
    saveSession,
    deleteSession,
    clearAllSessions,
    generateSessionId,
    createSession,
    addMessageToSession,
    updateSessionDuration
  };
}
