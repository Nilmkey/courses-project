// api/v1/lessons/lessons.types.ts
export interface CreateLessonRequest {
  params: { sectionId: string };
  body: {
    title: string;
    slug: string;
    order_index?: number;
    is_free?: boolean;
    content_blocks?: Array<{
      id: string;
      title: string;
      type: 'text' | 'video' | 'quiz';
      content: Record<string, unknown>;
    }>;
  };
}

export interface UpdateLessonRequest {
  params: { id: string };
  body: {
    title?: string;
    slug?: string;
    order_index?: number;
    is_free?: boolean;
    content_blocks?: Array<{
      id: string;
      title: string;
      type: 'text' | 'video' | 'quiz';
      content: Record<string, unknown>;
    }>;
  };
}

export interface DeleteLessonRequest {
  params: { id: string };
}

export interface ReorderLessonsRequest {
  params: { sectionId: string };
  body: {
    lessonIds: string[];
  };
}

export interface GetLessonsBySectionRequest {
  params: { sectionId: string };
}

export interface LessonBlockResponse {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz';
  content: Record<string, unknown>;
  order_index?: number;
}

export interface LessonResponse {
  _id: string;
  section_id: string;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: LessonBlockResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonsListResponse {
  lessons: LessonResponse[];
}

export interface ReorderLessonsResponse {
  success: boolean;
  message: string;
}