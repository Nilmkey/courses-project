// api/v1/courses/courses.types.ts

import { ILessonBlock } from "@/backend/models/Lesson";

// ==================== REQUEST ====================
export interface CreateCourseRequest {
  params: Record<string, never>;
}

export interface UpdateCourseRequest {
  params: {
    id: string;
  };
  body: {
    title?: string;
    slug?: string;
    description?: string;
    thumbnail?: string;
    level?: "beginner" | "intermediate" | "advanced";
    price?: number;
    isPublished?: boolean;
    isOpenForEnrollment?: boolean;
    tags?: string[];
  };
}

export interface GetCourseBySlugRequest {
  params: {
    slug: string;
  };
}

export interface GetCourseByIdRequest {
  params: {
    id: string;
  };
}

export interface DeleteCourseRequest {
  params: {
    id: string;
  };
}

export interface PublishCourseRequest {
  params: {
    id: string;
  };
}

// ==================== RESPONSE ====================
export interface CourseResponse {
  _id: string;
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  isOpenForEnrollment: boolean;
  description?: string;
  thumbnail?: string;
  author_id: string;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface LessonItem {
  _id: string;
  section_id: string;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: ILessonBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionWithLessons {
  _id: string;
  course_id: string;
  title: string;
  order_index: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  lessons: LessonItem[];
}

export interface CourseWithSectionsResponse extends CourseResponse {
  sections: SectionWithLessons[];
}

export interface CoursesListResponse {
  courses: CourseResponse[];
}

// ==================== API Error Response ====================
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
  stack?: string;
}
