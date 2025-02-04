import mongoose from "mongoose";

const CpSchema = new mongoose.Schema({
  ID: { type: String},
  CUSTID: { type: String},
  PRODID: { type: String},
  SERIALNO: { type: String},
  PINCODE: { type: String},
  CUSTOMERNAME: { type: String},
  CUSTTOMERADDRESS: { type: String},
  STATE: { type: String},
  CITY: { type: String},
  REGION: { type: String},
  BRANCH: { type: String},
  PRODDESCRIPTION: { type: String},
  BATMAKE: { type: String},
  BATTYPE: { type: String},
  BATTERYCODE: { type: String},
  BATTERYCAPACITY: { type: String},
  BATTERYQTY: { type: String},
  CATEGORY: { type: String},
  NAME: { type: String},
  SERIES: { type: String},
  MODEL: { type: String},
  MODELCODE: { type: String},
  CAPACITY: { type: String},
  CAPACITYUNIT:  { type: String},
});

const CP = mongoose.model('CP', CpSchema);

module.exports = CP;
