"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { GradingHistory } from "@/components/grading/grading-history";
import { useGradingHistory } from "@/hooks/use-grading-history";
import { RefreshCw, Award, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function GradingPage() {
  const { grades, isLoaded, minConversationLength } = useGradingHistory();
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh the data
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assessment Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Link href="/simulation">
              <Button size="sm">
                Start Simulation
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Latest Assessment</h2>
          </div>
          
          {isLoaded && grades.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden p-4">
              {/* Get the most recent grade */}
              {(() => {
                const latestGrade = [...grades].sort(
                  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )[0];
                
                return (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Assessment Overview</h3>
                      <p className="text-gray-600 mb-4">{latestGrade.overallFeedback}</p>
                      <div className="flex items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mr-4 ${
                          latestGrade.overallScore >= 90 ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200' :
                          latestGrade.overallScore >= 80 ? 'bg-teal-50 text-teal-600 border-2 border-teal-200' :
                          latestGrade.overallScore >= 70 ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' :
                          latestGrade.overallScore >= 60 ? 'bg-amber-50 text-amber-600 border-2 border-amber-200' :
                          'bg-red-50 text-red-600 border-2 border-red-200'
                        }`}>
                          {latestGrade.overallScore}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Overall Score</h4>
                          <p className="text-sm text-gray-500">View your assessment history below for details</p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Results Available</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Complete a conversation in the simulation to see your real assessment results here.
                Your results will be automatically saved and displayed on this page.
              </p>
              <Link href="/simulation">
                <Button className="mx-auto">
                  Start Simulation
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* About Evidence-Based Grading */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About Evidence-Based Grading</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                <Award className="h-5 w-5 mr-2 text-teal-500" />
                Key Features
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li><strong>Comprehensive Assessment</strong> - Evaluation across 8 key competency areas</li>
                <li><strong>Evidence-Based Feedback</strong> - Direct quotes from your conversation as evidence</li>
                <li><strong>Detailed Scoring</strong> - Granular ratings from Excellent to Needs Improvement</li>
                <li><strong>Actionable Insights</strong> - Specific feedback for improvement in each area</li>
                <li><strong>Visual Clarity</strong> - Color-coded ratings and intuitive interface</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Configuration</h3>
              <p className="text-gray-600 mb-2">
                The minimum conversation length is configurable:
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
                    <span className="font-bold">{minConversationLength}</span>
                  </div>
                  <span>Minimum exchanges required for assessment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2">
                    <span className="font-bold">✓</span>
                  </div>
                  <span>Automatic assessment when ending conversation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grading History */}
        <GradingHistory />
      </main>
    </div>
  );
}
