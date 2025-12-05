/**
 * Enhanced form submission handler (UPDATED - auto copy to employee tabs)
 */
function onFormSubmit(e) {
  try {
    console.log('=== FORM SUBMISSION RECEIVED ===');
    console.log('Form data:', e.values);
    
    // Extract form data
    const formData = extractFormData(e.values);
    console.log('Extracted form data:', formData);
    
    // Validate employee and get name
    const isValidEmployee = validateEmployeeByEmail(formData.email);
    console.log('Employee validation result:', isValidEmployee);
    
    // If employee is not valid, don't proceed with tab creation
    if (!isValidEmployee) {
      console.log('Invalid employee - skipping tab creation and employee processing');
    }
    
    // Generate Request ID
    const requestId = generateNextRequestId();
    console.log('Generated Request ID:', requestId);
    
    // Get or create Logs sheet
    const logsSheet = getOrCreateLogsSheet();
    
    // Write to Logs sheet
    writeToLogsSheet(logsSheet, requestId, formData, isValidEmployee);
    
    // Create employee tab if valid employee
    if (isValidEmployee) {
      processEmployeeTabCreation(formData);
      
      // NEW: Immediately copy to employee tab
      const logEntry = {
        requestId: requestId,
        employeeName: formData.employeeName,
        visitDate: formData.visitDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        companies: formData.companies,
        description: formData.description,
        reimbursement: formData.reimbursement
      };
      
      copyEntryToEmployeeTab(logEntry);
      
      // PHASE 2: Send immediate manager approval email
      sendManagerApprovalEmail(formData, requestId);
    }
    
    console.log('=== FORM SUBMISSION PROCESSED ===');
    
  } catch (error) {
    console.error('Error processing form submission:', error);
  }
}

/**
 * Extract form data from e.values array - UPDATED: No employee name dropdown
 */
function extractFormData(values) {
  const email = values[FORM_FIELDS.EMAIL];
  const employeeName = getEmployeeNameFromEmail(email); // Derive name from email
  
  return {
    timestamp: values[FORM_FIELDS.TIMESTAMP],
    email: email,
    employeeName: employeeName, // Derived from email validation
    visitDate: values[FORM_FIELDS.VISIT_DATE],
    startTime: values[FORM_FIELDS.START_TIME],
    endTime: values[FORM_FIELDS.END_TIME],
    purpose: values[FORM_FIELDS.PURPOSE],
    reimbursement: values[FORM_FIELDS.REIMBURSEMENT],
    description: values[FORM_FIELDS.DESCRIPTION],
    companies: values[FORM_FIELDS.COMPANIES]
  };
}

/**
 * Validate employee by email against Config sheet column G - UPDATED: Use CONFIG_LAYOUT
 */
function validateEmployeeByEmail(email) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found');
      return false;
    }
    
    // Use CONFIG_LAYOUT constants for consistent column/row references
    const startRow = CONFIG_LAYOUT.EMPLOYEES.START_ROW;
    const endRow = CONFIG_LAYOUT.EMPLOYEES.END_ROW;
    const emailRange = configSheet.getRange(startRow, CONFIG_LAYOUT.EMPLOYEES.EMAIL_COL, endRow - startRow + 1, 1);
    const emailData = emailRange.getValues();
    
    for (let i = 0; i < emailData.length; i++) {
      const configEmail = emailData[i][0];
      if (configEmail && configEmail === email) {
        console.log('Valid employee found:', email);
        return true;
      }
    }
    
    console.log('Employee not found:', email);
    return false;
    
  } catch (error) {
    console.error('Error validating employee:', error);
    return false;
  }
}

// REPLACE this function in code.gs
function generateNextRequestId() {
  return generateUniqueRequestId(); // Use new UUID-style generation
}

/**
 * Get or create Logs sheet
 */
function getOrCreateLogsSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  let logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
  
  if (!logsSheet) {
    console.log('Creating Logs sheet...');
    logsSheet = sheet.insertSheet(SHEET_NAMES.LOGS);
    
    // Add headers
    logsSheet.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]);
    
    // Format headers
    logsSheet.getRange(1, 1, 1, LOG_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#f0f0f0');
      
    console.log('Logs sheet created with headers');
  }
  
  return logsSheet;
}

/**
 * Write form data to Logs sheet - CORRECTED: Match actual CSV structure
 */
function writeToLogsSheet(logsSheet, requestId, formData, isValidEmployee) {
  const status = isValidEmployee ? STATUS.PENDING : STATUS.INVALID_EMPLOYEE;
  
  // ACTUAL CSV STRUCTURE: Request_ID, Timestamp, Employee_Name, Employee_Email, Visit_Date,
  // Visit_Start_Time, Visit_End_Time, Purpose, Reimbursement, Description, Companies, Status, Action_Date, Comments
  const rowData = [
    requestId,              // Request_ID
    formData.timestamp,     // Timestamp (form submission time)
    formData.employeeName,  // Employee_Name
    formData.email,         // Employee_Email
    formData.visitDate,     // Visit_Date
    formData.startTime,     // Visit_Start_Time
    formData.endTime,       // Visit_End_Time
    formData.purpose,       // Purpose
    formData.reimbursement, // Reimbursement
    formData.description,   // Description
    formData.companies,     // Companies
    status,                 // Status
    '',                     // Action_Date (empty initially)
    ''                      // Comments (empty initially)
  ];
  
  logsSheet.appendRow(rowData);
  console.log('Data written to Logs sheet with corrected structure:', rowData);
}

/**
 * Get employee position/department from Config sheet
 */
