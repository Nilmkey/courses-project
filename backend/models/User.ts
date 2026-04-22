import { User as BetterAuthUser } from 'better-auth';
      
       // Расширяем тип пользователя из Better Auth
       export interface IUser extends BetterAuthUser {
         role: 'admin' | 'teacher' | 'student';
         avatar?: string;
         streak?: number; // Количество дней подряд, когда пользователь заходил
      }