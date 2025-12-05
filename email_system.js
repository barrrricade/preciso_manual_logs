/**
 * Email System for Visit Log Approvals - Button-Based System
 */

/**
 * Get all pending entries from Logs sheet
 */
function getPendingEntries() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = sheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logsSheet) {
      console.log('Logs sheet not found');
      return [];
    }
    
    const lastRow = logsSheet.getLastRow();
    if (lastRow <= 1) {
      console.log('No data in Logs sheet');
      return [];
    }
    
    // Get all data from Logs sheet
    const data = logsSheet.getRange(2, 1, lastRow - 1, 14).getValues(); // Skip header row
    const pendingEntries = [];
    
    data.forEach((row, index) => {
      const status = row[11]; // Status column (L)
      
      if (status === STATUS.PENDING) {
        pendingEntries.push({
          requestId: row[0],      // Request_ID
          timestamp: row[1],      // Timestamp
          email: row[2],          // Employee_Email
          employeeName: row[3],   // Employee_Name
          visitDate: row[4],      // Visit_Date
          startTime: row[5],      // Start_Time
          endTime: row[6],        // End_Time
          purpose: row[7],        // Purpose
          reimbursement: row[8],  // Reimbursement
          description: row[9],    // Description
          companies: row[10],     // Companies
          rowNumber: index + 2    // For reference (1-based + header)
        });
      }
    });
    
    console.log(`Found ${pendingEntries.length} pending entries`);
    return pendingEntries;
    
  } catch (error) {
    console.error('Error getting pending entries:', error);
    return [];
  }
}

/**
 * Create HTML email body for batch approval
 */
