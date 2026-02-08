import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../../backend/utils/validation';
import { apiCall } from '../api';

const AddProductForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "Electronics",
      specifications: {},
    }
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // 1. Append basic fields
      formData.append('name', data.name);
      formData.append('price', data.price);
      formData.append('description', data.description);
      formData.append('category', data.category);

      // 2. Append the Image (assuming your input name is 'image')
      console.log('the data coming here is: ', data);
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      // 3. Stringify specifications so backend JSON.parse() works
      formData.append('specifications', JSON.stringify(data.specifications));

      // 4. Send using your centralized client
      const response = await apiCall('/api/product', 'POST', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Product added successfully!");
      console.log(response);
    } catch (error) {
      console.error("Submission error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* --- Basic Info --- */}
        <div>
          <label className="block font-medium">Product Name</label>
          <input {...register("name")} className="w-full border p-2 rounded" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Price</label>
            <input type="number" {...register("price")} className="w-full border p-2 rounded" />
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div>
          <div className="flex-1">
            <label className="block font-medium">Category</label>
            <select {...register("category")} className="w-full border p-2 rounded">
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Nature Experiences">Nature Experiences</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea {...register("description")} className="w-full border p-2 rounded" rows="3" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Product Image</label>
          <input type="file" {...register("image")} className="w-full border p-2" />
        </div>

        {/* --- Dynamic Specifications --- */}
        <div className="p-4 bg-gray-50 border rounded-md">
          <h3 className="font-semibold mb-3">Specifications for {selectedCategory}</h3>

          {selectedCategory === "Electronics" && (
            <div className="grid grid-cols-2 gap-4">
              <input {...register("specifications.brand")} placeholder="Brand" className="border p-2 rounded" />
              <input {...register("specifications.batteryLife")} placeholder="Battery Life" className="border p-2 rounded" />
            </div>
          )}

          {selectedCategory === "Clothing" && (
            <div className="grid grid-cols-2 gap-4">
              <select {...register("specifications.size")} className="border p-2 rounded">
                <option value="M">Medium</option>
                <option value="S">Small</option>
                <option value="L">Large</option>
                <option value="XL">Extra Large</option>
              </select>
              <input {...register("specifications.material")} placeholder="Material" className="border p-2 rounded" />
            </div>
          )}

          {selectedCategory === "Nature Experiences" && (
            <div className="grid grid-cols-2 gap-4">
              <input {...register("specifications.location")} placeholder="Location" className="border p-2 rounded" />
              <select {...register("specifications.difficulty")} className="border p-2 rounded">
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          )}

          {selectedCategory === "Food" && (
            <div className="grid grid-cols-2 gap-4">
              <input type="date" {...register("specifications.expiryDate")} className="border p-2 rounded" />
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("specifications.isVegan")} /> Vegan
              </label>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Uploading..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;