/**
 * Manually update form dropdown (for testing)
 */
function manualUpdateDropdown() {
  console.log('=== MANUAL DROPDOWN UPDATE ===');
  updateEmployeeDropdown();
  console.log('=== UPDATE COMPLETE ===');
}

/**
 * Test form connection
 */
function testFormConnection() {
  console.log('=== TESTING FORM CONNECTION ===');
  
  // Replace with your actual form ID
  const FORM_ID = '1GUShhQOSd5zzefWst5tmYuarwr-zUsi8zhQOwgjR_3g';
  
  try {
    const form = FormApp.openById(FORM_ID);
    console.log('Form found:', form.getTitle());
    
    const items = form.getItems();
    console.log('Form has', items.length, 'questions');
    
    items.forEach((item, index) => {
      console.log(`Question ${index + 1}: "${item.getTitle()}" (Type: ${item.getType()})`);
    });
    
  } catch (error) {
    console.error('Error accessing form:', error);
    console.log('Make sure you have the correct Form ID');
  }
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Debug config sheet column F
 */
function debugConfigColumnF() {
  console.log('=== DEBUGGING CONFIG COLUMN F ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
  
  if (!configSheet) {
    console.log('Config sheet not found');
    return;
  }
  
  // Show all data in column F
  const range = configSheet.getRange('F1:F20');
  const data = range.getValues();
  
  data.forEach((row, index) => {
    if (row[0] && row[0] !== '') {
      console.log(`Row ${index + 1}, Column F: "${row[0]}"`);
    }
  });
  
  console.log('=== DEBUG COMPLETE ===');
}

/**
 * Test form submission processing
 */
function testFormSubmission() {
  console.log('=== TESTING FORM SUBMISSION ===');
  
  // Mock form submission data
  const mockFormData = [
    new Date(),                    // Timestamp
    '[TEST_EMAIL]',               // Email (should be valid)
    'June',                       // Employee name
    '2024-11-20',                 // Visit date
    '09:00',                      // Start time
    '17:00',                      // End time
    'Client meeting',             // Purpose
    'Yes',                        // Reimbursement
    'Discussed project scope',    // Description
    'ABC Corp, XYZ Ltd'          // Companies
  ];
  
  // Create mock event object
  const mockEvent = { values: mockFormData };
  
  // Process the submission
  onFormSubmit(mockEvent);
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Test employee tab creation
 */
function testEmployeeTabCreation() {
  console.log('=== TESTING EMPLOYEE TAB CREATION ===');
  
  const mockFormData = {
    employeeName: 'June',
    visitDate: '2025-01-15',
    email: '[TEST_EMAIL]'
  };
  
  processEmployeeTabCreation(mockFormData);
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Debug sheet names
 */
function debugSheetNames() {
  console.log('=== DEBUGGING SHEET NAMES ===');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  
  console.log('Total sheets found:', sheets.length);
  
  sheets.forEach((sheet, index) => {
    const name = sheet.getName();
    console.log(`Sheet ${index + 1}: "${name}"`);
    
    // Check if it matches our expected template name
    if (name === SHEET_NAMES.TEMPLATE) {
      console.log('✅ Found matching template sheet!');
    }
    if (name.toLowerCase().includes('template')) {
      console.log('📋 Found template-like sheet:', name);
    }
  });
  
  console.log('Expected template name:', SHEET_NAMES.TEMPLATE);
  console.log('=== DEBUG COMPLETE ===');
}

/**
 * Test email configuration
 */
function testEmailConfig() {
  console.log('=== TESTING EMAIL CONFIG ===');
  
  console.log('Email enabled:', isEmailEnabled());
  console.log('Email time:', getEmailTime());
  
  const militaryTime = getEmailTime();
  const { hour, minute } = parseMilitaryTime(militaryTime);
  console.log(`Parsed time: ${hour}:${minute.toString().padStart(2, '0')}`);
  
  const emailConfig = getEmailAddresses();
  console.log('Email addresses:', emailConfig);
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Test batch email (without sending)
 */
function testBatchEmailContent() {
  console.log('=== TESTING BATCH EMAIL CONTENT ===');
  
  const pendingEntries = getPendingEntries();
  console.log('Pending entries found:', pendingEntries.length);
  
  if (pendingEntries.length > 0) {
    const emailBody = createBatchEmailBody(pendingEntries, 'Test Company');
    console.log('Email body created successfully');
    console.log('First 200 chars:', emailBody.substring(0, 200));
  }
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Force send daily email (for testing)
 */
function forceSendDailyEmail() {
  console.log('=== FORCE SENDING DAILY EMAIL ===');
  sendDailyBatchEmail();
  console.log('=== FORCE SEND COMPLETE ===');
}

/**
 * Test data copying system
 */
function testDataCopying() {
  console.log('=== TESTING DATA COPYING ===');
  
  // Test copying all pending entries
  const result = copyAllPendingEntries();
  console.log('Copy result:', result);
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Test data copying system
 */
function testDataCopying() {
  console.log('=== TESTING DATA COPYING ===');
  
  // Test copying all pending entries
  const result = copyAllPendingEntries();
  console.log('Copy result:', result);
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Test Request ID generation
 */
function testRequestIdGeneration() {
  console.log('=== TESTING REQUEST ID GENERATION ===');
  
  for (let i = 0; i < 5; i++) {
    const requestId = generateUniqueRequestId();
    console.log(`Generated ID ${i + 1}: ${requestId}`);
  }
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Debug copyEntryToEmployeeTab function with detailed logging
 */
function debugCopyEntry() {
  console.log('=== DEBUGGING COPY ENTRY FUNCTION ===');
  
  // First, let's see what pending entries look like
  const pendingEntries = getPendingEntries();
  console.log('Number of pending entries:', pendingEntries.length);
  
  if (pendingEntries.length > 0) {
    console.log('First pending entry structure:');
    const firstEntry = pendingEntries[0];
    
    // Log each property of the entry
    Object.keys(firstEntry).forEach(key => {
      console.log(`  ${key}: ${firstEntry[key]} (type: ${typeof firstEntry[key]})`);
    });
    
    // Test copying this specific entry
    console.log('Testing copy function with first entry...');
    try {
      const result = copyEntryToEmployeeTab(firstEntry);
      console.log('Copy result:', result);
    } catch (error) {
      console.error('Copy error:', error);
      console.error('Error details:', error.toString());
    }
  } else {
    console.log('No pending entries found to test with');
    
    // Create a mock entry for testing
    const mockEntry = {
      requestId: 'REQ-TEST-001',
      employeeName: 'June',
      visitDate: '20/11/2024',  // Your new date format
      startTime: '09:00',
      endTime: '17:00',
      purpose: 'Test meeting',
      companies: 'Test Company',
      description: 'Test description',
      reimbursement: 'No'
    };
    
    console.log('Testing with mock entry:');
    console.log('Mock entry:', mockEntry);
    
    try {
      const result = copyEntryToEmployeeTab(mockEntry);
      console.log('Mock copy result:', result);
    } catch (error) {
      console.error('Mock copy error:', error);
      console.error('Error details:', error.toString());
    }
  }
  
  console.log('=== DEBUG COMPLETE ===');
}

/**
 * Debug date handling specifically
 */
function debugDateHandling() {
  console.log('=== DEBUGGING DATE HANDLING ===');
  
  // Test different date formats including your new format
  const testDates = [
    '2024-11-20',
    '20/11/2024',    // Your new format
    '11/20/2024',
    new Date('2024-11-20'),
    new Date()
  ];
  
  testDates.forEach((testDate, index) => {
    console.log(`\nTesting date ${index + 1}: ${testDate} (type: ${typeof testDate})`);
    
    try {
      const year = getYearFromDate(testDate);
      console.log(`  Extracted year: ${year}`);
      
      const tabName = generateEmployeeTabName('June', year);
      console.log(`  Generated tab name: ${tabName}`);
      
    } catch (error) {
      console.error(`  Error with date ${testDate}:`, error);
    }
  });
  
  console.log('=== DATE DEBUG COMPLETE ===');
}

/**
 * Debug the data flow from Logs to Employee tabs
 */
function debugDataFlow() {
  console.log('=== DEBUGGING DATA FLOW ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
  
  if (!logsSheet) {
    console.log('Logs sheet not found');
    return;
  }
  
  // Get raw data from Logs sheet
  const lastRow = logsSheet.getLastRow();
  if (lastRow <= 1) {
    console.log('No data in Logs sheet');
    return;
  }
  
  console.log('=== RAW DATA FROM LOGS SHEET ===');
  const rawData = logsSheet.getRange(2, 1, 1, 14).getValues()[0]; // Get first data row
  
  rawData.forEach((value, index) => {
    console.log(`Column ${index + 1}: ${value} (type: ${typeof value})`);
  });
  
  console.log('=== PROCESSED BY getPendingEntries() ===');
  const pendingEntries = getPendingEntries();
  if (pendingEntries.length > 0) {
    const firstEntry = pendingEntries[0];
    console.log('Start Time from getPendingEntries():', firstEntry.startTime, '(type:', typeof firstEntry.startTime, ')');
    console.log('End Time from getPendingEntries():', firstEntry.endTime, '(type:', typeof firstEntry.endTime, ')');
  }
  
  console.log('=== DEBUG COMPLETE ===');
}

/**
 * Debug which specific column is causing the typed column error
 */
function debugTypedColumns() {
  console.log('=== DEBUGGING TYPED COLUMNS ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const employeeSheet = sheet.getSheetByName('June 2025'); // Adjust if needed
  
  if (!employeeSheet) {
    console.log('Employee sheet not found');
    return;
  }
  
  const testRow = 15; // Use a safe test row
  
  // Test data that matches what we're trying to insert
  const testData = [
    'REQ-TEST-001',                    // A: Request ID (string)
    new Date('2025-11-17'),            // B: Visit Date (date object)
    'Pending',                         // C: Status (string)
    '03:16:43',                        // D: Start Time (string)
    '04:17:43',                        // E: End Time (string)
    1.02,                              // F: Total Hours (number)
    '123',                             // G: Purpose (string)
    'df',                              // H: Location (string)
    'df',                              // I: Companies (string)
    'df',                              // J: Description (string)
    'No',                              // K: Reimbursement (string)
    ''                                 // L: Remarks (string)
  ];
  
  const columnNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  
  console.log(`Testing each column individually on row ${testRow}:`);
  
  // Test each column individually
  for (let col = 0; col < testData.length; col++) {
    try {
      const cellAddress = `${columnNames[col]}${testRow}`;
      console.log(`Testing column ${columnNames[col]} with value: ${testData[col]} (type: ${typeof testData[col]})`);
      
      employeeSheet.getRange(testRow, col + 1).setValue(testData[col]);
      console.log(`✅ Column ${columnNames[col]} - SUCCESS`);
      
    } catch (error) {
      console.error(`❌ Column ${columnNames[col]} - FAILED: ${error.toString()}`);
      
      // Try to get more info about this column
      try {
        const range = employeeSheet.getRange(testRow, col + 1);
        console.log(`Column ${columnNames[col]} current value:`, range.getValue());
        console.log(`Column ${columnNames[col]} formula:`, range.getFormula());
      } catch (infoError) {
        console.log(`Could not get info for column ${columnNames[col]}`);
      }
    }
  }
  
  // Clean up test data
  try {
    employeeSheet.getRange(testRow, 1, 1, testData.length).clearContent();
    console.log('Test data cleaned up');
  } catch (cleanupError) {
    console.log('Could not clean up test data');
  }
  
  console.log('=== TYPED COLUMNS DEBUG COMPLETE ===');
}

/**
 * Debug the specific row where the error occurs
 */
function debugSpecificRow() {
  console.log('=== DEBUGGING SPECIFIC ROW ISSUE ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const employeeSheet = sheet.getSheetByName('June 2025');
  
  if (!employeeSheet) {
    console.log('Employee sheet not found');
    return;
  }
  
  // Find the next row (same logic as copyEntryToEmployeeTab)
  const lastRow = employeeSheet.getLastRow();
  const nextRow = Math.max(10, lastRow + 1);
  
  console.log(`Last row: ${lastRow}, Next row to use: ${nextRow}`);
  
  // Check what's currently in that row
  console.log('=== CHECKING EXISTING DATA IN TARGET ROW ===');
  const existingData = employeeSheet.getRange(nextRow, 1, 1, 12).getValues()[0];
  existingData.forEach((value, index) => {
    if (value !== '') {
      console.log(`Column ${String.fromCharCode(65 + index)} (${index + 1}): ${value} (type: ${typeof value})`);
    }
  });
  
  // Test writing to the exact same row
  console.log(`=== TESTING WRITE TO ROW ${nextRow} ===`);
  
  const testData = [
    'REQ-TEST-SPECIFIC',               // A: Request ID
    new Date('2025-11-17'),            // B: Visit Date
    'Pending',                         // C: Status
    '03:16:43',                        // D: Start Time
    '04:17:43',                        // E: End Time
    1.02,                              // F: Total Hours
    '123',                             // G: Purpose
    'df',                              // H: Location
    'df',                              // I: Companies
    'df',                              // J: Description
    'No',                              // K: Reimbursement
    ''                                 // L: Remarks
  ];
  
  // Try the same approach as your copyEntryToEmployeeTab function
  try {
    console.log('Attempting to write entire row at once...');
    employeeSheet.getRange(nextRow, 1, 1, testData.length).setValues([testData]);
    console.log('✅ Entire row write - SUCCESS');
  } catch (error) {
    console.error('❌ Entire row write - FAILED:', error.toString());
    
    // Try cell by cell approach
    console.log('Trying cell-by-cell approach...');
    for (let col = 0; col < testData.length; col++) {
      try {
        employeeSheet.getRange(nextRow, col + 1).setValue(testData[col]);
        console.log(`✅ Cell ${String.fromCharCode(65 + col)}${nextRow} - SUCCESS`);
      } catch (cellError) {
        console.error(`❌ Cell ${String.fromCharCode(65 + col)}${nextRow} - FAILED: ${cellError.toString()}`);
      }
    }
  }
  
  // Clean up
  try {
    employeeSheet.getRange(nextRow, 1, 1, testData.length).clearContent();
    console.log('Test data cleaned up');
  } catch (cleanupError) {
    console.log('Could not clean up test data');
  }
  
  console.log('=== SPECIFIC ROW DEBUG COMPLETE ===');
}

/**
 * Debug sheet formatting and column types
 */
function debugSheetFormatting() {
  console.log('=== DEBUGGING SHEET FORMATTING ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const employeeSheet = sheet.getSheetByName('June 2025'); // Adjust if needed
  
  if (!employeeSheet) {
    console.log('Employee sheet not found');
    return;
  }
  
  // Check the header row and first few data rows
  console.log('=== CHECKING COLUMNS A-L ===');
  
  for (let col = 1; col <= 12; col++) {
    const columnLetter = String.fromCharCode(64 + col);
    console.log(`\n--- COLUMN ${columnLetter} ---`);
    
    // Check header
    const headerCell = employeeSheet.getRange(1, col);
    console.log(`Header: "${headerCell.getValue()}"`);
    
    // Check a few data cells
    for (let row = 10; row <= 12; row++) {
      const cell = employeeSheet.getRange(row, col);
      const value = cell.getValue();
      const numberFormat = cell.getNumberFormat();
      
      if (value !== '') {
        console.log(`  Row ${row}: "${value}" (format: ${numberFormat})`);
      }
    }
    
    // Try a test write to see what happens
    const testRow = 15;
    const testCell = employeeSheet.getRange(testRow, col);
    
    try {
      testCell.setValue('TEST');
      console.log(`  Test write: ✅ SUCCESS`);
      testCell.clearContent(); // Clean up
    } catch (error) {
      console.log(`  Test write: ❌ FAILED - ${error.toString()}`);
    }
  }
  
  console.log('=== SHEET FORMATTING DEBUG COMPLETE ===');
}

/**
 * Debug sheet formatting and column types
 */
function debugSheetFormatting() {
  console.log('=== DEBUGGING SHEET FORMATTING ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const employeeSheet = sheet.getSheetByName('June 2025'); // Adjust if needed
  
  if (!employeeSheet) {
    console.log('Employee sheet not found');
    return;
  }
  
  // Check the header row and first few data rows
  console.log('=== CHECKING COLUMNS A-L ===');
  
  for (let col = 1; col <= 12; col++) {
    const columnLetter = String.fromCharCode(64 + col);
    console.log(`\n--- COLUMN ${columnLetter} ---`);
    
    // Check header
    const headerCell = employeeSheet.getRange(1, col);
    console.log(`Header: "${headerCell.getValue()}"`);
    
    // Check a few data cells
    for (let row = 10; row <= 12; row++) {
      const cell = employeeSheet.getRange(row, col);
      const value = cell.getValue();
      const numberFormat = cell.getNumberFormat();
      
      if (value !== '') {
        console.log(`  Row ${row}: "${value}" (format: ${numberFormat})`);
      }
    }
    
    // Try a test write to see what happens
    const testRow = 15;
    const testCell = employeeSheet.getRange(testRow, col);
    
    try {
      testCell.setValue('TEST');
      console.log(`  Test write: ✅ SUCCESS`);
      testCell.clearContent(); // Clean up
    } catch (error) {
      console.log(`  Test write: ❌ FAILED - ${error.toString()}`);
    }
  }
  
  console.log('=== SHEET FORMATTING DEBUG COMPLETE ===');
}

/**
 * Debug the exact moment of failure in copyEntryToEmployeeTab
 */
function debugCopyStepByStep() {
  console.log('=== DEBUGGING COPY STEP BY STEP ===');
  
  // Get the same data that copyEntryToEmployeeTab would use
  const pendingEntries = getPendingEntries();
  if (pendingEntries.length === 0) {
    console.log('No pending entries to test with');
    return;
  }
  
  const logEntry = pendingEntries[0];
  console.log('Using entry:', logEntry.requestId);
  
  // Replicate the exact steps from copyEntryToEmployeeTab
  const year = getYearFromDate(logEntry.visitDate);
  const tabName = generateEmployeeTabName(logEntry.employeeName, year);
  console.log('Target tab:', tabName);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const employeeSheet = sheet.getSheetByName(tabName);
  
  if (!employeeSheet) {
    console.log('Employee sheet not found');
    return;
  }
  
  const lastRow = employeeSheet.getLastRow();
  const nextRow = Math.max(10, lastRow + 1);
  console.log('Target row:', nextRow);
  
  // Test each setValue operation individually
  const testOperations = [
    { col: 1, value: logEntry.requestId, name: 'Request ID' },
    { col: 2, value: new Date(logEntry.visitDate), name: 'Visit Date' },
    { col: 3, value: 'Pending', name: 'Status' },
    { col: 4, value: logEntry.startTime.toString(), name: 'Start Time' },
    { col: 5, value: logEntry.endTime.toString(), name: 'End Time' },
    { col: 6, value: calculateHours(logEntry.startTime, logEntry.endTime), name: 'Total Hours' },
    { col: 7, value: logEntry.purpose.toString(), name: 'Purpose' },
    { col: 8, value: extractPrimaryLocation(logEntry.companies), name: 'Location' },
    { col: 9, value: logEntry.companies.toString(), name: 'Companies' },
    { col: 10, value: logEntry.description.toString(), name: 'Description' },
    { col: 11, value: logEntry.reimbursement.toString(), name: 'Reimbursement' },
    { col: 12, value: '', name: 'Remarks' }
  ];
  
  // Test each operation
  testOperations.forEach(op => {
    try {
      console.log(`Testing ${op.name} (Column ${String.fromCharCode(64 + op.col)}) with value: ${op.value} (type: ${typeof op.value})`);
      employeeSheet.getRange(nextRow, op.col).setValue(op.value);
      console.log(`✅ ${op.name} - SUCCESS`);
    } catch (error) {
      console.error(`❌ ${op.name} - FAILED: ${error.toString()}`);
    }
  });
  
  // Clean up test data
  try {
    employeeSheet.getRange(nextRow, 1, 1, 12).clearContent();
    console.log('Test data cleaned up');
  } catch (cleanupError) {
    console.log('Could not clean up test data');
  }
  
  console.log('=== STEP BY STEP DEBUG COMPLETE ===');
}

/**
 * Debug which columns are causing typed column issues
 */
function debugTypedColumns() {
  console.log('=== DEBUGGING TYPED COLUMNS ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const june2026 = sheet.getSheetByName('June 2026');
  
  if (!june2026) {
    console.log('June 2026 sheet not found');
    return;
  }
  
  // Test writing to each column individually
  const testRow = 20; // Use a safe test row
  const testData = [
    'REQ-TEST',           // A: Request ID
    new Date(),           // B: Date
    'Pending',            // C: Status (your dropdown)
    '09:00',              // D: Time Start
    '17:00',              // E: Time End
    '8.0',                // F: Hours
    'Test Purpose',       // G: Purpose
    'Test Location',      // H: Location
    'Test Company',       // I: Company
    'Test Description',   // J: Description
    'No',                 // K: Reimbursement
    ''                    // L: Remarks
  ];
  
  for (let col = 0; col < testData.length; col++) {
    try {
      june2026.getRange(testRow, col + 1).setValue(testData[col]);
      console.log(`✅ Column ${String.fromCharCode(65 + col)} - OK`);
    } catch (error) {
      console.error(`❌ Column ${String.fromCharCode(65 + col)} - TYPED: ${error.toString()}`);
    }
  }
  
  // Clean up test data
  june2026.getRange(testRow, 1, 1, testData.length).clearContent();
  
  console.log('=== DEBUG COMPLETE ===');
}

/**
 * Test status sync system
 */
function testStatusSync() {
  console.log('=== TESTING STATUS SYNC ===');
  
  // Test syncing a specific Request ID
  const testRequestId = 'REQ-1763293178124-354'; // Use an actual Request ID from your data
  const testStatus = 'Approved';
  const testSourceSheet = 'June 2025';
  
  console.log(`Testing sync: ${testRequestId} → ${testStatus}`);
  
  syncStatusBidirectional(testRequestId, testStatus, testSourceSheet);
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Test the complete status sync workflow
 */
function testCompleteWorkflow() {
  console.log('=== TESTING COMPLETE WORKFLOW ===');
  console.log('Current debug mode:', isEmailEnabled());
  console.log('Email config:', getEmailAddresses());
  console.log('=== SETUP COMPLETE ===');
}

/**
 * Preview confirmation email content
 */
function previewConfirmationEmail() {
  console.log('=== PREVIEWING EMAIL CONTENT ===');
  
  // Use actual Request ID from your data
  const testRequestId = 'REQ-1763293178124-354';
  
  // Get entry details
  const entryDetails = getEntryDetailsByRequestId(testRequestId);
  if (!entryDetails) {
    console.log('Entry not found');
    return;
  }
  
  console.log('Entry details:', entryDetails);
  
  // Generate email content
  const emailConfig = getEmailAddresses();
  const emailBody = createConfirmationEmailBody(entryDetails, 'Approved', emailConfig);
  
  console.log('Email body generated successfully');
  console.log('First 200 characters:', emailBody.substring(0, 200));
  
  console.log('=== PREVIEW COMPLETE ===');
}

/**
 * DIAGNOSTIC: Test web app functionality (moved from webapp.js)
 */
function testWebAppFunctionality() {
  console.log('=== TESTING WEB APP FUNCTIONALITY ===');
  
  // Test approval action
  const testRequestId = 'REQ-1764935854141-278'; // Use actual Request ID from logs
  console.log(`Testing approval for: ${testRequestId}`);
  
  // Simulate GET request
  const mockGetEvent = {
    parameter: {
      action: 'approve',
      requestId: testRequestId
    }
  };
  
  try {
    const response = doGet(mockGetEvent);
    console.log('GET response type:', typeof response);
    console.log('GET response success');
  } catch (error) {
    console.error('GET test error:', error);
  }
  
  // Test web app URL generation
  const webAppUrl = getWebAppUrl();
  console.log('Web app URL:', webAppUrl);
  
  console.log('=== WEB APP TEST COMPLETE ===');
}

/**
 * DIAGNOSTIC: Test if web app responds to basic requests (moved from webapp.js)
 */
function testWebAppBasic() {
  console.log('=== BASIC WEB APP TEST ===');
  
  try {
    // Test basic doGet without parameters
    const basicEvent = { parameter: {} };
    const response = doGet(basicEvent);
    console.log('Basic doGet response:', response);
    
    // Test with valid parameters
    const validEvent = {
      parameter: {
        action: 'approve',
        requestId: 'REQ-test-123'
      }
    };
    const validResponse = doGet(validEvent);
    console.log('Valid doGet response:', validResponse);
    
  } catch (error) {
    console.error('Basic web app test error:', error);
  }
  
  console.log('=== BASIC TEST COMPLETE ===');
}

/**
 * DIAGNOSTIC: Check deployment status and URLs (moved from webapp.js)
 */
function checkDeploymentStatus() {
  console.log('=== DEPLOYMENT DIAGNOSTIC ===');
  
  try {
    const scriptId = ScriptApp.getScriptId();
    const webAppUrl = getWebAppUrl();
    
    console.log(`Script ID: ${scriptId}`);
    console.log(`Generated Web App URL: ${webAppUrl}`);
    
    // Test if handleApprovalAction function exists
    if (typeof handleApprovalAction === 'function') {
      console.log('✅ handleApprovalAction function exists');
    } else {
      console.log('❌ handleApprovalAction function NOT found');
    }
    
    // Test basic web app structure
    console.log('Testing doGet function...');
    const testEvent = {
      parameter: {
        action: 'approve',
        requestId: 'REQ-1764935854141-278'
      }
    };
    
    const result = doGet(testEvent);
    console.log('doGet test result type:', typeof result);
    
  } catch (error) {
    console.error('Deployment diagnostic error:', error);
  }
  
  console.log('=== DIAGNOSTIC COMPLETE ===');
}


/**
 * Test date formatting with actual data
 */
function testDateFormatting() {
  console.log('=== TESTING DATE FORMATTING ===');
  
  // Test with the actual date from your logs
  const testDate = '28/01/2026';
  console.log(`Testing date: "${testDate}"`);
  
  const formatted = formatDate(testDate);
  console.log(`Formatted result: "${formatted}"`);
  
  // Test year extraction
  const year = getYearFromDate(testDate);
  console.log(`Extracted year: ${year}`);
  
  console.log('=== DATE FORMATTING TEST COMPLETE ===');
}

/**
 * Test web app URL with actual deployment URL
 */
function testWebAppUrl() {
  console.log('=== TESTING WEB APP URL ===');
  
  const webAppUrl = getWebAppUrl();
  console.log(`Web App URL: ${webAppUrl}`);
  
  // Test URL construction with actual Request ID
  const testRequestId = 'REQ-1764936599767-341';
  const approveUrl = `${webAppUrl}?action=approve&requestId=${testRequestId}`;
  console.log(`Approve URL: ${approveUrl}`);
  
  console.log('=== WEB APP URL TEST COMPLETE ===');
}

/**
 * DIAGNOSTIC: Check if doGet function exists and is accessible
 */
function checkDoGetFunction() {
  console.log('=== CHECKING DOGET FUNCTION ===');
  
  // Check if doGet function exists
  if (typeof doGet === 'function') {
    console.log('✅ doGet function exists');
    
    // Test doGet function directly
    try {
      const testEvent = {
        parameter: {
          action: 'approve',
          requestId: 'REQ-1764936599767-341'
        }
      };
      
      console.log('Testing doGet with parameters:', testEvent.parameter);
      const result = doGet(testEvent);
      console.log('✅ doGet function executed successfully');
      console.log('Result type:', typeof result);
      
    } catch (error) {
      console.error('❌ doGet function error:', error);
    }
    
  } else {
    console.error('❌ doGet function NOT FOUND');
  }
  
  // Check if handleApprovalAction exists
  if (typeof handleApprovalAction === 'function') {
    console.log('✅ handleApprovalAction function exists');
  } else {
    console.error('❌ handleApprovalAction function NOT FOUND');
  }
  
  console.log('=== DOGET CHECK COMPLETE ===');
}

/**
 * DIAGNOSTIC: Test web app deployment status
 */
function testWebAppDeployment() {
  console.log('=== TESTING WEB APP DEPLOYMENT ===');
  
  // Get current script ID and web app URL
  const scriptId = ScriptApp.getScriptId();
  const webAppUrl = getWebAppUrl();
  
  console.log(`Script ID: ${scriptId}`);
  console.log(`Web App URL: ${webAppUrl}`);
  
  // Check if functions exist
  console.log('\n--- Function Availability ---');
  const functions = ['doGet', 'doPost', 'handleApprovalAction', 'getWebAppUrl'];
  functions.forEach(funcName => {
    if (typeof eval(funcName) === 'function') {
      console.log(`✅ ${funcName}: Available`);
    } else {
      console.log(`❌ ${funcName}: NOT FOUND`);
    }
  });
  
  // Test basic doGet functionality
  console.log('\n--- Testing doGet Function ---');
  try {
    const mockEvent = {
      parameter: {
        action: 'approve',
        requestId: 'REQ-test-deployment'
      }
    };
    
    const response = doGet(mockEvent);
    console.log('✅ doGet test successful');
    console.log('Response type:', typeof response);
    
  } catch (error) {
    console.error('❌ doGet test failed:', error);
  }
  
  console.log('=== DEPLOYMENT TEST COMPLETE ===');
}