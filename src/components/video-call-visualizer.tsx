"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  useConnectionState,
  VideoTrack,
  TrackReferenceOrPlaceholder,
  TrackReference
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Clock, Mic, Activity, Shield } from "lucide-react";

// Define the possible states for the voice assistant
type VoiceAssistantState = "speaking" | "listening" | "thinking" | "idle" | "connecting" | string;

// Define the props interface for our component
interface VideoCallVisualizerProps {
  state: VoiceAssistantState;
  audioTrack?: TrackReferenceOrPlaceholder;
  videoTrack?: TrackReferenceOrPlaceholder;
  showVideo?: boolean;
  showDebugInfo?: boolean;
  presentationMode?: boolean;
  captionText?: string;
}

export function VideoCallVisualizer({
  state,
  audioTrack,
  videoTrack,
  showVideo = true,
  showDebugInfo = false,
  presentationMode = true,
  captionText
}: VideoCallVisualizerProps) {
  // Track window width for responsive design
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Update window width on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if we're on a mobile device
  const isMobile = windowWidth < 640;
  
  // Get connection state from LiveKit
  const connectionState = useConnectionState();
  
  // State and animation controls
  const [animationState, setAnimationState] = useState<VoiceAssistantState>("idle");
  const [currentTime, setCurrentTime] = useState(new Date());
  const statusAnimationControls = useAnimation();
  const audioVisualizerRef = useRef<HTMLDivElement>(null);

  // Type guard to check if a track is a valid TrackReference
  const isTrackReference = (
    track: TrackReferenceOrPlaceholder | undefined
  ): track is TrackReference => {
    return !!track && 'publication' in track && !!track.publication;
  };

  // Check if video is available and should be shown
  const hasVideo = videoTrack !== undefined && showVideo;

  // Update animation state based on connection and agent state
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      setAnimationState(state);
      
      // Status animation based on state
      if (state === "speaking") {
        statusAnimationControls.start({
          opacity: [0.8, 1, 0.8],
          y: [0, -2, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        });
      } else if (state === "listening" || state === "thinking") {
        statusAnimationControls.start({
          opacity: [0.7, 1, 0.7],
          transition: {
            duration: 2,
            repeat: Infinity
          }
        });
      } else {
        statusAnimationControls.start({
          opacity: 0.7,
          y: 0,
          transition: { duration: 0.5 }
        });
      }
    } else if (connectionState === ConnectionState.Connecting) {
      setAnimationState("connecting");
      statusAnimationControls.start({
        opacity: [0.6, 1, 0.6],
        transition: {
          duration: 1.5,
          repeat: Infinity
        }
      });
    } else {
      setAnimationState("idle");
      statusAnimationControls.start({
        opacity: 0.7,
        transition: { duration: 0.5 }
      });
    }
  }, [connectionState, state, statusAnimationControls]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get status content based on animation state
  const getStatusContent = () => {
    switch(animationState) {
      case "speaking":
        return (
          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-1.5 text-teal-600" />
            <span>Speaking...</span>
          </div>
        );
      case "listening":
        return (
          <div className="flex items-center">
            <Mic className="h-4 w-4 mr-1.5 text-emerald-600" />
            <span>Listening...</span>
          </div>
        );
      case "thinking":
        return (
          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-1.5 text-amber-600" />
            <span>Thinking...</span>
          </div>
        );
      case "connecting":
        return (
          <div className="flex items-center">
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="h-4 w-4 mr-1.5 text-indigo-600"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M12 2v4m0 16v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
            <span>Connecting...</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1.5 text-slate-500" />
            <span>Ready</span>
          </div>
        );
    }
  };

  // Create audio visualization bars
  const getAudioBars = () => {
    const barCount = 19; // Number of audio bars
    
    return Array.from({ length: barCount }).map((_, index) => {
      // Create a pattern that's highest in the center
      const distanceFromCenter = Math.abs(index - Math.floor(barCount/2));
      const maxHeight = 40; // Base height for bars
      const minHeight = 5;  // Minimum height for bars

      // Base height decreases as you move away from center
      let baseHeight = maxHeight - (distanceFromCenter * 4);
      if (baseHeight < minHeight) baseHeight = minHeight;

      // Determine bar color based on state
      const barColor = 
        animationState === "speaking" ? "bg-teal-500" : 
        animationState === "listening" ? "bg-emerald-500" : 
        animationState === "thinking" ? "bg-amber-500" : 
        animationState === "connecting" ? "bg-blue-400" :
        "bg-slate-300";

      return (
        <motion.div
          key={index}
          className={`rounded-full w-1.5 ${barColor}`}
          animate={{
            height: animationState === "speaking"
              ? [baseHeight * 0.5, baseHeight, baseHeight * 0.7]
              : baseHeight * 0.3,
            opacity: animationState === "speaking" ? [0.7, 1, 0.8] : 0.4
          }}
          transition={{
            duration: animationState === "speaking" ? 0.5 + Math.random() * 0.5 : 0.5,
            repeat: animationState === "speaking" ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: Math.random() * 0.2,
          }}
        />
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 sm:mb-20">
      {/* Main video container with 16:9 aspect ratio */}
      <div className="relative w-full aspect-video bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100 transition-all duration-300" style={{ borderRadius: "1rem" }}>
        {/* Light background with teal accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-teal-50/30"></div>
        {/* Video display */}
        {hasVideo && isTrackReference(videoTrack) ? (
          <div className="absolute inset-0 w-full h-full z-10 overflow-hidden" style={{ borderRadius: "1rem" }}>
            <VideoTrack
              trackRef={videoTrack}
              style={{ 
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 30%",
                borderRadius: "1rem"
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-teal-50 to-teal-100/30 z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="180"
              height="180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-500/50"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}

        {/* Status bar at top */}
        <div className="absolute top-0 left-0 right-0 h-8 sm:h-10 bg-white/80 backdrop-blur-sm border-b border-teal-100/50 z-20 flex items-center justify-between px-4" style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connectionState === ConnectionState.Connected 
                ? "bg-emerald-500" 
                : connectionState === ConnectionState.Connecting 
                ? "bg-amber-500" 
                : "bg-slate-400"
            }`}></div>
            <span className="text-xs font-medium text-slate-700">
              {connectionState === ConnectionState.Connected
                ? "Connected"
                : connectionState === ConnectionState.Connecting
                ? "Connecting..."
                : "Disconnected"}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-700 flex items-center">
            <Clock className="h-3 w-3 mr-1.5 text-slate-500" />
            {formattedTime}
          </div>
        </div>

        {/* Audio visualization and status indicator positioned at the bottom */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 z-20">
          {/* Status indicator */}
          <motion.div
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              animationState === "speaking" ? "bg-teal-100 text-teal-700" :
              animationState === "listening" ? "bg-emerald-100 text-emerald-700" :
              animationState === "thinking" ? "bg-amber-100 text-amber-700" :
              animationState === "connecting" ? "bg-blue-100 text-blue-700" :
              "bg-slate-100 text-slate-700"
            }`}
            animate={statusAnimationControls}
          >
            {getStatusContent()}
          </motion.div>
          
          {/* Audio visualization */}
          <div className="h-12 flex items-center justify-center gap-1" ref={audioVisualizerRef}>
            {getAudioBars()}
          </div>
        </div>
        
        {/* Bottom control bar */}
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-10 bg-white/80 backdrop-blur-sm border-t border-teal-100/50 z-20 flex items-center justify-center" style={{ borderBottomLeftRadius: "1rem", borderBottomRightRadius: "1rem" }}>
          <div className="flex items-center space-x-8">
            <div className={`w-2 h-2 rounded-full ${animationState === "speaking" ? "bg-teal-500" : "bg-slate-300"}`}></div>
            <div className={`w-2 h-2 rounded-full ${animationState === "listening" ? "bg-emerald-500" : "bg-slate-300"}`}></div>
            <div className={`w-2 h-2 rounded-full ${animationState === "thinking" ? "bg-amber-500" : "bg-slate-300"}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
