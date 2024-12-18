// app/models/Data.js
import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
  blank: String,
  callNo: { type: String, unique: true },
  faultReport: String,
  callDate: String,
  callStartEndDate: String,
  engineerName: String,
  serialNo: String,
  unitStatus: String,
  customerName: String,
  phoneEmail: String,
  contactPerson: String,
  regionBranch: String,
  cityState: String,
  servicePersonRemarks: String,
});

export default mongoose.models.Data || mongoose.model("Data", DataSchema);
