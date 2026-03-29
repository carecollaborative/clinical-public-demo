"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradingResults } from "@/components/grading/grading-results";
import { GradeHistory } from "@/hooks/use-grading-history";
import { useGradingHistory } from "@/hooks/use-grading-history";

interface GradingResultsWrapperProps {
  grade: GradeHistory | null;
  onClose: () => void;
  showPlaceholder?: boolean;
}

export const GradingResultsWrapper: React.FC<GradingResultsWrapperProps> = ({
  grade,
  onClose,
  showPlaceholder = false,
}) => {
  const { minConversationLength } = useGradingHistory();

  // If we have a valid grade, show the normal grading results
  if (grade) {
    return <GradingResults grade={grade} onClose={onClose} />;
  }

  // If we don't have a grade but want to show a placeholder, show the overlay
  if (showPlaceholder) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Overlay with message */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-full p-4 mb-4">
              <AlertCircle className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Enough Interaction</h2>
            <p className="text-gray-600 max-w-md mb-6">
              For a meaningful assessment, please have at least {minConversationLength} exchanges with the patient. 
              This ensures we can properly evaluate your communication skills and provide valuable feedback.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onClose}>
                Continue Conversation
              </Button>
            </div>
          </div>

          {/* Placeholder grading UI in the background */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-teal-50 to-emerald-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Interaction Assessment</h2>
              <p className="text-gray-600">
                Sample assessment preview
              </p>
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <div className="px-6 py-2">
              <div className="grid w-full grid-cols-2 h-10 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-center font-medium">Overview</div>
                <div className="flex items-center justify-center font-medium">Competency Details</div>
              </div>
            </div>
          </div>
          
          <div className="flex-grow p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-gray-300 bg-gray-100 border-4 border-gray-200 mx-auto md:mx-0">
                --
              </div>
              <div className="flex-grow">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-gray-200 bg-gray-50 h-16"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-300">
              Powered by Care Collaborative AI Assessment
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-100 rounded"></div>
              <div className="h-8 w-20 bg-gray-100 rounded"></div>
              <div className="h-8 w-20 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // If we don't have a grade and don't want to show a placeholder, don't render anything
  return null;
};
