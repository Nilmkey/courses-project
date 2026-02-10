import User from "./schemes/User";

class TestController {
  static async test(req: any, res: any) {
    try {
      const { name, email, password, role, enrolledCourses } = req.body;
      const user = await User.create({
        name,
        email,
        password,
        role,
        enrolledCourses,
      });
      return res.status(200).json(user);
    } catch (e: any) {
      res.status(500).json({
        message: "Ошибка при создании пользователя",
        error: e.message || e.toString(),
      });
    }
  }
}

export default TestController;
