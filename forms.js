/**
 * Update the employee dropdown in Google Form from Config sheet
 */
function updateEmployeeDropdown() {
  try {
    // Use form ID from global config
    const form = FormApp.openById(FORM_ID);
    
    // Get the Config sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found');
      return;
    }
    
    // Read employee names from Config Column F (starting from row 8)
    const startRow = CONFIG_LAYOUT.EMPLOYEES.START_ROW;
    const endRow = CONFIG_LAYOUT.EMPLOYEES.END_ROW;
    const nameCol = CONFIG_LAYOUT.EMPLOYEES.NAME_COL;
    
    console.log(`Reading employee names from column ${nameCol}, rows ${startRow}-${endRow}`);
    
    const employeeRange = configSheet.getRange(startRow, nameCol, endRow - startRow + 1, 1);
    const employeeData = employeeRange.getValues();
    
    // Extract non-empty employee names
    const employeeNames = [];
    employeeData.forEach((row, index) => {
      if (row[0] && row[0] !== '' && row[0] !== null) {
        console.log(`Found employee at row ${startRow + index}: ${row[0]}`);
        employeeNames.push(row[0]);
      }
    });
    
    console.log('Total employees found:', employeeNames);
    
    // Find the employee dropdown question in your form
    const items = form.getItems();
    let employeeDropdown = null;
    
    // Look for the dropdown by title
    items.forEach(item => {
      console.log(`Checking form item: "${item.getTitle()}" (Type: ${item.getType()})`);
      if (item.getTitle().includes('Employee') || item.getTitle().includes('Name')) {
        if (item.getType() === FormApp.ItemType.LIST) {
          employeeDropdown = item.asListItem();
          console.log('Found employee dropdown:', item.getTitle());
        }
      }
    });
    
    if (employeeDropdown) {
      // Update the dropdown choices
      employeeDropdown.setChoiceValues(employeeNames);
      console.log('Employee dropdown updated with', employeeNames.length, 'employees:', employeeNames);
    } else {
      console.log('Employee dropdown not found in form');
      console.log('Available form items:');
      items.forEach(item => {
        console.log(`- "${item.getTitle()}" (${item.getType()})`);
      });
    }
    
  } catch (error) {
    console.error('Error updating employee dropdown:', error);
  }
}

/**
 * Get employee names from Config sheet (dynamic detection)
 */
function getEmployeeNamesFromConfig() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = sheet.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!configSheet) {
      console.log('Config sheet not found');
      return [];
    }
    
    // Get all data in column F
    const columnFData = configSheet.getRange('F1:F50').getValues();
    const employeeNames = [];
    
    // Skip the header row and collect non-empty names
    for (let i = 1; i < columnFData.length; i++) { // Start from index 1 (row 2)
      const name = columnFData[i][0];
      if (name && name !== '' && name !== null) {
        console.log(`Found employee at row ${i + 1}: "${name}"`);
        employeeNames.push(name);
      }
    }
    
    console.log('Total employees found:', employeeNames);
    return employeeNames;
    
  } catch (error) {
    console.error('Error getting employee names:', error);
    return [];
  }
}

/**
 * Update the employee dropdown in Google Form from Config sheet
 */
function updateEmployeeDropdown() {
  try {
    // Use form ID from global config
    const form = FormApp.openById(FORM_ID);
    
    // Get employee names
    const employeeNames = getEmployeeNamesFromConfig();
    
    if (employeeNames.length === 0) {
      console.log('No employee names found in Config sheet');
      return;
    }
    
    // Find the employee dropdown question in your form
    const items = form.getItems();
    let employeeDropdown = null;
    
    // Look for the dropdown by title
    items.forEach(item => {
      console.log(`Checking form item: "${item.getTitle()}" (Type: ${item.getType()})`);
      if (item.getTitle().toLowerCase().includes('employee') || 
          item.getTitle().toLowerCase().includes('name')) {
        if (item.getType() === FormApp.ItemType.LIST) {
          employeeDropdown = item.asListItem();
          console.log('Found employee dropdown:', item.getTitle());
        }
      }
    });
    
    if (employeeDropdown) {
      // Update the dropdown choices
      employeeDropdown.setChoiceValues(employeeNames);
      console.log('✅ Employee dropdown updated with', employeeNames.length, 'employees:', employeeNames);
    } else {
      console.log('❌ Employee dropdown not found in form');
      console.log('Available form items:');
      items.forEach(item => {
        console.log(`- "${item.getTitle()}" (${item.getType()})`);
      });
    }
    
  } catch (error) {
    console.error('Error updating employee dropdown:', error);
  }
}

/**
 * Button function to update form dropdown
 * This will be called by the button in the sheet
 */
function updateFormDropdownButton() {
  console.log('=== MANUAL FORM UPDATE TRIGGERED ===');
  
  try {
    updateEmployeeDropdown();
    
    // Show success message to user
    const ui = SpreadsheetApp.getUi();
    ui.alert('Success!', 'Employee dropdown updated successfully in Google Form.', ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('Error in button update:', error);
    
    // Show error message to user
    const ui = SpreadsheetApp.getUi();
    ui.alert('Error!', 'Failed to update form dropdown. Check the logs for details.', ui.ButtonSet.OK);
  }
  
  console.log('=== MANUAL UPDATE COMPLETE ===');
}