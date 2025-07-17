const express = require('express');
const Employee = require('../models/EmployeeModel');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();

// Enhanced entity extraction for employee search
function extractEntities(question) {
  const nameMatches = question.match(/([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+)/g) || [];
  // Removed department matching - no longer allowing department searches
  const designationMatch = question.match(/(director|engineer|assistant|deputy|chief|member|chairman)/i);
  
  return {
    names: nameMatches,
    designation: designationMatch ? designationMatch[1] : null,
    query: question.toLowerCase(),
    fullQuery: question.trim() // Keep the original query for exact matching
  };
}

// Search employees based on entities - now filtered for directory employees only
async function searchEmployees(entities) {
  let employees = [];
  
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
  
  try {
    // STRICTER filter: only show employees who have Floor AND RoomNo (actual room assignments)
    const baseFilter = { 
      Floor: { $exists: true, $ne: '', $ne: null },
      RoomNo: { $exists: true, $ne: '', $ne: null }
    };
    
    // Check if the query is a known designation (prioritize exact designation matches)
    const designationQuery = entities.fullQuery.toLowerCase();
    if (designationQuery === 'director') {
      // For "director", match only exact "DIRECTOR" positions - show ALL results
      const exactDesignation = await Employee.find({
        ...baseFilter,
        Designation: /^DIRECTOR$/i
      });
      if (exactDesignation.length > 0) {
        return exactDesignation;
      }
    } else if (designationQuery === 'deputy director') {
      // For "deputy director", match only "DEPUTY DIRECTOR" positions - show ALL results
      const exactDesignation = await Employee.find({
        ...baseFilter,
        Designation: /^DEPUTY DIRECTOR$/i
      });
      if (exactDesignation.length > 0) {
        return exactDesignation;
      }
    }
    
    // First, try exact match on the full query (names)
    if (entities.fullQuery) {
      const exactMatch = await Employee.find({
        ...baseFilter,
        EmpName: new RegExp(`^${entities.fullQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
      
      if (exactMatch.length > 0) {
        employees.push(...exactMatch);
      } else {
        // Try phrase match (contains the exact phrase)
        const phraseMatch = await Employee.find({
          ...baseFilter,
          EmpName: new RegExp(entities.fullQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        });
        employees.push(...phraseMatch);
      }
    }
    
    // If no exact/phrase matches found, fall back to individual name searches
    if (employees.length === 0 && entities.names && entities.names.length > 0) {
      for (const name of entities.names) {
        const empByName = await Employee.find({
          ...baseFilter,
          EmpName: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        });
        employees.push(...empByName);
      }
    }
    
    // Search by designation (only if no other matches found)
    if (employees.length === 0 && entities.designation) {
      // Use exact match for designations to avoid partial matches
      const empByDesig = await Employee.find({
        ...baseFilter,
        Designation: new RegExp(`^${entities.designation}$`, 'i')
      });
      employees.push(...empByDesig);
    }
    
    // If still no results, do a broader search (removed department search)
    if (employees.length === 0 && entities.query) {
      const generalSearch = await Employee.find({
        ...baseFilter,
        $or: [
          { EmpName: new RegExp(entities.query, 'i') },
          { OrganisationUnit: new RegExp(entities.query, 'i') }
        ]
      });
      employees.push(...generalSearch);
    }
    
    // Filter out any employees without proper room info (extra safety check)
    const filteredEmployees = employees.filter(emp => 
      emp.Floor && emp.Floor.trim() !== '' && 
      emp.RoomNo && emp.RoomNo.trim() !== ''
    );
    
    // Remove duplicates and prioritize exact matches
    const uniqueEmployees = filteredEmployees.filter((emp, index, self) => 
      index === self.findIndex(e => e._id.toString() === emp._id.toString())
    );
    
    // Sort by relevance: exact matches first, then partial matches
    uniqueEmployees.sort((a, b) => {
      const aExact = a.EmpName.toLowerCase() === entities.fullQuery.toLowerCase();
      const bExact = b.EmpName.toLowerCase() === entities.fullQuery.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });
    
    return uniqueEmployees;
  } catch (error) {
    console.error('Database search error:', error);
    throw error;
  }
}

// Format employee information for response
function formatEmployeeInfo(employees) {
  if (employees.length === 0) {
    return 'No employees found matching your query.';
  }
  
  let info = `Found ${employees.length} employee(s):\n\n`;
  
  employees.forEach((emp, index) => {
    info += `${index + 1}. ${emp.EmpName}\n`;
    info += `   Designation: ${emp.Designation || 'Not specified'}\n`;
    // Department line removed - hiding department information
    if (emp.OrganisationUnit) info += `   Unit: ${emp.OrganisationUnit}\n`;
    if (emp.Floor && emp.Floor.trim()) info += `   Location: ${emp.Floor}\n`;
    if (emp.RoomNo && emp.RoomNo.trim()) info += `   Room/Ext: ${emp.RoomNo}\n`;
    if (emp.Email) info += `   Email: ${emp.Email}\n`;
    if (emp.Landline && emp.Landline.trim()) info += `   Phone: ${emp.Landline}\n`;
    info += '\n';
  });
  
  return info;
}

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  console.log('Received query:', message);

  const entities = extractEntities(message);
  let employees = [];
  let dbInfo = '';
  let dbAvailable = mongoose.connection.readyState === 1;

  try {
    if (dbAvailable) {
      employees = await searchEmployees(entities);
      dbInfo = formatEmployeeInfo(employees);
      console.log(`Found ${employees.length} employees for query: ${message}`);
    } else {
      dbInfo = 'Employee database is currently not available. Please try again later or use the organizational structure menu to browse positions.';
    }
  } catch (err) {
    console.error('Database error:', err);
    dbAvailable = false;
    dbInfo = 'Employee database is currently not available. Please try again later or use the organizational structure menu to browse positions.';
  }

  // Try to use Llama3 for enhanced response, with fallback
  try {
    if (dbAvailable && employees.length > 0) {
      const prompt = `User question: ${message}\n\nEmployee Information from CWC Database:\n${dbInfo}\n\nPlease provide a helpful, conversational response about the CWC employees based on the information above.`;

      const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
        model: 'llama3',
        prompt,
        stream: false
      }, { timeout: 10000 }); // 10 second timeout

      const reply = ollamaRes.data.response || dbInfo;
      res.json({ reply, employeeCount: employees.length, databaseAvailable: dbAvailable });
    } else {
      throw new Error('Skipping Ollama due to no data or DB unavailable');
    }
  } catch (err) {
    console.log('Using direct response:', err.message);
    // Fallback: return formatted database information directly
    let reply = dbInfo;
    if (dbAvailable && employees.length === 0) {
      reply = `I couldn't find any employees matching "${message}". Try searching by:\n- Full name (e.g., "Amitabh Tiwari")\n- Designation (e.g., "Director", "Engineer")\n- Organization unit\n\nYou can also browse the organizational structure using the menu button.`;
    } else if (!dbAvailable) {
      reply = `Sorry, the employee database is currently not available. Here are some things you can do:\n\n1. Use the organizational structure menu (☰) to browse positions\n2. Try again in a few moments\n3. Contact the reception desk for immediate assistance\n\nThe CWC Connect system will automatically reconnect to the database when it becomes available.`;
    }
    res.json({ reply, employeeCount: employees.length, databaseAvailable: dbAvailable });
  }
});

module.exports = router; 