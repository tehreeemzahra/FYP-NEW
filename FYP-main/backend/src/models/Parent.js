import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const parentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, trim: true, default: '' },
}, { timestamps: true });

parentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

parentSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const Parent = mongoose.model('Parent', parentSchema);
