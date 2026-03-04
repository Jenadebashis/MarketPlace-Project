import React from 'react';
import { useForm } from 'react-hook-form';
import { apiCall } from '../api';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await apiCall('/api/auth/login', 'POST', data);

      // 1. Extract token from response
      const { token, user } = response; // Assuming your backend returns { token: "..." }

      // 2. Save to localStorage for the Interceptor
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('the user details coming here is: ', {response});

      dispatch({ type: 'SET_USER_DETAILS', payload: user })

      alert("Login Successful!");
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-sm font-semibold">Email</label>
          <input type="email" {...register("email", { required: true })} className="w-full border p-2 rounded mt-1" />
        </div>

        <div>
          <label className="block text-sm font-semibold">Password</label>
          <input type="password" {...register("password", { required: true })} className="w-full border p-2 rounded mt-1" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;