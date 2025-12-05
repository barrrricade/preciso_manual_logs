

/**
 * Copy entry to employee tab with proper time formatting (FIXED)
 */
function copyEntryToEmployeeTab(logEntry) {
  try {
    const year = getYearFromDate(logEntry.visitDate);
    const tabName = generateEmployeeTabName(logEntry.employeeName, year);
    
    console.log(`Copying entry to employee tab: ${tabName}`);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const employeeSheet = sheet.getSheetByName(tabName);
    
    if (!employeeSheet) {
      console.error(`Employee tab not found: ${tabName}`);
      return false;
    }
    
    // Find next empty row (starting from row 10)
    const lastRow = employeeSheet.getLastRow();
    const nextRow = Math.max(10, lastRow + 1);
    
    // CONVERT TIME OBJECTS TO STRINGS
    const startTimeStr = formatTimeToString(logEntry.startTime);
    const endTimeStr = formatTimeToString(logEntry.endTime);
    
    // Calculate total hours with proper time strings
    const totalHours = calculateHoursFromStrings(startTimeStr, endTimeStr);
    
    // STANDARDIZE DATE FORMAT
    const visitDate = parseAndFormatDate(logEntry.visitDate);
    
    console.log('Formatted data:', {
      date: visitDate,
      startTime: startTimeStr,
      endTime: endTimeStr,
      totalHours: totalHours
    });
    
    // Insert data cell by cell with proper formatting - UPDATED: Match new template structure
    employeeSheet.getRange(nextRow, 1).setValue(logEntry.requestId);     // A: REQUEST ID
    employeeSheet.getRange(nextRow, 2).setValue(new Date());             // B: REQUEST DATE (current date)
    employeeSheet.getRange(nextRow, 3).setValue(visitDate);              // C: VISIT DATE
    employeeSheet.getRange(nextRow, 4).setValue('Pending');              // D: STATUS
    employeeSheet.getRange(nextRow, 5).setValue(startTimeStr);           // E: TIME START (as string)
    employeeSheet.getRange(nextRow, 6).setValue(endTimeStr);             // F: TIME END (as string)
    employeeSheet.getRange(nextRow, 7).setValue(totalHours);             // G: TOTAL HOURS (as number)
    employeeSheet.getRange(nextRow, 8).setValue(String(logEntry.purpose)); // H: PURPOSE
    employeeSheet.getRange(nextRow, 9).setValue(extractPrimaryLocation(logEntry.companies)); // I: LOCATION
    employeeSheet.getRange(nextRow, 10).setValue(String(logEntry.companies)); // J: COMPANIES
    employeeSheet.getRange(nextRow, 11).setValue(String(logEntry.description)); // K: DESCRIPTION
    employeeSheet.getRange(nextRow, 12).setValue(String(logEntry.reimbursement)); // L: REIMBURSEMENT
    employeeSheet.getRange(nextRow, 13).setValue('');                    // M: REMARKS
    
    // Set up dropdown validation for Status column (D) - UPDATED: Status moved to column D
    const statusCell = employeeSheet.getRange(nextRow, 4);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pending', 'Approved', 'Rejected'])
      .setAllowInvalid(false)
      .build();
    statusCell.setDataValidation(rule);
    
    console.log(`✅ Entry copied to ${tabName} at row ${nextRow}`);
    return true;
    
  } catch (error) {
    console.error('Error copying entry to employee tab:', error);
    console.error('Error details:', error.toString());
    return false;
  }
}

/**
 * Calculate hours between start and end time
 */
