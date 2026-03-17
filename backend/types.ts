export interface StreakObj {
  count: number;
  isFire: boolean;
  updateAt: Date;
}

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: "student" | "teacher" | "admin";
  streak: StreakObj;
  createdAt?: Date;
}
