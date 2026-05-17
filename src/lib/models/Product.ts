import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this product.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  price: {
    type: Number,
    required: false,
    default: 0,
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image url for this product.'],
  },
  category: {
    type: String,
    required: true,
    default: 'Uncategorized',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
