import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name.'],
    unique: true,
    trim: true,
  },
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
