"use client";

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { 
  Clock, Search, Trash2, MessageSquare, 
  ChevronDown, ChevronUp, X, Users, Brain, 
  Heart, Sparkles, Zap, Activity, Printer, FileText
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import './print.css';

// Define TypeScript interfaces for our data structures
interface Message {
  id: string;
  text: string;
  isAgent: boolean;
  timestamp: number;
}

interface SessionHistory {
  id: string;
  title: string;
  date: number;
  duration: number;
  messageCount: number;
  patientType: string;
  messages: Message[];
  presetId?: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [fullMessageText, setFullMessageText] = useState<string | null>(null);

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const loadSessions = () => {
      try {
        const savedSessions = localStorage.getItem('sessionHistory');
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions) as SessionHistory[];
          setSessions(parsedSessions);
        }
      } catch (error) {
        console.error('Error loading sessions from localStorage:', error);
      }
      setIsLoaded(true);
    };

    loadSessions();
  }, []);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return true;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    // Check title, patient type, and message content
    const basicMatch = 
      session.title.toLowerCase().includes(lowerCaseQuery) ||
      session.patientType.toLowerCase().includes(lowerCaseQuery) ||
      session.messages.some(msg => msg.text.toLowerCase().includes(lowerCaseQuery));
    
    if (basicMatch) return true;
    
    // Check date in multiple formats
    const sessionDate = new Date(session.date);
    
    // Format date in various ways for searching
    const dateFormats = [
      format(sessionDate, 'MMM d').toLowerCase(), // Jun 12
      format(sessionDate, 'MMMM d').toLowerCase(), // June 12
      format(sessionDate, 'M/d').toLowerCase(), // 6/12
      format(sessionDate, 'M/d/yyyy').toLowerCase(), // 6/12/2025
      format(sessionDate, 'MM/dd/yyyy').toLowerCase(), // 06/12/2025
      format(sessionDate, 'yyyy-MM-dd').toLowerCase(), // 2025-06-12
      format(sessionDate, 'MMM yyyy').toLowerCase(), // Jun 2025
      format(sessionDate, 'MMMM yyyy').toLowerCase(), // June 2025
      format(sessionDate, 'yyyy').toLowerCase(), // 2025
    ];
    
    // Check if any date format matches the search query
    return dateFormats.some(dateStr => dateStr.includes(lowerCaseQuery));
  });

  // Toggle session expansion
  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  // Delete a session
  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('sessionHistory', JSON.stringify(updatedSessions));
    setConfirmDelete(null);
  };

  // Clear all sessions
  const clearAllSessions = () => {
    setSessions([]);
    localStorage.removeItem('sessionHistory');
    setConfirmDelete(null);
  };
  
  // Get icon for patient type
  const getPatientTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'common_conditions': <Heart className="h-5 w-5 text-teal-500" />,
      'challenging_scenarios': <Brain className="h-5 w-5 text-indigo-500" />,
      'custom': <Sparkles className="h-5 w-5 text-indigo-500" />,
      'test': <Activity className="h-5 w-5 text-teal-500" />
    };
    
    return iconMap[type] || <Users className="h-5 w-5 text-slate-500" />;
  };
  
  // Get card border color based on patient type
  const getCardBorderColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'common_conditions': 'border-teal-400',
      'challenging_scenarios': 'border-indigo-400',
      'custom': 'border-indigo-400',
      'test': 'border-teal-400'
    };
    
    return colorMap[type] || 'border-slate-200';
  };

  // Get card icon background color
  const getIconBgColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'common_conditions': 'bg-teal-100',
      'challenging_scenarios': 'bg-indigo-100',
      'custom': 'bg-indigo-100',
      'test': 'bg-teal-100'
    };
    
    return colorMap[type] || 'bg-slate-100';
  };

  // Print functionality
  const printSession = (session: SessionHistory) => {
    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${session.title} - Care Collaborative Transcript</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .metadata {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
          }
          .conversation-title {
            font-size: 18px;
            font-weight: 600;
            margin: 30px 0 20px;
          }
          .message {
            margin-bottom: 20px;
          }
          .message-sender {
            font-weight: 600;
            margin-bottom: 5px;
          }
          .message-text {
            margin-left: 20px;
          }
          .patient {
            color: #0d9488;
          }
          .provider {
            color: #4f46e5;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${session.title}</div>
          <div class="metadata">
            Date: ${format(new Date(session.date), 'MMMM d, yyyy')} | 
            Duration: ${Math.floor(session.duration / 60000)} minutes | 
            Messages: ${session.messageCount}
          </div>
        </div>
        
        <div class="conversation-title">Conversation Transcript</div>
        
        ${session.messages.map(message => `
          <div class="message">
            <div class="message-sender ${message.isAgent ? 'patient' : 'provider'}">
              ${message.isAgent ? 'Patient' : 'Healthcare Provider'} (${format(new Date(message.timestamp), 'h:mm a')}):
            </div>
            <div class="message-text">${message.text}</div>
          </div>
        `).join('')}
        
        <div class="footer">
          Printed from Care Collaborative on ${format(new Date(), 'MMMM d, yyyy')}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
    } else {
      alert('Please allow pop-ups to print the conversation.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          {/* Clean, modern header with navigation */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-teal-600 mb-3">
                Session History
              </h1>
              <p className="text-slate-600 text-lg">
                Review your past conversations with AI patients and track your progress
              </p>
            </div>
            <Link 
              href="/simulation" 
              className="mt-4 md:mt-0 py-2 px-4 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm flex items-center gap-2 shadow-sm self-start"
            >
              <span>Back to Simulation</span>
            </Link>
          </div>

          {/* Professional enterprise search bar - responsive */}
          <div className="w-full bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm mb-2">
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-sm sm:text-base"
                placeholder="Search patient conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 text-xs text-slate-500 px-1 gap-1">
              <div>
                {filteredSessions.length} {filteredSessions.length === 1 ? 'result' : 'results'} {searchQuery && `for "${searchQuery}"`}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-xs">Search by patient type, conversation content, or date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm delete modal - responsive */}
        {confirmDelete === 'all' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Clear All History?</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4">This will permanently delete all your session history. This action cannot be undone.</p>
              <div className="flex justify-end gap-2 sm:gap-3">
                <button 
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-100"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                  onClick={clearAllSessions}
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions list */}
        {isLoaded ? (
          <>
            {filteredSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                    className="group"
                  >
                    {/* Clean, modern card design */}
                    <div 
                      className={`bg-white rounded-xl border-2 ${getCardBorderColor(session.patientType)} overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative ${expandedSession === session.id ? '' : 'h-[280px]'}`}
                      onClick={() => toggleSessionExpansion(session.id)}
                    >
                      <div className="p-5">
                        {/* Session type indicator */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${session.patientType === 'test' ? 'bg-teal-500' : 'bg-indigo-500'}`}></div>
                          <span className="text-xs font-medium text-slate-500">
                            {session.patientType.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-medium text-slate-500 ml-auto">
                            {format(new Date(session.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-lg ${getIconBgColor(session.patientType)}`}>
                            {getPatientTypeIcon(session.patientType)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-slate-800 line-clamp-1">{session.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>{Math.floor(session.duration / 60000)} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 text-slate-400" />
                                <span>{session.messageCount} messages</span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {session.messages.length > 0 && (
                          <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm text-slate-700 h-24 overflow-hidden">
                            <p className="text-xs text-slate-500 mb-1">First message:</p>
                            <p className="italic line-clamp-2">&quot;{session.messages[0].text}&quot;</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div>
                            {session.presetId && (
                              <Link
                                href={`/simulation?preset=${session.presetId}`}
                                className="py-1.5 px-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm flex items-center gap-1 shadow-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Zap className="h-3.5 w-3.5" />
                                <span>Restart</span>
                              </Link>
                            )}
                          </div>
                          
                          <button
                            className={`flex items-center gap-1 text-sm font-medium ${expandedSession === session.id ? 'text-indigo-500' : 'text-teal-500'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSessionExpansion(session.id);
                            }}
                          >
                            {expandedSession === session.id ? (
                              <>
                                <span>Hide</span>
                                <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                <span>View</span>
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded conversation */}
                      <AnimatePresence>
                        {expandedSession === session.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-slate-100 overflow-hidden"
                          >
                            <div className="p-5 bg-white relative">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-slate-700 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-teal-500" />
                                  Conversation
                                </h4>
                              </div>
                              
                              <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
                                {/* Message list */}
                                {session.messages.map((message, index) => (
                                  <div
                                    key={message.id || index}
                                    className={`flex flex-col gap-1 ${message.isAgent ? "mr-auto max-w-[85%]" : "ml-auto max-w-[85%]"}`}
                                  >
                                    <div className="flex items-center text-xs text-slate-500 mb-0.5">
                                      {message.isAgent ? (
                                        <span className="font-medium text-teal-600">Patient</span>
                                      ) : (
                                        <span className="font-medium text-indigo-600">Healthcare Provider</span>
                                      )}
                                      <span className="ml-2">
                                        {format(new Date(message.timestamp), 'h:mm a')}
                                      </span>
                                    </div>
                                    <div
                                      className={`rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                        message.isAgent
                                          ? "bg-teal-50 text-slate-700 border-l-4 border-l-teal-300"
                                          : "bg-indigo-50 text-slate-700 border-l-4 border-l-indigo-300"
                                      }`}
                                    >
                                      {message.text.length > 150 ? (
                                        <>
                                          {message.text.substring(0, 150)}...
                                          <button 
                                            className="text-xs text-teal-600 hover:text-teal-800 ml-1 font-medium"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setFullMessageText(message.text);
                                            }}
                                          >
                                            Read more
                                          </button>
                                        </>
                                      ) : (
                                        message.text
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Export options */}
                              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Create a text version of the conversation
                                    const text = session.messages.map(m => 
                                      `${m.isAgent ? 'Patient' : 'Healthcare Provider'} (${format(new Date(m.timestamp), 'h:mm a')}):\n${m.text}\n`
                                    ).join('\n');
                                    
                                    // Create a blob and download
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `session-${format(new Date(session.date), 'yyyy-MM-dd')}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  }}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Export as Text
                                </button>
                                <button
                                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    printSession(session);
                                  }}
                                >
                                  <Printer className="h-3 w-3 mr-1" />
                                  Print
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No sessions found</h3>
                <p className="text-slate-500 max-w-md">
                  {searchQuery 
                    ? `No sessions match your search for "${searchQuery}"`
                    : "You haven't had any conversations yet. Start a conversation to see it here."}
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
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        )}
        
        {/* Clear history button */}
        {sessions.length > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all text-red-600 hover:text-red-700 border border-red-200 shadow-sm"
              onClick={() => setConfirmDelete('all')}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </main>
      
      {/* Full message modal - responsive */}
      {fullMessageText && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Full Message</h3>
              <button 
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                onClick={() => setFullMessageText(null)}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 bg-slate-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base text-slate-700 whitespace-pre-wrap">
              {fullMessageText}
            </div>
            <div className="mt-3 sm:mt-4 flex justify-end">
              <button
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-teal-500 text-white text-sm rounded-md hover:bg-teal-600 transition-colors"
                onClick={() => setFullMessageText(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
