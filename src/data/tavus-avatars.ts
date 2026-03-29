export interface TavusAvatar {
  id: string;
  replicaId: string;
  personaId: string;
  name: string;
  description: string;
}

// Avatar categories for mapping to patient presets
export enum AvatarCategory {
  CHILD = "child",
  YOUNG_ADULT = "young_adult",
  ADULT_FEMALE = "adult_female",
  ADULT_MALE = "adult_male",
  ELDERLY_FEMALE = "elderly_female",
  ELDERLY_MALE = "elderly_male",
}

// Available Tavus avatars — replace placeholder IDs with real Tavus replica/persona IDs
export const availableAvatars: TavusAvatar[] = [
  {
    id: "avatar-child",
    replicaId: "REPLACE_WITH_TAVUS_REPLICA_ID",
    personaId: "REPLACE_WITH_TAVUS_PERSONA_ID",
    name: "Young Patient",
    description: "Child/adolescent patient avatar",
  },
  {
    id: "avatar-young-female",
    replicaId: "REPLACE_WITH_TAVUS_REPLICA_ID",
    personaId: "REPLACE_WITH_TAVUS_PERSONA_ID",
    name: "Young Adult Female",
    description: "Female patient in her 20s-30s",
  },
  {
    id: "avatar-adult-female",
    replicaId: "REPLACE_WITH_TAVUS_REPLICA_ID",
    personaId: "REPLACE_WITH_TAVUS_PERSONA_ID",
    name: "Adult Female",
    description: "Female patient in her 40s-50s",
  },
  {
    id: "avatar-adult-male",
    replicaId: "REPLACE_WITH_TAVUS_REPLICA_ID",
    personaId: "REPLACE_WITH_TAVUS_PERSONA_ID",
    name: "Adult Male",
    description: "Male patient in his 40s-50s",
  },
  {
    id: "avatar-elderly-female",
    replicaId: "REPLACE_WITH_TAVUS_REPLICA_ID",
    personaId: "REPLACE_WITH_TAVUS_PERSONA_ID",
    name: "Elderly Female",
    description: "Female patient in her 60s-70s",
  },
  {
    id: "avatar-elderly-male",
    replicaId: "REPLACE_WITH_TAVUS_REPLICA_ID",
    personaId: "REPLACE_WITH_TAVUS_PERSONA_ID",
    name: "Elderly Male",
    description: "Male patient in his 60s-70s",
  },
];

// Mapping from preset ID to avatar ID for default presets
export const presetAvatarMap: Record<string, string> = {
  "diabetes-child": "avatar-child",            // Emma Miller, 10yo girl
  "asthma-teen": "avatar-child",               // Jessica Rodriguez, 16yo
  "pregnant-first-time": "avatar-young-female", // Sophia Chen, 29yo
  "health-anxiety": "avatar-young-female",      // Sarah Miller, 34yo
  "substance-abuse": "avatar-adult-female",     // Michelle Thompson, 42yo
  "anxiety-future-worries": "avatar-adult-female", // Sarah Mitchell, 43yo
  "chronic-pain": "avatar-adult-female",        // Rebecca Wilson, 45yo
  "medication-non-adherent": "avatar-adult-female", // Janet Collins, 52yo
  "cultural-barriers": "avatar-elderly-female", // Mei Lin, 58yo
  "terminal-illness": "avatar-elderly-female",  // Patricia Winters, 64yo
  "alzheimers-early": "avatar-elderly-female",  // Dr. Eleanor Green, 67yo
  "hypertension-elder": "avatar-elderly-female", // Martha Johnson, 78yo
};

export function getAvatarForPreset(presetId: string): TavusAvatar | null {
  const avatarId = presetAvatarMap[presetId];
  if (!avatarId) return null;
  return availableAvatars.find((a) => a.id === avatarId) ?? null;
}

export function getAvatarById(avatarId: string): TavusAvatar | null {
  return availableAvatars.find((a) => a.id === avatarId) ?? null;
}
