export enum ModelId {
  // GPT-4o models
  gpt_4o = "gpt-4o",
  gpt_4o_mini = "gpt-4o-mini",

}

export interface Model {
  id: ModelId;
  name: string;
}

export const models: Model[] = [
  {
    id: ModelId.gpt_4o,
    name: "GPT-4o",
  },
  {
    id: ModelId.gpt_4o_mini,
    name: "GPT-4o Mini",
  },
];