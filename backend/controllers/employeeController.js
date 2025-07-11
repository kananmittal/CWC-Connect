const Employee = require('../models/EmployeeModel');
const syncExcelData = require('../utils/syncExcelData');

// Hide mobile from user response
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}, '-Mobile -__v'); // Hide mobile
    res.json(employees);
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

