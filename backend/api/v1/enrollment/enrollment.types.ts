import { Types } from "mongoose";

// api/v1/enrollment/enrollment.types.ts
export interface EnrollRequest {
  body: {
    courseId: string;
  };
}

export interface UnenrollRequest {
  params: { courseId: string };
}

export interface CheckEnrollmentRequest {
  params: { courseId: string };
}

export interface UpdateEnrollmentStatusRequest {
  params: { courseId: string };
  body: {
    status: 'active' | 'completed' | 'cancelled';
  };
}

export interface EnrollmentResponse {
  _id: string;
  user_id: string;
  course_id: string;
  enrolledAt: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  course?: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface EnrollmentsListResponse {
  enrollments: EnrollmentResponse[];
}

export interface IsEnrolledResponse {
  isEnrolled: boolean;
}

export interface EnrollResponse {
  success: boolean;
  message: string;
  enrollment: EnrollmentResponse;
}
export interface PopulatedCourse {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  thumbnail?: string;
  level: "beginner" | "intermediate" | "advanced";
}

export interface EnrollmentData {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  course_id: Types.ObjectId | PopulatedCourse;
  enrolledAt: Date;
  completedAt?: Date;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}