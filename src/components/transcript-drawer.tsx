// src/components/transcript-drawer.tsx
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Transcript } from "@/components/transcript";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useAgent } from "@/hooks/use-agent";

interface TranscriptDrawerProps {
  children: React.ReactNode;
}

export function TranscriptDrawer({ children }: TranscriptDrawerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);
  const { displayTranscriptions } = useAgent();
  
  // If there are no transcriptions, don't render the drawer
  if (displayTranscriptions.length === 0) {
    return null;
  }
  
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col h-[70vh]">
          <div className="flex-grow overflow-y-auto p-0 sm:p-2" ref={scrollContainerRef}>
            <Transcript
              scrollContainerRef={scrollContainerRef}
              scrollButtonRef={scrollButtonRef}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              ref={scrollButtonRef}
              className="p-1.5 sm:p-2 bg-white text-gray-500 rounded-full hover:bg-gray-100 transition-colors absolute right-2 sm:right-4 bottom-2 sm:bottom-4 shadow-md flex items-center"
            >
              <ChevronDown className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs pr-0.5 sm:pr-1">View latest</span>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
