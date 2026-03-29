"use client";

import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GradingNavButtonProps {
  className?: string;
}

export const GradingNavButton: React.FC<GradingNavButtonProps> = ({ 
  className 
}) => {
  return (
    <Link href="/grading">
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-1.5 ${className}`}
      >
        <Award className="h-4 w-4 text-teal-500" />
        <span>Assessments</span>
      </Button>
    </Link>
  );
};
