import mongoose from 'mongoose';

const officerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  department: { type: String },
  role: { type: String, default: 'Officer' },
  active: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Officer', officerSchema);
