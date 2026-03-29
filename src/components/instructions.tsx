"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InstructionsEditor } from "@/components/instructions-editor";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CircleHelp, FileText, Sparkles, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Instructions() {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const { pgState, dispatch } = usePlaygroundState();

  const handleSave = () => {
    dispatch({ type: "SET_INSTRUCTIONS", payload: pgState.instructions });
    setIsDirty(false);
    setIsSaved(true);

    // Reset the saved indicator after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className={`flex flex-1 flex-col w-full gap-[4px] bg-white p-6 rounded-2xl border ${
        isFocused ? "ring-2 ring-indigo-200 border-indigo-300" : 
        isDirty ? "ring-1 ring-amber-200 border-amber-300" :
        "border-slate-200 hover:border-indigo-200 transition-colors"
      } h-[400px] overflow-hidden shadow-sm relative`}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="flex items-center gap-2 text-indigo-700 font-medium">
            <FileText size={18} className="text-indigo-500" />
            <div className="text-sm uppercase tracking-wide">
              SCENARIO INSTRUCTIONS
            </div>
          </div>

          <HoverCard open={isOpen}>
            <HoverCardTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <CircleHelp
                  className="h-4 w-4 text-slate-400 cursor-pointer ml-2 hover:text-indigo-500 transition-colors"
                  onClick={() => setIsOpen(!isOpen)}
                />
              </motion.div>
            </HoverCardTrigger>
            <HoverCardContent
              className="w-[320px] text-sm bg-white p-4 shadow-md"
              side="bottom"
              onInteractOutside={() => setIsOpen(false)}
            >
              <div className="space-y-2">
                <h4 className="font-medium text-indigo-700">Patient Scenario Instructions</h4>
                <p className="text-slate-700 leading-relaxed">
                  These instructions define the character and scenario for the AI agent.
                  Providing detailed instructions helps create more realistic patient interactions.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <h5 className="font-medium text-slate-700 mb-1">Effective instructions include:</h5>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                      <span>Patient demographics and background</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                      <span>Medical history and current conditions</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                      <span>Communication style and personality traits</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                      <span>Cultural factors and specific challenges</span>
                    </li>
                  </ul>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Save Button - Appears when content is dirty */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="sm"
                onClick={handleSave}
                className={isSaved ?
                  "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" :
                  "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-500" />
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
      </div>

      {/* Editor Section with Support for Spotlight Tips */}
      <div className="flex-grow overflow-hidden relative">
        <InstructionsEditor
          instructions={pgState.instructions}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onDirty={() => setIsDirty(true)}
        />

        {/* Optional spotlight effect for empty instructions */}
        {!pgState.instructions && !isFocused && (
          <motion.div
            className="absolute bottom-4 right-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 bg-indigo-50 rounded-full px-3 py-1.5 text-xs text-indigo-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Click to enter patient details</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Character Count Indicator */}
      <div className="flex justify-end mt-2">
        <div className={`text-xs font-mono ${
          pgState.instructions.length > 5000 ? "text-amber-600" : "text-slate-500"
        }`}>
          {pgState.instructions.length.toLocaleString()} characters
        </div>
      </div>
    </motion.div>
  );
}