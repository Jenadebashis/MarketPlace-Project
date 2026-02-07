import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  // vendorId stores the UUID or Integer ID from your PostgreSQL Users table
  vendorId: {
    type: String,
    required: true,
    index: true
  },
  /**
   * specifications: Using Mixed type allows for arbitrary objects.
   * Example: { megapixels: 24, sensor: 'Full Frame' } or { material: 'Oak', width: 120 }
   */
  image: {
    type: String, // Stores the path: "uploads/12345.jpg"
    required: false
  },

  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);

/*

// Example: Updating a camera's megapixels
const product = await Product.findById(id);

product.specifications.megapixels = 50; 

// IMPORTANT: Mongoose won't see the change above unless you do this:
product.markModified('specifications'); 

await product.save();

*/