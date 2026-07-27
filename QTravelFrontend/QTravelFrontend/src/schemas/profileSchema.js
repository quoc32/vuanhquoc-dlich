import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên không được vượt quá 50 ký tự'),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});
