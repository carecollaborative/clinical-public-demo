"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useConnection } from "@/hooks/use-connection";
import { Loader2, Phone } from "lucide-react";

export function ConnectButton() {
  const { connect, disconnect, shouldConnect } = useConnection();
  const [connecting, setConnecting] = useState<boolean>(false);

  const handleConnectionToggle = async () => {
    if (shouldConnect) {
      await disconnect();
    } else {
      // Simply initiate connection - the server handles the API key
      await initiateConnection();
    }
  };

  const initiateConnection = useCallback(async () => {
    setConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setConnecting(false);
    }
  }, [connect]);

  return (
    <div className="flex justify-center w-full fixed bottom-4 sm:bottom-6 left-0 right-0 z-50">
      <Button
        onClick={handleConnectionToggle}
        className="rounded-full flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all px-4 sm:px-5 h-12 sm:h-12 border-0 text-sm font-medium"
        size="lg"
      >
        {connecting || shouldConnect ? (
          <>
            <Loader2 className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <span className="inline">Connecting</span>
          </>
        ) : (
          <>
            <Phone className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="inline">Start Conversation</span>
          </>
        )}
      </Button>
    </div>
  );
}
