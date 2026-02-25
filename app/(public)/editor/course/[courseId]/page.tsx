import { CourseEditForm } from "./CourseEditForm";

export default function CourseEditorPage() {
  return (
    <CourseEditForm
      initialData={{
        title: "",
        description: "",
        level: "beginner",
        price: 0,
        isPublished: false,
      }}
    />
  );
}
