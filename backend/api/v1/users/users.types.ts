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
  role: "admin" | "teacher" | "student";
  createdAt: string;
}

export interface UsersListResponse {
  users: UserProfileResponse[];
}
