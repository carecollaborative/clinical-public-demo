// src/components/live-captions.tsx
"use client";

import { useAgent } from "@/hooks/use-agent";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useVoiceAssistant } from "@livekit/components-react";

interface LiveCaptionsProps {
  maxWords?: number;
}

export function LiveCaptions({ maxWords = 15 }: LiveCaptionsProps) {
  const { displayTranscriptions } = useAgent();
  const { state: agentState } = useVoiceAssistant();
  const [currentText, setCurrentText] = useState("");
  const [previousText, setPreviousText] = useState("");
  const [prevAgentState, setPrevAgentState] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  
  // Auto-hide captions after 10 seconds of no updates
  useEffect(() => {
    const hideTimeout = setTimeout(() => {
      const now = Date.now();
      // If it's been more than 10 seconds since the last update, clear the captions
      if (now - lastUpdateTime > 10000 && currentText) {
        setCurrentText("");
        setPreviousText("");
      }
    }, 10000);
    
    return () => clearTimeout(hideTimeout);
  }, [currentText, lastUpdateTime]);
  
  // Clear captions when AI transitions between states
  useEffect(() => {
    // Clear when transitioning from listening to speaking (new response)
    if (prevAgentState === "listening" && agentState === "speaking") {
      setCurrentText("");
      setPreviousText("");
    }
    
    // Clear when transitioning to thinking state
    if (agentState === "thinking") {
      setCurrentText("");
      setPreviousText("");
    }
    
    setPrevAgentState(agentState);
  }, [agentState, prevAgentState]);
  
  // Get the most recent agent message - don't depend on agent state
  useEffect(() => {
    if (displayTranscriptions.length > 0) {
      // Find the most recent message from the agent
      const agentMessages = displayTranscriptions.filter(
        (transcription) => transcription.participant?.isAgent
      );
      
      if (agentMessages.length > 0) {
        const latestMessage = agentMessages[agentMessages.length - 1];
        const fullText = latestMessage.segment.text.trim();
        
        // Only update if we have actual content
        if (fullText.length > 0) {
          // If this is a new message (not just an update to the current one)
          if (!fullText.startsWith(previousText) && previousText !== "") {
            setPreviousText("");
          }
          
          // Store the full text for comparison on next update
          setPreviousText(fullText);
          
          // Display the full text and update the timestamp
          setCurrentText(fullText);
          setLastUpdateTime(Date.now());
        }
      }
    }
  }, [displayTranscriptions, previousText]);

  // Show captions whenever there's text, regardless of the exact agent state
  // This makes the component more resilient to state synchronization issues
  const shouldShowCaptions = !!currentText && currentText.length > 0;

  return (
    <AnimatePresence mode="wait">
      {shouldShowCaptions && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.19, 1.0, 0.22, 1.0], // Ease out expo for smooth animation
          }}
          className="w-full max-w-3xl mx-auto px-4 sm:px-6 absolute bottom-24 sm:bottom-28 left-0 right-0 z-10"
        >
          <div className="bg-gradient-to-r from-teal-50/95 to-indigo-50/95 backdrop-blur-md border border-teal-100/50 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-lg max-h-32 sm:max-h-40 overflow-y-auto">
            <div className="flex items-center justify-center mb-1.5">
              <div className="h-1 w-16 sm:w-24 rounded-full bg-gradient-to-r from-teal-200 to-indigo-200"></div>
            </div>
            <p className="text-sm sm:text-base text-slate-700 text-center leading-relaxed font-medium">
              {currentText || "..."}
            </p>
            <div className="flex justify-center mt-2">
              <div className="animate-pulse flex space-x-1.5">
                <div className="h-1.5 w-1.5 bg-teal-400 rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                <div className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
