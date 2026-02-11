import z from "zod";

const UserRegistrationSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое"),
  email: z.string().email("Неверный формат почты"),
  password: z.string().min(6, "Пароль должен быть от 6 символов"),
  role: z.enum(["student", "teacher", "admin"]).optional(),
  enrolledCourses: z.array(z.string()).optional(),
});

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
export { UserRegistrationSchema };
