import * as Joi from 'joi';

export interface AuthDto {
  email: string;
  username?: string;
  password: string;
}
export const AuthDTO = Joi.object<AuthDto>({
  username: Joi.string().min(3).max(25).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 25 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).max(50).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 50 characters',
  }),
});
