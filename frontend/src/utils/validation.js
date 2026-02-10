import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['buyer', 'seller'])
});

const baseProduct = {
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  description: z.string().max(500, "Description too long"),
  image: z.any().optional(), // Use any() to allow the FileList object
};


export const productSchema = z.discriminatedUnion("category", [
  z.object({
    ...baseProduct,
    category: z.literal("Electronics"),
    specifications: z.object({
      brand: z.string(),
      warranty: z.string(),
      batteryLife: z.string(),
    }).partial().optional(), 
  }),

  z.object({
    ...baseProduct,
    category: z.literal("Clothing"),
    specifications: z.object({
      size: z.enum(["S", "M", "L", "XL"]),
      material: z.string(),
      gender: z.enum(["Men", "Women", "Unisex"]),
    }).partial().optional(),
  }),

  z.object({
    ...baseProduct,
    category: z.literal("Food"),
    specifications: z.object({
      expiryDate: z.string(),
      isVegan: z.boolean(),
      calories: z.number(),
    }).partial().optional(),
  }),

  z.object({
    ...baseProduct,
    category: z.literal("Nature Experiences"),
    specifications: z.object({
      duration: z.string(),
      location: z.string(),
      difficulty: z.enum(["Easy", "Moderate", "Hard"]),
    }).partial().optional(),
  }),
], {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
      return { message: "Invalid category. Please select Electronics, Clothing, Food, or Nature Experiences." };
    }
    return { message: ctx.defaultError };
  },
});