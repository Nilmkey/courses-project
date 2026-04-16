// api/v1/access/access.types.ts

export interface CheckLearnAccessRequest {
  query: {
    slug: string;
  };
}

export interface CheckLearnAccessResponse {
  hasAccess: boolean;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    isPublished: boolean;
  } | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'student';
  };
}
