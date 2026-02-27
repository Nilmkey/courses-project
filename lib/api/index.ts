// ============================================================
// API CLIENT — РЕКОМЕНДУЕМЫЙ ИМПОРТ
// ============================================================
//
// Использование:
//
// import { api, addErrorObserver } from '@/lib/api';
//
// Публичные запросы (без cookie):
// const courses = await api.get('/courses');
//
// Авторизированные запросы (с cookie):
// const profile = await api.getAuth('/profile');
// const newCourse = await api.post('/courses', { title: 'Курс' });
//
// Публичные POST (без cookie):
// await api.postPublic('/feedback', { message: 'Привет' });
//
// Переопределение withCredentials:
// await api.post('/data', body, { withCredentials: false });
//
// Глобальная обработка ошибок:
// addErrorObserver(error => {
//   if (error.status === 401) router.push('/login');
// });
//
// ============================================================

export {
  api,
  apiRequest,
  ApiError,
  addResponseInterceptor,
  addErrorObserver,
} from "./api-client";

export type { AxiosRequestConfig } from "axios";
