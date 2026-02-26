import { User as BetterAuthUser } from 'better-auth';
      
       // Расширяем тип пользователя из Better Auth
       export interface IUser extends BetterAuthUser {
         role: 'admin' | 'teacher' | 'student';
         avatar?: string;
         streak?: number; // Количество дней подряд, когда пользователь заходил
      }
 // Модель не создаём — Better Auth сам создаёт её!
 // Только типы для TypeScript