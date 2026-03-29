"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ConfigurationFormFieldProps } from "@/components/configuration-form";
import { availableAvatars } from "@/data/tavus-avatars";
import { usePlaygroundState } from "@/hooks/use-playground-state";

export function AvatarSelector({ form, ...props }: ConfigurationFormFieldProps) {
  const { dispatch } = usePlaygroundState();

  const handleAvatarChange = (avatarId: string) => {
    const avatar = availableAvatars.find((a) => a.id === avatarId);
    if (avatar) {
      dispatch({
        type: "SET_SESSION_CONFIG",
        payload: {
          tavusReplicaId: avatar.replicaId,
          tavusPersonaId: avatar.personaId,
        },
      });
    } else {
      dispatch({
        type: "SET_SESSION_CONFIG",
        payload: {
          tavusReplicaId: null,
          tavusPersonaId: null,
        },
      });
    }
  };

  // Find which avatar is currently selected based on replicaId
  const currentReplicaId = form.getValues("tavusReplicaId");
  const currentAvatar = availableAvatars.find(
    (a) => a.replicaId === currentReplicaId
  );

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <FormItem className="flex flex-row items-center space-y-0 justify-between">
          <FormLabel className="text-xs sm:text-sm">Avatar</FormLabel>
          <Select
            onValueChange={handleAvatarChange}
            value={currentAvatar?.id ?? ""}
            aria-label="Avatar"
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Choose avatar" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableAvatars.map((avatar) => (
                <SelectItem
                  key={`select-item-avatar-${avatar.id}`}
                  value={avatar.id}
                >
                  {avatar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-[260px] text-sm"
        side="bottom"
      >
        Choose the Tavus avatar for the patient. Each preset has a default
        avatar, or pick one for custom scenarios. Changes require a reconnect.
      </HoverCardContent>
    </HoverCard>
  );
}
