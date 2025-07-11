const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  OrganisationUnit: String,
  EmpName: String,
  Designation: String,
  Email: String,
  Floor: String,
  RoomNo: String,
  Landline: String,
  Department: String,
  Unit: String,
  Mobile: { type: String, required: false, unique: true }, // Not exposed to users
  lastUpdated: { type: Date, default: Date.now },
  dataSource: { type: String, enum: ['Excel', 'API'], default: 'Excel' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);

