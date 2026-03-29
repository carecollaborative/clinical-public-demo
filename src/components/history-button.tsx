"use client";

import { useState, useEffect } from "react";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HistoryButton() {
  const [hasHistory, setHasHistory] = useState(false);
  const [count, setCount] = useState(0);

  // Check if there's any session history
  useEffect(() => {
    const checkHistory = () => {
      try {
        const savedSessions = localStorage.getItem('sessionHistory');
        const hasAnyHistory = !!savedSessions && savedSessions !== '[]';
        setHasHistory(hasAnyHistory);
        
        // Count the number of sessions
        if (hasAnyHistory) {
          const sessions = JSON.parse(savedSessions);
          setCount(Array.isArray(sessions) ? sessions.length : 0);
        } else {
          setCount(0);
        }
      } catch (error) {
        console.error('Error checking session history:', error);
        setHasHistory(false);
        setCount(0);
      }
    };
    
    checkHistory();
    
    // Listen for storage events to update the button visibility
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionHistory') {
        checkHistory();
      }
    };
    
    // Also check periodically in case localStorage is updated in the same window
    const intervalId = setInterval(checkHistory, 5000);
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  if (!hasHistory) {
    return null;
  }

  return (
    <Link href="/history">
      <Button
        variant="ghost"
        className="inline-flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-50 h-10 sm:h-12 py-1.5 sm:py-2 px-2 sm:px-4 bg-teal-50 text-teal-700 hover:bg-teal-100 relative"
      >
        <History className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">History</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>
    </Link>
  );
}
