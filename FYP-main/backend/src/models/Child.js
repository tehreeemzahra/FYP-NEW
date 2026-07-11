import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 1, max: 18 },
  loginCode: { type: String, required: true, unique: true, match: /^\d{2}$/ },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
}, { timestamps: true });

childSchema.index({ parentId: 1 });

export const Child = mongoose.model('Child', childSchema);
