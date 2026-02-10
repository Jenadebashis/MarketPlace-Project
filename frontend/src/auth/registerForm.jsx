import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema } from '../utils/validation';
import { apiCall } from '../api';

const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registrationSchema)
  });

  const onSubmit = async (data) => {
    try {
      // Sending to your backend register route
      const response = await apiCall('/api/auth/register', 'POST', data);
      alert("Registration Successful! Please login.");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-sm font-semibold">User Name</label>
          <input {...register("name")} className="w-full border p-2 rounded mt-1" placeholder="Enter your name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold">Email Address</label>
          <input {...register("email")} className="w-full border p-2 rounded mt-1" placeholder="email@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold">Password</label>
          <input type="password" {...register("password")} className="w-full border p-2 rounded mt-1" placeholder="••••••••" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold">I am a:</label>
          <select {...register("role")} className="w-full border p-2 rounded mt-1">
            <option value="buyer">Buyer (Looking for nature/products)</option>
            <option value="seller">Seller (Offering nature experiences/products)</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;