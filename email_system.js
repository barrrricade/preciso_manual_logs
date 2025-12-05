/**
 * PHASE 2: Simplified Approve-Only Email System
 * - Removed timing dependencies
 * - Single APPROVE button for manager
 * - Respects debug_mode config
 * - Immediate email sending on form submission
 * - HR gets notification only (no actions required)
 * - Reimbursement is just a flag for manager visibility
 */

/**
 * Send immediate manager approval email on form submission
 */
function sendManagerApprovalEmail(formData, requestId) {
  try {
    console.log('=== SENDING MANAGER APPROVAL EMAIL ===');
    
    // Check if emails are enabled (respect debug_mode)
    if (!isEmailEnabled()) {
      console.log('Emails disabled in debug mode - skipping manager approval email');
      return;
    }
    
    // Get email configuration
    const emailConfig = getEmailAddresses();
    
    if (!emailConfig.manager || !emailConfig.automation) {
      console.error('Manager or automation email not configured - cannot send approval email');
      return;
    }
    
    // Create approval email
    const subject = `[APPROVAL REQUIRED] Manual Logs Automation - ${formData.employeeName}`;
    const emailBody = createManagerApprovalEmailBody(formData, requestId, emailConfig);
    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Manual Logs`,
      from: emailConfig.automation
    };
    
    // Send email from automation to manager
    GmailApp.sendEmail(emailConfig.manager, subject, '', emailOptions);
    console.log(`✅ Manager approval email sent from: ${emailConfig.automation} to: ${emailConfig.manager}`);
    
    console.log('=== MANAGER APPROVAL EMAIL COMPLETE ===');
    
  } catch (error) {
    console.error('Error sending manager approval email:', error);
  }
}

/**
 * Create manager approval email body - APPROVE ONLY (Yellow/Pending theme)
 */
function createManagerApprovalEmailBody(formData, requestId, emailConfig) {
  const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const visitDateFormatted = formatDate(formData.visitDate);
  const timeRange = `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;
  
  // Create approve URL (will be handled by web app)
  const approveUrl = `${getWebAppUrl()}?action=approve&requestId=${requestId}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header - Yellow/Pending Theme -->
        <div style="background: linear-gradient(135deg, #ffa726, #ffb74d); color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Visit Log Approval Required</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            ⏳ New submission awaiting approval
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Hi ${emailConfig.managerName || 'Manager'},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            A new visit log entry has been submitted and requires your approval:
          </p>
          
          <!-- Entry Details -->
          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; background: #fafafa;">
            <h3 style="margin: 0 0 10px 0; color: #2c5aa0; font-size: 18px;">
              ${formData.employeeName} (${visitDateFormatted}, ${timeRange})
            </h3>
            <p style="margin: 5px 0; color: #333;">
              <strong>Companies:</strong> ${formData.companies}
            </p>
            <p style="margin: 5px 0; color: #333;">
              <strong>Purpose:</strong> ${formData.purpose}
            </p>
            <p style="margin: 5px 0; color: #333;">
              <strong>Description:</strong> ${formData.description || 'N/A'}
            </p>
            <p style="margin: 5px 0; color: #333;">
              <strong>Reimbursement Flag:</strong> 
              <span style="color: ${formData.reimbursement === 'Yes' ? '#f57c00' : '#388e3c'}; font-weight: bold;">
                ${formData.reimbursement}
              </span>
            </p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>Request ID:</strong> ${requestId}
            </p>
          </div>
          
          <!-- Approve Button - Green -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${approveUrl}" 
               style="display: inline-block; background-color: #4caf50; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              ✅ APPROVE REQUEST
            </a>
          </div>
          
          <!-- Instructions - Blue -->
          <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1976d2;">Action Required:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
              <li>Click <strong>"APPROVE REQUEST"</strong> to approve this visit log</li>
              <li>For rejections or issues, please update the status manually in the <a href="${spreadsheetUrl}" style="color: #1976d2;">Google Sheets</a></li>
              <li>Employee and HR will be automatically notified upon approval</li>
            </ul>
          </div>
          
          <!-- Note - Yellow -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Note:</strong> This email only contains an APPROVE button. For rejections or complex issues, please handle them manually in the spreadsheet.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            <strong>Automated notification from ${emailConfig.company} Manual Logs</strong><br>
            This email is sent immediately when a valid employee submits a visit log
          </p>
          ${getEmailFooter()}
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Send combined HR notification with employee CC when approved - SIMPLIFIED
 * Uses automation email as sender, HR as recipient, employee as CC
 */
function sendApprovalNotificationEmail(requestId, employeeEmail, employeeName) {
  try {
    console.log('=== SENDING COMBINED APPROVAL NOTIFICATION EMAIL ===');
    
    // Check if emails are enabled (respect debug_mode)
    if (!isEmailEnabled()) {
      console.log('Emails disabled in debug mode - skipping approval notification email');
      return;
    }
    
    // Get email configuration
    const emailConfig = getEmailAddresses();
    
    // Check if required emails are configured
    if (!emailConfig.hr || !emailConfig.automation) {
      console.error('HR or automation email not configured - cannot send approval notification');
      return;
    }
    
    // Get entry details from logs
    const entryDetails = getEntryDetailsByRequestId(requestId);
    if (!entryDetails) {
      console.error('Entry details not found for request ID:', requestId);
      return;
    }
    
    const subject = `[APPROVED] Manual Logs Automation - ${employeeName} (${requestId})`;
    const emailBody = createCombinedApprovalEmailBody(entryDetails, emailConfig);
    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Manual Logs`,
      cc: employeeEmail
    };
    
    // Send from automation email to HR with employee CC'd
    GmailApp.sendEmail(emailConfig.hr, subject, '', emailOptions);
    console.log(`✅ Combined approval notification sent - HR: ${emailConfig.hr}, Employee CC: ${employeeEmail}`);
    
    console.log('=== COMBINED APPROVAL NOTIFICATION COMPLETE ===');
    
  } catch (error) {
    console.error('Error sending combined approval notification:', error);
  }
}

