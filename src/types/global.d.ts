// Global type declarations for the application

interface Agent {
  transcript?: {
    messages: any[];
    startTime?: number;
  };
  instructions?: string;
}

declare global {
  interface Window {
    agent?: Agent;
  }
}

export {};
