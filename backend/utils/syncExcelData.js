const xlsx = require('xlsx');
const axios = require('axios');
const Employee = require('../models/EmployeeModel');
const path = require('path');

// Configuration for CWC API endpoints
const API_CONFIG = {
  // CWC eOffice API endpoint for employee updates
  UPDATE_API: process.env.UPDATE_API || '',
  USERNAME: process.env.API_USERNAME || '',
  PASSWORD: process.env.API_PASSWORD || '',
  TIMEOUT: 30000, // 30 seconds timeout
  RETRY_COUNT: 3
};

// Read Excel and convert to JSON
function readExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
}

// Fetch data from CWC API with authentication
async function fetchFromCWCAPI(retryCount = 0) {
  try {
    console.log(`🌐 Fetching updates from CWC eOffice API...`);
    
    if (!API_CONFIG.UPDATE_API) {
      throw new Error('UPDATE_API not configured in environment variables');
    }

    // Create authentication for CWC API
    const auth = {
      username: API_CONFIG.USERNAME,
      password: API_CONFIG.PASSWORD
    };

    const response = await axios.get(API_CONFIG.UPDATE_API, {
      timeout: API_CONFIG.TIMEOUT,
      auth: auth,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CWC-Connect-App'
      }
    });

    console.log(`✅ CWC API fetch successful: ${response.data?.length || 'Data received'}`);
    return response.data;
  } catch (error) {
    console.error(`❌ CWC API fetch failed (attempt ${retryCount + 1}):`, error.message);
    
    // Retry logic
    if (retryCount < API_CONFIG.RETRY_COUNT) {
      console.log(`🔄 Retrying in 5 seconds... (${retryCount + 1}/${API_CONFIG.RETRY_COUNT})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return fetchFromCWCAPI(retryCount + 1);
    }
    
    throw new Error(`CWC API fetch failed after ${API_CONFIG.RETRY_COUNT} attempts: ${error.message}`);
  }
}

// Determine data source and fetch accordingly
async function getEmployeeData() {
  let employeeData = [];
  let source = 'Excel';

  // Try CWC API first, fallback to Excel
  try {
    if (API_CONFIG.UPDATE_API && API_CONFIG.USERNAME && API_CONFIG.PASSWORD) {
      console.log('🌐 Attempting to fetch from CWC eOffice API...');
      
      const apiData = await fetchFromCWCAPI();
      if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        employeeData = apiData;
        source = 'API';
        console.log(`📡 Using CWC API data source: ${employeeData.length} records`);
        return { employeeData, source };
      } else {
        console.log('⚠️ API returned empty or invalid data, falling back to Excel');
      }
    } else {
      console.log('⚠️ API credentials not configured, using Excel');
    }
  } catch (error) {
    console.log('⚠️ CWC API unavailable, falling back to Excel:', error.message);
  }

  // Fallback to Excel files
  try {
    console.log('📁 Using Excel data source');
    const eofficeData = readExcel(path.join(__dirname, '../data/eOffice.xlsx'));
    const directoryData = readExcel(path.join(__dirname, '../data/directory.xlsx'));
    
    // Merge Excel data (existing logic)
    employeeData = mergeExcelData(eofficeData, directoryData);
    return { employeeData, source: 'Excel' };
  } catch (error) {
    throw new Error(`Both CWC API and Excel data sources failed: ${error.message}`);
  }
}

// Merge Excel data (extracted from main function)
function mergeExcelData(eofficeData, directoryData) {
  console.log(`eOffice rows: ${eofficeData.length}`);
  console.log(`Directory rows: ${directoryData.length}`);

  // Only process employees who have complete directory matches
  const mergedData = [];
  
  eofficeData.forEach((eofficeEmp) => {
    const eofficeMobile = eofficeEmp.Mobile || eofficeEmp.mobile || '';
    const matchingDir = directoryData.find(
      (dirEmp) =>
        (dirEmp.MOBILE?.toString().trim() || dirEmp.mobile?.toString().trim() || '') ===
        (eofficeMobile?.toString().trim() || '')
    );

    // STRICTER: Only include employees with location AND room number (not just any contact info)
    if (matchingDir && 
        matchingDir.LOCN && matchingDir.LOCN.trim() !== '' &&
        matchingDir.PABX && matchingDir.PABX.toString().trim() !== '') {
      
      mergedData.push({
        OrganisationUnit: eofficeEmp['Organisation Unit'] || '',
        EmpName: eofficeEmp['Employee Name'] || eofficeEmp.Name || '',
        Designation: eofficeEmp['Designation'] || '',
        Email: eofficeEmp['E-mail'] || '',
        Floor: matchingDir.LOCN.trim(),
        RoomNo: matchingDir.PABX.toString().trim(),
        Landline: matchingDir.OFFICE?.toString().trim() || '',
        Department: matchingDir.DESIGNATION || '', // Still stored but hidden from display
        Unit: eofficeEmp.Post || '',
        Mobile: eofficeMobile || matchingDir.MOBILE || matchingDir.mobile || '',
      });
    } else {
      // Log why employee was excluded
      if (!matchingDir) {
        console.warn(`EXCLUDED: No directory match for mobile: ${eofficeMobile}`);
      } else if (!matchingDir.LOCN || matchingDir.LOCN.trim() === '') {
        console.warn(`EXCLUDED: No location info for: ${eofficeEmp['Employee Name']}`);
      } else if (!matchingDir.PABX || matchingDir.PABX.toString().trim() === '') {
        console.warn(`EXCLUDED: No room number for: ${eofficeEmp['Employee Name']}`);
      }
    }
  });

  console.log(`✅ Merged directory employees with room numbers: ${mergedData.length}`);
  console.log(`❌ Excluded employees: ${eofficeData.length - mergedData.length}`);
  return mergedData;
}

// Transform CWC API data to match database schema
function normalizeAPIData(data) {
  if (!Array.isArray(data)) {
    console.warn('API data is not an array, attempting to extract array...');
    data = data.data || data.employees || [data];
  }

  return data.map(emp => ({
    OrganisationUnit: emp.OrganisationUnit || emp.organisation_unit || emp.unit || '',
    EmpName: emp.EmpName || emp.employee_name || emp.name || emp.EmployeeName || '',
    Designation: emp.Designation || emp.designation || emp.role || '',
    Email: emp.Email || emp.email || emp.emailId || '',
    Floor: emp.Floor || emp.floor || emp.location || '',
    RoomNo: emp.RoomNo || emp.room_no || emp.roomNumber || '',
    Landline: emp.Landline || emp.landline || emp.phone || '',
    Department: emp.Department || emp.department || emp.dept || '',
    Unit: emp.Unit || emp.unit || emp.workUnit || '',
    Mobile: emp.Mobile || emp.mobile || emp.mobileNumber || emp.phone_number || '',
  }));
}

// Main sync function with hybrid approach
async function syncExcelData() {
  try {
    // Get data from CWC API or Excel
    let { employeeData, source } = await getEmployeeData();

    console.log(`📊 Data Source: ${source}`);
    console.log(`Total rows: ${employeeData.length}`);

    // Normalize API data if needed
    if (source === 'API') {
      employeeData = normalizeAPIData(employeeData);
      console.log(`Normalized API data: ${employeeData.length} records`);
    }

    // Filter out rows with empty Mobile
    const validData = employeeData.filter(
      (emp) => emp.Mobile && emp.Mobile.toString().trim() !== ''
    );

    // Remove duplicates based on Mobile
    const uniqueData = Array.from(
      new Map(validData.map(emp => [emp.Mobile.toString().trim(), { 
        ...emp, 
        Mobile: emp.Mobile.toString().trim(),
        lastUpdated: new Date(),
        dataSource: source
      }])).values()
    );

    console.log(`Rows with valid Mobile: ${validData.length}`);
    console.log(`Rows with unique Mobile: ${uniqueData.length}`);

    // For API updates: update existing records + add new ones
    if (source === 'API') {
      console.log('🔄 Processing CWC API updates...');
      let updatedCount = 0;
      let newCount = 0;

      for (const empData of uniqueData) {
        const result = await Employee.updateOne(
          { Mobile: empData.Mobile },
          { 
            $set: { 
              ...empData,
              lastUpdated: new Date(),
              dataSource: 'API'
            }
          },
          { upsert: true }
        );

        if (result.upsertedCount) {
          newCount++;
        } else if (result.modifiedCount) {
          updatedCount++;
        }
      }

      console.log(`✅ CWC API Sync Complete: ${newCount} new records, ${updatedCount} updated records`);
    } else {
      // For Excel: Update existing records AND insert new ones
      console.log('🔄 Processing Excel data updates...');
      let updatedCount = 0;
      let newCount = 0;

      for (const empData of uniqueData) {
        const result = await Employee.updateOne(
          { Mobile: empData.Mobile },
          { 
            $set: { 
              ...empData,
              lastUpdated: new Date(),
              dataSource: 'Excel'
            }
          },
          { upsert: true }
        );

        if (result.upsertedCount) {
          newCount++;
        } else if (result.modifiedCount) {
          updatedCount++;
        }
      }

      console.log(`✅ Excel Sync Complete: ${newCount} new records, ${updatedCount} updated records`);
    }

    // Log sync summary
    const totalEmployees = await Employee.countDocuments();
    console.log(`📊 Total employees in database: ${totalEmployees}`);
    console.log(`🕒 Last sync: ${new Date().toISOString()} (Source: ${source})`);

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  }
}

module.exports = syncExcelData;
