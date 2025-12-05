// Form Configuration
const FORM_ID = '1GUShhQOSd5zzefWst5tmYuarwr-zUsi8zhQOwgjR_3g'; // Replace with your real form ID

// Sheet Configuration  
const SHEET_NAMES = {
  CONFIG: 'Config',
  LOGS: 'Logs',
  TEMPLATE: 'Template'
};

// Email Configuration - PHASE 2: Simplified (removed timing dependencies)
const EMAIL_CONFIG = {
  DEBUG_CELL: 'B9'      // Cell B9 for debug mode TRUE/FALSE
  // Removed: TIME_CELL and LAST_SENT_CELL (user deleted from config)
};

/**
 * Check if email sending is enabled (debug mode) - FIXED: Handle typed columns
 */
function isEmailEnabled() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found - emails disabled');
      return false;
    }
    
    // Try to get debug_mode from config using getConfigValue instead of direct cell access
    const debugValue = getConfigValue('debug_mode');
    
    if (debugValue === null) {
      console.log('Debug mode not found in config - emails disabled');
      return false;
    }
    
    // Check if debug mode is FALSE (emails enabled) or TRUE (emails disabled)
    const isEnabled = debugValue === false || debugValue === 'FALSE';
    
    console.log(`Email debug check - debug_mode: "${debugValue}", Emails enabled: ${isEnabled}`);
    return isEnabled;
    
  } catch (error) {
    console.error('Error checking email debug mode:', error);
    return false; // Default to disabled on error
  }
}

// PHASE 2: Removed timing functions (getEmailTime, parseMilitaryTime)
// No longer needed since user removed email_time config

/**
 * Get manager and HR email addresses from config
 */
function getEmailAddresses() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.error('Config sheet not found');
      return { manager: null, hr: null, company: 'Company' };
    }
    
    const managerEmail = getConfigValue('manager_email');
    const hrEmail = getConfigValue('hr_email');
    const companyName = getConfigValue('company_name') || 'Company';
    
    console.log('Email addresses - Manager:', managerEmail, 'HR:', hrEmail);
    return { 
      manager: managerEmail, 
      hr: hrEmail, 
      company: companyName 
    };
    
  } catch (error) {
    console.error('Error getting email addresses:', error);
    return { manager: null, hr: null, company: 'Company' };
  }
}

/**
 * Get configuration value from Config sheet (UPDATED for A2 start)
 */
function getConfigValue(setting) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) return null;
    
    // Get settings data from Config sheet (A2:B15 to cover your config)
    const data = configSheet.getRange('A2:B15').getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === setting) {
        console.log(`Config value found - ${setting}: ${data[i][1]}`);
        return data[i][1];
      }
    }
    
    console.log(`Config value not found: ${setting}`);
    return null;
    
  } catch (error) {
    console.error('Error getting config value:', error);
    return null;
  }
}

// Config Sheet Layout
const CONFIG_LAYOUT = {
  EMPLOYEES: {
    NAME_COL: 6,        // Column F (1-based) for employee names
    EMAIL_COL: 7,       // Column G (1-based) for employee emails  
    START_ROW: 2,       // First employee data row (now 2)
    END_ROW: 20         // Last possible employee row
  }
};

/**
 * Get employee name from email address
 */
function getEmployeeNameFromEmail(email) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found');
      return null;
    }
    
    // Get employee data from Config sheet
    const startRow = CONFIG_LAYOUT.EMPLOYEES.START_ROW;
    const endRow = CONFIG_LAYOUT.EMPLOYEES.END_ROW;
    const nameRange = configSheet.getRange(startRow, CONFIG_LAYOUT.EMPLOYEES.NAME_COL, endRow - startRow + 1, 1);
    const emailRange = configSheet.getRange(startRow, CONFIG_LAYOUT.EMPLOYEES.EMAIL_COL, endRow - startRow + 1, 1);
    
    const nameData = nameRange.getValues();
    const emailData = emailRange.getValues();
    
    for (let i = 0; i < emailData.length; i++) {
      const configEmail = emailData[i][0];
      const configName = nameData[i][0];
      
      if (configEmail && configEmail === email && configName) {
        console.log(`Employee name found for ${email}: ${configName}`);
        return configName;
      }
    }
    
    console.log(`Employee name not found for email: ${email}`);
    return null;
    
  } catch (error) {
    console.error('Error getting employee name from email:', error);
    return null;
  }
}