/**
 * Get entry details by request ID from Logs sheet
 */
function getEntryDetailsByRequestId(requestId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) return null;
    
    const lastRow = logsSheet.getLastRow();
    if (lastRow <= 1) return null;
    
    const data = logsSheet.getRange(2, 1, lastRow - 1, 14).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === requestId) {
        return {
          requestId: data[i][0],
          timestamp: data[i][1],
          employeeName: data[i][2],
          employeeEmail: data[i][3],
          visitDate: data[i][4],
          startTime: data[i][5],
          endTime: data[i][6],
          purpose: data[i][7],
          reimbursement: data[i][8],
          description: data[i][9],
          companies: data[i][10],
          status: data[i][11]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting entry details:', error);
    return null;
  }
}

/**
 * Create combined approval email body - Green theme (HR + Employee)
 */
function createCombinedApprovalEmailBody(entryDetails, emailConfig) {
  const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const visitDateFormatted = formatDate(entryDetails.visitDate);
  const requestDateFormatted = formatDate(entryDetails.timestamp);
  const timeRange = `${formatTime(entryDetails.startTime)} - ${formatTime(entryDetails.endTime)}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header - Green Theme -->
        <div style="background: linear-gradient(135deg, #4caf50, #81c784); color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Visit Log Approved ✅</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Employee visit request approved by management
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Hi ${emailConfig.hrName} & ${entryDetails.employeeName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            This visit log entry has been approved by ${emailConfig.managerName}:
          </p>
          
          <!-- Entry Details - Green border -->
          <div style="border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 10px 0; background: #f8fff8;">
            <h4 style="margin: 0 0 10px 0; color: #4caf50;">📋 Approved Visit Log</h4>
            <p style="margin: 5px 0;"><strong>Employee:</strong> ${entryDetails.employeeName}</p>
            <p style="margin: 5px 0;"><strong>Request Date:</strong> ${requestDateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Visit Date:</strong> ${visitDateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeRange}</p>
            <p style="margin: 5px 0;"><strong>Companies:</strong> ${entryDetails.companies}</p>
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${entryDetails.purpose}</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${entryDetails.description || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Reimbursement Flag:</strong> 
              <span style="color: #4caf50; font-weight: bold;">${entryDetails.reimbursement}</span>
            </p>
            <p style="margin: 5px 0;"><strong>Approved by:</strong> ${emailConfig.managerName}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>Request ID:</strong> ${entryDetails.requestId}</p>
          </div>
          
          <!-- HR Information - Green -->
          <div style="background: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 6px; padding: 15px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #2e7d32;">[FOR HR] (${emailConfig.hrName}):</h4>
            <p style="margin: 0; color: #333;">
              <strong>No Action Required:</strong> This is a notification only. The visit log has been approved and recorded in the employee's activity report.
            </p>
          </div>
          
          <!-- Employee Information - Blue -->
          <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 6px; padding: 15px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">✅ For Employee (${entryDetails.employeeName}):</h4>
            <p style="margin: 0; color: #333;">
              <strong>Verification:</strong> Please confirm the details above are correct. Your visit log has been recorded in your activity report.
            </p>
          </div>
          
          <!-- View Report Button - Blue -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="${spreadsheetUrl}" 
               style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
              📊 VIEW ACTIVITY REPORT
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            <strong>Automated notification from ${emailConfig.company} Manual Logs</strong><br>
            Sent from automation system when visit logs are approved by management
          </p>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Create employee confirmation email body - Green theme
 */
function createEmployeeConfirmationEmailBody(entryDetails, emailConfig) {
  const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const visitDateFormatted = formatDate(entryDetails.visitDate);
  const timeRange = `${formatTime(entryDetails.startTime)} - ${formatTime(entryDetails.endTime)}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header - Green Theme -->
        <div style="background: linear-gradient(135deg, #4caf50, #81c784); color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Visit Log Approved ✅</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Your request has been approved by management
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Hi ${entryDetails.employeeName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Great news! Your visit log entry has been approved by ${emailConfig.managerName}:
          </p>
          
          <!-- Entry Details - Green border -->
          <div style="border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 10px 0; background: #f8fff8;">
            <h4 style="margin: 0 0 10px 0; color: #4caf50;">✅ Approved</h4>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${visitDateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeRange}</p>
            <p style="margin: 5px 0;"><strong>Companies:</strong> ${entryDetails.companies}</p>
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${entryDetails.purpose}</p>
            <p style="margin: 5px 0;"><strong>Reimbursement Flag:</strong> ${entryDetails.reimbursement}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>Request ID:</strong> ${entryDetails.requestId}</p>
          </div>
          
          <!-- Next Steps - Green theme -->
          <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
              <li>Your visit log has been recorded in your personal activity report</li>
              <li>HR has been notified for record keeping purposes</li>
              <li>You can view your complete activity report using the link below</li>
            </ul>
          </div>
          
          <!-- View Report Button - Blue -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="${spreadsheetUrl}" 
               style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
              📊 VIEW YOUR ACTIVITY REPORT
            </a>
          </div>
          
          <!-- HR Notification - Blue -->
          <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>HR Notification:</strong> HR has been automatically notified of this approval for record keeping purposes.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            <strong>Automated notification from ${emailConfig.company} Visit Logging System</strong><br>
            This email is sent when your visit log request is approved
          </p>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Create HR notification email body - Green theme (notification only)
 */
function createHRNotificationEmailBody(entryDetails, emailConfig) {
  const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const visitDateFormatted = formatDate(entryDetails.visitDate);
  const timeRange = `${formatTime(entryDetails.startTime)} - ${formatTime(entryDetails.endTime)}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header - Green Theme -->
        <div style="background: linear-gradient(135deg, #4caf50, #81c784); color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">HR Notification - Visit Log Approved</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            ✅ Employee visit request approved by management
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Hi ${emailConfig.hrName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            This is an automated notification that a visit log entry has been approved by management:
          </p>
          
          <!-- Entry Details - Green border -->
          <div style="border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 10px 0; background: #f8fff8;">
            <h4 style="margin: 0 0 10px 0; color: #4caf50;">📋 Approved Visit Log</h4>
            <p style="margin: 5px 0;"><strong>Employee:</strong> ${entryDetails.employeeName}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${visitDateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeRange}</p>
            <p style="margin: 5px 0;"><strong>Companies:</strong> ${entryDetails.companies}</p>
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${entryDetails.purpose}</p>
            <p style="margin: 5px 0;"><strong>Reimbursement Flag:</strong> 
              <span style="color: #4caf50; font-weight: bold;">${entryDetails.reimbursement}</span>
            </p>
            <p style="margin: 5px 0;"><strong>Approved by:</strong> ${emailConfig.managerName}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>Request ID:</strong> ${entryDetails.requestId}</p>
          </div>
          
          <!-- Information Notice - Green -->
          <div style="background: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 6px; padding: 15px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #2e7d32;">ℹ️ For Your Information</h4>
            <p style="margin: 0; color: #333;">
              <strong>No Action Required:</strong> This is a notification only. The visit log has been approved and recorded in the employee's activity report.
            </p>
          </div>
          
          <!-- View Report Button - Blue -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="${spreadsheetUrl}" 
               style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
              📊 VIEW EMPLOYEE ACTIVITY REPORT
            </a>
          </div>
          
          <!-- Employee Notified - Green -->
          <div style="background: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px;">
              <strong>Employee Notified:</strong> ${entryDetails.employeeName} has been automatically notified of the approval.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            <strong>Automated notification from ${emailConfig.company} Visit Logging System</strong><br>
            This email is sent to HR when visit logs are approved by management
          </p>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Helper function to format date
 */
function formatDate(date) {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  } catch (error) {
    return date.toString();
  }
}

/**
 * Helper function to format time
 */
function formatTime(time) {
  try {
    if (typeof time === 'string') {
      return time;
    }
    const d = new Date(time);
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    return time.toString();
  }
}

/**
 * Get web app URL for approval links - Uses config from global_configs.js
 */
function getWebAppUrl() {
  // Try to get web app URL from config sheet first, fallback to default
  const configUrl = getConfigValue('web_app_url');
  const webAppUrl = configUrl || WEB_APP_CONFIG.DEFAULT_URL;
  
  console.log(`Web app URL: ${webAppUrl} (from ${configUrl ? 'config' : 'default'})`);
  return webAppUrl;
}

/**
 * Handle approval action (called from web app or manual trigger)
 */
function handleApprovalAction(requestId) {
  try {
    console.log('=== HANDLING APPROVAL ACTION ===');
    console.log('Request ID:', requestId);
    
    // Update status in Logs sheet
    const updated = updateRequestStatus(requestId, STATUS.APPROVED);
    
    if (!updated) {
      console.error('Failed to update request status');
      return false;
    }
    
    // Get entry details for notifications
    const entryDetails = getEntryDetailsByRequestId(requestId);
    if (!entryDetails) {
      console.error('Entry details not found');
      return false;
    }
    
    // Send combined approval notification (HR + Employee CC)
    sendApprovalNotificationEmail(requestId, entryDetails.employeeEmail, entryDetails.employeeName);
    
    console.log('✅ Approval action completed successfully');
    return true;
    
  } catch (error) {
    console.error('Error handling approval action:', error);
    return false;
  }
}

/**
 * Update request status in Logs sheet and Employee tabs
 */
function updateRequestStatus(requestId, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) return false;
    
    const lastRow = logsSheet.getLastRow();
    if (lastRow <= 1) return false;
    
    // Find and update Logs sheet
    let logsUpdated = false;
    for (let row = 2; row <= lastRow; row++) {
      const cellRequestId = logsSheet.getRange(row, 1).getValue();
      
      if (cellRequestId === requestId) {
        // Update status (column 12) and action date (column 13)
        logsSheet.getRange(row, 12).setValue(newStatus);
        logsSheet.getRange(row, 13).setValue(new Date());
        
        console.log(`Updated Logs sheet ${requestId} to status: ${newStatus}`);
        logsUpdated = true;
        break;
      }
    }
    
    // Update Employee tabs
    const employeeTabsUpdated = updateEmployeeTabsStatus(requestId, newStatus);
    
    console.log(`Status update complete - Logs: ${logsUpdated}, Employee tabs: ${employeeTabsUpdated}`);
    return logsUpdated;
    
  } catch (error) {
    console.error('Error updating request status:', error);
    return false;
  }
}

/**
 * Update status in all employee tabs with matching Request ID
 */
function updateEmployeeTabsStatus(requestId, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const allSheets = sheet.getSheets();
    let updatedCount = 0;
    
    // Search all employee sheets (contain year pattern like "2025", "2026")
    allSheets.forEach(employeeSheet => {
      const sheetName = employeeSheet.getName();
      
      // Skip non-employee sheets
      if (!sheetName.match(/202\d/)) {
        return;
      }
      
      const lastRow = employeeSheet.getLastRow();
      if (lastRow < 10) return; // No data rows
      
      // Search for matching Request ID in employee tab
      for (let row = 10; row <= lastRow; row++) {
        try {
          const cellRequestId = employeeSheet.getRange(row, 1).getValue();
          
          if (cellRequestId === requestId) {
            // Update Status in column D (new template structure)
            employeeSheet.getRange(row, 4).setValue(newStatus);
            console.log(`Updated ${sheetName} row ${row}: ${requestId} → ${newStatus}`);
            updatedCount++;
          }
        } catch (cellError) {
          console.log(`Error reading row ${row} in ${sheetName}:`, cellError);
        }
      }
    });
    
    return updatedCount;
    
  } catch (error) {
    console.error('Error updating employee tabs:', error);
    return 0;
  }
}
