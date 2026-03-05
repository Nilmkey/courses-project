// constants/blockTypes.ts
export const BLOCK_TYPES = {
  TEXT: "text",
  VIDEO: "video",
  QUIZ: "quiz",
} as const;

export type BlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];

export const BLOCK_TYPE_VALUES = Object.values(BLOCK_TYPES) as BlockType[];

export const isBlockType = (value: string): value is BlockType => {
  return BLOCK_TYPE_VALUES.includes(value as BlockType);
};
