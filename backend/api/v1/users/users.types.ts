// api/v1/users/users.types.ts
export interface UpdateMyProfileRequest {
  body: {
    name?: string;
    avatar?: string;
  };
}

export interface GetUserByIdRequest {
  params: { id: string };
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "student";
  createdAt: string;
}

export interface UsersListResponse {
  users: UserProfileResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserRoleRequest {
  params: { id: string };
  body: {
    role: "admin" | "student";
  };
}

export interface UserEnrollmentResponse {
  _id: string;
  course_id: string;
  enrolledAt: string;
  completedAt?: string;
  status: "active" | "completed" | "cancelled";
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    level: "beginner" | "intermediate" | "advanced";
    isPublished: boolean;
  };
  progress?: {
    overallProgress: number;
    stats: {
      totalBlocks: number;
      completedBlocks: number;
      totalLessons: number;
      completedLessons: number;
    };
  };
}

export interface UploadAvatarResponse {
  avatar: string;
  message: string;
}