function getEmployeePosition(employeeName) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) return 'Unknown';
    
    // Get employee data from Config
    const startRow = CONFIG_LAYOUT.EMPLOYEES.START_ROW;
    const endRow = CONFIG_LAYOUT.EMPLOYEES.END_ROW;
    const range = configSheet.getRange(startRow, CONFIG_LAYOUT.EMPLOYEES.NAME_COL, endRow - startRow + 1, 4); // Get name to position columns
    const employeeData = range.getValues();
    
    for (let i = 0; i < employeeData.length; i++) {
      const name = employeeData[i][0]; // Column F (name)
      const position = employeeData[i][3]; // Column I (position) - offset by 3 from name column
      
      if (name === employeeName && position) {
        console.log(`Found position for ${employeeName}: ${position}`);
        return position;
      }
    }
    
    console.log(`Position not found for employee: ${employeeName}`);
    return 'Unknown';
    
  } catch (error) {
    console.error('Error getting employee position:', error);
    return 'Unknown';
  }
}

/**
 * Extract year from visit date (IMPROVED - handles multiple formats)
 */
function getYearFromDate(dateString) {
  try {
    // If it's already a Date object, extract year directly
    if (dateString instanceof Date) {
      return dateString.getFullYear();
    }
    
    // Convert string to Date object
    let date;
    
    // Handle DD/MM/YYYY format (your new format)
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Check if it's DD/MM/YYYY or MM/DD/YYYY
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // If day > 12, assume DD/MM/YYYY format
        if (day > 12) {
          date = new Date(year, month - 1, day); // month is 0-indexed
        } else {
          // Could be either format, try MM/DD/YYYY first
          date = new Date(dateString);
          // If invalid, try DD/MM/YYYY
          if (isNaN(date.getTime())) {
            date = new Date(year, month - 1, day);
          }
        }
      }
    } else {
      // Handle other formats (ISO, etc.)
      date = new Date(dateString);
    }
    
    const year = date.getFullYear();
    
    // Validate year is reasonable
    if (isNaN(year) || year < 2020 || year > 2030) {
      console.error('Invalid year extracted from date:', dateString);
      return new Date().getFullYear(); // Default to current year
    }
    
    console.log(`Date parsing: "${dateString}" -> ${year}`);
    return year;
    
  } catch (error) {
    console.error('Error extracting year from date:', error);
    return new Date().getFullYear(); // Default to current year
  }
}

/**
 * Generate employee tab name
 */
function generateEmployeeTabName(employeeName, year) {
  return `${employeeName} ${year}`;
}

/**
 * Check if employee tab exists
 */
function employeeTabExists(tabName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const existingSheet = sheet.getSheetByName(tabName);
  return existingSheet !== null;
}

/**
 * Create employee tab from template
 */
function createEmployeeTab(employeeName, year, position) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const templateSheet = sheet.getSheetByName(SHEET_NAMES.TEMPLATE);
    
    if (!templateSheet) {
      console.error('Template sheet not found');
      return null;
    }
    
    const tabName = generateEmployeeTabName(employeeName, year);
    
    // Copy template sheet
    const newSheet = templateSheet.copyTo(sheet);
    newSheet.setName(tabName);
    
    // Fill in employee details
    fillEmployeeTabDetails(newSheet, employeeName, year, position);
    
    console.log(`Created employee tab: ${tabName}`);
    return newSheet;
    
  } catch (error) {
    console.error('Error creating employee tab:', error);
    return null;
  }
}

/**
 * Fill employee tab with name, year, position
 */
function fillEmployeeTabDetails(sheet, employeeName, year, position) {
  try {
    // Update year in row 3, column A
    const yearCell = sheet.getRange('A3');
    yearCell.setValue(`For the year of ${year}`);
    
    // Update name in row 5, column B (after "NAME:")
    const nameCell = sheet.getRange('B5');
    nameCell.setValue(employeeName);
    
    // Update position in row 6, column B (after "POSITION:")
    const positionCell = sheet.getRange('B6');
    positionCell.setValue(position);
    
    console.log(`✅ Filled employee details: ${employeeName}, ${year}, ${position}`);
    
  } catch (error) {
    console.error('Error filling employee tab details:', error);
  }
}

/**
 * Process employee tab creation (called from onFormSubmit)
 */
function processEmployeeTabCreation(formData) {
  try {
    const year = getYearFromDate(formData.visitDate);
    const position = getEmployeePosition(formData.employeeName);
    const tabName = generateEmployeeTabName(formData.employeeName, year);
    
    console.log(`Processing employee tab: ${tabName}`);
    
    if (!employeeTabExists(tabName)) {
      console.log(`Creating new employee tab: ${tabName}`);
      createEmployeeTab(formData.employeeName, year, position);
    } else {
      console.log(`Employee tab already exists: ${tabName}`);
    }
    
  } catch (error) {
    console.error('Error processing employee tab creation:', error);
  }
}

/**
 * Convert Date object back to time string (HH:MM:SS format)
 */
function convertTimeObjectToString(timeValue) {
  try {
    if (!timeValue) return '';
    
    // If it's a Date object, extract time in HH:MM:SS format
    if (timeValue instanceof Date) {
      const hours = timeValue.getHours().toString().padStart(2, '0');
      const minutes = timeValue.getMinutes().toString().padStart(2, '0');
      const seconds = timeValue.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    
    // If it's already a string, return as-is
    return String(timeValue);
    
  } catch (error) {
    console.error('Error converting time object to string:', error);
    return String(timeValue || '');
  }
}