import mongoose from "mongoose";

const MonthSchema = new mongoose.Schema({
  months: [{ type: Number, required: true }],
  year: { type: Number, required: true },
  savedAt: { type: Date, default: Date.now }
});

const Month = mongoose.models.Month || mongoose.model("Month", MonthSchema);

export default Month;
