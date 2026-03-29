// src/components/InstructionsOverlay.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Edit, Briefcase, Book, AlertCircle, Heart, MessageSquare, Activity, Save, CheckCircle, X, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface InstructionsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: () => void;
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

// Add this type definition near your other interfaces
type EditableSections = {
  background?: string;
  policies?: string;
  issues?: string;
  emotional?: string;
  communication?: string;
  behavior?: string;
  [key: string]: string | undefined;
};

// Interface for parsed instruction sections
interface ParsedInstructions {
  patientProfile: string;
  medicalKnowledge: string;
  symptomsExperiences: string;
  medicalHistory: string;
  emotionalState: string;
  communicationPattern: string;
  behavioralTendencies: string;
  // Track the positions of each section for merging
  positions: {
    patientProfile: { start: number; end: number };
    medicalKnowledge: { start: number; end: number };
    symptomsExperiences: { start: number; end: number };
    medicalHistory: { start: number; end: number };
    emotionalState: { start: number; end: number };
    communicationPattern: { start: number; end: number };
    behavioralTendencies: { start: number; end: number };
  };
}

// Function to parse instructions into sections
function parseInstructions(text: string): ParsedInstructions {
  const sections: ParsedInstructions = {
    patientProfile: "",
    medicalKnowledge: "",
    symptomsExperiences: "",
    medicalHistory: "",
    emotionalState: "",
    communicationPattern: "",
    behavioralTendencies: "",
    positions: {
      patientProfile: { start: -1, end: -1 },
      medicalKnowledge: { start: -1, end: -1 },
      symptomsExperiences: { start: -1, end: -1 },
      medicalHistory: { start: -1, end: -1 },
      emotionalState: { start: -1, end: -1 },
      communicationPattern: { start: -1, end: -1 },
      behavioralTendencies: { start: -1, end: -1 }
    }
  };

  try {
    // Parser for "PATIENT PROFILE:" section
    if (text.includes("PATIENT PROFILE:")) {
      const start = text.indexOf("PATIENT PROFILE:");
      const end = text.includes("MEDICAL KNOWLEDGE:") ?
                text.indexOf("MEDICAL KNOWLEDGE:") :
                text.length;
      sections.patientProfile = text.substring(start, end).trim();
      sections.positions.patientProfile = { start, end };
    }

    // Parser for "MEDICAL KNOWLEDGE:" section
    if (text.includes("MEDICAL KNOWLEDGE:")) {
      const start = text.indexOf("MEDICAL KNOWLEDGE:");
      const end = text.includes("SYMPTOMS/EXPERIENCES:") ?
                text.indexOf("SYMPTOMS/EXPERIENCES:") :
                (text.includes("MEDICAL HISTORY:") ?
                text.indexOf("MEDICAL HISTORY:") :
                text.length);
      sections.medicalKnowledge = text.substring(start, end).trim();
      sections.positions.medicalKnowledge = { start, end };
    }

    // Parser for "SYMPTOMS/EXPERIENCES:" section
    if (text.includes("SYMPTOMS/EXPERIENCES:")) {
      const start = text.indexOf("SYMPTOMS/EXPERIENCES:");
      const end = text.includes("MEDICAL HISTORY:") ?
                text.indexOf("MEDICAL HISTORY:") :
                (text.includes("EMOTIONAL STATE:") ?
                text.indexOf("EMOTIONAL STATE:") :
                (text.includes("CONCERNS:") ?
                text.indexOf("CONCERNS:") :
                text.length));
      sections.symptomsExperiences = text.substring(start, end).trim();
      sections.positions.symptomsExperiences = { start, end };
    }

    // Parser for "MEDICAL HISTORY:" section
    if (text.includes("MEDICAL HISTORY:")) {
      const start = text.indexOf("MEDICAL HISTORY:");
      const end = text.includes("EMOTIONAL STATE:") ?
                text.indexOf("EMOTIONAL STATE:") :
                text.length;
      sections.medicalHistory = text.substring(start, end).trim();
      sections.positions.medicalHistory = { start, end };
    }

    // Parser for "EMOTIONAL STATE:" section
    if (text.includes("EMOTIONAL STATE:")) {
      const start = text.indexOf("EMOTIONAL STATE:");
      const end = text.includes("COMMUNICATION PATTERN:") ?
                text.indexOf("COMMUNICATION PATTERN:") :
                text.length;
      sections.emotionalState = text.substring(start, end).trim();
      sections.positions.emotionalState = { start, end };
    }

    // Parser for "COMMUNICATION PATTERN:" section
    if (text.includes("COMMUNICATION PATTERN:")) {
      const start = text.indexOf("COMMUNICATION PATTERN:");
      const end = text.includes("BEHAVIORAL TENDENCIES:") ?
                text.indexOf("BEHAVIORAL TENDENCIES:") :
                text.length;
      sections.communicationPattern = text.substring(start, end).trim();
      sections.positions.communicationPattern = { start, end };
    }

    // Parser for "BEHAVIORAL TENDENCIES:" section
    if (text.includes("BEHAVIORAL TENDENCIES:")) {
      const start = text.indexOf("BEHAVIORAL TENDENCIES:");
      sections.behavioralTendencies = text.substring(start).trim();
      sections.positions.behavioralTendencies = { start, end: text.length };
    }
  } catch (error) {
    console.error("Error parsing instructions:", error);
  }

  return sections;
}