function createBatchEmailBody(pendingEntries, emailConfig) {
  const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  
  let entriesHtml = '';
  
  pendingEntries.forEach(entry => {
    const visitDateFormatted = formatDate(entry.visitDate);
    const timeRange = `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`;
    
    entriesHtml += `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; background: #fafafa;">
        <h3 style="margin: 0 0 10px 0; color: #2c5aa0; font-size: 18px;">
          ${entry.employeeName} (${visitDateFormatted}, ${timeRange})
        </h3>
        <p style="margin: 5px 0; color: #333;">
          <strong>Companies:</strong> ${entry.companies}
        </p>
        <p style="margin: 5px 0; color: #333;">
          <strong>Purpose:</strong> ${entry.purpose}
        </p>
        <p style="margin: 5px 0; color: #333;">
          <strong>Reimbursement:</strong> 
          <span style="color: ${entry.reimbursement === 'Yes' ? '#d32f2f' : '#388e3c'}; font-weight: bold;">
            ${entry.reimbursement}
          </span>
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          <strong>Request ID:</strong> ${entry.requestId}
        </p>
      </div>
    `;
  });
  
  // Action Required section
  const actionSection = `
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">Action Required</h3>
      <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
        <p style="margin: 0; color: #333; font-weight: bold;">
          ${emailConfig.managerName || 'Manager'}: Please review and update approvals in the spreadsheet
        </p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          Change status from "Pending" to "Approved" or "Rejected" as needed
        </p>
      </div>
      ${emailConfig.ccHr ? `
      <div style="background: #e8f5e8; padding: 15px; border-radius: 5px;">
        <p style="margin: 0; color: #333; font-weight: bold;">
          ${emailConfig.hrName || 'HR'}: No action needed - for your information only
        </p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          You will be notified when approvals are processed
        </p>
      </div>
      ` : ''}
    </div>
  `;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Visit Approvals Required</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            ${pendingEntries.length} entries awaiting approval
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Hi ${emailConfig.managerName || 'Manager'},
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            You have <strong>${pendingEntries.length}</strong> visit log entries pending approval:
          </p>
          
          ${entriesHtml}
          
          ${actionSection}
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${spreadsheetUrl}" 
               style="display: inline-block; background-color: #1976d2; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              REVIEW & APPROVE IN GOOGLE SHEETS
            </a>
          </div>
          
          <!-- Instructions -->
          <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1976d2;">Instructions:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
              <li>Open the <strong>Logs</strong> sheet or employee tabs</li>
              <li>Change Status from <strong>"Pending"</strong> to <strong>"Approved"</strong> or <strong>"Rejected"</strong></li>
              <li>Click "Send Confirmation Emails" button when ready to notify employees</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            <strong>Automated notification from ${emailConfig.company || 'Company'} Visit Logging System</strong><br>
            This email is sent when there are pending approvals
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
    return d.toLocaleDateString('en-US', { 
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
 * Send daily batch email with all pending entries
 */
function sendDailyBatchEmail() {
  try {
    console.log('=== DAILY BATCH EMAIL CHECK ===');
    
    // Check if emails are enabled
    if (!isEmailEnabled()) {
      console.log('Emails disabled in debug mode - skipping batch email');
      return;
    }
    
    // Get pending entries
    const pendingEntries = getPendingEntries();
    
    if (pendingEntries.length === 0) {
      console.log('No pending entries found - no email needed');
      return;
    }
    
    console.log(`Found ${pendingEntries.length} pending entries`);
    
    // Get email configuration
    const emailConfig = getEmailAddresses();
    
    if (!emailConfig.manager) {
      console.error('Manager email not configured - cannot send batch email');
      return;
    }
    
    // Create and send email
    const subject = `[MANAGER ACTION] Daily Visit Approvals Required - ${pendingEntries.length} entries pending`;
    const emailBody = createBatchEmailBody(pendingEntries, emailConfig);
    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Visit Logging System`
    };
    
    GmailApp.sendEmail(emailConfig.manager, subject, '', emailOptions);
    console.log(`✅ Daily batch email sent to: ${emailConfig.manager}`);
    
    // Send copy to HR if configured
    if (emailConfig.ccHr && emailConfig.hr && emailConfig.hr.trim() !== '') {
      const hrSubject = `[HR NOTIFICATION] Daily Visit Approvals Required - ${pendingEntries.length} entries pending`;
      GmailApp.sendEmail(emailConfig.hr, hrSubject, '', emailOptions);
      console.log(`✅ CC sent to HR: ${emailConfig.hr}`);
    }
    
    console.log('=== DAILY BATCH EMAIL COMPLETE ===');
    
  } catch (error) {
    console.error('Error sending daily batch email:', error);
  }
}

/**
 * Manual email button function
 */
function sendEmailButton() {
  console.log('=== MANUAL EMAIL BUTTON CLICKED ===');
  
  try {
    // Check if emails are enabled
    if (!isEmailEnabled()) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('Emails Disabled', 'Email sending is disabled in debug mode (Config B9 = FALSE)', ui.ButtonSet.OK);
      return;
    }
    
    // Check timeout
    if (!canSendEmail()) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('Please Wait', 'Email was sent recently. Please wait 1 minute before sending again.', ui.ButtonSet.OK);
      return;
    }
    
    // Get pending entries
    const pendingEntries = getPendingEntries();
    
    if (pendingEntries.length === 0) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('No Pending Entries', 'There are no pending visit log entries to approve.', ui.ButtonSet.OK);
      return;
    }
    
    // Get email configuration
    const emailConfig = getEmailAddresses();
    
    if (!emailConfig.manager) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('Configuration Error', 'Manager email not configured. Please check Config sheet.', ui.ButtonSet.OK);
      return;
    }
    
    // Send email
    const subject = `[MANAGER ACTION] Visit Approvals Required - ${pendingEntries.length} entries pending`;
    const emailBody = createBatchEmailBody(pendingEntries, emailConfig);
    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Visit Logging System`
    };
    
    // Add CC if enabled and HR email exists
    if (emailConfig.ccHr && emailConfig.hr && emailConfig.hr.trim() !== '') {
      emailOptions.cc = emailConfig.hr;
      console.log(`CC enabled - adding HR: ${emailConfig.hr}`);
    }
    
    GmailApp.sendEmail(emailConfig.manager, subject, '', emailOptions);
    
    // Record email sent time
    recordEmailSent();
    
    // Show success message
    const ui = SpreadsheetApp.getUi();
    const ccMessage = emailConfig.ccHr ? `\nCC: ${emailConfig.hr}` : '';
    ui.alert('Email Sent!', `Approval email sent successfully.\n\nEntries: ${pendingEntries.length}\nTo: ${emailConfig.manager}${ccMessage}`, ui.ButtonSet.OK);
    
    console.log(`✅ Email sent - Manager: ${emailConfig.manager}, CC HR: ${emailConfig.ccHr}`);
    
  } catch (error) {
    console.error('Error sending manual email:', error);
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('Email Error', 'Failed to send email. Check the logs for details.', ui.ButtonSet.OK);
  }
  
  console.log('=== MANUAL EMAIL BUTTON COMPLETE ===');
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
    
    // Group by employee
    const confirmationsByEmployee = groupConfirmationsByEmployee(pendingConfirmations);
    
    let emailsSent = 0;
    
    // Send confirmation email to each employee
    Object.keys(confirmationsByEmployee).forEach(employeeEmail => {
      sendEmployeeConfirmation(employeeEmail, confirmationsByEmployee[employeeEmail]);
      emailsSent++;
    });
    
    // Send summary to HR
    const emailConfig = getEmailAddresses();
    if (emailConfig.ccHr && emailConfig.hr) {
      sendHRConfirmationSummary(pendingConfirmations);
      emailsSent++;
    }
    
    // Mark entries as notified
    markEntriesAsNotified(pendingConfirmations);
    
    // Show success message
    const ui = SpreadsheetApp.getUi();
    const employeeCount = Object.keys(confirmationsByEmployee).length;
    const hrMessage = (emailConfig.ccHr && emailConfig.hr) ? '\nHR summary sent' : '';
    
    ui.alert(
      'Confirmation Emails Sent!', 
      `Successfully sent confirmation emails:\n\n` +
      `• ${employeeCount} employees notified\n` +
      `• ${pendingConfirmations.length} entries confirmed${hrMessage}`, 
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
 * Group confirmations by employee email
 */
function groupConfirmationsByEmployee(confirmations) {
  const grouped = {};
  
  confirmations.forEach(confirmation => {
    if (!grouped[confirmation.employeeEmail]) {
      grouped[confirmation.employeeEmail] = [];
    }
    grouped[confirmation.employeeEmail].push(confirmation);
  });
  
  return grouped;
}

/**
 * Send confirmation email to employee
 */
function sendEmployeeConfirmation(employeeEmail, confirmations) {
  try {
    const emailConfig = getEmailAddresses();
    const employeeName = confirmations[0].employeeName;
    
    const approvedCount = confirmations.filter(c => c.status === 'Approved').length;
    const rejectedCount = confirmations.filter(c => c.status === 'Rejected').length;
    
    const subject = `[VISIT LOG] Status Update - ${approvedCount} Approved, ${rejectedCount} Rejected`;
    const emailBody = createEmployeeConfirmationEmailBody(employeeName, confirmations, emailConfig);
    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Visit Logging System`
    };
    
    GmailApp.sendEmail(employeeEmail, subject, '', emailOptions);
    console.log(`✅ Confirmation sent to: ${employeeEmail} (${confirmations.length} entries)`);
    
  } catch (error) {
    console.error('Error sending employee confirmation:', error);
  }
}

/**
 * Send HR confirmation summary
 */
function sendHRConfirmationSummary(allConfirmations) {
  try {
    const emailConfig = getEmailAddresses();
    
    const approvedCount = allConfirmations.filter(c => c.status === 'Approved').length;
    const rejectedCount = allConfirmations.filter(c => c.status === 'Rejected').length;
    
    const subject = `[HR NOTIFICATION] Visit Log Summary - ${approvedCount} Approved, ${rejectedCount} Rejected`;
    const emailBody = createHRConfirmationEmailBody(allConfirmations, emailConfig);
    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Visit Logging System`
    };
    
    GmailApp.sendEmail(emailConfig.hr, subject, '', emailOptions);
    console.log(`✅ HR summary sent to: ${emailConfig.hr} (${allConfirmations.length} entries)`);
    
  } catch (error) {
    console.error('Error sending HR summary:', error);
  }
}

/**
 * Create employee confirmation email body
 */
function createEmployeeConfirmationEmailBody(employeeName, confirmations, emailConfig) {
  let entriesHtml = '';
  
  confirmations.forEach(confirmation => {
    const isApproved = confirmation.status === 'Approved';
    const statusColor = isApproved ? '#4caf50' : '#f44336';
    const statusIcon = isApproved ? '✅' : '❌';
    const visitDateFormatted = formatDate(confirmation.visitDate);
    const timeRange = `${formatTime(confirmation.startTime)} - ${formatTime(confirmation.endTime)}`;
    
    entriesHtml += `
      <div style="border: 1px solid ${statusColor}; border-radius: 8px; padding: 15px; margin: 10px 0; background: #fafafa;">
        <h4 style="margin: 0 0 10px 0; color: ${statusColor};">${statusIcon} ${confirmation.status}</h4>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${visitDateFormatted}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${timeRange}</p>
        <p style="margin: 5px 0;"><strong>Companies:</strong> ${confirmation.companies}</p>
        <p style="margin: 5px 0;"><strong>Purpose:</strong> ${confirmation.purpose}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>Request ID:</strong> ${confirmation.requestId}</p>
      </div>
    `;
  });
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Visit Log Status Update</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            ${confirmations.length} entries processed
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Hi ${employeeName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your visit log entries have been reviewed:
          </p>
          
          ${entriesHtml}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            <strong>Automated notification from ${emailConfig.company} Visit Logging System</strong>
          </p>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Create HR confirmation email body
 */
function createHRConfirmationEmailBody(allConfirmations, emailConfig) {
  const approvedCount = allConfirmations.filter(c => c.status === 'Approved').length;
  const rejectedCount = allConfirmations.filter(c => c.status === 'Rejected').length;
  
  // Group by employee
  const byEmployee = groupConfirmationsByEmployee(allConfirmations);
  
  let summaryHtml = '';
  Object.keys(byEmployee).forEach(employeeEmail => {
    const employeeConfirmations = byEmployee[employeeEmail];
    const employeeName = employeeConfirmations[0].employeeName;
    const empApproved = employeeConfirmations.filter(c => c.status === 'Approved').length;
    const empRejected = employeeConfirmations.filter(c => c.status === 'Rejected').length;
    
    summaryHtml += `
      <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; margin: 5px 0;">
        <strong>${employeeName}</strong>: ${empApproved} approved, ${empRejected} rejected
      </div>
    `;
  });
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4caf50, #81c784); color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Visit Log Processing Summary</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            ${approvedCount} approved, ${rejectedCount} rejected
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Hi ${emailConfig.hrName || 'HR Team'},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Visit log entries have been processed and employees have been notified:
          </p>
          
          ${summaryHtml}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            <strong>Automated notification from ${emailConfig.company} Visit Logging System</strong>
          </p>
        </div>
        
      </div>
    </div>
  `;
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
 * Set up daily email trigger for manager batch emails only
 */
function setupDailyManagerEmailTrigger() {
  try {
    console.log('=== SETTING UP DAILY MANAGER EMAIL TRIGGER ===');
    
    // Delete existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'sendDailyBatchEmail' || 
          trigger.getHandlerFunction() === 'sendDailyConfirmationEmails') {
        ScriptApp.deleteTrigger(trigger);
        console.log(`Deleted existing trigger: ${trigger.getHandlerFunction()}`);
      }
    });
    
    // Get configured email time
    const militaryTime = getEmailTime();
    const { hour, minute } = parseMilitaryTime(militaryTime);
    
    // Create ONLY manager batch email trigger
    ScriptApp.newTrigger('sendDailyBatchEmail')
      .timeBased()
      .everyDays(1)
      .atHour(hour)
      .nearMinute(minute)
      .create();
    
    console.log(`✅ Manager batch email trigger: ${hour}:${minute.toString().padStart(2, '0')}`);
    console.log('=== TRIGGER SETUP COMPLETE ===');
    
  } catch (error) {
    console.error('Error setting up daily trigger:', error);
  }
}

// Add these functions to your email_system.gs file:

function createEmployeeBatchEmailBody(entries, companyName) {
  console.log('Debug', `Creating employee batch email body for ${entries.length} entries`);
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">Visit Status Updates</h2>
        <p style="color: #666; margin: 10px 0 0 0;">Dear Team Member,</p>
      </div>
      
      <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <p>The following visit requests have been processed:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f1f3f4;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Date</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Employee</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Purpose</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>`;

  entries.forEach(entry => {
    const statusColor = entry.status === 'Approved' ? '#28a745' : '#dc3545';
    const statusIcon = entry.status === 'Approved' ? '✅' : '❌';
    
    html += `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;">${entry.visitDate}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${entry.employeeName}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${entry.purpose}</td>
              <td style="padding: 12px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">
                ${statusIcon} ${entry.status}
              </td>
            </tr>`;
  });

  html += `
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            This is an automated notification from the ${companyName} Employee Visit System.
          </p>
          <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">
            If you have any questions, please contact your manager or HR department.
          </p>
        </div>
      </div>
    </div>`;

  return html;
}

function createHRBatchEmailBody(entries, companyName) {
  console.log('Debug', `Creating HR batch email body for ${entries.length} entries`);
  
  const approvedCount = entries.filter(e => e.status === 'Approved').length;
  const rejectedCount = entries.filter(e => e.status === 'Rejected').length;
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">HR Summary: Visit Status Updates</h2>
        <p style="color: #666; margin: 10px 0 0 0;">Batch confirmation summary</p>
      </div>
      
      <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1976d2;">Summary</h3>
          <p style="margin: 5px 0;"><strong>Total Processed:</strong> ${entries.length}</p>
          <p style="margin: 5px 0; color: #28a745;"><strong>Approved:</strong> ${approvedCount}</p>
          <p style="margin: 5px 0; color: #dc3545;"><strong>Rejected:</strong> ${rejectedCount}</p>
        </div>
        
        <h3 style="color: #333; margin-bottom: 15px;">Detailed Breakdown</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f1f3f4;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Request ID</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Date</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Employee</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Purpose</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>`;

  entries.forEach(entry => {
    const statusColor = entry.status === 'Approved' ? '#28a745' : '#dc3545';
    const statusIcon = entry.status === 'Approved' ? '✅' : '❌';
    
    html += `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;">${entry.requestId}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${entry.visitDate}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${entry.employeeName}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${entry.purpose}</td>
              <td style="padding: 12px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">
                ${statusIcon} ${entry.status}
              </td>
            </tr>`;
  });

  html += `
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            This is an automated HR summary from the ${companyName} Employee Visit System.
          </p>
          <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">
            All affected employees have been notified of their request status.
          </p>
        </div>
      </div>
    </div>`;

  return html;
}

/**
 * Group decisions by employee email (MISSING FUNCTION)
 */
function groupDecisionsByEmployee(decisions) {
  const grouped = {};
  
  decisions.forEach(decision => {
    if (!grouped[decision.employeeEmail]) {
      grouped[decision.employeeEmail] = [];
    }
    grouped[decision.employeeEmail].push(decision);
  });
  
  return grouped;
}

/**
 * Send batch confirmation email to employee
 */
function sendEmployeeBatchConfirmation(employeeEmail, decisions) {
  try {
    const emailConfig = getEmailAddresses();
    const employeeName = decisions[0].employeeName;
    
    const approvedCount = decisions.filter(d => d.status === 'Approved').length;
    const rejectedCount = decisions.filter(d => d.status === 'Rejected').length;
    
    const subject = `[VISIT LOG] Daily Status Update - ${approvedCount} Approved, ${rejectedCount} Rejected`;
    const emailBody = createEmployeeBatchEmailBody(decisions, emailConfig.company);

    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Visit Logging System`
    };
    
    GmailApp.sendEmail(employeeEmail, subject, '', emailOptions);
    console.log(`✅ Batch confirmation sent to: ${employeeEmail} (${decisions.length} entries)`);
    
  } catch (error) {
    console.error('Error sending employee batch confirmation:', error);
  }
}

/**
 * Send batch summary to HR
 */
function sendHRBatchSummary(allDecisions) {
  try {
    const emailConfig = getEmailAddresses();
    
    if (!emailConfig.ccHr || !emailConfig.hr) {
      console.log('HR batch summary skipped - not configured');
      return;
    }
    
    const approvedCount = allDecisions.filter(d => d.status === 'Approved').length;
    const rejectedCount = allDecisions.filter(d => d.status === 'Rejected').length;
    
    const subject = `[HR NOTIFICATION] Daily Visit Log Summary - ${approvedCount} Approved, ${rejectedCount} Rejected`;
    const emailBody = createHRBatchEmailBody(allDecisions, emailConfig);
    
    const emailOptions = {
      htmlBody: emailBody,
      name: `${emailConfig.company} Visit Logging System`
    };
    
    GmailApp.sendEmail(emailConfig.hr, subject, '', emailOptions);
    console.log(`✅ HR batch summary sent to: ${emailConfig.hr} (${allDecisions.length} entries)`);
    
  } catch (error) {
    console.error('Error sending HR batch summary:', error);
  }
}