# Email Template Previews - Manual Log Tracking System

This folder contains HTML previews of the email templates used in the Phase 2 approve-only email system.

## Color Scheme
- 🟡 **Yellow**: Pending/Manager approval emails
- 🟢 **Green**: Approved emails (employee & HR)
- 🔵 **Blue**: Information/notices
- 🔴 **Red**: Rejected (handled manually, no email templates)

## Email Templates

### 1. Manager Approval Email (`manager_approval_email.html`)
- **Theme**: 🟡 Yellow (Pending)
- **Recipient**: Manager ([MANAGER_NAME])
- **Trigger**: Immediate - when valid employee submits form
- **Features**:
  - Single **APPROVE** button (🟢 green button)
  - Complete visit details
  - Reimbursement flag (for manager visibility only)
  - Link to Google Sheets for manual handling
  - Yellow header indicating pending status

### 2. Employee Confirmation Email (`employee_confirmation_email.html`)
- **Theme**: 🟢 Green (Approved)
- **Recipient**: Employee who submitted the request
- **Trigger**: When manager approves the request
- **Features**:
  - Green approval confirmation theme
  - Visit details summary
  - Link to view activity report (🔵 blue button)
  - Next steps information

### 3. HR Notification Email (`hr_notification_email.html`)
- **Theme**: 🟢 Green (Approved)
- **Recipient**: HR ([HR_NAME]) - only if `cc_hr = TRUE` in config
- **Trigger**: When manager approves the request
- **Features**:
  - Green theme for approved status
  - **No actions required** - notification only
  - Employee visit summary
  - Reimbursement flag display (information only)
  - Link to view activity report (🔵 blue button)

## Key Features of Phase 2 Email System

### Debug Mode Support
- All emails respect `debug_mode` config setting
- When `debug_mode = TRUE`, no emails are sent (saves quota)
- When `debug_mode = FALSE`, emails are sent immediately

### Simplified Workflow
1. **Form Submission** → **Manager Email** (🟡 yellow, immediate)
2. **Manager Clicks APPROVE** → **Employee + HR Emails** (🟢 green)
3. **Manual Rejection** → Manager updates sheets directly (no email)

### Important Notes
- **Reimbursement**: Just a flag for manager visibility, not a request system
- **HR Role**: Notification only, no actions required
- **Rejections**: Handled manually in sheets, no email templates
- **Colors**: Consistent theme - yellow for pending, green for approved

### Removed Features (from Phase 1)
- ❌ Email timing/scheduling
- ❌ Reject buttons in emails
- ❌ Complex approval workflows
- ❌ Email timeout protection
- ❌ Reimbursement processing workflows

### Design Principles
- **Mobile-friendly** responsive design
- **Professional** company branding
- **Clear color coding** for status indication
- **Minimal complexity** - approve-only focus
- **Information only** for HR (no actions)

## Technical Implementation

### Email Functions
- `sendManagerApprovalEmail()` - Immediate on form submission (🟡 yellow)
- `sendEmployeeConfirmationEmail()` - On approval (🟢 green)
- `sendHRNotificationEmail()` - On approval, notification only (🟢 green)

### Configuration Dependencies
- `debug_mode` - Controls email sending
- `manager_email` - Required for approval emails
- `hr_email` + `cc_hr` - Optional HR notifications
- `company_name` - Email branding

## Testing
To test the email templates:
1. Open HTML files in browser
2. Check color scheme consistency
3. Verify responsive design on mobile
4. Test with different data scenarios (reimbursement yes/no, etc.)
5. Ensure HR emails show "no action required" messaging
