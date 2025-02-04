// app/models/Data.js
import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
  callNo: { type: String, unique: true },
  natureOfComplaint: { type: String},
  callStatus: { type: String},
  // faultReport: { type: String},
  callDate: { type: String},
  callStartDate: { type: String},
  callEndDate: { type: String},
  engineerName: { type: String},
  // engineerContact:{ type: String},
  // serialNo:{ type: String},
  // productCategory: { type: String},
  // productSeries: { type: String},
  // productName: { type: String},
  // productModel: { type: String},
  // unitStatus: { type: String},
  // unitStartDate: { type: String},
  // unitEndDate:{ type: String},
  // customerName: { type: String},
  // customerAddress: { type: String},
  // customerPhone:{ type: String},
  // customerEmail: { type: String},
  // contactPerson: { type: String},
  // contactPersonPhone: { type: String},
  // contactPersonDesignation: { type: String},
  region: { type: String},
  branch: { type: String},
  // city:{ type: String},
  // state: { type: String},
  // servicePersonRemarks:{ type: String},
  month: { type: String},
  year: { type: String},
});

export default mongoose.models.NewData || mongoose.model("NewData", DataSchema);


