import { cn } from "@/lib/utils";
import { useAgent } from "@/hooks/use-agent";
import { useEffect, useRef, RefObject, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function Transcript({
  scrollContainerRef,
  scrollButtonRef,
}: {
  scrollContainerRef: RefObject<HTMLElement>;
  scrollButtonRef: RefObject<HTMLButtonElement>;
}) {
  const { displayTranscriptions } = useAgent();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const calculateDistanceFromBottom = (container: HTMLElement) => {
    const { scrollHeight, scrollTop, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight;
  };

  const handleScrollVisibility = (
    container: HTMLElement,
    scrollButton: HTMLButtonElement,
  ) => {
    const distanceFromBottom = calculateDistanceFromBottom(container);
    const shouldShowButton = distanceFromBottom > 100;
    setShowScrollButton(shouldShowButton);
    scrollButton.style.display = shouldShowButton ? "flex" : "none";
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    const scrollButton = scrollButtonRef.current;
    if (container && scrollButton) {
      const handleScroll = () =>
        handleScrollVisibility(container, scrollButton);

      handleScroll(); // Check initial state
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [
    scrollContainerRef,
    scrollButtonRef,
    displayTranscriptions,
  ]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const distanceFromBottom = calculateDistanceFromBottom(container);
      const isNearBottom = distanceFromBottom < 100;

      if (isNearBottom) {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [displayTranscriptions, scrollContainerRef]);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const scrollButton = scrollButtonRef.current;
    if (scrollButton) {
      scrollButton.addEventListener("click", scrollToBottom);
      return () => scrollButton.removeEventListener("click", scrollToBottom);
    }
  }, [scrollButtonRef]);

  return (
    <>
      <div className="flex items-center sticky top-0 left-0 bg-white w-full p-2 sm:p-4 border-b border-slate-100 z-10">
        <div className="flex items-center">
          <div className="pill-badge bg-indigo-100 text-indigo-700 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
            Conversation Transcript
          </div>
          {displayTranscriptions.length > 0 && (
            <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-slate-500">
              {displayTranscriptions.length} messages
            </span>
          )}
        </div>
      </div>
      <div className="p-2 sm:p-4 min-h-[250px] sm:min-h-[300px] relative">
        {displayTranscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[150px] sm:h-[200px] text-slate-400 text-xs sm:text-sm">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200"></div>
            </div>
            Get talking to start the conversation!
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {displayTranscriptions.map(
              ({ segment, participant, publication }, index) => {
                if (segment.text.trim() === "") return null;

                const text = segment.text.trim();

                // Add timestamp calculation
                const timestamp = segment.firstReceivedTime
                  ? formatDistanceToNow(new Date(segment.firstReceivedTime), { addSuffix: true })
                  : "";

                return (
                  <div
                    key={segment.id}
                    className={cn(
                      "flex flex-col gap-1 w-max max-w-[95%]",
                      participant?.isAgent ? "" : "ml-auto"
                    )}
                  >
                    <div className="flex items-center text-[10px] sm:text-xs text-slate-500 mb-0.5">
                      {participant?.isAgent ? (
                        <span className="font-medium text-indigo-600">Patient</span>
                      ) : (
                        <span className="font-medium text-teal-600">You</span>
                      )}
                      {timestamp && <span className="ml-1 sm:ml-2">{timestamp}</span>}
                    </div>
                    <div
                      className={cn(
                        "flex w-max max-w-full flex-col rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-sm",
                        participant?.isAgent
                          ? "bg-indigo-50 text-slate-700"
                          : "bg-teal-50 text-slate-700 border border-teal-100"
                      )}
                    >
                      {text}
                    </div>
                  </div>
                );
              }
            )}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>
    </>
  );
}