// Request ID Configuration
const REQUEST_ID_PREFIX = 'REQ-';

// Form Field Mapping (e.values indices) - FIXED: Based on actual form data
const FORM_FIELDS = {
  TIMESTAMP: 0,      // '05/12/2025 02:19:49'
  EMAIL: 1,          // 'ipkinghangdesmond@gmail.com'
  // Index 2 is empty (removed employee name dropdown)
  VISIT_DATE: 3,     // '01/01/2026'
  START_TIME: 4,     // '10:10:00'
  END_TIME: 5,       // '13:13:00'
  PURPOSE: 6,        // 'testing'
  REIMBURSEMENT: 7,  // 'Yes'
  DESCRIPTION: 8,    // '123'
  COMPANIES: 9       // 'this, that'
};

// Log Sheet Headers - FIXED: Corrected Employee_Name and Employee_Email order
const LOG_HEADERS = [
  'Request_ID', 'Timestamp', 'Employee_Name', 'Employee_Email',
  'Visit_Date', 'Start_Time', 'End_Time', 'Purpose',
  'Reimbursement', 'Description', 'Companies', 'Status',
  'Action_Date', 'Comments'
];

// Status Values
const STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  INVALID_EMPLOYEE: 'Invalid Employee'
};

/**
 * Get email configuration including names and CC preference
 */
function getEmailAddresses() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.error('Config sheet not found');
      return { 
        manager: null, hr: null, automation: null, company: 'Company',
        managerName: 'Manager', hrName: 'HR', ccHr: false
      };
    }
    
    const managerEmail = getConfigValue('manager_email');
    const hrEmail = getConfigValue('hr_email');
    const automationEmail = getConfigValue('automation_email');
    const companyName = getConfigValue('company_name') || 'Company';
    const managerName = getConfigValue('manager_name') || 'Manager';
    const hrName = getConfigValue('hr_name') || 'HR';
    const ccHr = getConfigValue('cc_hr') === 'TRUE' || getConfigValue('cc_hr') === true;
    
    console.log('Email config - Manager:', managerEmail, 'HR:', hrEmail, 'CC HR:', ccHr);
    return { 
      manager: managerEmail, 
      hr: hrEmail, 
      automation: automationEmail,
      company: companyName,
      managerName: managerName,
      hrName: hrName,
      ccHr: ccHr
    };
    
  } catch (error) {
    console.error('Error getting email addresses:', error);
    return { 
      manager: null, hr: null, automation: null, company: 'Company',
      managerName: 'Manager', hrName: 'HR', ccHr: false
    };
  }
}

// PHASE 2: Removed timeout functions (canSendEmail, recordEmailSent)
// No longer needed since user removed timing config and wants immediate emails

/**
 * Generate UUID-style Request ID (UPDATED)
 */
function generateRequestId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `REQ-${timestamp}-${random}`;
}

/**
 * Check if Request ID already exists
 */
function isRequestIdUnique(requestId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) return true;
    
    const lastRow = logsSheet.getLastRow();
    if (lastRow <= 1) return true;
    
    const data = logsSheet.getRange(1, 1, lastRow, 1).getValues();
    return !data.some(row => row[0] === requestId);
  } catch (error) {
    console.error('Error checking Request ID uniqueness:', error);
    return true;
  }
}

/**
 * Generate guaranteed unique Request ID
 */
function generateUniqueRequestId() {
  let requestId;
  let attempts = 0;
  
  do {
    requestId = generateRequestId();
    attempts++;
  } while (!isRequestIdUnique(requestId) && attempts < 10);
  
  if (attempts >= 10) {
    throw new Error('Could not generate unique Request ID');
  }
  
  console.log('Generated unique Request ID:', requestId);
  return requestId;
}