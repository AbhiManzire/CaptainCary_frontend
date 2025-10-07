import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Ship, Eye, EyeOff, Lock, Mail } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password, 'admin');
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex flex-col justify-center py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      {/* Mobile-first responsive container */}
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center bg-white p-4 rounded-full shadow-lg">
              <Ship className="h-10 w-10 sm:h-12 sm:w-12 text-primary-600" />
              <span className="ml-3 text-xl sm:text-2xl font-bold text-gray-900">Captain Cary</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
            Admin Login
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="appearance-none block w-full pl-10 pr-10 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base transition-all duration-200"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm sm:text-base font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                <Ship className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
