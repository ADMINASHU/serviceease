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
  var data = null,
    dataS = null,
    dataB = null,
    dataR = null,
    dataC = null;

  // Classify each row
  for (var i = 0; i < allData.length; i++) {
    var row = allData[i];
    var product = (row[headers.indexOf("Product")] || "").toString().toUpperCase();
    if (
      !data &&
      (product.includes("UPS") || product.includes("INVERTER") || product.includes("SERVO"))
    ) {
      data = row;
    } else if (
      !dataS &&
      (product.includes("UPS") || product.includes("INVERTER") || product.includes("SERVO"))
    ) {
      dataS = row;
    } else if (!dataB && product.includes("BATTERY")) {
      dataB = row;
    } else if (!dataR && product.includes("RACK")) {
      dataR = row;
    } else if (!dataC && product.includes("CABLE")) {
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
    var features = featuresStr.toString().split(/,|\s+/);
    return features.includes(feature) ? "Y" : "X";
  }
  function getFeatures2(featuresStr2, feature) {
    if (!featuresStr2) return "X";
    var features = featuresStr2.toString().split(/,|\s+/);
    return features.includes(feature) ? "Y" : "X";
  }
  function safeVal2(arr, idx) {
    return (arr && arr[idx] !== undefined && arr[idx] !== null && arr[idx] !== "") ? arr[idx] : "";
  }
  function safeVal(arr, idx) {
    if (arr && arr[idx] !== undefined && arr[idx] !== null && arr[idx] !== "") {
      let val = arr[idx];
      if (typeof val === "string") val = val.trim();
      // If value is a number and not NaN, format as INR
      if (
        !isNaN(val) &&
        val !== "" &&
        val !== null &&
        val !== undefined &&
        val !== true &&
        val !== false
      ) {
        if (val !== "" && !isNaN(Number(val))) {
          return Number(val).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
      }
      return val;
    }
    return "";
  }
  function rateVal(TP, TX, QT) {
    const val = TP - TX;
    if (!QT || isNaN(val) || QT == 0) return "";
    return Utilities.formatString(
      "%s",
      Number(val / QT).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  var tbbValue = safeVal2(data, 24) + safeVal2(dataB, 24) + safeVal2(dataR, 24) + safeVal2(dataC, 24);
  var tbvValue = safeVal2(data, 25) + safeVal2(dataB, 25) + safeVal2(dataR, 25) + safeVal2(dataC, 25);
  var ttxValue = safeVal2(data, 26) + safeVal2(dataB, 26) + safeVal2(dataR, 26) + safeVal2(dataC, 26);
  var totpValue = safeVal2(data, 28) + safeVal2(dataB, 28) + safeVal2(dataR, 28) + safeVal2(dataC, 28);
  var tbrValue = safeVal2(data, 29) + safeVal2(dataB, 29) + safeVal2(dataR, 29) + safeVal2(dataC, 29);
  var tovValue = safeVal2(data, 27) + safeVal2(dataB, 27) + safeVal2(dataR, 27) + safeVal2(dataC, 27);
  var conValue = safeVal2(data, 30) + safeVal2(dataB, 30) + safeVal2(dataR, 30) + safeVal2(dataC, 30);

    var featureStr = data[13];
    var featureStr2 = dataB[13];
  // Map table fields for each product type row (data, dataB, dataR, dataC)
  var placeholderMap = {
    "{{INDENT}}": data[1],
    "{{DATE}}": Utilities.formatDate(new Date(data[0]), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "{{PLANT}}": data[35],
    "{{GROUP}}": data[2],
    "{{BRANCH}}": data[3],
    "{{OWNER}}": data[4],
    "{{APVPCO}}": data[31],
    "{{REVDATE}}": Utilities.formatDate(
      new Date(data[32]),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    ),
    "{{OANUM}}": data[34],
    "{{APVBY}}": data[42],
    "{{APVDATE}}": Utilities.formatDate(
      new Date(data[44]),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    ),
    "{{PRODUCT}}": data[7],
    "{{RAT}}": data[8],
    "{{A}}": data[14] + " A",
    "{{VOLT}}": data[12] + " V",
    "{{PF}}": data[11],
    "{{QTY}}": data[10] + " Nos",
    "{{PHASE}}": data[9],
    "{{MODEL}}": data[47], //-------------------------------------------------------------------------------------------------
    "{{DRBDATE}}": data[47], //-------------------------------------------------------------------------------------------------
    "{{DPDATE}}": data[47], //-------------------------------------------------------------------------------------------------

    "{{v1}}": getFeatures(featureStr, "HSB"),
    "{{v2}}": getFeatures(featureStr, "PRS"),
    "{{v3}}": getFeatures(featureStr, "LCD"),
    "{{v4}}": getFeatures(featureStr, "RS232"),
    "{{v5}}": getFeatures(featureStr, "BISBS"),
    "{{v6}}": getFeatures(featureStr, "SNMP"),
    "{{v7}}": getFeatures(featureStr, "MB"),
    "{{v8}}": getFeatures(featureStr, "CBB"),

    "{{v14}}": getFeatures(featureStr, "PBB"),
    "{{v15}}": getFeatures(featureStr, "CTBB"),
    "{{v16}}": getFeatures(featureStr, "ESBS"),
  
    "{{v9}}":  getFeatures(featureStr, "ETR"),
    "{{WARR}}": data[17] + " Yr",
    "{{v10}}":  getFeatures(featureStr, "SENC"),
    "{{TYPE}}": dataB !== null && dataB[16],
    "{{MAKE}}": dataB !== null && dataB[15],
    "{{CAP}}": dataB !== null && dataB[8],
    "{{BQTY}}": dataB !== null && dataB[10] + " Nos",
    "{{BWARR}}": dataB !== null && dataB[17] + " Yr",
    "{{v11}}":  getFeatures2(featureStr2, "Battery-Stand"),
    "{{v12}}":  getFeatures2(featureStr2, "Battery-Box"),
    "{{v13}}":  data[39] === "APPROVED" ? "Y" :"X",
    "{{v17}}":  getFeatures2(featureStr2, "Inter-Lnk-Cable"),

    "{{DRDATE}}": data[47], // AK8
    "{{CPERSON}}": data[19],
    "{{CNUM}}": data[47], // AM8
    "{{SHADDRESS}}": data[21],
    "{{GSTIN}}": data[20],
    "{{PO}}": data[18],
    "{{DECINV}}": data[23],
    "{{BILLADDRESS}}": data[22],
    "{{OV}}": data[47], // AS8
    "{{OTAX}}": data[47], // AT8

    "{{BBR}}": "₹" + parseFloat(tbrValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TBB}}": "₹" + parseFloat(tbbValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TBV}}": "₹" + parseFloat(tbvValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TTX}}": "₹" + parseFloat(ttxValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TOV}}": "₹" + parseFloat(tovValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{TOTP}}": "₹" + parseFloat(totpValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{CON}}":  "₹" + parseFloat(conValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "{{REMARKS}}": data[47], // BC8
    "{{DATETIME}}": Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy HH:mm"
    ),
    // Table row 1: data (UPS/INVERTER/SERVO)
    "{{a1}}": safeVal(data, 25), // Z
    "{{b1}}": safeVal(data, 24), // AA
    "{{c1}}": safeVal(data, 7), // H
    "{{d1}}": rateVal(safeVal2(data, 28), safeVal2(data, 26), safeVal2(data, 10)),
    "{{e1}}": safeVal2(data, 10), // K
    "{{f1}}": safeVal(data, 26),
    "{{g1}}": safeVal(data, 28), // AC

    // Table row 2: dataB (BATTERY)
    "{{a2}}": safeVal(dataB, 25),
    "{{b2}}": safeVal(dataB, 24),
    "{{c2}}": safeVal(dataB, 7),
    "{{d2}}": rateVal(safeVal2(dataB, 28), safeVal2(dataB, 26), safeVal2(dataB, 10)),
    "{{e2}}": safeVal2(dataB, 10),
    "{{f2}}": safeVal(dataB, 26),
    "{{g2}}": safeVal(dataB, 28),

    // Table row 3: dataR (RACK)
    "{{a3}}": safeVal(dataR, 25),
    "{{b3}}": safeVal(dataR, 24),
    "{{c3}}": safeVal(dataR, 7),
    "{{d3}}": rateVal(safeVal2(dataR, 28), safeVal2(dataR, 26), safeVal2(dataR, 10)),
    "{{e3}}": safeVal2(dataR, 10),
    "{{f3}}": safeVal(dataR, 26),
    "{{g3}}": safeVal(dataR, 28),

    // Table row 4: dataC (CABLE)
    "{{a4}}": safeVal(dataC, 25),
    "{{b4}}": safeVal(dataC, 24),
    "{{c4}}": safeVal(dataC, 7),
    "{{d4}}": rateVal(safeVal2(dataC, 28), safeVal2(dataC, 26), safeVal2(dataC, 10)),
    "{{e4}}": safeVal2(dataC, 10),
    "{{f4}}": safeVal(dataC, 26),
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
