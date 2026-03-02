"use client";
import { CourseEditForm } from "@/components/editor/CourseEditForm";
import { useEffect } from "react";

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
