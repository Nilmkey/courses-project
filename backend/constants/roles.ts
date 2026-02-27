// constants/roles.ts
export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES = Object.values(ROLES) as Role[];

export const isRole = (value: string): value is Role => {
  return ROLE_VALUES.includes(value as Role);
};
