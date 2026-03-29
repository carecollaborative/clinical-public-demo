// src/components/room-component.tsx
"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";

import { ConfigurationForm } from "@/components/configuration-form";
import { Chat } from "@/components/chat";
import { Transcript } from "@/components/transcript";
import { useConnection } from "@/hooks/use-connection";
import { AgentProvider } from "@/hooks/use-agent";
import { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Create a TranscriptPanel component that will be rendered inside the LiveKitRoom
// This allows us to use LiveKit hooks safely inside this component
function TranscriptPanel() {
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="hidden lg:flex flex-col w-full lg:w-[30%] lg:max-w-[400px] lg:min-w-[280px] h-full overflow-hidden border-l border-slate-100 relative">
      {typeof Transcript !== 'undefined' && (
        <div
          className="flex-grow overflow-y-auto"
          ref={transcriptContainerRef}
        >
          <Transcript
            scrollContainerRef={transcriptContainerRef}
            scrollButtonRef={scrollButtonRef}
          />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button
          ref={scrollButtonRef}
          className="p-1.5 sm:p-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors absolute right-2 sm:right-4 bottom-2 sm:bottom-4 shadow-md flex items-center"
        >
          <ChevronDown className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-[10px] sm:text-xs pr-0.5 sm:pr-1">View latest</span>
        </button>
      </div>
    </div>
  );
}

export function RoomComponent() {
  const { shouldConnect, wsUrl, token } = useConnection();

  // Log component availability for debugging
  useEffect(() => {
    console.log("Component availability check:");
    console.log("LiveKitRoom:", typeof LiveKitRoom);
    console.log("AgentProvider:", typeof AgentProvider);
    console.log("ConfigurationForm:", typeof ConfigurationForm);
    console.log("Chat:", typeof Chat);
    console.log("Transcript:", typeof Transcript);
    console.log("RoomAudioRenderer:", typeof RoomAudioRenderer);
    console.log("StartAudio:", typeof StartAudio);
  }, []);

  // If any component is undefined, handle it gracefully
  if (typeof LiveKitRoom === 'undefined') return <div>LiveKitRoom component is not available</div>;
  if (typeof AgentProvider === 'undefined') return <div>AgentProvider component is not available</div>;
  if (typeof Chat === 'undefined') return <div>Chat component is not available</div>;

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={shouldConnect}
      audio={true}
      className="flex flex-col lg:flex-row flex-grow overflow-hidden border rounded-b-lg shadow-md bg-white relative"
      style={{ "--lk-bg": "white" } as React.CSSProperties}
      options={{
        publishDefaults: {
          stopMicTrackOnMute: true,
        },
      }}
    >
      <AgentProvider>
        <div className="flex-1 overflow-hidden">
          <Chat />
        </div>

        {/* TranscriptPanel is now a separate component that can use LiveKit hooks safely */}
        {shouldConnect && <TranscriptPanel />}

        {typeof RoomAudioRenderer !== 'undefined' && <RoomAudioRenderer />}
        {typeof StartAudio !== 'undefined' && (<StartAudio label="Click to allow audio playback" />)}
      </AgentProvider>
    </LiveKitRoom>
  );
}
