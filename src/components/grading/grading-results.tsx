"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  MessageSquare, 
  Globe, 
  Ear, 
  Stethoscope, 
  BookOpen, 
  Users, 
  Shield,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  X,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CompetencyMetadata, 
  ScoreLevelMetadata,
  GradeHistory,
  CompetencyScore
} from "@/hooks/use-grading-history";
import { format } from "date-fns";

// Function to create radar chart SVG for printing
const createRadarChartSVG = (scores: CompetencyScore[], size: number): string => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  
  // Get score values (1-5) for each competency
  const scoreValues = scores.map(score => {
    const value = score.score && ScoreLevelMetadata[score.score] 
      ? ScoreLevelMetadata[score.score].value 
      : 0;
    return value;
  });
  
  // Get competency names
  const competencyNames = scores.map(score => {
    const metadata = score.area && CompetencyMetadata[score.area] 
      ? CompetencyMetadata[score.area] 
      : { title: "Unknown" };
    return metadata.title;
  });
  
  // Calculate points for the radar chart
  const calculatePoints = (values: number[]) => {
    const angleStep = (Math.PI * 2) / values.length;
    
    return values.map((value, i) => {
      const normalizedValue = value / 5; // Normalize to 0-1 range
      const distance = normalizedValue * radius;
      const angle = i * angleStep - Math.PI / 2; // Start from top
      
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      return { x, y };
    });
  };
  
  // Calculate points for the radar chart
  const points = calculatePoints(scoreValues);
  
  // Create SVG path for the radar shape
  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x},${point.y}`).join(' ') + ' Z';
  };
  
  // Get color based on average score
  const getColor = (values: number[]) => {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (avg >= 4.5) return { fill: 'rgba(16, 185, 129, 0.2)', stroke: 'rgb(16, 185, 129)' }; // Emerald
    if (avg >= 3.5) return { fill: 'rgba(20, 184, 166, 0.2)', stroke: 'rgb(20, 184, 166)' }; // Teal
    if (avg >= 2.5) return { fill: 'rgba(59, 130, 246, 0.2)', stroke: 'rgb(59, 130, 246)' }; // Blue
    if (avg >= 1.5) return { fill: 'rgba(245, 158, 11, 0.2)', stroke: 'rgb(245, 158, 11)' }; // Amber
    return { fill: 'rgba(239, 68, 68, 0.2)', stroke: 'rgb(239, 68, 68)' }; // Red
  };
  
  const colors = getColor(scoreValues);
  
  // Create grid lines
  const createGridLines = () => {
    const lines = [];
    const levels = 5;
    
    for (let level = 1; level <= levels; level++) {
      const gridPoints = calculatePoints(Array(scores.length).fill(level));
      lines.push(`
        <path
          d="${createPath(gridPoints)}"
          fill="none"
          stroke="#e5e7eb"
          stroke-width="1"
          opacity="${level === levels ? 0.8 : 0.5}"
        />
      `);
    }
    
    return lines.join('');
  };
  
  // Create axis lines
  const createAxisLines = () => {
    const lines = [];
    const angleStep = (Math.PI * 2) / scores.length;
    
    for (let i = 0; i < scores.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      lines.push(`
        <line
          x1="${centerX}"
          y1="${centerY}"
          x2="${x}"
          y2="${y}"
          stroke="#e5e7eb"
          stroke-width="1"
        />
      `);
    }
    
    return lines.join('');
  };
  
  // Create labels
  const createLabels = () => {
    const labels = [];
    const angleStep = (Math.PI * 2) / scores.length;
    const labelDistance = radius * 1.15;
    
    for (let i = 0; i < scores.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + labelDistance * Math.cos(angle);
      const y = centerY + labelDistance * Math.sin(angle);
      
      // Adjust text anchor based on position
      let textAnchor = "middle";
      if (angle > -Math.PI / 4 && angle < Math.PI / 4) textAnchor = "start";
      else if (angle > Math.PI * 3/4 || angle < -Math.PI * 3/4) textAnchor = "end";
      
      labels.push(`
        <text
          x="${x}"
          y="${y}"
          text-anchor="${textAnchor}"
          dominant-baseline="middle"
          font-size="10"
          fill="#6b7280"
        >
          ${competencyNames[i]}
        </text>
      `);
    }
    
    return labels.join('');
  };
  
  // Create data points
  const createDataPoints = () => {
    const dataPoints = [];
    
    for (let i = 0; i < points.length; i++) {
      dataPoints.push(`
        <circle
          cx="${points[i].x}"
          cy="${points[i].y}"
          r="4"
          fill="white"
          stroke="${colors.stroke}"
          stroke-width="2"
        />
      `);
    }
    
    return dataPoints.join('');
  };
  
  // Combine all elements into a single SVG
  return `
    <!-- Grid lines -->
    ${createGridLines()}
    
    <!-- Axis lines -->
    ${createAxisLines()}
    
    <!-- Data shape -->
    <path
      d="${createPath(points)}"
      fill="${colors.fill}"
      stroke="${colors.stroke}"
      stroke-width="2"
    />
    
    <!-- Data points -->
    ${createDataPoints()}
    
    <!-- Labels -->
    ${createLabels()}
  `;
};

// Function to create bar chart HTML for printing
const createBarChartHTML = (scores: CompetencyScore[]): string => {
  // Sort scores by value (highest to lowest)
  const sortedScores = [...scores].sort((a, b) => {
    const aValue = a.score && ScoreLevelMetadata[a.score] ? ScoreLevelMetadata[a.score].value : 0;
    const bValue = b.score && ScoreLevelMetadata[b.score] ? ScoreLevelMetadata[b.score].value : 0;
    return bValue - aValue;
  });
  
  // Get score values and metadata
  const scoreData = sortedScores.map(score => {
    const value = score.score && ScoreLevelMetadata[score.score] 
      ? ScoreLevelMetadata[score.score].value 
      : 0;
    
    const metadata = score.area && CompetencyMetadata[score.area] 
      ? CompetencyMetadata[score.area] 
      : { title: "Unknown" };
    
    const scoreMetadata = score.score && ScoreLevelMetadata[score.score] 
      ? ScoreLevelMetadata[score.score] 
      : { 
          title: "Not Rated", 
          color: "text-gray-500", 
          bgColor: "bg-gray-50", 
          borderColor: "border-gray-200",
          value: 0 
        };
    
    return {
      title: metadata.title,
      value,
      scoreTitle: scoreMetadata.title,
      color: getBarColorForPrint(value)
    };
  });
  
  // Get color based on score value
  function getBarColorForPrint(value: number): string {
    if (value >= 5) return "#10b981"; // Emerald
    if (value >= 4) return "#14b8a6"; // Teal
    if (value >= 3) return "#3b82f6"; // Blue
    if (value >= 2) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  }
  
  // Calculate bar width based on score value (0-5)
  const getBarWidth = (value: number): string => {
    return `${(value / 5) * 100}%`;
  };
  
  // Create HTML for each bar
  const bars = scoreData.map((item, index) => `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <div style="font-size: 12px; font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.title}">
          ${item.title}
        </div>
        <div style="font-size: 12px; font-weight: 500; color: ${item.color};">
          ${item.scoreTitle}
        </div>
      </div>
      <div style="height: 24px; background-color: #f3f4f6; border-radius: 9999px; overflow: hidden;">
        <div 
          style="height: 100%; border-radius: 9999px; width: ${getBarWidth(item.value)}; background-color: ${item.color};"
        ></div>
      </div>
    </div>
  `).join('');
  
  return bars;
};

// Radar Chart Component
interface RadarChartProps {
  scores: CompetencyScore[];
  size: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ scores, size }) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  
  // Get score values (1-5) for each competency
  const scoreValues = scores.map(score => {
    const value = score.score && ScoreLevelMetadata[score.score] 
      ? ScoreLevelMetadata[score.score].value 
      : 0;
    return value;
  });
  
  // Get competency names
  const competencyNames = scores.map(score => {
    const metadata = score.area && CompetencyMetadata[score.area] 
      ? CompetencyMetadata[score.area] 
      : { title: "Unknown" };
    return metadata.title;
  });
  
  // Calculate points for the radar chart
  const calculatePoints = (values: number[]) => {
    const angleStep = (Math.PI * 2) / values.length;
    
    return values.map((value, i) => {
      const normalizedValue = value / 5; // Normalize to 0-1 range
      const distance = normalizedValue * radius;
      const angle = i * angleStep - Math.PI / 2; // Start from top
      
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      return { x, y };
    });
  };
  
  // Calculate points for the radar chart
  const points = calculatePoints(scoreValues);
  
  // Create SVG path for the radar shape
  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x},${point.y}`).join(' ') + ' Z';
  };
  
  // Get color based on average score
  const getColor = (values: number[]) => {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (avg >= 4.5) return { fill: 'rgba(16, 185, 129, 0.2)', stroke: 'rgb(16, 185, 129)' }; // Emerald
    if (avg >= 3.5) return { fill: 'rgba(20, 184, 166, 0.2)', stroke: 'rgb(20, 184, 166)' }; // Teal
    if (avg >= 2.5) return { fill: 'rgba(59, 130, 246, 0.2)', stroke: 'rgb(59, 130, 246)' }; // Blue
    if (avg >= 1.5) return { fill: 'rgba(245, 158, 11, 0.2)', stroke: 'rgb(245, 158, 11)' }; // Amber
    return { fill: 'rgba(239, 68, 68, 0.2)', stroke: 'rgb(239, 68, 68)' }; // Red
  };
  
  const colors = getColor(scoreValues);
  
  // Create grid lines
  const createGridLines = () => {
    const lines = [];
    const levels = 5;
    
    for (let level = 1; level <= levels; level++) {
      const gridPoints = calculatePoints(Array(scores.length).fill(level));
      lines.push(
        <path
          key={`grid-${level}`}
          d={createPath(gridPoints)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
          opacity={level === levels ? 0.8 : 0.5}
        />
      );
    }
    
    return lines;
  };
  
  // Create axis lines
  const createAxisLines = () => {
    const lines = [];
    const angleStep = (Math.PI * 2) / scores.length;
    
    for (let i = 0; i < scores.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      lines.push(
        <line
          key={`axis-${i}`}
          x1={centerX}
          y1={centerY}
          x2={x}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    }
    
    return lines;
  };
  
  // Create labels
  const createLabels = () => {
    const labels = [];
    const angleStep = (Math.PI * 2) / scores.length;
    const labelDistance = radius * 1.15;
    
    for (let i = 0; i < scores.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + labelDistance * Math.cos(angle);
      const y = centerY + labelDistance * Math.sin(angle);
      
      // Adjust text anchor based on position
      let textAnchor = "middle";
      if (angle > -Math.PI / 4 && angle < Math.PI / 4) textAnchor = "start";
      else if (angle > Math.PI * 3/4 || angle < -Math.PI * 3/4) textAnchor = "end";
      
      labels.push(
        <text
          key={`label-${i}`}
          x={x}
          y={y}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {competencyNames[i]}
        </text>
      );
    }
    
    return labels;
  };
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid lines */}
      {createGridLines()}
      
      {/* Axis lines */}
      {createAxisLines()}
      
      {/* Data shape */}
      <path
        d={createPath(points)}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="2"
      />
      
      {/* Data points */}
      {points.map((point, i) => (
        <circle
          key={`point-${i}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="white"
          stroke={colors.stroke}
          strokeWidth="2"
        />
      ))}
      
      {/* Labels */}
      {createLabels()}
    </svg>
  );
};

// Bar Chart Component
interface BarChartComponentProps {
  scores: CompetencyScore[];
  height: number;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ scores, height }) => {
  // Sort scores by value (highest to lowest)
  const sortedScores = [...scores].sort((a, b) => {
    const aValue = a.score && ScoreLevelMetadata[a.score] ? ScoreLevelMetadata[a.score].value : 0;
    const bValue = b.score && ScoreLevelMetadata[b.score] ? ScoreLevelMetadata[b.score].value : 0;
    return bValue - aValue;
  });
  
  // Get score values and metadata
  const scoreData = sortedScores.map(score => {
    const value = score.score && ScoreLevelMetadata[score.score] 
      ? ScoreLevelMetadata[score.score].value 
      : 0;
    
    const metadata = score.area && CompetencyMetadata[score.area] 
      ? CompetencyMetadata[score.area] 
      : { title: "Unknown" };
    
    const scoreMetadata = score.score && ScoreLevelMetadata[score.score] 
      ? ScoreLevelMetadata[score.score] 
      : { 
          title: "Not Rated", 
          color: "text-gray-500", 
          bgColor: "bg-gray-50", 
          borderColor: "border-gray-200",
          value: 0 
        };
    
    return {
      title: metadata.title,
      value,
      scoreTitle: scoreMetadata.title,
      color: getBarColor(value)
    };
  });
  
  // Get color based on score value
  function getBarColor(value: number): string {
    if (value >= 5) return "#10b981"; // Emerald
    if (value >= 4) return "#14b8a6"; // Teal
    if (value >= 3) return "#3b82f6"; // Blue
    if (value >= 2) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  }
  
  // Calculate bar width based on score value (0-5)
  const getBarWidth = (value: number): string => {
    return `${(value / 5) * 100}%`;
  };
  
  return (
    <div className="flex flex-col h-full">
      {scoreData.map((item, index) => (
        <div key={index} className="mb-3 last:mb-0">
          <div className="flex justify-between items-center mb-1 overflow-hidden">
            <div className="text-xs font-medium text-gray-700 truncate mr-2 flex-1" title={item.title}>
              {item.title}
            </div>
            <div className="text-xs font-medium flex-shrink-0" style={{ color: item.color }}>
              {item.scoreTitle}
            </div>
          </div>
          <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: getBarWidth(item.value), 
                backgroundColor: item.color 
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Map competency area to icon component
const getCompetencyIcon = (area: string) => {
  // Safely get metadata with fallback
  const metadata = area && CompetencyMetadata[area] 
    ? CompetencyMetadata[area] 
    : { title: "Unknown", icon: "MessageSquare" };
  
  const iconName = metadata.icon;
  const iconProps = { className: "h-5 w-5", strokeWidth: 2 };
  
  switch (iconName) {
    case "Heart": return <Heart {...iconProps} />;
    case "MessageSquare": return <MessageSquare {...iconProps} />;
    case "Globe": return <Globe {...iconProps} />;
    case "Ear": return <Ear {...iconProps} />;
    case "Stethoscope": return <Stethoscope {...iconProps} />;
    case "BookOpen": return <BookOpen {...iconProps} />;
    case "Users": return <Users {...iconProps} />;
    case "Shield": return <Shield {...iconProps} />;
    default: return <MessageSquare {...iconProps} />;
  }
};

interface CompetencyCardProps {
  score: CompetencyScore;
  isExpanded: boolean;
  onToggle: () => void;
}

const CompetencyCard: React.FC<CompetencyCardProps> = ({ 
  score, 
  isExpanded, 
  onToggle 
}) => {
  // Safely get metadata with fallbacks
  const metadata = score.area && CompetencyMetadata[score.area] 
    ? CompetencyMetadata[score.area] 
    : { title: "Unknown", icon: "MessageSquare" };
  
  // Safely get score metadata with fallbacks
  const scoreMetadata = score.score && ScoreLevelMetadata[score.score] 
    ? ScoreLevelMetadata[score.score] 
    : { 
        title: "Not Rated", 
        color: "text-gray-500", 
        bgColor: "bg-gray-50", 
        borderColor: "border-gray-200",
        value: 0 
      };
  
  return (
    <div className={`rounded-lg border overflow-hidden transition-all duration-300 ${scoreMetadata.borderColor}`}>
      <div 
        className={`p-4 flex items-center justify-between cursor-pointer ${scoreMetadata.bgColor}`}
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${scoreMetadata.bgColor} border ${scoreMetadata.borderColor}`}>
            {getCompetencyIcon(score.area)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{metadata.title}</h3>
            <div className={`text-sm font-medium ${scoreMetadata.color}`}>
              {scoreMetadata.title}
            </div>
          </div>
        </div>
        <div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
            <p className="text-sm text-gray-600">{score.feedback}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Evidence</h4>
            <ul className="space-y-2">
              {score.evidence.map((item: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                  &quot;{item}&quot;
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

interface GradingResultsProps {
  grade: GradeHistory;
  onClose: () => void;
}

export const GradingResults: React.FC<GradingResultsProps> = ({ 
  grade, 
  onClose 
}) => {
  const [expandedScores, setExpandedScores] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Format duration from seconds to minutes and seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60000);
    const remainingSeconds = Math.floor((seconds % 60000) / 1000);
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Toggle expanded state for a competency score
  const toggleExpanded = (area: string) => {
    setExpandedScores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(area)) {
        newSet.delete(area);
      } else {
        newSet.add(area);
      }
      return newSet;
    });
  };
  
  // Get color class based on overall score
  const getOverallScoreColor = (score: number): string => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-teal-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };
  
  // Get background color class based on overall score
  const getOverallScoreBgColor = (score: number): string => {
    if (score >= 90) return "bg-emerald-50";
    if (score >= 80) return "bg-teal-50";
    if (score >= 70) return "bg-blue-50";
    if (score >= 60) return "bg-amber-50";
    return "bg-red-50";
  };
  
  // Get border color class based on overall score
  const getOverallScoreBorderColor = (score: number): string => {
    if (score >= 90) return "border-emerald-200";
    if (score >= 80) return "border-teal-200";
    if (score >= 70) return "border-blue-200";
    if (score >= 60) return "border-amber-200";
    return "border-red-200";
  };
  
  // Calculate average score for each competency area
  const calculateAverageScore = (): number => {
    const totalValue = grade.competencyScores.reduce((sum, score) => {
      // Safely get value with fallback for undefined score
      const value = score.score && ScoreLevelMetadata[score.score] 
        ? ScoreLevelMetadata[score.score].value 
        : 0;
      return sum + value;
    }, 0);
    
    // Avoid division by zero
    if (grade.competencyScores.length === 0) return 0;
    
    return Math.round((totalValue / grade.competencyScores.length) * 20); // Scale to 0-100
  };
  
  // Sort competency scores by score level (highest to lowest)
  const sortedCompetencyScores = [...grade.competencyScores].sort((a, b) => {
    // Safely get values with fallbacks for undefined scores
    const aValue = a.score && ScoreLevelMetadata[a.score] ? ScoreLevelMetadata[a.score].value : 0;
    const bValue = b.score && ScoreLevelMetadata[b.score] ? ScoreLevelMetadata[b.score].value : 0;
    return bValue - aValue;
  });

  // Print functionality with improved styling
  const printGrade = () => {
    // Get color values based on score
    const getScoreColorStyles = (score: number) => {
      if (score >= 90) return { bg: '#ecfdf5', border: '#6ee7b7', text: '#047857' }; // Emerald
      if (score >= 80) return { bg: '#f0fdfa', border: '#5eead4', text: '#0f766e' }; // Teal
      if (score >= 70) return { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' }; // Blue
      if (score >= 60) return { bg: '#fffbeb', border: '#fcd34d', text: '#b45309' }; // Amber
      return { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' }; // Red
    };
    
    // Get competency color styles
    const getCompetencyColorStyles = (scoreLevel: string) => {
      switch (scoreLevel) {
        case 'EXCELLENT': return { bg: '#ecfdf5', border: '#6ee7b7', text: '#047857' }; // Emerald
        case 'GOOD': return { bg: '#f0fdfa', border: '#5eead4', text: '#0f766e' }; // Teal
        case 'SATISFACTORY': return { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' }; // Blue
        case 'NEEDS_IMPROVEMENT': return { bg: '#fffbeb', border: '#fcd34d', text: '#b45309' }; // Amber
        case 'POOR': return { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' }; // Red
        default: return { bg: '#f9fafb', border: '#d1d5db', text: '#4b5563' }; // Gray
      }
    };
    
    const scoreColors = getScoreColorStyles(grade.overallScore);
    
    // Create print content with improved styling
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Healthcare Communication Assessment - Care Collaborative</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #111827;
          }
          .subtitle {
            font-size: 18px;
            color: #4b5563;
            margin-bottom: 15px;
          }
          .metadata {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .overall {
            display: flex;
            margin-bottom: 30px;
            padding: 25px;
            background-color: ${scoreColors.bg};
            border: 1px solid ${scoreColors.border};
            border-radius: 8px;
          }
          .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background-color: white;
            border: 4px solid ${scoreColors.border};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            color: ${scoreColors.text};
            margin-right: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .feedback {
            flex: 1;
          }
          .feedback h2 {
            color: ${scoreColors.text};
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .feedback p {
            font-size: 16px;
            line-height: 1.7;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            margin: 35px 0 20px;
            color: #111827;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .competency {
            margin-bottom: 25px;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .competency-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .competency-title {
            font-weight: 600;
            font-size: 18px;
          }
          .competency-score {
            font-weight: 600;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 14px;
          }
          .competency-feedback {
            margin-bottom: 15px;
            line-height: 1.6;
          }
          .evidence-title {
            font-weight: 600;
            margin-bottom: 10px;
            font-size: 15px;
            color: #4b5563;
          }
          .evidence {
            margin-top: 15px;
            padding-left: 0;
          }
          .evidence-item {
            font-style: italic;
            margin-bottom: 10px;
            padding: 10px 15px;
            background-color: #f9fafb;
            border-left: 3px solid #d1d5db;
            border-radius: 0 4px 4px 0;
          }
          .scenario {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-top: 35px;
            border-left: 4px solid #9ca3af;
          }
          .scenario-title {
            font-weight: 600;
            margin-bottom: 10px;
            font-size: 16px;
            color: #4b5563;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          @media print {
            body {
              padding: 0;
              font-size: 12pt;
            }
            .competency {
              break-inside: avoid;
            }
            .overall {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Healthcare Communication Assessment</div>
          <div class="subtitle">Evidence-Based Evaluation Report</div>
          <div class="metadata">
            Date: ${format(new Date(grade.timestamp), 'MMMM d, yyyy')} | 
            Duration: ${formatDuration(grade.duration)}
          </div>
        </div>
        
        <div class="overall">
          <div class="score-circle">${grade.overallScore}</div>
          <div class="feedback">
            <h2>Overall Assessment</h2>
            <p>${grade.overallFeedback}</p>
          </div>
        </div>
        
        <div class="section-title">Competency Visualization</div>
        
        <div style="display: flex; margin-bottom: 30px; gap: 20px; flex-wrap: wrap;">
          <!-- Radar Chart Visualization -->
          <div style="flex: 1; min-width: 300px; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="font-size: 16px; color: #4b5563; margin-bottom: 15px; font-weight: 600;">Competency Radar</h3>
            <div style="width: 100%; max-width: 300px; margin: 0 auto;">
              <svg width="300" height="300" viewBox="0 0 300 300" style="max-width: 100%;">
                <!-- Radar Chart SVG -->
                ${createRadarChartSVG(grade.competencyScores, 300)}
              </svg>
            </div>
          </div>
          
          <!-- Bar Chart Visualization -->
          <div style="flex: 1; min-width: 300px; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="font-size: 16px; color: #4b5563; margin-bottom: 15px; font-weight: 600;">Competency Breakdown</h3>
            <div style="width: 100%;">
              ${createBarChartHTML(grade.competencyScores)}
            </div>
          </div>
        </div>
        
        <div class="section-title">Competency Details</div>
        
        ${sortedCompetencyScores.map(score => {
          const metadata = CompetencyMetadata[score.area] || { title: "Unknown" };
          const scoreMetadata = ScoreLevelMetadata[score.score] || { title: "Not Rated" };
          const colors = getCompetencyColorStyles(score.score);
          
          return `
            <div class="competency" style="border-left: 4px solid ${colors.border}; background-color: ${colors.bg};">
              <div class="competency-header">
                <div class="competency-title">${metadata.title}</div>
                <div class="competency-score" style="background-color: white; color: ${colors.text}; border: 1px solid ${colors.border};">
                  ${scoreMetadata.title}
                </div>
              </div>
              <div class="competency-feedback">${score.feedback}</div>
              <div class="evidence-title">Supporting Evidence:</div>
              <div class="evidence">
                ${score.evidence.map(item => `
                  <div class="evidence-item">&quot;${item}&quot;</div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
        
        <div class="section-title">Patient Scenario Context</div>
        <div class="scenario">
          <div class="scenario-title">Clinical Context for Assessment</div>
          <div style="white-space: pre-line;">${grade.patientScenario}</div>
        </div>
        
        <div class="footer">
          <p>This assessment was generated using evidence-based healthcare communication frameworks.</p>
          <p>Printed from Care Collaborative on ${format(new Date(), 'MMMM d, yyyy')}</p>
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
      alert('Please allow pop-ups to print the assessment.');
    }
  };

  // Export as text
  const exportAsText = () => {
    // Create text content
    const textContent = `
CARE COACH ASSESSMENT RESULTS
=============================

Date: ${format(new Date(grade.timestamp), 'MMMM d, yyyy')}
Duration: ${formatDuration(grade.duration)}
Overall Score: ${grade.overallScore}/100

OVERALL FEEDBACK
---------------
${grade.overallFeedback}

COMPETENCY BREAKDOWN
-------------------
${sortedCompetencyScores.map(score => {
  const metadata = CompetencyMetadata[score.area] || { title: "Unknown" };
  const scoreMetadata = ScoreLevelMetadata[score.score] || { title: "Not Rated" };
  
  return `
${metadata.title}: ${scoreMetadata.title}
Feedback: ${score.feedback}
Evidence:
${score.evidence.map(item => `  - "${item}"`).join('\n')}
`;
}).join('\n')}

PATIENT SCENARIO
---------------
${grade.patientScenario}

Generated by Care Collaborative on ${format(new Date(), 'MMMM d, yyyy')}
`;
    
    // Create a blob and download
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-${format(new Date(grade.timestamp), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-teal-50 to-emerald-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Interaction Assessment</h2>
            <p className="text-gray-600">
              Evaluated {format(new Date(grade.timestamp), 'MMMM d, yyyy')} • 
              {formatDuration(grade.duration)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="competencies">Competency Details</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
        
        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {activeTab === "overview" ? (
            <div className="p-6">
              {/* Overall Score */}
              <div className="mb-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold ${getOverallScoreColor(grade.overallScore)} ${getOverallScoreBgColor(grade.overallScore)} border-4 ${getOverallScoreBorderColor(grade.overallScore)} mx-auto md:mx-0`}>
                  {grade.overallScore}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Overall Assessment</h3>
                  <p className="text-gray-700">{grade.overallFeedback}</p>
                </div>
              </div>
              
              {/* Radar Chart for Competency Visualization */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Visualization</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-indigo-500" />
                      Competency Radar
                    </h4>
                    <div className="aspect-square relative">
                      <RadarChart 
                        scores={grade.competencyScores} 
                        size={300}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-indigo-500" />
                      Competency Breakdown
                    </h4>
                    <div className="flex-1 overflow-y-auto pr-1 pb-4">
                      <BarChartComponent 
                        scores={grade.competencyScores} 
                        height={400}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Competency Summary Cards */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedCompetencyScores.map((score) => {
                    // Safely get metadata with fallbacks
                    const metadata = score.area && CompetencyMetadata[score.area] 
                      ? CompetencyMetadata[score.area] 
                      : { title: "Unknown", icon: "MessageSquare" };
                    
                    // Safely get score metadata with fallbacks
                    const scoreMetadata = score.score && ScoreLevelMetadata[score.score] 
                      ? ScoreLevelMetadata[score.score] 
                      : { 
                          title: "Not Rated", 
                          color: "text-gray-500", 
                          bgColor: "bg-gray-50", 
                          borderColor: "border-gray-200",
                          value: 0 
                        };
                    
                    return (
                      <div 
                        key={score.area}
                        className={`p-4 rounded-lg border ${scoreMetadata.borderColor} ${scoreMetadata.bgColor} flex items-center overflow-hidden`}
                      >
                        <div className="mr-3 flex-shrink-0">
                          {getCompetencyIcon(score.area)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{metadata.title}</div>
                          <div className={`text-sm ${scoreMetadata.color}`}>
                            {scoreMetadata.title}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <div className={`text-sm font-medium ${scoreMetadata.color}`}>
                            {scoreMetadata.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Patient Scenario */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Scenario</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 max-h-60 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{grade.patientScenario}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {sortedCompetencyScores.map((score) => (
                  <CompetencyCard
                    key={score.area}
                    score={score}
                    isExpanded={expandedScores.has(score.area)}
                    onToggle={() => toggleExpanded(score.area)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Powered by Care Collaborative AI Assessment
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={printGrade}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportAsText}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
