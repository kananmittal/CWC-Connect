// backend/routes/employees.js

const express = require('express');
const router = express.Router();
const { getAllEmployees, syncDatabaseHandler } = require('../controllers/employeeController');
const Employee = require('../models/EmployeeModel');

// ✅ Get all employees (mobile hidden)
router.get('/', getAllEmployees);

// ✅ Manual sync from Excel or API
router.get('/sync/manual', syncDatabaseHandler);

// ✅ Force API sync (try API first, ignore Excel)
router.get('/sync/api', async (req, res) => {
  try {
    // Check if CWC API is configured
    if (!process.env.UPDATE_API || !process.env.API_USERNAME || !process.env.API_PASSWORD) {
      return res.status(400).json({ 
        error: 'CWC API not configured. Please set UPDATE_API, API_USERNAME, and API_PASSWORD environment variables.' 
      });
    }
    
    await syncDatabaseHandler(req, res);
  } catch (err) {
    res.status(500).json({ error: 'CWC API sync failed', details: err.message });
  }
});

// ✅ Get sync status and statistics
router.get('/sync/status', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const apiEmployees = await Employee.countDocuments({ dataSource: 'API' });
    const excelEmployees = await Employee.countDocuments({ dataSource: 'Excel' });
    
    // Get latest update times
    const latestAPIUpdate = await Employee.findOne(
      { dataSource: 'API' }, 
      { lastUpdated: 1 }
    ).sort({ lastUpdated: -1 });
    
    const latestExcelUpdate = await Employee.findOne(
      { dataSource: 'Excel' }, 
      { lastUpdated: 1 }
    ).sort({ lastUpdated: -1 });

    res.json({
      status: 'OK',
      totalEmployees,
      dataSources: {
        api: {
          count: apiEmployees,
          lastUpdate: latestAPIUpdate?.lastUpdated || null
        },
        excel: {
          count: excelEmployees,
          lastUpdate: latestExcelUpdate?.lastUpdated || null
        }
      },
      cwcApiConfig: {
        updateAPI: process.env.UPDATE_API || 'Not configured',
        hasCredentials: !!(process.env.API_USERNAME && process.env.API_PASSWORD),
        username: process.env.API_USERNAME || 'Not configured'
      },
      nextScheduledSync: 'Every 6 hours',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sync status', details: error.message });
  }
});

module.exports = router;
