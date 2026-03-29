"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mic, Loader2, MicOff, Settings, Phone, Share, MonitorX } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  TrackToggle,
  useLocalParticipant,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { Track } from "livekit-client";

import { useConnection } from "@/hooks/use-connection";
import { useMultibandTrackVolume } from "@/hooks/use-multiband-track-volume";
import { GradingButton } from "@/components/grading/grading-button";
import { useGradingHistory } from "@/hooks/use-grading-history";
import { useState as useReactState } from "react";
import { GradingResultsWrapper } from "@/components/grading/grading-results-wrapper";
import { AnimatePresence } from "framer-motion";
import { useAgent } from "@/hooks/use-agent";
import { usePlaygroundState } from "@/hooks/use-playground-state";

export function SessionControls() {
  const {
    isScreenShareEnabled,
    localParticipant,
  } = useLocalParticipant();
  const deviceSelect = useMediaDeviceSelect({ kind: "audioinput" });
  const { disconnect } = useConnection();
  const { gradeSession, currentGrade, hasEnoughConversation } = useGradingHistory();
  const [showGradingResults, setShowGradingResults] = useReactState(false);
  const { agent, displayTranscriptions } = useAgent();
  const { pgState } = usePlaygroundState();

  const localMultibandVolume = useMultibandTrackVolume(
    localParticipant.getTrackPublication(Track.Source.Microphone)?.track,
    9,
  );
  const [isMuted, setIsMuted] = useState(localParticipant.isMicrophoneEnabled);
  const { isNoiseFilterEnabled, isNoiseFilterPending, setNoiseFilterEnabled } =
    useKrispNoiseFilter();
  useEffect(() => {
    setNoiseFilterEnabled(true);
  }, [setNoiseFilterEnabled]);
  useEffect(() => {
    setIsMuted(!localParticipant.isMicrophoneEnabled);
  }, [localParticipant.isMicrophoneEnabled]);

  const toggleScreenShare = async () => {
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } catch (error) {
      console.error("Failed to toggle screen sharing:", error);
    }
  };

  // Audio visualization based on the local multiband volume
  const renderVolumeIndicator = () => {
    if (!localMultibandVolume || localMultibandVolume.length === 0) return null;

    // Calculate an average volume level from the bands (simple approach)
    const averageVolume = localMultibandVolume.reduce((sum, band) => {
  // Handle different possible types of band data
  let bandAvg: number;

  if (Array.isArray(band)) {
    // Regular array case
    bandAvg = band.reduce((s, v) => s + v, 0) / band.length;
  } else if (band instanceof Float32Array) {
    // Float32Array case - convert to regular values
    const values = Array.from(band);
    bandAvg = values.reduce((s, v) => s + v, 0) / values.length;
  } else {
    // Single number case
    bandAvg = typeof band === 'number' ? band : 0;
  }

  return sum + bandAvg;
}, 0) / localMultibandVolume.length;

    // Scale to a reasonable range (0-1)
    const scaledVolume = Math.min(Math.max(averageVolume, 0), 1);

    return (
      <div className="absolute -top-1 -right-1 flex items-center justify-center">
        <motion.div
          className="h-3 w-3 rounded-full bg-emerald-500"
          animate={{
            scale: isMuted ? 1 : [1, 1 + scaledVolume, 1],
            opacity: isMuted ? 0.3 : 1
          }}
          transition={{
            duration: 0.3,
            repeat: isMuted ? 0 : Infinity,
            repeatType: "loop"
          }}
        />
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 flex justify-center items-center gap-2 sm:gap-3 w-full z-50">
      {/* Using items-center on the container helps align all contents vertically */}
      <motion.div
        className="flex items-center rounded-full bg-white shadow-lg px-1 sm:px-2 border border-slate-100 h-10 sm:h-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex gap-1.5 sm:gap-2.5 items-center">
          {/* Using a custom component with the TrackToggle so we can ensure consistent styling */}
          <TrackToggle
            source={Track.Source.Microphone}
            className={`inline-flex items-center justify-center relative rounded-full text-xs sm:text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-50 h-10 sm:h-12 py-1.5 sm:py-2 px-2 sm:px-4 ${
              isMuted 
                ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
            showIcon={false}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            ) : (
              <Mic className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
            {renderVolumeIndicator()}
          </TrackToggle>

          <Button
            variant="ghost"
            className={`inline-flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-50 h-10 sm:h-12 py-1.5 sm:py-2 px-2 sm:px-4 ${
              isScreenShareEnabled
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
            onClick={toggleScreenShare}
          >
            {isScreenShareEnabled ? (
              <>
                <MonitorX className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Stop Sharing</span>
              </>
            ) : (
              <>
                <Share className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Share Screen</span>
              </>
            )}
          </Button>
          
          {/* Grading Button */}
          <GradingButton />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="px-2 sm:px-3 h-10 sm:h-12 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              alignOffset={-5}
              className="w-[320px]"
              forceMount
            >
              <DropdownMenuLabel className="text-xs font-semibold text-indigo-700">
                Audio Device Settings
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {deviceSelect.devices.map((device, index) => (
                <DropdownMenuCheckboxItem
                  key={`device-${index}`}
                  className="text-sm"
                  checked={device.deviceId === deviceSelect.activeDeviceId}
                  onCheckedChange={() =>
                    deviceSelect.setActiveMediaDevice(device.deviceId)
                  }
                >
                  {device.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                className="text-sm"
                checked={isNoiseFilterEnabled}
                onCheckedChange={async (checked) => {
                  setNoiseFilterEnabled(checked);
                }}
                disabled={isNoiseFilterPending}
              >
                Enhanced Noise Filter
                {isNoiseFilterPending && (
                  <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                )}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <motion.div
        className="flex items-center h-10 sm:h-12"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      >
        <Button
          onClick={async () => {
            try {
              // Always show the grading UI
              setShowGradingResults(true);
              
              // Check if we have transcriptions
              if (displayTranscriptions.length === 0) {
                console.warn("No transcriptions found for grading");
                disconnect();
                return;
              }
              
              // Convert transcriptions to messages format
              const messages = displayTranscriptions.map(transcription => ({
                text: transcription.segment.text,
                isAgent: !!transcription.participant?.isAgent,
                timestamp: transcription.segment.firstReceivedTime || Date.now()
              }));
              
              // Get the start time from the first message
              const startTime = displayTranscriptions[0]?.segment.firstReceivedTime || Date.now();
              const duration = Date.now() - startTime;
              
              // Get patient scenario from the instructions
              const instructions = pgState.instructions;
              
              // Parse the instructions to get a detailed patient scenario
              let patientScenario = "Patient simulation scenario";
              
              if (instructions) {
                try {
                  // Extract key sections from the instructions to create a comprehensive scenario
                  const sections = [
                    "PATIENT PROFILE:",
                    "MEDICAL HISTORY:",
                    "SYMPTOMS/EXPERIENCES:",
                    "EMOTIONAL STATE:"
                  ];
                  
                  let detailedScenario = "";
                  
                  // Extract each section if it exists
                  sections.forEach(section => {
                    if (instructions.includes(section)) {
                      const startIndex = instructions.indexOf(section);
                      let endIndex = instructions.length;
                      
                      // Find the next section to determine where this section ends
                      for (const nextSection of sections) {
                        if (nextSection !== section) {
                          const nextSectionIndex = instructions.indexOf(nextSection, startIndex + section.length);
                          if (nextSectionIndex > startIndex && nextSectionIndex < endIndex) {
                            endIndex = nextSectionIndex;
                          }
                        }
                      }
                      
                      // Extract the section content
                      const sectionContent = instructions.substring(startIndex, endIndex).trim();
                      detailedScenario += sectionContent + "\n\n";
                    }
                  });
                  
                  if (detailedScenario) {
                    patientScenario = detailedScenario.trim();
                  }
                } catch (error) {
                  console.error("Error parsing instructions for patient scenario:", error);
                }
              }
              
              console.log("Ending conversation with transcriptions:", displayTranscriptions.length);
              
              // Only attempt to grade if there's enough conversation
              if (hasEnoughConversation(displayTranscriptions.length)) {
                // Trigger the grading process with real conversation data
                await gradeSession({
                  id: `session_${Date.now()}`,
                  duration: duration,
                  patientScenario: patientScenario,
                  messages: messages
                });
              }
              
              // Disconnect from the conversation
              disconnect();
            } catch (error) {
              console.error("Error ending conversation:", error);
              disconnect();
            }
          }}
          className="rounded-full flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all px-4 sm:px-5 h-12 sm:h-12 border-0 text-sm font-medium"
        >
          <Phone className="h-4 w-4 sm:h-5 sm:w-5 rotate-135" />
          <span className="hidden sm:inline">End Conversation</span>
          <span className="sm:hidden">End</span>
        </Button>
        
        {/* Grading Results Modal */}
        <AnimatePresence>
          {showGradingResults && (
            <GradingResultsWrapper 
              grade={currentGrade} 
              onClose={() => setShowGradingResults(false)}
              showPlaceholder={!hasEnoughConversation()}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
