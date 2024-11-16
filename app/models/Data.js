// app/models/Data.js
import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
});

export default mongoose.models.Data || mongoose.model('Data', DataSchema);
