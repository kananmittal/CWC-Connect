// backend/utils/apiSync.js

const { syncDatabase } = require('../controllers/employeeController');

const startEmployeeSync = () => {
    console.log('🚀 Starting Employee Sync Service...');
    
    // Initial sync on startup
    syncDatabase()
        .then(() => console.log('✅ Initial sync completed'))
        .catch(err => console.error('❌ Initial sync failed:', err.message));
    
    // Schedule regular syncs
    // API sources: Check every 6 hours for updates
    // Excel sources: Fallback, checked same interval
    const syncInterval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    
    setInterval(() => {
        console.log('🔄 Running scheduled employee sync...');
        syncDatabase()
            .then(() => console.log('✅ Scheduled sync completed'))
            .catch(err => console.error('❌ Scheduled sync failed:', err.message));
    }, syncInterval);
    
    console.log(`⏰ Sync scheduled every 6 hours`);
    console.log(`📡 Will prioritize API data when available, fallback to Excel`);
};

module.exports = { startEmployeeSync };
