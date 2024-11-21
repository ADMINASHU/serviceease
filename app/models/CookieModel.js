import mongoose from 'mongoose';

const CookieSchema = new mongoose.Schema({
  cookies: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Cookie || mongoose.model('Cookie', CookieSchema);
