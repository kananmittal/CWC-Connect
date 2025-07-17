const Employee = require('../models/EmployeeModel');
const syncExcelData = require('../utils/syncExcelData');

// Hide mobile and department from user response, show only employees with room numbers
const getAllEmployees = async (req, res) => {
  try {
    // STRICTER filter: only show employees who have Floor AND RoomNo (actual room assignments)
    const employees = await Employee.find({
      Floor: { $exists: true, $ne: '', $ne: null },
      RoomNo: { $exists: true, $ne: '', $ne: null }
    }, '-Mobile -Department -__v'); // Hide mobile, department, and version
    
    // Additional filtering to ensure clean data
    const filteredEmployees = employees.filter(emp => 
      emp.Floor && emp.Floor.trim() !== '' && 
      emp.RoomNo && emp.RoomNo.trim() !== ''
    );
    
    res.json(filteredEmployees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// ✅ Pure sync function — NO req/res
const syncDatabase = async () => {
  try {
    await syncExcelData();
    console.log('Database synced successfully!');
    return true;
  } catch (err) {
    console.error('Sync failed:', err);
    throw err; // Let the caller handle it
  }
};

// ✅ API route handler — calls pure sync and responds
const syncDatabaseHandler = async (req, res) => {
  try {
    await syncDatabase();
    res.status(200).json({ message: 'Database synced successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed' });
  }
};

module.exports = {
  getAllEmployees,
  syncDatabase,
  syncDatabaseHandler,
};

