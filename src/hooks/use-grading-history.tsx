"use client";

import { useState, useEffect } from 'react';

// Define TypeScript interfaces for our data structures
export interface CompetencyScore {
  area: string;
  score: string;
  feedback: string;
  evidence: string[];
}

export interface GradeHistory {
  sessionId: string;
  timestamp: string;
  duration: number;
  overallScore: number;
  overallFeedback: string;
  competencyScores: CompetencyScore[];
  patientScenario: string;
}

// Competency area metadata
export const CompetencyMetadata: Record<string, { title: string; icon: string }> = {
  "EMPATHY": { title: "Empathy & Compassion", icon: "Heart" },
  "CLARITY": { title: "Communication Clarity", icon: "MessageSquare" },
  "CULTURAL_SENSITIVITY": { title: "Cultural Sensitivity", icon: "Globe" },
  "ACTIVE_LISTENING": { title: "Active Listening", icon: "Ear" },
  "MEDICAL_KNOWLEDGE": { title: "Medical Knowledge", icon: "Stethoscope" },
  "PATIENT_EDUCATION": { title: "Patient Education", icon: "BookOpen" },
  "RAPPORT_BUILDING": { title: "Rapport Building", icon: "Users" },
  "PROFESSIONALISM": { title: "Professionalism", icon: "Shield" }
};

// Score level metadata
export const ScoreLevelMetadata: Record<string, { 
  title: string; 
  color: string; 
  bgColor: string; 
  borderColor: string;
  value: number 
}> = {
  "EXCELLENT": { 
    title: "Excellent", 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-50", 
    borderColor: "border-emerald-200",
    value: 5 
  },
  "GOOD": { 
    title: "Good", 
    color: "text-teal-600", 
    bgColor: "bg-teal-50", 
    borderColor: "border-teal-200",
    value: 4 
  },
  "SATISFACTORY": { 
    title: "Satisfactory", 
    color: "text-blue-600", 
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-200",
    value: 3 
  },
  "NEEDS_IMPROVEMENT": { 
    title: "Needs Improvement", 
    color: "text-amber-600", 
    bgColor: "bg-amber-50", 
    borderColor: "border-amber-200",
    value: 2 
  },
  "POOR": { 
    title: "Poor", 
    color: "text-red-600", 
    bgColor: "bg-red-50", 
    borderColor: "border-red-200",
    value: 1 
  }
};

export function useGradingHistory() {
  const [grades, setGrades] = useState<GradeHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGrade, setCurrentGrade] = useState<GradeHistory | null>(null);
  
  // Configuration
  const minConversationLength = 6;

  // Load grades from localStorage on hook initialization
  useEffect(() => {
    const loadGrades = () => {
      try {
        const savedGrades = localStorage.getItem('careCoachGrades');
        if (savedGrades) {
          const parsedGrades = JSON.parse(savedGrades) as GradeHistory[];
          setGrades(parsedGrades);
        }
      } catch (error) {
        console.error('Error loading grades from localStorage:', error);
        setError('Failed to load assessment history');
      }
      setIsLoaded(true);
    };

    loadGrades();
  }, []);

  // Save a grade to history
  const saveGrade = (grade: GradeHistory) => {
    try {
      const updatedGrades = [grade, ...grades];
      setGrades(updatedGrades);
      setCurrentGrade(grade);
      
      // Save to localStorage
      localStorage.setItem('careCoachGrades', JSON.stringify(updatedGrades));
      
      return updatedGrades;
    } catch (error) {
      console.error("Error saving grade to localStorage:", error);
      setError('Failed to save assessment');
      return grades;
    }
  };

  // Delete a grade from history
  const deleteGrade = (sessionId: string) => {
    const updatedGrades = grades.filter(grade => grade.sessionId !== sessionId);
    setGrades(updatedGrades);
    localStorage.setItem('careCoachGrades', JSON.stringify(updatedGrades));
    
    // If we deleted the current grade, clear it
    if (currentGrade && currentGrade.sessionId === sessionId) {
      setCurrentGrade(null);
    }
    
    return updatedGrades;
  };

  // Clear all grades
  const clearAllGrades = () => {
    setGrades([]);
    setCurrentGrade(null);
    localStorage.removeItem('careCoachGrades');
  };

  // Check if there's enough conversation for grading
  const hasEnoughConversation = (messageCount?: number) => {
    // If messageCount is provided, use it, otherwise return true (for mock purposes)
    if (messageCount !== undefined) {
      return messageCount >= minConversationLength;
    }
    return true;
  };

  // Grade a session using LLM API
  const gradeSession = async (sessionData?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract conversation data from the session
      const conversation = sessionData?.messages || [];
      const patientScenario = sessionData?.patientScenario || "";
      
      console.log("Grading session with data:", {
        messageCount: conversation.length,
        patientScenario: patientScenario.substring(0, 100) + "...",
        sessionId: sessionData?.id
      });
      
      // If no conversation data, return error
      if (!conversation.length) {
        console.error("No conversation data available for grading");
        setError('No conversation data available for grading');
        setIsLoading(false);
        return null;
      }
      
      // Prepare the conversation transcript for analysis
      const transcript = conversation.map((msg: any) => 
        `${msg.isAgent ? 'Patient' : 'Healthcare Provider'}: ${msg.text || ""}`
      ).join('\n\n');
      
      console.log("Prepared transcript for grading, length:", transcript.length);
      
      // Call the LLM API for grading
      const response = await fetch('/api/llm/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          patientScenario,
          framework: 'HEALTHCARE_COMMUNICATION_ASSESSMENT'
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status}`, errorText);
        setError(`Grading service error: ${response.status}. Please try again later.`);
        setIsLoading(false);
        return null;
      }
      
      const gradingResult = await response.json();
      console.log("Received grading result:", gradingResult);
      
      // Format the API response into our GradeHistory structure
      const grade: GradeHistory = {
        sessionId: sessionData?.id || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        duration: sessionData?.duration || 0,
        overallScore: gradingResult.overallScore,
        overallFeedback: gradingResult.overallFeedback,
        competencyScores: gradingResult.competencyScores.map((score: any) => ({
          area: score.area,
          score: score.score,
          feedback: score.feedback,
          evidence: score.evidence
        })),
        patientScenario: patientScenario
      };
      
      // Save the grade
      saveGrade(grade);
      
      setIsLoading(false);
      return grade;
    } catch (error) {
      console.error("Error grading session:", error);
      setError('Failed to grade session. Please try again later.');
      setIsLoading(false);
      return null;
    }
  };

  // Clear the current grade
  const clearCurrentGrade = () => {
    setCurrentGrade(null);
  };

  return {
    grades,
    isLoaded,
    isLoading,
    error,
    currentGrade,
    saveGrade,
    deleteGrade,
    clearAllGrades,
    hasEnoughConversation,
    gradeSession,
    clearCurrentGrade,
    minConversationLength
  };
}
