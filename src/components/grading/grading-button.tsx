"use client";

import { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGradingHistory } from "@/hooks/use-grading-history";
import { GradingResultsWrapper } from "@/components/grading/grading-results-wrapper";
import { AnimatePresence } from "framer-motion";
import { useAgent } from "@/hooks/use-agent";
import { usePlaygroundState } from "@/hooks/use-playground-state";

interface GradingButtonProps {
  className?: string;
  sessionData?: any;
  messageCount?: number;
}

export const GradingButton: React.FC<GradingButtonProps> = ({ 
  className,
  sessionData,
  messageCount
}) => {
  const { 
    isLoading, 
    currentGrade, 
    gradeSession, 
    clearCurrentGrade, 
    hasEnoughConversation 
  } = useGradingHistory();
  
  // Get agent and transcriptions from the useAgent hook
  const { agent, displayTranscriptions } = useAgent();
  const { pgState } = usePlaygroundState();
  
  const [showResults, setShowResults] = useState(false);
  
  // Check if there's enough conversation for grading
  const actualMessageCount = messageCount !== undefined ? messageCount : displayTranscriptions.length;
  const hasEnoughInteraction = hasEnoughConversation(actualMessageCount);

  const handleGradeClick = async () => {
    try {
      // Always show results, even if there's not enough conversation
      setShowResults(true);
      
      // Only attempt to grade if there's enough conversation and we don't already have a grade
      if (hasEnoughInteraction && !currentGrade) {
        console.log("Starting grading process with transcriptions:", displayTranscriptions.length);
        
        // Get the current conversation data if not provided
        let dataToGrade = sessionData;
        
        // If no session data was provided, create it from the transcriptions
        if (!dataToGrade && displayTranscriptions.length > 0) {
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
          
          // Create the data object for grading
          dataToGrade = {
            id: `session_${Date.now()}`,
            duration: duration,
            patientScenario: patientScenario,
            messages: messages
          };
          
          console.log("Using transcription data for grading, message count:", messages.length);
        }
        
        // Attempt to grade with whatever data we have
        if (dataToGrade && dataToGrade.messages && dataToGrade.messages.length > 0) {
          await gradeSession(dataToGrade);
        } else {
          console.error("No conversation data available for grading");
          // Show error in UI
          setShowResults(true);
        }
      } else {
        console.log("Skipping grading process:", { 
          hasEnoughInteraction, 
          hasCurrentGrade: !!currentGrade 
        });
      }
    } catch (error) {
      console.error("Error in handleGradeClick:", error);
      // Still show results even if there was an error
      // The gradeSession function should handle fallbacks
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center relative z-20 bg-white ${className}`}
        onClick={handleGradeClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <Award className="h-4 w-4 mr-2 text-teal-500" />
            {currentGrade ? "View Assessment" : "Evaluate Interaction"}
          </>
        )}
      </Button>

      <AnimatePresence>
        {showResults && (
          <GradingResultsWrapper 
            grade={currentGrade} 
            onClose={handleCloseResults}
            showPlaceholder={!hasEnoughInteraction}
          />
        )}
      </AnimatePresence>
    </>
  );
};
