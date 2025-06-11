function generateSingleIndentPDF() {
  const sheetName = "PDF";
  const templateDocId = "1Ne7JoH0Dl1GEkyaLezBTI_TLXvG5z3bnZYwrBexi5cw"; // Your Google Docs template ID
  const targetFolderId = "1IUlGqtBZ6AsC3O_Xm5WqVbbOwi4Sa-sF"; // Your folder ID

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var indentNo = sheet.getRange("G4").getValue();
  var headers = sheet.getRange("A7:49").getValues()[0];
  // Get all data rows starting from A8
  var allData = sheet.getRange(8, 1, sheet.getLastRow() - 7, headers.length).getValues();

  // Prepare objects for each type
  var data = null, dataS = null, dataB = null, dataR = null, dataC = null;

  // Classify each row
  for (var i = 0; i < allData.length; i++) {
    var row = allData[i];
    var product = (row[headers.indexOf('Product')] || '').toString().toUpperCase();
    if (!data && (product.includes('UPS') || product.includes('INVERTER') || product.includes('SERVO'))) {
      data = row;
    } else if (!dataS && (product.includes('UPS') || product.includes('INVERTER') || product.includes('SERVO'))) {
      dataS = row;
    } else if (!dataB && product.includes('BATTERY')) {
      dataB = row;
    } else if (!dataR && product.includes('RACK')) {
      dataR = row;
    } else if (!dataC && product.includes('CABLE')) {
      dataC = row;
    }
  }

  // Now you can use data, dataS, dataB, dataR, dataC for your placeholderMap logic
  // Example: use data for main, dataS for secondary, etc.

  // Make a copy of the template doc
  var templateFile = DriveApp.getFileById(templateDocId);
  var copyFile = templateFile.makeCopy("Indent-" + indentNo);
  var copyDocId = copyFile.getId();
  var doc = DocumentApp.openById(copyDocId);
  var body = doc.getBody();

  // Replace placeholders with actual values
  for (var i = 0; i < headers.length; i++) {
    var placeholder = `{{${headers[i]}}}`;
    var value = data[i] ? data[i] : "";
    body.replaceText(placeholder, value);
  }
  body.replaceText("{{INDENT_NO}}", indentNo);

  function getFeatures(featuresStr, feature) {
    if (!featuresStr) return "X";
    var features = featuresStr.toString().toUpperCase().split(/,|\s+/);
    return features.includes(feature) ? "Y" : "X";
  }

  // Map placeholders to their corresponding columns in the PDF sheet (A8 = 0, B8 = 1, ...)
  var featureStr = data[13]; // Column N (0-based index)
  var placeholderMap = {
    "{{INDENT}}": data[1],
    "{{DATE}}": Utilities.formatDate(new Date(data[0]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "{{PLANT}}": data[35],
    "{{GROUP}}": data[2],
    "{{BRANCH}}": data[3],
    "{{OWNER}}": data[4],
    "{{REVBY}}": data[31],
    "{{REVDATE}}": Utilities.formatDate(new Date(data[32]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "{{OANUM}}": data[34],
    "{{APVBY}}": data[42],
    "{{APVDATE}}": Utilities.formatDate(new Date(data[44]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "{{PRODUCT}}": data[7],
    "{{RAT}}": data[8],
    "{{A}}": data[14],
    "{{VOLT}}": data[12],
    "{{PF}}": data[11],
    "{{QTY}}": data[10],
    "{{PHASE}}": data[9],
    "{{v1}}": getFeatures(featureStr, "HSB"),        
    "{{v2}}": getFeatures(featureStr, "PRS"), 
    "{{v3}}": getFeatures(featureStr, "LCD"), 
    "{{v4}}": getFeatures(featureStr, "SW"), 
    "{{v5}}": getFeatures(featureStr, "SBS"), 
    "{{v6}}": getFeatures(featureStr, "SNMP"), 
    "{{v7}}": getFeatures(featureStr, "MB"), 
    "{{v8}}": getFeatures(featureStr, "CBB"), 
    "{{v9}}": data[47],        // Z8
    "{{WARR}}": data[17],
    "{{v10}}": data[47],    // AB8
    "{{TYPE}}": dataB !== null && dataB[16],
    "{{MAKE}}": dataB !== null && dataB[15],
    "{{CAP}}": dataB !== null && dataB[8],
    "{{BQTY}}": dataB !== null && dataB[10],
    "{{BWARR}}": dataB !== null && dataB[17],
    "{{v11}}": dataR !== null && dataR[7] ? "Y" : "X",
    "{{v12}}": data[47],    // AJ8
    "{{DRDATE}}": data[47],     // AK8
    "{{CPERSON}}": data[19],
    "{{CNUM}}": data[47],       // AM8
    "{{SHADDRESS}}": data[21],
    "{{GSTIN}}": data[20],
    "{{PO}}": data[18],
    "{{DECINV}}": data[23],
    "{{BILLADDRESS}}": data[22],
    "{{OV}}": data[47],         // AS8
    "{{OTAX}}": data[47],       // AT8
    "{{TQTY}}": data[47],       // AW8
    "{{TTAX}}": data[47],        // AX8
    "{{TP}}": data[47],         // AY8
    "{{TOV}}": data[47],        // AZ8
    "{{TOTP}}": data[47],       // BA8
    "{{CON}}": data[47],        // BB8
    "{{REMARKS}}": data[47],    // BC8
    "{{DATETIME}}": Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm")
  };

  // Replace all placeholders in the template (body)
  for (var key in placeholderMap) {
    body.replaceText(key, placeholderMap[key] !== undefined ? placeholderMap[key] : "");
  }

  // Replace placeholders in the footer (if present)
  var footer = doc.getFooter();
  if (footer) {
    for (var key in placeholderMap) {
      footer.replaceText(key, placeholderMap[key] !== undefined ? placeholderMap[key] : "");
    }
  }

  doc.saveAndClose();
  var pdfFile = DriveApp.getFileById(copyDocId).getAs("application/pdf");

  // Save PDF inside the target folder
  var folder = DriveApp.getFolderById(targetFolderId);
  var createdFile = folder.createFile(pdfFile);

  // Get the download URL for the PDF file
  var pdfUrl = createdFile.getUrl();
  Logger.log("Download your PDF here: " + pdfUrl);

  // Write the URL to cell I4 in the PDF sheet
  sheet.getRange("I4").setValue(pdfUrl);

  // Optionally, delete the filled copy to keep Drive clean
  // copyFile.setTrashed(true); // Uncomment this line in production to auto-delete the filled copy

  Logger.log("Single Indent PDF saved successfully!");
}


function generateSingleIndentPDF2() {
  const sheetName = "PDF";
  const templateDocId = "1Ne7JoH0Dl1GEkyaLezBTI_TLXvG5z3bnZYwrBexi5cw"; // Your Google Docs template ID
  const targetFolderId = "1IUlGqtBZ6AsC3O_Xm5WqVbbOwi4Sa-sF"; // Your folder ID

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var indentNo = sheet.getRange("G4").getValue();
  var headers = sheet.getRange("A7:49").getValues()[0];
  // Get all data rows starting from A8
  var allData = sheet.getRange(8, 1, sheet.getLastRow() - 7, headers.length).getValues();

  // Prepare objects for each type
  var data = null, dataS = null, dataB = null, dataR = null, dataC = null;

  // Classify each row
  for (var i = 0; i < allData.length; i++) {
    var row = allData[i];
    var product = (row[headers.indexOf('Product')] || '').toString().toUpperCase();
    if (!data && (product.includes('UPS') || product.includes('INVERTER') || product.includes('SERVO'))) {
      data = row;
    } else if (!dataS && (product.includes('UPS') || product.includes('INVERTER') || product.includes('SERVO'))) {
      dataS = row;
    } else if (!dataB && product.includes('BATTERY')) {
      dataB = row;
    } else if (!dataR && product.includes('RACK')) {
      dataR = row;
    } else if (!dataC && product.includes('CABLE')) {
      dataC = row;
    }
  }

  // Now you can use data, dataS, dataB, dataR, dataC for your placeholderMap logic
  // Example: use data for main, dataS for secondary, etc.

  // Make a copy of the template doc
  var templateFile = DriveApp.getFileById(templateDocId);
  var copyFile = templateFile.makeCopy("Indent-" + indentNo);
  var copyDocId = copyFile.getId();
  var doc = DocumentApp.openById(copyDocId);
  var body = doc.getBody();

  // Replace placeholders with actual values
  for (var i = 0; i < headers.length; i++) {
    var placeholder = `{{${headers[i]}}}`;
    var value = data[i] ? data[i] : "";
    body.replaceText(placeholder, value);
  }
  body.replaceText("{{INDENT_NO}}", indentNo);

  function getFeatures(featuresStr, feature) {
    if (!featuresStr) return "X";
    var features = featuresStr.toString().toUpperCase().split(/,|\s+/);
    return features.includes(feature) ? "Y" : "X";
  }

  // Helper to get value or blank
  function safeVal(arr, idx) {
    return (arr && arr[idx] !== undefined && arr[idx] !== null && arr[idx] !== "") ? arr[idx] : "";
  }
 var featureStr = data[13]; 
  // Map table fields for each product type row (data, dataB, dataR, dataC)
  var placeholderMap = {
    "{{INDENT}}": data[1],
    "{{DATE}}": Utilities.formatDate(new Date(data[0]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "{{PLANT}}": data[35],
    "{{GROUP}}": data[2],
    "{{BRANCH}}": data[3],
    "{{OWNER}}": data[4],
    "{{REVBY}}": data[31],
    "{{REVDATE}}": Utilities.formatDate(new Date(data[32]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "{{OANUM}}": data[34],
    "{{APVBY}}": data[42],
    "{{APVDATE}}": Utilities.formatDate(new Date(data[44]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "{{PRODUCT}}": data[7],
    "{{RAT}}": data[8],
    "{{A}}": data[14],
    "{{VOLT}}": data[12],
    "{{PF}}": data[11],
    "{{QTY}}": data[10],
    "{{PHASE}}": data[9],
    "{{v1}}": getFeatures(featureStr, "HSB"),        
    "{{v2}}": getFeatures(featureStr, "PRS"), 
    "{{v3}}": getFeatures(featureStr, "LCD"), 
    "{{v4}}": getFeatures(featureStr, "SW"), 
    "{{v5}}": getFeatures(featureStr, "SBS"), 
    "{{v6}}": getFeatures(featureStr, "SNMP"), 
    "{{v7}}": getFeatures(featureStr, "MB"), 
    "{{v8}}": getFeatures(featureStr, "CBB"), 
    "{{v9}}": data[47],        // Z8
    "{{WARR}}": data[17],
    "{{v10}}": data[47],    // AB8
    "{{TYPE}}": dataB !== null && dataB[16],
    "{{MAKE}}": dataB !== null && dataB[15],
    "{{CAP}}": dataB !== null && dataB[8],
    "{{BQTY}}": dataB !== null && dataB[10],
    "{{BWARR}}": dataB !== null && dataB[17],
    "{{v11}}": dataR !== null && dataR[7] ? "Y" : "X",
    "{{v12}}": data[47],    // AJ8
    "{{DRDATE}}": data[47],     // AK8
    "{{CPERSON}}": data[19],
    "{{CNUM}}": data[47],       // AM8
    "{{SHADDRESS}}": data[21],
    "{{GSTIN}}": data[20],
    "{{PO}}": data[18],
    "{{DECINV}}": data[23],
    "{{BILLADDRESS}}": data[22],
    "{{OV}}": data[47],         // AS8
    "{{OTAX}}": data[47],       // AT8
    "{{TQTY}}": data[47],       // AW8
    "{{TTAX}}": data[47],        // AX8
    "{{TP}}": data[47],         // AY8
    "{{TOV}}": data[47],        // AZ8
    "{{TOTP}}": data[47],       // BA8
    "{{CON}}": data[47],        // BB8
    "{{REMARKS}}": data[47],    // BC8
    "{{DATETIME}}": Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"),
    // Table row 1: data (UPS/INVERTER/SERVO)
    "{{a1}}": safeVal(data, 25),   // Z
    "{{b1}}": safeVal(data, 26),   // AA
    "{{c1}}": safeVal(data, 7),    // H
    // d1: skip for now
    "{{e1}}": safeVal(data, 10),   // K
    // f1: skip for now
    "{{g1}}": safeVal(data, 28),   // AC
    // Table row 2: dataB (BATTERY)
    "{{a2}}": safeVal(dataB, 25),
    "{{b2}}": safeVal(dataB, 26),
    "{{c2}}": safeVal(dataB, 7),
    // d2: skip for now
    "{{e2}}": safeVal(dataB, 10),
    // f2: skip for now
    "{{g2}}": safeVal(dataB, 28),
    // Table row 3: dataR (RACK)
    "{{a3}}": safeVal(dataR, 25),
    "{{b3}}": safeVal(dataR, 26),
    "{{c3}}": safeVal(dataR, 7),
    // d3: skip for now
    "{{e3}}": safeVal(dataR, 10),
    // f3: skip for now
    "{{g3}}": safeVal(dataR, 28),
    // Table row 4: dataC (CABLE)
    "{{a4}}": safeVal(dataC, 25),
    "{{b4}}": safeVal(dataC, 26),
    "{{c4}}": safeVal(dataC, 7),
    // d4: skip for now
    "{{e4}}": safeVal(dataC, 10),
    // f4: skip for now
    "{{g4}}": safeVal(dataC, 28),
  };

  // Replace all placeholders in the template (body)
  for (var key in placeholderMap) {
    body.replaceText(key, placeholderMap[key] !== undefined ? placeholderMap[key] : "");
  }

  // Replace placeholders in the footer (if present)
  var footer = doc.getFooter();
  if (footer) {
    for (var key in placeholderMap) {
      footer.replaceText(key, placeholderMap[key] !== undefined ? placeholderMap[key] : "");
    }
  }

  doc.saveAndClose();
  var pdfFile = DriveApp.getFileById(copyDocId).getAs("application/pdf");

  // Save PDF inside the target folder
  var folder = DriveApp.getFolderById(targetFolderId);
  var createdFile = folder.createFile(pdfFile);

  // Get the download URL for the PDF file
  var pdfUrl = createdFile.getUrl();
  Logger.log("Download your PDF here: " + pdfUrl);

  // Write the URL to cell I4 in the PDF sheet
  sheet.getRange("I4").setValue(pdfUrl);

  // Optionally, delete the filled copy to keep Drive clean
  // copyFile.setTrashed(true); // Uncomment this line in production to auto-delete the filled copy

  Logger.log("Single Indent PDF saved successfully!");
}