"use client";

import { useState } from "react";
import { 
  Award, 
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGradingHistory } from "@/hooks/use-grading-history";
import { GradingResultsWrapper } from "@/components/grading/grading-results-wrapper";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence } from "framer-motion";

export const GradingHistory: React.FC = () => {
  const { 
    grades, 
    isLoaded, 
    clearAllGrades, 
    deleteGrade 
  } = useGradingHistory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Format duration from milliseconds to minutes and seconds
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };
  
  // Filter grades based on search query
  const filteredGrades = grades.filter(grade => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      grade.overallFeedback.toLowerCase().includes(lowerCaseQuery) ||
      grade.patientScenario.toLowerCase().includes(lowerCaseQuery) ||
      grade.competencyScores.some(score => 
        score.feedback.toLowerCase().includes(lowerCaseQuery) ||
        score.evidence.some(evidence => evidence.toLowerCase().includes(lowerCaseQuery))
      )
    );
  });
  
  // Get color class based on overall score
  const getScoreColorClass = (score: number): string => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800';
    if (score >= 80) return 'bg-teal-100 text-teal-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };
  
  return (
    <>
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {confirmDelete === 'all' ? 'Clear All Assessments?' : 'Delete Assessment?'}
            </h3>
            <p className="text-slate-600 mb-4">
              {confirmDelete === 'all' 
                ? "This will permanently delete all your assessment history. This action cannot be undone."
                : "This will permanently delete this assessment. This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirmDelete === 'all') {
                    clearAllGrades();
                  } else {
                    deleteGrade(confirmDelete);
                  }
                  setConfirmDelete(null);
                }}
              >
                {confirmDelete === 'all' ? 'Delete All' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected grade modal */}
      <AnimatePresence>
        {selectedGrade && (
          <GradingResultsWrapper 
            grade={grades.find(g => g.sessionId === selectedGrade) || null} 
            onClose={() => setSelectedGrade(null)}
          />
        )}
      </AnimatePresence>
      
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Assessment History</h2>
          {grades.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setConfirmDelete('all')}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Clear History
            </Button>
          )}
        </div>
        
        {/* Search bar */}
        {grades.length > 0 && (
          <div className="mb-6 relative max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {isLoaded ? (
          <>
            {filteredGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Duration</th>
                      <th scope="col" className="px-6 py-3">Score</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((grade) => (
                        <tr key={grade.sessionId} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {formatDistanceToNow(new Date(grade.timestamp), { addSuffix: true })}
                          </td>
                          <td className="px-6 py-4">{formatDuration(grade.duration)}</td>
                          <td className="px-6 py-4 font-medium">
                            <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColorClass(grade.overallScore)}`}>
                              {grade.overallScore}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="link" 
                                size="sm" 
                                onClick={() => setSelectedGrade(grade.sessionId)}
                                className="text-indigo-600 hover:text-indigo-900 p-0"
                              >
                                View
                              </Button>
                              <Button 
                                variant="link" 
                                size="sm" 
                                onClick={() => setConfirmDelete(grade.sessionId)}
                                className="text-red-500 hover:text-red-700 p-0"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No assessments found</h3>
                <p className="text-slate-500 max-w-md">
                  {searchQuery 
                    ? `No assessments match your search for "${searchQuery}"`
                    : "You haven't completed any assessments yet. Complete a conversation to see your assessment here."}
                </p>
                {searchQuery && (
                  <button
                    className="mt-4 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        )}
      </div>
    </>
  );
};
