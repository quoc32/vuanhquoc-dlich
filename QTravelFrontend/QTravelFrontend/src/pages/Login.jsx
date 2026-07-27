import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/authSchema';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { useState } from 'react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', data);
      const { accessToken, refreshToken, user } = res.data; 
      login(user || { email: data.email }, accessToken, refreshToken);
      navigate('/');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2">Sign in to your QTravel account</p>
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
