// backend/utils/importExcel.js

const mongoose = require('mongoose');
const XLSX = require('xlsx');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Excel Import'))
  .catch(err => console.error('MongoDB Connection Failed:', err));

// Load Excel Files
const eofficeWorkbook = XLSX.readFile('excel-data/eoffice.xlsx');
const directoryWorkbook = XLSX.readFile('excel-data/directory.xlsx');

const eofficeSheet = XLSX.utils.sheet_to_json(eofficeWorkbook.Sheets[eofficeWorkbook.SheetNames[0]]);
const directorySheet = XLSX.utils.sheet_to_json(directoryWorkbook.Sheets[directoryWorkbook.SheetNames[0]]);

// Combine data based on Mobile Number
const importData = async () => {
    try {
        for (const emp of eofficeSheet) {
            const matchingRecord = directorySheet.find(dir => dir.MOBILE == emp.MobileNumber);

            if (matchingRecord) {
                const employee = {
                    Organisation_Unit: emp['Organisation Unit'] || '',
                    EmpName: emp['Employee Name'] || '',
                    Designation: emp['Designation'] || '',
                    Email: emp['E-mail'] || '',
                    Floor: matchingRecord.LOCN || '',
                    RoomNo: matchingRecord.PABX || '',
                    LandlineNo: matchingRecord.OFFICE || '',
                    Office_code: null, // Add if available
                    Post: emp['Post'] || '',
                    MobileNumber: matchingRecord.MOBILE
                };

                await Employee.updateOne(
                    { MobileNumber: employee.MobileNumber },
                    { $set: employee },
                    { upsert: true }
                );
            }
        }

        console.log('Excel data imported successfully.');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error importing Excel data:', error.message);
        mongoose.connection.close();
    }
};

importData();

