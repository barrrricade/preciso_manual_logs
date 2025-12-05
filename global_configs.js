// Form Configuration
const FORM_ID = '1GUShhQOSd5zzefWst5tmYuarwr-zUsi8zhQOwgjR_3g'; // Replace with your real form ID

// Sheet Configuration  
const SHEET_NAMES = {
  CONFIG: 'Config',
  LOGS: 'Logs',
  TEMPLATE: 'Template'
};

// Email Configuration (UPDATED for your config structure)
const EMAIL_CONFIG = {
  DEBUG_CELL: 'B9',      // Cell B9 for debug mode TRUE/FALSE
  TIME_CELL: 'B10',      // Cell B10 for email time (military format)
  LAST_SENT_CELL: 'B11', // Cell B11 for last email sent (UPDATED)
  DEFAULT_TIME: '1700'   // Default 5:00 PM if not configured
};

// Email timeout configuration (UPDATED)
const EMAIL_TIMEOUT = {
  LAST_SENT_CELL: 'B11',    // Cell B11 tracks last email sent time (UPDATED)
  TIMEOUT_MINUTES: 1        // 1 minute timeout
};

/**
 * Check if email sending is enabled (debug mode)
 */
function isEmailEnabled() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found - emails disabled');
      return false;
    }
    
    const debugValue = configSheet.getRange(EMAIL_CONFIG.DEBUG_CELL).getValue();
    const isEnabled = debugValue === true || debugValue === 'TRUE';
    
    console.log(`Email debug check - Cell ${EMAIL_CONFIG.DEBUG_CELL}: "${debugValue}", Emails enabled: ${isEnabled}`);
    return isEnabled;
    
  } catch (error) {
    console.error('Error checking email debug mode:', error);
    return false; // Default to disabled on error
  }
}

/**
 * Get configured email time from Config sheet
 */
function getEmailTime() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found - using default email time');
      return EMAIL_CONFIG.DEFAULT_TIME;
    }
    
    const timeValue = configSheet.getRange(EMAIL_CONFIG.TIME_CELL).getValue();
    
    if (!timeValue || timeValue === '') {
      console.log('Email time not configured - using default');
      return EMAIL_CONFIG.DEFAULT_TIME;
    }
    
    const timeString = timeValue.toString();
    console.log(`Email time configured: ${timeString}`);
    return timeString;
    
  } catch (error) {
    console.error('Error getting email time:', error);
    return EMAIL_CONFIG.DEFAULT_TIME;
  }
}

/**
 * Parse military time to hour and minute
 */
function parseMilitaryTime(militaryTime) {
  try {
    const timeStr = militaryTime.toString().padStart(4, '0'); // Ensure 4 digits
    const hour = parseInt(timeStr.substring(0, 2));
    const minute = parseInt(timeStr.substring(2, 4));
    
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.error('Invalid military time:', militaryTime);
      return { hour: 17, minute: 0 }; // Default to 5:00 PM
    }
    
    console.log(`Parsed military time ${militaryTime} -> ${hour}:${minute.toString().padStart(2, '0')}`);
    return { hour, minute };
    
  } catch (error) {
    console.error('Error parsing military time:', error);
    return { hour: 17, minute: 0 }; // Default to 5:00 PM
  }
}

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

// Request ID Configuration
const REQUEST_ID_PREFIX = 'REQ-';

// Form Field Mapping (e.values indices)
const FORM_FIELDS = {
  TIMESTAMP: 0,
  EMAIL: 1,
  EMPLOYEE_NAME: 2,
  VISIT_DATE: 3,
  START_TIME: 4,
  END_TIME: 5,
  PURPOSE: 6,
  REIMBURSEMENT: 7,
  DESCRIPTION: 8,
  COMPANIES: 9
};

// Log Sheet Headers
const LOG_HEADERS = [
  'Request_ID', 'Timestamp', 'Employee_Email', 'Employee_Name',
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

/**
 * Check if email can be sent (timeout protection)
 */
function canSendEmail() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) return true; // Allow if config not found
    
    const lastSentValue = configSheet.getRange(EMAIL_TIMEOUT.LAST_SENT_CELL).getValue();
    
    if (!lastSentValue) {
      console.log('No previous email sent - allowing');
      return true;
    }
    
    const lastSentTime = new Date(lastSentValue);
    const now = new Date();
    const timeDiffMinutes = (now - lastSentTime) / (1000 * 60);
    
    console.log(`Last email sent: ${lastSentTime}, Minutes ago: ${timeDiffMinutes.toFixed(1)}`);
    
    if (timeDiffMinutes >= EMAIL_TIMEOUT.TIMEOUT_MINUTES) {
      console.log('Timeout passed - allowing email');
      return true;
    } else {
      const remainingTime = EMAIL_TIMEOUT.TIMEOUT_MINUTES - timeDiffMinutes;
      console.log(`Timeout active - ${remainingTime.toFixed(1)} minutes remaining`);
      return false;
    }
    
  } catch (error) {
    console.error('Error checking email timeout:', error);
    return true; // Allow on error
  }
}

/**
 * Record email sent time
 */
function recordEmailSent() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (configSheet) {
      const now = new Date();
      configSheet.getRange(EMAIL_TIMEOUT.LAST_SENT_CELL).setValue(now);
      console.log('Email sent time recorded:', now);
    }
    
  } catch (error) {
    console.error('Error recording email sent time:', error);
  }
}

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