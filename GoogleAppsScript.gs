/**
 * Google Apps Script for collecting evaluation responses
 * 
 * To use this:
 * 1. Create a new Google Apps Script project at script.google.com
 * 2. Copy this entire code into the script editor
 * 3. Deploy as web app (Deploy > New deployment > Web app)
 * 4. Set "Execute as" to your account
 * 5. Set "Who has access" to "Anyone"
 * 6. Copy the deployment URL and paste into config.js as FORM_URL
 * 
 * This will automatically create a Google Sheet with tabs for each image
 */

// The ID of your Google Sheet (create a blank sheet first)
const SHEET_ID = 'YOUR_SHEET_ID_HERE';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Get or create sheet
    const sheet = getOrCreateSheet(payload.species);
    
    // Prepare response row
    const timestamp = new Date().toISOString();
    const row = [timestamp, payload.imageId];
    
    // Add descriptor answers
    payload.answers.forEach(answer => {
      row.push(answer);
    });
    
    // Append to sheet
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(
      JSON.stringify({success: true, message: 'Response recorded'})
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({success: false, error: error.toString()})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(speciesName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Try to get existing sheet
  let sheet = ss.getSheetByName(speciesName);
  
  if (!sheet) {
    // Create new sheet
    sheet = ss.insertSheet(speciesName);
    
    // Add headers: Timestamp, ImageID, then descriptor names
    // (You may need to customize this based on your descriptors)
    const headers = ['Timestamp', 'ImageID', 'Descriptor1', 'Descriptor2', 'Descriptor3'];
    sheet.appendRow(headers);
  }
  
  return sheet;
}

// Helper: Get deployment URL after deploying
function getDeploymentUrl() {
  return ScriptApp.getService().getUrl();
}
