// src/components/chat.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { SessionControls } from "@/components/session-controls";
import { ConnectButton } from "./connect-button";
import { ConnectionState, Track } from "livekit-client";
import {
  useConnectionState,
  useVoiceAssistant,
  useTracks,
} from "@livekit/components-react";
import { VideoCallVisualizer } from "@/components/video-call-visualizer";
import { ChatControls } from "@/components/chat-controls";
import { useAgent } from "@/hooks/use-agent";
import { useConnection } from "@/hooks/use-connection";
import { toast } from "@/hooks/use-toast";
import { InstructionsOverlay } from "@/components/InstructionsOverlay";
import { FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionHistory, SessionHistory, Message } from "@/hooks/use-session-history";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import Link from "next/link";

export function Chat() {
  const connectionState = useConnectionState();
  const { audioTrack, state } = useVoiceAssistant();
  const [isChatRunning, setIsChatRunning] = useState(false);
  const { agent, displayTranscriptions } = useAgent();
  const { disconnect: originalDisconnect, connect, pgState } = useConnection();
  const [isInstructionsOverlayOpen, setIsInstructionsOverlayOpen] = useState(false);
  const [hasSeenAgent, setHasSeenAgent] = useState(false);
  const [currentCaptionText, setCurrentCaptionText] = useState("");
  const { saveSession, generateSessionId } = useSessionHistory();
  const { helpers } = usePlaygroundState();
  const sessionStartTimeRef = useRef<number | null>(null);
  const [showHistoryButton, setShowHistoryButton] = useState(false);

  // Function to get the latest caption text from agent messages
  const getCaptionText = () => {
    if (displayTranscriptions.length === 0 || state !== "speaking") {
      return "";
    }

    // Find the most recent message from the agent
    const agentMessages = displayTranscriptions.filter(
      (transcription) => transcription.participant?.isAgent
    );

    if (agentMessages.length > 0) {
      const latestMessage = agentMessages[agentMessages.length - 1];
      return latestMessage.segment.text.trim();
    }

    return "";
  };

  // Update caption text when transcriptions change
  useEffect(() => {
    setCurrentCaptionText(getCaptionText());
  }, [displayTranscriptions, state]);

  // Check if there's any session history to show the history button
  useEffect(() => {
    const checkHistory = () => {
      try {
        const savedSessions = localStorage.getItem('sessionHistory');
        setShowHistoryButton(!!savedSessions && savedSessions !== '[]');
      } catch (error) {
        console.error('Error checking session history:', error);
      }
    };

    checkHistory();

    // Listen for storage events to update the button visibility
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionHistory') {
        checkHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Create a test session for debugging
  const createTestSession = useCallback(() => {
    const testSession: SessionHistory = {
      id: generateSessionId(),
      title: "Test Session",
      date: Date.now(),
      duration: 120000, // 2 minutes
      messageCount: 2,
      patientType: "test",
      messages: [
        {
          id: "msg1",
          text: "Hello, how are you feeling today?",
          isAgent: true,
          timestamp: Date.now() - 60000
        },
        {
          id: "msg2",
          text: "I'm feeling fine, thank you for asking.",
          isAgent: false,
          timestamp: Date.now() - 30000
        }
      ],
      presetId: "test_preset"
    };

    // Save to localStorage directly
    saveSession(testSession);

    // Show success toast
    toast({
      title: "Test session created",
      description: "A test session has been added to your history",
    });
  }, [generateSessionId, saveSession]);

  // Function to save session history
  const saveSessionHistory = useCallback(() => {
    console.log("Saving session history. Session start time:", sessionStartTimeRef.current);
    console.log("Transcriptions:", displayTranscriptions);

    try {
      // Only save if we had a valid session
      if (sessionStartTimeRef.current) {
        const sessionDuration = Date.now() - sessionStartTimeRef.current;

        // Get the selected preset
        const selectedPreset = helpers.getSelectedPreset(pgState);
        console.log("Selected preset:", selectedPreset);

        // Create a test message if there are no transcriptions
        let messages: Message[] = [];
        if (displayTranscriptions.length === 0) {
          console.log("No transcriptions found, creating test message");
          messages = [{
            id: "test_message",
            text: "This was a session without any messages",
            isAgent: true,
            timestamp: Date.now()
          }];
        } else {
          // Convert transcriptions to messages
          messages = displayTranscriptions.map(transcription => ({
            id: transcription.segment.id,
            text: transcription.segment.text,
            isAgent: !!transcription.participant?.isAgent,
            timestamp: transcription.segment.firstReceivedTime || Date.now()
          }));
        }

        // Always save the session, even if there are no messages
        // This ensures short sessions are still recorded
        const sessionHistory: SessionHistory = {
          id: generateSessionId(),
          title: selectedPreset?.name || "Untitled Session",
          date: sessionStartTimeRef.current,
          duration: sessionDuration,
          messageCount: messages.length,
          patientType: selectedPreset?.defaultGroup || "custom",
          messages: messages,
          presetId: selectedPreset?.id
        };

        // Save session to local storage
        saveSession(sessionHistory);

        // Show success toast
        toast({
          title: "Session saved",
          description: "Your conversation has been saved to history",
        });

        // For debugging - log the saved session
        console.log("Saved session:", sessionHistory);

        // Reset session start time
        sessionStartTimeRef.current = null;
      } else {
        console.log("No session to save - session start time not set");
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error saving session",
        description: "There was an error saving your session history",
        variant: "destructive",
      });
    }
  }, [displayTranscriptions, generateSessionId, helpers, pgState, saveSession, toast]);

  // Track connection state changes and session start/end
  const prevConnectionStateRef = useRef<ConnectionState | null>(null);

  useEffect(() => {
    console.log("Connection state changed:", connectionState, "Previous state:", prevConnectionStateRef.current, "Agent:", !!agent, "Current start time:", sessionStartTimeRef.current);

    // Set the session start time as soon as we're connected, even if agent isn't there yet
    if (connectionState === ConnectionState.Connected && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
      console.log("Session start time set:", sessionStartTimeRef.current);
    }

    // Save session when disconnecting from a connected state
    if (prevConnectionStateRef.current === ConnectionState.Connected &&
        connectionState !== ConnectionState.Connected &&
        sessionStartTimeRef.current) {
      console.log("Connection state changed from Connected to Disconnected, saving session");
      saveSessionHistory();
    }

    // Update previous connection state
    prevConnectionStateRef.current = connectionState;
  }, [connectionState, saveSessionHistory]);

  // Wrap the disconnect function to save session history
  const disconnect = useCallback(async () => {
    console.log("Manual disconnect called");

    try {
      // Save the session history
      saveSessionHistory();

      // If there's no session data, just log it without showing a prompt
      if (!sessionStartTimeRef.current) {
        console.log("No session to save - session start time not set");
        
        // Only in development environment, create a test session automatically
        if (process.env.NODE_ENV === 'development') {
          console.log("Development environment detected, creating test session");
          createTestSession();
        }
      }
    } finally {
      // Call the original disconnect function
      await originalDisconnect();
    }
  }, [createTestSession, originalDisconnect, saveSessionHistory]);

  // Get all tracks and find the agent's video track
  const tracks = useTracks();
  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  // Handle connection state and agent presence
  useEffect(() => {
    let disconnectTimer: NodeJS.Timeout | undefined;
    let appearanceTimer: NodeJS.Timeout | undefined;

    if (connectionState === ConnectionState.Connected && !agent) {
      appearanceTimer = setTimeout(() => {
        disconnect();
        setHasSeenAgent(false);

        toast({
          title: "Agent Unavailable",
          description:
            "Unable to connect to an agent right now. Please try again later.",
          variant: "destructive",
        });
      }, 5000);
    }

    if (agent) {
      setHasSeenAgent(true);
    }

    if (
      connectionState === ConnectionState.Connected &&
      !agent &&
      hasSeenAgent
    ) {
      // Agent disappeared while connected, wait 5s before disconnecting
      disconnectTimer = setTimeout(() => {
        if (!agent) {
          disconnect();
          setHasSeenAgent(false);
        }

        toast({
          title: "Agent Disconnected",
          description:
            "The AI agent has unexpectedly left the conversation. Please try again.",
          variant: "destructive",
        });
      }, 5000);
    }

    setIsChatRunning(
      connectionState === ConnectionState.Connected && hasSeenAgent,
    );

    return () => {
      if (disconnectTimer) clearTimeout(disconnectTimer);
      if (appearanceTimer) clearTimeout(appearanceTimer);
    };
  }, [connectionState, agent, disconnect, hasSeenAgent]);

  return (
    <div className="flex flex-col h-full overflow-hidden p-1 sm:p-4 pb-16 sm:pb-20 bg-gradient-to-b from-slate-50 to-white max-w-full relative">
      <ChatControls
        showEditButton={isChatRunning}
        isEditingInstructions={isInstructionsOverlayOpen}
        onToggleEdit={() => setIsInstructionsOverlayOpen(true)}
        isChatRunning={isChatRunning}
      />

      <div className="flex flex-col w-full h-full">
        {/* Call visualization section */}
        <div className="flex-grow flex items-center justify-center">
          {isChatRunning ? (
            <div className="w-full relative">
              <VideoCallVisualizer
                state={state}
                audioTrack={audioTrack}
                videoTrack={agentVideoTrack}
                showDebugInfo={false}
                presentationMode={window.innerWidth >= 768} // Use presentation mode only on larger screens
                captionText={currentCaptionText}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto px-2 sm:px-0">
              <div className="mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-500 w-6 h-6 sm:w-8 sm:h-8"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">Ready to Start Patient Simulation</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-full break-words">
                  Connect to begin an interactive conversation with an AI-simulated patient based on your scenario instructions.
                </p>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 justify-center">
                  <Button
                    onClick={() => setIsInstructionsOverlayOpen(true)}
                    variant="outline"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    size="sm"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">View or Edit Scenario Instructions</span>
                    <span className="sm:hidden">View Instructions</span>
                  </Button>

                  {showHistoryButton && (
                    <Link href="/history">
                      <Button
                        variant="outline"
                        className="text-teal-600 border-teal-200 hover:bg-teal-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        size="sm"
                      >
                        <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="hidden sm:inline">View Session History</span>
                        <span className="sm:hidden">View History</span>
                      </Button>
                    </Link>
                  )}

                  {/* Uncomment for debugging: */}
                  {/* <Button
                    onClick={createTestSession}
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    size="sm"
                  >
                    <span className="hidden sm:inline">Create Test Session</span>
                    <span className="sm:hidden">Test Session</span>
                  </Button> */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caption display between video visualizer and controls */}
      {isChatRunning && currentCaptionText && state === "speaking" && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center items-center mb-4 sm:mb-6"
        >
          <div className="bg-gray-700/70 backdrop-blur-sm rounded-xl px-4 py-2 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] mx-auto">
            <p className="text-xs sm:text-sm text-white text-center">
              {currentCaptionText}
            </p>
          </div>
        </motion.div>
      )}

      {/* Controls at bottom */}
      {/* Both controls are now fixed positioned */}
      {!isChatRunning ? <ConnectButton /> : <SessionControls />}

      {/* Instructions Overlay */}
      <InstructionsOverlay
        isOpen={isInstructionsOverlayOpen}
        onClose={() => setIsInstructionsOverlayOpen(false)}
        onStartConversation={() => {
          setIsInstructionsOverlayOpen(false);
          if (!isChatRunning) {
            connect(); // Start the connection if not already running
          }
        }}
      />
    </div>
  );
}
