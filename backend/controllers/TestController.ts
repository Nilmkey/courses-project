// import User from "./schemes/User";
// import bcrypt from "bcrypt";
// import {
//   UserRegistrationSchema,
//   UserRegistrationInput,
// } from "./validation/UserScheme";
// import z from "zod";
// class TestController {
//   static async test(req: any, res: any) {
//     try {
//       const validatedData = UserRegistrationSchema.parse(req.body);
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(validatedData.password, salt);
//       const user = await User.create({
//         ...validatedData,
//         password: hashedPassword,
//       });
//       return res.status(201).json({
//         message: "Пользователь успешно зарегистрирован",
//         user: {
//           id: user._id,
//           email: user.email,
//           name: user.name,
//         },
//       });
//     } catch (error: any) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({
//           message: "Ошибка валидации",
//           errors: error.flatten().fieldErrors,
//         });
//       }
//     }
//   }
// }

// export default TestController;
