const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  // Zorunlu Alanlar
  deviceName: { type: String, required: true }, 
  serialNumber: { type: String, required: true }, 
  category: { type: String, required: true }, 
  brand: { type: String, required: true }, 
  model: { type: String, required: true }, 
  owner: { type: String, required: true }, 
  campus: { type: String, required: true }, // Yerleşke
  floor: { type: String, required: true }, // Kat
  warrantyEndDate: { type: String, required: true }, 
  maintenanceSchedule: { type: String, required: true },

  // Opsiyonel Alanlar
  purchaseDate: { type: String, default: null }, 
  invoiceNumber: { type: String, default: null }, 
  cost: { type: Number, default: null }, 
  supplier: { type: String, default: null }, 
  depreciationPeriod: { type: Number, default: null }, 
  maintenanceContract: { type: String, default: null }, 
  warrantyDocument: { type: String, default: null }, 
  hardwareSpecs: { type: String, default: null }, 
  softwareInfo: { type: String, default: null }, 
  connectionType: { type: String, default: null }, 
  status: { type: String, default: "Aktif" }, 
  lastUsageDate: { type: String, default: null }, 
  notes: { type: String, default: null }, 
  productImages: { type: [String], default: [] }, 
  technicalDocuments: { type: [String], default: [] }, 
});

module.exports = mongoose.model("Device", deviceSchema);
