// Form Configuration
const FORM_ID = '1GUShhQOSd5zzefWst5tmYuarwr-zUsi8zhQOwgjR_3g';

// Sheet Configuration  
const SHEET_NAMES = {
  CONFIG: 'Config',
  LOGS: 'Logs',
  TEMPLATE: 'Template'
};

// Web App Configuration
const WEB_APP_CONFIG = {
  // Default web app URL - can be overridden by config sheet value 'web_app_url'
  DEFAULT_URL: 'https://script.google.com/macros/s/AKfycbx5NsrdoHi7rBFtlwxmTgFd6uXlHg4yYnxLEq5JFJReox6GzsybYqs2T30DFZJPs6do/exec'
};

// System Information
const SYSTEM_INFO = {
  VERSION: '1.0.0',
  COMMIT_ID: 'a170613', // Update manually or use automated deployment
  CREATED_BY: 'D.ip',
  BUILD_DATE: '2025-12-05'
};

// Email Configuration
const EMAIL_CONFIG = {
  DEBUG_CELL: 'B9'
};

/**
 * Check if email sending is enabled based on debug mode
 */
function isEmailEnabled() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found - emails disabled');
      return false;
    }
    
    // Get debug_mode from config
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
 * Get configuration value from Config sheet (UPDATED: Handle typed columns)
 */
function getConfigValue(setting) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) return null;
    
    // Try different approaches to handle typed columns
    let data;
    
    try {
      // First try: Get the range as values (may fail with typed columns)
      data = configSheet.getRange('A1:B13').getValues();
    } catch (typedColumnError) {
      console.log('Typed column error, trying cell-by-cell approach:', typedColumnError);
      
      // Second try: Read cell by cell to avoid typed column restrictions
      data = [];
      for (let row = 1; row <= 13; row++) {
        try {
          const key = configSheet.getRange(row, 1).getValue();
          const value = configSheet.getRange(row, 2).getValue();
          data.push([key, value]);
        } catch (cellError) {
          console.log(`Error reading row ${row}, skipping:`, cellError);
          data.push(['', '']); // Add empty row to maintain indexing
        }
      }
    }
    
    // Search for the setting
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

// Config Sheet Layout - UPDATED: Employee data shifted up by 2 rows
const CONFIG_LAYOUT = {
  EMPLOYEES: {
    NAME_COL: 6,        // Column F (1-based) for employee names
    EMAIL_COL: 7,       // Column G (1-based) for employee emails  
    START_ROW: 1,       // First employee data row (shifted up by 2: was 2, now 1)
    END_ROW: 18         // Last possible employee row (shifted up by 2: was 20, now 18)
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

// Log Sheet Headers - CORRECTED: Match actual CSV structure
const LOG_HEADERS = [
  'Request_ID', 'Timestamp', 'Employee_Name', 'Employee_Email', 'Visit_Date',
  'Visit_Start_Time', 'Visit_End_Time', 'Purpose', 'Reimbursement', 'Description',
  'Companies', 'Status', 'Action_Date', 'Comments'
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
 * Validate and display config status - DIAGNOSTIC FUNCTION
 */
function validateConfigSetup() {
  console.log('=== CONFIG VALIDATION ===');
  
  // Required config keys based on your CSV
  const requiredConfigs = [
    'company_name', 'hr_email', 'manager_email', 'notification_enabled',
    'auto_approve_limit', 'working_days_only', 'automation_email', 
    'debug_mode', 'manager_name', 'hr_name', 'cc_hr'
  ];
  
  const foundConfigs = {};
  const missingConfigs = [];
  
  // Test each required config
  requiredConfigs.forEach(configKey => {
    const value = getConfigValue(configKey);
    if (value !== null) {
      foundConfigs[configKey] = value;
      console.log(`✅ ${configKey}: ${value}`);
    } else {
      missingConfigs.push(configKey);
      console.log(`❌ ${configKey}: NOT FOUND`);
    }
  });
  
  // Test employee data
  console.log('\n=== EMPLOYEE VALIDATION ===');
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    for (let row = 1; row <= 5; row++) {
      try {
        const name = configSheet.getRange(row, 6).getValue();
        const email = configSheet.getRange(row, 7).getValue();
        if (name && email) {
          console.log(`✅ Employee ${row}: ${name} (${email})`);
        }
      } catch (error) {
        console.log(`❌ Employee ${row}: Error reading - ${error}`);
      }
    }
  } catch (error) {
    console.log(`❌ Employee section error: ${error}`);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Found configs: ${Object.keys(foundConfigs).length}/${requiredConfigs.length}`);
  if (missingConfigs.length > 0) {
    console.log(`Missing configs: ${missingConfigs.join(', ')}`);
  }
  
  return {
    found: foundConfigs,
    missing: missingConfigs,
    isComplete: missingConfigs.length === 0
  };
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

/**
 * Generate email footer with system information
 */
function getEmailFooter() {
  return `
    <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 11px;">
      <p style="margin: 0;">
        Created by ${SYSTEM_INFO.CREATED_BY} with love ❤️<br>
        Version ${SYSTEM_INFO.VERSION} | Build ${SYSTEM_INFO.COMMIT_ID} | ${SYSTEM_INFO.BUILD_DATE}
      </p>
    </div>
  `;
}