function calculateHours(startTime, endTime) {
  try {
    const start = new Date(`1970-01-01 ${startTime}`);
    const end = new Date(`1970-01-01 ${endTime}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  } catch (error) {
    console.error('Error calculating hours:', error);
    return '0';
  }
}

/**
 * Extract primary location from companies string
 */
function extractPrimaryLocation(companies) {
  try {
    if (!companies) return '';
    const companyList = companies.split(',');
    return companyList[0].trim();
  } catch (error) {
    return companies || '';
  }
}



/**
 * Update status in Logs sheet by Request ID
 */
function updateLogsStatus(requestId, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) return false;
    
    const lastRow = logsSheet.getLastRow();
    const data = logsSheet.getRange(1, 1, lastRow, 14).getValues(); // Adjust column count as needed
    
    for (let i = 1; i < data.length; i++) { // Skip header
      if (data[i][0] === requestId) { // Request ID in column A
        logsSheet.getRange(i + 1, 12).setValue(newStatus); // Status in column L (adjust as needed)
        console.log(`Updated Logs status for ${requestId}: ${newStatus}`);
        return true;
      }
    }
    
    console.log(`Request ID not found in Logs: ${requestId}`);
    return false;
    
  } catch (error) {
    console.error('Error updating Logs status:', error);
    return false;
  }
}

/**
 * Update status in Employee tab by Request ID
 */
function updateEmployeeTabStatus(requestId, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = sheet.getSheets();
    
    // Search all employee tabs (sheets with year in name)
    for (let employeeSheet of sheets) {
      const sheetName = employeeSheet.getName();
      
      // Skip non-employee sheets
      if (!sheetName.includes('202')) continue; // Assumes year format
      
      const lastRow = employeeSheet.getLastRow();
      if (lastRow < 10) continue; // No data rows
      
      const data = employeeSheet.getRange(10, 1, lastRow - 9, 3).getValues(); // A, B, C columns from row 10
      
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === requestId) { // Request ID in column A
          employeeSheet.getRange(10 + i, 3).setValue(newStatus); // Status in column C
          console.log(`Updated ${sheetName} status for ${requestId}: ${newStatus}`);
          return true;
        }
      }
    }
    
    console.log(`Request ID not found in employee tabs: ${requestId}`);
    return false;
    
  } catch (error) {
    console.error('Error updating employee tab status:', error);
    return false;
  }
}

/**
 * Sync status between Logs and Employee tab
 */
function syncStatus(requestId, newStatus, updatedBy = 'Manager') {
  try {
    console.log(`Syncing status for ${requestId}: ${newStatus}`);
    
    // Update both locations
    updateLogsStatus(requestId, newStatus);
    updateEmployeeTabStatus(requestId, newStatus);
    
    // Send confirmation email if approved/rejected
    if (newStatus === 'Approved' || newStatus === 'Rejected') {
      // TODO: Implement confirmation email
      console.log(`TODO: Send ${newStatus} confirmation email for ${requestId}`);
    }
    
    console.log(`✅ Status synced for ${requestId}`);
    
  } catch (error) {
    console.error('Error syncing status:', error);
  }
}

/**
 * Parse and standardize date format
 */
function parseAndFormatDate(dateString) {
  try {
    console.log('Parsing date:', dateString, '(type:', typeof dateString, ')');
    
    // If it's already a Date object, return it
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Handle string dates
    let parsedDate;
    
    // Try different date formats
    if (dateString.includes('/')) {
      // Handle DD/MM/YYYY or MM/DD/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY format (based on your form data)
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed in Date constructor
        const year = parseInt(parts[2]);
        parsedDate = new Date(year, month, day);
      }
    } else if (dateString.includes('-')) {
      // Handle YYYY-MM-DD format
      parsedDate = new Date(dateString);
    } else {
      // Try direct parsing
      parsedDate = new Date(dateString);
    }
    
    // Validate the parsed date
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date parsed:', dateString);
      return new Date(); // Return current date as fallback
    }
    
    console.log('Successfully parsed date:', parsedDate);
    return parsedDate;
    
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date(); // Return current date as fallback
  }
}

/**
 * Convert time object/string to simple HH:MM format
 */
function formatTimeToString(timeValue) {
  try {
    if (!timeValue) return '';
    
    // If it's already a string, return as-is
    if (typeof timeValue === 'string') {
      return timeValue;
    }
    
    // If it's a Date object, extract time portion
    if (timeValue instanceof Date) {
      const hours = timeValue.getHours().toString().padStart(2, '0');
      const minutes = timeValue.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Fallback
    return String(timeValue);
    
  } catch (error) {
    console.error('Error formatting time:', error);
    return String(timeValue || '');
  }
}

/**
 * Calculate hours from time strings (FIXED)
 */
function calculateHoursFromStrings(startTimeStr, endTimeStr) {
  try {
    if (!startTimeStr || !endTimeStr) return '0.0';
    
    // Parse HH:MM format
    const startParts = startTimeStr.split(':');
    const endParts = endTimeStr.split(':');
    
    const startHours = parseInt(startParts[0]) + (parseInt(startParts[1] || 0) / 60);
    const endHours = parseInt(endParts[0]) + (parseInt(endParts[1] || 0) / 60);
    
    let totalHours = endHours - startHours;
    
    // Handle overnight shifts
    if (totalHours < 0) {
      totalHours += 24;
    }
    
    return totalHours.toFixed(1);
    
  } catch (error) {
    console.error('Error calculating hours from strings:', error);
    return '0.0';
  }
}

/**
 * Detect status changes in employee tabs (UPDATED - no batch email references)
 */
function onEdit(e) {
  try {
    // Only process if this is a status change
    if (!isStatusChange(e)) {
      return; // Not a status change, ignore
    }
    
    console.log('=== STATUS CHANGE DETECTED ===');
    console.log('Sheet:', e.source.getActiveSheet().getName());
    console.log('Range:', e.range.getA1Notation());
    console.log('Old value:', e.oldValue);
    console.log('New value:', e.value);
    
    const sheetName = e.source.getActiveSheet().getName();
    const row = e.range.getRow();
    const newStatus = e.value;
    
    // Get Request ID from column A of the same row
    const requestId = e.source.getActiveSheet().getRange(row, 1).getValue();
    
    if (!requestId || !requestId.toString().startsWith('REQ-')) {
      console.log('No valid Request ID found, skipping sync');
      return;
    }
    
    console.log(`Processing status change: ${requestId} → ${newStatus}`);
    
    // Sync status between sheets
    syncStatusBidirectional(requestId, newStatus, sheetName);
    
    // NO IMMEDIATE EMAILS - manager will use button to send confirmations
    console.log(`✅ Status synced for ${requestId} - use confirmation button to notify employee`);
    
    console.log('=== STATUS CHANGE PROCESSED ===');
    
  } catch (error) {
    console.error('Error in onEdit trigger:', error);
  }
}

/**
 * Check if the edit is a status change we care about
 */
function isStatusChange(e) {
  try {
    // Must be a single cell edit
    if (e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) {
      return false;
    }
    
    const sheetName = e.source.getActiveSheet().getName();
    const column = e.range.getColumn();
    const row = e.range.getRow();
    
    // Must be in an employee sheet (contains year like "2024", "2025")
    if (!sheetName.match(/202\d/)) {
      return false;
    }
    
    // Must be column D (Status column) and row 10 or higher (data rows) - UPDATED: Status now in column D
    if (column !== 4 || row < 10) {
      return false;
    }
    
    // Must be a valid status value
    const newValue = e.value;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(newValue)) {
      return false;
    }
    
    // Must have changed from a different value
    if (e.oldValue === newValue) {
      return false;
    }
    
    console.log('✅ Valid status change detected');
    return true;
    
  } catch (error) {
    console.error('Error checking status change:', error);
    return false;
  }
}

/**
 * Sync status bidirectionally between Logs and Employee tabs
 */
function syncStatusBidirectional(requestId, newStatus, sourceSheet) {
  try {
    console.log(`Syncing status: ${requestId} → ${newStatus} (from ${sourceSheet})`);
    
    // Update Logs sheet
    const logsUpdated = updateLogsStatusByRequestId(requestId, newStatus);
    console.log('Logs sheet updated:', logsUpdated);
    
    // Update all other employee tabs (in case same person has multiple years)
    const employeeTabsUpdated = updateAllEmployeeTabsStatus(requestId, newStatus, sourceSheet);
    console.log('Employee tabs updated:', employeeTabsUpdated);
    
    // Record the sync action
    recordStatusChange(requestId, newStatus, sourceSheet);
    
    console.log(`✅ Status sync complete for ${requestId}`);
    
  } catch (error) {
    console.error('Error in bidirectional sync:', error);
  }
}

/**
 * Update status in Logs sheet by Request ID
 */
function updateLogsStatusByRequestId(requestId, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) {
      console.log('Logs sheet not found');
      return false;
    }
    
    const lastRow = logsSheet.getLastRow();
    if (lastRow <= 1) return false;
    
    // Find the row with matching Request ID
    const data = logsSheet.getRange(1, 1, lastRow, 14).getValues();
    
    for (let i = 1; i < data.length; i++) { // Skip header
      if (data[i][0] === requestId) { // Request ID in column A
        // Update Status column (column N - position 14 in new structure)
        logsSheet.getRange(i + 1, 14).setValue(newStatus);
        
        // Update Action Date (column O - position 15, but we don't have this column yet)
        // For now, we can add a timestamp to the Remarks column (column O - position 15)
        const currentRemarks = logsSheet.getRange(i + 1, 15).getValue() || '';
        const timestamp = new Date().toLocaleString();
        const newRemarks = currentRemarks + (currentRemarks ? '; ' : '') + `${newStatus} ${timestamp}`;
        logsSheet.getRange(i + 1, 15).setValue(newRemarks);
        
        console.log(`Updated Logs sheet row ${i + 1}: ${requestId} → ${newStatus}`);
        return true;
      }
    }
    
    console.log(`Request ID ${requestId} not found in Logs sheet`);
    return false;
    
  } catch (error) {
    console.error('Error updating Logs sheet:', error);
    return false;
  }
}

/**
 * Update status in all employee tabs except source
 */
function updateAllEmployeeTabsStatus(requestId, newStatus, sourceSheet) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const allSheets = sheet.getSheets();
    let updatedCount = 0;
    
    // Search all employee sheets (contain year pattern)
    allSheets.forEach(employeeSheet => {
      const sheetName = employeeSheet.getName();
      
      // Skip non-employee sheets and source sheet
      if (!sheetName.match(/202\d/) || sheetName === sourceSheet) {
        return;
      }
      
      const lastRow = employeeSheet.getLastRow();
      if (lastRow < 10) return; // No data rows
      
      // Search for matching Request ID
      const data = employeeSheet.getRange(10, 1, lastRow - 9, 4).getValues(); // A, B, C, D columns
      
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === requestId) { // Request ID in column A
          // Update Status in column D - UPDATED: Status now in column D
          employeeSheet.getRange(10 + i, 4).setValue(newStatus);
          console.log(`Updated ${sheetName} row ${10 + i}: ${requestId} → ${newStatus}`);
          updatedCount++;
        }
      }
    });
    
    return updatedCount;
    
  } catch (error) {
    console.error('Error updating employee tabs:', error);
    return 0;
  }
}

/**
 * Record status change for audit trail
 */
function recordStatusChange(requestId, newStatus, sourceSheet) {
  try {
    const timestamp = new Date();
    const user = Session.getActiveUser().getEmail();
    
    console.log(`Status change recorded: ${requestId} → ${newStatus} by ${user} in ${sourceSheet} at ${timestamp}`);
    
    // Could add to a separate audit log sheet if needed
    
  } catch (error) {
    console.error('Error recording status change:', error);
  }
}

/**
 * Manual confirmation email button - sends all pending confirmations
 */
function sendConfirmationEmailsButton() {
  console.log('=== MANUAL CONFIRMATION EMAIL BUTTON CLICKED ===');
  
  try {
    // Check if emails are enabled
    if (!isEmailEnabled()) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('Emails Disabled', 'Email sending is disabled in debug mode (Config B9 = FALSE)', ui.ButtonSet.OK);
      return;
    }
    
    // Get all entries that need confirmation emails (approved/rejected but not yet notified)
    const pendingConfirmations = getPendingConfirmations();
    
    if (pendingConfirmations.length === 0) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('No Confirmations Needed', 'There are no approved/rejected entries that need confirmation emails.', ui.ButtonSet.OK);
      return;
    }
    
    console.log(`Found ${pendingConfirmations.length} entries needing confirmation`);
    
    // Send individual confirmation emails for each entry
    let emailsSent = 0;
    
    pendingConfirmations.forEach(entry => {
      sendStatusConfirmationEmail(entry.requestId, entry.status);
      emailsSent++;
    });
    
    // Mark entries as notified (add a timestamp to comments or new column)
    markEntriesAsNotified(pendingConfirmations);
    
    // Show success message
    const ui = SpreadsheetApp.getUi();
    
    ui.alert(
      'Confirmation Emails Sent!', 
      `Successfully sent confirmation emails:\n\n` +
      `• ${emailsSent} emails sent\n` +
      `• ${pendingConfirmations.length} entries confirmed`, 
      ui.ButtonSet.OK
    );
    
    console.log(`✅ Confirmation emails sent - ${emailsSent} emails total`);
    
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('Email Error', 'Failed to send confirmation emails. Check the logs for details.', ui.ButtonSet.OK);
  }
  
  console.log('=== MANUAL CONFIRMATION EMAIL COMPLETE ===');
}

/**
 * Get entries that are approved/rejected but haven't been notified yet
 */
function getPendingConfirmations() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) return [];
    
    const lastRow = logsSheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const data = logsSheet.getRange(2, 1, lastRow - 1, 14).getValues();
    const pendingConfirmations = [];
    
    data.forEach((row, index) => {
      const status = row[11]; // Status column
      const comments = row[13]; // Comments column
      
      // Check if status is approved/rejected AND not already notified
      if ((status === 'Approved' || status === 'Rejected') && 
          (!comments || !comments.includes('NOTIFIED'))) {
        
        pendingConfirmations.push({
          requestId: row[0],
          employeeEmail: row[2],
          employeeName: row[3],
          visitDate: row[4],
          startTime: row[5],
          endTime: row[6],
          purpose: row[7],
          reimbursement: row[8],
          description: row[9],
          companies: row[10],
          status: row[11],
          actionDate: row[12],
          rowNumber: index + 2 // For updating later
        });
      }
    });
    
    console.log(`Found ${pendingConfirmations.length} entries needing confirmation`);
    return pendingConfirmations;
    
  } catch (error) {
    console.error('Error getting pending confirmations:', error);
    return [];
  }
}

/**
 * Mark entries as notified in the Logs sheet
 */
function markEntriesAsNotified(entries) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) return;
    
    const timestamp = new Date().toLocaleString();
    
    entries.forEach(entry => {
      // Update comments column to mark as notified
      const currentComments = logsSheet.getRange(entry.rowNumber, 14).getValue() || '';
      const newComments = currentComments + (currentComments ? '; ' : '') + `NOTIFIED ${timestamp}`;
      logsSheet.getRange(entry.rowNumber, 14).setValue(newComments);
    });
    
    console.log(`Marked ${entries.length} entries as notified`);
    
  } catch (error) {
    console.error('Error marking entries as notified:', error);
  }
}

/**
 * Status confirmation placeholder (emails now sent via button)
 */
function sendStatusConfirmationEmail(requestId, newStatus) {
  console.log(`Status updated: ${requestId} → ${newStatus}`);
  console.log('Use "Send Confirmation Emails" button to notify employees');
  // No immediate emails - manager will use button to send confirmations
}