export function InstructionsOverlay({ isOpen, onClose, onStartConversation }: InstructionsOverlayProps) {
  const { pgState, dispatch } = usePlaygroundState();
  const [selectedTab, setSelectedTab] = useState("background");
  const [currentStep, setCurrentStep] = useState(0);

  // Define steps for the mobile wizard (including "All Sections" for complete view)
  const steps = [
    { id: "all", label: "All Sections", icon: <Info className="h-4 w-4 flex-shrink-0" /> },
    { id: "background", label: "Profile", icon: <Briefcase className="h-4 w-4 flex-shrink-0" /> },
    { id: "policies", label: "Knowledge", icon: <Book className="h-4 w-4 flex-shrink-0" /> },
    { id: "issues", label: "Symptoms", icon: <AlertCircle className="h-4 w-4 flex-shrink-0" /> },
    { id: "emotional", label: "Emotional", icon: <Heart className="h-4 w-4 flex-shrink-0" /> },
    { id: "communication", label: "Communication", icon: <MessageSquare className="h-4 w-4 flex-shrink-0" /> },
    { id: "behavior", label: "Behavior", icon: <Activity className="h-4 w-4 flex-shrink-0" /> }
  ];
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedInstructions, setEditedInstructions] = useState(pgState.instructions);
  const [editedSections, setEditedSections] = useState<EditableSections>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [parsedSections, setParsedSections] = useState<ParsedInstructions>(() =>
    parseInstructions(pgState.instructions)
  );

  // Character limit for warning
  const CHARACTER_LIMIT_WARNING = 8000;

  // Re-parse sections when instructions change
  useEffect(() => {
    const instructionsToUse = isDirty && selectedTab === "all"
      ? editedInstructions
      : pgState.instructions;

    setParsedSections(parseInstructions(instructionsToUse));
  }, [editedInstructions, pgState.instructions, isDirty, selectedTab]);

  // Reset state when the overlay opens
  useEffect(() => {
    if (isOpen) {
      setEditedInstructions(pgState.instructions);
      setEditedSections({});
      setIsDirty(false);
      setIsSaved(false);
      setParsedSections(parseInstructions(pgState.instructions));
      setSelectedTab("background");
      setCurrentStep(0);
      setIsEditMode(false);
    }
  }, [isOpen, pgState.instructions]);

  // Navigation functions for the wizard with forced saving
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      // Save current section before navigating if dirty
      if (isDirty) {
        console.log("Saving before navigation to next section");
        handleSave();
      }
      
      // Navigate to next section
      setCurrentStep(currentStep + 1);
      setSelectedTab(steps[currentStep + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Save current section before navigating if dirty
      if (isDirty) {
        console.log("Saving before navigation to previous section");
        handleSave();
      }
      
      // Navigate to previous section
      setCurrentStep(currentStep - 1);
      setSelectedTab(steps[currentStep - 1].id);
    }
  };

  // Handle instruction updates - no auto-save
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    console.log(`Input change - length: ${newValue.length}, last 5 chars: "${newValue.slice(-5)}"`);

    if (selectedTab === "all") {
      setEditedInstructions(newValue);
    } else {
      // Update only the selected section
      setEditedSections({
        ...editedSections,
        [selectedTab]: newValue
      });
      
      // Verify the update was successful
      setTimeout(() => {
        const storedValue = editedSections[selectedTab];
        if (storedValue) {
          console.log(`Verified section ${selectedTab} - length: ${storedValue.length}, last 5 chars: "${storedValue.slice(-5)}"`);
        }
      }, 0);
    }

    setIsDirty(true);
  };

  // Completely new approach to fix character truncation
  const mergeEditedSection = (fullText: string, sectionName: string, newContent: string): string => {
    console.log(`DIRECT MERGE: Section ${sectionName}, Content length: ${newContent.length}`);
    console.log(`Last 10 chars of new content: "${newContent.slice(-10)}"`);
    
    // Special case for "all" - just return the new content
    if (sectionName === "all") {
      return newContent;
    }

    // Map section names to their headers
    const sectionHeaders: Record<string, string> = {
      "background": "PATIENT PROFILE:",
      "policies": "MEDICAL KNOWLEDGE:",
      "issues": "SYMPTOMS/EXPERIENCES:",
      "emotional": "EMOTIONAL STATE:",
      "communication": "COMMUNICATION PATTERN:",
      "behavior": "BEHAVIORAL TENDENCIES:"
    };
    
    // Get the current section header
    const currentHeader = sectionHeaders[sectionName];
    if (!currentHeader) {
      console.error(`Unknown section: ${sectionName}`);
      return fullText;
    }
    
    // Get all headers in order they appear in the document
    const allHeaders = Object.values(sectionHeaders);
    
    // Find the current section in the full text
    const sectionStartIndex = fullText.indexOf(currentHeader);
    if (sectionStartIndex === -1) {
      console.error(`Section header "${currentHeader}" not found in text`);
      return fullText;
    }
    
    // Find the next section header after the current one
    let nextSectionStartIndex = fullText.length;
    for (const header of allHeaders) {
      if (header === currentHeader) continue;
      
      const index = fullText.indexOf(header, sectionStartIndex + currentHeader.length);
      if (index !== -1 && index < nextSectionStartIndex) {
        nextSectionStartIndex = index;
      }
    }
    
    // Ensure the section header is preserved in the new content
    let finalContent = newContent;
    if (!finalContent.startsWith(currentHeader)) {
      finalContent = currentHeader + " " + finalContent.replace(currentHeader, "");
    }
    
    // Log the exact content we're inserting
    console.log(`Final content to insert (${finalContent.length} chars): "${finalContent}"`);
    console.log(`Last 10 chars: "${finalContent.slice(-10)}"`);
    
    // Build the new full text by concatenating:
    // 1. Everything before the current section
    // 2. The new section content
    // 3. Everything after the current section
    const beforeSection = fullText.substring(0, sectionStartIndex);
    const afterSection = fullText.substring(nextSectionStartIndex);
    
    const result = beforeSection + finalContent + afterSection;
    
    // Verify the result has the expected length
    const expectedLength = beforeSection.length + finalContent.length + afterSection.length;
    console.log(`Before section: ${beforeSection.length} chars`);
    console.log(`Final content: ${finalContent.length} chars`);
    console.log(`After section: ${afterSection.length} chars`);
    console.log(`Expected total: ${expectedLength} chars, Actual: ${result.length} chars`);
    
    // Final verification of the last characters
    console.log(`Last 20 chars of result: "${result.slice(-20)}"`);
    
    return result;
  };

  // Simplified save approach based on preset save logic
  const handleSave = () => {
    try {
      console.log("Starting simplified save operation...");
      
      // If we're editing a specific section, update that section in our local state
      if (selectedTab !== "all" && isDirty) {
        const currentContent = editedSections[selectedTab];
        
        if (currentContent !== undefined) {
          console.log(`Saving section: ${selectedTab} with length: ${currentContent.length}`);
          console.log(`Last 10 chars: "${currentContent.slice(-10)}"`);
          
          // Get the section header
          const sectionHeaders: Record<string, string> = {
            "background": "PATIENT PROFILE:",
            "policies": "MEDICAL KNOWLEDGE:",
            "issues": "SYMPTOMS/EXPERIENCES:",
            "emotional": "EMOTIONAL STATE:",
            "communication": "COMMUNICATION PATTERN:",
            "behavior": "BEHAVIORAL TENDENCIES:"
          };
          
          // Reconstruct the full instructions by replacing the section
          const fullText = pgState.instructions;
          const currentHeader = sectionHeaders[selectedTab];
          
          // Find the current section in the full text
          const sectionStartIndex = fullText.indexOf(currentHeader);
          if (sectionStartIndex === -1) {
            console.error(`Section header "${currentHeader}" not found in text`);
            return false;
          }
          
          // Find the next section header after the current one
          const allHeaders = Object.values(sectionHeaders);
          let nextSectionStartIndex = fullText.length;
          
          for (const header of allHeaders) {
            if (header === currentHeader) continue;
            
            const index = fullText.indexOf(header, sectionStartIndex + currentHeader.length);
            if (index !== -1 && index < nextSectionStartIndex) {
              nextSectionStartIndex = index;
            }
          }
          
          // Ensure the section header is preserved in the new content
          let finalContent = currentContent;
          if (!finalContent.startsWith(currentHeader)) {
            finalContent = currentHeader + " " + finalContent.replace(currentHeader, "");
          }
          
          // Build the new full text
          const beforeSection = fullText.substring(0, sectionStartIndex);
          const afterSection = fullText.substring(nextSectionStartIndex);
          const updatedInstructions = beforeSection + finalContent + afterSection;
          
          console.log(`Final content length: ${finalContent.length}`);
          console.log(`Updated instructions length: ${updatedInstructions.length}`);
          
          // Use the dispatch function to update the global state directly
          dispatch({ type: "SET_INSTRUCTIONS", payload: updatedInstructions });
          
          // Update local state
          setEditedInstructions(updatedInstructions);
          setEditedSections({});
          setIsDirty(false);
          setIsSaved(true);
          
          // Reparse sections with the updated instructions
          setParsedSections(parseInstructions(updatedInstructions));
        }
      } 
      // If we're editing the whole document, just update with the full content
      else if (isDirty) {
        console.log("Saving entire document");
        dispatch({ type: "SET_INSTRUCTIONS", payload: editedInstructions });
        
        // Update local state
        setEditedSections({});
        setIsDirty(false);
        setIsSaved(true);
        
        // Reparse sections with the updated instructions
        setParsedSections(parseInstructions(editedInstructions));
      }

      // Reset saved indicator after a delay
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
      
      console.log("Save operation completed successfully");
      return true;
    } catch (error) {
      console.error("Error saving instructions:", error);
      return false;
    }
  };

  // Handle overlay closing
  const handleClose = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  // Get the content to display/edit based on the selected tab
  const getCurrentContent = () => {
    let content = "";
    
    // Log the current state for debugging
    console.log(`Getting content for tab: ${selectedTab}`);
    console.log(`Edited sections:`, Object.keys(editedSections));
    
    switch (selectedTab) {
      case "all":
        content = isDirty ? editedInstructions : pgState.instructions;
        break;
      case "background":
        content = editedSections.background !== undefined ? editedSections.background : parsedSections.patientProfile;
        break;
      case "policies":
        content = editedSections.policies !== undefined ? editedSections.policies : parsedSections.medicalKnowledge;
        break;
      case "issues":
        content = editedSections.issues !== undefined ? editedSections.issues : parsedSections.symptomsExperiences;
        break;
      case "emotional":
        content = editedSections.emotional !== undefined ? editedSections.emotional : parsedSections.emotionalState;
        break;
      case "communication":
        content = editedSections.communication !== undefined ? editedSections.communication : parsedSections.communicationPattern;
        break;
      case "behavior":
        content = editedSections.behavior !== undefined ? editedSections.behavior : parsedSections.behavioralTendencies;
        break;
      default:
        content = isDirty ? editedInstructions : pgState.instructions;
    }
    
    console.log(`Content length: ${content.length}`);
    return content;
  };

  // Get content to display based on selected tab and mode
  const getTabContent = () => {
    const currentContent = getCurrentContent();

    if (isEditMode) {
      return (
        <div className="h-full flex flex-col">
          <textarea
            value={currentContent}
            onChange={handleInstructionsChange}
            className="w-full h-full p-3 border border-slate-200 rounded-lg font-mono text-sm resize-none flex-grow min-h-[50vh] focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none transition-all"
            placeholder={`Enter the ${selectedTab === "all" ? "patient scenario instructions" : selectedTab + " information"} here...`}
            style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
          />

          {/* Character count warning */}
          {currentContent.length > CHARACTER_LIMIT_WARNING && (
            <div className="flex items-center mt-2 text-amber-600 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>This section is getting long ({currentContent.length.toLocaleString()} characters). Consider focusing on key details.</span>
            </div>
          )}
        </div>
      );
    }

    // Return appropriate content based on selected tab
    return <div className="whitespace-pre-wrap leading-relaxed">{currentContent}</div>;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-2"
            >
              {/* Header section */}
              <div className="flex justify-between items-center p-3 sm:p-4 border-b border-slate-100 flex-shrink-0 bg-gradient-to-r from-slate-50 to-indigo-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-800">Patient Scenario Instructions</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Define patient background, medical conditions, and communication style</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {isDirty && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleSave();
                        // Force UI update to show saved state
                        setIsSaved(true);
                        // Switch to view mode after saving
                        setIsEditMode(false);
                      }}
                      className={`text-xs sm:text-sm ${isSaved ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}`}
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                          <span className="hidden sm:inline">Saved</span>
                          <span className="sm:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                          <span className="hidden sm:inline">Save Changes</span>
                          <span className="sm:hidden">Save</span>
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="text-slate-600 text-xs sm:text-sm"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{isEditMode ? "View Mode" : "Edit Mode"}</span>
                    <span className="sm:hidden">{isEditMode ? "View" : "Edit"}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-slate-500"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile wizard navigation - simplified (hidden in edit mode) */}
              {!isEditMode && (
                <div className="sm:hidden border-b border-slate-100 flex-shrink-0">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-blue-50">
                    <button 
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={`p-2 rounded-full ${currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'text-indigo-600 bg-white shadow-sm'}`}
                      aria-label="Previous section"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    
                    <div className="flex flex-col items-center px-2">
                      <div className="bg-white p-2 rounded-full shadow-sm mb-1.5">
                        {steps[currentStep].icon}
                      </div>
                      <span className="font-medium text-sm text-indigo-700">{steps[currentStep].label}</span>
                    </div>
                    
                    <button 
                      onClick={nextStep}
                      disabled={currentStep === steps.length - 1}
                      className={`p-2 rounded-full ${currentStep === steps.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-indigo-600 bg-white shadow-sm'}`}
                      aria-label="Next section"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Desktop tabs navigation */}
              <div className="hidden sm:block border-b border-slate-100 flex-shrink-0">
                <div className="flex px-2 overflow-x-auto scrollbar-hide">
                  <TabButton
                    icon={<Info className="h-4 w-4 flex-shrink-0" />}
                    label="All Sections"
                    active={selectedTab === "all"}
                    onClick={() => {
                      if (isDirty) {
                        console.log("Saving before switching to All Sections tab");
                        handleSave();
                      }
                      setSelectedTab("all");
                    }}
                  />
                  <TabButton
                    icon={<Briefcase className="h-4 w-4 flex-shrink-0" />}
                    label="Profile"
                    active={selectedTab === "background"}
                    onClick={() => {
                      if (isDirty) {
                        console.log("Saving before switching to Profile tab");
                        handleSave();
                      }
                      setSelectedTab("background");
                    }}
                  />
                  <TabButton
                    icon={<Book className="h-4 w-4 flex-shrink-0" />}
                    label="Knowledge"
                    active={selectedTab === "policies"}
                    onClick={() => {
                      if (isDirty) {
                        console.log("Saving before switching to Knowledge tab");
                        handleSave();
                      }
                      setSelectedTab("policies");
                    }}
                  />
                  <TabButton
                    icon={<AlertCircle className="h-4 w-4 flex-shrink-0" />}
                    label="Symptoms"
                    active={selectedTab === "issues"}
                    onClick={() => {
                      if (isDirty) {
                        console.log("Saving before switching to Symptoms tab");
                        handleSave();
                      }
                      setSelectedTab("issues");
                    }}
                  />
                  <TabButton
                    icon={<Heart className="h-4 w-4 flex-shrink-0" />}
                    label="Emotional"
                    active={selectedTab === "emotional"}
                    onClick={() => {
                      if (isDirty) {
                        console.log("Saving before switching to Emotional tab");
                        handleSave();
                      }
                      setSelectedTab("emotional");
                    }}
                  />
                  <TabButton
                    icon={<MessageSquare className="h-4 w-4 flex-shrink-0" />}
                    label="Communication"
                    active={selectedTab === "communication"}
                    onClick={() => {
                      if (isDirty) {
                        console.log("Saving before switching to Communication tab");
                        handleSave();
                      }
                      setSelectedTab("communication");
                    }}
                  />
                  <TabButton
                    icon={<Activity className="h-4 w-4 flex-shrink-0" />}
                    label="Behavior"
                    active={selectedTab === "behavior"}
                    onClick={() => {
                      if (isDirty) {
                        console.log("Saving before switching to Behavior tab");
                        handleSave();
                      }
                      setSelectedTab("behavior");
                    }}
                  />
                </div>
              </div>

              {/* Content area with dynamic tab content */}
              <div className={`flex-grow overflow-auto ${isEditMode ? 'p-2 sm:p-5' : 'p-4 sm:p-5'} text-sm text-slate-700 leading-relaxed`}>
              {/* Section label - always visible on mobile */}
              <div className="sm:hidden mb-3 flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                    isEditMode ? 'bg-indigo-100 text-indigo-600' : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                  }`}>
                    {steps[currentStep].icon}
                  </div>
                  <span className={`font-medium ${isEditMode ? 'text-sm text-slate-700' : 'text-xs text-indigo-600 uppercase tracking-wide'}`}>
                    {steps[currentStep].label}
                  </span>
                </div>
                
                {/* Section navigation in edit mode */}
                {isEditMode && (
                  <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                    <button 
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={`p-1.5 rounded-full ${currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'text-indigo-600 hover:bg-white hover:shadow-sm'}`}
                      aria-label="Previous section"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    
                    <span className="text-xs font-medium text-slate-600 px-1.5">
                      {currentStep + 1}/{steps.length}
                    </span>
                    
                    <button 
                      onClick={nextStep}
                      disabled={currentStep === steps.length - 1}
                      className={`p-1.5 rounded-full ${currentStep === steps.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-indigo-600 hover:bg-white hover:shadow-sm'}`}
                      aria-label="Next section"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                )}
              </div>
                
                {getTabContent()}
              </div>

              {/* Footer with character count, progress indicator, and start button */}
              <div className={`${isEditMode ? 'p-2 sm:p-4' : 'p-3 sm:p-4'} border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between flex-shrink-0`}>
                {/* Mobile progress indicator - simplified (hidden in edit mode) */}
                {!isEditMode && (
                  <div className="sm:hidden flex items-center justify-center w-full mb-3">
                    <div className="bg-slate-100 px-3 py-1.5 rounded-full">
                      <span className="text-xs font-medium text-slate-600">
                        Section {currentStep + 1} of {steps.length}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Desktop character count and button */}
                <div className="hidden sm:flex items-center justify-between w-full">
                  <span className="text-xs text-slate-500">
                    {getCurrentContent().length.toLocaleString()} characters
                    {selectedTab !== "all" && ` (section)`}
                  </span>

                  <Button
                    className="rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all px-5 h-12 border-0 text-sm font-medium"
                    onClick={() => {
                      if (isDirty) {
                        handleSave();
                        setTimeout(onStartConversation, 100);
                      } else {
                        onStartConversation();
                      }
                    }}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    <span>{isDirty ? "Save & Start Conversation" : "Start Conversation"}</span>
                  </Button>
                </div>
                
                {/* Mobile button - consistent with desktop */}
                <div className="sm:hidden w-full">
                  {isEditMode ? (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-full">
                        <span className="text-xs font-medium text-slate-600">
                          {getCurrentContent().length.toLocaleString()} characters
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="rounded-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all h-12 border-0 text-sm font-medium w-full"
                      onClick={() => {
                        if (isDirty) {
                          handleSave();
                          setTimeout(onStartConversation, 100);
                        } else {
                          onStartConversation();
                        }
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      <span>{isDirty ? "Save & Start" : "Start Conversation"}</span>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation dialog for unsaved changes */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      >
        <DialogContent>
          <DialogTitle>Unsaved Changes</DialogTitle>
          <p className="py-4">You have unsaved changes to the instructions. Do you want to save before closing?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                onClose();
              }}
            >
              Discard Changes
            </Button>
            <Button
              onClick={() => {
                handleSave();
                setShowConfirmDialog(false);
                onClose();
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Tab button component
function TabButton({ icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-3 text-sm rounded-t-lg transition-colors whitespace-nowrap ${
        active 
          ? "text-indigo-600 bg-white border-b-2 border-indigo-500" 
          : "text-slate-500 hover:bg-slate-50"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
