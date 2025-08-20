function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('1W059r6QUWecU8WY5OdLLybCMkPOPr_K5IXXEETUbrn4').getSheetByName('Responses');
    var data = e.parameter;

    // फॉर्म डेटा मॅपिंग
    var row = [
      new Date(), // Timestamp
      data.name || '', // Name
      data.address || '', // Address
      data.location || '', // Location
      data.mobile || '', // Mobile
      data.reference || '', // Reference
      parseFloat(data.waste) || 0, // Waste
      data.date || '', // Date
      data.timeslotLabel || '', // Time Slot
      parseFloat(data.funds) || 0, // funds (डीफॉल्ट 0)
      data.email || 'N/A', // Email (पर्यायी)
      data.village || '' // village (नवीन कॉलम)
    ];

    // Responses टॅबमध्ये डेटा जोडा
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(error);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
