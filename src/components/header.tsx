"use client";

import { useState, useEffect } from "react";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { PresetSelector } from "@/components/preset-selector";
import { PresetSave } from "@/components/preset-save";
import { History, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pgState, helpers } = usePlaygroundState();
  const selectedPreset = helpers.getSelectedPreset(pgState);

  // Handle scroll for progress bar and header styling
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 left-0 w-full z-40 transition-all duration-300">
      {/* Scroll progress indicator */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <div className={`relative ${isScrolled ? "backdrop-blur-md bg-white/90 shadow-sm" : "bg-white"}`}>
        <div className="container mx-auto px-1 sm:px-4 py-1.5 sm:py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>

          {/* Controls - right-aligned */}
          <div className="flex items-center justify-end space-x-3">
            {/* Back to Library */}
            <div className="flex items-center gap-2">
              {/* History Link */}
              <Link href="/history">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-slate-600 border-slate-200 hover:text-teal-700 hover:border-teal-300 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline text-xs sm:text-sm">History</span>
                </Button>
              </Link>
              
              {/* Assessments Link */}
              <Link href="/grading">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-slate-600 border-slate-200 hover:text-teal-700 hover:border-teal-300 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline text-xs sm:text-sm">Assessments</span>
                </Button>
              </Link>
            </div>

            {/* Preset Management */}
            <div className="flex items-center gap-2">
              <PresetSelector />
              <PresetSave />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Logo Component
function Logo() {
  return (
    <div className="font-bold text-base sm:text-xl tracking-tight flex items-center">
      <div className="relative mr-1.5 sm:mr-2.5">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full blur-md opacity-70"></div>
        <div className="relative w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full border border-teal-200 flex items-center justify-center shadow-sm">
          <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
        </div>
      </div>
      <span className="text-slate-800">Care</span>
      <span className="text-teal-600">Collaborative</span>
    </div>
  );
}
