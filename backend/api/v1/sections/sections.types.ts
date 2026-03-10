// api/v1/sections/sections.types.ts
export interface CreateSectionRequest {
  params: { courseId: string };
  body: {
    title: string;
    order_index?: number;
    isDraft?: boolean;
  };
}

export interface UpdateSectionRequest {
  params: { id: string };
  body: {
    title?: string;
    order_index?: number;
    isDraft?: boolean;
    lessons?: string[];
  };
}

export interface DeleteSectionRequest {
  params: { id: string };
}

export interface ReorderSectionsRequest {
  params: { courseId: string };
  body: {
    sectionIds: string[];
  };
}

export interface GetSectionsByCourseRequest {
  params: { courseId: string };
}

export interface SectionResponse {
  _id: string;
  course_id: string;
  title: string;
  order_index: number;
  isDraft: boolean;
  lessons: {
    _id: string;
    title: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionsListResponse {
  sections: SectionResponse[];
}

export interface ReorderSectionsResponse {
  success: boolean;
  message: string;
}