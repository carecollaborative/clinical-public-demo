// src/components/configuration-form-drawer.tsx
import { ConfigurationForm } from "@/components/configuration-form";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useRef } from "react";

interface ConfigurationFormDrawerProps {
  children: React.ReactNode;
}

export function ConfigurationFormDrawer({
  children,
}: ConfigurationFormDrawerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col h-[70vh]">
          <div className="flex-grow overflow-y-auto p-0 sm:p-2" ref={scrollContainerRef}>
            <ConfigurationForm />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
