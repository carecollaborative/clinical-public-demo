"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { CheckCircle, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InstructionsEditorProps {
  instructions?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onDirty?: () => void;
}

export function InstructionsEditor({
  instructions,
  onFocus,
  onBlur,
  onDirty,
}: InstructionsEditorProps) {
  const { pgState, dispatch } = usePlaygroundState();
  const [dirty, setDirty] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState(instructions || "");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(instructions?.length || 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Example prompts to help users
  const examplePrompts = [
    "Add specific age, gender, ethnicity, and occupation",
    "Include relevant medical history and current condition",
    "Describe communication style and personality traits",
    "Mention specific cultural factors or language barriers",
    "Define emotional state and behavioral tendencies"
  ];

  // Randomly select a hint to show
  const getRandomHint = () => {
    const randomIndex = Math.floor(Math.random() * examplePrompts.length);
    return examplePrompts[randomIndex];
  };

  // Update hint when focused
  useEffect(() => {
    if (isFocused) {
      setShowHint(true);
    } else {
      // Delay hiding the hint to make it feel more natural
      const timer = setTimeout(() => setShowHint(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    setCharCount(newValue.length);

    if (newValue !== pgState.instructions) {
      setDirty(true);
      if (onDirty) {
        onDirty();
      }
    } else {
      setDirty(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleSave = () => {
    dispatch({ type: "SET_INSTRUCTIONS", payload: inputValue });
    setDirty(false);
    setIsSaved(true);

    // Reset the saved indicator after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleGeneratePrompt = () => {
    // Focus the textarea
    textareaRef.current?.focus();

    // Generate an example placeholder hint at the cursor position
    const textArea = textareaRef.current;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const hint = `\n\n/* Example: ${getRandomHint()} */\n`;

      const newValue = inputValue.substring(0, start) + hint + inputValue.substring(end);
      setInputValue(newValue);
      setDirty(true);
      if (onDirty) {
        onDirty();
      }

      // Set cursor position after the inserted text
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(start + hint.length, start + hint.length);
      }, 0);
    }
  };

  useEffect(() => {
    if (instructions !== undefined && instructions !== inputValue) {
      setInputValue(instructions);
      setCharCount(instructions.length);
      setDirty(false);
    }
  }, [instructions]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Floating action buttons */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-2 right-2 z-10"
          >
            <Button
              size="sm"
              onClick={handleSave}
              className={`rounded-full shadow-sm ${
                isSaved 
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main textarea with enhanced styling */}
      <div className="relative flex-grow flex flex-col">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Enter patient scenario instructions... (e.g., demographic info, medical history, communication style)"
          className={`w-full h-full rounded outline-none font-mono text-sm p-4 transition-all duration-200 ${
            isFocused
              ? "bg-white shadow-inner"
              : dirty
              ? "bg-amber-50/30"
              : "bg-slate-50/50"
          }`}
          style={{
            resize: "none",
            lineHeight: "1.6",
          }}
        />

        {/* Character count indicator */}
        <div className="absolute bottom-2 right-3 flex items-center gap-2">
          <span
            className={`text-xs font-mono px-1.5 py-0.5 rounded ${
              charCount > 5000 
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {/*{charCount.toLocaleString()} chars*/}
          </span>
        </div>
      </div>

      {/* Guidance tooltip that appears when focused */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-100 text-indigo-900 rounded-md px-4 py-2 shadow-md max-w-xs text-xs"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Effective patient scenarios include:</p>
                <ul className="mt-1 ml-1 space-y-1">
                  <li className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-indigo-600"></span>
                    <span>Demographics & background details</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-indigo-600"></span>
                    <span>Medical history & current issues</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-indigo-600"></span>
                    <span>Communication style & personality</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-indigo-600"></span>
                    <span>Emotional state & behavioral patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}