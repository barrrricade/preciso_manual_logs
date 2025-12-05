/**
 * PHASE 4: Web App for Handling Email Approval Buttons
 * 
 * This web app provides an endpoint for manager approval buttons in emails.
 * When a manager clicks "APPROVE REQUEST" in their email, it triggers this web app
 * which then calls the handleApprovalAction() function to process the approval.
 */

/**
 * Handle GET requests to the web app
 * This is called when manager clicks the approval button in email
 */
function doGet(e) {
  try {
    console.log('=== WEB APP GET REQUEST ===');
    console.log('Parameters:', e.parameter);
    
    const action = e.parameter.action;
    const requestId = e.parameter.requestId;
    
    // Validate parameters
    if (!action || !requestId) {
      return createErrorResponse('Missing required parameters');
    }
    
    if (action !== 'approve') {
      return createErrorResponse('Invalid action');
    }
    
    if (!requestId.startsWith('REQ-')) {
      return createErrorResponse('Invalid request ID format');
    }
    
    console.log(`Processing approval: ${requestId}`);
    
    // Call the approval handler
    const success = handleApprovalAction(requestId);
    
    if (success) {
      return createSuccessResponse(requestId);
    } else {
      return createErrorResponse('Failed to process approval');
    }
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return createErrorResponse('Internal server error');
  }
}

/**
 * Handle POST requests (alternative method)
 */
function doPost(e) {
  try {
    console.log('=== WEB APP POST REQUEST ===');
    
    // Parse JSON body if present
    let data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    console.log('POST data:', data);
    
    const action = data.action;
    const requestId = data.requestId;
    
    // Validate parameters
    if (!action || !requestId) {
      return createJsonResponse({ success: false, error: 'Missing required parameters' });
    }
    
    if (action !== 'approve') {
      return createJsonResponse({ success: false, error: 'Invalid action' });
    }
    
    console.log(`Processing POST approval: ${requestId}`);
    
    // Call the approval handler
    const success = handleApprovalAction(requestId);
    
    if (success) {
      return createJsonResponse({ 
        success: true, 
        message: `Request ${requestId} approved successfully`,
        requestId: requestId
      });
    } else {
      return createJsonResponse({ 
        success: false, 
        error: 'Failed to process approval',
        requestId: requestId
      });
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createJsonResponse({ success: false, error: 'Internal server error' });
  }
}

/**
 * Create success HTML response for manager
 */
function createSuccessResponse(requestId) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Approval Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        .success-icon {
          font-size: 64px;
          color: #4caf50;
          margin-bottom: 20px;
        }
        .title {
          color: #4caf50;
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        .message {
          color: #333;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        .request-id {
          background: #e8f5e8;
          border: 1px solid #4caf50;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          font-family: monospace;
          font-size: 14px;
          color: #2e7d32;
        }
        .next-steps {
          background: #f0f8f0;
          border-left: 4px solid #4caf50;
          padding: 20px;
          margin: 25px 0;
          text-align: left;
        }
        .next-steps h3 {
          margin: 0 0 15px 0;
          color: #2e7d32;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
          color: #333;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✅</div>
        <h1 class="title">Approval Successful!</h1>
        
        <p class="message">
          The visit log request has been approved successfully. 
          Employee and HR notifications have been sent automatically.
        </p>
        
        <div class="request-id">
          <strong>Request ID:</strong> ${requestId}
        </div>
        
        <div class="next-steps">
          <h3>What happens next:</h3>
          <ul>
            <li>✅ Request status updated to "Approved"</li>
            <li>📧 HR has been notified for record keeping</li>
            <li>📧 Employee has been notified via CC</li>
            <li>📊 Entry recorded in employee's activity report</li>
          </ul>
        </div>
        
        <p class="footer">
          You can now close this window. Thank you for using Manual Logs.
        </p>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Approval Successful')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create error HTML response
 */
function createErrorResponse(errorMessage) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Approval Error</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        .error-icon {
          font-size: 64px;
          color: #f44336;
          margin-bottom: 20px;
        }
        .title {
          color: #f44336;
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        .message {
          color: #333;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        .error-details {
          background: #ffebee;
          border: 1px solid #f44336;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
          color: #c62828;
        }
        .help-section {
          background: #f5f5f5;
          border-left: 4px solid #666;
          padding: 20px;
          margin: 25px 0;
          text-align: left;
        }
        .help-section h3 {
          margin: 0 0 15px 0;
          color: #333;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">❌</div>
        <h1 class="title">Approval Failed</h1>
        
        <p class="message">
          There was an error processing the approval request. 
          Please try again or contact support if the problem persists.
        </p>
        
        <div class="error-details">
          <strong>Error:</strong> ${errorMessage}
        </div>
        
        <div class="help-section">
          <h3>What you can do:</h3>
          <ul>
            <li>Try clicking the approval button again</li>
            <li>Check if the request is still pending in the spreadsheet</li>
            <li>Update the status manually in the Google Sheets if needed</li>
            <li>Contact IT support if the problem continues</li>
          </ul>
        </div>
        
        <p class="footer">
          Manual Logs System - Error occurred at ${new Date().toLocaleString()}
        </p>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Approval Error')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Create JSON response for API calls
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get the deployed web app URL
 * This function should be updated with the actual deployed URL after deployment
 */
function getWebAppUrl() {
  // TODO: Replace with actual deployed web app URL after deployment
  // Format: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
  
  // Get the script ID automatically
  const scriptId = ScriptApp.getScriptId();
  return `https://script.google.com/macros/s/${scriptId}/exec`;
}

/**
 * Test function to verify web app functionality
 */
function testWebApp() {
  console.log('=== TESTING WEB APP ===');
  
  // Test approval action
  const testRequestId = 'REQ-1234567890-123';
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
